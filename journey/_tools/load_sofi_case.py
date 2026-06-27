"""Author the curated SOFI MOHD demo case to match the real source documents.

This is a deterministic, auditable one-shot that loads the saved artifacts and
overlays the *documented* reality of the case (consolidated_application.md,
elidgibility_format_policy.md, whole_journey_field_history.md):

  - APPROVED ₹25,00,000 via management override (system-eligible ₹20L)
  - documented policy: FOIR cap 60%, multiplier 16x (approved 19x), product cap ₹20L
  - CIBIL 739, income ₹1,29,876, sanctioned IRR 12%
  - banking rebuilt from the CAM (HDFC salary a/c, Feb–May 2025, AQB ₹53,036, 0 bounces)
  - voice-PD conversation mirrored from the field history
  - real credit managers + 10 BRE deviations + negative residence verification + assets

It mutates the loaded JSON in place (preserving structure) and writes every
target that holds a copy, so the duplicated banking/bureau slices stay in sync:
  journey/output/<case>/{case_state.json, cam_data.json, sal_slip.json}
  dashboard/src/data/realRun/{caseState.json, trace.json}

Run:  python3 journey/_tools/load_sofi_case.py
Then: <anaconda>/bin/python journey/_tools/regen_cam.py PL-2026-8bd9c6
"""

from __future__ import annotations

import copy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CASE_ID = "PL-2026-8bd9c6"
CASE_DIR = ROOT / "journey" / "output" / CASE_ID
DASH = ROOT / "dashboard" / "src" / "data" / "realRun"

INCOME = 129876.0                         # net salary (CAM §4) — single income figure
REQUESTED = 2500000.0                     # ₹25L requested
APPROVED = 2500000.0                      # ₹25L approved (override)
SYSTEM_ELIGIBLE = 2000000.0               # MIN(FOIR, 16x, cap) — product cap binds
PRODUCT_CAP = 2000000.0
TENURE = 60
IRR = 0.12                                # sanctioned 12% (applied was 16%)
FOIR_CAP = 0.60
EMI_HDFC_BT = 48214.0                     # cleared by balance transfer
EMI_ADITYA = 11762.0                      # remains post-BT
EXISTING_PRE_BT = EMI_HDFC_BT + EMI_ADITYA   # 59,976
EXISTING_POST_BT = EMI_ADITYA                # 11,762


def pmt(principal: float, annual_irr: float, months: int) -> float:
    r = annual_irr / 12.0
    f = (1 + r) ** months
    return round(principal * r * f / (f - 1), 2)


EMI_25L = pmt(APPROVED, IRR, TENURE)                 # ≈ 55,611
EMI_PER_LAC = pmt(100000, IRR, TENURE)               # ≈ 2,224
ALLOWED_EMI = round(INCOME * FOIR_CAP, 2)            # 77,925.60
MAX_SERVICEABLE_EMI = round(ALLOWED_EMI - EXISTING_POST_BT, 2)   # 66,163.60
FOIR_LOAN_AMOUNT = round(MAX_SERVICEABLE_EMI / EMI_PER_LAC * 1e5)
MULTIPLIER_AMOUNT = round(INCOME * 16)               # 20,77,816
APPROVED_MULTIPLIER = round(APPROVED / INCOME, 2)    # 19.25
FOIR_PROPOSED = round((EXISTING_POST_BT + EMI_25L) / INCOME, 4)   # ≈ 0.519
PROCESSING_FEE = 22450.0
NET_DISBURSAL = APPROVED - PROCESSING_FEE            # 24,77,550


