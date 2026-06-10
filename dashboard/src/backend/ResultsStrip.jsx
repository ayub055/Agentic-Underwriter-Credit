import { provPill } from "./tones.js";
import { useCountUp } from "../lib/motion.js";

function Kpi({ label, value, tone }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <span className={`text-lg font-semibold tabular-nums ${tone ?? "text-ink"}`}>{value}</span>
    </div>
  );
}

const PROV = ["real", "derived", "mock", "placeholder"];

export default function ResultsStrip({ meta }) {
  const approved = meta.outcome === "APPROVED";
  const agentCalls = useCountUp(meta.agentCount);
  const wallTenths = useCountUp(Math.round(meta.wallClockS * 10));
  const warnings = useCountUp(meta.warnings);

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <Kpi
        label="Outcome"
        value={meta.outcome}
        tone={approved ? "text-success-700" : "text-caution-700"}
      />
      <Kpi label="Phases" value="6" />
      <Kpi label="Agent calls" value={agentCalls} tone="text-primary-700" />
      <Kpi label="Wall-clock" value={`${(wallTenths / 10).toFixed(1)}s`} />
      <Kpi label="Validator notes" value={warnings} />

      <div className="ml-auto flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Provenance
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PROV.map((p) => (
            <span
              key={p}
              className={`rounded border px-1.5 py-px text-[10px] font-medium uppercase ${provPill[p]}`}
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
