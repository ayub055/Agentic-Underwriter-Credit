"""Branch summarizers — pure functions over a JSON-safe report dict that extract
the explicit Layer2Summary-shaped fields. These ARE the A0-pinned mapper paths
(validated 2026-06-08 against customer 698167220). They run inside the subprocess
(no repo imports needed) and stay pure for testability.

Rule: never fabricate — a missing source yields None, and the mapper warns.
"""

from __future__ import annotations

from typing import Any, Optional

_SPEND_IGNORE = {"Self_Transfer", "P2P"}
_BOUNCE_HINTS = ("bounce", "return", "reversal", "insufficient", "dishonour", "dishonor")


def _get(d: Any, path: str) -> Any:
    cur = d
    for part in path.split("."):
        if not isinstance(cur, dict):
            return None
        cur = cur.get(part)
    return cur


def _bucket_stability(score: Optional[float]) -> Optional[str]:
    if score is None:
        return None
    if score >= 70:
        return "high"
    if score >= 40:
        return "medium"
    return "low"


def summarize_banking(report: dict) -> dict:
    emis = report.get("emis") or []
    existing_emi = sum(float(e.get("amount", 0) or 0) for e in emis) if emis else None

    co = report.get("category_overview") or {}
    spend = None
    if co:
        ranked = [(k, v) for k, v in co.items() if k not in _SPEND_IGNORE]
        ranked.sort(key=lambda kv: kv[1] or 0, reverse=True)
        spend = ranked[0][0] if ranked else None

    events = report.get("events")
    bounce = None
    if isinstance(events, list):
        bounce = sum(
            1
            for e in events
            if any(
                h in (str(e.get("type", "")) + " " + str(e.get("description", ""))).lower()
                for h in _BOUNCE_HINTS
            )
        )

    risk_flags = _get(report, "risk_indicators.risk_flags")
    negative = ", ".join(risk_flags) if isinstance(risk_flags, list) and risk_flags else None

    return {
        "salary_income_detected": _get(report, "salary.avg_amount"),
        "existing_emi_debits": existing_emi,
        "cashflow_consistency": _bucket_stability(_get(report, "risk_indicators.income_stability_score")),
        "negative_flags": negative,
        "affluence_band": _get(report, "account_quality.account_type"),  # A0: NOT "classification"
        "spend_category": spend,
        "bounce_count": bounce,
    }


def summarize_bureau(report: dict) -> dict:
    ei = report.get("executive_inputs") or {}

    pb = ei.get("product_breakdown") or {}
    uns_dpds = [
        v.get("max_dpd")
        for v in pb.values()
        if isinstance(v, dict) and v.get("secured") is False and v.get("max_dpd") is not None
    ]
    max_dpd_unsecured = max(uns_dpds) if uns_dpds else None

    return {
        "cibil_score": ei.get("tu_score"),
        "npa_flag": ei.get("has_delinquency"),
        "total_exposure": ei.get("total_outstanding"),
        "max_dpd_overall": ei.get("max_dpd"),
        "max_dpd_unsecured": max_dpd_unsecured,
        "enq_count": _get(report, "tradeline_features.unsecured_enquiries_12m"),
        "bureau_persona": None,       # no stored persona field (only raw_loan_profile counts)
        "bureau_risk_grade": None,    # not stored — leave None + warn
    }


SUMMARIZERS = {"banking": summarize_banking, "bureau": summarize_bureau}
