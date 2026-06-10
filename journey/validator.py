"""Cross-branch / cross-stage sanity. Enumerated invariants -> warnings, with one
hard-fail class (approve-on-blind) that forces INSUFFICIENT_DATA."""

from __future__ import annotations

from state import BranchStatus, CaseState, Outcome

INCOME_DIVERGENCE_PCT = 0.5    # banking-detected vs declared


def validate_layer2(case: CaseState) -> None:
    s = case.summary
    bureau = case.branches.get("bureau")
    bureau_failed = bureau is None or bureau.status == BranchStatus.failed

    if s.cibil_score is not None and bureau_failed:
        case.warnings.append("validator: cibil_score present but bureau branch failed (contradiction)")

    declared = case.intake.declared_income
    detected = s.salary_income_detected
    if declared and detected and declared > 0:
        if abs(detected - declared) / declared > INCOME_DIVERGENCE_PCT:
            case.warnings.append(
                f"validator: income divergence declared={declared} vs detected={detected} (>50%)")

    if s.npa_flag and s.max_dpd_overall is None:
        case.warnings.append("validator: npa_flag True but max_dpd_overall None (inconsistent)")


def validate_final(case: CaseState) -> None:
    """Hard-fail class: approving blind (bureau failed AND no CIBIL)."""
    bureau = case.branches.get("bureau")
    bureau_failed = bureau is None or bureau.status == BranchStatus.failed
    if case.policy.result == "APPROVED" and bureau_failed and case.summary.cibil_score is None:
        case.hard_fail = "approve-on-blind: APPROVED with bureau failed and cibil_score None"
        case.warnings.append("validator HARD FAIL: " + case.hard_fail)
        case.outcome = Outcome.insufficient
