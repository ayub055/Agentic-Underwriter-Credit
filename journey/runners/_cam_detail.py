"""CAM-detail extractors — pure functions over the JSON-safe report dict that keep
the rich slices the Credit Appraisal Memo (CAM) needs but the thin Layer2Summary
drops: the per-loan-type obligation table (bureau) and the full banking summary
(salary / EMIs / cashflow / savings / risk).

Run inside the subprocess (no repo imports), alongside _summarize.SUMMARIZERS.

Rule: never fabricate — a missing source yields None/empty, never an invented
number. The downstream CAM renders `—` + a provenance chip for anything absent.
"""

from __future__ import annotations

from typing import Any


def _obligation_row(loan_type: str, vec: dict) -> dict:
    """One live-obligation row from a BureauLoanFeatureVector dict."""
    return {
        "loan_type": vec.get("loan_type") or loan_type,
        "secured": vec.get("secured"),
        "loan_count": vec.get("loan_count"),
        "live_count": vec.get("live_count"),
        "closed_count": vec.get("closed_count"),
        "total_sanctioned": vec.get("total_sanctioned_amount"),
        "total_outstanding": vec.get("total_outstanding_amount"),
        "overdue_amount": vec.get("overdue_amount"),
        "max_dpd": vec.get("max_dpd"),
        "max_dpd_months_ago": vec.get("max_dpd_months_ago"),
        "delinquency_flag": vec.get("delinquency_flag"),
        "utilization_ratio": vec.get("utilization_ratio"),
        "avg_vintage_months": vec.get("avg_vintage_months"),
        "earliest_opened": vec.get("earliest_opened"),
        "latest_opened": vec.get("latest_opened"),
        "latest_closed": vec.get("latest_closed"),
        "on_us_count": vec.get("on_us_count"),
        "on_us_outstanding": vec.get("on_us_outstanding"),
    }


def cam_detail_bureau(report: dict) -> dict:
    """Obligation table + portfolio totals + exposure trend from BureauReport.

    `feature_vectors` is a dict keyed by loan-type value (enum keys are stringified
    by runners._encode.to_jsonable); each value is a BureauLoanFeatureVector dict.
    """
    fv = report.get("feature_vectors") or {}
    obligations = []
    if isinstance(fv, dict):
        for loan_type, vec in fv.items():
            if isinstance(vec, dict):
                obligations.append(_obligation_row(str(loan_type), vec))

    ei = report.get("executive_inputs") or {}
    totals = {
        "total_tradelines": ei.get("total_tradelines"),
        "live_tradelines": ei.get("live_tradelines"),
        "closed_tradelines": ei.get("closed_tradelines"),
        "total_sanctioned": ei.get("total_sanctioned"),
        "total_outstanding": ei.get("total_outstanding"),
        "unsecured_outstanding": ei.get("unsecured_outstanding"),
        "tu_score": ei.get("tu_score"),
        "has_delinquency": ei.get("has_delinquency"),
        "max_dpd": ei.get("max_dpd"),
        "max_dpd_loan_type": ei.get("max_dpd_loan_type"),
        "on_us_total_outstanding": ei.get("on_us_total_outstanding"),
        "total_joint_count": ei.get("total_joint_count"),
    }

    return {
        "obligations": obligations,
        "totals": totals,
        "monthly_exposure": report.get("monthly_exposure"),
        "narrative": report.get("narrative"),
    }


def cam_detail_banking(report: dict) -> dict:
    """Full banking summary blocks from the banking CustomerReport dict."""
    salary = report.get("salary")
    salary_block = None
    if isinstance(salary, dict):
        salary_block = {
            "avg_amount": salary.get("avg_amount"),
            "frequency": salary.get("frequency"),
            "narration": salary.get("narration"),
            "latest_transaction": salary.get("latest_transaction"),
        }

    emis = report.get("emis") or []
    emi_rows = [
        {"name": e.get("name"), "amount": e.get("amount"), "frequency": e.get("frequency")}
        for e in emis
        if isinstance(e, dict)
    ]

    # Top spend categories (skip internal transfers), highest first.
    co = report.get("category_overview") or {}
    top_categories = []
    if isinstance(co, dict):
        ranked = [(k, v) for k, v in co.items() if k not in ("Self_Transfer", "P2P")]
        ranked.sort(key=lambda kv: kv[1] or 0, reverse=True)
        top_categories = [{"category": k, "amount": v} for k, v in ranked[:6]]

    return {
        "salary": salary_block,
        "emis": emi_rows,
        "savings": report.get("savings"),
        "risk_indicators": report.get("risk_indicators"),
        "account_quality": report.get("account_quality"),
        "checklist": report.get("checklist"),
        "monthly_cashflow": report.get("monthly_cashflow"),
        "top_categories": top_categories,
        "customer_review": report.get("customer_review"),
    }


CAM_DETAILERS = {"banking": cam_detail_banking, "bureau": cam_detail_bureau}
