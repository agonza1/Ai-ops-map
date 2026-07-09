import { describe, expect, it, vi } from "vitest";
import { buildResult, type Answers } from "../recommendations";
import {
  buildLeadPayload,
  getAttribution,
  isMeetingBookedMessage,
  schedulerUrl,
  trackFunnelEvent,
  validateLeadFields,
} from "../leadCapture";

const completeAnswers: Answers = {
  workflow: "revops",
  impact: "urgent",
  systems: "ready",
  feasibility: "ready",
  risk: "managed",
  environment: "cloud",
  name: "Jordan Lee",
  email: "jordan@buyerco.com",
  company: "BuyerCo",
  consent: true,
};

describe("lead capture validation and payloads", () => {
  it("requires a work email, company, name, and consent", () => {
    expect(
      validateLeadFields({
        ...completeAnswers,
        name: "",
        email: "person@gmail.com",
        company: "",
        consent: false,
      }),
    ).toMatchObject({
      name: "Enter your name.",
      email: "Use your work email, not a personal inbox.",
      company: "Enter your company.",
      consent: "Consent is required before we can follow up.",
    });
  });

  it("builds structured lead payload fields for follow-up automation", () => {
    const result = buildResult(completeAnswers);
    const attribution = getAttribution("?utm_source=linkedin&utm_campaign=pilot&debug=1", "https://referrer.example", "https://site.example/map");
    const payload = buildLeadPayload(completeAnswers, result, attribution);

    expect(payload.source).toBe("ai-ops-map");
    expect(payload.lead).toEqual({ name: "Jordan Lee", email: "jordan@buyerco.com", company: "BuyerCo" });
    expect(payload.consent.marketingFollowUp).toBe(true);
    expect(payload.diagnostic.workflow).toBe("revops");
    expect(payload.recommendation.title).toBe("Sales conversation follow-up blueprint");
    expect(payload.automationFields.ai_ops_submission_id).toBe(payload.submissionId);
    expect(payload.automationFields.ai_ops_impact_level).toBe("High");
    expect(payload.attribution.utm).toEqual({ utm_source: "linkedin", utm_campaign: "pilot" });
    expect(payload.attribution.referrer).toBe("https://referrer.example");
  });

  it("passes attribution and assessment context into scheduler URLs", () => {
    const result = buildResult(completeAnswers);
    const attribution = getAttribution("?utm_medium=cpc", "https://referrer.example", "https://site.example/map");
    const payload = buildLeadPayload(completeAnswers, result, attribution);
    const url = new URL(schedulerUrl("https://meetings.example.com/ai-ops", payload, attribution));

    expect(url.searchParams.get("source")).toBe("ai-ops-map");
    expect(url.searchParams.get("submission_id")).toBe(payload.submissionId);
    expect(url.searchParams.get("email")).toBe("jordan@buyerco.com");
    expect(url.searchParams.get("workflow")).toBe("revops");
    expect(url.searchParams.get("utm_medium")).toBe("cpc");
  });
});

describe("funnel analytics helpers", () => {
  it("pushes supported funnel events to common client analytics surfaces", () => {
    const dataLayer: unknown[] = [];
    const gtag = vi.fn();
    const plausible = vi.fn();
    vi.stubGlobal("window", { dataLayer, gtag, plausible });
    vi.stubGlobal("navigator", {});

    trackFunnelEvent("lead_submitted", { submissionId: "abc123" });

    expect(dataLayer).toEqual([expect.objectContaining({ event: "lead_submitted", submissionId: "abc123" })]);
    expect(gtag).toHaveBeenCalledWith("event", "lead_submitted", expect.objectContaining({ submissionId: "abc123" }));
    expect(plausible).toHaveBeenCalledWith("lead_submitted", { props: expect.objectContaining({ submissionId: "abc123" }) });

    vi.unstubAllGlobals();
  });

  it("posts configured endpoint analytics as a CORS-safe text payload", async () => {
    const fetchMock = vi.fn<(input: string, init: RequestInit) => Promise<Response>>(() => Promise.resolve(new Response(null, { status: 204 })));
    vi.stubGlobal("window", {});
    vi.stubGlobal("navigator", { sendBeacon: vi.fn() });
    vi.stubGlobal("fetch", fetchMock);

    trackFunnelEvent("assessment_started", { step: "workflow" }, "http://127.0.0.1:5188/analytics");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:5188/analytics",
      expect.objectContaining({ method: "POST", keepalive: true }),
    );
    const init = fetchMock.mock.calls[0][1];
    expect(init.headers).toBeUndefined();
    expect(init.body).toBeInstanceOf(Blob);
    expect((init.body as Blob).type).toBe("text/plain;charset=utf-8");
    await expect((init.body as Blob).text()).resolves.toContain('"event":"assessment_started"');

    vi.unstubAllGlobals();
  });

  it("recognizes scheduler booking postMessage events", () => {
    expect(isMeetingBookedMessage({ data: { event: "calendly.event_scheduled" } } as MessageEvent)).toBe(true);
    expect(isMeetingBookedMessage({ data: "MEETING_BOOKED" } as MessageEvent)).toBe(true);
    expect(isMeetingBookedMessage({ data: { event: "profile_opened" } } as MessageEvent)).toBe(false);
  });
});
