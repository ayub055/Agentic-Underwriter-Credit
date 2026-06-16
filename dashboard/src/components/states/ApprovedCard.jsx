import { CheckCircle2, Sparkles, Timer } from "lucide-react";
import MetricsGrid from "../offer/MetricsGrid.jsx";
import ActionZone from "../offer/ActionZone.jsx";
import ExplainChips from "../../journey/ExplainChips.jsx";
import { CHIPS } from "../../journey/agentScript.js";
import { formatINR } from "../../lib/format.js";
import { useCountUp } from "../../lib/motion.js";

export default function ApprovedCard({ view, onAcceptOffer }) {
  const { offer, applicant, affordability } = view;
  const amount = useCountUp(offer.amount);

  const emiPct =
    applicant?.income != null && offer.emi != null
      ? Math.round((offer.emi / applicant.income) * 100)
      : null;
  const foirPct =
    affordability?.foirProposed != null ? Math.round(affordability.foirProposed * 100) : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-surface p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 animate-pop">
          <CheckCircle2 className="h-3.5 w-3.5 text-success-600" strokeWidth={2.4} />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-success-700">
            Approved
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1">
          <Timer className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.2} />
          <span className="text-[11px] font-medium text-slate-500">Offer locked for 30 days</span>
        </div>
      </div>

      <div className="mt-5">
        <div className="text-xs uppercase tracking-wide text-slate-500">Your approved amount</div>
        <div className="mt-1 font-display text-5xl font-semibold tracking-tight tabular-nums text-ink sm:text-6xl">
          {formatINR(amount)}
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Sanctioned and ready to disburse — funds can reach your account within 24 hours of e-sign.
        </p>
      </div>

      {emiPct != null && (
        <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-agent-200/60 bg-agent-50 p-3.5 animate-fade-up">
          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-agent-600" strokeWidth={2.2} />
          <p className="text-sm leading-relaxed text-slate-700">
            Your EMI of {formatINR(Math.round(offer.emi))} is just{" "}
            <span className="font-semibold text-ink">{emiPct}% of your monthly income</span>
            {foirPct != null && (
              <>
                {" "}
                — even with existing obligations you're at {foirPct}%, comfortably inside the 40%
                healthy zone
              </>
            )}
            .
          </p>
        </div>
      )}

      <div className="mt-6">
        <MetricsGrid offer={offer} />
      </div>

      <ExplainChips items={CHIPS.approved} />

      <ActionZone offer={offer} onAcceptOffer={onAcceptOffer} />
    </div>
  );
}
