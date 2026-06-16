"""CaseState + per-stage sub-models — the shared, schema-first "case dict".

Journey-owned; imports NEITHER analyser repo (foreign objects only ever arrive
as plain dicts via the subprocess boundary)."""

from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field

from provenance import Provenance


class BranchStatus(str, Enum):
    ok = "ok"
    degraded = "degraded"
    failed = "failed"


class StageStatus(str, Enum):
    waiting = "waiting"
    running = "running"
    done = "done"
    failed = "failed"
    skipped = "skipped"


class Outcome(str, Enum):
    approved = "APPROVED"
    manual_review = "MANUAL_REVIEW"
    declined = "DECLINED"
    insufficient = "INSUFFICIENT_DATA"


class BranchResult(BaseModel):
    branch: str
    status: BranchStatus
    summary: Optional[dict] = None
    detail: Optional[dict] = None   # rich CAM slices (obligations / banking blocks)
    report_path: Optional[str] = None
    model_used: Optional[str] = None
    error: Optional[str] = None
    elapsed_s: float = 0.0


class IntakeBlock(BaseModel):
    loan_amount_req: Optional[float] = None
    tenure_req: Optional[int] = None
    declared_income: Optional[float] = None
    employer: Optional[str] = None
    kyc_verified: Optional[bool] = None
    employment_verified: Optional[bool] = None
    consent_captured: Optional[bool] = None
    sal_gross: Optional[float] = None
    sal_net: Optional[float] = None
    address_verified: bool = True
    address_zone_score: Optional[float] = None
    address: dict = Field(default_factory=dict)   # raw applicant address (scored in S1.5)


class AddressBlock(BaseModel):
    """S1.5 Address-quality model output (score + band + reason codes)."""
    score: Optional[float] = None              # 0–100 quality score
    band: Optional[str] = None                 # HIGH | MEDIUM | LOW
    prob_good: Optional[float] = None
    confidence: Optional[float] = None
    pd_adjustment: Optional[float] = None       # signed nudge folded into PD
    review_flag: bool = False                   # LOW band -> manual-review hint
    reasons: list[dict] = Field(default_factory=list)   # [{code,label,impact,direction}]
    features: dict = Field(default_factory=dict)
    model_version: Optional[str] = None
    provenance: Provenance = Provenance.placeholder


class Layer2Summary(BaseModel):
    cibil_score: Optional[int] = None
    bureau_risk_grade: Optional[str] = None
    max_dpd_overall: Optional[int] = None
    max_dpd_unsecured: Optional[int] = None
    npa_flag: Optional[bool] = None
    enq_count: Optional[int] = None
    total_exposure: Optional[float] = None
    bureau_persona: Optional[str] = None
    salary_income_detected: Optional[float] = None
    existing_emi_debits: Optional[float] = None
    bounce_count: Optional[int] = None
    affluence_band: Optional[str] = None
    cashflow_consistency: Optional[str] = None
    negative_flags: Optional[str] = None
    spend_category: Optional[str] = None


class MLBlock(BaseModel):
    pd_score: Optional[float] = None
    pd_provenance: Provenance = Provenance.placeholder
    risk_band: Optional[int] = None
    affluence_value: Optional[float] = None
    affluence_segment: Optional[str] = None
    income_used: Optional[float] = None
    income_source: str = "declared"
    foir_existing: Optional[float] = None
    policy_features: dict = Field(default_factory=dict)


class PolicyLayerResult(BaseModel):
    layer: str
    passed: bool
    reason_code: str
    detail: Optional[str] = None


class PolicyBlock(BaseModel):
    result: Optional[str] = None       # APPROVED | DECLINED | MANUAL_REVIEW
    approved_segment: Optional[str] = None
    decline_layer: Optional[str] = None
    review_reason: Optional[str] = None
    layers: list[PolicyLayerResult] = Field(default_factory=list)
    ai_assisted_flag: bool = False


class DecisionBlock(BaseModel):
    selected: Optional[bool] = None
    serviceable: Optional[bool] = None
    contactible: Optional[bool] = None
    foir_proposed: Optional[float] = None
    offer_amount: Optional[float] = None
    offer_tenure: Optional[int] = None
    offer_irr: Optional[float] = None
    offer_emi: Optional[float] = None
    processing_fee: Optional[float] = None


class FinalizeBlock(BaseModel):
    decision: Optional[Outcome] = None
    audit_pack_path: Optional[str] = None
    push_sent: bool = False
    model_versions: dict = Field(default_factory=dict)
    provenance_map: dict = Field(default_factory=dict)


class CaseState(BaseModel):
    customer_id: int
    case_id: str
    run_id: str
    intake: IntakeBlock = Field(default_factory=IntakeBlock)
    address: AddressBlock = Field(default_factory=AddressBlock)
    branches: dict[str, BranchResult] = Field(default_factory=dict)
    summary: Layer2Summary = Field(default_factory=Layer2Summary)
    ml: MLBlock = Field(default_factory=MLBlock)
    policy: PolicyBlock = Field(default_factory=PolicyBlock)
    decision: DecisionBlock = Field(default_factory=DecisionBlock)
    finalize: FinalizeBlock = Field(default_factory=FinalizeBlock)
    outcome: Optional[Outcome] = None
    stage_status: dict[str, StageStatus] = Field(default_factory=dict)
    warnings: list[str] = Field(default_factory=list)
    hard_fail: Optional[str] = None
    audit_trace_path: Optional[str] = None
