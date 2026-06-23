import { useMemo, useState } from "react";
import "./App.css";
import {
  type Answers,
  type Choice,
  buildBriefingUrl,
  buildResult,
  environmentChoices,
  progressCount,
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
          <h2>Answer three questions and get a practical first workflow blueprint.</h2>
          <p>
            The recommendation updates as you answer, so the conversation starts with workflow shape, risk controls, and
            deployment assumptions instead of a blank discovery call.
          </p>
        </div>

        <div className="diagnostic-layout">
          <div className="diagnostic-card">
            <div className="diagnostic-head">
              <div>
                <p className="section-kicker">Opportunity map</p>
                <h3>What should we automate first?</h3>
              </div>
              <span className="progress-pill" aria-label={`${progress} of 3 diagnostic questions answered`}>
                {progress}/3 mapped
              </span>
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
                autoComplete="email"
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
                WebRTC.ventures can review the workflow, spot the obvious automation leverage, and advise whether it belongs
                in OpenClaw, Hermes, n8n, LangGraph, a contact-center integration, or a mixed stack.
              </span>
              <a href={briefingUrl} target="_blank" rel="noreferrer">
                Contact WebRTC.ventures
              </a>
              {answers.email ? <small>Follow-up contact noted: {answers.email}</small> : null}
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
