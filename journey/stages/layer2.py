"""S2 Layer 2 — Banking ∥ Bureau as parallel isolated subprocesses, then fold to
Layer2Summary + validate. Consent (D7) gates the bureau pull."""

from __future__ import annotations

import asyncio

import mappers
import validator
from adapters import banking, bureau
from adapters.base import SubprocessTransport, Transport
from audit import AuditTrace
from state import BranchResult, BranchStatus, CaseState
from stages.base import Stage


class Layer2Stage(Stage):
    name = "layer2"

    def __init__(self, audit: AuditTrace, transport: Transport | None = None):
        self.audit = audit
        self.transport = transport or SubprocessTransport()

    async def run(self, case: CaseState) -> None:
        if not case.intake.consent_captured:
            case.warnings.append("layer2: consent not captured — bureau pull blocked")
            case.branches["bureau"] = BranchResult(
                branch="bureau", status=BranchStatus.failed, error="consent not captured")
            banking_res = await banking.run(self.transport, case.customer_id)
            results = [banking_res, case.branches["bureau"]]
        else:
            results = await asyncio.gather(
                banking.run(self.transport, case.customer_id),
                bureau.run(self.transport, case.customer_id),
            )

        for res in results:
            case.branches[res.branch] = res
            self.audit.write("branch", branch=res.branch, status=res.status.value,
                             report_path=res.report_path, model_used=res.model_used,
                             elapsed_s=res.elapsed_s, error=res.error)

        mappers.fold(case, case.branches)
        validator.validate_layer2(case)
        self.audit.write("fold", summary=case.summary.model_dump(),
                         warnings=len(case.warnings))
