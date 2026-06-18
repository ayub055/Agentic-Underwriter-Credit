"""Regenerate the CAM model JSON + printable HTML from SAVED artifacts, without
re-running the full pipeline.

Loads journey/output/<case_id>/{case_state,cam_data,sal_slip}.json, folds in the
Tele PD block (placeholder, sourced from the dashboard fixture so there's one
source of truth), builds the CamModel, and writes:
  - journey/output/<case_id>/cam_model.json + cam_<case_id>.html
  - dashboard/src/data/realRun/camModel.json
  - dashboard/public/reports/cam_report.html

Usage:  ~/anaconda3/bin/python journey/_tools/regen_cam.py [case_id]
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # journey/

from cam.build import build_cam_model  # noqa: E402
from cam.render import render_cam_html  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
DASH = ROOT / "dashboard" / "src" / "data" / "realRun"
REPORTS = ROOT / "dashboard" / "public" / "reports"


def _load(p: Path) -> dict:
    return json.loads(p.read_text()) if p.exists() else {}


def main() -> int:
    case_id = sys.argv[1] if len(sys.argv) > 1 else "PL-2026-8bd9c6"
    case_dir = ROOT / "journey" / "output" / case_id

    case_state = _load(case_dir / "case_state.json")
    cam_data = _load(case_dir / "cam_data.json")
    sal_slip = _load(case_dir / "sal_slip.json")

    # Tele PD is captured on a human call (placeholder) — fold the dashboard
    # fixture's block in so the CAM mirrors the journey view exactly.
    dash_state = _load(DASH / "caseState.json")
    if dash_state.get("tele_pd"):
        case_state["tele_pd"] = dash_state["tele_pd"]

    model = build_cam_model(case_state, cam_data, sal_slip)
    model_json = model.model_dump_json(indent=2)
    html = render_cam_html(model)

    (case_dir / "cam_model.json").write_text(model_json)
    (case_dir / f"cam_{case_id}.html").write_text(html)
    DASH.mkdir(parents=True, exist_ok=True)
    (DASH / "camModel.json").write_text(model_json)
    REPORTS.mkdir(parents=True, exist_ok=True)
    (REPORTS / "cam_report.html").write_text(html)

    tp = model.pd_sheet.tele_pd
    print(f"regen ok case_id={case_id} tele_pd_questions={len(tp.questions)} "
          f"deviation_reasons={len(tp.deviation_reasons)} -> {DASH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
