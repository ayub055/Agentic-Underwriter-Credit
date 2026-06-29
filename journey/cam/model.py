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
    # Section 1 — General Detail
    application_no: Optional[str] = None
    date: Optional[str] = None
    channel: Optional[str] = None
    location: Optional[str] = None          # city
    pincode: Optional[str] = None
    loan_amount_req: Optional[float] = None
    tenure_req: Optional[int] = None
    product: str = "Personal Loan"
    loan_type: Optional[str] = None         # Fresh | Balance Transfer
    scheme: Optional[str] = None            # e.g. "Normal Program"
    sub_scheme: Optional[str] = None        # e.g. "Corp Sal DMA"
    lead_reference: Optional[str] = None
    sub_source: Optional[str] = None
    existing_kotak_customer: Optional[bool] = None
    purpose_of_loan: Optional[str] = None
    dma_name: Optional[str] = None


class ApplicantSection(BaseModel):
    # Section 2.1 — Applicant Detail
    name: Optional[str] = None
    gender: Optional[str] = None
    pan: Optional[str] = None
    crn: Optional[str] = None                 # Kotak customer reference no. (ETB)
    salary_account_no: Optional[str] = None
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
    marital_status: Optional[str] = None
    color_band: Optional[str] = None
    salary_account_flag: Optional[bool] = None       # is this the salary account
    salary_disb_same: Optional[bool] = None          # salary == disbursement account


class EmploymentSection(BaseModel):
    # Section 2.2 — Applicant Employment Detail
    employer: Optional[str] = None
    category: Optional[str] = None                   # company category
    designation: Optional[str] = None
    employment_verified: Optional[bool] = None
    stability_months: Optional[int] = None   # EPFO tenure (mock today)
    total_experience: Optional[str] = None
    years_in_current_company: Optional[str] = None
    income_band: Optional[str] = None


class ExistingLoanRow(BaseModel):
    """One applicant-declared live loan (Section 5). bt_flag marks the loan a
    Balance Transfer is clearing — netted out of proposed FOIR at decision time."""
    lender: Optional[str] = None
    loan_type: str = "Personal Loan"
    sanctioned: Optional[float] = None
    outstanding: Optional[float] = None
    emi: Optional[float] = None
    bt_flag: bool = False
    status: Optional[str] = None             # "Consider BT" | "Considered"


class LoanColumn(BaseModel):
    """One column of Section 3 (System Approval / Applied / Sanctioned)."""
    amount: Optional[float] = None
    tenure: Optional[int] = None
    irr: Optional[float] = None              # fraction
    emi: Optional[float] = None
    foir: Optional[float] = None             # fraction
    unsecured_foir: Optional[float] = None   # fraction
    multiplier: Optional[float] = None


class LoanSection(BaseModel):
    # Legacy single-offer fields (kept for the print template / back-compat)
    offer_amount: Optional[float] = None
    offer_tenure: Optional[int] = None
    offer_irr: Optional[float] = None        # fraction (0.1349)
    offer_emi: Optional[float] = None
    processing_fee: Optional[float] = None
    foir_proposed: Optional[float] = None
    approved_segment: Optional[str] = None
    # Section 3 — three-column view
    system_approval: LoanColumn = Field(default_factory=LoanColumn)
    applied: LoanColumn = Field(default_factory=LoanColumn)
    sanctioned: LoanColumn = Field(default_factory=LoanColumn)


class FinancialSection(BaseModel):
    declared_income: Optional[float] = None
    income_used: Optional[float] = None
    income_source: Optional[str] = None
    salary_detected: Optional[float] = None  # banking
    foir_existing: Optional[float] = None
    total_obligation: Optional[float] = None  # existing EMI debits
    total_exposure: Optional[float] = None    # bureau outstanding
    # Section 4 extras
    net_salary: Optional[float] = None
    current_fixed_obligation: Optional[float] = None
    monthly_obligation: list[Optional[float]] = Field(default_factory=list)  # M1..M4
    obligation_months: list[str] = Field(default_factory=list)
    fcu_trigger: Optional[bool] = None
    max_serviceable_emi: Optional[float] = None


class VerificationItem(BaseModel):
    label: str
    status: Optional[bool] = None            # None -> not available
    detail: Optional[str] = None
    prov_key: Optional[str] = None           # dotted key into provenance map


class DeviationRow(BaseModel):
    """One row of Section 8 — Deviation."""
    deviation_type: Optional[str] = None
    applicant_type: str = "Primary"
    rule_description: Optional[str] = None
    credit_approval_level: Optional[str] = None
    system_decision: Optional[str] = None


