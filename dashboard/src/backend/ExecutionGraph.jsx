import {
  BadgeCheck,
  BarChart3,
  BellRing,
  Check,
  Cpu,
  FileText,
  GitMerge,
  Inbox,
  Calculator,
  MapPinned,
  Scale,
  ShieldCheck,
  Stamp,
  Wallet,
} from "lucide-react";
import { VIZ } from "./phaseModel.js";

// The execution DAG, drawn to scale with the real architecture: Intake (three
// sub-steps — Karza API, KYC API, Address Agent) fans out into two isolated
// analyser subprocesses (Bureau ∥ Banking), folds back through the sufficiency
// gate, then runs the deterministic native stages. Data packets animate along
// whichever edges are live at the playback cursor. Tone: indigo = done, violet =
// working.

const W = 1000;
const H = 252;

const sec = (s) => (s == null ? "" : `${Math.round(s * 10) / 10}s`);

// The three sub-steps that make up Intake (P1), rendered as small chips.
const INTAKE_SUBPHASES = [
  { id: "karza_api", label: "Karza API", icon: ShieldCheck },
  { id: "kyc_api", label: "KYC API", icon: BadgeCheck },
  { id: "address_agent", label: "Address Agent", icon: MapPinned, sub: VIZ.address.score != null ? `${VIZ.address.score}/100` : "" },
];

// phase: index into PHASES/statuses that drives this node's state.
const NODES = [
  { id: "form", phase: 0, x: 40, y: 110, icon: FileText, tag: "P0", label: "Application", labelPos: "below" },
  { id: "intake", phase: 1, x: 148, y: 110, icon: Inbox, tag: "P1", label: "Intake", labelPos: "below", subPhases: INTAKE_SUBPHASES },
  { id: "bureau", phase: 2, x: 308, y: 56, icon: BarChart3, tag: "2A", label: "Bureau Agent", sub: sec(VIZ.branches[0].elapsed), llm: true, labelPos: "above" },
  { id: "banking", phase: 2, x: 308, y: 196, icon: Wallet, tag: "2B", label: "Banking Agent", sub: sec(VIZ.branches[1].elapsed), llm: true, labelPos: "below" },
  { id: "gate", phase: 2, x: 462, y: 126, icon: GitMerge, tag: "Σ", label: "Fold · Gate", labelPos: "below", small: true },
  { id: "ml", phase: 3, x: 584, y: 126, icon: Cpu, tag: "P3", label: "ML Scorecard", labelPos: "below" },
  { id: "policy", phase: 4, x: 700, y: 126, icon: Scale, tag: "P4", label: "Policy L1–L6", labelPos: "below" },
  { id: "decision", phase: 5, x: 806, y: 126, icon: Calculator, tag: "P5", label: "Decision", labelPos: "below" },
  { id: "finalize", phase: 6, x: 894, y: 126, icon: Stamp, tag: "P6", label: "Finalize", labelPos: "below" },
  { id: "notify", phase: 7, x: 966, y: 126, icon: BellRing, tag: "P7", label: "Notify", labelPos: "below", small: true },
];

// Each edge lights up with the phase that pulls data across it.
const EDGES = [
  { id: "e-fi", phase: 1, d: "M 66 110 L 122 110" },
  { id: "e-ib", phase: 2, d: "M 174 100 C 230 84, 250 56, 280 56" },
  { id: "e-ik", phase: 2, d: "M 174 120 C 230 150, 250 196, 280 196" },
  { id: "e-bg", phase: 2, d: "M 336 56 C 395 56, 415 104, 440 118" },
  { id: "e-kg", phase: 2, d: "M 336 196 C 395 196, 415 148, 440 134" },
  { id: "e-gm", phase: 3, d: "M 483 126 L 557 126" },
  { id: "e-mp", phase: 4, d: "M 611 126 L 673 126" },
  { id: "e-pd", phase: 5, d: "M 727 126 L 779 126" },
  { id: "e-df", phase: 6, d: "M 833 126 L 867 126" },
  { id: "e-fn", phase: 7, d: "M 921 126 L 944 126" },
];

const EDGE_STROKE = {
  waiting: { stroke: "#e2e8f0", dash: "4 5", width: 1.5, opacity: 1 },
  running: { stroke: "#7c3aed", dash: "none", width: 2, opacity: 0.9 },
  done: { stroke: "#6366f1", dash: "none", width: 2, opacity: 0.55 },
};

function Packet({ pathId, begin }) {
  return (
    <circle r="3.2" fill="#7c3aed" opacity="0.9">
      <animateMotion dur="1.2s" begin={begin} repeatCount="indefinite">
        <mpath href={`#${pathId}`} />
      </animateMotion>
    </circle>
  );
}