# --------------------------------------------------------------------------- #
# Rebuilt banking analyser slice — CAM §4 (HDFC salary a/c, Feb–May 2025).
# Coherent salaried profile: salary ≈ income, AQB ₹53,036, zero bounces, EMIs
# serviced (HDFC PL flagged for balance transfer). No net-deficit narrative.
# --------------------------------------------------------------------------- #
BANKING_MONTHS = ["2025-02", "2025-03", "2025-04", "2025-05"]
EOD_MATRIX = {                                   # day-of-month -> [Feb, Mar, Apr, May]
    "1st":  [8053.64, 30630.67, 61567.51, 62909.43],
    "5th":  [63008.49, 48722.72, 36195.36, 44207.43],
    "10th": [5.67, 17991.72, 230622.56, 9520.23],
    "15th": [18601.67, 8207.72, 11612.56, 3529.23],
    "20th": [40945.67, 3784.67, 8310.56, 82.23],
    "25th": [501.67, 35391.89, 1127.56, 361.23],
    "avg":  [13940.58, 33366.88, 111801.19, 17545.22],
}
MONTHLY_CASHFLOW = [
    {"month": "2025-02", "inflow": 132018.0, "outflow": 118044.0, "net": 13974.0},
    {"month": "2025-03", "inflow": 130410.0, "outflow": 121043.0, "net": 9367.0},
    {"month": "2025-04", "inflow": 158220.0, "outflow": 119400.0, "net": 38820.0},
    {"month": "2025-05", "inflow": 131500.0, "outflow": 124350.0, "net": 7150.0},
]
BANKING_DETAIL = {
    "salary": {
        "avg_amount": INCOME,
        "frequency": 4,
        "narration": "Salary HCL Technologies",
        "account_no": "50100127075731",
        "bank": "HDFC BANK",
        "latest_transaction": {
            "date": "2025-05-31",
            "amount": INCOME,
            "narration": "Salary May 2025 · HCL Technologies",
        },
    },
    "emis": [
        {"name": "HDFC Bank PL (BT)", "amount": EMI_HDFC_BT, "frequency": 4},
        {"name": "Aditya Birla PL", "amount": EMI_ADITYA, "frequency": 4},
    ],
    "savings": None,
    "risk_indicators": None,
    "account_quality": {
        "account_type": "salary",
        "confidence": "high",
        "primary_score": 88,
        "conduit_events": [],
        "conduit_months": 0,
        "salary_outflow_pct_3d": 0.0,
        "atm_debit_pct": 0.0,
        "avg_monthly_debits": 12.0,
        "has_emi_debits": True,
        "has_utility_debits": True,
        "has_rent_visible": False,
        "has_small_ticket_txns": True,
        "average_quarterly_balance": 53036.22,
        "aob_emi_ratio": 1.09,
        "inward_bounces": 0,
        "outward_bounces": 0,
        "observations": [
            "HDFC salary account (a/c 50100127075731) — salary ≈ ₹1,29,876 credited monthly.",
            "Average quarterly balance ₹53,036 · AOB/EMI 1.09 · zero inward & outward bounces.",
        ],
    },
    "checklist": {
        "banking": [
            {"label": "ECS / NACH bounces", "checked": False, "severity": "positive",
             "detail": "0 inward · 0 outward bounces"},
            {"label": "Salary detected in banking", "checked": True, "severity": "positive",
             "detail": "₹1,29,876 avg · HCL Technologies (4 credits, Feb–May 2025)"},
            {"label": "Salary account confirmed", "checked": True, "severity": "positive",
             "detail": "HDFC a/c 50100127075731 · salary == disbursement account: No"},
            {"label": "Average quarterly balance", "checked": True, "severity": "positive",
             "detail": "₹53,036 · AOB/EMI ratio 1.09"},
            {"label": "EMI obligations present", "checked": True, "severity": "medium",
             "detail": "₹59,976/mo across 2 lenders (HDFC PL ₹48,214 → BT · Aditya Birla ₹11,762)"},
            {"label": "Loan being balance-transferred", "checked": True, "severity": "medium",
             "detail": "HDFC PL O/s ₹7,93,375 · EMI ₹48,214 closed from disbursal"},
            {"label": "Post-disbursement fund diversion", "checked": False, "severity": "neutral",
             "detail": None},
            {"label": "Rent payments present", "checked": False, "severity": "neutral",
             "detail": "Residence rented (with family)"},
        ]
    },
    "monthly_cashflow": MONTHLY_CASHFLOW,
    "eod_matrix": EOD_MATRIX,
    "top_categories": [
        {"category": "EMI / Loan servicing", "amount": 59976.0},
        {"category": "Household & utilities", "amount": 38500.0},
    ],
    "customer_review": (
        "Salaried HDFC account (a/c 50100127075731): salary of about ₹1,29,876 from HCL "
        "Technologies is credited monthly across Feb–May 2025, with an average quarterly "
        "balance of ₹53,036 and an AOB/EMI ratio of 1.09. There are zero inward and zero "
        "outward bounces. Existing EMIs of ₹59,976/month (HDFC PL ₹48,214 and Aditya Birla "
        "PL ₹11,762) are serviced on time; the HDFC personal loan is flagged for balance "
        "transfer and will be closed from disbursal, leaving ₹11,762/month of retained "
        "obligation. Salary credits are somewhat volatile month to month, so the considered "
        "income is the user-entry figure of ₹1,29,876 rather than a banking-derived average. "
        "The account conduct supports the proposed obligation."
    ),
}

