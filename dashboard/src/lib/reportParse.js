// Pure parsers that turn a generated analyser report's HTML into the headline
// figures + verbatim summary the demo narrates. No Vite/DOM/Node specifics —
// safe to import from both the browser bundle and vite.config.js (the build-time
// `virtual:report-data` plugin reads the files in public/reports/ and runs these
// so the demo's narration tracks the actual reports without bundling the HTML).

export function clean(s) {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// captured-string grab (keeps the report's own comma grouping)
const grab = (html, re) => {
  const m = html.match(re);
  return m ? m[1] : null;
};

// first N sentences of a cleaned paragraph — keeps the narrative excerpt tight
export const sentences = (txt, n = 3) =>
  txt ? txt.split(/(?<=\.)\s+/).slice(0, n).join(" ").trim() : "";

// ── Banking report → figures + verbatim summary ──────────────────────────────
export function parseBankingReport(html) {
  if (!html) return { ok: false };

  const sumRaw =
    (html.match(/id="sum"[^>]*>([\s\S]*?)show less/i) ||
      html.match(/id="sum"[^>]*>([\s\S]*?)<\/div>/i) ||
      [])[1] || "";
  const summary = clean(sumRaw)
    .replace(/…\s*read more/gi, "")
    .replace(/show (?:less|more)/gi, "")
    .trim();

  const out = {
    summary,
    salaryPerMonth: grab(html, /salary income is\s*₹\s*([\d,]*\d)/i),
    salaryCredits: grab(html, /avg\s*\((\d+)\s*transactions?\)/i),
    emiPerPayment: grab(html, /EMI commitments average\s*₹\s*([\d,]*\d)/i),
    emiPctOfSalary: grab(html, /([\d.]+)%\s*of salary/i),
    activeLoans: grab(html, /(\d+)\s*active loans/i),
    foirPct: grab(html, /FOIR ratio stands at\s*([\d.]+)\s*%/i),
    monthlyCashflow: grab(html, /monthly cash flow of\s*₹\s*([\d,]*\d)/i),
    netInflow: grab(html, /net inflow of\s*₹\s*([\d,]*\d)/i),
    outflow: grab(html, /\boutflow of\s*₹\s*([\d,]*\d)/i),
  };
  out.ok = Boolean(out.summary || out.salaryPerMonth);
  return out;
}

// ── Bureau report → figures + verbatim executive summary ─────────────────────
export function parseBureauReport(html) {
  if (!html) return { ok: false };

  const sumRaw = (html.match(/class="summary-box"[^>]*>\s*<p>([\s\S]*?)<\/p>/i) || [])[1] || "";
  const summary = clean(sumRaw).replace(/^Here is the executive summary:?\s*/i, "").trim();

  const personaM = html.match(/Probable profile of customer is\s*([\s\S]*?)\.\s*<\/p>/i);

  const out = {
    summary,
    persona: personaM ? clean(personaM[1]) : null,
    risk: grab(html, /Overall Risk:\s*([A-Za-z]+)/i),
    cibil: grab(html, /CIBIL Score<\/div>\s*<div[^>]*>([\d]+)/i),
    enquiries12m: grab(html, /Enquiries<\/div>\s*<div[^>]*>([\d]+)\s*in 12M/i),
    utilizationPct: grab(html, /CC utilization:?\s*([\d.]+)\s*%/i),
    foirPct: grab(html, /Bureau FOIR:?\s*([\d.]+)\s*%/i),
    missed18mPct: grab(html, /Missed payment rate over 18M:?\s*([\d.]+)\s*%/i),
    unsecuredSanction: grab(html, /sanction is 100% of total \(INR\s*([\d,]*\d)/i),
    totalOutstanding: grab(html, /total outstanding is INR\s*([\d,]*\d)/i),
    tradelines: grab(html, /Tradelines:<\/strong>\s*([\d]+)/i),
  };
  out.ok = Boolean(out.summary || out.persona);
  return out;
}
