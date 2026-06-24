import { ArrowRight, Sparkles } from "lucide-react";
import realRunCaseState from "../../data/realRun/caseState.json";
import { mapCaseStateToView } from "../../data/mapCaseState.js";
import ApprovedCard from "../../components/states/ApprovedCard.jsx";
import ReviewCard from "../../components/states/ReviewCard.jsx";
import RejectedCard from "../../components/states/RejectedCard.jsx";
import SupportWidget from "../../components/sidebar/SupportWidget.jsx";

const CARDS = { approved: ApprovedCard, review: ReviewCard, rejected: RejectedCard };

// Finale chapter 2 — the customer-facing payoff. The same captured decision, but
// the way the applicant actually experiences it: a clear answer and a path
// forward, none of the machinery. Boundary CTAs are demo edges (no-ops here).
export default function CustomerChapter({ onAdvance }) {
  const view = mapCaseStateToView(realRunCaseState);
  const StateCard = CARDS[view.status] ?? ReviewCard;
  const noop = () => {};

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-agent-200/70 bg-agent-50/50 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-agent-600 text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-agent-700">
              Customer view · application {view.applicationId}
            </div>
            <div className="text-sm text-slate-600">
              What the applicant sees the instant the agent decides.
            </div>
          </div>
        </div>
        {onAdvance && (
          <button
            onClick={onAdvance}
            className="flex items-center gap-1.5 rounded-lg bg-agent-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-agent-700"
          >
            See the credit memo <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="animate-fade-up lg:col-span-2">
          <StateCard view={view} onAcceptOffer={noop} onEnablePush={noop} onViewDocs={noop} />
        </section>
        <aside className="animate-fade-up lg:col-span-1" style={{ animationDelay: "120ms" }}>
          <SupportWidget onChat={noop} />
        </aside>
      </div>
    </div>
  );
}
