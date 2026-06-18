import {
  Briefcase,
  Car,
  CheckCircle2,
  Home,
  Loader2,
  Phone,
  Target,
  Users,
  Wallet,
} from "lucide-react";
import caseState from "../data/realRun/caseState.json";

// Compact Tele PD call callout, anchored below the floating Tele PD node. One
// question is spotlighted (being asked) at a time; as each is answered it drops
// into the list box below. Pace synced to the Tele PD stage playback (0..1).
const ICONS = {
  income: Wallet,
  dependents: Users,
  residence: Home,
  earners: Briefcase,
  purpose: Target,
  vehicle: Car,
};

const QUESTIONS = (caseState.tele_pd?.questions ?? []).map((q) => ({
  ...q,
  icon: ICONS[q.id] ?? Phone,
}));

export default function TelePdCallout({ progress = 0 }) {
  const total = QUESTIONS.length;
  const done = Math.min(Math.floor(Math.max(progress, 0) * total), total);
  const current = done < total ? QUESTIONS[done] : null;
  const CurIcon = current?.icon;
  const answered = QUESTIONS.slice(0, done);

  return (
    <div className="w-80 rounded-xl border border-slate-200 bg-surface p-3 shadow-xl">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        <Phone className="h-3 w-3 text-progress-600" strokeWidth={2.5} />
        Tele PD · asking
        <span className="ml-auto tabular-nums text-slate-400">
          {done}/{total}
        </span>
      </div>

      {/* focal: the question currently being asked */}
      <div className="flex items-start gap-2 rounded-lg bg-progress-50/70 px-2 py-1.5">
        {current ? (
          <div key={current.id} className="flex items-start gap-2 animate-fade-up">
            <span className="mt-px flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-surface text-progress-600 ring-1 ring-progress-200">
              <CurIcon className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="leading-tight">
              <div className="text-xs font-semibold text-ink">{current.q}</div>
              <div className="flex items-center gap-1 text-[10px] text-progress-600">
                <Loader2 className="h-3 w-3 motion-safe:animate-spin" strokeWidth={2.5} /> Asking…
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-success-700 animate-fade-up">
            <CheckCircle2 className="h-4 w-4" strokeWidth={2.2} />
            <span className="text-xs font-semibold">All questions captured</span>
          </div>
        )}
      </div>

      {/* the box: answered questions accumulate here as Q → A rows */}
      <div className="mt-2 max-h-28 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/60 p-1.5">
        {answered.length === 0 ? (
          <span className="text-[10px] italic text-slate-400">answers collect here…</span>
        ) : (
          answered.map((q) => (
            <div
              key={q.id}
              className="flex items-baseline gap-1.5 text-[10px] leading-snug animate-fade-up"
            >
              <span className="font-medium text-slate-500">{q.q.split(" (")[0]}</span>
              <span className="text-slate-300">·</span>
              <span className={q.tone === "caution" ? "font-medium text-caution-700" : "text-ink"}>
                {q.answer}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
