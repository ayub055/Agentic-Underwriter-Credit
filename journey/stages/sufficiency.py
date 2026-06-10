"""S2.5 Data sufficiency gate — if both Layer-2 branches are unusable (no CIBIL
AND no detected income), terminate as INSUFFICIENT_DATA so ML/Policy never run on
all-None inputs."""

from __future__ import annotations

from state import CaseState, Outcome
from stages.base import Stage


class SufficiencyStage(Stage):
    name = "sufficiency"

    async def run(self, case: CaseState) -> None:
        s = case.summary
        usable = s.cibil_score is not None or s.salary_income_detected is not None
        if not usable:
            case.outcome = Outcome.insufficient
            case.warnings.append("sufficiency: no CIBIL and no detected income -> INSUFFICIENT_DATA")
