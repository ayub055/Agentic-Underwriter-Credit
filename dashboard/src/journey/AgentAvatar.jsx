import { Sparkles } from "lucide-react";

export default function AgentAvatar({ thinking = false, size = "md" }) {
  const dims = size === "sm" ? "h-7 w-7 rounded-lg" : "h-9 w-9 rounded-xl";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <span
      className={`flex ${dims} flex-shrink-0 items-center justify-center bg-gradient-to-br from-agent-500 to-primary-600 text-white shadow-sm ${
        thinking ? "motion-safe:animate-pulse-ring" : ""
      }`}
      aria-hidden="true"
    >
      <Sparkles className={icon} strokeWidth={2.2} />
    </span>
  );
}
