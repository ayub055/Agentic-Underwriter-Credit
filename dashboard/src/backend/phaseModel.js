// Build the credit-underwriting journey phases from the curated CaseState + trace.
// Values mirror the real documented case (CAM, eligibility sheet, field history);
// the decision is human credit underwriting with a documented management override,
// rendered over the pipeline's stage scaffolding.

import { formatINR, formatEMI, formatPct, emDash } from "../lib/format.js";
import caseState from "../data/realRun/caseState.json";
import trace from "../data/realRun/trace.json";
import { AGENT_NARRATIVES } from "../data/realRun/agentNarratives.js";
import { BANKING_REPORT as BKR, BUREAU_REPORT as BUR } from "../lib/reportExtract.js";

const cs = caseState;
const prov = cs.finalize?.provenance_map ?? {};
const num = (v) => (v === null || v === undefined ? emDash : v);
const bool = (v) => (v === null || v === undefined ? emDash : v ? "TRUE" : "FALSE");
// Extracted-from-report value (keeps the report's own grouping) → "₹110,346",
// or null so callers fall back to the captured caseState value.
const inrStr = (s) => (s ? `₹${s}` : null);

function elapsed(branch) {
  const rec = trace.find((t) => t.kind === "branch" && t.branch === branch);
  return rec ? `${rec.elapsed_s}s` : "";
}
const layer2Elapsed = (trace.find((t) => t.kind === "stage" && t.stage === "layer2") || {}).elapsed_s;

const b = cs.branches?.banking ?? {};
const r = cs.branches?.bureau ?? {};
const bs = b.summary ?? {};
const rs = r.summary ?? {};
const ml = cs.ml ?? {};
const pol = cs.policy ?? {};
const dec = cs.decision ?? {};
const fin = cs.finalize ?? {};
const ik = cs.intake ?? {};
const addr = cs.address ?? {};
const tp = cs.tele_pd ?? {};
const elig = cs.eligibility ?? {};
const cm = cs.credit_manager ?? {};
const bre = cs.deviations_bre ?? [];
const FOIR_CAP = elig.foir_cap ?? 0.6;

function line(key, value, tone, provKey) {
  return { key, value, tone, prov: provKey ? prov[provKey] : undefined };
}
// Voice PD facts have no pipeline provenance — they're captured on the voice-agent
// call, so they carry a placeholder pill explicitly.
const pline = (key, value, tone) => ({ key, value, tone, prov: "placeholder" });

