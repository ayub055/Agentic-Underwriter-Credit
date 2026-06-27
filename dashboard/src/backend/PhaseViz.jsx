import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { VIZ } from "./phaseModel.js";
import { formatEMI, formatINR } from "../lib/format.js";

// Per-phase data visualizations, all driven by the real run (VIZ).
// Bars/needles animate in whenever the phase becomes visible.

function useGrown() {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return grown;
}

function VizShell({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </div>
      {children}
    </div>
  );
}

// ── Phase 0: the application as the customer submitted it ───────────────────
function FormField({ label, value, wide }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-0.5 rounded-md border border-slate-200 bg-surface px-2 py-1.5 text-[12px] font-medium tabular-nums text-ink">
        {value}
      </div>
    </div>
  );
}

function ApplicationForm() {
  const f = VIZ.form;
  const addr = f.address;
  return (
    <VizShell title={`Personal-loan application — case ${f.caseId}`}>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 animate-fade-up">
        <FormField label="Amount requested" value={formatINR(f.amount)} />
        <FormField label="Tenure" value={`${f.tenure} months`} />
        <FormField label="Declared income" value={`${formatINR(f.income)} / mo`} />
        <FormField label="Employer" value={f.employer ?? "—"} />
        <FormField
          wide
          label="Residential address"
          value={`${addr.line ?? "—"}, ${addr.city ?? ""} ${addr.pincode ?? ""}`}
        />
        <FormField label="Ownership" value={addr.ownership ?? "—"} />
        <FormField label="Years at address" value={addr.years_at_address ?? "—"} />
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success-100 text-success-700">
          <Check className="h-3 w-3" />
        </span>
        Consent captured — bureau pull and bank-statement analysis authorised by the customer.
      </p>
    </VizShell>
  );
}

