"""Render the canonical CAM HTML artifact from a CamModel.

Self-contained HTML (inline CSS), dashboard-modern styling + an @media print
block so "Download PDF" is just the browser print dialog. This file is the
source of truth for the printed memo; the React viewer mirrors it on screen.
"""

from __future__ import annotations

from pathlib import Path
from typing import Optional

from jinja2 import Environment, FileSystemLoader, select_autoescape

from cam.model import CamModel

_TEMPLATES = Path(__file__).resolve().parent / "templates"


# ---- Jinja2 filters (pure formatting; None -> em dash, never invented) ----

def _inr(v) -> str:
    if v is None:
        return "—"
    try:
        n = float(v)
    except (TypeError, ValueError):
        return "—"
    neg = n < 0
    n = abs(round(n))
    s = str(n)
    if len(s) > 3:
        last3 = s[-3:]
        rest = s[:-3]
        parts = []
        while len(rest) > 2:
            parts.insert(0, rest[-2:])
            rest = rest[:-2]
        if rest:
            parts.insert(0, rest)
        s = ",".join(parts) + "," + last3
    return ("-₹" if neg else "₹") + s


def _pct(v, of_fraction: bool = True) -> str:
    if v is None:
        return "—"
    try:
        n = float(v) * 100 if of_fraction else float(v)
    except (TypeError, ValueError):
        return "—"
    return f"{n:.2f}%"


def _num(v) -> str:
    return "—" if v is None else str(v)


def _yn(v) -> str:
    if v is None:
        return "—"
    return "Yes" if v else "No"


def _env() -> Environment:
    env = Environment(
        loader=FileSystemLoader(str(_TEMPLATES)),
        autoescape=select_autoescape(["html"]),
    )
    env.filters["inr"] = _inr
    env.filters["pct"] = _pct
    env.filters["num"] = _num
    env.filters["yn"] = _yn
    return env


def render_cam_html(model: CamModel) -> str:
    return _env().get_template("cam.html").render(m=model, prov=model.provenance)


def write_cam_html(model: CamModel, out_path: Path) -> Path:
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(render_cam_html(model), encoding="utf-8")
    return out_path
