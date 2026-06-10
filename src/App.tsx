import { useMemo, useState } from "react";
import "./App.css";

type WorkflowId = "support" | "revops" | "ops" | "compliance";
type SystemId = "patchwork" | "partly" | "ready";
type EnvironmentId = "private" | "hybrid" | "cloud";

type Answers = {
  workflow?: WorkflowId;
  systems?: SystemId;
  environment?: EnvironmentId;
  email: string;
};

type OpportunityResult = {
  title: string;
  summary: string;
  pilot: string;
  stack: string[];
  controls: string[];
  value: string;
};

type Dot = {
  left: string;
  top: string;
  region: string;
};

const stackLogos = [
  "OpenClaw",
  "Hermes",
  "n8n",
  "Zapier",
  "Microsoft Agent Framework",
  "CrewAI AMP",
  "Salesforce Agentforce",
  "LangGraph",
];

const deliveryPods = [
  {
    title: "Automation architecture",
    body: "We map the operating pain, choose the right orchestration layer, and design the guardrails before anyone ships a brittle demo.",
  },
  {
    title: "Workflow implementation",
    body: "We configure and build the actual automations, agent loops, human approvals, and integrations with your real systems and operators.",
  },
  {
    title: "Private deployment",
    body: "From day one, we plan for your servers or controlled cloud so security, compliance, and ownership are built in instead of bolted on later.",
  },
];

const outcomeCards = [
  "Agent handoffs with human approval steps",
  "Ops copilots tied to CRM, ticketing, and internal tools",
  "Audit-ready action logs for sensitive workflows",
  "Production support after launch, not hand-wavy prototypes",
];

const workflowChoices = [
  { id: "support", label: "Service ops", detail: "Triage, routing, updates, and repetitive operator work." },
  { id: "revops", label: "Revenue ops", detail: "Lead follow-up, qualification, and CRM-heavy handoffs." },
  { id: "ops", label: "Back-office ops", detail: "Forms, fulfillment, document handling, and approvals." },
  { id: "compliance", label: "Sensitive workflows", detail: "Audit-heavy or regulated processes that need tight control." },
] as const;

const systemsChoices = [
  { id: "patchwork", label: "Patchwork tools", detail: "The team is living in inboxes, spreadsheets, and half-connected apps." },
  { id: "partly", label: "Partly connected", detail: "There are systems in place, but the handoffs still break or stall." },
  { id: "ready", label: "Ready to scale", detail: "The data and systems are good enough for a tighter automation loop." },
] as const;

const environmentChoices = [
  { id: "private", label: "Private first", detail: "We want deployment on our own servers or controlled infrastructure." },
  { id: "hybrid", label: "Hybrid", detail: "Some managed services are fine, but control boundaries matter." },
  { id: "cloud", label: "Cloud is fine", detail: "Speed matters most as long as the architecture can mature cleanly." },
] as const;

const defaultResult: OpportunityResult = {
  title: "Operator-facing service workflow",
  summary:
    "The best first move is usually a narrow workflow with obvious drag, real owners, and clear before-and-after metrics.",
  pilot:
    "Start with a two-week implementation sprint focused on one queue, one set of approvals, and one measurable turnaround metric.",
  stack: ["OpenClaw or LangGraph orchestration", "n8n or Zapier integrations", "operator approval checkpoints"],
  controls: ["run logs", "role-based approvals", "private deployment path"],
  value: "Visible lift without forcing the team to trust a black box",
};

