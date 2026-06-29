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
    ExistingLoanRow,
    FinancialSection,
    LoanAmountSection,
    LoanColumn,
    LoanSection,
    PDSheetSection,
    TelePdQuestion,
    TelePdSection,
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
# Application-form fields (identity, loan, employer, declared debt) are real
# applicant input; the rich bureau/banking slices are real analyser output. What
# stays mock/placeholder is what no source feeds yet (mock address pool, EPFO
# tenure, color band, sourcing refs).
_CAM_PROV = {
    "applicant.name": Provenance.real,
    "applicant.gender": Provenance.real,
    "applicant.pan": Provenance.real,
    "applicant.crn": Provenance.real,
    "applicant.salary_account_no": Provenance.real,
    "applicant.dob": Provenance.real,
    "applicant.qualification": Provenance.real,
    "applicant.residence_type": Provenance.mock,
    "applicant.address_line": Provenance.mock,
    "applicant.marital_status": Provenance.real,
    "applicant.color_band": Provenance.mock,
    "applicant.salary_account_flag": Provenance.derived,
    "applicant.salary_disb_same": Provenance.real,
    "application.loan_type": Provenance.real,
    "application.scheme": Provenance.real,
    "application.sub_scheme": Provenance.real,
    "application.lead_reference": Provenance.placeholder,
    "application.sub_source": Provenance.placeholder,
    "application.existing_kotak_customer": Provenance.real,
    "application.purpose_of_loan": Provenance.real,
    "application.dma_name": Provenance.mock,
    "existing_loans": Provenance.real,
    "employment.employer": Provenance.real,
    "employment.stability_months": Provenance.mock,
    "employment.designation": Provenance.real,
    "employment.category": Provenance.real,
    "employment.total_experience": Provenance.real,
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
    "pd_sheet.tele_pd": Provenance.placeholder,
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
        date=intake.get("application_date") or meta.generated_at,
        channel=meta.channel,
        location=addr.get("city"),
        pincode=addr.get("pincode"),
        loan_amount_req=intake.get("loan_amount_req"),
        tenure_req=intake.get("tenure_req"),
        loan_type=intake.get("loan_type"),
        scheme=intake.get("scheme"),
        sub_scheme=intake.get("sub_scheme"),
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
        gender=sal_slip.get("gender"),
        pan=sal_slip.get("pan"),
        crn=intake.get("crn"),
        salary_account_no=intake.get("salary_account_no"),
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

    # Total experience is applicant-declared; EPFO tenure (years in current
    # company) is a separate signal not wired yet — kept distinct, honest blank.
    employment = EmploymentSection(
        employer=intake.get("employer"),
        category=intake.get("employer_category"),
        designation=sal_slip.get("designation"),
        employment_verified=intake.get("employment_verified"),
        stability_months=sal_slip.get("epfo_months"),
        total_experience=_months_to_experience(
            sal_slip.get("total_experience_months") or sal_slip.get("epfo_months")),
        years_in_current_company=_months_to_experience(sal_slip.get("epfo_months")),
        income_band=ml.get("income_band"),
    )

    # ---- Section 3: three-column loan view ----
    # Prefer the documented columns (Applied | System Approval | Sanctioned) when the
    # curated eligibility block carries them; else derive from the decision output.
    elig = cs.get("eligibility") or {}
    cols = elig.get("columns") or {}
    income_used = ml.get("income_used")
    offer_amount = decision.get("offer_amount")
    multiplier = (round(offer_amount / income_used, 2)
                  if offer_amount and income_used else None)

    def _col(name: str, fallback: LoanColumn) -> LoanColumn:
        c = cols.get(name)
        return LoanColumn(**c) if c else fallback

    applied_col = _col("applied", LoanColumn(
        amount=intake.get("loan_amount_req"), tenure=intake.get("tenure_req")))
    system_col = _col("system_approval", LoanColumn(
        amount=offer_amount, tenure=decision.get("offer_tenure"),
        irr=decision.get("offer_irr"), emi=decision.get("offer_emi"),
        foir=decision.get("foir_proposed"),
        unsecured_foir=ml.get("foir_unsecured_proposed"), multiplier=multiplier))
    sanctioned_col = LoanColumn()
    if cs.get("outcome") == "APPROVED":
        sanctioned_col = _col("sanctioned", LoanColumn(
            amount=offer_amount, tenure=decision.get("offer_tenure"),
            irr=decision.get("offer_irr"), emi=decision.get("offer_emi"),
            foir=decision.get("foir_proposed"), multiplier=multiplier))
    loan = LoanSection(
        offer_amount=offer_amount,
        offer_tenure=decision.get("offer_tenure"),
        offer_irr=decision.get("offer_irr"),
        offer_emi=decision.get("offer_emi"),
        processing_fee=decision.get("processing_fee"),
        foir_proposed=decision.get("foir_proposed"),
        approved_segment=policy.get("approved_segment"),
        system_approval=system_col,
        applied=applied_col,
        sanctioned=sanctioned_col,
    )

    # ---- Section 4: financial summary ----
    net_salary = summary.get("salary_income_detected")
    existing_obl = summary.get("existing_emi_debits")              # pre-BT total debits
    # Current fixed obligation is the retained EMI after the BT clears the HDFC PL.
    current_fixed = summary.get("existing_emi_post_bt")
    if current_fixed is None:
        current_fixed = existing_obl
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
        current_fixed_obligation=current_fixed,
        monthly_obligation=[None] * len(obl_months),   # per-month split not produced yet
        obligation_months=obl_months,
        fcu_trigger=summary.get("fcu_trigger"),
        max_serviceable_emi=elig.get("max_serviceable_emi") or decision.get("max_serviceable_emi"),
    )

    # ---- Section 5: applicant-declared existing loans (BT view) ----
    existing_loans = [
        ExistingLoanRow(**{k: l.get(k) for k in (
            "lender", "loan_type", "sanctioned", "outstanding", "emi",
            "bt_flag", "status") if l.get(k) is not None})
        for l in (intake.get("existing_loans") or [])
    ]

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
        VerificationItem(label="Residence Verification",
                         status=intake.get("address_verified"),
                         detail="NEGATIVE" if intake.get("address_verified") is False else None,
                         prov_key="intake.address_verified"),
        VerificationItem(label="RCU", status=None, detail="Review",
                         prov_key="intake.address_verified"),
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
    # Documented BRE deviations (CAM §7) — Credit Refer at named escalation levels.
    bre_rows = [
        DeviationRow(
            deviation_type=d.get("deviation_type"),
            applicant_type=d.get("applicant_type") or "Primary",
            rule_description=d.get("rule_description"),
            credit_approval_level=d.get("level"),
            system_decision=d.get("system_decision"),
        )
        for d in (cs.get("deviations_bre") or [])
    ]
    deviations = DeviationsSection(
        policy_result=policy.get("result"),
        serviceable=decision.get("serviceable"),
        layers=layers,
        breaches=breaches,
        warnings=cs.get("warnings") or [],
        rows=deviation_rows,
        bre=bre_rows,
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

    # Real credit managers (CAM §9) when the curated case carries them; else the
    # engine attribution with a generated decision date.
    cm = cs.get("credit_manager") or {}
    credit_manager = CreditManagerSection(
        decisioned_by=cm.get("decisioned_by") or "Kotak Agentic Underwriter",
        ai_assisted=cm.get("ai_assisted") if cm else policy.get("ai_assisted_flag"),
        model_versions=fin.get("model_versions") or {},
        reviewed_by=cm.get("reviewed_by"),
        approved_by=cm.get("approved_by"),
        recommended_by_first=cm.get("recommended_by_first"),
        recommended_by_last=cm.get("recommended_by_last"),
        approved_by_first=cm.get("approved_by_first"),
        approved_by_last=cm.get("approved_by_last"),
        disbursed_by=cm.get("disbursed_by"),
        disbursal_date=cm.get("disbursal_date"),
        decision_date=cm.get("decision_date") or meta.generated_at,
        remarks=cm.get("remarks") or cs.get("credit_manager_remarks"),
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
    # Tele PD: the human officer-call Q&A (placeholder — captured on a call, not
    # the pipeline) folded into the PD sheet alongside the scorecard outputs.
    tp = cs.get("tele_pd") or {}
    tele_pd = TelePdSection(
        status=tp.get("status"),
        officer=tp.get("officer"),
        conducted_at=tp.get("conducted_at"),
        ctc_document=tp.get("ctc_document"),
        questions=[TelePdQuestion(**q) for q in (tp.get("questions") or [])],
        deviation_reasons=tp.get("deviation_reasons") or [],
    )
    pd_sheet = PDSheetSection(
        pd_score=pd_score,
        pd_provenance=ml.get("pd_provenance"),
        risk_band=risk_band,
        affluence_value=ml.get("affluence_value"),
        affluence_segment=affluence_segment,
        policy_features=ml.get("policy_features") or {},
        remarks=pd_remarks,
        tele_pd=tele_pd,
    )

    return CamModel(
        meta=meta,
        application=application,
        applicant=applicant,
        employment=employment,
        loan=loan,
        financial=financial,
        existing_loans=existing_loans,
        obligations=bureau_detail,
        banking=banking_detail,
        banking_matrix=banking_matrix,
        verification=verification,
        deviations=deviations,
        credit_conditions=credit_conditions,
        loan_amount=loan_amount,
        credit_manager=credit_manager,
        pd_sheet=pd_sheet,
        eligibility=elig,
        assets=cs.get("assets") or {},
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
    # EOD balances come from the real bank statement when present (eod_matrix);
    # otherwise honest blanks (the analyser doesn't always produce them).
    eod = banking_detail.get("eod_matrix") or {}

    def _eod(day: str):
        v = eod.get(day)
        return list(v[:n]) if v else list(blank)

    eod_prov = "real" if eod else "placeholder"
    rows = [
        BankingMatrixRow(feature="EOD Balance — 1st", values=_eod("1st"), prov=eod_prov),
        BankingMatrixRow(feature="EOD Balance — 5th", values=_eod("5th"), prov=eod_prov),
        BankingMatrixRow(feature="EOD Balance — 10th", values=_eod("10th"), prov=eod_prov),
        BankingMatrixRow(feature="EOD Balance — 15th", values=_eod("15th"), prov=eod_prov),
        BankingMatrixRow(feature="EOD Balance — 20th", values=_eod("20th"), prov=eod_prov),
        BankingMatrixRow(feature="EOD Balance — 25th", values=_eod("25th"), prov=eod_prov),
        BankingMatrixRow(feature="Monthly average balance", values=_eod("avg"), prov=eod_prov),
        BankingMatrixRow(feature="Credit amount", values=[c.get("inflow") for c in cashflow], prov="real"),
        BankingMatrixRow(feature="Debit amount", values=[c.get("outflow") for c in cashflow], prov="real"),
        BankingMatrixRow(feature="Credit count", values=list(blank), prov="placeholder"),
        BankingMatrixRow(feature="Debit count", values=list(blank), prov="placeholder"),
        BankingMatrixRow(feature="AQB / EMI ratio", values=list(blank), prov="placeholder"),
    ]
    return BankingMatrix(months=months, rows=rows)
