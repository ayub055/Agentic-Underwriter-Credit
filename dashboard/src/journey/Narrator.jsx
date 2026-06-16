import { ArrowRight } from "lucide-react";
import AgentAvatar from "./AgentAvatar.jsx";
import { useTypewriter } from "../lib/motion.js";

function ThinkingDots() {
  return (
    <span className="ml-1 inline-flex items-baseline gap-0.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1 w-1 rounded-full bg-agent-500 motion-safe:animate-bounce"
          style={{ animationDelay: `${i * 140}ms` }}
        />
      ))}
    </span>
  );
}

// The agent's voice: one persistent panel that narrates the whole journey —
// greeting, per-moment commentary, then the outcome + next best action.
export default function Narrator({ text, thinking = false, nextAction = null }) {
  const typed = useTypewriter(text, { speed: 36, chunk: 1 });

  return (
    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-agent-200/70 bg-gradient-to-br from-agent-50 to-surface p-4 shadow-sm sm:p-5">
      <AgentAvatar thinking={thinking} />
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="text-micro font-semibold uppercase tracking-widest text-agent-600">
          Kotak AI · Underwriting Agent
        </div>
        <p aria-live="polite" className="mt-1.5 text-[15px] leading-relaxed text-ink sm:text-base">
          {typed.text}
          {thinking && typed.done && <ThinkingDots />}
        </p>
        {nextAction && typed.done && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-agent-700 ring-1 ring-agent-200 animate-fade-up">
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
            {nextAction}
          </div>
        )}
      </div>
    </div>
  );
}
