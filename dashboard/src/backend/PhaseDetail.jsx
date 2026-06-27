import { useEffect, useState } from "react";
import { AlertTriangle, Boxes, Cpu, FileText, Phone } from "lucide-react";
import { StatusPill, ModelTags, DataLine, BranchCard } from "./parts.jsx";
import { agentTone } from "../lib/tones.js";
import PhaseViz from "./PhaseViz.jsx";

// Tele PD: the fixed questions asked on the officer call, shown as a Q → A
// table, with the captured deviation reasons called out separately (they feed
// the decision). All placeholder — captured on a human call, not the pipeline.
function TelePdQA({ phase }) {
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
              <th className="px-3 py-2 text-left font-semibold">Question</th>
              <th className="px-3 py-2 text-left font-semibold">Answer</th>
            </tr>
          </thead>
          <tbody>
            {phase.questions.map((q) => (
              <tr key={q.id} className="border-t border-slate-100 align-top">
                <td className="px-3 py-2 text-slate-500">
                  {q.q}
                  {q.note && <span className="ml-1 text-[10px] italic text-slate-400">· {q.note}</span>}
                </td>
                <td className={`px-3 py-2 font-medium ${q.tone === "caution" ? "text-caution-700" : "text-ink"}`}>
                  {q.answer}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {phase.deviationReasons?.length > 0 && (
        <div className="rounded-xl border border-caution-200/70 bg-caution-50/40 p-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-caution-700">
            <AlertTriangle className="h-3 w-3" /> Reasons for deviations · folded into Decision
          </div>
          <ul className="space-y-1">
            {phase.deviationReasons.map((d, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[12px] text-slate-700">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-caution-500" /> {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Phone className="h-3 w-3 text-agent-600" /> Structured Voice PD · Kotak Internal Agentic LLM
        </span>
        {phase.ctcDocument && (
          <span className="inline-flex items-center gap-1">
            <FileText className="h-3 w-3 text-slate-400" /> CTC document · {phase.ctcDocument}
          </span>
        )}
      </div>
    </div>
  );
}

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

// Viz stays pinned (it's the executive artifact); the tables sit behind tabs so
// nothing needs scrolling mid-presentation. The LLM phase defaults to its
// agent calls, native phases to their data contribution.
export default function PhaseDetail({ phase, status }) {
  const branchAgents = (phase.branches ?? []).flatMap((br) => br.agents);
  const agents = [...branchAgents, ...phase.agents];
  const hasData = phase.parallel || phase.data.length > 0;
  const warnings = phase.warnings ?? [];

  // Tele PD leads with its Q&A table; the parallel phase's BranchCards carry the
  // streaming agent narratives — the demo's proof moment — so "Analysers" leads
  // there too.
  const isTelePd = phase.questions?.length > 0;
  const defaultTab = isTelePd ? "qa" : hasData ? "data" : "agents";
  const [tab, setTab] = useState(defaultTab);
  useEffect(() => setTab(defaultTab), [phase.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const tabs = [
    isTelePd && { id: "qa", label: `Q&A (${phase.questions.length})` },
    hasData && { id: "data", label: phase.parallel ? "Analysers" : "Data" },
    { id: "agents", label: `Agent calls (${agents.length})` },
    warnings.length > 0 && { id: "warnings", label: `Warnings (${warnings.length})` },
  ].filter(Boolean);

  // `setTab` runs in an effect, so for one render after the phase changes `tab`
  // can still point at the previous phase's tab (e.g. "qa" on a non-Tele-PD
  // phase). Fall back to the default so we never render content for a tab this
  // phase doesn't have.
  const activeTab = tabs.some((t) => t.id === tab) ? tab : defaultTab;

  return (
    <div key={phase.id} className="rounded-2xl border border-slate-200 bg-surface p-5 shadow-sm sm:p-6 animate-fade-up">
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
            {phase.modelTags?.[0] && (
              <div className="mb-0.5 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-primary-700">
                <Cpu className="h-3.5 w-3.5" /> {phase.modelTags[0]}
              </div>
            )}
            <div className="text-base font-semibold text-ink">{phase.title}</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wide text-slate-400">{phase.phase}</span>
              {phase.parallel && (
                <span className="rounded border border-caution-200 bg-caution-50 px-1.5 py-px text-[10px] font-semibold text-caution-700">
                  ∥ PARALLEL
                </span>
              )}
              <span className="rounded border border-slate-200 px-1.5 py-px text-[10px] font-medium text-slate-500">
                {phase.kind}
              </span>
              <span>· {phase.subtitle}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusPill status={status} />
          {phase.elapsed && <span className="text-[10px] tabular-nums text-slate-400">{phase.elapsed}</span>}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <ModelTags tags={phase.modelTags?.slice(1)} />

        <PhaseViz phaseId={phase.id} status={status} />

        <div>
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                  activeTab === t.id
                    ? t.id === "warnings"
                      ? "bg-caution-700 text-white"
                      : "bg-primary-600 text-white"
                    : "text-slate-500 hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-3">
            {activeTab === "qa" && isTelePd && <TelePdQA phase={phase} />}

            {activeTab === "data" &&
              (phase.parallel ? (
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {phase.branches.map((br) => (
                    <BranchCard key={br.id} branch={br} status={status} />
                  ))}
                </div>
              ) : (
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
              ))}

            {activeTab === "agents" && (
              <div className="space-y-1.5">
                {agents.map((a, i) => (
                  <AgentRow key={i} a={a} index={i} />
                ))}
              </div>
            )}

            {activeTab === "warnings" && (
              <div className="space-y-1 rounded-lg bg-caution-50 p-3">
                {warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-caution-700">
                    <AlertTriangle className="mt-px h-3 w-3 flex-shrink-0" /> {w}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