export const PHASES = [
  {
    id: "form",
    phase: "Phase 0",
    title: "Application received",
    subtitle: "Customer form · consent · channel hand-off",
    kind: "native",
    modelTags: ["customer channel · mock"],
    agents: [
      { actor: "channel", action: "receive_application", detail: `${formatINR(ik.loan_amount_req)} · ${num(ik.tenure_req)} months · ${ik.address?.city ?? emDash}`, tone: "mock" },
      { actor: "channel", action: "capture_consent", detail: "consent captured · bureau pull authorised", tone: "mock" },
      { actor: "Orchestrator", action: "open_case", detail: `case ${cs.case_id} · customer ${cs.customer_id}`, tone: "info" },
    ],
    data: [
      line("loan_amount_req", formatINR(ik.loan_amount_req), "caution", "intake.loan_amount_req"),
      line("tenure_req", `${num(ik.tenure_req)} months`, "caution"),
      line("declared_income", `${formatINR(ik.declared_income)} / mo`, "ok", "intake.declared_income"),
      line("employer", `"${ik.employer ?? emDash}"`, "info"),
      line("address", `${ik.address?.line ?? emDash}, ${ik.address?.city ?? emDash} ${ik.address?.pincode ?? ""}`, "info"),
      line("consent_captured", bool(ik.consent_captured), "ok", "intake.consent_captured"),
    ],
    warnings: [],
    patch: { intake: { loan_amount_req: ik.loan_amount_req, tenure_req: ik.tenure_req, declared_income: ik.declared_income } },
  },

  {
    id: "intake",
    phase: "Phase 1",
    title: "Intake & Verification",
    subtitle: "Karza API · KYC API · Address Agent",
    kind: "native",
    modelTags: ["API call · GET / push", `address model · ${addr.model_version ?? "address-quality"}`],
    // Three sub-steps that make up intake (rendered as small nodes / chips).
    subPhases: [
      { id: "karza_api", label: "Karza API", detail: "PAN · identity verified", tone: "mock" },
      { id: "kyc_api", label: "KYC API", detail: "EPFO · consent captured", tone: "mock" },
      {
        id: "address_agent",
        label: "Address Agent",
        detail: `${num(addr.score)}/100 · ${addr.band ?? emDash}`,
        tone: addr.review_flag ? "caution" : "placeholder",
      },
    ],
    agents: [
      { actor: "karza_api", action: "verify_identity", detail: "PAN · identity verified", tone: "mock" },
      { actor: "kyc_api", action: "verify_kyc", detail: "EPFO 36M · consent captured · bureau pull unlocked", tone: "mock" },
      { actor: "address_agent", action: "score", detail: `${ik.address?.city ?? "applicant"} · ${num(addr.score)}/100 · band ${addr.band} (${addr.model_version})`, tone: "placeholder" },
      ...(addr.reasons ?? []).map((rsn) => ({
        actor: "address_agent ·",
        action: rsn.direction === "positive" ? "↑" : "↓",
        detail: rsn.label,
        tone: rsn.direction === "positive" ? "ok" : "caution",
      })),
      { actor: "address_agent", action: "pd_nudge", detail: `pd_adjustment ${num(addr.pd_adjustment)} → folded into ML · L0_ADDRESS ${addr.review_flag ? "flag" : "clear"}`, tone: addr.review_flag ? "caution" : "info" },
      { actor: "validator", action: "schema", detail: "intake ✓", tone: "ok" },
    ],
    data: [
      line("kyc_verified", bool(ik.kyc_verified), "ok", "intake.kyc_verified"),
      line("consent_captured", bool(ik.consent_captured), "ok", "intake.consent_captured"),
      line("address_score", `${num(addr.score)} / 100 · ${addr.band ?? emDash}`, addr.band === "LOW" ? "danger" : "ok", "address.score"),
      line("address_pd_adjustment", num(addr.pd_adjustment), "caution", "address.pd_adjustment"),
      line("address_model", `"${addr.model_version ?? emDash}"`, "info"),
    ],
    warnings: cs.warnings.filter((w) => w.startsWith("intake")),
    patch: { intake: ik, address: { score: addr.score, band: addr.band, pd_adjustment: addr.pd_adjustment } },
  },

  {
    id: "layer2",
    phase: "Phase 2",
    title: "Bureau ∥ Banking",
    subtitle: "Bureau & Banking analysers · parallel fan-out",
    kind: "subprocess",
    parallel: true,
    modelTags: ["parallel fan-out", "2 analysers · parallel"],
    elapsed: layer2Elapsed ? `${layer2Elapsed}s wall` : "",
    branches: [
      {
        id: "bureau",
        tag: "2A",
        title: "Bureau Analyser",
        status: r.status,
        modelTags: ["Kotak Bureau Analyser", elapsed("bureau")],
        report: r.report_path,
        agents: [
          { actor: "Orchestrator", action: "invoke analyser", detail: "Kotak Bureau Analyser · isolated runtime", tone: "info" },
          ...AGENT_NARRATIVES.bureau.consoleLines.map((l) => ({ actor: "agent:bureau_analyzer", action: "▸", detail: l, tone: "agent" })),
          { actor: "agent:bureau_analyzer", action: "generate_combined_report_pdf", detail: "BureauReport + PDF · analyser narrative", tone: "agent" },
        ],
        narrative: AGENT_NARRATIVES.bureau,
        // Values prefer the live figure parsed from bureau_agent_report.html,
        // falling back to the captured caseState summary when absent.
        data: [
          line("cibil_score", BUR.cibil ?? num(rs.cibil_score), "ok", "summary.cibil_score"),
          line("npa_flag", bool(rs.npa_flag), "ok", "summary.npa_flag"),
          line("total_exposure", inrStr(BUR.totalOutstanding) ?? formatINR(rs.total_exposure), "caution", "summary.total_exposure"),
          line("max_dpd_overall", num(rs.max_dpd_overall), "ok", "summary.max_dpd_overall"),
          line("enq_count", BUR.enquiries12m ?? num(rs.enq_count), "ok", "summary.enq_count"),
        ],
      },
      {
        id: "banking",
        tag: "2B",
        title: "Banking Analyser",
        status: b.status,
        modelTags: ["Kotak Banking Analyser", elapsed("banking")],
        report: b.report_path,
        agents: [
          { actor: "Orchestrator", action: "invoke analyser", detail: "Kotak Banking Analyser · isolated runtime", tone: "info" },
          ...AGENT_NARRATIVES.banking.consoleLines.map((l) => ({ actor: "agent:banking_analyzer", action: "▸", detail: l, tone: "agent" })),
          { actor: "agent:banking_analyzer", action: "generate_bank_report", detail: "CustomerReport + HTML · analyser narrative", tone: "agent" },
        ],
        narrative: AGENT_NARRATIVES.banking,
        // Salary / EMI prefer the live figure parsed from banking_agent_report.html
        // (same numbers the Agent narrative cites), falling back to caseState.
        data: [
          line("salary_income_detected", `${inrStr(BKR.salaryPerMonth) ?? formatINR(bs.salary_income_detected)} / mo`, "ok", "summary.salary_income_detected"),
          line("existing_emi_debits", `${inrStr(BKR.emiPerPayment) ?? formatINR(bs.existing_emi_debits)} / mo`, "caution", "summary.existing_emi_debits"),
          line("affluence_band", `"${bs.affluence_band ?? emDash}"`, "ok", "summary.affluence_band"),
          line("spend_category", `"${bs.spend_category ?? emDash}"`, "info"),
          line("bounce_count", num(bs.bounce_count), "ok", "summary.bounce_count"),
        ],
      },
    ],
    agents: [
      { actor: "mappers", action: "fold", detail: "branch summaries → Layer2Summary", tone: "info" },
      { actor: "validator", action: "validate_layer2", detail: `${cs.warnings.filter((w) => w.startsWith("layer2")).length} warnings · no fabrication (absent → None)`, tone: "caution" },
      { actor: "Orchestrator", action: "sufficiency_gate", detail: "CIBIL present → usable · proceed", tone: "ok" },
    ],
    data: [],
    warnings: cs.warnings.filter((w) => w.startsWith("layer2")).slice(0, 4),
    patch: { branches: { banking: b.status, bureau: r.status }, summary: cs.summary },
  },

  {
    id: "ml",
    phase: "Phase 3",
    title: "ML Scorecard",
    subtitle: "BRE hit · PD · Affluence · FOIR",
    kind: "native",
    modelTags: ["BRE hit · GET / push", "PD · affluence · FOIR"],
    agents: [
      { actor: "BRE", action: "pd_score", detail: `${ml.pd_score} · band ${ml.risk_band}`, tone: "info" },
      { actor: "BRE", action: "affluence_segment", detail: `${ml.affluence_segment}`, tone: "info" },
      { actor: "BRE", action: "foir_existing", detail: `${ml.foir_existing} (D1: income = declared)`, tone: "info" },
    ],
    data: [
      line("pd_score", num(ml.pd_score), "ok", "ml.pd_score"),
      line("risk_band", `Band ${num(ml.risk_band)} / 5`, "ok", "ml.risk_band"),
      line("affluence_segment", `"${ml.affluence_segment ?? emDash}"`, "ok"),
      line("income_used", `${formatINR(ml.income_used)} · ${ml.income_source}`, "ok"),
      line("foir_existing", num(ml.foir_existing), "caution", "ml.foir_existing"),
    ],
    warnings: [],
    patch: { ml: { pd_score: ml.pd_score, risk_band: ml.risk_band, foir_existing: ml.foir_existing, income_source: ml.income_source } },
  },

  {
    id: "policy",
    phase: "Phase 4",
    title: "Policy & BRE Deviations",
    subtitle: "Credit policy waterfall · BRE deviations · Credit Refer",
    kind: "native",
    modelTags: ["credit policy waterfall", `${bre.length} BRE deviations`],
    agents: [
      { actor: "Credit Policy", action: "evaluate", detail: "policy layers · BRE deviation check", tone: "info" },
      ...(pol.layers ?? []).map((l) => ({
        actor: l.layer,
        action: l.passed ? "PASS" : "BREACH",
        detail: l.detail ?? l.reason_code,
        tone: l.passed ? "ok" : "caution",
      })),
      ...bre.map((d) => ({ actor: `BRE · ${d.level}`, action: "Credit Refer", detail: d.rule_description, tone: d.level === "L7" || d.level === "L3" ? "caution" : "info" })),
      { actor: "policy", action: pol.result, detail: `segment ${pol.approved_segment} · ${bre.length} deviations referred to credit`, tone: pol.result === "APPROVED" ? "ok" : "caution" },
    ],
    data: [
      ...(pol.layers ?? []).map((l) => line(l.layer, l.passed ? "PASS" : "BREACH", l.passed ? "ok" : "danger")),
      line("bre_deviations", `${bre.length} (${bre.filter((d) => d.level === "L7").length} at L7 · residence at L3)`, "danger"),
      line("policy_result", `${pol.result} (with deviations)`, pol.result === "APPROVED" ? "ok" : "danger"),
    ],
    warnings: [],
    patch: { policy: { result: pol.result, approved_segment: pol.approved_segment, deviations: bre.length } },
  },

  {
    id: "telePd",
    phase: "Credit PD",
    title: "Credit PD — Voice Verification",
    subtitle: "Credit manager call · structured questions · field-history sourced",
    kind: "agent",
    floating: true,
    modelTags: ["credit PD · voice call", "field-history sourced"],
    agents: [
      { actor: tp.officer ?? "credit_pd", action: "dial_customer", detail: `structured Credit PD on ${ik.address?.city ?? "applicant"} · pulls policy deviations`, tone: "info" },
      ...(tp.questions ?? []).map((q) => ({ actor: "credit_pd", action: "ask", detail: `${q.q} → ${q.answer}`, tone: q.tone ?? "info" })),
      ...(tp.deviation_reasons ?? []).map((d) => ({ actor: "credit_pd ·", action: "deviation", detail: d, tone: "caution" })),
      { actor: "credit_pd", action: "capture", detail: `${(tp.questions ?? []).length} answers · ${(tp.deviation_reasons ?? []).length} deviation reasons → folded into Decision`, tone: "ok" },
    ],
    // One line per captured answer (id → answer); driven entirely by the
    // field-history-sourced tele_pd block (no hard-coded question ids).
    data: [
      ...(tp.questions ?? []).map((q) => pline(q.id, q.answer ?? emDash, q.tone ?? "info")),
      pline("deviation_reasons", `${(tp.deviation_reasons ?? []).length} captured`, "caution"),
    ],
    questions: tp.questions ?? [],
    deviationReasons: tp.deviation_reasons ?? [],
    ctcDocument: tp.ctc_document,
    warnings: [],
    patch: { tele_pd: { status: tp.status, answers: (tp.questions ?? []).length } },
  },

  {
    id: "decision",
    phase: "Phase 5",
    title: "Decision & Offer",
    subtitle: "Eligibility · Serviceability · Override · Sanction",
    kind: "native",
    modelTags: ["FOIR / multiplier / product-cap", "manual override"],
    agents: [
      { actor: "eligibility", action: "MIN", detail: `FOIR ${formatINR(elig.foir_loan_amount)} · 16x ${formatINR(elig.multiplier_amount)} · cap ${formatINR(elig.product_cap)} → system-eligible ${formatINR(elig.system_eligible_amount)}`, tone: "info" },
      {
        actor: "serviceability",
        action: dec.serviceable ? "PASS" : "FAIL",
        detail: `foir_proposed ${formatPct((dec.foir_proposed ?? 0) * 100)} vs cap ${formatPct(FOIR_CAP * 100)} (post-BT)`,
        tone: dec.serviceable ? "ok" : "danger",
      },
      { actor: "override", action: "L7", detail: `sanctioned ${formatINR(elig.approved_amount)} vs eligible ${formatINR(elig.system_eligible_amount)} (+${formatINR(elig.override_excess)}) · ${elig.approved_multiplier}x · ${cm.approved_by ?? "credit head"}`, tone: "caution" },
      { actor: "sanction", action: "offer", detail: `${formatINR(dec.offer_amount)} · ${formatPct((dec.offer_irr ?? 0) * 100)} · ${formatEMI(dec.offer_emi)}`, tone: "info" },
    ],
    data: [
      line("system_eligible", formatINR(elig.system_eligible_amount), "ok"),
      line("multiplier", `16x policy · ${num(elig.approved_multiplier)}x approved`, "danger"),
      line("product_cap", formatINR(elig.product_cap), "caution"),
      line("serviceable", bool(dec.serviceable), dec.serviceable ? "ok" : "danger"),
      line("foir_proposed", `${formatPct((dec.foir_proposed ?? 0) * 100)} vs ${formatPct(FOIR_CAP * 100)} cap`, "caution", "decision.foir_proposed"),
      line("sanctioned_amount", `${formatINR(dec.offer_amount)} (override +${formatINR(elig.override_excess)})`, "danger"),
      line("offer_tenure", `${num(dec.offer_tenure)} months`, "info"),
      line("offer_irr", formatPct(dec.offer_irr == null ? null : dec.offer_irr * 100), "ok", "decision.offer_irr"),
      line("offer_emi", formatEMI(dec.offer_emi), "caution", "decision.offer_emi"),
    ],
    warnings: cs.warnings.filter((w) => w.startsWith("orchestrator")),
    patch: { decision: { serviceable: dec.serviceable, foir_proposed: dec.foir_proposed, offer_emi: dec.offer_emi } },
  },

  {
    id: "finalize",
    phase: "Phase 6",
    title: "Finalize & Audit",
    subtitle: "Recommend · Approve · Audit pack · Provenance",
    kind: "native",
    modelTags: ["credit sign-off", "audit pack"],
    agents: [
      { actor: "Recommended by", action: "reco", detail: `${cm.recommended_by_first ?? emDash} → ${cm.recommended_by_last ?? emDash} · ₹25L/60m with HDFC PL BT · FOIR 52% · 19x`, tone: "info" },
      { actor: "Approved by", action: cs.outcome, detail: `${cm.approved_by ?? emDash} · management override on ₹20L cap`, tone: cs.outcome === "APPROVED" ? "ok" : "caution" },
      { actor: "tool:write_audit_pack", action: "assemble", detail: "artifacts + provenance map + CaseState snapshot", tone: "info" },
      { actor: "Disbursed by", action: "disbursal", detail: `${cm.disbursed_by ?? emDash} · ${cm.disbursal_date ?? emDash} · net ${formatINR(dec.net_disbursal)} (paperless)`, tone: "info" },
    ],
    data: [
      line("DECISION", `${cs.outcome} ${formatINR(dec.offer_amount)}`, cs.outcome === "APPROVED" ? "ok" : "danger"),
      line("recommended_by", `${cm.recommended_by_first ?? emDash} · ${cm.recommended_by_last ?? emDash}`, "info"),
      line("approved_by", cm.approved_by ?? emDash, "ok"),
      line("decision_date", cm.decision_date ?? emDash, "info"),
      line("audit_pack", "output/" + cs.case_id, "ok"),
      line("provenance_map", `${Object.keys(prov).length} fields tagged`, "info"),
    ],
    warnings: [],
    patch: { outcome: cs.outcome, finalize: { decision: fin.decision, push_sent: fin.push_sent } },
  },

  {
    id: "notify",
    phase: "Phase 7",
    title: "Customer notified",
    subtitle: "Push · decision delivered to the customer journey",
    kind: "native",
    modelTags: ["push channel · mock"],
    agents: [
      { actor: "tool:push_notification", action: "send", detail: `[mock-push] ${cs.case_id} → ${cs.outcome}`, tone: "mock" },
      { actor: "channel", action: "deliver", detail: "customer opens the journey view · agent narrates the decision", tone: "info" },
    ],
    data: [
      line("push_sent", bool(fin.push_sent), "ok"),
      line("payload", `"${cs.case_id} → ${cs.outcome}"`, "info"),
    ],
    warnings: cs.warnings.filter((w) => w.startsWith("finalize")),
    patch: { notified: fin.push_sent },
  },
];

