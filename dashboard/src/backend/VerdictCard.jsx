import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, ArrowRight, FileText } from "lucide-react";
import { VIZ } from "./phaseModel.js";
import { formatEMI, formatINR } from "../lib/format.js";
import { prefersReducedMotion } from "../lib/motion.js";

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

// The decision as a balance: credit quality vs affordability. The beam settles
// toward the side that failed — the run's whole tension (clean credit, failed
// FOIR) read in one glance. Balanced when both pass.
function VerdictScale({ creditPass, affordPass }) {
  const reduce = prefersReducedMotion();
  const [grown, setGrown] = useState(reduce);
  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const tip = creditPass === affordPass ? 0 : creditPass ? 9 : -9; // + = affordability sinks
  const angle = grown ? tip : 0;
  const disc = (pass) => (pass ? "fill-success-500" : "fill-danger-500");

  return (
    <div className="mb-4 flex flex-col items-center">
      <svg viewBox="0 0 260 96" className="w-full max-w-[280px]" aria-hidden="true">
        <line x1="104" y1="84" x2="156" y2="84" className="stroke-slate-300" strokeWidth="3" strokeLinecap="round" />
        <line x1="130" y1="84" x2="130" y2="34" className="stroke-slate-400" strokeWidth="3" strokeLinecap="round" />
        <polygon points="130,27 123,38 137,38" className="fill-slate-400" />
        <g
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: "130px 32px",
            transition: reduce ? "none" : "transform 1.1s cubic-bezier(.34,1.2,.4,1)",
          }}
        >
          <line x1="54" y1="32" x2="206" y2="32" className="stroke-ink" strokeWidth="3" strokeLinecap="round" />
          <line x1="54" y1="32" x2="54" y2="47" className="stroke-slate-300" strokeWidth="1.5" />
          <circle cx="54" cy="53" r="9" className={disc(creditPass)} />
          <line x1="206" y1="32" x2="206" y2="47" className="stroke-slate-300" strokeWidth="1.5" />
          <circle cx="206" cy="53" r="9" className={disc(affordPass)} />
        </g>
      </svg>
      <div className="flex w-full max-w-[280px] justify-between px-1 text-micro font-semibold uppercase tracking-wide">
        <span className={creditPass ? "text-success-700" : "text-danger-600"}>Credit {creditPass ? "✓" : "✕"}</span>
        <span className={affordPass ? "text-success-700" : "text-danger-600"}>Affordability {affordPass ? "✓" : "✕"}</span>
      </div>
    </div>
  );
}

// The run's verdict, split into its two truths: credit quality vs affordability.
// For the captured run that tension IS the story — clean credit, unaffordable EMI.
export default function VerdictCard({ onSeeCustomer, onOpenCam }) {
  const v = VIZ.verdict;
  const creditPass = v.policyResult === "APPROVED";
  const foirPct = v.foirProposed != null ? Math.round(v.foirProposed * 1000) / 10 : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-surface p-5 shadow-sm animate-fade-up">
      <VerdictScale creditPass={creditPass} affordPass={v.serviceable} />

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
        <div className="flex flex-wrap items-center gap-2">
          {onOpenCam && (
            <button
              onClick={onOpenCam}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-surface px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <FileText className="h-4 w-4" /> Open CAM
            </button>
          )}
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
    </div>
  );
}
