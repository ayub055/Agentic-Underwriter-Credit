"""CamModel — the typed, render-ready view-model for the Credit Appraisal Memo.

One contract consumed by both renderers: the Jinja2 canonical artifact
(journey/cam/render.py) and the dashboard React viewer (via serialized JSON).

Honesty: values are passed through as-is (None where a source is absent); a flat
`provenance` map (dotted-field -> real|derived|mock|placeholder) lets each
renderer stamp a chip and show "—" instead of inventing data.
"""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


class CamMeta(BaseModel):
    case_id: Optional[str] = None
    run_id: Optional[str] = None
    customer_id: Optional[int] = None
    outcome: Optional[str] = None
    generated_at: Optional[str] = None
    channel: str = "Digital · self-serve"


class ApplicationSection(BaseModel):
    application_no: Optional[str] = None
    date: Optional[str] = None
    channel: Optional[str] = None
    location: Optional[str] = None          # city
    pincode: Optional[str] = None
    loan_amount_req: Optional[float] = None
    tenure_req: Optional[int] = None
    product: str = "Personal Loan"


class ApplicantSection(BaseModel):
    name: Optional[str] = None
    dob: Optional[str] = None
    age: Optional[int] = None
    qualification: Optional[str] = None
    residence_type: Optional[str] = None     # ownership
    years_at_address: Optional[int] = None
    address_line: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    address_score: Optional[float] = None
    address_band: Optional[str] = None
    address_reasons: list[dict] = Field(default_factory=list)


class EmploymentSection(BaseModel):
    employer: Optional[str] = None
    category: Optional[str] = None
    designation: Optional[str] = None
    employment_verified: Optional[bool] = None
    stability_months: Optional[int] = None   # EPFO tenure (mock today)
    total_experience: Optional[str] = None


class LoanSection(BaseModel):
    offer_amount: Optional[float] = None
    offer_tenure: Optional[int] = None
    offer_irr: Optional[float] = None        # fraction (0.1349)
    offer_emi: Optional[float] = None
    processing_fee: Optional[float] = None
    foir_proposed: Optional[float] = None
    approved_segment: Optional[str] = None


class FinancialSection(BaseModel):
    declared_income: Optional[float] = None
    income_used: Optional[float] = None
    income_source: Optional[str] = None
    salary_detected: Optional[float] = None  # banking
    foir_existing: Optional[float] = None
    total_obligation: Optional[float] = None  # existing EMI debits
    total_exposure: Optional[float] = None    # bureau outstanding


class VerificationItem(BaseModel):
    label: str
    status: Optional[bool] = None            # None -> not available
    detail: Optional[str] = None
    prov_key: Optional[str] = None           # dotted key into provenance map


class DeviationsSection(BaseModel):
    policy_result: Optional[str] = None
    serviceable: Optional[bool] = None
    layers: list[dict] = Field(default_factory=list)   # PolicyLayerResult dicts
    breaches: list[dict] = Field(default_factory=list)  # failed layers / gates
    warnings: list[str] = Field(default_factory=list)


class CreditManagerSection(BaseModel):
    decisioned_by: str = "Agentic Underwriting Engine"
    ai_assisted: Optional[bool] = None
    model_versions: dict = Field(default_factory=dict)
    reviewed_by: Optional[str] = None        # manual sign-off (placeholder)
    approved_by: Optional[str] = None
    remarks: Optional[str] = None


class PDSheetSection(BaseModel):
    pd_score: Optional[float] = None
    pd_provenance: Optional[str] = None
    risk_band: Optional[int] = None
    affluence_value: Optional[float] = None
    affluence_segment: Optional[str] = None
    policy_features: dict = Field(default_factory=dict)


class CamModel(BaseModel):
    meta: CamMeta = Field(default_factory=CamMeta)
    application: ApplicationSection = Field(default_factory=ApplicationSection)
    applicant: ApplicantSection = Field(default_factory=ApplicantSection)
    employment: EmploymentSection = Field(default_factory=EmploymentSection)
    loan: LoanSection = Field(default_factory=LoanSection)
    financial: FinancialSection = Field(default_factory=FinancialSection)
    # Rich pass-through slices (from cam_data.json); shapes from _cam_detail.py.
    obligations: dict[str, Any] = Field(default_factory=dict)
    banking: dict[str, Any] = Field(default_factory=dict)
    verification: list[VerificationItem] = Field(default_factory=list)
    deviations: DeviationsSection = Field(default_factory=DeviationsSection)
    credit_manager: CreditManagerSection = Field(default_factory=CreditManagerSection)
    pd_sheet: PDSheetSection = Field(default_factory=PDSheetSection)
    # dotted-field -> provenance string (merged journey map + CAM-specific tags).
    provenance: dict[str, str] = Field(default_factory=dict)
