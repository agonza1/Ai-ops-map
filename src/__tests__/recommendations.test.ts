import { describe, expect, it } from "vitest";
import {
  buildBriefingUrl,
  buildResult,
  environmentChoices,
  progressCount,
  systemsChoices,
  workflowChoices,
} from "../recommendations";

describe("recommendation rules", () => {
  it("builds a sales conversation workflow with portable cloud deployment guidance", () => {
    const result = buildResult({ workflow: "revops", systems: "ready", environment: "cloud", email: "lead@example.com" });

    expect(result.title).toBe("Sales conversation automation pod");
    expect(result.value).toContain("first-touch speed");
    expect(result.pilot).toContain("portable");
    expect(result.stack).toContain("Salesforce Agentforce or CRM integration layer");
  });

  it("adds compliance controls for regulated communication workflows", () => {
    const result = buildResult({ workflow: "compliance", systems: "patchwork", environment: "hybrid", email: "" });

    expect(result.title).toBe("High-control communications workflow pod");
    expect(result.controls).toEqual(
      expect.arrayContaining(["evidence retention", "named approver routing", "operator-visible fallback paths"]),
    );
    expect(result.controls).toContain("clear boundary between managed and private services");
  });

  it("tracks diagnostic progress without treating email as a scoring answer", () => {
    expect(progressCount({ workflow: "support", email: "person@example.com" })).toBe(1);
    expect(progressCount({ workflow: "support", systems: "partly", environment: "private", email: "" })).toBe(3);
  });

  it("links briefing CTAs to the WebRTC.ventures contact page with selected context", () => {
    const result = buildResult({ workflow: "ops", systems: "partly", environment: "private", email: "ops@example.com" });
    const url = new URL(buildBriefingUrl({ workflow: "ops", systems: "partly", environment: "private", email: "ops@example.com" }, result));

    expect(url.origin + url.pathname).toBe("https://webrtc.ventures/contact/");
    expect(url.searchParams.get("source")).toBe("ai-ops-map");
    expect(url.searchParams.get("workflow")).toBe("ops");
    expect(url.searchParams.get("email")).toBe("ops@example.com");
  });
});

describe("accessibility-oriented content checks", () => {
  it("keeps each diagnostic choice readable as an accessible button label", () => {
    const allChoices = [...workflowChoices, ...systemsChoices, ...environmentChoices];

    expect(allChoices).toHaveLength(10);
    for (const choice of allChoices) {
      expect(choice.label.trim().length).toBeGreaterThan(3);
      expect(choice.detail.trim().length).toBeGreaterThan(24);
      expect(choice.label).not.toBe(choice.detail);
    }
  });
});
