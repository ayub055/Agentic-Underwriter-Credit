import { Check, FastForward } from "lucide-react";

function FactRow({ text }) {
  return (
    <li className="flex items-center gap-2.5 animate-fade-up">
      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-agent-100 text-agent-700">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
      <span className="text-sm text-ink">{text}</span>
    </li>
  );
}

function SkeletonRow() {
  return (
    <li className="flex items-center gap-2.5" aria-hidden="true">
      <span className="h-5 w-5 flex-shrink-0 rounded-full bg-slate-100" />
      <span className="h-3 w-2/3 rounded bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] motion-safe:animate-shimmer" />
    </li>
  );
}

// The "agent at work" stage: shows the moment currently being replayed with
// its findings ticking in, skeletons holding space for what's still coming.
export default function AnalysisCanvas({ moments, phase, moment, facts, onSkip }) {
  const m = moment >= 0 ? moments[moment] : null;
  const Icon = m?.icon;

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 animate-fade-in">
      {phase === "intro" || !m ? (
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-xl bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] motion-safe:animate-shimmer" />
          <div className="space-y-2">
            <div className="h-3 w-40 rounded bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] motion-safe:animate-shimmer" />
            <div className="text-xs text-slate-400">Pulling your file…</div>
          </div>
        </div>
      ) : (
        <div key={m.id} className="animate-fade-up">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-agent-50 text-agent-600 ring-1 ring-agent-200/60">
              <Icon className="h-5 w-5" strokeWidth={2} />
            </span>
            <div>
              <div className="text-sm font-semibold text-ink">{m.label}</div>
              <div className="flex items-center gap-1.5 text-xs text-agent-600">
                <span className="h-1.5 w-1.5 rounded-full bg-agent-500 motion-safe:animate-pulse" />
                Working on it
              </div>
            </div>
          </div>
          <ul className="mt-5 space-y-3">
            {m.facts.map((fact, f) =>
              f < facts ? <FactRow key={fact} text={fact} /> : <SkeletonRow key={fact} />
            )}
          </ul>
        </div>
      )}

      <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
        <button
          onClick={onSkip}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          <FastForward className="h-3.5 w-3.5" strokeWidth={2} />
          Skip to result
        </button>
      </div>
    </div>
  );
}
