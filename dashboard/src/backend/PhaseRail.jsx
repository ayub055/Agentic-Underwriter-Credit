import { Fragment } from "react";
import { Check, Boxes } from "lucide-react";

function Connector({ active }) {
  return (
    <div className="relative mt-5 h-0.5 min-w-[24px] flex-1 self-start rounded-full bg-slate-200">
      <div className={`absolute inset-0 rounded-full ${active ? "bg-primary-400" : "bg-slate-200"}`} />
      {active && (
        <span className="absolute top-1/2 h-2 w-2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-primary-500 shadow-[0_0_8px] shadow-primary-500/50 motion-safe:animate-flow" />
      )}
    </div>
  );
}

function Node({ phase, status, selected, onSelect, index }) {
  const done = status === "done";
  const running = status === "running";

  return (
    <button
      onClick={onSelect}
      className="flex w-[116px] flex-shrink-0 flex-col items-center text-center focus:outline-none"
    >
      <span
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition ${
          done
            ? "bg-success-50 text-success-700"
            : running
            ? "bg-primary-600 text-white"
            : "bg-slate-100 text-slate-400"
        } ${selected ? "ring-2 ring-primary-600 ring-offset-2" : ""}`}
      >
        {done ? (
          <Check className="h-5 w-5" strokeWidth={3} />
        ) : phase.kind === "subprocess" ? (
          <Boxes className="h-5 w-5" />
        ) : (
          index + 1
        )}
        {running && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary-500 motion-safe:animate-ping" />
        )}
      </span>
      <span className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {phase.phase}
      </span>
      <span className={`text-xs leading-tight ${selected ? "font-semibold text-ink" : "font-medium text-slate-500"}`}>
        {phase.title}
      </span>
      {phase.parallel && (
        <span className="mt-0.5 rounded bg-caution-50 px-1.5 py-px text-[9px] font-semibold text-caution-700">
          ∥ 2A · 2B
        </span>
      )}
      {phase.subPhases && (
        <span className="mt-1 flex flex-col gap-0.5">
          {phase.subPhases.map((sp) => (
            <span
              key={sp.id}
              className="rounded border border-slate-200 bg-slate-50 px-1.5 py-px text-[9px] font-medium text-slate-500"
            >
              {sp.label}
            </span>
          ))}
        </span>
      )}
    </button>
  );
}

export default function PhaseRail({ phases, statuses, selected, onSelect }) {
  return (
    <div className="flex items-start gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 sm:gap-2">
      {phases.map((phase, i) => (
        <Fragment key={phase.id}>
          <div className="relative">
            <Node
              phase={phase}
              status={statuses[i]}
              selected={selected === i}
              onSelect={() => onSelect(i)}
              index={i}
            />
          </div>
          {i < phases.length - 1 && <Connector active={statuses[i] === "done"} />}
        </Fragment>
      ))}
    </div>
  );
}
