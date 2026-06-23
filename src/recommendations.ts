export type WorkflowId = "support" | "revops" | "ops" | "compliance";
export type SystemId = "patchwork" | "partly" | "ready";
export type EnvironmentId = "private" | "hybrid" | "cloud";

export type Answers = {
  workflow?: WorkflowId;
  systems?: SystemId;
  environment?: EnvironmentId;
  email: string;
};

export type OpportunityResult = {
  title: string;
  summary: string;
  pilot: string;
  stack: string[];
  controls: string[];
  value: string;
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

export const systemsChoices = [
  { id: "patchwork", label: "Patchwork tools", detail: "The team is living in inboxes, spreadsheets, and half-connected apps." },
  { id: "partly", label: "Partly connected", detail: "There are systems in place, but the handoffs still break or stall." },
  { id: "ready", label: "Ready to scale", detail: "The data and systems are good enough for a tighter automation loop." },
] as const satisfies readonly Choice<SystemId>[];

export const environmentChoices = [
  { id: "private", label: "Private first", detail: "We want deployment on our own servers or controlled infrastructure." },
  { id: "hybrid", label: "Hybrid", detail: "Some managed services are fine, but control boundaries matter." },
  { id: "cloud", label: "Cloud is fine", detail: "Speed matters most as long as the architecture can mature cleanly." },
] as const satisfies readonly Choice<EnvironmentId>[];

const defaultResult: OpportunityResult = {
  title: "Operator-facing communications workflow",
  summary:
    "The best first move is usually a narrow customer or operator workflow with obvious drag, real owners, and clear before-and-after metrics.",
  pilot:
    "Start with a two-week implementation sprint focused on one queue, one set of approvals, and one measurable turnaround metric.",
  stack: ["OpenClaw or LangGraph orchestration", "n8n or Zapier integrations", "operator approval checkpoints"],
  controls: ["run logs", "role-based approvals", "private deployment path"],
  value: "Visible lift without forcing the team to trust a black box",
};

export function buildResult(answers: Answers): OpportunityResult {
  const result: OpportunityResult = {
    ...defaultResult,
    stack: [...defaultResult.stack],
    controls: [...defaultResult.controls],
  };

  if (answers.workflow === "revops") {
    result.title = "Sales conversation automation pod";
    result.summary = "Sales and revenue teams feel the pain quickly when first-touch speed, qualification, and CRM cleanup are still mostly manual.";
    result.pilot = "Implement lead intake, enrichment, rep routing, and manager-visible exception queues without losing deal context.";
    result.value = "Faster first-touch speed with cleaner pipeline hygiene";
  }

  if (answers.workflow === "ops") {
    result.title = "Real-time operations automation pod";
    result.summary = "Internal queues tied to live customer experiences are often the fastest path to measurable time savings and fewer dropped steps.";
    result.pilot = "Implement one operational queue with extraction, validation, approvals, and clear owner handoff rules.";
    result.value = "Cycle-time reduction with less hidden manual rework";
  }

  if (answers.workflow === "compliance") {
    result.title = "High-control communications workflow pod";
    result.summary = "Sensitive communication workflows should begin with supervised recommendations, evidence capture, and named approvals instead of autonomy theater.";
    result.pilot = "Implement a review workflow that drafts actions, captures evidence, and keeps the final step with your designated operators.";
    result.controls = [...result.controls, "evidence retention", "named approver routing"];
    result.value = "Auditability and control before aggressive automation";
  }

  if (answers.systems === "patchwork") {
    result.controls = [...result.controls, "operator-visible fallback paths"];
    result.stack = ["Hermes or OpenClaw workflow design", "n8n integration cleanup", "human-in-the-loop checkpoints"];
  }

  if (answers.systems === "ready") {
    result.stack = [
      "LangGraph or Microsoft Agent Framework orchestration",
      "Salesforce Agentforce or CRM integration layer",
      "observability and runbook instrumentation",
    ];
  }

  if (answers.environment === "private") {
    result.pilot = `${result.pilot} Deploy phase one inside your controlled environment from the start.`;
  }

  if (answers.environment === "hybrid") {
    result.controls = [...result.controls, "clear boundary between managed and private services"];
  }

  if (answers.environment === "cloud") {
    result.pilot = `${result.pilot} Keep the deployment design portable so it can move into a stricter environment later.`;
  }

  return result;
}

export function progressCount(answers: Answers) {
  return [answers.workflow, answers.systems, answers.environment].filter(Boolean).length;
}

export function buildBriefingUrl(answers: Answers, result: OpportunityResult) {
  const params = new URLSearchParams({
    source: "ai-ops-map",
    opportunity: result.title,
  });

  if (answers.workflow) params.set("workflow", answers.workflow);
  if (answers.systems) params.set("systems", answers.systems);
  if (answers.environment) params.set("environment", answers.environment);
  if (answers.email) params.set("email", answers.email);

  return `https://webrtc.ventures/contact/?${params.toString()}`;
}
