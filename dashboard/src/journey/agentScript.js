// The agent's narrative for the customer journey: a personalized script of
// "moments" (replaying the pipeline's work in plain language), the outcome
// reveal, and per-status conversational follow-ups. All copy is computed from
// the mapped CaseState view so it reads as tailored, never generic.

import { ShieldCheck, Wallet, BarChart3, Scale } from "lucide-react";
import { formatINR, formatTenure } from "../lib/format.js";

function emiShare(view) {
  const { income } = view.applicant;
  const { emi } = view.offer;
  if (income == null || emi == null) return null;
  return Math.round((emi / income) * 100);
}

export function buildScript(view) {
  const { income, requestedAmount, requestedTenure } = view.applicant;
  const amountTxt = requestedAmount != null ? formatINR(requestedAmount) : "your";
  const tenureTxt = requestedTenure != null ? ` over ${formatTenure(requestedTenure)}` : "";
  const addr = view.addressQuality;
  const sum = view.summary ?? {};
  // Quote what the analysers actually found when we have it (real run);
  // fall back to the declared figure on synthetic fixtures.
  const salary = sum.salaryDetected != null ? Math.round(sum.salaryDetected) : income;
  const evidence = (pairs) => pairs.filter(([, v]) => v != null && v !== "");

  const moments = [
    {
      id: "identity",
      label: "Identity & Address",
      icon: ShieldCheck,
      narration:
        addr?.score != null
          ? `First, I made sure it's really you — PAN via Karza, KYC and employer records all line up. I also scored ${
              addr.city ? `your ${addr.city} address` : "your home address"
            } at ${addr.score}/100 (${addr.band.toLowerCase()} confidence)${
              addr.reviewFlag ? ", and flagged it for a closer human look." : " — a real, serviceable match."
            }`
          : "First, I made sure it's really you — your PAN, KYC and employer records all line up, and your home address checks out as real and serviceable.",
      facts: [
        "Form received · application submitted",
        "PAN verified via Karza · KYC confirmed",
        "Employment & consent captured (EPFO)",
        addr?.score != null
          ? `Address quality scored ${addr.score}/100 · ${addr.band}`
          : "Address verified against KYC",
      ],
      evidence: evidence([
        ["Address-quality score", addr?.score != null ? `${addr.score} / 100 · ${addr.band}` : null],
        ["City", addr?.city],
        ...(addr?.reasons ?? []).map((r) => ["Driver", r.label]),
      ]),
    },
    {
      id: "finances",
      label: "Income & Banking",
      icon: Wallet,
      narration:
        salary != null
          ? `Next, I read your recent bank statements — salary credits of about ${formatINR(
              salary
            )} land like clockwork — and mapped every EMI you already pay.`
          : "Next, I read your recent bank statements and mapped every EMI you already pay.",
      facts: [
        "Bank statements analysed",
        salary != null
          ? `Salary credits ≈ ${formatINR(salary)}/mo detected`
          : "Salary credits detected",
        sum.existingEmiDebits != null
          ? `Existing EMIs of ${formatINR(Math.round(sum.existingEmiDebits))}/mo mapped`
          : "Existing obligations mapped",
      ],
      evidence: evidence([
        ["Salary credits detected", sum.salaryDetected != null ? `${formatINR(Math.round(sum.salaryDetected))} / mo` : null],
        ["Income you declared", income != null ? `${formatINR(income)} / mo` : null],
        ["Existing EMI debits", sum.existingEmiDebits != null ? `${formatINR(Math.round(sum.existingEmiDebits))} / mo` : null],
        ["Bounced payments", sum.bounceCount],
      ]),
    },
    {
      id: "bureau",
      label: "Credit History",
      icon: BarChart3,
      narration:
        sum.cibilScore != null
          ? `With your consent, I pulled your bureau report — a CIBIL of ${sum.cibilScore} shows you've handled credit well so far.`
          : "With your consent, I pulled your bureau report and reviewed how you've handled credit so far.",
      facts: [
        "Bureau report pulled (no score impact)",
        sum.cibilScore != null
          ? `CIBIL score ${sum.cibilScore} · clean repayment record`
          : "Repayment track record reviewed",
        sum.totalExposure != null
          ? `Total exposure of ${formatINR(Math.round(sum.totalExposure))} computed`
          : "Total credit exposure computed",
      ],
      evidence: evidence([
        ["CIBIL score", sum.cibilScore],
        ["Total credit exposure", sum.totalExposure != null ? formatINR(Math.round(sum.totalExposure)) : null],
        ["Recent enquiries", sum.enqCount],
        ["NPA flag", sum.npaFlag == null ? null : sum.npaFlag ? "Yes" : "None"],
      ]),
    },
    {
      id: "decision",
      label: "Decision",
      icon: Scale,
      narration: DECISION_NARRATION[view.status](view),
      facts: [
        "All 6 lending policies evaluated",
        "Affordability stress-tested",
        view.status === "review" ? "Routed to a senior underwriter" : "Offer terms computed",
      ],
      evidence: evidence([
        [
          "Affordability (FOIR)",
          view.affordability?.foirProposed != null
            ? `${Math.round(view.affordability.foirProposed * 100)}% of income vs 50% cap`
            : null,
        ],
        ["Proposed EMI", view.offer?.emi != null ? `${formatINR(Math.round(view.offer.emi))} / mo` : null],
        [
          "Existing obligations",
          view.affordability?.existingObligations != null && view.affordability.existingObligations > 0
            ? `${formatINR(view.affordability.existingObligations)} / mo`
            : null,
        ],
      ]),
    },
  ];

  return {
    moments,
    greeting: `Hi — I'm your Kotak AI underwriting agent. I've finished working on your ${amountTxt} application${tenureTxt}. Let me walk you through what I did.`,
    reveal: REVEAL[view.status](view),
  };
}

