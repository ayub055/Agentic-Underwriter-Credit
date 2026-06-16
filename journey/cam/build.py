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
    CamMeta,
    CamModel,
    CreditManagerSection,
    DeviationsSection,
    EmploymentSection,
    FinancialSection,
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
    "employment.employer": Provenance.mock,
    "employment.stability_months": Provenance.mock,
    "loan.offer_amount": Provenance.derived,
    "loan.offer_tenure": Provenance.derived,
    "financial.income_used": Provenance.derived,
    "financial.salary_detected": Provenance.real,
    "financial.total_obligation": Provenance.real,
    "financial.total_exposure": Provenance.real,
    "obligations": Provenance.real,
    "banking": Provenance.real,
    "credit_manager.reviewed_by": Provenance.placeholder,
    "credit_manager.approved_by": Provenance.placeholder,
    "pd_sheet.affluence_value": Provenance.derived,
    "pd_sheet.affluence_segment": Provenance.derived,
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
    )

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
        pincode=addr.get("pincode"),
        address_score=addr_block.get("score"),
        address_band=addr_block.get("band"),
        address_reasons=addr_block.get("reasons") or [],
    )

    employment = EmploymentSection(
        employer=intake.get("employer"),
        employment_verified=intake.get("employment_verified"),
        stability_months=sal_slip.get("epfo_months"),
        total_experience=_months_to_experience(sal_slip.get("epfo_months")),
    )

    loan = LoanSection(
        offer_amount=decision.get("offer_amount"),
        offer_tenure=decision.get("offer_tenure"),
        offer_irr=decision.get("offer_irr"),
        offer_emi=decision.get("offer_emi"),
        processing_fee=decision.get("processing_fee"),
        foir_proposed=decision.get("foir_proposed"),
        approved_segment=policy.get("approved_segment"),
    )

    financial = FinancialSection(
        declared_income=intake.get("declared_income"),
        income_used=ml.get("income_used"),
        income_source=ml.get("income_source"),
        salary_detected=summary.get("salary_income_detected"),
        foir_existing=ml.get("foir_existing"),
        total_obligation=summary.get("existing_emi_debits"),
        total_exposure=summary.get("total_exposure"),
    )

    verification = [
        VerificationItem(label="KYC (Karza)", status=intake.get("kyc_verified"),
                         prov_key="intake.kyc_verified"),
        VerificationItem(label="PAN validation", status=intake.get("kyc_verified"),
                         detail="bundled with KYC", prov_key="intake.kyc_verified"),
        VerificationItem(label="Employment (EPFO)", status=intake.get("employment_verified"),
                         prov_key="intake.employment_verified"),
        VerificationItem(label="Address verification", status=intake.get("address_verified"),
                         detail=(f"{addr_block.get('band')} · {addr_block.get('score')}/100"
                                 if addr_block.get("band") else None),
                         prov_key="intake.address_verified"),
        VerificationItem(label="Consent captured", status=intake.get("consent_captured"),
                         prov_key="intake.consent_captured"),
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
    deviations = DeviationsSection(
        policy_result=policy.get("result"),
        serviceable=decision.get("serviceable"),
        layers=layers,
        breaches=breaches,
        warnings=cs.get("warnings") or [],
    )

    credit_manager = CreditManagerSection(
        ai_assisted=policy.get("ai_assisted_flag"),
        model_versions=fin.get("model_versions") or {},
    )

    pd_sheet = PDSheetSection(
        pd_score=ml.get("pd_score"),
        pd_provenance=ml.get("pd_provenance"),
        risk_band=ml.get("risk_band"),
        affluence_value=ml.get("affluence_value"),
        affluence_segment=ml.get("affluence_segment"),
        policy_features=ml.get("policy_features") or {},
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
        verification=verification,
        deviations=deviations,
        credit_manager=credit_manager,
        pd_sheet=pd_sheet,
        provenance=prov,
    )
