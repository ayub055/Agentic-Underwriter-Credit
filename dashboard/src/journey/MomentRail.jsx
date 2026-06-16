import { Check, CheckCircle2, Info, UserRound } from "lucide-react";

// Horizontal journey spine: the analysis moments plus a final outcome
// node that takes the status tone only once the reveal lands.

const OUTCOME_NODE = {
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    node: "border-success-600 bg-success-600 text-white",
    text: "text-success-700",
  },
  review: {
    label: "Expert review",
    icon: UserRound,
    node: "border-progress-500 bg-progress-500 text-white",
    text: "text-progress-600",
  },
  rejected: {
    label: "Decision",
    icon: Info,
    node: "border-caution-500 bg-caution-500 text-white",
    text: "text-caution-700",
  },
};

function Connector({ filled }) {
  return (
    <span className="relative mx-1 h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200">
      <span
        className={`absolute inset-y-0 left-0 rounded-full bg-primary-600 transition-all duration-700 ease-out ${
          filled ? "w-full" : "w-0"
        }`}
      />
    </span>
  );
}

export default function MomentRail({ moments, moment, phase, status }) {
  const revealed = phase === "reveal";
  const outcome = OUTCOME_NODE[status] ?? OUTCOME_NODE.review;
  const OutcomeIcon = outcome.icon;

  return (
    <ol className="flex items-start" aria-label="Application journey">
      {moments.map((m, i) => {
        const done = revealed || i < moment;
        const current = !revealed && i === moment;
        return (
          <li key={m.id} className="contents">
            <div className="flex min-w-0 flex-col items-center gap-1.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-300 ${
                  done
                    ? "border-primary-700 bg-primary-700 text-white"
                    : current
                    ? "border-agent-500 bg-surface text-agent-600 motion-safe:animate-pulse-ring"
                    : "border-slate-300 bg-surface text-slate-300"
                }`}
              >
                {done ? (
                  <Check className="h-4 w-4 animate-pop" strokeWidth={2.5} />
                ) : (
                  <m.icon className="h-4 w-4" strokeWidth={2} />
                )}
              </span>
              <span
                className={`max-w-[5.5rem] truncate text-center text-[10px] font-medium sm:max-w-none sm:text-[11px] ${
                  done ? "text-ink" : current ? "text-agent-700" : "text-slate-400"
                }`}
              >
                {m.label}
              </span>
            </div>
            <Connector filled={done && (revealed || i < moment)} />
          </li>
        );
      })}
      <li className="flex min-w-0 flex-col items-center gap-1.5">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-300 ${
            revealed ? `${outcome.node} animate-pop` : "border-dashed border-slate-300 bg-surface text-slate-300"
          }`}
        >
          <OutcomeIcon className="h-4 w-4" strokeWidth={2.2} />
        </span>
        <span
          className={`text-center text-[10px] font-semibold sm:text-[11px] ${
            revealed ? outcome.text : "text-slate-400"
          }`}
        >
          {revealed ? outcome.label : "Outcome"}
        </span>
      </li>
    </ol>
  );
}
