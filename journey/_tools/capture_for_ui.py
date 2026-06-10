"""Capture a real journey run for the dashboard's Backend Agentic Journey view.

Runs the full journey for a customer, then writes the FINAL CaseState (finalize
done) + the JSONL audit trace into dashboard/src/data/realRun/ as JSON the
frontend imports. Honest, real data — not a scripted demo.
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # journey/

from orchestrator import JourneyAgent  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "dashboard" / "src" / "data" / "realRun"


def main() -> int:
    customer_id = int(sys.argv[1]) if len(sys.argv) > 1 else 698167220
    case = asyncio.run(JourneyAgent().run(customer_id))

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "caseState.json").write_text(case.model_dump_json(indent=2))

    trace = []
    if case.audit_trace_path and Path(case.audit_trace_path).exists():
        for line in Path(case.audit_trace_path).read_text().splitlines():
            if line.strip():
                trace.append(json.loads(line))
    (OUT_DIR / "trace.json").write_text(json.dumps(trace, indent=2))

    print(f"captured case_id={case.case_id} outcome={case.outcome.value} "
          f"branches={ {k: v.status.value for k, v in case.branches.items()} } "
          f"trace_records={len(trace)} -> {OUT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