// One talking point per phase, shown in the presentation-mode caption so the
// presenter can literally read the screen.
const PRESENTER_NOTES = {
  form: `A real application, captured end-to-end — ${formatINR(ik.loan_amount_req)} over ${num(ik.tenure_req)} months on a ${formatINR(ik.declared_income)} declared income.`,
  intake: "Identity and KYC return over GET/push API calls, scored by an address-quality model — no LLM, effectively instant.",
  layer2: `The bureau and banking analysers run in parallel — ${Math.round(((cs.branches?.bureau?.elapsed_s ?? 0) + (cs.branches?.banking?.elapsed_s ?? 0)) * 10) / 10}s of analysis in ${layer2Elapsed ?? "—"}s wall-clock.`,
  ml: "The scorecard returns PD, affluence and existing FOIR — reproducible and fully auditable.",
  policy: `The credit policy waterfall and BRE flag ${bre.length} deviations — including the ₹20L product-cap breach, the 19x multiplier and the negative residence verification — all referred to credit.`,
  telePd: "A credit-PD voice call (sourced from the field history) validates income, family, assets and residence, and captures the reasons behind every deviation before the decision is taken.",
  decision: `Eligibility binds at the ₹20L product cap; FOIR 52% sits within the 60% cap once the HDFC balance transfer nets out — and a management override sanctions the full ₹25L.`,
  finalize: "Decision stamped with an audit pack, a field-by-field provenance map and pinned model versions.",
  notify: "Customer notified instantly — switch to the customer view to see exactly what they experienced.",
};
PHASES.forEach((p) => {
  p.presenterNote = PRESENTER_NOTES[p.id];
});

