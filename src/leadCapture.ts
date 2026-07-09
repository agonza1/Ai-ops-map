import type { Answers, OpportunityResult } from "./recommendations";

export type LeadField = "name" | "email" | "company" | "consent";

export type LeadValidationErrors = Partial<Record<LeadField, string>>;

export type Attribution = {
  landingPage: string;
  referrer: string;
  utm: Record<string, string>;
};

export type LeadCaptureConfig = {
  endpoint: string;
  analyticsEndpoint: string;
  hubspotPortalId: string;
  hubspotFormId: string;
  hubspotSubscriptionTypeId: string;
  schedulerUrl: string;
};

export type LeadPayload = {
  submissionId: string;
  source: "ai-ops-map";
  submittedAt: string;
  lead: {
    name: string;
    email: string;
    company: string;
  };
  consent: {
    marketingFollowUp: boolean;
    text: string;
  };
  diagnostic: {
    workflow: string;
    impact: string;
    systems: string;
    feasibility: string;
    risk: string;
    environment: string;
  };
  recommendation: {
    title: string;
    recommendedWorkflow: string;
    whyFits: string;
    impactLevel: string;
    feasibilityLevel: string;
    controlRiskLevel: string;
    integrations: string[];
    approvalPoints: string[];
    pilotBoundary: string;
    successMetric: string;
  };
  automationFields: Record<string, string>;
  attribution: Attribution;
};

export type FunnelEventName =
  | "assessment_started"
  | "assessment_step_completed"
  | "partial_result_viewed"
  | "assessment_completed"
  | "lead_submitted"
  | "scheduler_opened"
  | "meeting_booked";

const consentText = "I agree that WebRTC.ventures may contact me about this AI ops assessment and related services.";

const personalEmailDomains = new Set([
  "aol.com",
  "comcast.net",
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "icloud.com",
  "live.com",
  "mac.com",
  "me.com",
  "msn.com",
  "outlook.com",
  "proton.me",
  "protonmail.com",
  "yahoo.com",
]);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: "event", name: string, parameters?: Record<string, unknown>) => void;
    plausible?: (name: string, options?: { props?: Record<string, unknown> }) => void;
  }
}

function envValue(key: keyof ImportMetaEnv) {
  return import.meta.env[key]?.trim() ?? "";
}

function generateSubmissionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `aiops-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getLeadCaptureConfig(): LeadCaptureConfig {
  return {
    endpoint: envValue("VITE_LEAD_CAPTURE_ENDPOINT"),
    analyticsEndpoint: envValue("VITE_ANALYTICS_ENDPOINT"),
    hubspotPortalId: envValue("VITE_HUBSPOT_PORTAL_ID"),
    hubspotFormId: envValue("VITE_HUBSPOT_FORM_ID"),
    hubspotSubscriptionTypeId: envValue("VITE_HUBSPOT_SUBSCRIPTION_TYPE_ID"),
    schedulerUrl: envValue("VITE_SCHEDULER_URL"),
  };
}

export function getAttribution(locationSearch?: string, referrer?: string, landingPage?: string): Attribution {
  const browserLocation = typeof window !== "undefined" ? window.location : undefined;
  const browserDocument = typeof document !== "undefined" ? document : undefined;
  const params = new URLSearchParams(locationSearch ?? browserLocation?.search ?? "");
  const utm: Record<string, string> = {};

  for (const [key, value] of params.entries()) {
    if (key.startsWith("utm_") || key === "gclid" || key === "fbclid" || key === "msclkid") {
      utm[key] = value;
    }
  }

  return {
    landingPage: landingPage ?? browserLocation?.href ?? "",
    referrer: referrer ?? browserDocument?.referrer ?? "",
    utm,
  };
}

export function validateLeadFields(answers: Answers): LeadValidationErrors {
  const errors: LeadValidationErrors = {};
  const email = answers.email.trim().toLowerCase();
  const company = answers.company.trim();
  const name = answers.name.trim();
  const domain = email.split("@")[1] ?? "";

  if (name.length < 2) {
    errors.name = "Enter your name.";
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "Enter a valid work email.";
  } else if (personalEmailDomains.has(domain)) {
    errors.email = "Use your work email, not a personal inbox.";
  }

  if (company.length < 2) {
    errors.company = "Enter your company.";
  }

  if (!answers.consent) {
    errors.consent = "Consent is required before we can follow up.";
  }

  return errors;
}

export function hasLeadValidationErrors(errors: LeadValidationErrors) {
  return Object.keys(errors).length > 0;
}

export function buildLeadPayload(answers: Answers, result: OpportunityResult, attribution: Attribution): LeadPayload {
  const submissionId = generateSubmissionId();

  return {
    submissionId,
    source: "ai-ops-map",
    submittedAt: new Date().toISOString(),
    lead: {
      name: answers.name.trim(),
      email: answers.email.trim().toLowerCase(),
      company: answers.company.trim(),
    },
    consent: {
      marketingFollowUp: answers.consent,
      text: consentText,
    },
    diagnostic: {
      workflow: answers.workflow ?? "",
      impact: answers.impact ?? "",
      systems: answers.systems ?? "",
      feasibility: answers.feasibility ?? "",
      risk: answers.risk ?? "",
      environment: answers.environment ?? "",
    },
    recommendation: {
      title: result.title,
      recommendedWorkflow: result.recommendedWorkflow,
      whyFits: result.whyFits,
      impactLevel: result.impactLevel,
      feasibilityLevel: result.feasibilityLevel,
      controlRiskLevel: result.controlRiskLevel,
      integrations: result.integrations,
      approvalPoints: result.approvalPoints,
      pilotBoundary: result.pilotBoundary,
      successMetric: result.successMetric,
    },
    automationFields: {
      ai_ops_source: "ai-ops-map",
      ai_ops_submission_id: submissionId,
      ai_ops_workflow: answers.workflow ?? "",
      ai_ops_impact: answers.impact ?? "",
      ai_ops_systems: answers.systems ?? "",
      ai_ops_feasibility: answers.feasibility ?? "",
      ai_ops_risk: answers.risk ?? "",
      ai_ops_environment: answers.environment ?? "",
      ai_ops_recommendation_title: result.title,
      ai_ops_recommended_workflow: result.recommendedWorkflow,
      ai_ops_impact_level: result.impactLevel,
      ai_ops_feasibility_level: result.feasibilityLevel,
      ai_ops_control_risk_level: result.controlRiskLevel,
      ai_ops_success_metric: result.successMetric,
    },
    attribution,
  };
}

function hubspotFields(payload: LeadPayload) {
  const fields = [
    { name: "email", value: payload.lead.email },
    { name: "firstname", value: payload.lead.name },
    { name: "company", value: payload.lead.company },
    { name: "ai_ops_payload", value: JSON.stringify(payload) },
    ...Object.entries(payload.automationFields).map(([name, value]) => ({ name, value })),
    ...Object.entries(payload.attribution.utm).map(([name, value]) => ({ name, value })),
    { name: "referrer", value: payload.attribution.referrer },
    { name: "landing_page", value: payload.attribution.landingPage },
  ];

  return fields.filter((field) => field.value !== "");
}

export async function submitLeadCapture(payload: LeadPayload, config: LeadCaptureConfig) {
  if (config.endpoint) {
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Lead capture endpoint rejected the submission.");
    }

    return { mode: "endpoint", submissionId: payload.submissionId } as const;
  }

  if (config.hubspotPortalId && config.hubspotFormId) {
    const response = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${config.hubspotPortalId}/${config.hubspotFormId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: hubspotFields(payload),
        context: {
          pageUri: payload.attribution.landingPage,
          pageName: "AI Ops Map",
        },
        legalConsentOptions: {
          consent: {
            consentToProcess: true,
            text: consentText,
            communications: config.hubspotSubscriptionTypeId
              ? [
                  {
                    value: payload.consent.marketingFollowUp,
                    subscriptionTypeId: Number(config.hubspotSubscriptionTypeId),
                    text: consentText,
                  },
                ]
              : [],
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error("HubSpot rejected the lead submission.");
    }

    return { mode: "hubspot", submissionId: payload.submissionId } as const;
  }

  throw new Error("Lead capture is not configured. Add VITE_LEAD_CAPTURE_ENDPOINT or HubSpot form settings.");
}

export function schedulerUrl(baseUrl: string, payload: LeadPayload | null, attribution: Attribution) {
  if (!baseUrl) return "";

  const url = new URL(baseUrl);
  url.searchParams.set("source", "ai-ops-map");
  url.searchParams.set("referrer", attribution.referrer);

  if (payload) {
    url.searchParams.set("submission_id", payload.submissionId);
    url.searchParams.set("email", payload.lead.email);
    url.searchParams.set("company", payload.lead.company);
    url.searchParams.set("workflow", payload.diagnostic.workflow);
    url.searchParams.set("recommendation", payload.recommendation.title);
  }

  for (const [key, value] of Object.entries(attribution.utm)) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

export function trackFunnelEvent(name: FunnelEventName, properties: Record<string, unknown> = {}, analyticsEndpoint = "") {
  const event = {
    event: name,
    source: "ai-ops-map",
    occurredAt: new Date().toISOString(),
    ...properties,
  };

  window.dataLayer?.push(event);
  window.gtag?.("event", name, event);
  window.plausible?.(name, { props: event });

  if (analyticsEndpoint) {
    const body = JSON.stringify(event);
    const fallbackToBeacon = () => {
      navigator.sendBeacon?.(analyticsEndpoint, new Blob([body], { type: "text/plain;charset=UTF-8" }));
    };

    try {
      if (typeof fetch === "function") {
        void fetch(analyticsEndpoint, {
          method: "POST",
          body: new Blob([body], { type: "text/plain;charset=UTF-8" }),
          keepalive: true,
        }).catch(fallbackToBeacon);
      } else {
        fallbackToBeacon();
      }
    } catch {
      // Analytics should never interrupt the assessment flow.
    }
  }
}

export function isMeetingBookedMessage(message: MessageEvent) {
  const data = typeof message.data === "string" ? message.data : JSON.stringify(message.data ?? {});
  return /event_scheduled|meeting_booked|booked|MEETING_BOOKED/i.test(data);
}

export { consentText };
