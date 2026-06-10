import { Check, Loader2, Cpu, FileOutput } from "lucide-react";
import { dataTone, provPill } from "./tones.js";

export function StatusPill({ status }) {
  if (status === "done")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-semibold text-success-700">
        <Check className="h-3 w-3" strokeWidth={3} /> DONE
      </span>
    );
  if (status === "running")
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-agent-200 bg-agent-50 px-2 py-0.5 text-[11px] font-semibold text-agent-700">
        <Loader2 className="h-3 w-3 motion-safe:animate-spin" /> RUNNING
      </span>
    );
  return (
    <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-400">
      WAITING
    </span>
  );
}

export function ModelTags({ tags = [] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.filter(Boolean).map((t, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded-md border border-primary-100 bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700"
        >
          <Cpu className="h-3 w-3" /> {t}
        </span>
      ))}
    </div>
  );
}

export function DataLine({ d }) {
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <span className="min-w-[150px] text-slate-500">{d.key}</span>
      <span className={`tabular-nums ${dataTone[d.tone] ?? "text-ink"}`}>{d.value}</span>
      {d.prov && (
        <span className={`rounded border px-1.5 py-px text-[10px] font-medium uppercase ${provPill[d.prov]}`}>
          {d.prov}
        </span>
      )}
    </div>
  );
}

export function BranchCard({ branch }) {
  const ok = branch.status === "ok";
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink text-[11px] font-bold text-white">
            {branch.tag}
          </span>
          <span className="text-sm font-semibold text-ink">{branch.title}</span>
        </div>
        <StatusPill status={ok ? "done" : "running"} />
      </div>
      <ModelTags tags={branch.modelTags} />
      <div className="mt-3 space-y-1">
        {branch.data.map((d) => (
          <DataLine key={d.key} d={d} />
        ))}
      </div>
      {branch.report && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
          <FileOutput className="h-3 w-3" /> {branch.report}
        </div>
      )}
    </div>
  );
}