const globalDots: Dot[] = [
  { left: "14%", top: "29%", region: "Vancouver" },
  { left: "17%", top: "31%", region: "Seattle" },
  { left: "19%", top: "35%", region: "San Francisco" },
  { left: "22%", top: "39%", region: "Austin" },
  { left: "24%", top: "33%", region: "Chicago" },
  { left: "27%", top: "30%", region: "Toronto" },
  { left: "29%", top: "36%", region: "Atlanta" },
  { left: "31%", top: "28%", region: "New York" },
  { left: "33%", top: "41%", region: "Miami" },
  { left: "35%", top: "48%", region: "Bogota" },
  { left: "37%", top: "56%", region: "Lima" },
  { left: "39%", top: "64%", region: "Santiago" },
  { left: "45%", top: "27%", region: "Dublin" },
  { left: "47%", top: "28%", region: "London" },
  { left: "49%", top: "31%", region: "Paris" },
  { left: "51%", top: "32%", region: "Amsterdam" },
  { left: "53%", top: "34%", region: "Berlin" },
  { left: "55%", top: "37%", region: "Milan" },
  { left: "56%", top: "42%", region: "Athens" },
  { left: "58%", top: "47%", region: "Cairo" },
  { left: "60%", top: "39%", region: "Istanbul" },
  { left: "62%", top: "44%", region: "Riyadh" },
  { left: "64%", top: "35%", region: "Warsaw" },
  { left: "66%", top: "52%", region: "Nairobi" },
  { left: "68%", top: "57%", region: "Johannesburg" },
  { left: "69%", top: "29%", region: "Dubai" },
  { left: "71%", top: "33%", region: "Karachi" },
  { left: "73%", top: "37%", region: "Bengaluru" },
  { left: "75%", top: "35%", region: "Delhi" },
  { left: "77%", top: "42%", region: "Singapore" },
  { left: "79%", top: "39%", region: "Bangkok" },
  { left: "81%", top: "32%", region: "Shanghai" },
  { left: "83%", top: "30%", region: "Seoul" },
  { left: "85%", top: "28%", region: "Tokyo" },
  { left: "84%", top: "46%", region: "Manila" },
  { left: "86%", top: "58%", region: "Sydney" },
  { left: "82%", top: "62%", region: "Melbourne" },
  { left: "78%", top: "68%", region: "Auckland" },
  { left: "52%", top: "61%", region: "Lagos" },
  { left: "41%", top: "58%", region: "Sao Paulo" },
];

