import { formatEMI, formatPct, formatTenure } from "../../lib/format.js";

export default function MetricsGrid({ offer }) {
  const cells = [
    { label: "Interest Rate", value: formatPct(offer.interestRatePct), sub: "per annum" },
    { label: "Monthly EMI", value: formatEMI(offer.emi), sub: "auto-debit" },
    { label: "Tenure", value: formatTenure(offer.tenureMonths), sub: "flexible" },
  ];

  return (
    <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-slate-200">
      {cells.map((c) => (
        <div key={c.label} className="bg-white p-4">
          <div className="text-[11px] uppercase tracking-wide text-slate-500">{c.label}</div>
          <div className="mt-1 text-lg font-semibold tabular-nums text-ink">{c.value}</div>
          <div className="text-[11px] text-slate-400">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
