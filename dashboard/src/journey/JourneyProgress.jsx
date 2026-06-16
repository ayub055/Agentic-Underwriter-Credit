import { Check } from "lucide-react";
import MomentRail from "./MomentRail.jsx";

// One unified progress under the header: the moment rail on top, and the active
// moment's HIGH-LEVEL checks (what's happening now) in a card that points up to
// whichever moment is currently active — so it reads as belonging to that step.
// Detailed findings live in the AnalysisCanvas below.
export default function JourneyProgress({ moments, moment, phase, facts, status }) {
  const active = phase === "working" && moment >= 0 ? moments[moment] : null;
  const Icon = active?.icon;
  const checks = active?.checks ?? [];
  const ratio = active && active.facts.length ? facts / active.facts.length : 0;
  const doneChecks = Math.floor(ratio * checks.length);

  // The rail lays out N moments + 1 outcome node, evenly-ish; point the caret at
  // the active moment's slot so the card visually hangs off that node.
  const caretPct = ((moment + 0.5) / (moments.length + 1)) * 100;

  return (
    <div>
      <MomentRail moments={moments} moment={moment} phase={phase} status={status} />

      {active && checks.length > 0 && (
        <div className="relative mt-4 animate-fade-up">
          <span
            className="absolute -top-1.5 h-3 w-3 rotate-45 border-l border-t border-agent-200 bg-agent-50"
            style={{ left: `calc(${caretPct}% - 6px)` }}
            aria-hidden="true"
          />
          <div className="rounded-xl border border-agent-200/70 bg-agent-50/50 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink">
              {Icon && <Icon className="h-3.5 w-3.5 text-agent-600" strokeWidth={2} />}
              {active.label}
              <span className="font-normal text-agent-600">· in progress</span>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
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
        </div>
      )}
    </div>
  );
}
