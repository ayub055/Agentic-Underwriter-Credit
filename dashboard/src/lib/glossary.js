// Plain-language definitions for credit-ops jargon, surfaced as hover tooltips.
// C-Suite explorers hover; presenters can ignore. Key order matters: more
// specific terms (dpd) must precede substrings they contain (pd).
export const GLOSSARY = {
  foir: "FOIR — Fixed Obligation to Income Ratio: the share of monthly income already committed to EMIs and other obligations. The serviceability cap here is 50%.",
  dpd: "DPD — Days Past Due: how late a repayment was. Zero DPD means a clean record.",
  npa: "NPA — Non-Performing Asset flag from the bureau: a loan the borrower has stopped servicing.",
  cibil: "CIBIL — TransUnion credit bureau score (300–900). 750+ is considered excellent.",
  enq: "Bureau enquiries — recent applications for new credit. A spike signals credit hunger.",
  irr: "IRR — the offer's internal rate of return: the annualised price of the loan.",
  pd_: "PD — Probability of Default estimated by the scorecard model.",
  pd_score: "PD — Probability of Default estimated by the scorecard model.",
  provenance: "Provenance — where each field's value came from: real (captured pipeline output), derived, mock, or placeholder.",
  exposure: "Total exposure — outstanding credit summed across every tradeline at the bureau.",
  affluence: "Affluence segment — an income/spend-based customer segment used for pricing.",
  ollama: "ollama-local — the locally hosted LLM that generated this agent's narrative.",
  serviceab: "Serviceability — whether the proposed EMI fits within the FOIR cap on the customer's income.",
};

export function glossaryFor(text) {
  if (!text) return undefined;
  const t = String(text).toLowerCase();
  const key = Object.keys(GLOSSARY).find((k) => t.includes(k));
  return key ? GLOSSARY[key] : undefined;
}
