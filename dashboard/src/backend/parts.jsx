import { Check, Loader2, Cpu, ExternalLink, Sparkles } from "lucide-react";
import { dataTone, provPill } from "../lib/tones.js";
import { useTypewriter } from "../lib/motion.js";
import { glossaryFor } from "../lib/glossary.js";

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
      {tags.filter(Boolean).map((t, i) => {
        const tip = glossaryFor(t);
        return (
          <span
            key={i}
            title={tip}
            className={`inline-flex items-center gap-1 rounded-md border border-primary-100 bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700 ${
              tip ? "cursor-help" : ""
            }`}
          >
            <Cpu className="h-3 w-3" /> {t}
          </span>
        );
      })}
    </div>
  );
}

export function DataLine({ d }) {
  const tip = glossaryFor(d.key);
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <span
        title={tip}
        className={`min-w-[150px] text-slate-500 ${
          tip ? "cursor-help underline decoration-dotted decoration-slate-300 underline-offset-2" : ""
        }`}
      >
        {d.key}
      </span>
      <span className={`tabular-nums ${dataTone[d.tone] ?? "text-ink"}`}>{d.value}</span>
      {d.prov && (
        <span className={`rounded border px-1.5 py-px text-[10px] font-medium uppercase ${provPill[d.prov]}`}>
          {d.prov}
        </span>
      )}
    </div>
  );
}

// Verbatim model prose streaming in while the agent runs is the moment that
// proves "real AI agents" — so the narrative panel typewriters during playback
// and links to the actual generated artifact.
function AgentNarrative({ narrative, running }) {
  const { text } = useTypewriter(narrative.excerpt, { speed: 18, chunk: 3, enabled: running });
  const shown = running ? text : narrative.excerpt;

  return (
    <div className="mt-3 rounded-lg border border-agent-200/70 bg-agent-50/60 p-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-agent-700">
        <Sparkles className="h-3 w-3" /> Agent narrative
        <span className="ml-auto font-medium normal-case tracking-normal text-agent-600/80">
          verbatim · {narrative.model} · {narrative.elapsed}
        </span>
      </div>
      <p className="text-[11.5px] leading-relaxed text-slate-700">
        {shown}
        {running && <span className="ml-0.5 inline-block h-3 w-1.5 bg-agent-500 motion-safe:animate-pulse" />}
      </p>
      <ul className="mt-2 space-y-0.5">
        {narrative.findings.map((f) => (
          <li key={f} className="flex items-start gap-1.5 text-[11px] text-slate-600">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-agent-400" /> {f}
          </li>
        ))}
      </ul>
      {narrative.artifact && (
        <a
          href={`${import.meta.env.BASE_URL}${narrative.artifact}`}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-agent-700 underline-offset-2 hover:underline"
        >
          Open the agent's full report <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

export function BranchCard({ branch, running = false }) {
  const ok = branch.status === "ok";
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-night text-[11px] font-bold text-white">
            {branch.tag}
          </span>
          <span className="text-sm font-semibold text-ink">{branch.title}</span>
        </div>
        <StatusPill status={ok && !running ? "done" : "running"} />
      </div>
      <ModelTags tags={branch.modelTags} />
      <div className="mt-3 space-y-1">
        {branch.data.map((d) => (
          <DataLine key={d.key} d={d} />
        ))}
      </div>
      {branch.narrative && <AgentNarrative narrative={branch.narrative} running={running} />}
    </div>
  );
}
