import { Info } from "lucide-react";
import AlternativeOptions from "../rejected/AlternativeOptions.jsx";
import OfferSimulator from "../../journey/OfferSimulator.jsx";
import ExplainChips from "../../journey/ExplainChips.jsx";
import { CHIPS } from "../../journey/agentScript.js";
import { formatINR, formatTenure } from "../../lib/format.js";

export default function RejectedCard({ view }) {
  const { applicant, affordability, offer } = view;
  const canExplain =
    applicant?.income != null && offer.emi != null && applicant.requestedAmount != null;
  const canSimulate =
    applicant?.income != null &&
    affordability?.existingObligations != null &&
    offer.interestRatePct != null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-surface p-6 shadow-sm sm:p-8">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-caution-50 px-3 py-1">
        <Info className="h-3.5 w-3.5 text-caution-700" strokeWidth={2.4} />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-caution-700">
          Not approved this time
        </span>
      </div>

      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        This amount didn't fit — let's find one that does
      </h1>

      {canExplain ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
          In plain terms: {formatINR(applicant.requestedAmount)} over{" "}
          {formatTenure(applicant.requestedTenure)} means an EMI of{" "}
          {formatINR(Math.round(offer.emi))} —{" "}
          <span className="font-medium text-ink">
            {Math.round((offer.emi / applicant.income) * 100)}% of your{" "}
            {formatINR(applicant.income)} monthly income
          </span>{" "}
          before your existing EMIs. That's beyond what's safe to lend.
        </p>
      ) : (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
          This isn't the end of the road. Based on your current profile we're unable to extend an
          offer right now — but there are a few good ways to get there.
        </p>
      )}

      {canSimulate && (
        <OfferSimulator
          income={applicant.income}
          existingObligations={affordability.existingObligations}
          ratePct={offer.interestRatePct}
        />
      )}

      <ExplainChips items={CHIPS.rejected} />

      <AlternativeOptions />
    </div>
  );
}
