"""Journey-local JSONL audit trace. One record per stage/branch/fold.

Cannot reuse either repo's pipeline/core/audit.py — namespace collision and they
live behind the subprocess boundary."""

from __future__ import annotations

import json
import time
from pathlib import Path

import config


class AuditTrace:
    def __init__(self, case_id: str):
        config.LOGS_DIR.mkdir(parents=True, exist_ok=True)
        self.path = config.LOGS_DIR / f"{case_id}.jsonl"
        # fresh trace per run of this case (idempotent case_id reuses the file)
        self.path.write_text("")

    def write(self, kind: str, **fields) -> None:
        record = {"ts": round(time.time(), 3), "kind": kind, **fields}
        with self.path.open("a") as fh:
            fh.write(json.dumps(record, ensure_ascii=False, default=str) + "\n")
