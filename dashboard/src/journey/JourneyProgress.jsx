import { Check } from "lucide-react";
import MomentRail from "./MomentRail.jsx";

// One unified progress under the header: the moment rail on top, and the
// currently-active moment's sub-steps nested beneath it. As the journey advances
// the next moment becomes the "top" and its sub-steps take over below.
export default function JourneyProgress({ moments, moment, phase, facts, status }) {
  const active = phase === "working" && moment >= 0 ? moments[moment] : null;
  const Icon = active?.icon;

  return (
    <div>
      <MomentRail moments={moments} moment={moment} phase={phase} status={status} />

      {active && (
        <div className="ml-1 mt-3 border-l-2 border-agent-200 pl-4 animate-fade-up">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink">
            {Icon && <Icon className="h-3.5 w-3.5 text-agent-600" strokeWidth={2} />}
            {active.label}
            <span className="font-normal text-agent-600">· in progress</span>
          </div>
          <ul className="space-y-1.5">
            {active.facts.map((f, i) => {
              const done = i < facts;
              return (
                <li key={f} className="flex items-center gap-2 text-xs">
                  {done ? (
                    <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-agent-100 text-agent-700">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="h-4 w-4 flex-shrink-0 rounded-full border border-slate-200" />
                  )}
                  <span className={done ? "text-slate-700" : "text-slate-400"}>{f}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
