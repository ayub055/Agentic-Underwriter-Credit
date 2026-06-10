"""JourneyAgent — threads one CaseState through the DAG, owns outcome transitions
and short-circuits (DECLINE / MANUAL_REVIEW skip S5; INSUFFICIENT_DATA skips S3–S5)."""

from __future__ import annotations

import hashlib
from datetime import datetime
from uuid import uuid4

import validator
from adapters.base import Transport
from audit import AuditTrace
from state import CaseState, Outcome, StageStatus
from stages.base import execute
from stages.decision import DecisionStage
from stages.finalize import FinalizeStage
from stages.intake import IntakeStage
from stages.layer2 import Layer2Stage
from stages.ml import MLStage
from stages.policy import PolicyStage
from stages.sufficiency import SufficiencyStage

STAGES = ("intake", "layer2", "sufficiency", "ml", "policy", "decision", "finalize")


class JourneyAgent:
    def __init__(self, transport: Transport | None = None):
        self.transport = transport

    def _new_case(self, customer_id: int) -> CaseState:
        digest = hashlib.sha256(str(customer_id).encode()).hexdigest()[:6]
        case = CaseState(
            customer_id=customer_id,
            case_id=f"PL-{datetime.now().year}-{digest}",   # idempotent (D6)
            run_id=uuid4().hex,
        )
        for name in STAGES:
            case.stage_status[name] = StageStatus.waiting
        return case

    @staticmethod
    def _skip(case: CaseState, names) -> None:
        for name in names:
            if case.stage_status.get(name) == StageStatus.waiting:
                case.stage_status[name] = StageStatus.skipped

    async def run_layer2(self, customer_id: int) -> CaseState:
        case = self._new_case(customer_id)
        audit = AuditTrace(case.case_id)
        case.audit_trace_path = str(audit.path)
        await execute(IntakeStage(), case, audit)
        await execute(Layer2Stage(audit, self.transport), case, audit)
        return case

    async def run(self, customer_id: int) -> CaseState:
        case = self._new_case(customer_id)
        audit = AuditTrace(case.case_id)
        case.audit_trace_path = str(audit.path)

        await execute(IntakeStage(), case, audit)
        await execute(Layer2Stage(audit, self.transport), case, audit)
        await execute(SufficiencyStage(), case, audit)

        if case.outcome == Outcome.insufficient:
            self._skip(case, ["ml", "policy", "decision"])
        else:
            await execute(MLStage(), case, audit)
            await execute(PolicyStage(), case, audit)
            result = case.policy.result

            if result == "APPROVED":
                await execute(DecisionStage(), case, audit)
                if case.decision.serviceable:
                    case.outcome = Outcome.approved
                else:
                    case.outcome = Outcome.declined
                    case.warnings.append("orchestrator: APPROVED but not serviceable -> DECLINED")
            elif result == "DECLINED":
                case.outcome = Outcome.declined
                self._skip(case, ["decision"])
            else:  # MANUAL_REVIEW or None (policy incomplete -> human)
                case.outcome = Outcome.manual_review
                self._skip(case, ["decision"])

        validator.validate_final(case)   # hard-fail may force INSUFFICIENT_DATA
        await execute(FinalizeStage(), case, audit)
        return case
