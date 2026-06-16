import { useState } from "react";
import { Gauge, Lightbulb, Zap } from "lucide-react";
import { formatINR } from "../lib/format.js";

const MIN = 25000;
const MAX = 300000;
const STEP = 5000;
const TENURES = [12, 24, 36, 48];

// Healthy / borderline / too-tight FOIR bands the verdict copy keys off.
const BANDS = [
  {
    max: 0.4,
    tone: "text-success-700",
    chip: "bg-success-50 text-success-700",
    verdict: "Looks comfortable — this fits your budget.",
    cta: true,
  },
  {
    max: 0.6,
    tone: "text-caution-700",
    chip: "bg-caution-50 text-caution-700",
    verdict: "Borderline — possible with a co-applicant or after clearing an EMI.",
    cta: true,
  },
  {
    max: Infinity,
    tone: "text-caution-700",
    chip: "bg-caution-50 text-caution-700",
    verdict: "Still too tight — I couldn't approve this safely.",
    cta: false,
  },
];

function monthlyEmi(principal, annualRatePct, months) {
  const r = annualRatePct / 100 / 12;
  const k = Math.pow(1 + r, months);
  return (principal * r * k) / (k - 1);
}

// The agent re-runs real affordability math (same FOIR the pipeline used)
// live as the user drags — feedback in milliseconds, not a re-application.
export default function OfferSimulator({ income, existingObligations, ratePct, onCheck }) {
  const [amount, setAmount] = useState(150000);
  const [tenure, setTenure] = useState(24);

  const emi = monthlyEmi(amount, ratePct, tenure);
  const foir = income ? (existingObligations + emi) / income : null;
  const band = BANDS.find((b) => foir <= b.max) ?? BANDS[BANDS.length - 1];
  const pct = Math.round(foir * 100);

  return (
    <div className="mt-6 rounded-2xl border border-agent-200/70 bg-gradient-to-br from-agent-50/60 to-surface p-5">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-agent-600" strokeWidth={2.2} />
        <h2 className="text-sm font-semibold text-ink">Find what works — live</h2>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Move the slider and I'll re-run your affordability numbers instantly. No application, no
        score impact.
      </p>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Amount</span>
        <span className="text-xl font-semibold tabular-nums text-ink">{formatINR(amount)}</span>
      </div>
      <input
        type="range"
        min={MIN}
        max={MAX}
        step={STEP}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        aria-label="Adjust loan amount"
        className="mt-2 w-full accent-agent-600"
      />
      <div className="mt-1 flex justify-between text-[11px] tabular-nums text-slate-400">
        <span>{formatINR(MIN)}</span>
        <span>{formatINR(MAX)}</span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Tenure</span>
        <div className="flex gap-1.5">
          {TENURES.map((t) => (
            <button
              key={t}
              onClick={() => setTenure(t)}
              aria-pressed={tenure === t}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                tenure === t
                  ? "bg-agent-600 text-white"
                  : "bg-surface text-slate-500 ring-1 ring-slate-200 hover:text-ink"
              }`}
            >
              {t} mo
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-surface p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-slate-500">
            <Gauge className="h-4 w-4" strokeWidth={2} />
            Monthly outgo
          </span>
          <span className="font-semibold tabular-nums text-ink">
            {formatINR(Math.round(emi))}/mo
            <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${band.chip}`}>
              {pct}% of income
            </span>
          </span>
        </div>
        <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-gradient-to-r from-success-200 via-caution-200 to-caution-500/60">
          <span
            className="absolute -top-0.5 h-3 w-1 rounded-full bg-night shadow transition-all duration-300 ease-out"
            style={{ left: `${Math.min(foir, 1) * 100}%` }}
            aria-hidden="true"
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wide text-slate-400">
          <span>Comfortable</span>
          <span>40%</span>
          <span>Too tight</span>
        </div>
        <p aria-live="polite" className={`mt-3 text-sm font-medium ${band.tone}`}>
          {band.verdict}
        </p>
      </div>

      {existingObligations > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-surface/70 p-3 text-xs leading-relaxed text-slate-600 ring-1 ring-slate-200/70">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-agent-600" strokeWidth={2.2} />
          <span>
            Your existing EMIs of ≈{formatINR(existingObligations)}/mo are what's squeezing the
            budget — clearing even one would shift every option here toward the green.
          </span>
        </div>
      )}

      <button
        onClick={() => onCheck?.({ amount, tenure })}
        disabled={!band.cta}
        className="mt-4 w-full rounded-xl bg-agent-600 py-3 text-sm font-semibold text-white transition hover:bg-agent-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-agent-600"
      >
        {band.cta ? `Check eligibility for ${formatINR(amount)}` : "Adjust to a workable amount"}
      </button>
    </div>
  );
}
