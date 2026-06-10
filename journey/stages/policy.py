"""S4 Policy — deterministic L1–L6 waterfall (demo semantics, placeholder
thresholds). Hard breaches DECLINE + short-circuit; grey-band breaches route to
MANUAL_REVIEW (the LLM mid-zone hook is stubbed -> ai_assisted_flag)."""

from __future__ import annotations

import config
from state import CaseState, PolicyLayerResult
from stages.base import Stage

PASS, REVIEW, DECLINE = "pass", "review", "decline"


class PolicyStage(Stage):
    name = "policy"

    async def run(self, case: CaseState) -> None:
        s = case.summary
        p = case.policy
        income = case.ml.income_used
        exposure_ratio = (s.total_exposure / income) if (s.total_exposure and income) else None

        # (layer, verdict, reason_code, detail)
        checks = [
            ("L0_ADDRESS",
             REVIEW if case.address.review_flag else PASS,
             "ADDRESS_LOW", f"band={case.address.band} score={case.address.score}"),
            ("L1_NPA", DECLINE if s.npa_flag else PASS, "NPA_ACTIVE", f"npa_flag={s.npa_flag}"),
            ("L2_DPD90_24M",
             DECLINE if (s.max_dpd_overall and s.max_dpd_overall >= config.DPD_DECLINE) else PASS,
             "DPD90_24M", f"max_dpd_overall={s.max_dpd_overall}"),
            ("L3_DPD60_18M",
             REVIEW if (s.max_dpd_overall and s.max_dpd_overall >= config.DPD_REVIEW) else PASS,
             "DPD60_18M", f"max_dpd_overall={s.max_dpd_overall}"),
            ("L4_NEGATIVE_FLAGS",
             REVIEW if s.negative_flags else PASS, "NEGATIVE_FLAGS", f"flags={s.negative_flags}"),
            ("L5_ENQUIRY_SPIKE",
             REVIEW if (s.enq_count and s.enq_count > config.ENQ_SPIKE_THRESHOLD) else PASS,
             "ENQ_SPIKE", f"enq_count={s.enq_count}"),
            ("L6_EXPOSURE",
             DECLINE if (exposure_ratio and exposure_ratio > config.EXPOSURE_TO_INCOME_CAP) else PASS,
             "EXPOSURE_HIGH", f"exposure/income={exposure_ratio}"),
        ]

        review_reasons: list[str] = []
        for layer, verdict, code, detail in checks:
            p.layers.append(PolicyLayerResult(
                layer=layer, passed=(verdict == PASS), reason_code=code, detail=detail))
            if verdict == DECLINE:
                p.result = "DECLINED"
                p.decline_layer = layer
                case.warnings.append(f"policy: DECLINED at {layer} ({code})")
                return
            if verdict == REVIEW:
                review_reasons.append(f"{layer}:{code}")

        # Mid-zone PD hook (deterministic stand-in for the LLM mid-zone).
        pd = case.ml.pd_score
        if pd is not None and pd >= config.PD_DECLINE:
            p.layers.append(PolicyLayerResult(layer="L7_PD", passed=False,
                                              reason_code="PD_HIGH", detail=f"pd={pd}"))
            p.result = "DECLINED"
            p.decline_layer = "L7_PD"
            return
        if pd is not None and config.PD_REVIEW_BAND[0] <= pd <= config.PD_REVIEW_BAND[1]:
            review_reasons.append(f"L7_PD:PD_MIDZONE(pd={pd})")
            p.ai_assisted_flag = True   # LLM mid-zone hook would fire here

        if review_reasons:
            p.result = "MANUAL_REVIEW"
            p.review_reason = "; ".join(review_reasons)
        else:
            p.result = "APPROVED"
            p.approved_segment = case.ml.affluence_segment