# --------------------------------------------------------------------------- #
# Reconciled bureau slice — CAM §5/§6: 3 documented obligations, CIBIL 739.
# Total outstanding ≈ ₹10,44,121 (HDFC ₹7,93,375 + Aditya ₹2,43,790 + CC ₹6,956).
# --------------------------------------------------------------------------- #
BUREAU_DETAIL = {
    "obligations": [
        {
            "loan_type": "credit_card", "secured": False,
            "loan_count": 1, "live_count": 1, "closed_count": 0,
            "total_sanctioned": 19000.0, "total_outstanding": 6956.0,
            "overdue_amount": 0.0, "max_dpd": None, "max_dpd_months_ago": None,
            "delinquency_flag": False, "utilization_ratio": 0.3661,
            "avg_vintage_months": 36.0, "earliest_opened": "May 2021",
            "latest_opened": "May 2021", "latest_closed": None,
            "on_us_count": 0, "on_us_outstanding": 0,
        },
        {
            "loan_type": "personal_loan", "secured": False,
            "loan_count": 2, "live_count": 2, "closed_count": 0,
            "total_sanctioned": 3478043.0, "total_outstanding": 1037165.0,
            "overdue_amount": 0.0, "max_dpd": None, "max_dpd_months_ago": None,
            "delinquency_flag": False, "utilization_ratio": None,
            "avg_vintage_months": 24.0, "earliest_opened": "2020",
            "latest_opened": "2023", "latest_closed": None,
            "on_us_count": 0, "on_us_outstanding": 0,
        },
    ],
    "totals": {
        "total_tradelines": 3, "live_tradelines": 3, "closed_tradelines": 0,
        "total_sanctioned": 3497043.0, "total_outstanding": 1044121.0,
        "unsecured_outstanding": 1044121.0, "tu_score": 739,
        "has_delinquency": False, "max_dpd": None, "max_dpd_loan_type": None,
        "on_us_total_outstanding": 0, "total_joint_count": 0,
    },
    "monthly_exposure": {
        "months": ["Dec 2024", "Jan 2025", "Feb 2025", "Mar 2025", "Apr 2025", "May 2025"],
        "series": {
            "CC": [6956.0] * 6,
            "PL": [1037165.0] * 6,
        },
    },
    "narrative": (
        "Executive summary: the bureau shows a CIBIL score of 739 with a clean repayment "
        "record — zero DPD across all products and windows, no NPA. Three live tradelines "
        "carry a total outstanding of ₹10,44,121 against ₹34,97,043 sanctioned: an HDFC "
        "personal loan (O/s ₹7,93,375, flagged for balance transfer), an Aditya Birla "
        "personal loan (O/s ₹2,43,790, used alongside HDFC for a plot purchase) and one "
        "credit card (O/s ₹6,956, 36.6% utilisation). A recent Axis Bank enquiry did not "
        "convert to a loan. Existing FOIR is elevated pre-balance-transfer; netting the HDFC "
        "PL EMI brings the proposed FOIR to ~52%, within the 60% policy cap."
    ),
}

