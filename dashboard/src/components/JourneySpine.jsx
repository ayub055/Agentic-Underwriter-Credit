import { Fragment } from "react";

// The one journey, end to end, shared by both views: the backend highlights the
// playback position, the customer view highlights the narrative moment — same
// spine, two lenses.
const STAGES = [
  { id: "form", label: "Form received" },
  { id: "identity", label: "Identity & KYC" },
  { id: "analysers", label: "Bureau ∥ Banking" },
  { id: "score", label: "Score" },
  { id: "policy", label: "Policy" },
  { id: "decision", label: "Decision" },
  { id: "outcome", label: "Outcome" },
];

const OUTCOME_DOT = {
  success: "bg-success-500",
  progress: "bg-progress-500",
  caution: "bg-caution-500",
  danger: "bg-danger-500",
};

export default function JourneySpine({ current = 0, complete = false, outcomeTone = "success", times = {}, className = "" }) {
  return (
    <div className={`flex items-start ${className}`}>
      {STAGES.map((s, i) => {
        const isLast = i === STAGES.length - 1;
        const isOutcome = s.id === "outcome";
        const done = complete || i < current;
        const active = !complete && i === current;

        const dot =
          isOutcome && complete
            ? `${OUTCOME_DOT[outcomeTone] ?? OUTCOME_DOT.success} animate-pop`
            : done
            ? "bg-primary-600"
            : active
            ? "bg-agent-500 motion-safe:animate-pulse-ring"
            : "border border-slate-300 bg-white";

        return (
          <Fragment key={s.id}>
            <div className="flex min-w-0 flex-col items-center gap-1">
              <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full transition-colors duration-300 ${dot}`} />
              <span
                className={`whitespace-nowrap text-[9px] font-medium leading-tight ${
                  done || active ? "text-ink" : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
              {times[s.id] && (
                <span className="text-[9px] tabular-nums leading-none text-slate-400">{times[s.id]}</span>
              )}
            </div>
            {!isLast && (
              <span
                className={`mx-1.5 mt-[5px] h-0.5 min-w-3 flex-1 rounded transition-colors duration-300 ${
                  done ? "bg-primary-300" : "bg-slate-200"
                }`}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
