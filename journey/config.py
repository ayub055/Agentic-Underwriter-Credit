"""Single source of truth for journey paths, interpreter, timeouts, and the
placeholder pricing/threshold tables. No business logic — just constants."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent          # Credit_Journey/
JOURNEY_DIR = ROOT / "journey"
OUTPUT_DIR = JOURNEY_DIR / "output"
LOGS_DIR = JOURNEY_DIR / "logs"

BANKING_REPO = ROOT / "Banking_Agent"
BUREAU_REPO = ROOT / "Bureau_Agent"

# Interpreter used for the isolated subprocesses (anaconda3, where both repos' deps live).
PY_INTERPRETER = str(Path(sys.executable))
RUN_BRANCH = str(JOURNEY_DIR / "runners" / "_run_branch.py")

BRANCH_TIMEOUT_S = 240.0          # render entries invoke Ollama; allow headroom
OLLAMA_MODEL_TAG = "ollama-local" # narrative model tag recorded for audit (demo's model_versions_pinned)

# Per-branch render entry (module:function) + the render-free builder used as a
# fail-soft fallback when rendering raises. Pinned at A0 against the real repos.
BRANCHES = {
    "banking": {
        "repo": str(BANKING_REPO),
        "render": "tools.bank_report:generate_bank_report",
        "builder": "pipeline.reports.customer_report_builder:build_customer_report",
    },
    "bureau": {
        "repo": str(BUREAU_REPO),
        "render": "tools.combined_report:generate_combined_report_pdf",
        "builder": "pipeline.reports.bureau_report_builder:build_bureau_report",
    },
}

# ---- Placeholder decision tables (D2/D5 — not real credit policy) ----
INCOME_PRECEDENCE = ("declared", "banking_detected")   # D1: declared canonical, bank fallback

FOIR_CAP = 0.50                    # serviceability ceiling
ENQ_SPIKE_THRESHOLD = 6            # L5 unsecured enquiries (12m) review trigger

# ---- Address-quality model (S1.5) ----
ADDRESS_MODEL_PATH = str(JOURNEY_DIR / "models" / "address_quality" / "address_quality_v1.pt")
ADDRESS_PD_WEIGHT = 0.06           # PD nudge = weight * (0.5 - prob_good); good addr lowers PD
ADDRESS_REVIEW_BAND = "LOW"        # L0 soft manual-review flag (never an independent decline)

DPD_DECLINE = 90                   # L2 hard decline
DPD_REVIEW = 60                    # L3 manual-review band
EXPOSURE_TO_INCOME_CAP = 24.0      # L6: total_exposure / monthly_income ceiling
PD_REVIEW_BAND = (0.15, 0.35)      # mid-zone -> MANUAL_REVIEW
PD_DECLINE = 0.50

# Pricing keyed by ML risk band (1 best .. 5 worst): annual IRR, max principal, fee %.
PRICING_TABLE = {
    1: {"irr": 0.1099, "max_principal": 2000000, "fee_pct": 0.01},
    2: {"irr": 0.1349, "max_principal": 1500000, "fee_pct": 0.015},
    3: {"irr": 0.1599, "max_principal": 1000000, "fee_pct": 0.02},
    4: {"irr": 0.1899, "max_principal": 500000, "fee_pct": 0.025},
    5: {"irr": 0.2299, "max_principal": 200000, "fee_pct": 0.03},
}

AFFLUENCE_SEGMENTS = (             # monthly income -> segment
    (150000, "premium"),
    (75000, "affluent"),
    (35000, "mass_affluent"),
    (0, "mass"),
)
