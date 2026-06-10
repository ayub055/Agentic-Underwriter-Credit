// CaseState-shaped fixtures mirroring journey/output/<case_id>/case_state.json.
// Keyed by the UI status they exercise; each carries a real backend `outcome`
// that mapCaseStateToView() translates.

export const caseFixtures = {
  approved: {
    customer_id: 771203004,
    case_id: "PL-2026-4af19c",
    outcome: "APPROVED",
    intake: {
      loan_amount_req: 800000,
      tenure_req: 60,
      declared_income: 118000,
      address: { city: "Pune", pincode: "411014", ownership: "owned" },
    },
    address: {
      score: 88.6,
      band: "HIGH",
      review_flag: false,
      reasons: [
        { code: "OWNERSHIP_OWNED", label: "Self-owned residence", direction: "positive" },
        { code: "GEO_RISK_INDEX", label: "Low-risk geographic zone", direction: "positive" },
      ],
    },
    stage_status: {
      intake: "done",
      layer2: "done",
      sufficiency: "done",
      ml: "done",
      policy: "done",
      decision: "done",
      finalize: "done",
    },
    decision: {
      selected: true,
      serviceable: true,
      contactible: true,
      foir_proposed: 0.31,
      offer_amount: 800000,
      offer_tenure: 60,
      offer_irr: 0.1099,
      offer_emi: 17392,
      processing_fee: 8000,
    },
  },

  review: {
    customer_id: 540881229,
    case_id: "PL-2026-7c0d2e",
    outcome: "MANUAL_REVIEW",
    intake: {
      loan_amount_req: 650000,
      tenure_req: 48,
      declared_income: 84000,
      address: { city: "Mumbai", pincode: "400050", ownership: "rented" },
    },
    address: {
      score: 66.2,
      band: "MEDIUM",
      review_flag: false,
      reasons: [
        { code: "PINCODE_SERVICEABLE", label: "PIN inside serviceable network", direction: "positive" },
        { code: "OWNERSHIP_OWNED", label: "Rented residence", direction: "negative" },
      ],
    },
    stage_status: {
      intake: "done",
      layer2: "done",
      sufficiency: "done",
      ml: "done",
      policy: "running",
      decision: "waiting",
      finalize: "waiting",
    },
    decision: {
      selected: null,
      serviceable: null,
      contactible: null,
      foir_proposed: null,
      offer_amount: null,
      offer_tenure: null,
      offer_irr: null,
      offer_emi: null,
      processing_fee: null,
    },
  },

  rejected: {
    customer_id: 698167220,
    case_id: "PL-2026-8bd9c6",
    outcome: "DECLINED",
    intake: {
      loan_amount_req: 500000,
      tenure_req: 12,
      declared_income: 60000,
      address: { city: "Bengaluru", pincode: "560103", ownership: "owned" },
    },
    address: {
      score: 83.4,
      band: "HIGH",
      review_flag: false,
      reasons: [
        { code: "GEO_RISK_INDEX", label: "Low-risk geographic zone", direction: "positive" },
        { code: "ADDRESS_COMPLETENESS", label: "Complete, well-formed address", direction: "positive" },
      ],
    },
    stage_status: {
      intake: "done",
      layer2: "done",
      sufficiency: "done",
      ml: "done",
      policy: "done",
      decision: "done",
      finalize: "done",
    },
    decision: {
      selected: true,
      serviceable: false,
      contactible: true,
      foir_proposed: 1.1868,
      offer_amount: 500000,
      offer_tenure: 12,
      offer_irr: 0.1349,
      offer_emi: 44773.66,
      processing_fee: 7500,
    },
  },
};
