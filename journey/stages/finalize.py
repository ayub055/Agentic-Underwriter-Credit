"""S6 Finalize — stamp the outcome, copy the S2-rendered artifacts into the case
pack, write the audit bundle + provenance map, and mock the push notification.
The outcome itself is decided by the orchestrator before this stage runs."""

from __future__ import annotations

import json
import shutil
from pathlib import Path

import config
from provenance import Provenance, ProvenanceMap
from state import CaseState, Outcome
from stages.base import Stage


def _provenance_map(case: CaseState) -> dict:
    pm = ProvenanceMap()
    pm.tag_all(["intake.kyc_verified", "intake.employment_verified", "intake.consent_captured",
                "intake.address_verified", "intake.declared_income", "intake.loan_amount_req"],
               Provenance.mock)
    pm.tag_all(["summary.cibil_score", "summary.npa_flag", "summary.total_exposure",
                "summary.max_dpd_overall", "summary.enq_count", "summary.salary_income_detected",
                "summary.existing_emi_debits", "summary.affluence_band"], Provenance.real)
    pm.tag_all(["summary.max_dpd_unsecured", "summary.bounce_count", "summary.cashflow_consistency",
                "ml.foir_existing", "decision.foir_proposed", "decision.offer_emi"],
               Provenance.derived)
    pm.tag_all(["ml.pd_score", "ml.risk_band", "decision.offer_irr", "decision.processing_fee",
                "policy.thresholds", "address.score", "address.band", "address.pd_adjustment"],
               Provenance.placeholder)
    return dict(pm)


class FinalizeStage(Stage):
    name = "finalize"

    async def run(self, case: CaseState) -> None:
        fin = case.finalize
        fin.decision = case.outcome or Outcome.insufficient

        case_dir = config.OUTPUT_DIR / case.case_id
        artifacts = case_dir / "artifacts"
        artifacts.mkdir(parents=True, exist_ok=True)

        # Copy the S2-rendered artifacts (repo-relative -> isolate into the pack).
        for branch, res in case.branches.items():
            if not res.report_path:
                continue
            src = Path(config.BRANCHES[branch]["repo"]) / res.report_path
            if src.exists():
                shutil.copy2(src, artifacts / f"{branch}_{src.name}")
            else:
                case.warnings.append(f"finalize: artifact missing for {branch}: {src}")

        fin.model_versions = {
            "banking_narrative": (case.branches.get("banking") or None) and case.branches["banking"].model_used,
            "bureau_narrative": (case.branches.get("bureau") or None) and case.branches["bureau"].model_used,
            "pd_model": "placeholder",
            "pricing": "placeholder",
            "address_model": case.address.model_version or "address-quality-v1.2.0",
        }
        fin.provenance_map = _provenance_map(case)

        (case_dir / "case_state.json").write_text(case.model_dump_json(indent=2))
        (case_dir / "policy_trace.json").write_text(
            json.dumps([l.model_dump() for l in case.policy.layers], indent=2))
        (case_dir / "decision_log.json").write_text(case.decision.model_dump_json(indent=2))
        (case_dir / "provenance_map.json").write_text(json.dumps(fin.provenance_map, indent=2))
        (case_dir / "sal_slip.json").write_text(json.dumps(
            {"status": "placeholder", "sal_gross": None, "sal_net": None}, indent=2))

        # Mock push (log only).
        fin.push_sent = True
        case.warnings.append(f"finalize: [mock-push] case {case.case_id} -> {fin.decision.value}")
        fin.audit_pack_path = str(case_dir)