// ── Phase 2: the parallel-overlap proof ─────────────────────────────────────
function ParallelBars() {
  const grown = useGrown();
  const wall = VIZ.layer2Wall ?? 1;
  const sum = VIZ.branches.reduce((s, b) => s + (b.elapsed ?? 0), 0);

  return (
    <VizShell title="Parallel execution — wall-clock overlap">
      <div className="space-y-2.5">
        {VIZ.branches.map((b) => (
          <div key={b.id} className="flex items-center gap-2">
            <span className="w-28 flex-shrink-0 text-[11px] text-slate-500">
              <span className="mr-1.5 rounded bg-night px-1 font-bold text-white">{b.tag}</span>
              {b.label}
            </span>
            <div className="h-4 flex-1 overflow-hidden rounded bg-slate-200/60">
              <div
                className="flex h-full items-center justify-end rounded bg-gradient-to-r from-primary-500 to-primary-600 pr-1.5 text-[9px] font-semibold tabular-nums text-white transition-all duration-1000 ease-out"
                style={{ width: grown ? `${((b.elapsed ?? 0) / wall) * 100}%` : "0%" }}
              >
                {b.elapsed}s
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* serial-vs-parallel comparison: the actual run scaled against the
          hypothetical of running both agents one after another. */}
      <div className="mt-4 space-y-1.5">
        {[
          { label: "Parallel (actual)", t: wall, cls: "bg-gradient-to-r from-primary-500 to-primary-600 text-white", ghost: false },
          { label: "If run serially", t: Math.round(sum * 10) / 10, cls: "bg-slate-300/70 text-slate-600", ghost: true },
        ].map((r) => (
          <div key={r.label} className="flex items-center gap-2">
            <span className="w-28 flex-shrink-0 text-[10px] text-slate-500">{r.label}</span>
            <div className="h-3.5 flex-1 overflow-hidden rounded bg-slate-200/50">
              <div
                className={`flex h-full items-center justify-end rounded pr-1.5 text-[9px] font-semibold tabular-nums transition-all duration-1000 ease-out ${r.cls}`}
                style={{ width: grown ? `${Math.max((r.t / Math.max(sum, 0.1)) * 100, 8)}%` : "0%" }}
              >
                {r.t}s
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
        Both analysers ran simultaneously in parallel —{" "}
        <span className="font-semibold text-primary-700">~{Math.round((sum - wall) * 10) / 10}s saved</span>{" "}
        versus running them one after another.
      </p>
    </VizShell>
  );
}

// ── Phase 2: address-quality model gauge ────────────────────────────────────
const BAND_STYLE = {
  HIGH: { bar: "from-success-500 to-success-600", chip: "bg-success-100 text-success-700" },
  MEDIUM: { bar: "from-progress-400 to-progress-500", chip: "bg-progress-100 text-progress-600" },
  LOW: { bar: "from-caution-400 to-caution-500", chip: "bg-caution-100 text-caution-700" },
};

function AddressGauge() {
  const grown = useGrown();
  const a = VIZ.address;
  const score = a.score ?? 0;
  const band = a.band ?? "MEDIUM";
  const style = BAND_STYLE[band] ?? BAND_STYLE.MEDIUM;

  return (
    <VizShell title="Address-quality model — score & drivers">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-2xl font-bold tabular-nums text-ink">
          {score}
          <span className="text-sm font-medium text-slate-400"> / 100</span>
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${style.chip}`}>{band}</span>
      </div>

      {/* score track with band thresholds */}
      <div className="relative h-4 overflow-hidden rounded bg-slate-200/70">
        <div
          className={`h-full rounded bg-gradient-to-r ${style.bar} transition-all duration-1000 ease-out`}
          style={{ width: grown ? `${score}%` : "0%" }}
        />
        {[a.bandMedium, a.bandHigh].map((t) => (
          <span key={t} className="absolute top-0 h-full w-px bg-surface/70" style={{ left: `${t}%` }} />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[9px] uppercase tracking-wide text-slate-400">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>

      {/* top drivers as signed contribution bars (how each pushed the score) */}
      <div className="mt-3">
        <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
          Top drivers · contribution
        </div>
        <div className="space-y-2">
          {a.reasons.map((r) => {
            const pos = r.direction === "positive";
            const w = Math.min((r.impact ?? 0.3) * 100, 48); // half-axis %
            return (
              <div key={r.code} className="text-[11px]">
                <div className="mb-0.5 flex items-center justify-between">
                  <span className="text-slate-600">{r.label}</span>
                  <span className={`font-semibold tabular-nums ${pos ? "text-success-700" : "text-caution-700"}`}>
                    {pos ? "+" : "−"}
                    {Math.round((r.impact ?? 0) * 100) / 100}
                  </span>
                </div>
                <div className="relative h-2 overflow-hidden rounded bg-slate-100">
                  <span className="absolute left-1/2 top-0 h-full w-px bg-slate-300" />
                  <span
                    className={`absolute top-0 h-full rounded transition-all duration-700 ease-out ${
                      pos ? "bg-success-500" : "bg-caution-500"
                    }`}
                    style={{ left: pos ? "50%" : `${50 - (grown ? w : 0)}%`, width: grown ? `${w}%` : "0%" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        Model PD nudge{" "}
        <span className="font-semibold text-primary-700">
          {a.pdAdjustment > 0 ? "+" : ""}
          {a.pdAdjustment}
        </span>{" "}
        folded into the scorecard ·{" "}
        {a.reviewFlag ? (
          <span className="font-semibold text-caution-700">L0_ADDRESS manual-review flag raised</span>
        ) : (
          <span className="font-semibold text-success-700">L0_ADDRESS clear</span>
        )}
        .
      </p>
    </VizShell>
  );
}

// ── Phase 4: policy waterfall ───────────────────────────────────────────────
function PolicyWaterfall() {
  const grown = useGrown();
  const { layers, result } = VIZ.policy;
  const breachIdx = layers.findIndex((l) => !l.passed);

  return (
    <VizShell title="L1–L6 policy waterfall">
      {/* left-aligned cascade: each gate steps in from the left, forming a
          waterfall edge on the right. */}
      <div className="flex flex-col gap-1">
        {layers.map((l, i) => {
          const width = 100 - i * 7; // left-anchored staircase → waterfall edge
          const halted = breachIdx !== -1 && i > breachIdx; // gates past a breach never run
          return (
            <div
              key={l.layer}
              className={`flex items-center justify-between gap-2 rounded px-2.5 py-0.5 text-white shadow-sm transition-all duration-500 ease-out ${
                halted ? "bg-slate-300 text-slate-600" : l.passed ? "bg-success-600" : "bg-danger-500"
              }`}
              style={{
                width: `${width}%`,
                opacity: grown ? 1 : 0,
                transform: grown ? "none" : "translateX(-6px)",
                transitionDelay: `${i * 90}ms`,
              }}
            >
              <span className="font-mono text-[10px] font-medium">{l.layer}</span>
              {halted ? (
                <span className="text-[9px] font-semibold uppercase tracking-wide">skipped</span>
              ) : l.passed ? (
                <Check className="h-3 w-3" strokeWidth={3} />
              ) : (
                <X className="h-3 w-3" strokeWidth={3} />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-slate-500">
        Waterfall result:{" "}
        <span className={`font-bold ${result === "APPROVED" ? "text-success-700" : "text-danger-600"}`}>
          {result}
        </span>{" "}
        {breachIdx === -1 ? "— every layer cleared on credit quality." : `— halted at ${layers[breachIdx].layer}.`}
      </p>
    </VizShell>
  );
}

// ── Phase 5: FOIR gauge (the serviceability gate) ───────────────────────────
function polar(cx, cy, r, v) {
  // v in [0,1] maps left (180°) to right (0°) across the top semicircle.
  const theta = Math.PI * (1 - v);
  return [cx + r * Math.cos(theta), cy - r * Math.sin(theta)];
}

function arcPath(cx, cy, r, v0, v1) {
  const [x0, y0] = polar(cx, cy, r, v0);
  const [x1, y1] = polar(cx, cy, r, v1);
  return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
}

function FoirGauge() {
  const grown = useGrown();
  const { proposed, cap, emi, income } = VIZ.foir;
  const v = Math.min(proposed ?? 0, 1); // gauge scale: 0 → 100% of income
  const cx = 110;
  const cy = 104;
  const r = 86;
  const [capX, capY] = polar(cx, cy, r + 9, cap);
  const breach = proposed != null && proposed > cap;

  return (
    <VizShell title="Serviceability — FOIR vs cap">
      <div className="flex flex-wrap items-center gap-5">
        <svg width="220" height="118" aria-hidden="true">
          <path d={arcPath(cx, cy, r, 0, 0.4)} fill="none" stroke="#059669" strokeOpacity=".75" strokeWidth="10" strokeLinecap="round" />
          <path d={arcPath(cx, cy, r, 0.4, cap)} fill="none" stroke="#f59e0b" strokeOpacity=".75" strokeWidth="10" />
          <path d={arcPath(cx, cy, r, cap, 1)} fill="none" stroke="#ef4444" strokeOpacity=".6" strokeWidth="10" strokeLinecap="round" />
          <line
            x1={polar(cx, cy, r - 14, cap)[0]} y1={polar(cx, cy, r - 14, cap)[1]}
            x2={polar(cx, cy, r + 5, cap)[0]} y2={polar(cx, cy, r + 5, cap)[1]}
            stroke="#b45309" strokeWidth="2"
          />
          <text x={capX} y={capY} fill="#b45309" fontSize="9" textAnchor="middle" fontWeight="700">
            cap {cap}
          </text>
          <g
            style={{
              transform: `rotate(${(grown ? v : 0) * 180 - 90}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
              transition: "transform 1.2s cubic-bezier(.34,1.2,.4,1)",
            }}
          >
            <line x1={cx} y1={cy} x2={cx} y2={cy - r + 18} className="stroke-ink" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          <circle cx={cx} cy={cy} r="4.5" className="fill-ink" />
        </svg>
        <div className="min-w-[150px]">
          <div className={`text-2xl font-bold tabular-nums ${breach ? "text-danger-600" : "text-success-700"}`}>
            {proposed != null ? `${Math.round(proposed * 100)}%` : "—"}
          </div>
          <div className="text-[11px] text-slate-500">of monthly income would go to obligations</div>
          {breach && (
            <div className="mt-2 rounded-lg border border-danger-200 bg-danger-50 p-2 text-[11px] leading-relaxed text-danger-700">
              EMI {formatEMI(emi)} on ₹{Math.round((income ?? 0) / 1000)}k income —{" "}
              <span className="font-semibold">gate FAIL · customer protected</span>
            </div>
          )}
        </div>
      </div>
    </VizShell>
  );
}

// ── Phase 6: where the wall-clock went ──────────────────────────────────────
function StageGantt() {
  const grown = useGrown();
  const wall = Math.max(VIZ.wallClockS, 0.001);

  return (
    <VizShell title="Run telemetry — where time went">
      {/* one stacked ribbon: each segment a stage, proportional to wall-clock */}
      <div className="flex h-5 w-full overflow-hidden rounded-full bg-slate-200/50">
        {VIZ.stages.map((s, i) => (
          <div
            key={s.stage}
            title={`${s.stage} · ${s.elapsed}s`}
            className={`h-full transition-all duration-1000 ease-out ${i > 0 ? "border-l border-surface/60" : ""} ${
              s.stage === "layer2" ? "bg-gradient-to-r from-agent-500 to-agent-600" : "bg-primary-500/80"
            }`}
            style={{ width: grown ? `${Math.max((s.elapsed / wall) * 100, 0.6)}%` : "0%" }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
        {VIZ.stages.map((s) => (
          <span key={s.stage} className="flex items-center gap-1 text-[10px] text-slate-500">
            <span className={`h-2 w-2 rounded-sm ${s.stage === "layer2" ? "bg-agent-500" : "bg-primary-500/80"}`} />
            <span className="font-mono">{s.stage}</span>
            <span className="tabular-nums text-slate-400">{s.elapsed}s</span>
          </span>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        The <span className="font-semibold text-agent-600">LLM analysers</span> account for virtually
        all wall-clock; the deterministic native stages are effectively free — decisions stay fast
        and reproducible.
      </p>
    </VizShell>
  );
}

const VIZ_BY_PHASE = {
  form: ApplicationForm,
  intake: AddressGauge,
  layer2: ParallelBars,
  policy: PolicyWaterfall,
  decision: FoirGauge,
  finalize: StageGantt,
};

export default function PhaseViz({ phaseId, status }) {
  const Viz = VIZ_BY_PHASE[phaseId];
  if (!Viz || status === "waiting") return null;
  return <Viz />;
}
