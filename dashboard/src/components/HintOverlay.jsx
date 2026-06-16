import { MousePointerClick, Keyboard, BadgeCheck, X } from "lucide-react";

const HINTS = [
  {
    icon: MousePointerClick,
    title: "Click any node",
    body: "Every box in the execution graph opens that phase's data, agent calls and visualisation.",
  },
  {
    icon: Keyboard,
    title: "Keyboard",
    body: "Space play/pause · ←/→ scrub · R reset · S skip to end · ? reopens this help.",
  },
  {
    icon: BadgeCheck,
    title: "Nothing is invented",
    body: "Pills tag every field's provenance — real, derived, mock or placeholder. Click the provenance legend for the full map.",
  },
];

export default function HintOverlay({ open, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-night/40 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-label="How to explore this demo"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-surface p-6 shadow-xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="text-base font-semibold text-ink">Exploring the agentic journey</div>
            <div className="text-xs text-slate-500">A real captured run — poke at everything.</div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-ink" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3.5">
          {HINTS.map((h) => {
            const Icon = h.icon;
            return (
              <div key={h.title} className="flex items-start gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-ink">{h.title}</div>
                  <div className="text-xs leading-relaxed text-slate-500">{h.body}</div>
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
