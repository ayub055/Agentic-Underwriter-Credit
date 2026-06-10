import { provPill } from "../lib/tones.js";

function Kpi({ label, value, tone }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <span className={`text-lg font-semibold tabular-nums ${tone ?? "text-ink"}`}>{value}</span>
    </div>
  );
}

const PROV = ["real", "derived", "mock", "placeholder"];

// KPIs track the playback cursor so the strip never spoils the outcome:
// "DECIDING…" until the run completes, then the stamped result pops in.
export default function ResultsStrip({ meta, progress = 1, complete = true }) {
  const approved = meta.outcome === "APPROVED";
  const agentCalls = Math.round(meta.agentCount * progress);
  const wall = (meta.wallClockS * progress).toFixed(1);
  const warnings = Math.round(meta.warnings * progress);

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {complete ? (
        <div className="animate-pop">
          <Kpi
            label="Outcome"
            value={meta.outcome}
            tone={approved ? "text-success-700" : "text-danger-600"}
          />
        </div>
      ) : (
        <Kpi
          label="Outcome"
          value={<span className="text-agent-600 motion-safe:animate-pulse">DECIDING…</span>}
        />
      )}
      <Kpi
        label="App → decision"
        value={`${wall}s`}
        tone={complete ? "text-primary-700" : undefined}
      />
      <Kpi label="Phases" value="6" />
      <Kpi label="Agent calls" value={agentCalls} tone="text-primary-700" />
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