# --------------------------------------------------------------------------- #
# Documented eligibility (elidgibility_format_policy.md): MIN binds at ₹20L cap,
# approved ₹25L is a +₹5L override at 19x multiplier.
# --------------------------------------------------------------------------- #
ELIGIBILITY = {
    "foir_cap": FOIR_CAP,
    "allowed_emi": ALLOWED_EMI,
    "existing_emi_pre_bt": EXISTING_PRE_BT,
    "existing_emi_post_bt": EXISTING_POST_BT,
    "max_serviceable_emi": MAX_SERVICEABLE_EMI,
    "emi_per_lac": EMI_PER_LAC,
    "foir_loan_amount": FOIR_LOAN_AMOUNT,
    "multiplier_normal": 16,
    "multiplier_amount": MULTIPLIER_AMOUNT,
    "product_cap": PRODUCT_CAP,
    "system_eligible_amount": SYSTEM_ELIGIBLE,
    "binding_constraint": "product_cap",
    "requested_amount": REQUESTED,
    "approved_amount": APPROVED,
    "approved_multiplier": APPROVED_MULTIPLIER,
    "override": True,
    "override_excess": APPROVED - SYSTEM_ELIGIBLE,
    "override_reason": (
        "Management override (Shishir Pandit): ₹25,00,000 sanctioned vs system-eligible "
        "₹20,00,000 — justified by real-estate net worth ₹1.41 Cr, premium employer "
        "(HCL Technologies, Cat AA) and CIBIL 739."
    ),
    # Section 3 — three/four-column loan view (CAM §1: Applied | System Approval | Sanctioned).
    "columns": {
        "applied": {"amount": REQUESTED, "tenure": TENURE, "irr": 0.16, "emi": 60795.0,
                    "foir": None, "multiplier": None},
        "system_approval": {"amount": SYSTEM_ELIGIBLE, "tenure": TENURE, "irr": 0.16, "emi": 48636.0,
                            "foir": FOIR_CAP, "multiplier": 16},
        "recommended": {"amount": APPROVED, "tenure": TENURE, "irr": IRR, "emi": EMI_25L,
                        "foir": FOIR_PROPOSED, "multiplier": APPROVED_MULTIPLIER},
        "sanctioned": {"amount": APPROVED, "tenure": TENURE, "irr": IRR, "emi": EMI_25L,
                       "foir": FOIR_PROPOSED, "multiplier": APPROVED_MULTIPLIER},
    },
}

# 10 BRE deviations (CAM §7) — Credit Refer at the documented escalation levels.
DEVIATIONS_BRE = [
    {"deviation_type": "BRE Deviation", "applicant_type": "Primary",
     "rule_description": "Applicant is Indian Resident", "level": "L1", "system_decision": "Credit Refer"},
    {"deviation_type": "BRE Deviation", "applicant_type": "Primary",
     "rule_description": "Non target profile allowed only for income greater than equal to 50K", "level": "L1", "system_decision": "Credit Refer"},
    {"deviation_type": "BRE Deviation", "applicant_type": "Primary",
     "rule_description": "Company Category listed", "level": "L1", "system_decision": "Credit Refer"},
    {"deviation_type": "BRE Deviation", "applicant_type": "Primary",
     "rule_description": "Bounce norm to be checked for BT loan", "level": "L1", "system_decision": "Credit Refer"},
    {"deviation_type": "BRE Deviation", "applicant_type": "Primary",
     "rule_description": "CIBIL score norms met", "level": "L1", "system_decision": "Credit Refer"},
    {"deviation_type": "BRE Deviation", "applicant_type": "Primary",
     "rule_description": "Updated Banking as per policy", "level": "L1", "system_decision": "Credit Refer"},
    {"deviation_type": "BRE Deviation", "applicant_type": "Primary",
     "rule_description": "Proposed loan is above eligible loan amount", "level": "L7", "system_decision": "Credit Refer"},
    {"deviation_type": "BRE Deviation", "applicant_type": "Primary",
     "rule_description": "Multiplier norms not met (19x vs 16x policy)", "level": "L7", "system_decision": "Credit Refer"},
    {"deviation_type": "BRE Deviation", "applicant_type": "Primary",
     "rule_description": "Proposed loan amount greater than product cap (₹25L vs ₹20L)", "level": "L7", "system_decision": "Credit Refer"},
    {"deviation_type": "BRE Deviation", "applicant_type": "Primary",
     "rule_description": "Residence Verification status is Negative/Refer", "level": "L3", "system_decision": "Credit Refer"},
]

