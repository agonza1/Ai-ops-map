import { describe, expect, it } from "vitest";
import {
  buildBriefingUrl,
  buildResult,
  environmentChoices,
  feasibilityChoices,
  impactChoices,
  progressCount,
  riskChoices,
  systemsChoices,
  workflowChoices,
} from "../recommendations";

describe("recommendation rules", () => {
  it("builds a sales conversation blueprint with impact, feasibility, and control-risk levels", () => {
    const result = buildResult({
      workflow: "revops",
      impact: "urgent",
      systems: "ready",
      feasibility: "ready",
      risk: "managed",
      environment: "cloud",
      email: "lead@example.com",
    });

    expect(result.title).toBe("Sales conversation follow-up blueprint");
    expect(result.recommendedWorkflow).toContain("Lead intake");
    expect(result.impactLevel).toBe("High");
    expect(result.feasibilityLevel).toBe("High");
    expect(result.controlRiskLevel).toBe("Medium");
    expect(result.integrations).toContain("CRM/contact-center APIs");
    expect(result.pilotBoundary).toContain("portable cloud build");
  });

  it("keeps regulated communication workflows in strict approval mode", () => {
    const result = buildResult({
      workflow: "compliance",
      impact: "meaningful",
      systems: "patchwork",
      feasibility: "messy",
      risk: "low",
      environment: "hybrid",
      email: "",
    });

    expect(result.title).toBe("Controlled communications review blueprint");
    expect(result.controlRiskLevel).toBe("High");
    expect(result.feasibilityLevel).toBe("Low");
    expect(result.approvalPoints).toEqual(
      expect.arrayContaining(["Named owner approves recommended external actions", "Audit log captures evidence before completion"]),
    );
    expect(result.customerProvides).toContain("Success metric baseline and approval policy");
  });

  it("tracks diagnostic progress without treating email as a scoring answer", () => {
    expect(progressCount({ workflow: "support", email: "person@example.com" })).toBe(1);
    expect(
      progressCount({
        workflow: "support",
        impact: "contained",
        systems: "partly",
        feasibility: "workable",
        risk: "managed",
        environment: "private",
        email: "",
      }),
    ).toBe(6);
  });

  it("links briefing CTAs to the WebRTC.ventures contact page with selected context", () => {
    const answers = {
      workflow: "ops" as const,
      impact: "meaningful" as const,
      systems: "partly" as const,
      feasibility: "workable" as const,
      risk: "managed" as const,
      environment: "private" as const,
      email: "ops@example.com",
    };
    const result = buildResult(answers);
    const url = new URL(buildBriefingUrl(answers, result));

    expect(url.origin + url.pathname).toBe("https://webrtc.ventures/contact/");
    expect(url.searchParams.get("source")).toBe("ai-ops-map");
    expect(url.searchParams.get("workflow")).toBe("ops");
    expect(url.searchParams.get("impact")).toBe("meaningful");
    expect(url.searchParams.get("feasibility")).toBe("workable");
    expect(url.searchParams.get("risk")).toBe("managed");
    expect(url.searchParams.get("email")).toBe("ops@example.com");
  });
});

describe("accessibility-oriented content checks", () => {
  it("keeps each diagnostic choice readable as an accessible button label", () => {
    const allChoices = [
      ...workflowChoices,
      ...impactChoices,
      ...systemsChoices,
      ...feasibilityChoices,
      ...riskChoices,
      ...environmentChoices,
    ];

    expect(allChoices).toHaveLength(19);
    for (const choice of allChoices) {
      expect(choice.label.trim().length).toBeGreaterThan(3);
      expect(choice.detail.trim().length).toBeGreaterThan(24);
      expect(choice.label).not.toBe(choice.detail);
    }
  });
});
