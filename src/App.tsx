import { useEffect, useMemo, useRef, useState, type FormEvent, type RefObject } from "react";
import "./App.css";
import {
  type Answers,
  type Choice,
  buildResult,
  environmentChoices,
  feasibilityChoices,
  impactChoices,
  progressCount,
  riskChoices,
  systemsChoices,
  workflowChoices,
} from "./recommendations";
import {
  type LeadPayload,
  type LeadValidationErrors,
  buildLeadPayload,
  consentText,
  getAttribution,
  getLeadCaptureConfig,
  hasLeadValidationErrors,
  isMeetingBookedMessage,
  schedulerUrl,
  submitLeadCapture,
  trackFunnelEvent,
  validateLeadFields,
} from "./leadCapture";

type QuestionId = "workflow" | "impact" | "systems" | "feasibility" | "risk" | "environment";
type LeadStatus = "idle" | "submitting" | "success" | "error";

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

const initialAnswers: Answers = {
  email: "",
  name: "",
  company: "",
  consent: false,
};

const captureConfig = getLeadCaptureConfig();

function App() {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [step, setStep] = useState(0);
  const [leadStatus, setLeadStatus] = useState<LeadStatus>("idle");
  const [leadErrors, setLeadErrors] = useState<LeadValidationErrors>({});
  const [submissionError, setSubmissionError] = useState("");
  const [submittedPayload, setSubmittedPayload] = useState<LeadPayload | null>(null);
  const legendRef = useRef<HTMLLegendElement>(null);
  const startedRef = useRef(false);
  const completedStepsRef = useRef(new Set<QuestionId>());
  const partialViewedRef = useRef(false);
  const completedRef = useRef(false);
  const schedulerOpenedRef = useRef(false);
  const meetingBookedRef = useRef(false);
  const attribution = useMemo(() => getAttribution(), []);
  const result = useMemo(() => buildResult(answers), [answers]);
  const progress = progressCount(answers);
  const currentQuestion = questions[step];
  const isCurrentAnswered = Boolean(answers[currentQuestion.id]);
  const canShowEarlySignal = progress >= 2;
  const canShowFullResult = progress === questions.length;
  const scheduledUrl = useMemo(() => schedulerUrl(captureConfig.schedulerUrl, submittedPayload, attribution), [attribution, submittedPayload]);

  useEffect(() => {
    legendRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (canShowEarlySignal && !canShowFullResult && !partialViewedRef.current) {
      partialViewedRef.current = true;
      trackFunnelEvent("partial_result_viewed", { progress, recommendation: result.title }, captureConfig.analyticsEndpoint);
    }

    if (canShowFullResult && !completedRef.current) {
      completedRef.current = true;
      trackFunnelEvent("assessment_completed", { recommendation: result.title, answers: diagnosticEventAnswers(answers) }, captureConfig.analyticsEndpoint);
    }
  }, [answers, canShowEarlySignal, canShowFullResult, progress, result.title]);

  useEffect(() => {
    function onMessage(message: MessageEvent) {
      if (submittedPayload && !meetingBookedRef.current && isMeetingBookedMessage(message)) {
        meetingBookedRef.current = true;
        trackFunnelEvent(
          "meeting_booked",
          { submissionId: submittedPayload.submissionId, schedulerUrl: scheduledUrl },
          captureConfig.analyticsEndpoint,
        );
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [scheduledUrl, submittedPayload]);

  function updateAnswer(id: QuestionId, value: string) {
    setAnswers((current) => ({ ...current, [id]: value }));

    if (!startedRef.current) {
      startedRef.current = true;
      trackFunnelEvent("assessment_started", { question: id }, captureConfig.analyticsEndpoint);
    }

    if (!completedStepsRef.current.has(id)) {
      completedStepsRef.current.add(id);
      trackFunnelEvent(
        "assessment_step_completed",
        { question: id, answer: value, step: questions.findIndex((question) => question.id === id) + 1 },
        captureConfig.analyticsEndpoint,
      );
    }
  }

  function updateLeadField(field: "name" | "email" | "company" | "consent", value: string | boolean) {
    setAnswers((current) => ({ ...current, [field]: value }));
    setLeadStatus("idle");
    setSubmissionError("");
    setLeadErrors((current) => ({ ...current, [field]: undefined }));
  }

  function markSchedulerOpened(trigger: "link" | "embed") {
    if (schedulerOpenedRef.current || !submittedPayload) return;

    schedulerOpenedRef.current = true;
    trackFunnelEvent(
      "scheduler_opened",
      { trigger, submissionId: submittedPayload.submissionId, schedulerUrl: scheduledUrl },
      captureConfig.analyticsEndpoint,
    );
  }

  async function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateLeadFields(answers);
    setLeadErrors(errors);
    setSubmissionError("");

    if (hasLeadValidationErrors(errors)) {
      setLeadStatus("error");
      return;
    }

    const payload = buildLeadPayload(answers, result, attribution);
    setLeadStatus("submitting");

    try {
      await submitLeadCapture(payload, captureConfig);
      setSubmittedPayload(payload);
      setLeadStatus("success");
      trackFunnelEvent(
        "lead_submitted",
        {
          submissionId: payload.submissionId,
          company: payload.lead.company,
          recommendation: payload.recommendation.title,
          workflow: payload.diagnostic.workflow,
        },
        captureConfig.analyticsEndpoint,
      );
    } catch (error) {
      setLeadStatus("error");
      setSubmissionError(error instanceof Error ? error.message : "Lead capture failed. Try again in a moment.");
    }
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

          <div className="diagnostic-intro">
            <p className="eyebrow">WebRTC.ventures AI Ops Map</p>
            <h1 id="diagnostic-title">Map the first AI ops starter kit worth selling.</h1>
            <p className="hero-lede">
              Start with the diagnostic. One answer at a time, it turns a communication-heavy workflow into a scoped pilot signal for sales conversations, support operations, or regulated customer experience teams.
            </p>
          </div>
        </div>

        <aside className="result-card" aria-label="live recommendation panel" aria-live="polite">
          <p className="section-kicker">Live recommendation</p>
          {!canShowEarlySignal ? (
            <LockedResult progress={progress} />
          ) : canShowFullResult ? (
            <FullResult
              result={result}
              answers={answers}
              leadStatus={leadStatus}
              leadErrors={leadErrors}
              submissionError={submissionError}
              schedulerUrl={scheduledUrl}
              onLeadFieldChange={updateLeadField}
              onSubmit={handleLeadSubmit}
              onSchedulerOpen={markSchedulerOpened}
            />
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

function diagnosticEventAnswers(answers: Answers) {
  return {
    workflow: answers.workflow,
    impact: answers.impact,
    systems: answers.systems,
    feasibility: answers.feasibility,
    risk: answers.risk,
    environment: answers.environment,
  };
}

function ProgressMeter({ current, answers }: { current: number; answers: Answers }) {
  return (
    <ol className="progress-meter" aria-label="diagnostic progress">
      {questions.map((question, index) => {
        const answered = Boolean(answers[question.id]);
        return (
          <li
            key={question.id}
            className={index === current ? "is-current" : answered ? "is-complete" : undefined}
            aria-current={index === current ? "step" : undefined}
            aria-label={`${question.eyebrow}: ${answered ? "answered" : index === current ? "current" : "not answered"}`}
          >
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
  legendRef: RefObject<HTMLLegendElement>;
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
      <ResultSection title="Early recommendation" body={result.recommendedWorkflow} />
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
  leadStatus,
  leadErrors,
  submissionError,
  schedulerUrl: scheduledUrl,
  onLeadFieldChange,
  onSubmit,
  onSchedulerOpen,
}: {
  result: ReturnType<typeof buildResult>;
  answers: Answers;
  leadStatus: LeadStatus;
  leadErrors: LeadValidationErrors;
  submissionError: string;
  schedulerUrl: string;
  onLeadFieldChange: (field: "name" | "email" | "company" | "consent", value: string | boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSchedulerOpen: (trigger: "link" | "embed") => void;
}) {
  const canShowScheduler = leadStatus === "success" && Boolean(scheduledUrl);

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

      <form className="lead-form" onSubmit={onSubmit} noValidate>
        <div>
          <p className="section-kicker">Lead capture</p>
          <strong>Send the blueprint to WebRTC.ventures</strong>
          <span>Structured answers, recommendation, attribution, referrer, and consent are sent before scheduling opens.</span>
        </div>

        <label className="email-capture">
          <span>Name</span>
          <input
            type="text"
            value={answers.name}
            onChange={(event) => onLeadFieldChange("name", event.target.value)}
            placeholder="Alex Rivera"
            autoComplete="name"
            aria-invalid={Boolean(leadErrors.name)}
            aria-describedby={leadErrors.name ? "lead-name-error" : undefined}
          />
          <FieldError id="lead-name-error" message={leadErrors.name} />
        </label>

        <label className="email-capture">
          <span>Work email</span>
          <input
            type="email"
            value={answers.email}
            onChange={(event) => onLeadFieldChange("email", event.target.value)}
            placeholder="name@company.com"
            autoComplete="email"
            aria-invalid={Boolean(leadErrors.email)}
            aria-describedby={leadErrors.email ? "lead-email-error" : undefined}
          />
          <FieldError id="lead-email-error" message={leadErrors.email} />
        </label>

        <label className="email-capture">
          <span>Company</span>
          <input
            type="text"
            value={answers.company}
            onChange={(event) => onLeadFieldChange("company", event.target.value)}
            placeholder="Company name"
            autoComplete="organization"
            aria-invalid={Boolean(leadErrors.company)}
            aria-describedby={leadErrors.company ? "lead-company-error" : undefined}
          />
          <FieldError id="lead-company-error" message={leadErrors.company} />
        </label>

        <label className="consent-row">
          <input
            type="checkbox"
            checked={answers.consent}
            onChange={(event) => onLeadFieldChange("consent", event.target.checked)}
            aria-invalid={Boolean(leadErrors.consent)}
            aria-describedby={leadErrors.consent ? "lead-consent-error" : undefined}
          />
          <span>{consentText}</span>
        </label>
        <FieldError id="lead-consent-error" message={leadErrors.consent} />

        {submissionError ? <p className="form-message is-error" role="alert">{submissionError}</p> : null}
        {leadStatus === "success" ? <p className="form-message is-success">Blueprint received. Pick a teardown time below.</p> : null}

        <button className="primary-button submit-lead" type="submit" disabled={leadStatus === "submitting"}>
          {leadStatus === "submitting" ? "Sending..." : "Submit and schedule"}
        </button>
      </form>

      {canShowScheduler ? (
        <div className="scheduler-panel">
          <div>
            <p className="section-kicker">Scheduler</p>
            <strong>30-minute automation teardown</strong>
            <span>Open the booking flow with the assessment context already attached.</span>
          </div>
          <a href={scheduledUrl} target="_blank" rel="noreferrer" onClick={() => onSchedulerOpen("link")}>
            Open scheduler
          </a>
          <iframe
            title="Schedule a 30-minute AI ops teardown"
            src={scheduledUrl}
            loading="lazy"
            onLoad={() => onSchedulerOpen("embed")}
          />
        </div>
      ) : leadStatus === "success" ? (
        <div className="scheduler-panel">
          <p className="form-message is-error">Scheduler URL is not configured. The lead was captured, but booking cannot open yet.</p>
        </div>
      ) : null}
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <span className="field-error" id={id}>
      {message}
    </span>
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
