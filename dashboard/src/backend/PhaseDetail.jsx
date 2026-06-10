import { AlertTriangle, Boxes } from "lucide-react";
import { StatusPill, ModelTags, DataLine, BranchCard } from "./parts.jsx";
import { agentTone } from "./tones.js";
import PhaseViz from "./PhaseViz.jsx";

function AgentRow({ a, index }) {
  return (
    <div
      className="flex flex-wrap items-baseline gap-x-1.5 font-mono text-[12px] animate-fade-in"
      style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
    >
      <span className="text-slate-600">{a.actor}</span>
      <span className="text-slate-400">→</span>
      <span className={`font-medium ${agentTone[a.tone] ?? "text-ink"}`}>{a.action}</span>
      {a.detail && <span className="text-slate-400">· {a.detail}</span>}
    </div>
  );
}

export default function PhaseDetail({ phase, status }) {
  const branchAgents = (phase.branches ?? []).flatMap((br) => br.agents);
  const agents = [...branchAgents, ...phase.agents];

  return (
    <div key={phase.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 animate-fade-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors ${
              status === "done"
                ? "bg-success-50 text-success-700 ring-1 ring-success-200"
                : status === "running"
                ? "bg-agent-600 text-white shadow-[0_0_18px_rgba(124,58,237,.30)]"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {phase.kind === "subprocess" ? <Boxes className="h-5 w-5" /> : phase.phase.split(" ")[1]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {phase.phase}
              </span>
              {phase.parallel && (
                <span className="rounded border border-caution-200 bg-caution-50 px-1.5 py-px text-[10px] font-semibold text-caution-700">
                  ∥ PARALLEL
                </span>
              )}
              <span className="rounded border border-slate-200 px-1.5 py-px text-[10px] font-medium text-slate-500">
                {phase.kind}
              </span>
            </div>
            <div className="text-base font-semibold text-ink">{phase.title}</div>
            <div className="text-xs text-slate-500">{phase.subtitle}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusPill status={status} />
          {phase.elapsed && <span className="text-[10px] tabular-nums text-slate-400">{phase.elapsed}</span>}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <ModelTags tags={phase.modelTags} />

        {phase.parallel ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {phase.branches.map((br) => (
              <BranchCard key={br.id} branch={br} />
            ))}
          </div>
        ) : (
          phase.data.length > 0 && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Case-dict contribution
              </div>
              <div className="space-y-1">
                {phase.data.map((d) => (
                  <DataLine key={d.key} d={d} />
                ))}
              </div>
            </div>
          )
        )}

        <PhaseViz phaseId={phase.id} status={status} />

        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Agent calls
          </div>
          <div className="space-y-1.5">
            {agents.map((a, i) => (
              <AgentRow key={i} a={a} index={i} />
            ))}
          </div>
        </div>

        {phase.warnings?.length > 0 && (
          <div className="space-y-1 rounded-lg bg-caution-50 p-3">
            {phase.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px] text-caution-700">
                <AlertTriangle className="mt-px h-3 w-3 flex-shrink-0" /> {w}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
