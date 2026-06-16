import { useEffect, useRef } from "react";
import { Terminal, Database } from "lucide-react";
import { consoleTone } from "../lib/tones.js";

function AgentCallLog({ entries }) {
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [entries.length]);

  return (
    <div className="flex min-h-0 flex-[3] flex-col">
      <div className="mb-2 flex flex-shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary-100/80">
        <Terminal className="h-3.5 w-3.5" /> Agent Call Log
      </div>
      <div className="min-h-[120px] flex-1 overflow-y-auto rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-[12px] leading-relaxed">
        {entries.length === 0 && <span className="text-slate-500">// awaiting orchestration…</span>}
        {entries.map((e, i) => (
          <div key={i} className="flex gap-2 animate-fade-in">
            <span className="text-slate-600">{e.time}</span>
            <span className="text-slate-500">{e.phase}</span>
            <span className="flex-1">
              <span className="text-slate-300">{e.agent.actor}</span>
              <span className="text-slate-500"> → </span>
              <span className={consoleTone[e.agent.tone] ?? "text-slate-200"}>{e.agent.action}</span>
              {e.agent.detail && <span className="text-slate-500"> · {e.agent.detail}</span>}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}

function CaseDictPanel({ dict }) {
  const keys = Object.keys(dict);
  const prevKeys = useRef(new Set());
  const isNew = (k) => !prevKeys.current.has(k);
  useEffect(() => {
    prevKeys.current = new Set(keys);
  });

  return (
    <div className="mt-4 flex min-h-0 flex-[2] flex-col">
      <div className="mb-2 flex flex-shrink-0 items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-primary-100/80">
        <span className="flex items-center gap-2">
          <Database className="h-3.5 w-3.5" /> Live Case Dict
        </span>
        <span className="text-slate-500">{keys.length} keys</span>
      </div>
      {keys.length > 0 && (
        <div className="mb-2 flex max-h-12 flex-shrink-0 flex-wrap gap-1 overflow-y-auto">
          {keys.map((k) => (
            <span
              key={k}
              className={`rounded border px-1.5 py-px font-mono text-[10px] transition-colors ${
                isNew(k)
                  ? "border-agent-400 bg-agent-500/25 text-agent-200 animate-fade-up"
                  : "border-white/10 bg-white/5 text-slate-400"
              }`}
            >
              {k}
            </span>
          ))}
        </div>
      )}
      <pre className="min-h-0 flex-1 overflow-auto rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-progress-200">
        {keys.length === 0 ? "// {}" : JSON.stringify(dict, null, 2)}
      </pre>
    </div>
  );
}

export default function BackendConsole({ entries, dict }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-night p-4 text-slate-200 shadow-sm">
      <div className="mb-3 flex flex-shrink-0 items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-2 text-[11px] font-medium text-slate-400">journey-runtime · live</span>
      </div>
      <AgentCallLog entries={entries} />
      <CaseDictPanel dict={dict} />
    </div>
  );
}
