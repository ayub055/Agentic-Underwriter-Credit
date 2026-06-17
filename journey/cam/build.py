"""build_cam_model — fold a completed CaseState (+ cam_data pack + sal_slip) into
the render-ready CamModel. Pure mapping, no I/O, never fabricates.

Inputs are plain JSON dicts (as written to journey/output/<case_id>/) so this is
trivially testable from saved artifacts and decoupled from the live objects.
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from cam.model import (
    ApplicantSection,
    ApplicationSection,
    BankingMatrix,
    BankingMatrixRow,
    CamMeta,
    CamModel,
    CreditConditionRow,
    CreditManagerSection,
    DeviationRow,
    DeviationsSection,
    EmploymentSection,
    FinancialSection,
    LoanAmountSection,
    LoanColumn,
    LoanSection,
    PDSheetSection,
    VerificationItem,
)
from provenance import Provenance


def _age_from_dob(dob: Optional[str]) -> Optional[int]:
    if not dob:
        return None
    try:
        d = datetime.fromisoformat(dob).date()
    except ValueError:
        return None
    today = date.today()
    return today.year - d.year - ((today.month, today.day) < (d.month, d.day))


def _months_to_experience(months: Optional[int]) -> Optional[str]:
    if not months:
        return None
    y, m = divmod(int(months), 12)
    parts = []
    if y:
        parts.append(f"{y}y")
    if m:
        parts.append(f"{m}m")
    return " ".join(parts) or None


# CAM-specific provenance, layered on top of the journey's own provenance_map.
# Identity/employment fields are mock or absent today (no Karza/EPFO/sal-slip
# wiring); the rich bureau/banking slices are real analyser output.
_CAM_PROV = {
    "applicant.name": Provenance.mock,
    "applicant.dob": Provenance.mock,
    "applicant.qualification": Provenance.mock,
    "applicant.residence_type": Provenance.mock,
    "applicant.address_line": Provenance.mock,
    "applicant.marital_status": Provenance.mock,
    "applicant.color_band": Provenance.mock,
    "applicant.salary_account_flag": Provenance.derived,
    "applicant.salary_disb_same": Provenance.placeholder,
    "application.lead_reference": Provenance.placeholder,
    "application.sub_source": Provenance.placeholder,
    "application.existing_kotak_customer": Provenance.placeholder,
    "application.purpose_of_loan": Provenance.placeholder,
    "application.dma_name": Provenance.mock,
    "employment.employer": Provenance.mock,
    "employment.stability_months": Provenance.mock,
    "employment.designation": Provenance.mock,
    "employment.category": Provenance.mock,
    "employment.years_in_current_company": Provenance.mock,
    "employment.income_band": Provenance.mock,
    "loan.offer_amount": Provenance.derived,
    "loan.offer_tenure": Provenance.derived,
    "loan.system_approval": Provenance.derived,
    "loan.applied": Provenance.mock,
    "loan.sanctioned": Provenance.derived,
    "financial.income_used": Provenance.derived,
    "financial.salary_detected": Provenance.real,
    "financial.net_salary": Provenance.real,
    "financial.total_obligation": Provenance.real,
    "financial.current_fixed_obligation": Provenance.real,
    "financial.total_exposure": Provenance.real,
    "financial.monthly_obligation": Provenance.placeholder,
    "financial.fcu_trigger": Provenance.placeholder,
    "financial.max_serviceable_emi": Provenance.placeholder,
    "obligations": Provenance.real,
    "banking": Provenance.real,
    "banking_matrix": Provenance.real,
    "credit_conditions": Provenance.placeholder,
    "loan_amount.final_amount": Provenance.derived,
    "loan_amount.rejection_reason": Provenance.derived,
    "credit_manager.reviewed_by": Provenance.placeholder,
    "credit_manager.approved_by": Provenance.placeholder,
    "credit_manager.decision_date": Provenance.real,
    "credit_manager.remarks": Provenance.placeholder,
    "pd_sheet.affluence_value": Provenance.derived,
    "pd_sheet.affluence_segment": Provenance.derived,
    "pd_sheet.remarks": Provenance.derived,
}


def build_cam_model(
    case_state: dict,
    cam_data: Optional[dict] = None,
    sal_slip: Optional[dict] = None,
) -> CamModel:
    cs = case_state
    cam_data = cam_data or {}
    sal_slip = sal_slip or {}

    intake = cs.get("intake") or {}
    addr = intake.get("address") or {}
    addr_block = cs.get("address") or {}
    summary = cs.get("summary") or {}
    ml = cs.get("ml") or {}
    policy = cs.get("policy") or {}
    decision = cs.get("decision") or {}
    fin = cs.get("finalize") or {}

    bureau_detail = cam_data.get("bureau_detail") or {}
    banking_detail = cam_data.get("banking_detail") or {}

    # ---- merged provenance map (journey map first, CAM tags layered on) ----
    prov: dict[str, str] = dict(fin.get("provenance_map") or {})
    for k, v in _CAM_PROV.items():
        prov.setdefault(k, v.value)

    meta = CamMeta(
        case_id=cs.get("case_id"),
        run_id=cs.get("run_id"),
        customer_id=cs.get("customer_id"),
        outcome=cs.get("outcome"),
        generated_at=datetime.now().isoformat(timespec="seconds"),
    )

    application = ApplicationSection(
        application_no=cs.get("case_id"),
        date=meta.generated_at,
        channel=meta.channel,
        location=addr.get("city"),
        pincode=addr.get("pincode"),
        loan_amount_req=intake.get("loan_amount_req"),
        tenure_req=intake.get("tenure_req"),
        # Sourcing / lead fields are not wired into the pipeline yet (honest None).
        lead_reference=intake.get("lead_reference"),
        sub_source=intake.get("sub_source"),
        existing_kotak_customer=intake.get("existing_kotak_customer"),
        purpose_of_loan=intake.get("purpose_of_loan"),
        dma_name=intake.get("dma_name"),
    )

    # "Is this account the salary account" — true when banking detected a salary.
    bk_salary = (banking_detail.get("salary") if banking_detail else None) or {}
    salary_account_flag = bool(bk_salary.get("avg_amount")) if banking_detail else None

    dob = sal_slip.get("dob")
    applicant = ApplicantSection(
        name=sal_slip.get("name"),
        dob=dob,
        age=_age_from_dob(dob),
        qualification=sal_slip.get("qualification"),
        residence_type=addr.get("ownership"),
        years_at_address=addr.get("years_at_address"),
        address_line=addr.get("line"),
        city=addr.get("city"),
        state=addr.get("state"),
        pincode=addr_block.get("pincode") or addr.get("pincode"),
        address_score=addr_block.get("score"),
        address_band=addr_block.get("band"),
        address_reasons=addr_block.get("reasons") or [],
        marital_status=sal_slip.get("marital_status"),
        color_band=ml.get("color_band"),
        salary_account_flag=salary_account_flag,
        salary_disb_same=intake.get("salary_disb_same"),
    )

    employment = EmploymentSection(
        employer=intake.get("employer"),
        category=intake.get("employer_category"),
        designation=sal_slip.get("designation"),
        employment_verified=intake.get("employment_verified"),
        stability_months=sal_slip.get("epfo_months"),
        total_experience=_months_to_experience(sal_slip.get("epfo_months")),
        years_in_current_company=_months_to_experience(sal_slip.get("epfo_months")),
        income_band=ml.get("income_band"),
    )

    # ---- Section 3: three-column loan view ----
    income_used = ml.get("income_used")
    offer_amount = decision.get("offer_amount")
    multiplier = (round(offer_amount / income_used, 2)
                  if offer_amount and income_used else None)
    sanctioned_col = LoanColumn()
    if cs.get("outcome") == "APPROVED":
        sanctioned_col = LoanColumn(
            amount=offer_amount, tenure=decision.get("offer_tenure"),
            irr=decision.get("offer_irr"), emi=decision.get("offer_emi"),
            foir=decision.get("foir_proposed"), multiplier=multiplier,
        )
    loan = LoanSection(
        offer_amount=offer_amount,
        offer_tenure=decision.get("offer_tenure"),
        offer_irr=decision.get("offer_irr"),
        offer_emi=decision.get("offer_emi"),
        processing_fee=decision.get("processing_fee"),
        foir_proposed=decision.get("foir_proposed"),
        approved_segment=policy.get("approved_segment"),
        system_approval=LoanColumn(
            amount=offer_amount, tenure=decision.get("offer_tenure"),
            irr=decision.get("offer_irr"), emi=decision.get("offer_emi"),
            foir=decision.get("foir_proposed"),
            unsecured_foir=ml.get("foir_unsecured_proposed"),
            multiplier=multiplier,
        ),
        applied=LoanColumn(
            amount=intake.get("loan_amount_req"), tenure=intake.get("tenure_req"),
        ),
        sanctioned=sanctioned_col,
    )

    # ---- Section 4: financial summary ----
    net_salary = summary.get("salary_income_detected")
    existing_obl = summary.get("existing_emi_debits")
    cashflow = (banking_detail.get("monthly_cashflow") if banking_detail else None) or []
    obl_months = [c.get("month") for c in cashflow[-4:]]
    financial = FinancialSection(
        declared_income=intake.get("declared_income"),
        income_used=income_used,
        income_source=ml.get("income_source"),
        salary_detected=net_salary,
        foir_existing=ml.get("foir_existing"),
        total_obligation=existing_obl,
        total_exposure=summary.get("total_exposure"),
        net_salary=net_salary,
        current_fixed_obligation=existing_obl,
        monthly_obligation=[None] * len(obl_months),   # per-month split not produced yet
        obligation_months=obl_months,
        fcu_trigger=summary.get("fcu_trigger"),
        max_serviceable_emi=decision.get("max_serviceable_emi"),
    )

    # ---- Section 6: banking feature x month matrix ----
    banking_matrix = _banking_matrix(banking_detail)

    # ---- Section 7: verification — canonical intake checklist (10 checks) ----
    addr_detail = (f"{addr_block.get('band')} · {addr_block.get('score')}/100"
                   if addr_block.get("band") else None)
    kyc = intake.get("kyc_verified")
    verification = [
        VerificationItem(label="PAN · Karza", status=kyc, prov_key="intake.kyc_verified"),
        VerificationItem(label="KYC", status=kyc, prov_key="intake.kyc_verified"),
        VerificationItem(label="Aadhaar", status=kyc, detail="bundled with KYC",
                         prov_key="intake.kyc_verified"),
        VerificationItem(label="PAN–Aadhaar link", status=kyc,
                         prov_key="intake.kyc_verified"),
        VerificationItem(label="Email", status=intake.get("email_verified"),
                         prov_key="intake.consent_captured"),
        VerificationItem(label="Mobile OTP", status=intake.get("consent_captured"),
                         prov_key="intake.consent_captured"),
        VerificationItem(label="De-dupe", status=intake.get("dedupe_checked"),
                         prov_key="intake.dedupe_checked"),
        VerificationItem(label="Negative address", status=intake.get("address_verified"),
                         prov_key="intake.address_verified"),
        VerificationItem(label="Employment", status=intake.get("employment_verified"),
                         prov_key="intake.employment_verified"),
        VerificationItem(label="Address", status=intake.get("address_verified"),
                         detail=addr_detail, prov_key="intake.address_verified"),
    ]

    layers = policy.get("layers") or []
    breaches = [l for l in layers if l.get("passed") is False]
    if decision.get("serviceable") is False:
        breaches.append({
            "layer": "SERVICEABILITY",
            "passed": False,
            "reason_code": "FOIR_CAP",
            "detail": f"foir_proposed={decision.get('foir_proposed')} > cap",
        })
    deviation_rows = [
        DeviationRow(
            deviation_type=b.get("layer"),
            applicant_type="Primary",
            rule_description=b.get("detail") or b.get("reason_code"),
            credit_approval_level=b.get("approval_level"),
            system_decision="BREACH",
        )
        for b in breaches
    ]
    deviations = DeviationsSection(
        policy_result=policy.get("result"),
        serviceable=decision.get("serviceable"),
        layers=layers,
        breaches=breaches,
        warnings=cs.get("warnings") or [],
        rows=deviation_rows,
    )

    # ---- Section 9: credit conditions (not produced by the engine yet) ----
    credit_conditions = [
        CreditConditionRow(**c) for c in (decision.get("credit_conditions") or [])
    ]

    # ---- Section 10: loan amount / rejection ----
    outcome = cs.get("outcome")
    is_declined = outcome in ("DECLINED", "REJECTED")
    rejection_reason = None
    if is_declined:
        rejection_reason = " · ".join(
            f"{b.get('layer')} ({b.get('reason_code')})" for b in breaches
        ) or "Not serviceable under current policy"
    loan_amount = LoanAmountSection(
        final_amount=offer_amount if outcome == "APPROVED" else None,
        final_tenor=decision.get("offer_tenure") if outcome == "APPROVED" else None,
        rejection_reason=rejection_reason,
        reject_datetime=meta.generated_at if is_declined else None,
    )

    credit_manager = CreditManagerSection(
        ai_assisted=policy.get("ai_assisted_flag"),
        model_versions=fin.get("model_versions") or {},
        decision_date=meta.generated_at,
        remarks=cs.get("credit_manager_remarks"),
    )

    # ---- Section 12: PD sheet remarks (derived one-liner from the PD outputs) ----
    pd_score = ml.get("pd_score")
    risk_band = ml.get("risk_band")
    affluence_segment = ml.get("affluence_segment")
    pd_remarks = None
    if pd_score is not None or risk_band is not None:
        bits = []
        if pd_score is not None:
            bits.append(f"PD {pd_score:.2%}" if pd_score < 1 else f"PD {pd_score}")
        if risk_band is not None:
            bits.append(f"risk band {risk_band}/5")
        if affluence_segment:
            bits.append(affluence_segment.replace("_", " "))
        pd_remarks = " · ".join(bits)
    pd_sheet = PDSheetSection(
        pd_score=pd_score,
        pd_provenance=ml.get("pd_provenance"),
        risk_band=risk_band,
        affluence_value=ml.get("affluence_value"),
        affluence_segment=affluence_segment,
        policy_features=ml.get("policy_features") or {},
        remarks=pd_remarks,
    )

    return CamModel(
        meta=meta,
        application=application,
        applicant=applicant,
        employment=employment,
        loan=loan,
        financial=financial,
        obligations=bureau_detail,
        banking=banking_detail,
        banking_matrix=banking_matrix,
        verification=verification,
        deviations=deviations,
        credit_conditions=credit_conditions,
        loan_amount=loan_amount,
        credit_manager=credit_manager,
        pd_sheet=pd_sheet,
        provenance=prov,
    )


def _banking_matrix(banking_detail: Optional[dict]) -> BankingMatrix:
    """Section 6 — Feature x Month table. Debit/credit amounts come from the real
    monthly cashflow; EOD balances and counts aren't produced by the analyser yet
    so they render as honest blanks (placeholder)."""
    if not banking_detail:
        return BankingMatrix()
    cashflow = (banking_detail.get("monthly_cashflow") or [])[-4:]
    months = [c.get("month") for c in cashflow]
    n = len(months)
    if n == 0:
        return BankingMatrix()
    blank = [None] * n
    rows = [
        BankingMatrixRow(feature="EOD Balance — 1st", values=list(blank), prov="placeholder"),
        BankingMatrixRow(feature="EOD Balance — 5th", values=list(blank), prov="placeholder"),
        BankingMatrixRow(feature="EOD Balance — 10th", values=list(blank), prov="placeholder"),
        BankingMatrixRow(feature="EOD Balance — 20th", values=list(blank), prov="placeholder"),
        BankingMatrixRow(feature="Monthly average balance", values=list(blank), prov="placeholder"),
        BankingMatrixRow(feature="Credit amount", values=[c.get("inflow") for c in cashflow], prov="real"),
        BankingMatrixRow(feature="Debit amount", values=[c.get("outflow") for c in cashflow], prov="real"),
        BankingMatrixRow(feature="Credit count", values=list(blank), prov="placeholder"),
        BankingMatrixRow(feature="Debit count", values=list(blank), prov="placeholder"),
        BankingMatrixRow(feature="Transaction start date", values=list(blank), prov="placeholder"),
        BankingMatrixRow(feature="Transaction end date", values=list(blank), prov="placeholder"),
        BankingMatrixRow(feature="AQB / EMI ratio", values=list(blank), prov="placeholder"),
    ]
    return BankingMatrix(months=months, rows=rows)
