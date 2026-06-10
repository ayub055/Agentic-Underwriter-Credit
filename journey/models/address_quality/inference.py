"""Address-quality model inference (dependency-free stub).

Production seam: the checkpoint at ``address_quality_v1.pt`` is a PyTorch state
dict loaded via ``torch.load`` and run through an ``nn.Module``. For the demo we
keep the *same* contract — standardize → linear → sigmoid — in pure Python so the
journey runs with zero ML dependencies. Swap ``_load_state`` + ``forward`` for the
real torch path and nothing else in the pipeline changes.

The model is a logistic regressor over seven engineered address features and
returns P(address is good) plus a per-feature contribution breakdown (used
upstream to build human-readable reason codes)."""

from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Optional

_ARTIFACT = Path(__file__).resolve().parent / "address_quality_v1.pt"


def _load_state(path: Path) -> dict:
    """Load the model state dict.

    Tries ``torch.load`` first (real checkpoint), falls back to JSON so the demo
    runs without PyTorch. Both paths yield the same dict schema."""
    try:  # pragma: no cover - exercised only when torch is installed
        import torch  # type: ignore

        return torch.load(path, map_location="cpu", weights_only=False)
    except Exception:
        return json.loads(path.read_text())


def _sigmoid(x: float) -> float:
    if x < -60:
        return 0.0
    if x > 60:
        return 1.0
    return 1.0 / (1.0 + math.exp(-x))


class AddressQualityModel:
    """Tiny logistic-regression scorer. Mirrors the real nn.Module's forward()."""

    def __init__(self, state: dict):
        self.features: list[str] = state["features"]
        self.labels: dict[str, str] = state.get("feature_labels", {})
        self.mean: list[float] = state["standardize"]["mean"]
        self.std: list[float] = state["standardize"]["std"]
        self.weights: list[float] = state["weights"]
        self.bias: float = state["bias"]
        self.version: str = state.get("model_version", "address-quality-vunknown")

    def _vector(self, features: dict[str, float]) -> list[float]:
        return [float(features.get(name, self.mean[i])) for i, name in enumerate(self.features)]

    def forward(self, features: dict[str, float]) -> dict:
        """Return prob_good, raw logit, and signed per-feature contributions."""
        x = self._vector(features)
        contributions: dict[str, float] = {}
        logit = self.bias
        for i, name in enumerate(self.features):
            z = (x[i] - self.mean[i]) / (self.std[i] or 1.0)
            c = self.weights[i] * z
            contributions[name] = c
            logit += c
        return {
            "prob_good": _sigmoid(logit),
            "logit": logit,
            "contributions": contributions,
        }

    # Convenience alias so callers can treat the model as callable.
    __call__ = forward


_MODEL: Optional[AddressQualityModel] = None


def load_model(path: Path | str | None = None) -> AddressQualityModel:
    """Process-cached loader (the checkpoint is read once)."""
    global _MODEL
    if path is not None:
        return AddressQualityModel(_load_state(Path(path)))
    if _MODEL is None:
        _MODEL = AddressQualityModel(_load_state(_ARTIFACT))
    return _MODEL


def infer(features: dict[str, float]) -> dict:
    """Forward pass on the cached model."""
    return load_model().forward(features)
