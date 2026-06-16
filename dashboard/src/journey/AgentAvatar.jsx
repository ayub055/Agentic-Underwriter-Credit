// The agent's "presence": a soft glassy orb with a specular highlight and a
// breathing aura that intensifies while thinking and settles when done.
// Calm by design (slow breathe, gated by motion-safe), not a spinner.
export default function AgentAvatar({ thinking = false, size = "md" }) {
  const dims = size === "sm" ? "h-7 w-7" : "h-10 w-10";
  return (
    <span className={`relative flex ${dims} flex-shrink-0 items-center justify-center`} aria-hidden="true">
      <span
        className={`absolute inset-0 rounded-full bg-agent-500/30 blur-md ${
          thinking ? "motion-safe:animate-[pulse_2.4s_ease-in-out_infinite]" : "opacity-40"
        }`}
      />
      <span className="relative h-full w-full rounded-full bg-gradient-to-br from-agent-400 via-agent-500 to-primary-600 shadow-md">
        <span className="absolute left-[22%] top-[18%] h-1/3 w-1/3 rounded-full bg-white/45 blur-[2px]" />
      </span>
    </span>
  );
}
