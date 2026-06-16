import { Check } from "lucide-react";
import MomentRail from "./MomentRail.jsx";

// One unified progress under the header: the moment rail on top, and the
// currently-active moment's HIGH-LEVEL checks nested beneath it (what's happening
// now — not the detailed findings, which live in the AnalysisCanvas below). As
// the journey advances the next moment becomes the "top" and its checks follow.
export default function JourneyProgress({ moments, moment, phase, facts, status }) {
  const active = phase === "working" && moment >= 0 ? moments[moment] : null;
  const Icon = active?.icon;
  const checks = active?.checks ?? [];
  // Map fine-grained fact progress onto the few high-level checks.
  const ratio = active && active.facts.length ? facts / active.facts.length : 0;
  const doneChecks = Math.floor(ratio * checks.length);

  return (
    <div>
      <MomentRail moments={moments} moment={moment} phase={phase} status={status} />

      {active && checks.length > 0 && (
        <div className="ml-1 mt-3 border-l-2 border-agent-200 pl-4 animate-fade-up">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink">
            {Icon && <Icon className="h-3.5 w-3.5 text-agent-600" strokeWidth={2} />}
            {active.label}
          </div>
          <ul className="space-y-1.5">
            {checks.map((c, i) => {
              const done = i < doneChecks;
              const current = i === doneChecks;
              return (
                <li key={c} className="flex items-center gap-2 text-xs">
                  {done ? (
                    <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-agent-100 text-agent-700">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                  ) : current ? (
                    <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-agent-500 motion-safe:animate-pulse" />
                    </span>
                  ) : (
                    <span className="h-4 w-4 flex-shrink-0 rounded-full border border-slate-200" />
                  )}
                  <span className={done ? "text-slate-700" : current ? "text-ink" : "text-slate-400"}>
                    {c}
                    {current && <span className="text-agent-600"> …</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
