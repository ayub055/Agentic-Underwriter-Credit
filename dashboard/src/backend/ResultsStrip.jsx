import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { provPill } from "../lib/tones.js";
import { PROVENANCE } from "./phaseModel.js";

function Kpi({ label, value, tone }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <span className={`text-lg font-semibold tabular-nums ${tone ?? "text-ink"}`}>{value}</span>
    </div>
  );
}

const PROV = ["real", "derived", "mock", "placeholder"];

// "We tag every field's provenance" is the strongest anti-vaporware proof in
// the run — so the legend opens the actual field-by-field map.
function ProvenancePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const entries = Object.entries(PROVENANCE);
  const counts = PROV.reduce((acc, p) => ({ ...acc, [p]: entries.filter(([, v]) => v === p).length }), {});

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative ml-auto">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-1 transition hover:border-slate-200 hover:bg-slate-50"
        aria-expanded={open}
      >
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Provenance
        </span>
        <span className="flex flex-wrap gap-1.5">
          {PROV.map((p) => (
            <span
              key={p}
              className={`rounded border px-1.5 py-px text-[10px] font-medium uppercase ${provPill[p]}`}
            >
              {p} · {counts[p]}
            </span>
          ))}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-lg animate-fade-up">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Field-by-field provenance — {entries.length} fields tagged
          </div>
          <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
            {entries.map(([field, p]) => (
              <div key={field} className="flex items-center justify-between gap-2 text-[11px]">
                <span className="truncate font-mono text-slate-600">{field}</span>
                <span className={`flex-shrink-0 rounded border px-1.5 py-px text-[9px] font-medium uppercase ${provPill[p]}`}>
                  {p}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 border-t border-slate-100 pt-2 text-[10px] leading-relaxed text-slate-500">
            Nothing here is invented: <span className="font-medium">real</span> = captured pipeline
            output, <span className="font-medium">derived</span> = computed from real fields,{" "}
            <span className="font-medium">mock</span>/<span className="font-medium">placeholder</span>{" "}
            = honestly-labelled stand-ins awaiting production integrations.
          </p>
        </div>
      )}
    </div>
  );
}

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
      <Kpi label="Phases" value={meta.phases} />
      <Kpi label="Agent calls" value={agentCalls} tone="text-primary-700" />
      <Kpi label="Validator notes" value={warnings} />

      <ProvenancePopover />
    </div>
  );
}
