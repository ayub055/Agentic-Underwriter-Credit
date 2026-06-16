import { useEffect, useState } from "react";
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

export function DataLine({ d, index }) {
  const tip = glossaryFor(d.key);
  // `index` -> staggered fade-in when values land after the branch finishes.
  const reveal = index != null ? { animationDelay: `${Math.min(index * 70, 420)}ms` } : undefined;
  return (
    <div className={`flex items-center gap-2 text-[13px] ${index != null ? "animate-fade-in" : ""}`} style={reveal}>
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

// While a branch is still running its values aren't ready — show the key with a
// shimmering placeholder instead of populating the summary early.
function DataLineSkeleton({ keyName, index }) {
  return (
    <div className="flex items-center gap-2 text-[13px]" aria-hidden="true">
      <span className="min-w-[150px] text-slate-500">{keyName}</span>
      <span
        className="h-3 rounded bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] motion-safe:animate-shimmer"
        style={{ width: `${48 + ((index * 29) % 56)}px` }}
      />
    </div>
  );
}

// Cycles "Analysing… → Decisioning… → Thinking…" before the prose starts, so
// the agent reads as reasoning first, then writing its result.
const THINK_WORDS = ["Analysing", "Decisioning", "Thinking"];
function ThinkingLine() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % THINK_WORDS.length), 650);
    return () => clearInterval(id);
  }, []);
  return (
    <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-agent-600">
      {THINK_WORDS[i]}…
      <span className="inline-flex gap-0.5">
        {[0, 1, 2].map((d) => (
          <span key={d} className="h-1 w-1 rounded-full bg-agent-500 motion-safe:animate-bounce" style={{ animationDelay: `${d * 140}ms` }} />
        ))}
      </span>
    </p>
  );
}

// Verbatim model prose proves "real AI agents". While running it first shows a
// thinking indicator, then typewriters the prose; findings + the artifact link
// only appear once the branch is done (results land at the end).
function AgentNarrative({ narrative, running }) {
  const [thinking, setThinking] = useState(running);
  useEffect(() => {
    if (!running) {
      setThinking(false);
      return;
    }
    setThinking(true);
    const t = setTimeout(() => setThinking(false), 1600);
    return () => clearTimeout(t);
  }, [running]);

  const typing = running && !thinking;
  const { text } = useTypewriter(narrative.excerpt, { speed: 18, chunk: 3, enabled: typing });
  const shown = running ? text : narrative.excerpt;

  return (
    <div className="mt-3 rounded-lg border border-agent-200/70 bg-agent-50/60 p-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-agent-700">
        <Sparkles className="h-3 w-3" /> Agent narrative
        <span className="ml-auto font-medium normal-case tracking-normal text-agent-600/80">
          verbatim · {narrative.model} · {narrative.elapsed}
        </span>
      </div>
      {thinking ? (
        <ThinkingLine />
      ) : (
        <>
          <p className="text-[11.5px] leading-relaxed text-slate-700">
            {shown}
            {typing && <span className="ml-0.5 inline-block h-3 w-1.5 bg-agent-500 motion-safe:animate-pulse" />}
          </p>
          {!running && (
            <>
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
            </>
          )}
        </>
      )}
    </div>
  );
}

export function BranchCard({ branch, status = "done" }) {
  const running = status === "running";
  const done = status === "done";
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-night text-[11px] font-bold text-white">
            {branch.tag}
          </span>
          <span className="text-sm font-semibold text-ink">{branch.title}</span>
        </div>
        <StatusPill status={status} />
      </div>
      <ModelTags tags={branch.modelTags} />
      <div className="mt-3 space-y-1">
        {/* values populate only once the branch is done; otherwise shimmer */}
        {branch.data.map((d, i) =>
          done ? (
            <DataLine key={d.key} d={d} index={i} />
          ) : (
            <DataLineSkeleton key={d.key} keyName={d.key} index={i} />
          )
        )}
      </div>
      {branch.narrative && (running || done) && <AgentNarrative narrative={branch.narrative} running={running} />}
    </div>
  );
}
