import { useState } from "react";
import { PenLine } from "lucide-react";
import Toggle from "./Toggle.jsx";
import { formatINR } from "../../lib/format.js";

export default function ActionZone({ offer, onAcceptOffer }) {
  const [autoDebit, setAutoDebit] = useState(true);

  return (
    <div className="mt-6">
      <button
        onClick={onAcceptOffer}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-primary-700 active:scale-[.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
      >
        <PenLine className="h-5 w-5" strokeWidth={2} />
        Accept Offer &amp; E-Sign
      </button>

      <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
        <div>
          <div className="text-sm font-medium text-ink">Set up auto-debit</div>
          <div className="text-xs text-slate-500">Never miss an EMI — toggle e-NACH mandate</div>
        </div>
        <Toggle checked={autoDebit} onChange={setAutoDebit} label="Set up auto-debit" />
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-400">
        A one-time processing fee of {formatINR(offer.processingFee)} (incl. GST) applies and is
        deducted at disbursal. Interest shown is the annual reducing rate. By accepting, you agree to
        the loan agreement, Key Fact Statement, and e-NACH terms. This offer is subject to final
        verification.
      </p>
    </div>
  );
}