function buildResult(answers: Answers): OpportunityResult {
  const result: OpportunityResult = {
    ...defaultResult,
    stack: [...defaultResult.stack],
    controls: [...defaultResult.controls],
  };

  if (answers.workflow === "revops") {
    result.title = "Revenue automation pod";
    result.summary = "Revenue teams usually feel the pain quickly when response-time drift and CRM cleanup are still mostly manual.";
    result.pilot = "Implement lead intake, enrichment, rep routing, and manager-visible exception queues without losing deal context.";
    result.value = "Faster first-touch speed with cleaner pipeline hygiene";
  }

  if (answers.workflow === "ops") {
    result.title = "Back-office automation pod";
    result.summary = "Document-heavy internal work is often the fastest path to measurable time savings and fewer dropped steps.";
    result.pilot = "Implement one internal queue with extraction, validation, approvals, and clear owner handoff rules.";
    result.value = "Cycle-time reduction with less hidden manual rework";
  }

  if (answers.workflow === "compliance") {
    result.title = "High-control workflow pod";
    result.summary = "Sensitive processes should begin with supervised recommendations, evidence capture, and named approvals instead of autonomy theater.";
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

function progressCount(answers: Answers) {
  return [answers.workflow, answers.systems, answers.environment].filter(Boolean).length;
}

function App() {
  const [answers, setAnswers] = useState<Answers>({ email: "" });
  const result = useMemo(() => buildResult(answers), [answers]);
  const progress = progressCount(answers);

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">AI Ops Map / White-glove automation services</p>
          <h1>We build the automation layer your operators actually need.</h1>
          <p className="hero-lede">
            White-glove implementation for teams that want real automations, real agent workflows, and real deployment discipline.
            We configure and build systems with OpenClaw, Hermes, n8n, Zapier, Microsoft Agent Framework, CrewAI AMP,
            Salesforce Agentforce, and LangGraph, then stand them up on infrastructure you control.
          </p>

          <div className="hero-actions">
            <a href="#opportunity-map" className="primary-link">
              Find low-hanging automation wins
            </a>
            <a href="https://webrtc.ventures" target="_blank" rel="noreferrer" className="secondary-link">
              Talk to an automation expert
            </a>
          </div>

          <div className="assurance-strip">
            <span>Security and compliance designed in from day one</span>
            <span>Human approvals where the workflow actually needs them</span>
            <span>Private servers or controlled cloud instead of vendor lock-in by default</span>
          </div>
        </div>

        <aside className="hero-card" aria-label="service positioning">
          <p className="section-kicker">Built for operations leaders</p>
          <h2>Not an AI demo tour.</h2>
          <ul>
            {outcomeCards.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="mini-proof">
            <strong>Typical engagement shape</strong>
            <span>Opportunity mapping, system design, implementation, deployment, operator handoff, and ongoing tuning.</span>
          </div>
        </aside>
      </section>

      <section className="logo-band" aria-label="automation platforms">
        {stackLogos.map((logo) => (
          <span key={logo}>{logo}</span>
        ))}
      </section>

      <section className="service-grid">
        {deliveryPods.map((pod) => (
          <article key={pod.title} className="service-card">
            <p className="section-kicker">White-glove pod</p>
            <h2>{pod.title}</h2>
            <p>{pod.body}</p>
          </article>
        ))}
      </section>

      <section className="positioning-grid">
        <article className="positioning-card spotlight-card">
          <p className="section-kicker">How we position the work</p>
          <h2>Start with the process, then choose the stack.</h2>
          <p>
            Most teams do not need another loose prototype. They need someone to identify the process bottleneck, choose the right
            orchestration layer, connect the real systems, and stay close enough to operators to make the automation trustworthy.
          </p>
        </article>

        <article className="positioning-card checklist-card">
          <p className="section-kicker">What changes</p>
          <ul>
            <li>Less swivel-chair work between dashboards, inboxes, and CRMs</li>
            <li>Clear approval rules for high-risk actions</li>
            <li>Deployment paths that fit internal security reviews</li>
            <li>Instrumentation for what ran, what failed, and who approved it</li>
          </ul>
        </article>
      </section>

      <section className="map-section">
        <div className="map-copy">
          <p className="section-kicker">Global delivery coverage</p>
          <h2>Distributed builders and operators across the Americas, Europe, Africa, and APAC.</h2>
          <p>
            The model is intentionally global: a white-glove services team with broad timezone coverage, dense technical depth, and
            enough overlap to keep implementation moving without turning the project into a follow-the-sun mess.
          </p>
        </div>

        <div className="world-card" aria-label="global team map">
          <div className="world-map">
            <div className="continent continent-na" />
            <div className="continent continent-sa" />
            <div className="continent continent-eu" />
            <div className="continent continent-af" />
            <div className="continent continent-as" />
            <div className="continent continent-au" />

            {globalDots.map((dot) => (
              <span
                key={`${dot.region}-${dot.left}-${dot.top}`}
                className="map-dot"
                style={{ left: dot.left, top: dot.top }}
                aria-label={dot.region}
                title={dot.region}
              />
            ))}
          </div>

          <div className="map-stats">
            <div>
              <strong>40</strong>
              <span>signal points across the team map</span>
            </div>
            <div>
              <strong>4 regions</strong>
              <span>with active implementation coverage</span>
            </div>
            <div>
              <strong>Own infra</strong>
              <span>supported from the first architecture pass</span>
            </div>
          </div>
        </div>
      </section>

      <section className="diagnostic-section" id="opportunity-map">
        <div className="diagnostic-copy">
          <p className="section-kicker">Low-friction expert CTA</p>
          <h2>Find the easiest automation win before you budget a bigger program.</h2>
          <p>
            Answer three short questions and we can quickly frame the first workflow worth automating, the stack that fits it, and
            how aggressively it should be deployed.
          </p>
        </div>

        <div className="diagnostic-layout">
          <div className="diagnostic-card">
            <div className="diagnostic-head">
              <div>
                <p className="section-kicker">Opportunity map</p>
                <h3>What should we automate first?</h3>
              </div>
              <span className="progress-pill">{progress}/3 mapped</span>
            </div>

            <QuestionBlock
              title="Where is the drag most painful?"
              choices={workflowChoices}
              value={answers.workflow}
              onSelect={(workflow) => setAnswers((current) => ({ ...current, workflow }))}
            />

            <QuestionBlock
              title="How connected are the surrounding systems?"
              choices={systemsChoices}
              value={answers.systems}
              onSelect={(systems) => setAnswers((current) => ({ ...current, systems }))}
            />

            <QuestionBlock
              title="Where should the deployment live?"
              choices={environmentChoices}
              value={answers.environment}
              onSelect={(environment) => setAnswers((current) => ({ ...current, environment }))}
            />

            <label className="email-capture">
              <span>Work email for a quick expert follow-up</span>
              <input
                type="email"
                value={answers.email}
                onChange={(event) => setAnswers((current) => ({ ...current, email: event.target.value }))}
                placeholder="name@company.com"
              />
            </label>
          </div>

          <aside className="result-card" aria-label="automation opportunity result">
            <p className="section-kicker">Suggested first engagement</p>
            <h3>{result.title}</h3>
            <ResultSection title="Why this is the low-hanging win" body={result.summary} />
            <ResultSection title="Pilot shape" body={result.pilot} />
            <ListSection title="Likely stack" items={result.stack} />
            <ListSection title="Controls to keep" items={result.controls} />
            <ResultSection title="Expected payoff" body={result.value} />

            <div className="cta-panel">
              <strong>20-minute automation teardown</strong>
              <span>
                We review the workflow, spot the obvious automation leverage, and tell you whether it belongs in OpenClaw, Hermes,
                n8n, LangGraph, or a mixed stack.
              </span>
              <a href="https://webrtc.ventures" target="_blank" rel="noreferrer">
                Book the conversation
              </a>
              {answers.email ? <small>Follow-up contact noted: {answers.email}</small> : null}
            </div>
          </aside>
        </div>
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
