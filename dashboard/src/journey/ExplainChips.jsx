import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useTypewriter } from "../lib/motion.js";

// Conversational moment: tappable questions the agent answers inline, so the
// user can interrogate the decision without leaving the screen.
export default function ExplainChips({ items }) {
  const [open, setOpen] = useState(-1);
  const active = open >= 0 ? items[open] : null;
  const typed = useTypewriter(active?.a ?? "", { enabled: open >= 0 });

  return (
    <div className="mt-6">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        Ask the agent
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item, i) => (
          <button
            key={item.q}
            onClick={() => setOpen(open === i ? -1 : i)}
            aria-expanded={open === i}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              open === i
                ? "border-agent-500 bg-agent-500 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-agent-300 hover:text-agent-700"
            } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-agent-500`}
          >
            {item.q}
          </button>
        ))}
      </div>
      {active && (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-agent-200/60 bg-agent-50 p-3.5 animate-fade-in">
          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-agent-600" strokeWidth={2.2} />
          <p aria-live="polite" className="text-sm leading-relaxed text-slate-700">
            {typed.text}
          </p>
        </div>
      )}
    </div>
  );
}
