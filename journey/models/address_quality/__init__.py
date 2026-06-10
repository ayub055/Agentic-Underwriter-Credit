"""Address-quality scoring model (demo seam).

Public surface:
    score_address(address: dict) -> AddressQualityResult
    AddressQualityResult, AddressReason
    load_model() / infer(features)
"""

from .inference import AddressQualityModel, infer, load_model
from .scoring import (
    AddressQualityResult,
    AddressReason,
    engineer_features,
    score_address,
)

__all__ = [
    "score_address",
    "AddressQualityResult",
    "AddressReason",
    "engineer_features",
    "AddressQualityModel",
    "load_model",
    "infer",
]
