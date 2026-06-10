// Verbatim output captured from the two LLM analyser agents (ollama-local)
// during run PL-2026-8bd9c6 — extracted from the reports the agents generated,
// with person names masked. Nothing here is paraphrased or invented; `source`
// points at the artifact each excerpt came from.

export const AGENT_NARRATIVES = {
  banking: {
    agent: "agent:banking_analyzer",
    model: "ollama-local",
    elapsed: "28.8s",
    source: "reports/customer_698167220_report_v2.html",
    artifact: "reports/banking_agent_report.html",
    // First narrative paragraphs of the report's "Banking Summary" section.
    excerpt:
      "The customer's banking profile presents a mixed picture. Their average monthly cash flow shows an inflow of ₹313,622 and outflow of ₹465,174, resulting in an average net deficit of ₹151,552 per month. This translates to a stretched obligation-to-income ratio of 51.8%, indicating that their income is barely covering their essential expenses.",
    findings: [
      "17 rule checks · 0 red · 5 amber",
      "Salary credits ₹51,020/mo · detected 6 of 6 months",
      "Existing EMI debits ₹26,434/mo across active loans",
      "EMI payments visible — debt taken on to purchase a vehicle",
    ],
    consoleLines: [
      "banking profile presents a mixed picture…",
      "avg inflow ₹313,622 vs outflow ₹465,174 → net deficit ₹151,552/mo",
      "obligation-to-income ratio 51.8% — stretched",
    ],
  },

  bureau: {
    agent: "agent:bureau_analyzer",
    model: "ollama-local",
    elapsed: "17.4s",
    source: "reports/bureau_analyser_698167220_report.pdf",
    artifact: "reports/bureau_agent_report.html",
    // Verbatim persona + scorecard verdict lines from the generated report.
    excerpt:
      "Probable profile of customer is Entry Salaried (PL 3L + CC). Overall Risk: CAUTION. Strengths — no delinquency detected across the portfolio; credit card utilization at 9%; zero DPD across all products in recent 6–9 month windows. Concerns — unsecured sanction is 100% of total exposure.",
    findings: [
      "CIBIL 785 · Excellent",
      "0 enquiries in 12M · 0% missed payments in 18M",
      "27 tradelines reviewed · CC utilisation 9%",
      "Bureau-basis FOIR 68.5% (on bureau-estimated income — ML uses declared)",
    ],
    consoleLines: [
      "probable profile: Entry Salaried (PL 3L + CC)",
      "overall risk: CAUTION — clean repayment, concentrated unsecured exposure",
      "CIBIL 785 · 0 enquiries/12M · 0% missed/18M",
    ],
  },
};
