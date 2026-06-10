"""A0 field-pinning: dump a real builder payload to pin mapper paths.

Runs INSIDE a target repo (cwd + sys.path = repo root) so the repo's absolute
imports resolve, calls the render-free builder, and writes the JSON-safe
serialized structure to --out. Invoked as a subprocess (never co-imported).

Usage (from a repo root):
    python <journey>/_tools/dump_payload.py --builder pipeline.reports.bureau_report_builder:build_bureau_report \
        --customer-id 698167220 --out /tmp/bureau_698167220.json
"""

from __future__ import annotations

import argparse
import importlib
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "journey"))
from runners._encode import to_jsonable  # noqa: E402

# Repo root (we are run with cwd = repo) must lead sys.path so its absolute
# imports (config/, pipeline/, schemas/, ...) resolve.
sys.path.insert(0, os.getcwd())


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--builder", required=True, help="module.path:function")
    ap.add_argument("--customer-id", required=True, type=int)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    mod_name, func_name = args.builder.split(":")
    func = getattr(importlib.import_module(mod_name), func_name)
    report = func(args.customer_id)

    payload = to_jsonable(report)
    Path(args.out).write_text(json.dumps(payload, indent=2, ensure_ascii=False))

    top = sorted(payload.keys()) if isinstance(payload, dict) else type(payload).__name__
    print(f"OK builder={func_name} customer={args.customer_id} top_keys={top}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
