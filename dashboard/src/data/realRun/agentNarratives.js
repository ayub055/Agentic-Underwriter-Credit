// Analyser-agent narration shown in the after-run "Agent narrative" block.
//
// These are NOT hand-typed numbers — they are extracted live from the actual
// generated reports (public/reports/banking_agent_report.html and
// bureau_agent_report.html) via lib/reportExtract.js. Regenerate or replace a
// report and the excerpt + findings + console lines below re-derive to match it
// automatically (HMR in dev, re-bundle on build).
//
// `STATIC_*` are last-resort fallbacks used only when a report file is missing
// or a field can't be parsed, so the demo still renders.

import { BANKING_REPORT, BUREAU_REPORT, bankingExcerpt, bureauExcerpt } from "../../lib/reportExtract.js";

const inr = (s) => (s ? `₹${s}` : null);
// pick the first defined of a list (extracted value → fallback)
const pick = (...vals) => vals.find((v) => v !== null && v !== undefined && v !== "");
// drop findings/console lines whose values couldn't be parsed
const compact = (arr) => arr.filter(Boolean);

// ── static fallbacks (only used if a report is absent/unparseable) ───────────
const STATIC_BANKING = {
  excerpt:
    "The customer's banking profile indicates a stretched obligation-to-income ratio, with EMI commitments and recurring spends consuming most of the monthly salary inflow.",
  findings: ["Salary credits detected", "Existing EMI debits across active loans", "Banking FOIR — stretched"],
  consoleLines: ["banking summary generated", "salary + EMI detected", "FOIR computed"],
};
const STATIC_BUREAU = {
  excerpt:
    "Probable profile of customer is Entry Salaried. Overall Risk: CAUTION. Clean repayment record with concentrated unsecured exposure.",
  findings: ["CIBIL · Excellent", "Low enquiries · clean 18M track", "Tradelines reviewed · low CC utilisation"],
  consoleLines: ["probable profile derived", "overall risk assessed", "CIBIL · enquiries · DPD summarised"],
};

// ── Banking — derived from the report, falling back to static ────────────────
const bk = BANKING_REPORT;
const bankingNarrative = {
  agent: "agent:banking_analyzer",
  model: "ollama-local",
  elapsed: "28.8s",
  source: "reports/banking_agent_report.html",
  artifact: "reports/banking_agent_report.html",
  excerpt: pick(bk.ok && bankingExcerpt(3), STATIC_BANKING.excerpt),
  findings: bk.ok
    ? compact([
        bk.salaryPerMonth &&
          `Salary ${inr(bk.salaryPerMonth)}/mo via NEFT${bk.salaryCredits ? ` · ${bk.salaryCredits} credits` : ""}`,
        bk.emiPerPayment &&
          `EMI ${inr(bk.emiPerPayment)}/payment${bk.emiPctOfSalary ? ` · ${bk.emiPctOfSalary}% of salary` : ""}${bk.activeLoans ? ` · ${bk.activeLoans} active loans` : ""}`,
        bk.foirPct && `Banking FOIR ${bk.foirPct}% — stretched obligation-to-income`,
        bk.netInflow &&
          bk.outflow &&
          `Net inflow ${inr(bk.netInflow)} vs outflow ${inr(bk.outflow)}${bk.monthlyCashflow ? ` · cash flow ${inr(bk.monthlyCashflow)}` : ""}`,
      ])
    : STATIC_BANKING.findings,
  consoleLines: bk.ok
    ? compact([
        bk.monthlyCashflow && `banking summary · monthly cash flow ${inr(bk.monthlyCashflow)}`,
        bk.salaryPerMonth &&
          `salary ${inr(bk.salaryPerMonth)}/mo (NEFT)${bk.emiPerPayment ? ` · EMI ${inr(bk.emiPerPayment)}/payment` : ""}`,
        bk.foirPct && `FOIR ${bk.foirPct}%${bk.activeLoans ? ` · ${bk.activeLoans} active loans` : ""} — stretched`,
      ])
    : STATIC_BANKING.consoleLines,
};

// ── Bureau — derived from the report, falling back to static ─────────────────
const br = BUREAU_REPORT;
const bureauNarrative = {
  agent: "agent:bureau_analyzer",
  model: "ollama-local",
  elapsed: "17.4s",
  source: "reports/bureau_agent_report.html",
  artifact: "reports/bureau_agent_report.html",
  excerpt: pick(
    br.ok &&
      compact([
        br.persona && `Probable profile: ${br.persona}.`,
        br.risk && `Overall Risk: ${br.risk}.`,
        bureauExcerpt(2),
      ]).join(" "),
    STATIC_BUREAU.excerpt
  ),
  findings: br.ok
    ? compact([
        br.cibil && `CIBIL ${br.cibil} · Excellent`,
        (br.enquiries12m != null || br.missed18mPct != null) &&
          `${br.enquiries12m ?? "—"} enquiries in 12M · ${br.missed18mPct ?? "—"}% missed payments in 18M`,
        (br.tradelines || br.utilizationPct) &&
          `${br.tradelines ?? "—"} tradelines · CC utilisation ${br.utilizationPct ?? "—"}%`,
        br.foirPct && `Bureau-basis FOIR ${br.foirPct}%`,
      ])
    : STATIC_BUREAU.findings,
  consoleLines: br.ok
    ? compact([
        br.persona && `probable profile: ${br.persona}`,
        br.risk && `overall risk: ${br.risk}`,
        br.cibil &&
          `CIBIL ${br.cibil}${br.enquiries12m != null ? ` · ${br.enquiries12m} enq/12M` : ""}${br.missed18mPct != null ? ` · ${br.missed18mPct}% missed/18M` : ""}`,
      ])
    : STATIC_BUREAU.consoleLines,
};

export const AGENT_NARRATIVES = {
  banking: bankingNarrative,
  bureau: bureauNarrative,
};
