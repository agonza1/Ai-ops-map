export type WorkflowId = "support" | "revops" | "ops" | "compliance";
export type SystemId = "patchwork" | "partly" | "ready";
export type EnvironmentId = "private" | "hybrid" | "cloud";
export type ImpactId = "contained" | "meaningful" | "urgent";
export type FeasibilityId = "messy" | "workable" | "ready";
export type ControlRiskId = "low" | "managed" | "strict";

export type Answers = {
  workflow?: WorkflowId;
  impact?: ImpactId;
  systems?: SystemId;
  feasibility?: FeasibilityId;
  risk?: ControlRiskId;
  environment?: EnvironmentId;
  email: string;
};

export type Level = "Low" | "Medium" | "High";

export type OpportunityResult = {
  title: string;
  recommendedWorkflow: string;
  whyFits: string;
  impactLevel: Level;
  feasibilityLevel: Level;
  controlRiskLevel: Level;
  systems: string[];
  integrations: string[];
  approvalPoints: string[];
  pilotBoundary: string;
  successMetric: string;
  handles: string[];
  customerProvides: string[];
};

export type Choice<T extends string> = {
  id: T;
  label: string;
  detail: string;
};

export const workflowChoices = [
  { id: "support", label: "Customer support", detail: "Triage, routing, updates, and repetitive service work across channels." },
  { id: "revops", label: "Sales conversations", detail: "Lead follow-up, qualification, handoffs, and CRM-heavy conversation workflows." },
  { id: "ops", label: "Real-time operations", detail: "Forms, fulfillment, document handling, scheduling, and approvals." },
  { id: "compliance", label: "Regulated comms", detail: "Audit-heavy voice, video, telehealth, or compliance workflows that need tight control." },
] as const satisfies readonly Choice<WorkflowId>[];

export const impactChoices = [
  { id: "contained", label: "Contained drag", detail: "A visible queue, but modest volume or limited SLA, cost, urgency, or revenue pressure." },
  { id: "meaningful", label: "Meaningful drag", detail: "Frequent work that burns team time, slows response, or creates measurable customer friction." },
  { id: "urgent", label: "Urgent business pressure", detail: "High volume, missed SLAs, revenue leakage, or executive urgency around the workflow." },
] as const satisfies readonly Choice<ImpactId>[];

export const systemsChoices = [
  { id: "patchwork", label: "Patchwork tools", detail: "The team is living in inboxes, spreadsheets, and half-connected apps." },
  { id: "partly", label: "Partly connected", detail: "There are systems in place, but the handoffs still break or stall." },
  { id: "ready", label: "Ready to scale", detail: "The systems involved have reliable APIs, stable records, and known integration owners." },
] as const satisfies readonly Choice<SystemId>[];

export const feasibilityChoices = [
  { id: "messy", label: "Needs cleanup", detail: "Data readiness, workflow stability, or process ownership still needs discovery before automation." },
  { id: "workable", label: "Workable path", detail: "The workflow is mostly stable, with known owners and enough data quality for a bounded pilot." },
  { id: "ready", label: "Implementation ready", detail: "Inputs, outputs, exceptions, owners, and success criteria are clear enough to build quickly." },
] as const satisfies readonly Choice<FeasibilityId>[];

export const riskChoices = [
  { id: "low", label: "Low-risk assist", detail: "Low sensitivity, reversible actions, and autonomy limited to drafts, summaries, or routing." },
  { id: "managed", label: "Managed approvals", detail: "Some sensitive data or customer impact, with human approval before external actions." },
  { id: "strict", label: "Strict control", detail: "Sensitive, hard-to-reverse, regulated, or high-autonomy actions need named approvals and audit evidence." },
] as const satisfies readonly Choice<ControlRiskId>[];

export const environmentChoices = [
  { id: "private", label: "Private first", detail: "We want deployment on our own servers or controlled infrastructure." },
  { id: "hybrid", label: "Hybrid", detail: "Some managed services are fine, but control boundaries matter." },
  { id: "cloud", label: "Cloud is fine", detail: "Speed matters most as long as the architecture can mature cleanly." },
] as const satisfies readonly Choice<EnvironmentId>[];

