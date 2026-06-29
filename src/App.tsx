import { useMemo, useState } from "react";
import "./App.css";
import {
  type Answers,
  type Choice,
  buildBriefingUrl,
  buildResult,
  environmentChoices,
  feasibilityChoices,
  impactChoices,
  progressCount,
  riskChoices,
  systemsChoices,
  workflowChoices,
} from "./recommendations";

const deliveryPods = [
  {
    title: "Communications workflow architecture",
    body: "We map the moments where customers, reps, clinicians, or support teams wait on manual routing, context gathering, and approvals.",
  },
  {
    title: "Human-in-the-loop implementation",
    body: "We build the orchestration, integrations, agent loops, review queues, and fallback paths around the real operators who own the outcome.",
  },
  {
    title: "Portable deployment design",
    body: "We plan for private servers, controlled cloud, or hybrid environments so stricter security requirements do not force a rebuild later.",
  },
];

const proofPoints = [
  "WebRTC.ventures has spent years building real-time voice, video, contact center, telehealth, and customer experience systems.",
  "The diagnostic narrows automation ideas into implementation-ready workflow blueprints instead of a generic tool shopping list.",
  "Every recommendation keeps named owners, approval points, observability, and deployment boundaries visible from the first sprint.",
];

function App() {
  const [answers, setAnswers] = useState<Answers>({ email: "" });
  const result = useMemo(() => buildResult(answers), [answers]);
  const briefingUrl = useMemo(() => buildBriefingUrl(answers, result), [answers, result]);
  const progress = progressCount(answers);

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">WebRTC.ventures AI Ops Map</p>
          <h1>Find the first AI workflow worth automating.</h1>
          <p className="hero-lede">
            A focused diagnostic for communication-heavy operations: contact centers, support teams, sales conversations,
            voice workflows, telehealth, compliance reviews, and real-time customer experiences.
          </p>

          <div className="hero-actions">
            <a href="#opportunity-map" className="primary-link">
              Map an automation win
            </a>
            <a href="https://webrtc.ventures/contact/" target="_blank" rel="noreferrer" className="secondary-link">
              Contact WebRTC.ventures
            </a>
          </div>

          <div className="assurance-strip">
            <span>Built for communications and real-time customer operations</span>
            <span>Human approvals where the workflow actually needs them</span>
            <span>Private, hybrid, or cloud deployment paths kept portable</span>
          </div>
        </div>

        <aside className="hero-card" aria-label="WebRTC.ventures automation services proof">
          <p className="section-kicker">Why WebRTC.ventures</p>
          <h2>Implementation credibility for live customer workflows.</h2>
          <ul>
            {proofPoints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="service-grid" aria-label="delivery approach">
        {deliveryPods.map((pod) => (
          <article key={pod.title} className="service-card">
            <p className="section-kicker">Delivery pod</p>
            <h2>{pod.title}</h2>
            <p>{pod.body}</p>
          </article>
        ))}
      </section>

      <section className="positioning-grid">
        <article className="positioning-card spotlight-card">
          <p className="section-kicker">Assessment data</p>
          <h2>We only ask for enough context to frame the first useful conversation.</h2>
          <p>
            The map uses your selected workflow, system maturity, deployment preference, and optional email to prepare an
            expert follow-up. It is not a production data intake form, and sensitive customer records should stay out of the
            diagnostic until a proper security review and implementation plan are in place.
          </p>
        </article>

        <article className="positioning-card checklist-card">
          <p className="section-kicker">What changes</p>
          <ul>
            <li>Less context loss between calls, tickets, inboxes, CRMs, and internal queues</li>
            <li>Clear approval rules for high-risk customer or compliance actions</li>
            <li>Deployment paths that fit internal security reviews</li>
            <li>Instrumentation for what ran, what failed, and who approved it</li>
          </ul>
        </article>
      </section>

      <section className="diagnostic-section" id="opportunity-map">
        <div className="diagnostic-copy">
          <p className="section-kicker">Progressive diagnostic</p>
          <h2>Answer six questions and get a practical first workflow blueprint.</h2>
          <p>
            The recommendation updates as you qualify impact, feasibility, control risk, and deployment assumptions, so the
            conversation starts with a usable blueprint instead of a blank discovery call.
          </p>
        </div>

        <div className="diagnostic-layout">
          <div className="diagnostic-card">
            <div className="diagnostic-head">
              <div>
                <p className="section-kicker">Opportunity map</p>
                <h3>What should we automate first?</h3>
              </div>
              <span className="progress-pill" aria-label={`${progress} of 6 diagnostic questions answered`}>
                {progress}/6 mapped
              </span>
            </div>

            <QuestionBlock
              title="Where is the drag most painful?"
              choices={workflowChoices}
              value={answers.workflow}
              onSelect={(workflow) => setAnswers((current) => ({ ...current, workflow }))}
            />

            <QuestionBlock
              title="How large is the business impact?"
              choices={impactChoices}
              value={answers.impact}
              onSelect={(impact) => setAnswers((current) => ({ ...current, impact }))}
            />

            <QuestionBlock
              title="Which systems would be involved?"
              choices={systemsChoices}
              value={answers.systems}
              onSelect={(systems) => setAnswers((current) => ({ ...current, systems }))}
            />

            <QuestionBlock
              title="How ready is the workflow to automate?"
              choices={feasibilityChoices}
              value={answers.feasibility}
              onSelect={(feasibility) => setAnswers((current) => ({ ...current, feasibility }))}
            />

            <QuestionBlock
              title="How much control does it need?"
              choices={riskChoices}
              value={answers.risk}
              onSelect={(risk) => setAnswers((current) => ({ ...current, risk }))}
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
                autoComplete="email"
              />
            </label>
          </div>

          <aside className="result-card" aria-label="automation opportunity result">
            <p className="section-kicker">Workflow blueprint</p>
            <h3>{result.title}</h3>
            <ResultSection title="Recommended first workflow" body={result.recommendedWorkflow} />
            <ResultSection title="Why it fits" body={result.whyFits} />

            <div className="level-grid" aria-label="blueprint qualification levels">
              <LevelPill label="Impact" value={result.impactLevel} />
              <LevelPill label="Feasibility" value={result.feasibilityLevel} />
              <LevelPill label="Control risk" value={result.controlRiskLevel} />
            </div>

            <ListSection title="Systems involved" items={result.systems} />
            <ListSection title="Likely integrations" items={result.integrations} />
            <ListSection title="Approval points" items={result.approvalPoints} />
            <ResultSection title="Pilot boundary" body={result.pilotBoundary} />
            <ResultSection title="Success metric" body={result.successMetric} />
            <ListSection title="What WebRTC.ventures handles" items={result.handles} />
            <ListSection title="What the customer provides" items={result.customerProvides} />

            <div className="cta-panel">
              <strong>30-minute automation teardown</strong>
              <span>
                WebRTC.ventures can review the blueprint, pressure-test the approval points, and advise whether it belongs
                in OpenClaw, Hermes, n8n, LangGraph, a contact-center integration, or a mixed stack.
              </span>
              <a href={briefingUrl} target="_blank" rel="noreferrer">
                Contact WebRTC.ventures
              </a>
              {answers.email ? (
                <div className="follow-up-contact">
                  <small>Follow-up contact noted</small>
                  <code>{answers.email.trim()}</code>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

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
            aria-pressed={choice.id === value}
          >
            <strong>{choice.label}</strong>
            <span>{choice.detail}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function LevelPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="level-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
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
