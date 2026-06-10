import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "How long is my offer valid?",
    a: "Your sanctioned offer is locked for 30 days from approval. You can e-sign any time before it expires.",
  },
  {
    q: "Is there a prepayment charge?",
    a: "No foreclosure or part-prepayment fee after the first 6 EMIs. Earlier prepayment carries a nominal 2% charge.",
  },
  {
    q: "When will funds be disbursed?",
    a: "Disbursal happens within 24 hours of a successful e-sign and bank-account verification.",
  },
  {
    q: "How is my data protected?",
    a: "All data is encrypted in transit and at rest with bank-grade 256-bit encryption and never shared without consent.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="divide-y divide-slate-200">
      {FAQS.map((faq, i) => {
        const open = openIndex === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(open ? -1 : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-3 py-3 text-left"
            >
              <span className="text-sm font-medium text-ink">{faq.q}</span>
              <ChevronDown
                className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ${
                open ? "grid-rows-[1fr] pb-3" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="text-sm leading-relaxed text-slate-500">{faq.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
