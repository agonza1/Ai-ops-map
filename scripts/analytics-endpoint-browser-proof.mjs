import http from "node:http";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "@playwright/test";

const analyticsPort = Number(process.env.ANALYTICS_PORT ?? 5188);
const appPort = Number(process.env.APP_PORT ?? 5173);
const endpoint = `http://127.0.0.1:${analyticsPort}/analytics`;
const bodies = [];

function startAnalyticsServer() {
  const server = http.createServer((request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "content-type");

    if (request.method === "OPTIONS") {
      response.writeHead(204).end();
      return;
    }

    if (request.method !== "POST" || request.url !== "/analytics") {
      response.writeHead(404).end();
      return;
    }

    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      bodies.push({
        contentType: request.headers["content-type"] ?? "",
        body,
      });
      response.writeHead(204).end();
    });
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(analyticsPort, "127.0.0.1", () => {
      server.off("error", reject);
      resolve(server);
    });
  });
}

async function waitForApp(url, process) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (process.exitCode !== null) {
      throw new Error(`Vite exited early with code ${process.exitCode}`);
    }

    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Keep probing until Vite is ready.
    }

    await delay(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function waitForPostBody() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const match = bodies.find((entry) => entry.body.includes('"event":"assessment_started"'));
    if (match) return match;
    await delay(100);
  }
  throw new Error(`Timed out waiting for analytics POST body; received ${bodies.length} POST(s).`);
}

const analyticsServer = await startAnalyticsServer();
const app = spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", String(appPort), "--strictPort"], {
  env: {
    ...process.env,
    VITE_ANALYTICS_ENDPOINT: endpoint,
  },
  stdio: ["ignore", "pipe", "pipe"],
});

app.stdout.on("data", (chunk) => process.stdout.write(chunk));
app.stderr.on("data", (chunk) => process.stderr.write(chunk));

let browser;
try {
  const appUrl = `http://127.0.0.1:${appPort}/Ai-ops-map/`;
  await waitForApp(appUrl, app);

  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE });
  const page = await browser.newPage();
  await page.goto(appUrl);
  await page.getByRole("button", { name: /sales conversations/i }).click();

  const post = await waitForPostBody();
  const parsed = JSON.parse(post.body);
  if (parsed.event !== "assessment_started") {
    throw new Error(`Unexpected analytics event ${parsed.event}`);
  }
  if (!String(post.contentType).startsWith("text/plain")) {
    throw new Error(`Expected text/plain analytics body, received ${post.contentType}`);
  }

  console.log(JSON.stringify({ ok: true, endpoint, posts: bodies.length, firstContentType: post.contentType, firstEvent: parsed.event }, null, 2));
} finally {
  await browser?.close().catch(() => {});
  app.kill("SIGTERM");
  analyticsServer.close();
}
