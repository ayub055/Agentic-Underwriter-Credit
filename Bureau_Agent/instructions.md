# Project Architecture — Bureau Analyser

This document is the **single source of truth** for the project's architecture.
Use it as context before making any changes.

> **History:** This project was carved out of the larger "Kotak Agentic Reader"
> (banking + bureau + natural-language agentic pipeline). The banking analyser,
> the NL query layer (intent parser / planner / executor / explainer), the
> Streamlit UI, and all unrelated assets were removed and now live under
> `_archive/` (not on the import path). This document describes only the current
> bureau-only system.

---

## 1. Project Overview

A deterministic engine that produces a rich **bureau / CIBIL tradeline analysis
report** (HTML + PDF + Excel) for a customer (CRN), for credit decisioning.

| Vertical | Data Source | ID Column | Output |
|---|---|---|---|
| **Bureau** | `dpd_data.csv`, `tl_features.csv` (tab-separated) | `crn` | `bureau_analyser_{crn}_report.html` (+ `.pdf`) + Excel row |

**Key rule:** Determinism > intelligence. All numbers are computed
deterministically. The local LLM (Ollama) is used **only** to narrate
pre-computed results — never to produce numbers.

---

## 2. Directory Structure

```
Bureau_Agent/
│
├── run_bureau.py                   # CLI: python run_bureau.py <crn>
├── batch_reports.py                # Batch generator + Excel merge
├── dpd_data.csv                    # Bureau tradeline data (tab-separated)
├── tl_features.csv                 # Pre-computed tradeline features (tab-separated)
├── instructions.md                 # THIS FILE
├── CLAUDE.md                       # Quick project guide
│
├── config/
│   ├── settings.py                 # Model names, file paths, LLM temp/seed
│   ├── thresholds.py               # All numeric thresholds (import as T)
│   └── prompts.py                  # LLM prompts (BUREAU_REVIEW_PROMPT is the live one)
│
├── schemas/
│   ├── loan_type.py                # LoanType enum (13), normalization map, SECURED_LOAN_TYPES, ON_US_SECTORS
│   ├── bureau_report.py            # BureauReport dataclass
│   └── customer_report.py          # Retained ONLY for ReportMeta (reused by BureauReport.meta)
│
├── features/
│   ├── bureau_features.py          # BureauLoanFeatureVector dataclass
│   └── tradeline_features.py       # TradelineFeatures dataclass (pre-computed)
│
├── pipeline/
│   ├── extractors/
│   │   ├── bureau_feature_extractor.py    # Raw CSV → per-loan-type vectors; also
│   │   │                                  #   compute_monthly_exposure, extract_tu_score,
│   │   │                                  #   extract_raw_loan_type_profile, _load_bureau_data
│   │   ├── bureau_feature_aggregator.py   # Vectors → BureauExecutiveSummaryInputs
│   │   └── tradeline_feature_extractor.py # tl_features.csv → TradelineFeatures
│   │
│   ├── reports/
│   │   ├── bureau_report_builder.py        # build_bureau_report(crn) — deterministic assembly
│   │   ├── key_findings.py                 # extract_key_findings() — deterministic findings
│   │   └── report_summary_chain.py         # generate_bureau_review() + summarize_exposure_timeline()
│   │
│   └── renderers/
│       ├── combined_report_renderer.py     # ACTIVE output: render_combined_report(),
│       │                                   #   compute_checklist(), compute_scorecard call,
│       │                                   #   compute_probable_persona()
│       ├── bureau_pdf_renderer.py          # Standalone bureau PDF/HTML + shared render helpers
│       └── pdf_renderer.py                 # ReportPDF base class + _sanitize_text
│
├── tools/
│   ├── combined_report.py          # generate_combined_report_pdf(crn) — main entry (bureau-only)
│   ├── bureau.py                   # generate_bureau_report_pdf(crn) — build + narrate + standalone render
│   ├── scorecard.py                # compute_scorecard(bureau_report=...) — deterministic
│   └── excel_exporter.py           # build_excel_row / export_row_to_excel / merge_excel_reports
│
├── utils/
│   ├── helpers.py                  # mask_customer_id, format_inr, format_inr_units, strip_segment_prefix
│   └── llm_utils.py                # extract_reasoning, log_token_usage, etc.
│
├── templates/
│   ├── combined_report_original.html  # DEFAULT theme ("original")
│   ├── combined_report.html           # "emerald" theme
│   ├── bureau_report.html             # Standalone bureau template (tools/bureau.py)
│   └── chart.min.js                   # Bundled Chart.js (inlined into HTML)
│
├── reports/                        # Generated HTML + PDF + reports/excel/*.xlsx
├── logs/                           # Token-usage / reasoning logs
└── _archive/                       # Removed banking + NL layer + old docs/assets
```