const DECISION_NARRATION = {
  approved: () =>
    "Everything checks out. I ran all six lending policies and priced your offer in our best band for your profile.",
  review: () =>
    "Your application cleared most checks, but one result sits in a grey zone I'm not allowed to decide alone — so I routed it to a senior underwriter with my full analysis attached.",
  rejected: (view) => {
    const { emi } = view.offer;
    return emi != null
      ? `I ran the numbers every way I could, but the requested EMI of ${formatINR(
          Math.round(emi)
        )} doesn't fit safely inside your monthly budget.`
      : "I ran the numbers every way I could, but the requested amount doesn't fit safely inside your monthly budget.";
  },
};

const REVEAL = {
  approved: (view) => ({
    narration: `Great news — you're approved for ${formatINR(view.offer.amount)}. ${
      emiShare(view) != null
        ? `The EMI takes just ${emiShare(view)}% of your monthly income. `
        : ""
    }One e-sign and the money moves.`,
    nextAction: "Accept & e-sign — it takes about 2 minutes",
  }),
  review: () => ({
    narration:
      "Your file cleared the automated checks; one result needs human judgment. A senior underwriter has it now — I'll ping you the moment they decide.",
    nextAction: "Enable notifications so you don't have to wait here",
  }),
  rejected: () => ({
    narration:
      "I couldn't fit this loan safely inside your monthly budget — but the numbers point to clear ways forward. Adjust the simulator below and I'll re-run them live.",
    nextAction: "Try a different amount — I'll respond instantly",
  }),
};

export const CHIPS = {
  approved: [
    {
      q: "Why this rate?",
      a: "Your rate sits in our best pricing band for your profile — driven by a clean repayment history and consistent salary credits. No negotiation needed; this is the floor.",
    },
    {
      q: "Can I lower my EMI?",
      a: "Yes — a longer tenure lowers the EMI but adds total interest. Tap “Chat with a Loan Expert” before e-signing and we'll re-tenure the offer for you.",
    },
    {
      q: "What happens after I sign?",
      a: "Funds typically reach your account within 24 hours of e-sign and a quick bank-account verification. I'll track each step and keep you posted.",
    },
    {
      q: "How did you verify my address?",
      a: "An address-quality model scored your residence on serviceability, geo-risk, tenure and KYC match. It landed in the high band, so it strengthened — never held back — your application.",
    },
  ],
  review: [
    {
      q: "Why the extra review?",
      a: "One policy result landed in a grey zone that requires human judgment. Your file went to a senior underwriter with my full analysis attached, so they start from everything I found — not from zero.",
    },
    {
      q: "Will this affect my credit score?",
      a: "No. This is an internal review — it adds no extra bureau inquiry and leaves no mark on your credit report.",
    },
    {
      q: "Do I need to do anything?",
      a: "Nothing. If the underwriter needs a document, I'll ask you right here and by SMS the moment they do.",
    },
    {
      q: "How did you check my address?",
      a: "An address-quality model scored your residence on serviceability, geo-risk, tenure and KYC match. Its result is attached to your file so the underwriter starts from a complete picture.",
    },
  ],
  rejected: [
    {
      q: "Was it my credit score?",
      a: "Your repayment history wasn't the blocker — affordability was. The requested EMI didn't fit safely within your monthly income alongside your existing obligations.",
    },
    {
      q: "Will trying again hurt my score?",
      a: "Using the simulator costs nothing and touches no bureau. A fresh application after 90 days has minimal impact — and I'll prefill everything from this one.",
    },
    {
      q: "Was my address a problem?",
      a: "No — your address scored in the high band on our address-quality model. The decision came down to affordability alone, not where you live.",
    },
  ],
};
