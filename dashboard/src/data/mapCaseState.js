// Single translation point: journey CaseState -> presentational view model.

const OUTCOME_TO_STATUS = {
  APPROVED: "approved",
  MANUAL_REVIEW: "review",
  INSUFFICIENT_DATA: "review", // operational; reassuring copy variant
  DECLINED: "rejected",
};

const STAGE_TO_STEP = {
  done: "done",
  running: "current",
  waiting: "upcoming",
  skipped: "upcoming",
  failed: "upcoming",
};

function stepState(stageStatus, stage) {
  return STAGE_TO_STEP[stageStatus?.[stage]] ?? "upcoming";
}

export function mapCaseStateToView(cs) {
  const d = cs.decision ?? {};
  const status = OUTCOME_TO_STATUS[cs.outcome] ?? "review";
  // While under review the decision is still in flight -> show Offer Generation as current.
  const offerState = status === "review" ? "current" : stepState(cs.stage_status, "decision");
  const income = cs.intake?.declared_income ?? null;
  // Back out existing monthly obligations from the proposed FOIR so the UI can
  // narrate affordability and re-run it live (FOIR = (existing + emi) / income).
  const existingObligations =
    income != null && d.foir_proposed != null && d.offer_emi != null
      ? Math.max(0, Math.round(d.foir_proposed * income - d.offer_emi))
      : null;
  const address = cs.address ?? null;
  return {
    status,
    outcome: cs.outcome,
    applicationId: cs.case_id,
    addressQuality: address
      ? {
          score: address.score ?? null,
          band: address.band ?? null,
          reviewFlag: address.review_flag ?? false,
          reasons: address.reasons ?? [],
          city: cs.intake?.address?.city ?? null,
        }
      : null,
    applicant: {
      income,
      requestedAmount: cs.intake?.loan_amount_req ?? null,
      requestedTenure: cs.intake?.tenure_req ?? null,
    },
    // Real analyser findings (null on synthetic fixtures) — lets the agent's
    // narration quote what it actually found, not just what was declared.
    summary: {
      cibilScore: cs.summary?.cibil_score ?? null,
      salaryDetected: cs.summary?.salary_income_detected ?? null,
      existingEmiDebits: cs.summary?.existing_emi_debits ?? null,
      totalExposure: cs.summary?.total_exposure ?? null,
      bounceCount: cs.summary?.bounce_count ?? null,
      enqCount: cs.summary?.enq_count ?? null,
      npaFlag: cs.summary?.npa_flag ?? null,
    },
    affordability: {
      foirProposed: d.foir_proposed ?? null,
      existingObligations,
    },
    offer: {
      amount: d.offer_amount,
      interestRatePct: d.offer_irr == null ? null : d.offer_irr * 100,
      emi: d.offer_emi,
      tenureMonths: d.offer_tenure,
      processingFee: d.processing_fee,
    },
    tracker: [
      { id: "identity", label: "Identity", state: stepState(cs.stage_status, "intake") },
      { id: "income", label: "Income Verification", state: stepState(cs.stage_status, "layer2") },
      { id: "offer", label: "Offer Generation", state: offerState },
    ],
    review: { etaSeconds: 299 },
  };
}