---

## 3. Report Generation Flow

There is **no** natural-language pipeline, no intent system, no banking report,
and no combined executive summary. A CRN goes straight to report generation.

```
run_bureau.py <crn>   /   batch_reports.py   /   generate_combined_report_pdf(crn)
    │
    ▼
tools/combined_report.py :: generate_combined_report_pdf(crn, theme="original", save_intermediate=True)
    │
    ├─ 1. BUILD + NARRATE
    │   └─ tools/bureau.py :: generate_bureau_report_pdf(crn)        [when save_intermediate]
    │       ├─ bureau_report_builder.build_bureau_report(crn)         (deterministic)
    │       │     ├─ extractors.extract_bureau_features(crn)          → {LoanType: BureauLoanFeatureVector}
    │       │     ├─ extractors.aggregate_bureau_features(vectors)    → BureauExecutiveSummaryInputs
    │       │     ├─ extractors.extract_tu_score(crn)                 → ei.tu_score
    │       │     ├─ extractors.extract_tradeline_features(crn)       → TradelineFeatures
    │       │     ├─ key_findings.extract_key_findings(ei, vectors, tf)
    │       │     ├─ extractors.compute_monthly_exposure(crn)         → monthly_exposure
    │       │     ├─ extractors.extract_raw_loan_type_profile(crn)    → raw_loan_profile (persona)
    │       │     └─ assemble + validate BureauReport (fail-soft)
    │       └─ report_summary_chain.generate_bureau_review(...)       (LLM narrative, fail-soft)
    │           (and also writes the standalone bureau_{crn}_report.html/pdf)
    │
    ├─ 2. RENDER (bureau-only)
    │   └─ combined_report_renderer.render_combined_report(bureau_report, theme, save_pdf)
    │         ├─ _build_combined_pdf(bureau_report)                   → PDF (optional)
    │         └─ render_combined_report_html(bureau_report, theme)    → HTML
    │               ├─ compute_scorecard(bureau_report=...)           (deterministic)
    │               ├─ compute_checklist(bureau_report)               (bureau items)
    │               ├─ compute_probable_persona(bureau_report)        (deterministic waterfall)
    │               └─ summarize_exposure_timeline(monthly_exposure)  (deterministic, 2 sentences)
    │         → reports/bureau_analyser_{crn}_report.html (+ .pdf)
    │         → also copied to reports/bureau_analyser_html_version/
    │
    └─ 3. EXCEL
        └─ excel_exporter.build_excel_row / export_row_to_excel       → reports/excel/{crn}.xlsx
```

`save_intermediate=False` (used by batch) builds + narrates directly and skips
the standalone bureau PDF/HTML and the report PDF — only the report HTML and
Excel are written.

---

## 4. Loan Type Taxonomy (`schemas/loan_type.py`)

**LoanType enum** — 13 canonical types:
`PL`, `CC`, `HL`, `AL`, `BL`, `LAP`, `LAS`, `LAD`, `GL`, `TWL`, `CD`, `CMVL`, `OTHER`

- **`LOAN_TYPE_NORMALIZATION_MAP`** — maps 54+ raw loan-type strings from
  `dpd_data.csv` to the canonical enum.
- **`SECURED_LOAN_TYPES`** — `Set[str]` of raw loan-type names where `sec_flag=1`.
  Checked at the **raw** level because some canonical types (BL, CC) have both
  secured and unsecured variants.
- **`is_secured(raw_loan_type) -> bool`** — checks the raw string against `SECURED_LOAN_TYPES`.
- **`normalize_loan_type(raw_loan_type) -> LoanType`** — defaults to `OTHER`.
- **`ON_US_SECTORS`** = `{"KOTAK BANK", "KOTAK PRIME"}` — on-us/off-us classification.

