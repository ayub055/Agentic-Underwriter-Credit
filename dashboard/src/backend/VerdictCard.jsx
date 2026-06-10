import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { VIZ } from "./phaseModel.js";
import { formatEMI, formatINR } from "../lib/format.js";

function Side({ pass, title, headline, detail }) {
  const Icon = pass ? CheckCircle2 : XCircle;
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 ${
        pass ? "border-success-200 bg-success-50" : "border-danger-200 bg-danger-50"
      }`}
    >
      <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${pass ? "text-success-700" : "text-danger-600"}`} />
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{title}</div>
        <div className={`text-sm font-bold ${pass ? "text-success-700" : "text-danger-600"}`}>
          {headline}
        </div>
        <div className="mt-0.5 text-xs leading-relaxed text-slate-600">{detail}</div>
      </div>
    </div>
  );
}

// The run's verdict, split into its two truths: credit quality vs affordability.
// For the captured run that tension IS the story — clean credit, unaffordable EMI.
export default function VerdictCard({ onSeeCustomer }) {
  const v = VIZ.verdict;
  const creditPass = v.policyResult === "APPROVED";
  const foirPct = v.foirProposed != null ? Math.round(v.foirProposed * 1000) / 10 : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-fade-up">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Side
          pass={creditPass}
          title="Credit quality"
          headline={creditPass ? "PASS" : "FAIL"}
          detail={`CIBIL ${v.cibil ?? "—"} · ${v.policyPassed}/${v.policyTotal} policy layers cleared`}
        />
        <Side
          pass={v.serviceable}
          title="Affordability"
          headline={v.serviceable ? "PASS" : "FAIL"}
          detail={
            v.serviceable
              ? "EMI fits comfortably within the serviceability cap."
              : `EMI ${formatEMI(v.emi)} on ${formatINR(v.income)}/mo income — FOIR ${foirPct}% vs ${Math.round(
                  v.foirCap * 100
                )}% cap`
          }
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-600">
          {v.outcome === "APPROVED" ? (
            <>
              <span className="font-semibold text-success-700">Outcome: APPROVED</span> — offer
              generated and stamped.
            </>
          ) : (
            <>
              <span className="font-semibold text-danger-600">Outcome: {v.outcome}</span> — the
              agent declined to protect the customer, and instantly offered alternatives.
            </>
          )}
        </p>
        {onSeeCustomer && (
          <button
            onClick={onSeeCustomer}
            className="flex items-center gap-1.5 rounded-lg bg-agent-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-agent-700"
          >
            See what the customer experienced <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
