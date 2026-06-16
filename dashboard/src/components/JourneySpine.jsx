import { Fragment } from "react";

// The one journey, end to end, shared by both views: a hairline rail whose
// segments fill as the run progresses, with a soft "comet" breathing on the
// active stage and the outcome node blooming into its tone on completion.
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

        const core =
          isOutcome && complete
            ? `${OUTCOME_DOT[outcomeTone] ?? OUTCOME_DOT.success} animate-pop`
            : done
            ? "bg-primary-600"
            : active
            ? "bg-agent-500"
            : "border border-slate-300 bg-surface";

        return (
          <Fragment key={s.id}>
            <div className="flex min-w-0 flex-col items-center gap-1.5">
              {/* the travelling comet: a soft halo breathes behind the active node */}
              <span className="relative flex h-3 w-3 items-center justify-center">
                <span
                  className={`relative h-3 w-3 rounded-full transition-all duration-500 ${core} ${
                    active ? "shadow-[0_0_10px_2px_rgb(var(--c-agent-500)/0.5)] motion-safe:animate-pulse-ring" : ""
                  }`}
                />
              </span>
              <span
                className={`whitespace-nowrap text-micro font-medium leading-tight transition-colors ${
                  done || active ? "text-ink" : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
              {times[s.id] && (
                <span className="text-micro tabular-nums leading-none text-slate-400">{times[s.id]}</span>
              )}
            </div>
            {!isLast && (
              <span className="relative mx-1.5 mt-[5px] h-px min-w-3 flex-1 overflow-hidden rounded-full bg-slate-200">
                <span
                  className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-700 ease-out ${
                    done ? "w-full" : active ? "w-1/2" : "w-0"
                  }`}
                />
              </span>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