### Secured classification flow
```
Raw loan_type string (per tradeline)
    │  is_secured(raw_loan_type)
    ▼
BureauLoanFeatureVector.secured = any(is_secured(tl) for tl in tradelines_in_group)
    │  (True if ANY tradeline in the canonical group is secured)
    ▼
Used by: bureau_feature_aggregator (unsecured exposure) + renderers (display)
```
**Guiding rule:** secured classification is per raw loan type, not per canonical
type.

---

## 5. Key Findings Engine (`pipeline/reports/key_findings.py`)

- Entry: **`extract_key_findings(executive_inputs, vectors, tradeline_features)`**
- Deterministic, threshold-based; **no LLM**. Thresholds come from `config/thresholds.py`.
- Each `KeyFinding` has: `category`, `finding`, `inference`, `severity`.
- Severity levels: `high_risk`, `moderate_risk`, `concern`, `neutral`, `positive`.
- Finding groups: `_portfolio_findings`, `_loan_type_findings`, `_tradeline_findings`,
  `_composite_findings`.
- `findings_to_dicts()` serialises findings for the template.

---

## 6. Scorecard, Checklist & Persona (`tools/scorecard.py`, `combined_report_renderer.py`)

All three are **deterministic, no LLM**, and driven by `bureau_report` only:
- **`compute_scorecard(bureau_report=...)`** — RAG signals + strengths/concerns.
  (It still carries a dormant `customer_report=None` kwarg from the old project;
  the runtime never passes it — do not reintroduce a banking path.)
- **`compute_checklist(bureau_report)`** — returns a list of bureau checklist
  items: `{label, checked, severity, detail}`.
- **`compute_probable_persona(bureau_report)`** — waterfall over raw loan-type
  counts/sanctions to infer the customer's probable profile + stress flags.

---

## 7. Key Files

| File | Role | Key Functions |
|---|---|---|
| `schemas/loan_type.py` | Taxonomy | `LoanType`, `normalize_loan_type()`, `is_secured()` |
| `features/bureau_features.py` | Feature definition | `BureauLoanFeatureVector` |
| `features/tradeline_features.py` | Pre-computed features | `TradelineFeatures` |
| `pipeline/extractors/bureau_feature_extractor.py` | Raw data → features | `extract_bureau_features()`, `compute_monthly_exposure()`, `extract_tu_score()`, `extract_raw_loan_type_profile()`, `_load_bureau_data()` |
| `pipeline/extractors/tradeline_feature_extractor.py` | CSV → features | `extract_tradeline_features()` |
| `pipeline/extractors/bureau_feature_aggregator.py` | Features → summary | `aggregate_bureau_features()`, `BureauExecutiveSummaryInputs` |
| `pipeline/reports/bureau_report_builder.py` | Assembly + validation | `build_bureau_report(crn)` |
| `pipeline/reports/key_findings.py` | Deterministic findings | `extract_key_findings()`, `findings_to_dicts()`, `KeyFinding` |
| `pipeline/reports/report_summary_chain.py` | LLM narration | `generate_bureau_review()`, `summarize_exposure_timeline()` |
| `pipeline/renderers/combined_report_renderer.py` | Active output | `render_combined_report()`, `render_combined_report_html()`, `compute_checklist()`, `compute_probable_persona()` |
| `pipeline/renderers/bureau_pdf_renderer.py` | Standalone PDF + helpers | `render_bureau_report_pdf()`, `_render_key_finding`, `_render_feature_pair`, `_compute_html_chart_data` |
| `pipeline/renderers/pdf_renderer.py` | PDF base | `ReportPDF`, `_sanitize_text` |
| `schemas/bureau_report.py` | Report schema | `BureauReport` (feature_vectors, executive_inputs, tradeline_features, key_findings, monthly_exposure, raw_loan_profile, narrative) |
| `tools/combined_report.py` | Main entry | `generate_combined_report_pdf(crn)` |
| `tools/bureau.py` | Build/narrate/standalone render | `generate_bureau_report_pdf(crn)` |
| `tools/scorecard.py` | Deterministic scorecard | `compute_scorecard(bureau_report=...)` |
| `tools/excel_exporter.py` | Excel | `build_excel_row()`, `export_row_to_excel()`, `merge_excel_reports()` |
| `templates/combined_report_original.html` | Default HTML template | Jinja2: `mask_id`, `inr`, `inr_units`, `segment` filters |

---

## 8. Guiding Principles

