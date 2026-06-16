import { TrendingUp, CalendarClock, ArrowRight } from "lucide-react";

export default function AlternativeOptions() {
  return (
    <div className="mt-6">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Ways forward
      </h2>

      <div className="mt-3 space-y-3">
        <button className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-surface p-4 text-left transition hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-caution-50 text-caution-700">
            <TrendingUp className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-medium text-ink">Build your credit score</span>
            <span className="block text-xs text-slate-500">
              Free tools and tips to strengthen your profile over the next few months.
            </span>
          </span>
          <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
        </button>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-surface p-4">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-caution-50 text-caution-700">
            <CalendarClock className="h-4 w-4" strokeWidth={2} />
          </span>
          <div>
            <div className="text-sm font-medium text-ink">Re-apply in 90 days</div>
            <div className="text-xs text-slate-500">
              We'll keep your details on file so re-applying is quick and simple.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