const agentCount = PHASES.reduce(
  (n, p) => n + p.agents.length + (p.branches ?? []).reduce((m, br) => m + br.agents.length, 0),
  0
);
const wallClockS = trace
  .filter((t) => t.kind === "stage")
  .reduce((s, t) => s + (t.elapsed_s || 0), 0);

// Every case-dict field tagged with where its value came from (real run output).
export const PROVENANCE = prov;

export const META = {
  phases: PHASES.length,
  caseId: cs.case_id,
  runId: cs.run_id,
  customerId: cs.customer_id,
  outcome: cs.outcome,
  warnings: cs.warnings.length,
  agentCount,
  wallClockS: Math.round(wallClockS * 10) / 10,
};

// Raw numbers behind the per-phase visualizations (all from the real run).
const branchElapsed = (branch) =>
  (trace.find((t) => t.kind === "branch" && t.branch === branch) || {}).elapsed_s ?? null;

export const VIZ = {
  // The application as the customer submitted it (all from the captured intake).
  form: {
    caseId: cs.case_id,
    amount: ik.loan_amount_req,
    tenure: ik.tenure_req,
    income: ik.declared_income,
    employer: ik.employer,
    address: ik.address ?? {},
    consent: ik.consent_captured ?? false,
  },
  branches: [
    { id: "bureau", tag: "2A", label: "Bureau Agent", elapsed: branchElapsed("bureau") },
    { id: "banking", tag: "2B", label: "Banking Agent", elapsed: branchElapsed("banking") },
  ],
  layer2Wall: layer2Elapsed ?? null,
  address: {
    score: addr.score ?? null,
    band: addr.band ?? null,
    probGood: addr.prob_good ?? null,
    confidence: addr.confidence ?? null,
    pdAdjustment: addr.pd_adjustment ?? null,
    reviewFlag: addr.review_flag ?? false,
    reasons: addr.reasons ?? [],
    bandHigh: 75,
    bandMedium: 50,
  },
  policy: { layers: pol.layers ?? [], result: pol.result },
  // The completion verdict: the run's central tension — clean credit, failed
  // affordability — split into its two truths.
  verdict: {
    outcome: cs.outcome,
    cibil: rs.cibil_score ?? null,
    policyPassed: (pol.layers ?? []).filter((l) => l.passed).length,
    policyTotal: (pol.layers ?? []).length,
    policyResult: pol.result,
    serviceable: dec.serviceable ?? false,
    foirProposed: dec.foir_proposed ?? null,
    foirCap: FOIR_CAP,
    emi: dec.offer_emi ?? null,
    income: ik.declared_income ?? null,
  },
  foir: {
    proposed: dec.foir_proposed,
    cap: FOIR_CAP,
    emi: dec.offer_emi,
    income: ik.declared_income,
  },
  stages: trace
    .filter((t) => t.kind === "stage")
    .map((t) => ({ stage: t.stage, elapsed: t.elapsed_s || 0 })),
  wallClockS: Math.round(wallClockS * 10) / 10,
};

// Flatten phases into a playback timeline (one step per agent call / data line,
// bracketed by phase start/done) so a single cursor drives reveal + log + dict.
export function buildTimeline(phases) {
  const steps = [];
  phases.forEach((p, pi) => {
    steps.push({ kind: "start", phaseIndex: pi });
    const branchAgents = (p.branches ?? []).flatMap((br) =>
      br.agents.map((a) => ({ ...a, branchId: br.id }))
    );
    [...branchAgents, ...p.agents].forEach((a) => steps.push({ kind: "agent", phaseIndex: pi, agent: a }));
    steps.push({ kind: "done", phaseIndex: pi });
  });
  return steps;
}
