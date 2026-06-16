import { useState } from "react";
import { Check, ChevronDown, FastForward, Pause, Play, Search } from "lucide-react";

// Optional depth-on-demand: the real numbers behind the friendly copy.
// Customers keep the clean default; exploring execs tap it open.
function EvidenceDrawer({ momentId, evidence }) {
  const [open, setOpen] = useState(false);
  if (!evidence?.length) return null;

  return (
    <div key={momentId} className="mt-3">
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

// A completed process step (a "part of" the stage above it).
function ProcStep({ text }) {
  return (
    <li className="flex items-center gap-2.5 animate-fade-up">
      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-agent-100 text-agent-700">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
      <span className="text-sm text-ink">{text}</span>
    </li>
  );
}

function ProcSkeleton() {
  return (
    <li className="flex items-center gap-2.5" aria-hidden="true">
      <span className="h-5 w-5 flex-shrink-0 rounded-full bg-slate-100" />
      <span className="h-3 w-2/3 rounded bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] motion-safe:animate-shimmer" />
    </li>
  );
}

// A super-step: the stage node on the rail + its nested process steps.
function StageNode({ m, state, shownFacts, isLast, showEvidence }) {
  const Icon = m.icon;
  const done = state === "done";
  const active = state === "active";

  return (
    <li className="flex gap-3">
      {/* rail: node + the connector down to the next stage */}
      <div className="flex flex-col items-center">
        <span
          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
            done
              ? "border-primary-700 bg-primary-700 text-white"
              : active
              ? "border-agent-500 bg-agent-50 text-agent-600 motion-safe:animate-pulse-ring"
              : "border-slate-300 bg-surface text-slate-300"
          }`}
        >
          {done ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <Icon className="h-3.5 w-3.5" strokeWidth={2} />}
        </span>
        {!isLast && <span className={`mt-1 w-px flex-1 ${done ? "bg-primary-200" : "bg-slate-200"}`} />}
      </div>

      {/* content: the stage label + its connected process steps */}
      <div className="min-w-0 flex-1 pb-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
          <span className={`text-sm font-semibold ${done || active ? "text-ink" : "text-slate-400"}`}>{m.label}</span>
          {active && (
            <span className="flex items-center gap-1 text-[11px] text-agent-600">
              <span className="h-1.5 w-1.5 rounded-full bg-agent-500 motion-safe:animate-pulse" />
              Working on it
            </span>
          )}
        </div>
        {(done || active) && (
          <ul className="mt-2.5 space-y-2 border-l border-slate-200 pl-4">
            {m.facts.map((fact, f) =>
              f < shownFacts ? <ProcStep key={fact} text={fact} /> : active ? <ProcSkeleton key={fact} /> : null
            )}
          </ul>
        )}
        {showEvidence && <EvidenceDrawer momentId={m.id} evidence={m.evidence} />}
      </div>
    </li>
  );
}

// The "agent at work" stage: a vertical tree of stages, each a super-step with
// its process steps ticking in beneath it; the active stage holds skeletons for
// what's still coming.
export default function AnalysisCanvas({ moments, phase, moment, facts, onSkip, paused, onPause }) {
  const intro = phase === "intro";
  const revealed = phase === "reveal";

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-surface p-6 shadow-sm sm:p-8 animate-fade-in">
      {intro ? (
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-full bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] motion-safe:animate-shimmer" />
          <div className="space-y-2">
            <div className="h-3 w-40 rounded bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] motion-safe:animate-shimmer" />
            <div className="text-xs text-slate-400">Pulling your file…</div>
          </div>
        </div>
      ) : (
        <ol>
          {moments.map((m, i) => {
            const state = revealed || i < moment ? "done" : i === moment ? "active" : "upcoming";
            const shownFacts = state === "done" ? m.facts.length : state === "active" ? facts : 0;
            const showEvidence = state === "done" || (state === "active" && shownFacts >= m.facts.length);
            return (
              <StageNode
                key={m.id}
                m={m}
                state={state}
                shownFacts={shownFacts}
                isLast={i === moments.length - 1}
                showEvidence={showEvidence}
              />
            );
          })}
        </ol>
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
