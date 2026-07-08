import { useEffect, useMemo, useRef, useState } from "react";
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

type QuestionId = "workflow" | "impact" | "systems" | "feasibility" | "risk" | "environment";

type DiagnosticQuestion<T extends string> = {
  id: QuestionId;
  eyebrow: string;
  title: string;
  helper: string;
  choices: readonly Choice<T>[];
};

const questions = [
  {
    id: "workflow",
    eyebrow: "Question 1",
    title: "Which workflow should create the first visible business signal?",
    helper: "Pick the area where a starter-kit pilot would create the fastest proof for a buyer or operator.",
    choices: workflowChoices,
  },
  {
    id: "impact",
    eyebrow: "Question 2",
    title: "How much pressure is attached to that workflow?",
    helper: "This determines whether the map frames a small assist, a serious pilot, or a revenue/SLA rescue lane.",
    choices: impactChoices,
  },
  {
    id: "systems",
    eyebrow: "Question 3",
    title: "What system reality would the starter kit need to meet?",
    helper: "The best first package depends on whether the team has APIs, partial integrations, or mostly manual workarounds.",
    choices: systemsChoices,
  },
  {
    id: "feasibility",
    eyebrow: "Question 4",
    title: "How implementation-ready is the workflow?",
    helper: "A credible package should expose whether this is build-ready, pilotable, or still discovery-first.",
    choices: feasibilityChoices,
  },
  {
    id: "risk",
    eyebrow: "Question 5",
    title: "How tightly should customer-facing actions be controlled?",
    helper: "Approval posture affects the demo, the operating model, and the artifacts a buyer expects to see.",
    choices: riskChoices,
  },
  {
    id: "environment",
    eyebrow: "Question 6",
    title: "Where would the first deployment need to live?",
    helper: "This keeps the recommendation grounded in a starter kit WebRTC.ventures could actually scope.",
    choices: environmentChoices,
  },
] as const;

const starterKitSignals = [
  "Sales follow-up, CRM hygiene, and rep handoff loops stay first-class in the map.",
  "Each answer narrows a pilot boundary, approval posture, and proof metric instead of listing generic tools.",
  "The output is packaged for a 30-minute teardown with WebRTC.ventures, not a self-serve audit report.",
];

function App() {
  const [answers, setAnswers] = useState<Answers>({ email: "" });
  const [step, setStep] = useState(0);
  const legendRef = useRef<HTMLLegendElement>(null);
  const result = useMemo(() => buildResult(answers), [answers]);
  const briefingUrl = useMemo(() => buildBriefingUrl(answers, result), [answers, result]);
  const progress = progressCount(answers);
  const currentQuestion = questions[step];
  const isCurrentAnswered = Boolean(answers[currentQuestion.id]);
  const canShowEarlySignal = progress >= 2;
  const canShowFullResult = progress === questions.length;

  useEffect(() => {
    legendRef.current?.focus();
  }, [step]);

  function updateAnswer(id: QuestionId, value: string) {
    setAnswers((current) => ({ ...current, [id]: value }));
  }

  function goNext() {
    setStep((current) => Math.min(current + 1, questions.length - 1));
  }

  function goPrevious() {
    setStep((current) => Math.max(current - 1, 0));
  }

  return (
    <main className="page-shell">
      <section className="diagnostic-hero" aria-labelledby="diagnostic-title">
        <div className="diagnostic-workspace">
          <div className="diagnostic-intro">
            <p className="eyebrow">WebRTC.ventures AI Ops Map</p>
            <h1 id="diagnostic-title">Map the first AI ops starter kit worth selling.</h1>
            <p className="hero-lede">
              Start with the diagnostic. One answer at a time, it turns a communication-heavy workflow into a scoped pilot signal for sales conversations, support operations, or regulated customer experience teams.
            </p>
          </div>

          <div className="diagnostic-card" aria-label="AI ops progressive diagnostic">
            <div className="diagnostic-head">
              <div>
                <p className="section-kicker">Progressive diagnostic</p>
                <span className="question-count">Step {step + 1} of {questions.length}</span>
              </div>
              <span className="progress-pill" aria-label={`${progress} of ${questions.length} diagnostic questions answered`}>
                {progress}/{questions.length} mapped
              </span>
            </div>

            <ProgressMeter current={step} answers={answers} />

            <QuestionBlock
              question={currentQuestion}
              value={answers[currentQuestion.id]}
              onSelect={(value) => updateAnswer(currentQuestion.id, value)}
              legendRef={legendRef}
            />

            <div className="step-controls" aria-label="diagnostic navigation">
              <button type="button" onClick={goPrevious} disabled={step === 0}>
                Previous
              </button>
              <button type="button" className="primary-button" onClick={goNext} disabled={!isCurrentAnswered || step === questions.length - 1}>
                Next
              </button>
            </div>
          </div>
        </div>

        <aside className="result-card" aria-label="live recommendation panel" aria-live="polite">
          <p className="section-kicker">Live recommendation</p>
          {!canShowEarlySignal ? (
            <LockedResult progress={progress} />
          ) : canShowFullResult ? (
            <FullResult result={result} answers={answers} setAnswers={setAnswers} briefingUrl={briefingUrl} />
          ) : (
            <PartialResult result={result} progress={progress} />
          )}
        </aside>
      </section>

      <section className="proof-band" aria-label="starter-kit packaging signals">
        {starterKitSignals.map((signal) => (
          <article key={signal}>
            <p className="section-kicker">Signal</p>
            <span>{signal}</span>
          </article>
        ))}
      </section>
    </main>
  );
}

