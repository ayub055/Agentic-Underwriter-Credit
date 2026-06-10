export default function CountdownTimer({ label, isExpired }) {
  return (
    <div className="inline-flex flex-col items-center">
      <div className="text-3xl font-semibold tabular-nums text-progress-600">
        {isExpired ? "00:00" : label}
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
        {isExpired ? "Finalizing" : "Estimated time remaining"}
      </div>
    </div>
  );
}
