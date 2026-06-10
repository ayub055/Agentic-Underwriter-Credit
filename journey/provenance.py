"""Field provenance: keeps the audit pack honest about what is real vs fabricated
so a placeholder-PD decline is never read as a real adjudication."""

from __future__ import annotations

from enum import Enum


class Provenance(str, Enum):
    real = "real"           # derived from a real analyser output
    derived = "derived"     # computed from real inputs by journey logic
    mock = "mock"           # deterministic stand-in (KYC/EPFO/consent/address)
    placeholder = "placeholder"  # not yet a real model/table (PD, pricing, thresholds)


class ProvenanceMap(dict):
    """dotted-field -> Provenance. Thin dict wrapper for audit serialization."""

    def tag(self, field: str, prov: Provenance) -> None:
        self[field] = prov.value

    def tag_all(self, fields, prov: Provenance) -> None:
        for f in fields:
            self[f] = prov.value
