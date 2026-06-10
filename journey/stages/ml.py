"""S3 ML — placeholder PD / risk band / affluence / existing-FOIR (D2).

PD is a deterministic stand-in, NOT a trained scorecard (pd_provenance=placeholder;
real Banking_Agent/tools/scorecard.py wiring is the seam). Income = declared first,
banking-detected fallback (D1)."""

from __future__ import annotations

import config
from provenance import Provenance
from state import CaseState
from stages.base import Stage


def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


def _placeholder_pd(case: CaseState, foir_existing: float | None) -> float:
    s = case.summary
    if s.cibil_score is None:
        pd = 0.50
    else:
        pd = 0.40 - (_clamp(s.cibil_score, 300, 900) - 300) / 600 * 0.38
    if s.npa_flag:
        pd += 0.25
    if s.max_dpd_overall:
        pd += min(s.max_dpd_overall, 180) / 180 * 0.20
    if foir_existing and foir_existing > config.FOIR_CAP:
        pd += 0.10
    if s.bounce_count:
        pd += min(s.bounce_count, 5) * 0.01
    if s.enq_count and s.enq_count > config.ENQ_SPIKE_THRESHOLD:
        pd += 0.05
    return round(_clamp(pd, 0.01, 0.95), 4)


def _risk_band(pd: float) -> int:
    for limit, band in ((0.05, 1), (0.10, 2), (0.20, 3), (0.35, 4)):
        if pd < limit:
            return band
    return 5


def _affluence_segment(income: float | None) -> str | None:
    if income is None:
        return None
    for threshold, label in config.AFFLUENCE_SEGMENTS:
        if income >= threshold:
            return label
    return None


class MLStage(Stage):
    name = "ml"

    async def run(self, case: CaseState) -> None:
        ml = case.ml

        income = case.intake.declared_income
        ml.income_source = "declared"
        if income is None:
            income = case.summary.salary_income_detected
            ml.income_source = "banking_detected"
        ml.income_used = income

        emi = case.summary.existing_emi_debits
        if income and income > 0 and emi is not None:
            ml.foir_existing = round(emi / income, 4)

        pd = _placeholder_pd(case, ml.foir_existing)
        # S1.5 address-quality nudge: strong address lowers PD, weak raises it.
        addr_adj = case.address.pd_adjustment or 0.0
        ml.policy_features = {}   # placeholder dict
        if addr_adj:
            pd = round(_clamp(pd + addr_adj, 0.01, 0.95), 4)
            ml.policy_features["address_pd_adjustment"] = addr_adj
            ml.policy_features["address_band"] = case.address.band
        ml.pd_score = pd
        ml.pd_provenance = Provenance.placeholder
        ml.risk_band = _risk_band(ml.pd_score)
        ml.affluence_value = income
        ml.affluence_segment = _affluence_segment(income)