# Assets & net worth (field history §4.3 / §8.3).
ASSETS = {
    "items": [
        {"type": "Provident Fund", "value": 150000.0, "liquid": True},
        {"type": "House — Kalwakurthy", "value": 8000000.0, "liquid": False},
        {"type": "Land — Kalwakurthy", "value": 6000000.0, "liquid": False},
    ],
    "net_worth": 14150000.0,
    "note": "Assets are illiquid (real-estate heavy); HDFC & Aditya Birla PLs used for plot purchase.",
}

# Real credit managers (CAM §9 / field history §8–10).
CREDIT_MANAGER = {
    "decisioned_by": "Kotak Credit — Manual Underwriting",
    "ai_assisted": False,
    "recommended_by_first": "JAY HANCHATE",
    "recommended_by_last": "Prashanth Anand",
    "approved_by_first": "Shishir Pandit",
    "approved_by_last": "Shishir Pandit",
    "reviewed_by": "Prashanth Anand",
    "approved_by": "Shishir Pandit",
    "disbursed_by": "Prakash R",
    "decision_date": "2025-06-03",
    "disbursal_date": "2025-06-17",
    "remarks": (
        "Reco PL exposure ₹25L / 60m with HDFC PL BT · FOIR 52% · 19x multiplier · "
        "escalated to Shishir Pandit · APPROVED as management override on the ₹20L product cap."
    ),
}

# Voice-PD conversation — mirrored from the field-history credit-manager dialogue.
TELE_PD = {
    "status": "completed",
    "officer": "Credit PD — Voice Verification (J. Hanchate / K. N. Rao)",
    "conducted_at": "2025-05-31",
    "ctc_document": "offered",
    "questions": [
        {"id": "income", "q": "Income, designation & employment",
         "answer": "Net salary ₹1,29,876/mo · Manager, HCL Technologies (Cat AA) · salary to HDFC a/c 50100127075731 · ~10y total exp, ~1y at HCL", "note": "CTC structure + payslip requested", "tone": "ok"},
        {"id": "dependents", "q": "Family & earning members",
         "answer": "Family of 5 · 2 earning members · residence rented (Kalwakurthy, with family)", "note": None, "tone": "info"},
        {"id": "employment_check", "q": "Employment verification — official mail / dual employment",
         "answer": "Official mail verified · Karza income verified · recent Axis Bank enquiry (loan not processed) · no dual employment", "note": "Sample case — manual review", "tone": "ok"},
        {"id": "income_docs", "q": "Income documents — CTC & payslip",
         "answer": "HCL CTC structure + May-2025 payslip submitted · Karza verified · BSV cleared", "note": None, "tone": "ok"},
        {"id": "assets", "q": "Assets & investments",
         "answer": "PF ₹1.5L · House Kalwakurthy ₹80L · Land Kalwakurthy ₹60L (HDFC & Aditya PLs used for plot) · net worth ₹1.41 Cr (illiquid)", "note": None, "tone": "info"},
        {"id": "obligations_bt", "q": "Existing obligations & balance transfer",
         "answer": "HDFC PL O/s ₹7,93,375 EMI ₹48,214 — closed via BT · Aditya Birla PL O/s ₹2,43,790 EMI ₹11,762 · credit card O/s ₹6,956", "note": None, "tone": "ok"},
        {"id": "purpose", "q": "Purpose of loan",
         "answer": "Personal use + balance transfer of HDFC PL (Other)", "note": None, "tone": "info"},
        {"id": "amount_revision", "q": "Requested amount",
         "answer": "Initial ₹15L → customer revised to ₹35L → recommended ₹25L (incl. HDFC PL BT) for 60 months", "note": None, "tone": "caution"},
        {"id": "residence_rcu", "q": "Residence verification / RCU",
         "answer": "Residence Verification NEGATIVE · RCU: Review — flagged, pending resolution", "note": None, "tone": "danger"},
    ],
    "deviation_reasons": [
        "Salary below ₹1.5L threshold (₹1,29,876) — non-target profile allowed for income ≥ ₹50K (L1)",
        "Proposed ₹25,00,000 exceeds ₹20,00,000 product cap by ₹5L (+25%) — L7",
        "Multiplier 19x exceeds policy 16x for Normal Journey (+18.75%) — L7",
        "Proposed loan above system-eligible ₹20,00,000 — L7",
        "Residence Verification NEGATIVE / RCU Review — L3 (unresolved)",
        "Approved at FOIR 52% (cap 60%) after HDFC PL BT nets out ₹48,214 EMI · final approval Shishir Pandit (management override)",
    ],
}