const workflowBlueprints: Record<WorkflowId, Pick<OpportunityResult, "title" | "recommendedWorkflow" | "whyFits" | "successMetric">> = {
  support: {
    title: "Support triage and resolution blueprint",
    recommendedWorkflow: "Inbound support triage, context gathering, routing, and customer-update drafting.",
    whyFits: "Support queues usually expose repeatable handoffs, clear owners, and fast feedback on whether automation is reducing wait time or rework.",
    successMetric: "Shorter first-response or resolution time with fewer reopened tickets.",
  },
  revops: {
    title: "Sales conversation follow-up blueprint",
    recommendedWorkflow: "Lead intake, enrichment, qualification notes, CRM updates, and rep handoff preparation.",
    whyFits: "Revenue teams feel the pain quickly when first-touch speed, qualification quality, and CRM hygiene depend on manual cleanup.",
    successMetric: "Faster qualified follow-up and cleaner stage or next-step coverage in the CRM.",
  },
  ops: {
    title: "Operations queue automation blueprint",
    recommendedWorkflow: "Document or form intake, extraction, validation, exception routing, and owner handoff.",
    whyFits: "Operational queues are strong first pilots when every dropped step creates delay, duplicate work, or poor customer visibility.",
    successMetric: "Lower cycle time and fewer manual touches per completed request.",
  },
  compliance: {
    title: "Controlled communications review blueprint",
    recommendedWorkflow: "Draft recommendations, evidence capture, review routing, and approved customer or compliance response preparation.",
    whyFits: "Regulated workflows should prove auditability, approval routing, and evidence quality before expanding autonomy.",
    successMetric: "Higher review throughput with complete evidence and named approval records.",
  },
};

const defaultWorkflow = workflowBlueprints.support;

function impactLevel(impact?: ImpactId): Level {
  if (impact === "urgent") return "High";
  if (impact === "meaningful") return "Medium";
  return "Low";
}

function feasibilityLevel(feasibility?: FeasibilityId, systems?: SystemId): Level {
  if (feasibility === "ready" && systems === "ready") return "High";
  if (feasibility === "messy" || systems === "patchwork") return "Low";
  return "Medium";
}

function controlRiskLevel(risk?: ControlRiskId, workflow?: WorkflowId): Level {
  if (risk === "strict" || workflow === "compliance") return "High";
  if (risk === "managed") return "Medium";
  return "Low";
}

export function buildResult(answers: Answers): OpportunityResult {
  const blueprint = answers.workflow ? workflowBlueprints[answers.workflow] : defaultWorkflow;
  const impact = impactLevel(answers.impact);
  const feasibility = feasibilityLevel(answers.feasibility, answers.systems);
  const risk = controlRiskLevel(answers.risk, answers.workflow);

  const systems = answers.systems === "ready"
    ? ["CRM, ticketing, contact-center, or case-management system of record", "Existing API or event source", "Operator review queue"]
    : answers.systems === "patchwork"
      ? ["Shared inboxes, spreadsheets, and current shadow workflows", "One lightweight intake surface", "Operator review queue"]
      : ["Primary system of record", "Integration layer for broken handoffs", "Operator review queue"];

  const integrations = answers.systems === "ready"
    ? ["LangGraph or Microsoft Agent Framework orchestration", "CRM/contact-center APIs", "Observability and runbook instrumentation"]
    : answers.systems === "patchwork"
      ? ["Hermes or OpenClaw workflow design", "n8n or Zapier bridge", "Human-in-the-loop checkpoints"]
      : ["OpenClaw or LangGraph orchestration", "n8n integration cleanup", "Approval and exception routing"];

  const approvalPoints = risk === "High"
    ? ["Named owner approves recommended external actions", "Reviewer confirms sensitive-data use", "Audit log captures evidence before completion"]
    : risk === "Medium"
      ? ["Human approves customer-facing actions", "Owner reviews exceptions and failed confidence checks"]
      : ["Operator reviews samples during pilot", "Owner approves escalation rules before launch"];

  const pilotBoundary = answers.environment === "private"
    ? "One workflow, one queue, one controlled deployment environment, and no fully autonomous external action in phase one."
    : answers.environment === "hybrid"
      ? "One workflow and one queue with clear managed-service/private-service boundaries and reversible actions first."
      : "One workflow and one queue in a portable cloud build that can move into stricter infrastructure later.";

  return {
    ...blueprint,
    impactLevel: impact,
    feasibilityLevel: feasibility,
    controlRiskLevel: risk,
    systems,
    integrations,
    approvalPoints,
    pilotBoundary,
    successMetric: blueprint.successMetric,
    handles: [
      "Workflow mapping and automation architecture",
      "Agent orchestration, integrations, review queues, and observability",
      "Pilot implementation with deployment boundaries and fallback paths",
    ],
    customerProvides: [
      "Workflow owner and reviewers",
      "Sample cases, data access, and system credentials for the pilot boundary",
      "Success metric baseline and approval policy",
    ],
  };
}

export function progressCount(answers: Answers) {
  return [answers.workflow, answers.impact, answers.systems, answers.feasibility, answers.risk, answers.environment].filter(Boolean).length;
}

export function buildBriefingUrl(answers: Answers, result: OpportunityResult) {
  const params = new URLSearchParams({
    source: "ai-ops-map",
    opportunity: result.title,
  });

  if (answers.workflow) params.set("workflow", answers.workflow);
  if (answers.impact) params.set("impact", answers.impact);
  if (answers.systems) params.set("systems", answers.systems);
  if (answers.feasibility) params.set("feasibility", answers.feasibility);
  if (answers.risk) params.set("risk", answers.risk);
  if (answers.environment) params.set("environment", answers.environment);
  if (answers.email) params.set("email", answers.email);

  return `https://webrtc.ventures/contact/?${params.toString()}`;
}
