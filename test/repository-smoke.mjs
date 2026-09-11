import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const repositoryRoot = new URL("../", import.meta.url);

test("repository preserves its documented static-site contract", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("package.json", repositoryRoot), "utf8"),
  );

  assert.equal(manifest.name, "ai-ops-map");
  assert.equal(manifest.private, true);
  assert.equal(manifest.type, "module");

  for (const entryPoint of ["index.html", "docs/index.html"]) {
    const entryPointStat = await stat(new URL(entryPoint, repositoryRoot));
    assert.equal(entryPointStat.isFile(), true, `${entryPoint} must be a file`);
  }
});
