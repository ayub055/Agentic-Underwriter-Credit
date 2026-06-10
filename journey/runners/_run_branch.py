"""Generic in-subprocess branch entry (Banking / Bureau).

Runs with cwd = repo root so the repo's absolute imports resolve, calls the
render entry (data + artifact + LLM narrative, per D3), extracts the explicit
summary dict, and writes the result to --out as JSON. Result travels via the
file channel, NOT stdout — pandas/langchain/tqdm prints cannot corrupt it.

Fail-soft: if the render entry raises (e.g. PDF backend missing), fall back to
the render-free builder so the summary still populates; report_path = None.
"""

from __future__ import annotations

import argparse
import importlib
import json
import os
import sys
import time
import traceback
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))  # journey/ for sibling imports
sys.path.insert(0, os.getcwd())                                # repo root leads

from runners._encode import to_jsonable          # noqa: E402
from runners._summarize import SUMMARIZERS        # noqa: E402


def _call(spec: str, customer_id: int):
    mod_name, func_name = spec.split(":")
    return getattr(importlib.import_module(mod_name), func_name)(customer_id)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--branch", required=True)
    ap.add_argument("--customer-id", required=True, type=int)
    ap.add_argument("--render", required=True, help="module:function render entry")
    ap.add_argument("--builder", required=True, help="module:function fallback builder")
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    result = {"ok": False, "summary": None, "report_path": None,
              "model_used": None, "elapsed_s": 0.0, "error": None}
    t0 = time.time()

    report = None
    try:
        out = _call(args.render, args.customer_id)
        report, report_path = out if isinstance(out, tuple) else (out, None)
        result["report_path"] = report_path
    except Exception:
        print("render entry failed; falling back to builder\n" + traceback.format_exc(),
              file=sys.stderr)
        try:
            report = _call(args.builder, args.customer_id)
        except Exception as e:
            result["error"] = f"builder failed: {e}\n{traceback.format_exc()}"

    if report is not None:
        rd = to_jsonable(report)
        result["summary"] = SUMMARIZERS[args.branch](rd)
        narrative = rd.get("customer_review") or rd.get("narrative")
        result["model_used"] = "ollama-local" if narrative else None
        result["ok"] = True

    result["elapsed_s"] = round(time.time() - t0, 3)
    Path(args.out).write_text(json.dumps(result, ensure_ascii=False))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
