import { ArrowRight, CheckCircle2, Loader2, ScrollText } from "lucide-react";
import { VOICE_PD_LINKS } from "./phaseModel.js";
import { frostShell } from "../flow/NodeLiveCard.jsx";

// Compact "Voice PD → Decision" callout, anchored at the Decision node. As the
// decision runs, each captured Voice-PD answer / deviation folds into a decision
// element — one spotlighted at a time, then dropped into the list below. Pace is
// synced to the Decision stage playback (0..1), mirroring TelePdCallout.
const ROWS = VOICE_PD_LINKS;

// Disposition → badge tone (cleared / overridden / carried).
const DEV_TONE = {
  cleared: "border-success-200 bg-success-50 text-success-700",
  overridden: "border-caution-200 bg-caution-50 text-caution-700",
  carried: "border-danger-200 bg-danger-50 text-danger-600",
};

export default function DecisionLinkCallout({ progress = 0, frost = false }) {
  const total = ROWS.length;
  const done = Math.min(Math.floor(Math.max(progress, 0) * total), total);
  const current = done < total ? ROWS[done] : null;
  const folded = ROWS.slice(0, done);

  return (
    <div className={frost ? `w-[26rem] ${frostShell(true)} p-4` : "w-72 rounded-xl border border-slate-200 bg-surface p-3 shadow-xl"}>
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        <ScrollText className="h-3 w-3 text-agent-600" strokeWidth={2.5} />
        Voice PD → Decision · folding
        <span className="ml-auto tabular-nums text-slate-400">
          {done}/{total}
        </span>
      </div>

      {/* focal: the evidence currently folding into the decision */}
      <div className="rounded-lg bg-progress-50/70 px-2 py-1.5">
        {current ? (
          <div key={current.token} className="min-w-0 animate-fade-up">
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-night px-1.5 py-px text-[9px] font-bold text-white">{current.token}</span>
              <Loader2 className="h-3 w-3 motion-safe:animate-spin text-progress-600" strokeWidth={2.5} />
              <span className="text-[10px] text-progress-600">folding…</span>
            </div>
            <div className="mt-1 text-[11px] leading-tight text-slate-500">{current.evidence}</div>
            <div className="mt-0.5 flex items-start gap-1 text-[11px] leading-tight">
              <ArrowRight className="mt-px h-3 w-3 flex-shrink-0 text-slate-400" strokeWidth={2} />
              <span className="font-medium text-ink">{current.decision}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-success-700 animate-fade-up">
            <CheckCircle2 className="h-4 w-4" strokeWidth={2.2} />
            <span className="text-xs font-semibold">All evidence folded into Decision</span>
          </div>
        )}
      </div>

      {/* the box: folded evidence → decision links accumulate here */}
      <div className="mt-2 max-h-32 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/60 p-1.5">
        {folded.length === 0 ? (
          <span className="text-[10px] italic text-slate-400">evidence → decision links collect here…</span>
        ) : (
          folded.map((r) => (
            <div key={r.token} className="flex items-baseline gap-1.5 text-[10px] leading-snug animate-fade-up">
              <span className="rounded bg-night px-1 py-px text-[8px] font-bold text-white">{r.token}</span>
              <span className="text-slate-300">→</span>
              <span className="min-w-0 flex-1 truncate text-slate-600">{r.decision}</span>
              {r.deviation && (
                <span className={`flex-shrink-0 rounded border px-1 text-[8px] font-semibold uppercase ${DEV_TONE[r.deviation.disposition]}`}>
                  {r.deviation.level} {r.deviation.disposition}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