function Node({ node, status, selected, onSelect }) {
  const Icon = node.icon;
  const done = status === "done";
  const running = status === "running";
  const box = node.small ? "h-10 w-10 rounded-lg" : "h-12 w-12 rounded-xl";

  return (
    <button
      onClick={onSelect}
      style={{ left: `${(node.x / W) * 100}%`, top: `${(node.y / H) * 100}%` }}
      className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
      aria-label={`${node.label} — ${status}`}
    >
      {/* Hover affordance: clicking nodes is the main interaction, make it obvious. */}
      <span
        className={`pointer-events-none absolute left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[9px] font-medium text-white group-hover:block ${
          node.labelPos === "above" ? "top-full mt-2" : "bottom-full mb-2"
        }`}
      >
        View details
      </span>
      <span
        className={`relative flex ${box} items-center justify-center border transition-all duration-300 group-hover:-translate-y-0.5 ${
          done
            ? "border-primary-200 bg-primary-50 text-primary-700"
            : running
            ? "border-agent-500 bg-agent-50 text-agent-700 shadow-[0_0_18px_rgba(124,58,237,.30)]"
            : "border-slate-200 bg-white text-slate-300"
        } ${selected ? "ring-2 ring-primary-600 ring-offset-2" : "group-hover:border-slate-300 group-hover:shadow-md"}`}
      >
        <Icon className={node.small ? "h-4 w-4" : "h-5 w-5"} strokeWidth={2} />
        {done && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-700 text-white animate-pop">
            <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
          </span>
        )}
        {running && (
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-agent-500 motion-safe:animate-ping" />
        )}
        {node.llm && (
          <span className="absolute -bottom-1.5 -right-2 rounded border border-agent-200 bg-agent-50 px-1 text-[8px] font-bold tracking-wide text-agent-700">
            LLM
          </span>
        )}
      </span>
      <span
        className={`absolute left-1/2 w-24 -translate-x-1/2 text-center leading-tight ${
          node.labelPos === "above" ? "bottom-full mb-1.5" : "top-full mt-1.5"
        }`}
      >
        <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-400">
          {node.tag}
        </span>
        <span
          className={`block text-[11px] font-medium ${
            selected ? "font-semibold text-ink" : done || running ? "text-ink" : "text-slate-400"
          }`}
        >
          {node.label}
        </span>
        {node.sub && <span className="block text-[9px] tabular-nums text-slate-400">{node.sub}</span>}
      </span>
      {node.subPhases && (
        <span className="absolute left-1/2 top-full mt-10 w-32 -translate-x-1/2 space-y-1">
          {node.subPhases.map((sp) => {
            const SubIcon = sp.icon;
            return (
              <span
                key={sp.id}
                className={`flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-medium ${
                  done
                    ? "border-primary-100 bg-primary-50/70 text-primary-700"
                    : running
                    ? "border-agent-200 bg-agent-50 text-agent-700"
                    : "border-slate-200 bg-slate-50 text-slate-400"
                }`}
              >
                <SubIcon className="h-2.5 w-2.5 flex-shrink-0" strokeWidth={2} />
                <span className="truncate">{sp.label}</span>
                {sp.sub && <span className="ml-auto tabular-nums text-primary-600">{sp.sub}</span>}
              </span>
            );
          })}
        </span>
      )}
    </button>
  );
}

export default function ExecutionGraph({ statuses, selected, onSelect, footer }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="overflow-x-auto py-3">
        {/* Coordinates live in a 1000×252 space; the wrapper scales it to fill
            the card (and the presentation wall) while keeping the aspect ratio. */}
        <div className="relative mx-auto w-full min-w-[860px]" style={{ aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
          {EDGES.map((e) => {
            const s = EDGE_STROKE[statuses[e.phase]] ?? EDGE_STROKE.waiting;
            return (
              <g key={e.id}>
                <path
                  id={e.id}
                  d={e.d}
                  fill="none"
                  stroke={s.stroke}
                  strokeOpacity={s.opacity}
                  strokeWidth={s.width}
                  strokeDasharray={s.dash === "none" ? undefined : s.dash}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
                {statuses[e.phase] === "running" && (
                  <>
                    <Packet pathId={e.id} begin="0s" />
                    <Packet pathId={e.id} begin="0.6s" />
                  </>
                )}
              </g>
            );
          })}
        </svg>
        {NODES.map((n) => (
          <Node
            key={n.id}
            node={n}
            status={statuses[n.phase]}
            selected={selected === n.phase}
            onSelect={() => onSelect(n.phase)}
          />
        ))}
        <span className="absolute left-[30.8%] top-[46.8%] -translate-x-1/2 rounded border border-caution-200 bg-caution-50 px-1.5 py-px text-[9px] font-bold tracking-widest text-caution-700">
          ∥ PARALLEL
        </span>
        </div>
      </div>
      {footer && <div className="mt-1 border-t border-slate-100 px-2 pb-1 pt-2.5">{footer}</div>}
    </div>
  );
}
