"""Stage ABC + the status/timing/audit/fail-soft execution wrapper."""

from __future__ import annotations

import abc
import time

from audit import AuditTrace
from state import CaseState, StageStatus


class Stage(abc.ABC):
    name: str

    @abc.abstractmethod
    async def run(self, case: CaseState) -> None: ...


async def execute(stage: Stage, case: CaseState, audit: AuditTrace) -> None:
    case.stage_status[stage.name] = StageStatus.running
    t0 = time.time()
    try:
        await stage.run(case)
        case.stage_status[stage.name] = StageStatus.done
        error = None
    except Exception as e:  # fail-soft: a stage crash degrades the case, never aborts the journey
        case.stage_status[stage.name] = StageStatus.failed
        error = f"{type(e).__name__}: {e}"
        case.warnings.append(f"{stage.name} failed: {error}")
    audit.write("stage", stage=stage.name, status=case.stage_status[stage.name].value,
                elapsed_s=round(time.time() - t0, 3), error=error)
