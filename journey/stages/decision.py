"""S5 Decision — runs only on a clean policy APPROVE. Selection -> offer calc
(amortization + placeholder pricing table) -> serviceability (foir_proposed) ->
consent (already captured). Non-serviceable flips the case to a decline upstream."""

from __future__ import annotations

import config
from state import CaseState
from stages.base import Stage


def _emi(principal: float, annual_irr: float, months: int) -> float:
    r = annual_irr / 12.0
    if r == 0:
        return principal / months
    factor = (1 + r) ** months
    return principal * r * factor / (factor - 1)


class DecisionStage(Stage):
    name = "decision"

    async def run(self, case: CaseState) -> None:
        d = case.decision
        band = case.ml.risk_band or 5
        pricing = config.PRICING_TABLE[band]

        d.selected = True
        d.contactible = bool(case.intake.consent_captured)

        requested = case.intake.loan_amount_req or 0.0
        d.offer_amount = float(min(requested, pricing["max_principal"]))
        d.offer_tenure = case.intake.tenure_req or 36
        d.offer_irr = pricing["irr"]
        d.offer_emi = round(_emi(d.offer_amount, d.offer_irr, d.offer_tenure), 2)
        d.processing_fee = round(pricing["fee_pct"] * d.offer_amount, 2)

        income = case.ml.income_used
        existing = case.summary.existing_emi_debits or 0.0
        if income and income > 0:
            d.foir_proposed = round((existing + d.offer_emi) / income, 4)
            d.serviceable = d.foir_proposed <= config.FOIR_CAP
        else:
            d.serviceable = False
            case.warnings.append("decision: no income -> not serviceable")
