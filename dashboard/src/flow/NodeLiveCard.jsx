import { Loader2 } from "lucide-react";
import { StatusPill, DataLine } from "../backend/parts.jsx";
import { agentTone } from "../lib/tones.js";
import ExportExcelButton from "../components/ExportExcelButton.jsx";

// Shared frosted-glass shell for the Flow Demo's "happening now" pop-up. A soft
// accent glow (violet for AI stages, indigo for native) + blur lifts it off the
// DAG; the leader line back to the node is drawn by ExecutionGraph.
export function frostShell(agentish) {
  return `relative overflow-hidden rounded-[20px] border border-white/60 bg-surface/75 backdrop-blur-xl ring-1 ${
    agentish
      ? "ring-agent-300/50 shadow-[0_28px_80px_-20px_rgba(124,58,237,0.55)]"
      : "ring-primary-300/50 shadow-[0_28px_80px_-20px_rgba(79,70,229,0.5)]"
  }`;
}

export function LiveHeader({ phase, status, agentish }) {
  return (
    <>
      {/* accent wash along the top edge */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b ${
          agentish ? "from-agent-500/10" : "from-primary-500/10"
        } to-transparent`}
      />
      <div className="relative mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`absolute h-full w-full rounded-full ${
                agentish ? "bg-agent-500" : "bg-primary-500"
              } motion-safe:animate-ping`}
            />
            <span
              className={`relative h-2.5 w-2.5 rounded-full ${agentish ? "bg-agent-600" : "bg-primary-600"}`}
            />
          </span>
          <span
            className={`text-[11px] font-bold uppercase tracking-widest ${
              agentish ? "text-agent-700" : "text-primary-700"
            }`}
          >
            Live
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            · {phase.phase}
            {phase.parallel ? " ∥" : ""}
          </span>
        </div>
        <StatusPill status={status} />
      </div>
      <div className="relative mb-3 text-lg font-semibold leading-tight tracking-tight text-ink">
        {phase.title}
      </div>
    </>
  );
}

export default function NodeLiveCard({ phase, status, agents = [] }) {
  const running = status === "running";
  const done = status === "done";
  const agentish = phase.kind === "agent" || phase.kind === "subprocess";
  const hasBranches = (phase.branches ?? []).length > 0;
  const data = (phase.data ?? []).slice(0, 4);

  return (
    <div className={`${hasBranches ? "w-[32rem]" : "w-[23rem]"} ${frostShell(agentish)} p-5`}>
      <LiveHeader phase={phase} status={status} agentish={agentish} />

      {/* streaming agent activity — the "process happening" */}
      <div className="relative mb-3 min-h-[52px] space-y-1 rounded-xl border border-white/50 bg-white/55 p-2.5 font-mono text-[12px]">
        {agents.length === 0 ? (
          <div className={`flex items-center gap-1.5 ${agentish ? "text-agent-600" : "text-primary-600"}`}>
            <Loader2 className="h-3.5 w-3.5 motion-safe:animate-spin" strokeWidth={2.5} />
            {running ? "working…" : "queued"}
          </div>
        ) : (
          agents.slice(-3).map((a, i) => (
            <div key={`${agents.length}-${i}`} className="flex flex-wrap items-baseline gap-x-1 animate-fade-in">
              <span className="text-slate-500">{a.actor}</span>
              <span className="text-slate-300">→</span>
              <span className={`font-medium ${agentTone[a.tone] ?? "text-ink"}`}>{a.action}</span>
              {a.detail && <span className="truncate text-slate-400">· {a.detail}</span>}
            </div>
          ))
        )}
      </div>

      {/* results landing */}
      {hasBranches ? (
        <div className="relative grid grid-cols-2 gap-2.5">
          {phase.branches.map((br) => (
            <div key={br.id} className="rounded-xl border border-white/50 bg-white/50 p-2.5">
              <div className="mb-1.5 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-ink">
                  <span className="rounded bg-night px-1.5 py-px text-[9px] text-white">{br.tag}</span>
                  {br.title}
                </div>
                {(br.id === "banking" || br.id === "bureau") && (
                  <ExportExcelButton branchId={br.id} small />
                )}
              </div>
              <div className="space-y-0.5">
                {(br.data ?? []).slice(0, 3).map((d, i) => (
                  <DataLine key={d.key} d={d} index={done ? i : null} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        data.length > 0 && (
          <div className="relative space-y-1">
            {data.map((d, i) => (
              <DataLine key={d.key} d={d} index={done ? i : null} />
            ))}
          </div>
        )
      )}

      {phase.presenterNote && (
        <p className="relative mt-3 border-t border-white/60 pt-2.5 text-[12px] leading-relaxed text-slate-500">
          {phase.presenterNote}
        </p>
      )}
    </div>
  );
}
