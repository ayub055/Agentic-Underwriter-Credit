// Build the CEO "Agentic Journey" phases from a REAL captured CaseState + trace.
// Values are read from the real run (no fabrication); agent-call descriptors
// reflect the actual architecture (subprocess isolation, Ollama narrative,
// deterministic native stages).

import { formatINR, formatEMI, formatPct, emDash } from "../lib/format.js";
import caseState from "../data/realRun/caseState.json";
import trace from "../data/realRun/trace.json";

const cs = caseState;
const prov = cs.finalize?.provenance_map ?? {};
const num = (v) => (v === null || v === undefined ? emDash : v);
const bool = (v) => (v === null || v === undefined ? emDash : v ? "TRUE" : "FALSE");

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

function line(key, value, tone, provKey) {
  return { key, value, tone, prov: provKey ? prov[provKey] : undefined };
}

export const PHASES = [
  {
    id: "intake",
    phase: "Phase 1",
    title: "Intake",
    subtitle: "Karza API · KYC API · Address Agent",
    kind: "native",
    modelTags: ["deterministic · no LLM", `address model · ${addr.model_version ?? "address-quality"}`],
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
      line("loan_amount_req", formatINR(ik.loan_amount_req), "caution", "intake.loan_amount_req"),
      line("tenure_req", `${num(ik.tenure_req)} months`, "caution"),
      line("declared_income", `${formatINR(ik.declared_income)} / mo`, "ok", "intake.declared_income"),
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
    subtitle: "Parallel isolated subprocesses · Step-function fan-out",
    kind: "subprocess",
    parallel: true,
    modelTags: ["Step-function fan-out", "2 isolated subprocesses · asyncio.gather"],
    elapsed: layer2Elapsed ? `${layer2Elapsed}s wall` : "",
    branches: [
      {
        id: "bureau",
        tag: "2A",
        title: "Bureau Analyser",
        status: r.status,
        modelTags: ["subprocess · Bureau_Agent", "Ollama narrative", elapsed("bureau")],
        report: r.report_path,
        agents: [
          { actor: "Orchestrator", action: "spawn subprocess", detail: "Bureau_Agent · isolated venv (import collision avoided)", tone: "info" },
          { actor: "agent:bureau_analyzer", action: "generate_combined_report_pdf", detail: "BureauReport + PDF · Ollama narrative", tone: "agent" },
        ],
        data: [
          line("cibil_score", num(rs.cibil_score), "ok", "summary.cibil_score"),
          line("npa_flag", bool(rs.npa_flag), "ok", "summary.npa_flag"),
          line("total_exposure", formatINR(rs.total_exposure), "caution", "summary.total_exposure"),
          line("max_dpd_overall", num(rs.max_dpd_overall), "ok", "summary.max_dpd_overall"),
          line("enq_count", num(rs.enq_count), "ok", "summary.enq_count"),
        ],
      },
      {
        id: "banking",
        tag: "2B",
        title: "Banking Analyser",
        status: b.status,
        modelTags: ["subprocess · Banking_Agent", "Ollama narrative", elapsed("banking")],
        report: b.report_path,
        agents: [
          { actor: "Orchestrator", action: "spawn subprocess", detail: "Banking_Agent · isolated venv", tone: "info" },
          { actor: "agent:banking_analyzer", action: "generate_bank_report", detail: "CustomerReport + HTML · Ollama narrative", tone: "agent" },
        ],
        data: [
          line("salary_income_detected", `${formatINR(bs.salary_income_detected)} / mo`, "ok", "summary.salary_income_detected"),
          line("existing_emi_debits", `${formatINR(bs.existing_emi_debits)} / mo`, "caution", "summary.existing_emi_debits"),
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
    subtitle: "Deterministic · PD · Affluence · FOIR",
    kind: "native",
    modelTags: ["deterministic · no LLM", "placeholder PD · scorecard seam"],
    agents: [
      { actor: "tool:scorecard", action: "pd_score", detail: `${ml.pd_score} · band ${ml.risk_band} (placeholder)`, tone: "placeholder" },
      { actor: "tool:affluence", action: "segment", detail: `${ml.affluence_segment}`, tone: "info" },
      { actor: "tool:foir", action: "existing", detail: `${ml.foir_existing} (D1: income = declared)`, tone: "info" },
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
    title: "Policy Waterfall",
    subtitle: "L1–L6 deterministic · mid-zone LLM hook",
    kind: "native",
    modelTags: ["Python rules · L1–L6", "LLM mid-zone hook (idle)"],
    agents: [
      { actor: "tool:policy_waterfall", action: "evaluate", detail: "L1–L6 · short-circuit on decline", tone: "info" },
      ...(pol.layers ?? []).map((l) => ({
        actor: l.layer,
        action: l.passed ? "PASS" : "BREACH",
        detail: l.detail ?? l.reason_code,
        tone: l.passed ? "ok" : "caution",
      })),
      { actor: "policy", action: pol.result, detail: `segment ${pol.approved_segment} · ai_assisted=${pol.ai_assisted_flag}`, tone: pol.result === "APPROVED" ? "ok" : "caution" },
    ],
    data: [
      ...(pol.layers ?? []).map((l) => line(l.layer, l.passed ? "PASS" : "BREACH", l.passed ? "ok" : "danger")),
      line("policy_result", pol.result, pol.result === "APPROVED" ? "ok" : "danger"),
      line("ai_assisted_flag", bool(pol.ai_assisted_flag), "ok"),
    ],
    warnings: [],
    patch: { policy: { result: pol.result, approved_segment: pol.approved_segment, ai_assisted_flag: pol.ai_assisted_flag } },
  },

  {
    id: "decision",
    phase: "Phase 5",
    title: "Decision & Offer",
    subtitle: "Selection · Serviceability · Amortisation",
    kind: "native",
    modelTags: ["deterministic gates", "placeholder pricing table"],
    agents: [
      { actor: "tool:selection", action: "PASS", detail: "policy APPROVED · risk band ok", tone: "ok" },
      {
        actor: "tool:serviceability",
        action: dec.serviceable ? "PASS" : "FAIL",
        detail: `foir_proposed ${dec.foir_proposed} vs cap 0.50`,
        tone: dec.serviceable ? "ok" : "danger",
      },
      { actor: "tool:prospect_calculator", action: "offer", detail: `${formatINR(dec.offer_amount)} · ${formatEMI(dec.offer_emi)}`, tone: "info" },
    ],
    data: [
      line("selected", bool(dec.selected), "ok"),
      line("serviceable", bool(dec.serviceable), dec.serviceable ? "ok" : "danger"),
      line("foir_proposed", num(dec.foir_proposed), "danger", "decision.foir_proposed"),
      line("offer_amount", formatINR(dec.offer_amount), "info"),
      line("offer_tenure", `${num(dec.offer_tenure)} months`, "info"),
      line("offer_irr", formatPct(dec.offer_irr == null ? null : dec.offer_irr * 100), "caution", "decision.offer_irr"),
      line("offer_emi", formatEMI(dec.offer_emi), "caution", "decision.offer_emi"),
    ],
    warnings: cs.warnings.filter((w) => w.startsWith("orchestrator")),
    patch: { decision: { serviceable: dec.serviceable, foir_proposed: dec.foir_proposed, offer_emi: dec.offer_emi } },
  },

  {
    id: "finalize",
    phase: "Phase 6",
    title: "Finalize & Audit",
    subtitle: "Stamp · Audit pack · Provenance · Push",
    kind: "native",
    modelTags: ["local audit pack", "S3+KMS seam"],
    agents: [
      { actor: "tool:stamp_decision", action: cs.outcome, detail: "outcome stamped", tone: cs.outcome === "APPROVED" ? "ok" : "caution" },
      { actor: "tool:write_audit_pack", action: "assemble", detail: "artifacts + provenance map + CaseState snapshot", tone: "info" },
      { actor: "tool:push_notification", action: "mock", detail: "push logged (not sent)", tone: "mock" },
      { actor: "model_versions", action: "pinned", detail: Object.entries(fin.model_versions ?? {}).map(([k, v]) => `${k}=${v}`).join(" · "), tone: "info" },
    ],
    data: [
      line("DECISION", cs.outcome, cs.outcome === "APPROVED" ? "ok" : "danger"),
      line("audit_pack", "output/" + cs.case_id, "ok"),
      line("push_sent", bool(fin.push_sent), "ok"),
      line("provenance_map", `${Object.keys(prov).length} fields tagged`, "info"),
    ],
    warnings: [],
    patch: { outcome: cs.outcome, finalize: { decision: fin.decision, push_sent: fin.push_sent } },
  },
];

const agentCount = PHASES.reduce(
  (n, p) => n + p.agents.length + (p.branches ?? []).reduce((m, br) => m + br.agents.length, 0),
  0
);
const wallClockS = trace
  .filter((t) => t.kind === "stage")
  .reduce((s, t) => s + (t.elapsed_s || 0), 0);

export const META = {
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
    foirCap: 0.5,
    emi: dec.offer_emi ?? null,
    income: ik.declared_income ?? null,
  },
  foir: {
    proposed: dec.foir_proposed,
    cap: 0.5,
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
