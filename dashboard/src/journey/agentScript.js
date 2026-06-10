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
        "PAN verified via Karza · KYC confirmed",
        "Employment & consent captured (EPFO)",
        addr?.score != null
          ? `Address quality scored ${addr.score}/100 · ${addr.band}`
          : "Address verified against KYC",
      ],
    },
    {
      id: "finances",
      label: "Income & Banking",
      icon: Wallet,
      narration:
        income != null
          ? `Next, I read your recent bank statements — salary credits of about ${formatINR(
              income
            )} land like clockwork — and mapped every EMI you already pay.`
          : "Next, I read your recent bank statements and mapped every EMI you already pay.",
      facts: [
        "Bank statements analysed",
        income != null
          ? `Salary credits ≈ ${formatINR(income)}/mo detected`
          : "Salary credits detected",
        "Existing obligations mapped",
      ],
    },
    {
      id: "bureau",
      label: "Credit History",
      icon: BarChart3,
      narration:
        "With your consent, I pulled your bureau report and reviewed how you've handled credit so far.",
      facts: [
        "Bureau report pulled (no score impact)",
        "Repayment track record reviewed",
        "Total credit exposure computed",
      ],
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