function ProgressMeter({ current, answers }: { current: number; answers: Answers }) {
  return (
    <ol className="progress-meter" aria-label="diagnostic progress">
      {questions.map((question, index) => {
        const answered = Boolean(answers[question.id]);
        return (
          <li key={question.id} className={index === current ? "is-current" : answered ? "is-complete" : undefined}>
            <span>{index + 1}</span>
          </li>
        );
      })}
    </ol>
  );
}

function QuestionBlock<T extends string>({
  question,
  value,
  onSelect,
  legendRef,
}: {
  question: DiagnosticQuestion<T>;
  value: T | undefined;
  onSelect: (value: T) => void;
  legendRef: React.RefObject<HTMLLegendElement>;
}) {
  return (
    <fieldset className="question-block">
      <legend ref={legendRef} tabIndex={-1}>
        <span>{question.eyebrow}</span>
        {question.title}
      </legend>
      <p>{question.helper}</p>
      <div className="choice-grid">
        {question.choices.map((choice) => (
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
    </fieldset>
  );
}

function LockedResult({ progress }: { progress: number }) {
  return (
    <div className="locked-result">
      <h2>Answer two questions to reveal the first useful signal.</h2>
      <p>
        The full blueprint stays hidden until all six choices are mapped. Current progress: {progress}/6.
      </p>
    </div>
  );
}

function PartialResult({ result, progress }: { result: ReturnType<typeof buildResult>; progress: number }) {
  return (
    <div className="partial-result">
      <h2>{result.title}</h2>
      <ResultSection title="Early observation" body={result.whyFits} />
      <div className="level-grid" aria-label="partial qualification levels">
        <LevelPill label="Impact" value={result.impactLevel} />
        <LevelPill label="Pilot readiness" value={readinessLabel(result.feasibilityLevel)} />
      </div>
      <p className="result-note">{6 - progress} more answers unlock the pilot boundary, approval points, integrations, and teardown link.</p>
    </div>
  );
}

function FullResult({
  result,
  answers,
  setAnswers,
  briefingUrl,
}: {
  result: ReturnType<typeof buildResult>;
  answers: Answers;
  setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
  briefingUrl: string;
}) {
  return (
    <div className="full-result">
      <h2>{result.title}</h2>
      <ResultSection title="Recommended first workflow" body={result.recommendedWorkflow} />
      <ResultSection title="Why it fits" body={result.whyFits} />

      <div className="level-grid" aria-label="blueprint qualification levels">
        <LevelPill label="Impact" value={result.impactLevel} />
        <LevelPill label="Pilot readiness" value={readinessLabel(result.feasibilityLevel)} />
        <LevelPill label="Control risk" value={result.controlRiskLevel} />
      </div>

      <ListSection title="Likely integrations" items={result.integrations} />
      <ListSection title="Approval points" items={result.approvalPoints} />
      <ResultSection title="Pilot boundary" body={result.pilotBoundary} />
      <ResultSection title="Success metric" body={result.successMetric} />

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

      <div className="cta-panel">
        <strong>30-minute automation teardown</strong>
        <span>
          WebRTC.ventures can review the blueprint, pressure-test approval points, and turn the best sales signal into a starter-kit implementation plan.
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
    </div>
  );
}

function readinessLabel(value: string) {
  if (value === "High") return "Build-ready";
  if (value === "Medium") return "Pilotable";
  return "Discovery needed";
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
