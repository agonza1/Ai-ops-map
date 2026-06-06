import { useMemo, useState } from "react";
import "./App.css";

type WorkflowId = "support" | "sales" | "backoffice" | "compliance";
type MaturityId = "manual" | "mixed" | "instrumented";
type RiskId = "low" | "guarded" | "high";
type IntegrationId = "crm" | "ticketing" | "messaging" | "erp";

type Answers = {
  workflow?: WorkflowId;
  maturity?: MaturityId;
  risk?: RiskId;
  integration?: IntegrationId;
  email: string;
};

type ResultCard = {
  workflow: string;
  why: string;
  pilot: string;
  controls: string[];
  stack: string[];
  valueSignal: string;
  confidence: string;
};

const workflowChoices = [
  { id: "support", label: "Support triage", detail: "Deflect repetitive intake, routing, and status-check work." },
  { id: "sales", label: "Sales follow-up", detail: "Recover lead response time and qualification drift." },
  { id: "backoffice", label: "Back-office ops", detail: "Automate forms, data handoff, and human approvals." },
  { id: "compliance", label: "Compliance review", detail: "Keep risky workflows auditable before scaling." },
] as const;

const maturityChoices = [
  { id: "manual", label: "Mostly manual", detail: "Knowledge is tribal and work happens in inboxes or chat." },
  { id: "mixed", label: "Mixed systems", detail: "Some tooling exists but handoffs still break." },
  { id: "instrumented", label: "Well instrumented", detail: "Data exists and teams are ready for tighter automation loops." },
] as const;

const riskChoices = [
  { id: "low", label: "Conservative", detail: "Require approvals, visibility, and narrow scope first." },
  { id: "guarded", label: "Balanced", detail: "Allow partial automation with checkpoints." },
  { id: "high", label: "Aggressive", detail: "Push for speed once core guardrails are in place." },
] as const;

const integrationChoices = [
  { id: "crm", label: "CRM", detail: "Salesforce, HubSpot, or similar customer systems." },
  { id: "ticketing", label: "Ticketing", detail: "Zendesk, Jira, or case management queues." },
  { id: "messaging", label: "Messaging", detail: "Email, Slack, Teams, or SMS response loops." },
  { id: "erp", label: "ERP / finance", detail: "Sensitive approvals, records, and downstream systems." },
] as const;

const defaultResult: ResultCard = {
  workflow: "Managed support triage copilot",
  why: "A narrow intake-and-routing workflow is usually the safest place to prove ROI before deeper automation.",
  pilot: "Run a 2-week pilot that classifies inbound requests, drafts the next action, and escalates edge cases to a human owner.",
  controls: ["human approval on external actions", "audit trail for every recommendation", "fallback path when confidence drops"],
  stack: ["workflow design", "integrations", "approval controls", "monitoring and support"],
  valueSignal: "Visible operational value by week one",
  confidence: "Preliminary map",
};

function buildResult(answers: Answers): ResultCard {
  const result = { ...defaultResult };

  if (answers.workflow === "sales") {
    result.workflow = "Lead follow-up and qualification workflow";
    result.why = "Fast, consistent lead response is measurable, revenue-adjacent, and usually easier to instrument than a broad agent rollout.";
    result.pilot = "Pilot inbound lead qualification, CRM enrichment, and a handoff queue for high-intent prospects.";
    result.valueSignal = "Faster first response without dropping qualification quality";
  }

  if (answers.workflow === "backoffice") {
    result.workflow = "Back-office intake with approval routing";
    result.why = "Structured internal workflows are strong automation candidates when teams are buried in repeatable requests and form work.";
    result.pilot = "Pilot one document-heavy flow with extraction, validation, and approval checkpoints.";
    result.valueSignal = "Cycle-time reduction with clear owner accountability";
  }

  if (answers.workflow === "compliance") {
    result.workflow = "Compliance review assistant with strict approvals";
    result.why = "High-risk work should begin with recommendation support, evidence capture, and operator sign-off instead of autonomous action.";
    result.pilot = "Pilot a review queue that drafts findings, highlights missing evidence, and routes final decisions to named approvers.";
    result.valueSignal = "Risk reduction and auditability before speed";
  }

  if (answers.maturity === "manual") {
    result.controls = ["step-by-step approvals", "operator-visible run logs", "weekly tuning review"];
    result.confidence = "Best first workflow identified";
  }

  if (answers.maturity === "instrumented") {
    result.controls = ["policy-based approvals", "SLA alerts and dashboards", "continuous improvement loop"];
    result.stack = ["workflow design", "production integrations", "observability", "ongoing optimization"];
    result.confidence = "High-confidence first pilot";
  }

  if (answers.risk === "low") {
    result.pilot = `${result.pilot} Keep outbound actions gated until the team is comfortable with the evidence trail.`;
  }

  if (answers.risk === "high") {
    result.pilot = `${result.pilot} Add a second phase for selective auto-execution once guardrails prove out.`;
  }

  if (answers.integration === "erp") {
    result.controls = [...result.controls, "segregation of duties for finance-sensitive actions"];
  }

  if (answers.integration === "messaging") {
    result.stack = [...result.stack, "message QA and escalation design"];
  }

  return result;
}