1. **No LLM touches raw data** — the LLM sees only pre-computed summary inputs.
2. **All features are deterministic** — if logic could be in the LLM, move it to features.
3. **Features ≠ report sections** — features are computed inputs to the report.
4. **Fail-soft** — LLM narration and PDF/HTML rendering are wrapped in try/except;
   a failed narration or PDF still returns the data and produces the HTML.
5. **Secured classification is per raw loan type**, not per canonical type.
6. **Do not reintroduce banking/NL code** into the runtime — it lives in `_archive/`.

---

## 9. Data Sources

### Bureau tradelines: `dpd_data.csv` (project root, tab-separated)
- Key columns: `crn`, `loan_type_new` (raw loan type), `loan_status`,
  `sanction_amount`, `out_standing_balance`, `over_due_amount`, `creditlimit`,
  `last_payment_date`, `tl_vin_1` (vintage months), `sector`, `dpd_string`,
  `max_dpd`, `months_since_max_dpd`, `dpdf1`–`dpdf36` (36 monthly DPD flags),
  `date_opened`, `date_closed`.
- Loaded by `pipeline/extractors/bureau_feature_extractor.py::_load_bureau_data()` (cached).
- Path/delimiter: `config/settings.py` → `BUREAU_DPD_FILE`, `BUREAU_DPD_DELIMITER`.

### Pre-computed features: `tl_features.csv` (project root, tab-separated)
- Key column: `crn` (same as `dpd_data.csv`).
- ~25 customer-level features in 6 groups: Loan Activity, DPD & Delinquency,
  Payment Behavior, Utilization, Enquiry Behavior, Loan Acquisition Velocity.
- **NULL means "data not available", not zero.**
- Loaded by `pipeline/extractors/tradeline_feature_extractor.py::extract_tradeline_features()` (cached).
- Path/delimiter: `config/settings.py` → `TL_FEATURES_FILE`, `TL_FEATURES_DELIMITER`.

---

## 10. LLM Configuration

- **Model**: Ollama (local) — `SUMMARY_MODEL` in `config/settings.py` (default `llama3.2`).
  No cloud API calls; no data leaves the machine.
- **Chain**: LangChain LCEL (`ChatPromptTemplate | ChatOllama`), `temperature=0`,
  `seed=42`.
- **Prompt**: `BUREAU_REVIEW_PROMPT` (`config/prompts.py`) — the only live prompt;
  formal third-person English narration of the pre-computed bureau summary.
- The exposure-timeline summary (`summarize_exposure_timeline`) is **deterministic**
  (no LLM).

---

## 11. Rendering

- **HTML (primary)**: Jinja2 templates. Default theme is `"original"`
  (`combined_report_original.html`); `"emerald"` (`combined_report.html`) is the
  alternate. `THEME_TEMPLATES` in `render_combined_report_html` maps theme → file.
  Custom filters: `mask_id`, `inr`, `inr_units`, `segment`. `chart.min.js` is
  inlined for portfolio charts.
- **PDF (secondary)**: `fpdf2`. `CombinedReportPDF` (and `BureauReportPDF`) extend
  `ReportPDF` from `pdf_renderer.py`. `_sanitize_text()` maps Unicode (₹, —, …) to
  Latin-1-safe equivalents.

---

## 12. How to Extend

### Add a new deterministic feature / checklist item / finding
1. **Compute it** in `pipeline/extractors/` or `features/` so it flows through
   `BureauReport` (a feature vector, `tradeline_features`, or `executive_inputs`).
2. **Surface it** — add a `KeyFinding` in `key_findings.py`, and/or a checklist
   item in `compute_checklist()` (`combined_report_renderer.py`):
   `{"label": str, "checked": bool, "severity": "high|medium|positive|neutral", "detail": str|None}`.
3. **Narrate it** — format it as plain text in `_build_bureau_data_summary()`
   (`report_summary_chain.py`) so it reaches `BUREAU_REVIEW_PROMPT`.
4. **Display it** — add the markup to BOTH combined templates
   (`combined_report_original.html` and `combined_report.html`); business logic
   stays in Python, templates only render pre-computed data.

### Testing
- Smoke test: `python run_bureau.py 698167220` (test CRN present in both CSVs),
  then grep the generated `reports/bureau_analyser_698167220_report.html`.
- No formal test suite. Python interpreter: `/Users/ayyoob/anaconda3/bin/python`.
