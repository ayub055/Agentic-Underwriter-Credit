import { MessageSquareText } from "lucide-react";
import FaqAccordion from "./FaqAccordion.jsx";

export default function SupportWidget({ onChat }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-surface p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Support
      </h2>
      <button
        onClick={onChat}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary-600/30 bg-primary-50 px-4 py-3 text-sm font-medium text-primary-700 transition hover:bg-primary-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
      >
        <MessageSquareText className="h-4 w-4" strokeWidth={2} />
        Chat with a Loan Expert
      </button>
      <div className="mt-4">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Frequently asked
        </h3>
        <FaqAccordion />
      </div>
    </div>
  );
}
