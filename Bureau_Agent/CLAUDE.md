# Project: Bureau Analyser

Generates a rich **bureau / CIBIL tradeline analysis report** (HTML + PDF + Excel)
for a customer (CRN), used for credit decisioning. Numbers are computed
deterministically; a local LLM (Ollama) is used **only** to narrate pre-computed
results.

> This project was carved out of the larger "Kotak Agentic Reader" (banking +
> bureau + NL agentic pipeline). The banking analyser, the natural-language
> query layer, and all unrelated assets have been removed and live under
> `_archive/`. **Do not resurrect banking/NL code into the runtime.**

## Key Principle
**Determinism > Intelligence** — All numbers are computed deterministically.
The LLM is used ONLY for narration/summary. Never trust LLM-generated numbers.

## Python Environment
- **Use:** `/Users/ayyoob/anaconda3/bin/python` (has pandas, langchain, fpdf2, jinja2)
- Do NOT use `.venv`, `venv`, or conda envs — they lack dependencies.

## Entry Points
- **Single CRN (CLI):** `python run_bureau.py 698167220 [--theme original|emerald] [--no-pdf]`
- **Batch:** `python batch_reports.py --crns 698167220 --output reports/batch_output.xlsx`
  (auto-discovers CRNs from `dpd_data.csv` (default) or `tl_features.csv`)
- **Programmatic:** `from tools.combined_report import generate_combined_report_pdf`

## Report Generation Flow
```
generate_combined_report_pdf(crn)                     # tools/combined_report.py
  → build_bureau_report(crn)                          # deterministic build
      → extract_bureau_features / aggregate / tradeline_features / key_findings
  → generate_bureau_review(...)                        # LLM narrative (fail-soft)
  → render_combined_report(bureau_report)              # combined_report_renderer.py
      → bureau_analyser_{crn}_report.html (+ .pdf)
  → build_excel_row / export_row_to_excel              # reports/excel/{crn}.xlsx
```
There is **no** banking report, no combined executive summary, and no NL/intent
pipeline. `tools/combined_report.py` keeps its historical name but is bureau-only.

## Key Directories
| Directory | Purpose |
|-----------|---------|
| `config/` | `settings.py` (paths/models), `thresholds.py`, `prompts.py` (BUREAU_REVIEW_PROMPT) |
| `schemas/` | `bureau_report.py`, `loan_type.py`, `customer_report.py` (only `ReportMeta` is reused) |
| `features/` | `bureau_features.py`, `tradeline_features.py` (dataclasses) |
| `pipeline/extractors/` | Bureau feature extraction/aggregation from CSV |
| `pipeline/reports/` | `bureau_report_builder.py`, `key_findings.py`, `report_summary_chain.py` (LLM narration) |
| `pipeline/renderers/` | `combined_report_renderer.py` (active output), `bureau_pdf_renderer.py` (standalone + shared helpers), `pdf_renderer.py` (base) |
| `tools/` | `combined_report.py` (entry), `bureau.py`, `scorecard.py`, `excel_exporter.py` |
| `templates/` | `combined_report_original.html` (default), `combined_report.html` (emerald), `bureau_report.html`, `chart.min.js` |
| `reports/` | Generated output (HTML, PDF, Excel) |
| `_archive/` | Removed banking + NL layer + old docs/assets (not on the import path) |

## Data Sources (TSV, project root)
- `dpd_data.csv` — Bureau DPD tradeline data (tab-separated). CRN column: `crn`.
- `tl_features.csv` — Pre-computed tradeline behavioural features (tab-separated).
- Paths/delimiters: `config/settings.py` (`BUREAU_DPD_FILE`, `TL_FEATURES_FILE`).

## LLM Models (Ollama, local only)
- **llama3.2** — bureau review narration (temp=0, seed=42). See `config/settings.py::SUMMARY_MODEL`.
- No cloud API calls. LLM narration is fail-soft (wrapped in try/except).

## Centralised Configuration
- **Thresholds:** `config/thresholds.py` — import as `import config.thresholds as T`
- **Prompts:** `config/prompts.py` — `BUREAU_REVIEW_PROMPT` is the only one still used

## Testing
- No formal test suite. Smoke test:
  - `python run_bureau.py 698167220`
  - or `from tools.combined_report import generate_combined_report_pdf; generate_combined_report_pdf(698167220)`
  - **Test CRN:** `698167220` (present in `dpd_data.csv` / `tl_features.csv`)
- After a change, regenerate and grep the **generated HTML** in `reports/` to confirm.

## Common Patterns
- Module-level caching: `_load_bureau_data()` caches the DPD rows globally
- Fail-soft: all LLM/render calls wrapped in try/except with `logger.warning`
- Scorecard: `compute_scorecard(bureau_report=...)` — pure deterministic, no LLM
- Checklist: `compute_checklist(bureau_report)` → list of bureau items (no LLM)
- Persona: `compute_probable_persona(bureau_report)` — deterministic waterfall on raw loan types

## Gotchas & Debugging Lessons

### 1. The active template is `combined_report_original.html`, NOT `combined_report.html`
The default theme is `"original"` (`tools/combined_report.py`), so the renderer loads
`combined_report_original.html`. Editing `combined_report.html` (the `"emerald"` theme)
won't change the default output. Check `THEME_TEMPLATES` in
`pipeline/renderers/combined_report_renderer.py::render_combined_report_html`.

### 2. Keep both combined template variants in sync
There are two combined templates: `combined_report_original.html` (default) and
`combined_report.html` (emerald). When changing a section, update both. The
standalone `bureau_report.html` (used by `tools/bureau.py`) is separate.
(Note: `.claude/rules/templates.md` still lists 5 variants from the old project —
only these two combined variants exist now.)

### 3. `__pycache__` does NOT cause stale templates
Jinja2 reads templates from disk at render time. If template changes don't appear,
check you edited the active theme file (see #1), not bytecode caching.

### 4. Verify generated output, not just template source
After template changes, regenerate and grep the generated HTML
(`reports/bureau_analyser_{crn}_report.html` and `reports/bureau_analyser_html_version/`).

### 5. The renderer is driven by `bureau_report` only
`render_combined_report`, `render_combined_report_html`, `_build_combined_pdf`, and
`compute_checklist` take `bureau_report` only. `compute_scorecard` still has a
dormant `customer_report=None` kwarg from the old project, but the runtime never
passes it — don't reintroduce a banking path through it.

## How to Add a New Bureau Checklist Item + Narration Signal
1. **Compute the feature** — add it in `pipeline/extractors/` or `features/` so it
   flows through `BureauReport` (feature vectors / `tradeline_features` / `executive_inputs`).
2. **Add checklist item** — in `compute_checklist()`
   (`pipeline/renderers/combined_report_renderer.py`), append
   `{"label": str, "checked": bool, "severity": "high|medium|positive|neutral", "detail": str|None}`.
3. **Flow to LLM** — in `_build_bureau_data_summary()`
   (`pipeline/reports/report_summary_chain.py`), format it as plain text so it
   reaches `BUREAU_REVIEW_PROMPT`.

> See `instructions.md` for the full bureau-only architecture (the detailed
> source of truth, kept current alongside this file).