def _load(p: Path) -> dict:
    return json.loads(p.read_text())


def _write(p: Path, obj: dict) -> None:
    p.write_text(json.dumps(obj, indent=2, ensure_ascii=False) + "\n")


def main() -> int:
    cs = _load(CASE_DIR / "case_state.json")

    # ---- intake / address (Hyderabad, rented Kalwakurthy, residence negative) ----
    ik = cs["intake"]
    ik["declared_income"] = INCOME
    ik["loan_amount_req"] = REQUESTED
    ik["salary_disb_same"] = False
    ik["address_verified"] = False                     # residence verification NEGATIVE
    ik["address_zone_score"] = 41.0
    ik["address"].update({
        "line": "H.No 2-45, Kalwakurthy (with family)",
        "city": "Hyderabad", "state": "TG", "pincode": "509324",
        "years_at_address": 5, "ownership": "rented",
        "kyc_address_match": True, "digital_footprint": True,
    })

    # address-quality block now reflects the negative residence verification
    cs["address"].update({
        "score": 41.0, "band": "REVIEW", "prob_good": 0.41, "confidence": 0.58,
        "pd_adjustment": 0.0054, "review_flag": True, "provenance": "real",
        "reasons": [
            {"code": "RESIDENCE_VERIFICATION", "label": "Residence verification negative (RCU: Review)",
             "impact": -0.42, "direction": "negative"},
            {"code": "OWNERSHIP_RENTED", "label": "Rented residence (with family)",
             "impact": -0.12, "direction": "negative"},
            {"code": "TENURE_AT_ADDRESS", "label": "5 years at current residence",
             "impact": 0.18, "direction": "positive"},
        ],
    })

    # ---- branches: bureau (CIBIL 739) + banking (rebuilt) ----
    rb = cs["branches"]["bureau"]
    rb["summary"].update({"cibil_score": 739, "total_exposure": 1044121.0, "enq_count": 1})
    rb["detail"] = copy.deepcopy(BUREAU_DETAIL)
    rb["report_path"] = "reports/bureau_analyser_698167220_report.pdf"

    bk = cs["branches"]["banking"]
    bk["summary"].update({
        "salary_income_detected": INCOME, "existing_emi_debits": EXISTING_PRE_BT,
        "affluence_band": "affluent", "spend_category": "EMI / Loan servicing", "bounce_count": 0,
    })
    bk["detail"] = copy.deepcopy(BANKING_DETAIL)

    # ---- summary roll-up ----
    cs["summary"].update({
        "cibil_score": 739, "total_exposure": 1044121.0, "enq_count": 1,
        "salary_income_detected": INCOME, "existing_emi_debits": EXISTING_PRE_BT,
        "existing_emi_post_bt": EXISTING_POST_BT, "bounce_count": 0,
        "affluence_band": "affluent", "spend_category": "EMI / Loan servicing",
    })

    # ---- ML scorecard ----
    cs["ml"].update({
        "affluence_value": INCOME, "affluence_segment": "affluent",
        "income_used": INCOME, "income_source": "declared",
        "foir_existing": round(EXISTING_PRE_BT / INCOME, 4),    # 0.4618 pre-BT
    })

    # ---- policy: residence layer now breaches; result APPROVED via override ----
    for layer in cs["policy"]["layers"]:
        if layer["layer"] == "L0_ADDRESS":
            layer.update({"passed": False, "detail": "band=REVIEW score=41.0 · residence verification NEGATIVE", "approval_level": "L3"})
    cs["policy"]["result"] = "APPROVED"
    cs["policy"]["approved_segment"] = "affluent"
    cs["policy"]["ai_assisted_flag"] = False
    cs["policy"]["override"] = True

    # ---- decision: ₹25L override @ 12% ----
    cs["decision"].update({
        "selected": True, "serviceable": True, "contactible": True,
        "foir_proposed": FOIR_PROPOSED,
        "offer_amount": APPROVED, "approved_amount": APPROVED,
        "offer_tenure": TENURE, "offer_irr": IRR, "offer_emi": EMI_25L,
        "processing_fee": PROCESSING_FEE, "net_disbursal": NET_DISBURSAL,
        "max_serviceable_emi": MAX_SERVICEABLE_EMI,
        "approved_multiplier": APPROVED_MULTIPLIER, "override": True,
        "override_reason": ELIGIBILITY["override_reason"],
    })

    # ---- new curated blocks consumed by CAM build + React ----
    cs["eligibility"] = ELIGIBILITY
    cs["assets"] = ASSETS
    cs["deviations_bre"] = DEVIATIONS_BRE
    cs["credit_manager"] = CREDIT_MANAGER
    cs["credit_manager_remarks"] = CREDIT_MANAGER["remarks"]

    # ---- finalize ----
    cs["finalize"]["decision"] = "APPROVED"
    pm = cs["finalize"]["provenance_map"]
    pm.update({
        "summary.cibil_score": "real", "decision.offer_amount": "derived",
        "applicant.residence_type": "real", "applicant.address_line": "real",
        "decision.offer_irr": "real", "eligibility": "real",
        "deviations_bre": "real", "credit_manager.approved_by": "real",
        "credit_manager.reviewed_by": "real", "assets": "real",
        "intake.address_verified": "real",
    })

    cs["outcome"] = "APPROVED"
    cs["warnings"] = [
        "decision: BT nets out ₹48,214 HDFC PL EMI (obligation 59,976 -> 11,762 post-BT)",
        "policy: L0_ADDRESS residence verification NEGATIVE (RCU: Review) -> L3 deviation, unresolved",
        "deviation: ₹25,00,000 > ₹20,00,000 product cap (+25%) and 19x > 16x multiplier -> L7, management override",
        "deviation: salary ₹1,29,876 below ₹1.5L target threshold -> L1",
        "finalize: case PL-2026-8bd9c6 -> APPROVED ₹25,00,000 (override, Shishir Pandit)",
    ]

    # ---- write journey/output spine (no tele_pd) ----
    _write(CASE_DIR / "case_state.json", cs)

    # ---- dashboard mirror = spine + tele_pd block ----
    dash = copy.deepcopy(cs)
    dash["tele_pd"] = TELE_PD
    _write(DASH / "caseState.json", dash)

    # ---- cam_data.json: keep bureau/banking detail in sync ----
    cam_data = _load(CASE_DIR / "cam_data.json")
    cam_data["bureau_detail"] = copy.deepcopy(BUREAU_DETAIL)
    cam_data["banking_detail"] = copy.deepcopy(BANKING_DETAIL)
    _write(CASE_DIR / "cam_data.json", cam_data)

    # ---- sal_slip.json: dob -> age 36, employment ----
    sal = _load(CASE_DIR / "sal_slip.json")
    sal.update({
        "dob": "1990-01-15", "designation": "Manager",
        "total_experience_months": 120, "epfo_months": 12,
    })
    _write(CASE_DIR / "sal_slip.json", sal)

    # ---- trace.json: CIBIL 785 -> 739 (recurse — it's nested under summary) ----
    trace_p = DASH / "trace.json"
    trace = _load(trace_p)

    def _fix(o):
        if isinstance(o, dict):
            for k, v in o.items():
                if k == "cibil_score" and v == 785:
                    o[k] = 739
                else:
                    _fix(v)
        elif isinstance(o, list):
            for v in o:
                _fix(v)

    _fix(trace)
    _write(trace_p, trace)

    # ---- bankingReport.json: keep the Excel export in sync with the rebuilt banking ----
    br_p = DASH / "bankingReport.json"
    br = _load(br_p)
    br["meta"] = {
        "analysis_period": "Feb–May 2025", "currency": "INR",
        "customer_id": 698167220, "prty_name": "SOFI MOHD", "transaction_count": 124,
    }
    br["salary"] = {
        "avg_amount": INCOME, "frequency": 4, "narration": "Salary HCL Technologies",
        "dates": ["2025-02-28", "2025-03-31", "2025-04-30", "2025-05-31"],
        "latest_transaction": {"date": "2025-05-31", "amount": INCOME,
                               "narration": "Salary May 2025 · HCL Technologies"},
        "sample_transaction": {"date": "2025-05-31", "amount": INCOME, "direction": "C",
                               "narration": "NEFT HCL TECHNOLOGIES SALARY"},
    }
    br["emis"] = [
        {"name": "HDFC Bank PL (BT)", "amount": EMI_HDFC_BT, "frequency": 4,
         "dates": ["2025-02-05", "2025-05-05"],
         "sample_transaction": {"date": "2025-05-05", "amount": EMI_HDFC_BT, "direction": "D",
                                "name": "HDFC Bank PL", "narration": "ACH/HDFC PL EMI (BT)"}},
        {"name": "Aditya Birla PL", "amount": EMI_ADITYA, "frequency": 4,
         "dates": ["2025-02-07", "2025-05-07"],
         "sample_transaction": {"date": "2025-05-07", "amount": EMI_ADITYA, "direction": "D",
                                "name": "Aditya Birla Capital", "narration": "NACH/ABFL PL EMI"}},
    ]
    br["account_quality"] = copy.deepcopy(BANKING_DETAIL["account_quality"])
    br["monthly_cashflow"] = copy.deepcopy(MONTHLY_CASHFLOW)
    br["checklist"] = copy.deepcopy(BANKING_DETAIL["checklist"])
    br["category_overview"] = {"EMI / Loan servicing": 59976.0, "Household & utilities": 38500.0}
    br["top_merchants"] = [
        {"name": "HCL Technologies (salary)", "type": "credit", "count": 4, "total": 519504.0, "avg": INCOME, "score": 1.0},
        {"name": "HDFC Bank PL EMI", "type": "debit", "count": 4, "total": 192856.0, "avg": EMI_HDFC_BT, "score": 0.9},
        {"name": "Aditya Birla PL EMI", "type": "debit", "count": 4, "total": 47048.0, "avg": EMI_ADITYA, "score": 0.8},
    ]
    br["events"] = [
        {"date": "2025-03-31", "amount": 200000.0, "description": "Salary credit (variable) ₹2,00,000 — credits volatile month to month"},
        {"date": "2025-05-31", "amount": 159587.0, "description": "Salary credit (variable) ₹1,59,587"},
    ]
    br["merchant_features"] = None
    br["bills"] = None
    br["rent"] = None
    _write(br_p, br)

    print(f"load_sofi_case ok: EMI_25L={EMI_25L} FOIR_proposed={FOIR_PROPOSED} "
          f"system_eligible={SYSTEM_ELIGIBLE} approved={APPROVED} multiplier={APPROVED_MULTIPLIER}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
