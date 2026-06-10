# Address Quality Scorer — `address-quality-v1.2.0`

A lightweight model that scores the **quality and verifiability of an applicant's
residential address** as an early credit-risk signal. It runs in **Stage 1.5
(Address Intelligence)**, right after Intake and before the Bureau∥Banking pull.

## Contract

```python
from models.address_quality import score_address
res = score_address(address_dict)   # -> AddressQualityResult
res.score        # 0–100 quality score
res.band         # HIGH (≥75) | MEDIUM (≥50) | LOW (<50)
res.reasons      # ranked AddressReason[] (code, label, impact, direction)
res.confidence   # |p−0.5|*2
res.model_version
```

## Inputs (engineered features)

| feature | source |
|---|---|
| `kyc_address_match` | address vs KYC record |
| `pincode_serviceable` | PIN inside serviceable network |
| `years_at_address` | residential tenure |
| `ownership_owned` | owned vs rented |
| `address_completeness` | fraction of line/city/state/pincode present |
| `geo_risk_index` | geo-risk lookup (lower = safer) |
| `digital_footprint` | delivery / utility verifiability |

## Files

- `address_quality_v1.pt` — model checkpoint (the inference artifact).
- `inference.py` — loads the checkpoint and runs `forward()` (standardize → linear → sigmoid).
- `scoring.py` — feature engineering + final score/band/reason mapping (**public entrypoint**).

## How it feeds the decision

- ML stage: `pd_adjustment = ADDRESS_PD_WEIGHT · (0.5 − prob_good)` nudges PD
  down for strong addresses, up for weak ones.
- Policy stage: a `LOW` band raises an `L0_ADDRESS` manual-review flag (soft gate,
  never an independent decline).

## Demo seam / honesty

The `.pt` is a **demo stub**: weights are illustrative, not trained, and the
checkpoint is serialized as JSON so the journey runs without PyTorch. Output is
provenance-tagged `placeholder` in the audit pack — exactly like the placeholder
PD scorecard — so a stub-driven result is never read as a real adjudication.
Swap `inference._load_state` + `AddressQualityModel.forward` for the real
`torch.load` + `nn.Module` path and nothing else in the pipeline changes.
