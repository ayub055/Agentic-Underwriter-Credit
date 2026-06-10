"""Fast, subprocess-free check that all four outcomes are reachable by exercising
the deterministic Policy + Decision logic with crafted Layer2/ML inputs."""

from __future__ import annotations

import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from state import CaseState, Layer2Summary, MLBlock          # noqa: E402
from stages.decision import DecisionStage                     # noqa: E402
from stages.policy import PolicyStage                         # noqa: E402


def _case(summary: dict, ml: dict, intake: dict | None = None) -> CaseState:
    c = CaseState(customer_id=1, case_id="PL-TEST", run_id="test")
    c.summary = Layer2Summary(**summary)
    c.ml = MLBlock(**ml)
    if intake:
        for k, v in intake.items():
            setattr(c.intake, k, v)
    return c


async def _policy(case: CaseState) -> str:
    await PolicyStage().run(case)
    return case.policy.result


def main() -> int:
    checks = []

    # DECLINED via L1 NPA
    c = _case({"npa_flag": True, "cibil_score": 800}, {"pd_score": 0.05, "income_used": 100000})
    checks.append(("DECLINED@L1_NPA", asyncio.run(_policy(c)) == "DECLINED" and c.policy.decline_layer == "L1_NPA"))

    # DECLINED via L2 DPD90
    c = _case({"max_dpd_overall": 120, "cibil_score": 700}, {"pd_score": 0.05, "income_used": 100000})
    checks.append(("DECLINED@L2_DPD90", asyncio.run(_policy(c)) == "DECLINED" and c.policy.decline_layer == "L2_DPD90_24M"))

    # MANUAL_REVIEW via L3 DPD60
    c = _case({"max_dpd_overall": 70, "cibil_score": 760}, {"pd_score": 0.05, "income_used": 100000})
    checks.append(("MANUAL_REVIEW@L3_DPD60", asyncio.run(_policy(c)) == "MANUAL_REVIEW"))

    # MANUAL_REVIEW via PD mid-zone (cibil 650 -> pd ~0.18) + ai_assisted flag
    c = _case({"cibil_score": 650}, {"pd_score": 0.18, "income_used": 100000})
    checks.append(("MANUAL_REVIEW@PD_MIDZONE", asyncio.run(_policy(c)) == "MANUAL_REVIEW" and c.policy.ai_assisted_flag))

    # APPROVED + serviceable (clean bureau, long tenure, low ask vs income)
    c = _case(
        {"cibil_score": 800, "npa_flag": False, "total_exposure": 100000, "existing_emi_debits": 5000},
        {"pd_score": 0.03, "risk_band": 1, "income_used": 150000, "affluence_segment": "premium"},
        {"loan_amount_req": 300000, "tenure_req": 60, "consent_captured": True},
    )
    r = asyncio.run(_policy(c))
    asyncio.run(DecisionStage().run(c))
    checks.append(("APPROVED+serviceable", r == "APPROVED" and c.decision.serviceable is True))

    ok = True
    for name, passed in checks:
        print(f"  [{'PASS' if passed else 'FAIL'}] {name}")
        ok = ok and passed
    print("ALL PASS" if ok else "SOME FAILED")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
