"""CAM (Credit Appraisal Memo) — assembles the 11-section credit-manager report
from a completed CaseState + the rich cam_data pack, then renders a canonical
print-ready HTML artifact. The same CamModel is serialized to JSON for the
dashboard's React viewer, so both renderers agree field-for-field."""

from cam.build import build_cam_model
from cam.model import CamModel

__all__ = ["build_cam_model", "CamModel"]
