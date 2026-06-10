"""Smoke entry: `python -m journey <customer_id> [--layer2]`."""

from __future__ import annotations

import argparse
import asyncio

from orchestrator import JourneyAgent
from state import CaseState


def _print(case: CaseState, layer2_only: bool) -> None:
    print(f"\ncase_id={case.case_id}  run_id={case.run_id[:8]}  customer={case.customer_id}")
    print("stages:", {k: v.value for k, v in case.stage_status.items()})
    print("branches:", {k: v.status.value for k, v in case.branches.items()})
    print("summary:", case.summary.model_dump())
    if not layer2_only:
        print("ml:", case.ml.model_dump())
        print("policy:", case.policy.result, "| decline:", case.policy.decline_layer,
              "| review:", case.policy.review_reason, "| ai_assisted:", case.policy.ai_assisted_flag)
        print("decision:", case.decision.model_dump())
        print("OUTCOME:", case.outcome.value if case.outcome else None)
        print("audit_pack:", case.finalize.audit_pack_path)
    print(f"warnings ({len(case.warnings)}):")
    for w in case.warnings:
        print("  -", w)
    print("trace:", case.audit_trace_path)


def main() -> int:
    ap = argparse.ArgumentParser(prog="journey")
    ap.add_argument("customer_id", type=int)
    ap.add_argument("--layer2", action="store_true", help="run Layer-2 only")
    args = ap.parse_args()

    agent = JourneyAgent()
    case = asyncio.run(agent.run_layer2(args.customer_id) if args.layer2 else agent.run(args.customer_id))
    _print(case, args.layer2)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