function progressCount(answers: Answers) {
  return [answers.workflow, answers.maturity, answers.risk, answers.integration].filter(Boolean).length;
}

function App() {
  const [answers, setAnswers] = useState<Answers>({ email: "" });
  const progress = progressCount(answers);
  const result = useMemo(() => buildResult(answers), [answers]);

  return (
    <main className="shell">
      <section className="intro">
        <p className="eyebrow">AI Ops Map</p>
        <h1>Map the safest AI workflow to automate first.</h1>
        <p className="lede">
          This is not a generic lead form. It is a quick consult that surfaces the best first managed AI workflow,
          the control model it needs, and the pilot shape we would run with your team.
        </p>
      </section>

      <section className="workspace">
        <div className="diagnostic">
          <div className="diagnostic-head">
            <div>
              <p className="section-kicker">Guided diagnostic</p>
              <h2>Answer four short questions.</h2>
            </div>
            <span className="progress-pill">{progress}/4 mapped</span>
          </div>

          <QuestionBlock
            title="Where is the operational drag?"
            choices={workflowChoices}
            value={answers.workflow}
            onSelect={(workflow) => setAnswers((current) => ({ ...current, workflow }))}
          />

          <QuestionBlock
            title="How ready are the surrounding systems?"
            choices={maturityChoices}
            value={answers.maturity}
            onSelect={(maturity) => setAnswers((current) => ({ ...current, maturity }))}
          />

          <QuestionBlock
            title="How much autonomy is acceptable in phase one?"
            choices={riskChoices}
            value={answers.risk}
            onSelect={(risk) => setAnswers((current) => ({ ...current, risk }))}
          />

          <QuestionBlock
            title="Which integration surface matters first?"
            choices={integrationChoices}
            value={answers.integration}
            onSelect={(integration) => setAnswers((current) => ({ ...current, integration }))}
          />

          <label className="email-capture">
            <span>Work email for the Blueprint Sprint follow-up</span>
            <input
              type="email"
              value={answers.email}
              onChange={(event) => setAnswers((current) => ({ ...current, email: event.target.value }))}
              placeholder="name@company.com"
            />
          </label>
        </div>

        <aside className="result-panel" aria-label="AI Ops Map result">
          <div className="result-frame">
            <p className="section-kicker">Live result</p>
            <h2>{result.workflow}</h2>
            <p className="confidence">{result.confidence}</p>

            <ResultSection title="Why it fits" body={result.why} />
            <ResultSection title="Recommended pilot" body={result.pilot} />

            <div className="result-grid">
              <ListSection title="Risk controls" items={result.controls} />
              <ListSection title="What we handle" items={result.stack} />
            </div>

            <ResultSection title="Immediate value signal" body={result.valueSignal} />

            <div className="cta-card">
              <p>Next step</p>
              <strong>Blueprint Sprint / managed workflow pilot</strong>
              <span>
                Replace this placeholder with the scheduling link when lead capture is wired.
                {answers.email ? ` Qualified contact: ${answers.email}` : " Corporate email helps us pre-qualify the right follow-up."}
              </span>
              <a href="https://webrtc.ventures" target="_blank" rel="noreferrer">
                Start the pilot conversation
              </a>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

type Choice<T extends string> = {
  id: T;
  label: string;
  detail: string;
};

function QuestionBlock<T extends string>({
  title,
  choices,
  value,
  onSelect,
}: {
  title: string;
  choices: readonly Choice<T>[];
  value: T | undefined;
  onSelect: (value: T) => void;
}) {
  return (
    <section className="question-block">
      <h3>{title}</h3>
      <div className="choice-grid">
        {choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            className={choice.id === value ? "choice-card is-selected" : "choice-card"}
            onClick={() => onSelect(choice.id)}
          >
            <strong>{choice.label}</strong>
            <span>{choice.detail}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ResultSection({ title, body }: { title: string; body: string }) {
  return (
    <section className="result-section">
      <p>{title}</p>
      <span>{body}</span>
    </section>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="result-section">
      <p>{title}</p>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export default App;
