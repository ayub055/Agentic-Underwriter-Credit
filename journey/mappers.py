"""Fold per-branch explicit summaries -> Layer2Summary.

The subprocess summarizers already did the A0-pinned field reads, so this layer
just merges, coerces types, and warns on absent fields (no fabrication)."""

from __future__ import annotations

from typing import Optional

from state import BranchResult, CaseState, Layer2Summary

BUREAU_KEYS = ("cibil_score", "npa_flag", "total_exposure", "max_dpd_overall",
               "max_dpd_unsecured", "enq_count", "bureau_persona", "bureau_risk_grade")
BANKING_KEYS = ("salary_income_detected", "existing_emi_debits", "cashflow_consistency",
                "negative_flags", "affluence_band", "spend_category", "bounce_count")

_INT_FIELDS = {"cibil_score", "max_dpd_overall", "max_dpd_unsecured", "enq_count", "bounce_count"}


def _coerce(field: str, value):
    if value is None:
        return None
    if field in _INT_FIELDS:
        return int(value)
    if field in {"total_exposure", "salary_income_detected", "existing_emi_debits"}:
        return float(value)
    return value


def fold(case: CaseState, branches: dict[str, BranchResult]) -> Layer2Summary:
    merged: dict = {}
    for branch, keys in (("bureau", BUREAU_KEYS), ("banking", BANKING_KEYS)):
        result = branches.get(branch)
        summary = (result.summary if result else None) or {}
        for key in keys:
            merged[key] = _coerce(key, summary.get(key))
            if merged[key] is None:
                reason = "branch unavailable" if not summary else "field absent in report"
                case.warnings.append(f"layer2: {branch}.{key} -> None ({reason})")

    case.summary = Layer2Summary(**merged)
    return case.summary
