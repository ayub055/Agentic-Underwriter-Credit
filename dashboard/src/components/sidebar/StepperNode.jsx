import { Check } from "lucide-react";

export default function StepperNode({ label, state, isLast }) {
  const done = state === "done";
  const current = state === "current";

  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      {!isLast && (
        <span
          className={`absolute left-[15px] top-7 h-[calc(100%-1.25rem)] w-px ${
            done ? "bg-primary-600" : "bg-slate-200"
          }`}
        />
      )}
      <span
        className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border ${
          done
            ? "border-primary-700 bg-primary-700 text-white"
            : current
            ? "border-primary-600 bg-white ring-2 ring-primary-600/30"
            : "border-slate-300 bg-white"
        }`}
      >
        {done ? (
          <Check className="h-4 w-4" strokeWidth={2.5} />
        ) : current ? (
          <span className="h-2 w-2 rounded-full bg-primary-600 motion-safe:animate-pulse" />
        ) : (
          <span className="h-2 w-2 rounded-full bg-slate-300" />
        )}
      </span>
      <div className="pt-1.5">
        <div
          className={`text-sm font-medium ${
            done ? "text-ink" : current ? "text-primary-700" : "text-slate-400"
          }`}
        >
          {label}
        </div>
        <div className="text-xs text-slate-400">
          {done ? "Completed" : current ? "In progress" : "Pending"}
        </div>
      </div>
    </li>
  );
}
