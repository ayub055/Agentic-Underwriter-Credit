import { BellRing, Check, FileText, Loader2, UserRound } from "lucide-react";
import CountdownTimer from "../review/CountdownTimer.jsx";
import ExplainChips from "../../journey/ExplainChips.jsx";
import { CHIPS } from "../../journey/agentScript.js";
import { useCountdown } from "../../hooks/useCountdown.js";

// What's actually happening, told as a live handoff — not a generic spinner.
const HANDOFF_STEPS = [
  {
    label: "Automated analysis complete",
    detail: "Identity, banking and bureau checks all done — my full workup travels with your file.",
    state: "done",
  },
  {
    label: "Routed to a senior underwriter",
    detail: "One result needs human judgment, so a specialist picked it up.",
    state: "done",
  },
  {
    label: "Final decision",
    detail: "I'm watching the queue and will ping you the moment it lands.",
    state: "current",
  },
];

function HandoffStep({ step, isLast }) {
  const done = step.state === "done";
  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      {!isLast && (
        <span
          className={`absolute left-[11px] top-6 h-[calc(100%-1rem)] w-px ${
            done ? "bg-progress-500" : "bg-slate-200"
          }`}
        />
      )}
      <span
        className={`relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
          done
            ? "bg-progress-500 text-white"
            : "border border-progress-500 bg-surface text-progress-500"
        }`}
      >
        {done ? (
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        ) : (
          <Loader2 className="h-3.5 w-3.5 motion-safe:animate-spin" strokeWidth={2.5} />
        )}
      </span>
      <div>
        <div className={`text-sm font-medium ${done ? "text-ink" : "text-progress-600"}`}>
          {step.label}
        </div>
        <div className="text-xs leading-relaxed text-slate-500">{step.detail}</div>
      </div>
    </li>
  );
}

export default function ReviewCard({ onEnablePush, onViewDocs }) {
  const { label, isExpired } = useCountdown(299);

  return (
    <div className="rounded-2xl border border-slate-200 bg-surface p-6 shadow-sm sm:p-8">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-progress-50 px-3 py-1">
        <UserRound className="h-3.5 w-3.5 text-progress-500" strokeWidth={2.4} />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-progress-600">
          With a specialist
        </span>
      </div>

      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        A senior underwriter is taking the final look
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        Nothing is needed from you. Here's exactly where your file is right now:
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <ol className="list-none rounded-xl border border-slate-200 bg-slate-50/60 p-5">
          {HANDOFF_STEPS.map((step, i) => (
            <HandoffStep key={step.label} step={step} isLast={i === HANDOFF_STEPS.length - 1} />
          ))}
        </ol>
        <div className="flex justify-center sm:px-4">
          <CountdownTimer label={label} isExpired={isExpired} />
        </div>
      </div>

      <ExplainChips items={CHIPS.review} />

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          onClick={onEnablePush}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          <BellRing className="h-4 w-4" strokeWidth={2} />
          Notify me the moment it's decided
        </button>
        <button
          onClick={onViewDocs}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          <FileText className="h-4 w-4" strokeWidth={2} />
          View Submitted Documents
        </button>
      </div>
    </div>
  );
}
