"""S1 Intake — three deterministic sub-steps (karza_api, kyc_api, address_agent):
identity/PAN (Karza), KYC + EPFO + consent, and the address-quality model run on a
reproducible per-customer mock address. The sal-slip RAG remains a deferred seam."""

from __future__ import annotations

import config
from models.address_quality import score_address
from provenance import Provenance
from state import CaseState
from stages.base import Stage

_TENURES = (12, 24, 36, 48, 60)

# Deterministic mock address pool (cid selects one -> reproducible, varied quality).
_ADDRESSES = (
    {"line": "Flat 7B, Lakeview Residency", "city": "Bengaluru", "state": "KA",
     "pincode": "560103", "years_at_address": 6, "ownership": "owned",
     "kyc_address_match": True, "digital_footprint": True},
    {"line": "12 Hill Road", "city": "Mumbai", "state": "MH",
     "pincode": "400050", "years_at_address": 3, "ownership": "rented",
     "kyc_address_match": True, "digital_footprint": True},
    {"line": "House 44, Sector 21", "city": "Gurugram", "state": "HR",
     "pincode": "122016", "years_at_address": 2, "ownership": "rented",
     "kyc_address_match": True, "digital_footprint": False},
    {"line": "", "city": "Madhubani", "state": "BR",
     "pincode": "847211", "years_at_address": 1, "ownership": "rented",
     "kyc_address_match": False, "digital_footprint": False},
)


class IntakeStage(Stage):
    name = "intake"

    async def run(self, case: CaseState) -> None:
        cid = case.customer_id
        ik = case.intake

        # Deterministic mock application (seeded on customer_id -> reproducible).
        ik.declared_income = 40000 + (cid % 60) * 1000
        ik.loan_amount_req = 300000 + (cid % 50) * 10000
        ik.tenure_req = _TENURES[cid % len(_TENURES)]
        ik.employer = "Mock Employer Pvt Ltd"

        # karza_api: identity / PAN verified (deterministic mock).
        ik.kyc_verified = True
        # kyc_api: KYC + EPFO + consent (D7: consent gates Stage 2).
        ik.employment_verified = True
        ik.consent_captured = True

        # address_agent: score the raw applicant address with the address-quality
        # model (sub-step of intake). Feeds the PD nudge (ML) and the L0 policy flag.
        ik.address = dict(_ADDRESSES[cid % len(_ADDRESSES)])
        self._score_address(case)

        # Sal-slip RAG placeholder — left unpopulated.
        ik.sal_gross = None
        ik.sal_net = None

    @staticmethod
    def _score_address(case: CaseState) -> None:
        ik = case.intake
        a = case.address
        res = score_address(ik.address)
        a.score = res.score
        a.band = res.band
        a.prob_good = res.prob_good
        a.confidence = res.confidence
        a.reasons = res.to_dict()["reasons"]
        a.features = res.features
        a.model_version = res.model_version
        a.provenance = Provenance.placeholder            # stub model — honest in audit
        a.pd_adjustment = round(config.ADDRESS_PD_WEIGHT * (0.5 - res.prob_good), 4)
        a.review_flag = res.band == config.ADDRESS_REVIEW_BAND
        ik.address_zone_score = res.score
        ik.address_verified = res.band != "LOW"
        if a.review_flag:
            case.warnings.append(
                f"intake/address_agent: LOW band (score={res.score}) -> manual-review flag")
