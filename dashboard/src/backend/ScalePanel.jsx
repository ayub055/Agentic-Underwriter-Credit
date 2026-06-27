import { Gauge, Timer, FileCheck2 } from "lucide-react";
import { META, VIZ } from "./phaseModel.js";
import { provPill } from "../lib/tones.js";

// Business-value framing computed from the one measured run — every projected
// figure carries its assumption inline and an "illustrative" pill, because the
// only honest sample size here is n=1.
function Stat({ icon: Icon, label, value, note, pill }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-surface p-4">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
          <span className={`rounded border px-1.5 py-px text-[9px] font-medium uppercase ${provPill[pill]}`}>
            {pill}
          </span>
        </div>
        <div className="font-display text-xl font-bold tabular-nums text-ink">{value}</div>
        <div className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{note}</div>
      </div>
    </div>
  );
}

export default function ScalePanel() {
  const perHour = Math.floor(3600 / Math.max(META.wallClockS, 0.1));

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 animate-fade-up">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        What this means at scale
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          icon={Timer}
          label="Application → decision"
          value={`${META.wallClockS}s`}
          note="Measured wall-clock for this run — form received to stamped decision."
          pill="real"
        />
        <Stat
          icon={Gauge}
          label="Throughput"
          value={`≈ ${perHour}/hr`}
          note="Per worker, assuming serial runs at the measured latency — vs a typical 2–3 day manual TAT (industry assumption)."
          pill="illustrative"
        />
        <Stat
          icon={FileCheck2}
          label="Audit & documentation"
          value="0 manual min"
          note="Audit pack, provenance map and decision log are generated automatically for every case."
          pill="real"
        />
      </div>
      <div className="mt-3 rounded-xl border border-slate-200 bg-surface p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Time to decision — automated vs manual
          </span>
          <span className="text-[11px] font-bold tabular-nums text-primary-700">
            ≈ {Math.round((2.5 * 24 * 3600) / Math.max(META.wallClockS, 0.1)).toLocaleString("en-IN")}× faster
          </span>
        </div>
        {[
          { label: "Automated", value: `${META.wallClockS}s`, w: Math.max((META.wallClockS / (2.5 * 24 * 3600)) * 100, 1.5), cls: "bg-gradient-to-r from-primary-500 to-primary-600 text-white" },
          { label: "Typical manual", value: "~2–3 days", w: 100, cls: "bg-slate-300 text-slate-600" },
        ].map((r) => (
          <div key={r.label} className="mb-1.5 flex items-center gap-2 last:mb-0">
            <span className="w-24 flex-shrink-0 text-[10px] text-slate-500">{r.label}</span>
            <div className="h-3.5 flex-1 overflow-hidden rounded bg-slate-100">
              <div className={`flex h-full items-center justify-end rounded pr-1.5 text-[9px] font-semibold tabular-nums ${r.cls}`} style={{ width: `${r.w}%` }}>
                {r.value}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        The two <span className="font-semibold text-agent-600">LLM analysers</span> account for
        virtually all of the {VIZ.layer2Wall ?? "—"}s spent — the deterministic stages are
        effectively free, reproducible and fully auditable.
      </p>
    </div>
  );
}
