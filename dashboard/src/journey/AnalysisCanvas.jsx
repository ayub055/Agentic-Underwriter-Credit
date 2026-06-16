import { useState } from "react";
import { Check, ChevronDown, FastForward, Pause, Play, Search } from "lucide-react";

// Optional depth-on-demand: the real numbers behind the friendly copy.
// Customers keep the clean default; exploring execs tap it open.
function EvidenceDrawer({ momentId, evidence }) {
  const [open, setOpen] = useState(false);
  if (!evidence?.length) return null;

  return (
    <div key={momentId} className="mt-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-agent-200/70 bg-agent-50 px-2.5 py-1.5 text-xs font-medium text-agent-700 transition hover:bg-agent-100"
        aria-expanded={open}
      >
        <Search className="h-3.5 w-3.5" strokeWidth={2} />
        How I checked this
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <dl className="mt-2 space-y-1.5 rounded-xl border border-agent-200/60 bg-agent-50/50 p-3 animate-fade-up">
          {evidence.map(([label, value], i) => (
            <div key={i} className="flex items-baseline justify-between gap-3 text-xs">
              <dt className="text-slate-500">{label}</dt>
              <dd className="text-right font-medium tabular-nums text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

// Moment progress ring: fills as findings tick in, wrapping the moment icon.
function ProgressRing({ pct, children }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-agent-50">
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r={r} fill="none" className="stroke-agent-100" strokeWidth="3" />
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          className="stroke-agent-500"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={(1 - Math.min(Math.max(pct, 0), 1)) * c}
          style={{ transition: "stroke-dashoffset .6s cubic-bezier(.16,1,.3,1)" }}
        />
      </svg>
      {children}
    </span>
  );
}

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
export default function AnalysisCanvas({ moments, phase, moment, facts, onSkip, paused, onPause }) {
  const m = moment >= 0 ? moments[moment] : null;
  const Icon = m?.icon;

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-surface p-6 shadow-sm sm:p-8 animate-fade-in">
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
            <ProgressRing pct={m.facts.length ? facts / m.facts.length : 0}>
              <Icon className="h-5 w-5 text-agent-600" strokeWidth={2} />
            </ProgressRing>
            <div>
              <div className="text-sm font-semibold text-ink">{m.label}</div>
              <div className="flex items-center gap-1.5 text-xs text-agent-600">
                <span className="h-1.5 w-1.5 rounded-full bg-agent-500 motion-safe:animate-pulse" />
                {facts >= m.facts.length ? "Done" : "Reading your file…"}
              </div>
            </div>
          </div>
          <div className="relative mt-5 overflow-hidden">
            {/* scanning sweep while findings are still ticking in */}
            {facts < m.facts.length && (
              <span className="pointer-events-none absolute inset-x-0 h-10 -translate-y-1/2 bg-gradient-to-b from-transparent via-agent-500/10 to-transparent motion-safe:animate-scan" />
            )}
            <ul className="space-y-3">
              {m.facts.map((fact, f) =>
                f < facts ? <FactRow key={fact} text={fact} /> : <SkeletonRow key={fact} />
              )}
            </ul>
          </div>
          {facts >= m.facts.length && <EvidenceDrawer momentId={m.id} evidence={m.evidence} />}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
        {onPause ? (
          <button
            onClick={onPause}
            aria-pressed={paused}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            {paused ? <Play className="h-3.5 w-3.5" strokeWidth={2} /> : <Pause className="h-3.5 w-3.5" strokeWidth={2} />}
            {paused ? "Resume" : "Stay on this step"}
          </button>
        ) : (
          <span />
        )}
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