class DeviationsSection(BaseModel):
    policy_result: Optional[str] = None
    serviceable: Optional[bool] = None
    layers: list[dict] = Field(default_factory=list)   # PolicyLayerResult dicts
    breaches: list[dict] = Field(default_factory=list)  # failed layers / gates
    warnings: list[str] = Field(default_factory=list)
    rows: list[DeviationRow] = Field(default_factory=list)
    bre: list[DeviationRow] = Field(default_factory=list)   # documented BRE deviations (CAM §7)


class CreditConditionRow(BaseModel):
    """One row of Section 9 — Credit Condition."""
    applicant_type: str = "Primary"
    condition_for: Optional[str] = None      # e.g. Sales
    condition_name: Optional[str] = None
    remarks: Optional[str] = None


class LoanAmountSection(BaseModel):
    """Section 10 — final sanction / rejection."""
    final_amount: Optional[float] = None
    final_tenor: Optional[int] = None
    rejection_reason: Optional[str] = None
    reject_datetime: Optional[str] = None


class BankingMatrixRow(BaseModel):
    """One feature row of Section 6 — Banking Summary matrix."""
    feature: str
    values: list[Optional[Any]] = Field(default_factory=list)  # aligned to months
    prov: Optional[str] = None


class BankingMatrix(BaseModel):
    months: list[str] = Field(default_factory=list)
    rows: list[BankingMatrixRow] = Field(default_factory=list)


class CreditManagerSection(BaseModel):
    decisioned_by: str = "Kotak Agentic Underwriter"
    ai_assisted: Optional[bool] = None
    model_versions: dict = Field(default_factory=dict)
    reviewed_by: Optional[str] = None        # manual sign-off
    approved_by: Optional[str] = None
    recommended_by_first: Optional[str] = None
    recommended_by_last: Optional[str] = None
    approved_by_first: Optional[str] = None
    approved_by_last: Optional[str] = None
    disbursed_by: Optional[str] = None
    disbursal_date: Optional[str] = None
    remarks: Optional[str] = None
    decision_date: Optional[str] = None


class TelePdQuestion(BaseModel):
    id: Optional[str] = None
    q: Optional[str] = None
    answer: Optional[str] = None
    note: Optional[str] = None


class TelePdSection(BaseModel):
    status: Optional[str] = None
    officer: Optional[str] = None
    conducted_at: Optional[str] = None
    ctc_document: Optional[str] = None
    questions: list[TelePdQuestion] = Field(default_factory=list)
    deviation_reasons: list[str] = Field(default_factory=list)


class PDSheetSection(BaseModel):
    pd_score: Optional[float] = None
    pd_provenance: Optional[str] = None
    risk_band: Optional[int] = None
    affluence_value: Optional[float] = None
    affluence_segment: Optional[str] = None
    policy_features: dict = Field(default_factory=dict)
    remarks: Optional[str] = None
    tele_pd: TelePdSection = Field(default_factory=TelePdSection)


class CamModel(BaseModel):
    meta: CamMeta = Field(default_factory=CamMeta)
    application: ApplicationSection = Field(default_factory=ApplicationSection)
    applicant: ApplicantSection = Field(default_factory=ApplicantSection)
    employment: EmploymentSection = Field(default_factory=EmploymentSection)
    loan: LoanSection = Field(default_factory=LoanSection)
    financial: FinancialSection = Field(default_factory=FinancialSection)
    # Applicant-declared existing loans (Section 5 — BT view, from the form).
    existing_loans: list[ExistingLoanRow] = Field(default_factory=list)
    # Rich pass-through slices (from cam_data.json); shapes from _cam_detail.py.
    obligations: dict[str, Any] = Field(default_factory=dict)
    banking: dict[str, Any] = Field(default_factory=dict)
    banking_matrix: BankingMatrix = Field(default_factory=BankingMatrix)
    verification: list[VerificationItem] = Field(default_factory=list)
    deviations: DeviationsSection = Field(default_factory=DeviationsSection)
    credit_conditions: list[CreditConditionRow] = Field(default_factory=list)
    loan_amount: LoanAmountSection = Field(default_factory=LoanAmountSection)
    credit_manager: CreditManagerSection = Field(default_factory=CreditManagerSection)
    pd_sheet: PDSheetSection = Field(default_factory=PDSheetSection)
    # Documented eligibility (FOIR / multiplier / product cap / override) + assets.
    eligibility: dict[str, Any] = Field(default_factory=dict)
    assets: dict[str, Any] = Field(default_factory=dict)
    # dotted-field -> provenance string (merged journey map + CAM-specific tags).
    provenance: dict[str, str] = Field(default_factory=dict)
