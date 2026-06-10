"""Final address-quality scoring — the public entrypoint the pipeline calls.

Turns a raw applicant address dict into engineered features, runs the model
(``inference.py``), and maps the probability into a 0–100 quality score, a band
(HIGH / MEDIUM / LOW), and ranked reason codes for explainability. The reason
codes are what the customer-facing agent narrates and the audit pack records."""

from __future__ import annotations

import hashlib
from dataclasses import asdict, dataclass, field
from typing import Optional

from .inference import load_model

# Band cutoffs on the 0–100 quality score.
BAND_HIGH = 75
BAND_MEDIUM = 50

# A few low-risk metro PIN prefixes treated as inside the serviceable network.
_SERVICEABLE_PREFIXES = {"560", "110", "400", "600", "500", "700", "411", "380", "201", "122"}


@dataclass
class AddressReason:
    code: str
    label: str
    impact: float          # signed contribution to the score (+ good, − detracts)
    direction: str         # "positive" | "negative"


@dataclass
class AddressQualityResult:
    score: float                       # 0–100
    band: str                          # HIGH | MEDIUM | LOW
    prob_good: float                   # raw model probability
    confidence: float                  # |prob − 0.5| * 2, in [0, 1]
    reasons: list = field(default_factory=list)   # list[AddressReason] (top drivers)
    features: dict = field(default_factory=dict)  # engineered feature vector (audit)
    model_version: str = "address-quality-vunknown"

    def to_dict(self) -> dict:
        d = asdict(self)
        d["reasons"] = [asdict(r) if isinstance(r, AddressReason) else r for r in self.reasons]
        return d


def _band(score: float) -> str:
    if score >= BAND_HIGH:
        return "HIGH"
    if score >= BAND_MEDIUM:
        return "MEDIUM"
    return "LOW"


def _pincode_serviceable(pincode: Optional[str]) -> float:
    pin = str(pincode or "")
    return 1.0 if pin[:3] in _SERVICEABLE_PREFIXES else 0.0


def _geo_risk_index(pincode: Optional[str]) -> float:
    """Deterministic stand-in for a real geo-risk lookup: low for serviceable
    metro prefixes, otherwise a stable hash-derived value in [0, 1]."""
    pin = str(pincode or "")
    if pin[:3] in _SERVICEABLE_PREFIXES:
        # Spread serviceable metros across a low-risk band [0.10, 0.30).
        h = int(hashlib.sha256(pin.encode()).hexdigest(), 16) % 20
        return round(0.10 + h / 100.0, 3)
    h = int(hashlib.sha256(("risk" + pin).encode()).hexdigest(), 16) % 100
    return round(0.45 + h / 200.0, 3)   # [0.45, 0.95)


def _completeness(address: dict) -> float:
    keys = ("line", "city", "state", "pincode")
    present = sum(1 for k in keys if str(address.get(k) or "").strip())
    return round(present / len(keys), 3)


def engineer_features(address: dict) -> dict[str, float]:
    """Raw applicant address dict -> the model's feature vector."""
    pincode = address.get("pincode")
    return {
        "kyc_address_match": 1.0 if address.get("kyc_address_match") else 0.0,
        "pincode_serviceable": _pincode_serviceable(pincode),
        "years_at_address": float(address.get("years_at_address") or 0.0),
        "ownership_owned": 1.0 if str(address.get("ownership", "")).lower() == "owned" else 0.0,
        "address_completeness": _completeness(address),
        "geo_risk_index": _geo_risk_index(pincode),
        "digital_footprint": 1.0 if address.get("digital_footprint") else 0.0,
    }


# Direction-aware phrasing so a reason reads correctly whether it helped or hurt.
_DIRECTIONAL_LABELS = {
    "kyc_address_match": ("Address matches KYC records", "Address mismatch vs KYC"),
    "pincode_serviceable": ("PIN inside serviceable network", "PIN outside serviceable network"),
    "years_at_address": ("Long residential tenure", "Short residential tenure"),
    "ownership_owned": ("Self-owned residence", "Rented residence"),
    "address_completeness": ("Complete, well-formed address", "Incomplete address"),
    "geo_risk_index": ("Low-risk geographic zone", "Elevated geographic risk zone"),
    "digital_footprint": ("Verifiable delivery / utility footprint", "Thin digital footprint"),
}


def _build_reasons(model, contributions: dict[str, float], top_k: int = 3) -> list[AddressReason]:
    ordered = sorted(contributions.items(), key=lambda kv: abs(kv[1]), reverse=True)
    reasons: list[AddressReason] = []
    for name, impact in ordered[:top_k]:
        positive = impact >= 0
        pair = _DIRECTIONAL_LABELS.get(name)
        label = (pair[0] if positive else pair[1]) if pair else model.labels.get(
            name, name.replace("_", " ").title())
        reasons.append(AddressReason(
            code=name.upper(),
            label=label,
            impact=round(impact, 4),
            direction="positive" if positive else "negative",
        ))
    return reasons


def score_address(address: dict) -> AddressQualityResult:
    """Public API: raw address dict -> AddressQualityResult (score, band, reasons)."""
    model = load_model()
    features = engineer_features(address)
    out = model.forward(features)
    prob = out["prob_good"]
    score = round(prob * 100.0, 1)
    return AddressQualityResult(
        score=score,
        band=_band(score),
        prob_good=round(prob, 4),
        confidence=round(abs(prob - 0.5) * 2.0, 4),
        reasons=_build_reasons(model, out["contributions"]),
        features=features,
        model_version=model.version,
    )


if __name__ == "__main__":   # quick manual smoke
    demo = {
        "line": "Flat 7B, Lakeview Residency", "city": "Bengaluru", "state": "KA",
        "pincode": "560103", "years_at_address": 6, "ownership": "owned",
        "kyc_address_match": True, "digital_footprint": True,
    }
    res = score_address(demo)
    print(f"score={res.score} band={res.band} prob={res.prob_good} conf={res.confidence}")
    for r in res.reasons:
        print(f"  {r.direction:8} {r.impact:+.3f}  {r.label}")
