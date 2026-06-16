import { Info } from "lucide-react";
import AlternativeOptions from "../rejected/AlternativeOptions.jsx";
import OfferSimulator from "../../journey/OfferSimulator.jsx";
import ExplainChips from "../../journey/ExplainChips.jsx";
import { CHIPS } from "../../journey/agentScript.js";
import { formatINR, formatTenure } from "../../lib/format.js";

function Stat({ label, value, tone }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`text-base font-bold tabular-nums ${tone ?? "text-ink"}`}>{value}</div>
    </div>
  );
}

export default function RejectedCard({ view }) {
  const { applicant, affordability, offer } = view;
  const canExplain =
    applicant?.income != null && offer.emi != null && applicant.requestedAmount != null;
  const canSimulate =
    applicant?.income != null &&
    affordability?.existingObligations != null &&
    offer.interestRatePct != null;
  const pct = canExplain ? Math.round((offer.emi / applicant.income) * 100) : null;

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

      {/* Why — a scannable callout aligned to the heading, instead of a long sentence */}
      {canExplain ? (
        <div className="mt-4 rounded-xl border border-caution-200 bg-caution-50/40 p-4">
          <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
            <Stat label="Requested EMI" value={`${formatINR(Math.round(offer.emi))}/mo`} />
            <Stat label="Share of income" value={`${pct}%`} tone="text-caution-700" />
            <Stat label="Safe limit" value="50%" tone="text-success-700" />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {formatINR(applicant.requestedAmount)} over {formatTenure(applicant.requestedTenure)} needs an
            EMI of {formatINR(Math.round(offer.emi))} — that's{" "}
            <span className="font-semibold text-ink">{pct}% of your {formatINR(applicant.income)} income</span>{" "}
            before existing EMIs, beyond what's safe to lend.
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
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

      <AlternativeOptions />

      <div className="mt-6 border-t border-slate-100 pt-5">
        <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Common questions
        </h2>
        <ExplainChips items={CHIPS.rejected} />
      </div>
    </div>
  );
}
