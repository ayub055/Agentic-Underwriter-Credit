# Plan — Kotak Bank Analyser Presentation

> **Hand-off document for the next Claude agent.**
> This plan captures the full conversation, decisions, and current state of a `.pptx` presentation built for the Kotak Agentic Reader project. The next agent will work on a related project that contains only the **Bank_Analyser** component — adapt context accordingly where the scope differs.

---

## 1. Project Background  *(REVISED for Bank_Analyser, 2026-05-25)*

**Bank_Analyser** is an agentic banking-intelligence platform. It turns raw Kotak transaction CSVs (`rgs.csv`) into analyst-grade **HTML / PDF / Excel** reports, and answers natural-language banking questions via a 5-phase agentic loop. Core analytics are deterministic Python; LLMs (local Ollama) handle only intent parsing and prose narration — never numbers, never business logic.

### What the system actually does (verified — see §12)
- **Banking customer report** (`pipeline/reports/customer_report_builder.py`): salary, EMI, bills, rent, savings, risk indicators, anomalies, account quality, detected events. 12 deterministic sections, no LLM-injected numbers.
- **Natural-language Q&A** (`pipeline/core/orchestrator.py`): 5-stage loop `IntentParser (mistral) → QueryPlanner (deterministic) → ToolExecutor → TransactionInsightExtractor (llama3.2) → ResponseExplainer (llama3.2)`, with `AuditLogger` writing JSONL traces.
- **24 intents** wired to **~25 deterministic tool functions** (`tools/analytics.py`, `tools/event_detector.py`, `tools/scorecard.py`, etc.) via `config/intents.py::INTENT_TOOL_MAP`.
- **Categorisation is internal** (`config/categories.yaml` — 46 categories with keywords/aliases/direction; resolved by `tools/category_registry.py` + `tools/category_resolver.py`). No external tagger dependency in this repo.
- **Event detection** (`tools/event_detector.py`): 13 keyword-rule events (PF withdrawal, FD closure, ECS bounce, salary advance, SIP, insurance, govt benefit…) + multi-step custom detectors.
- **Scorecard** (`tools/scorecard.py`): deterministic LOW/CAUTION/HIGH verdict + RAG signals + ≤3 strengths/concerns, driven by **38 constants in `config/thresholds.py`**.
- **Excel workbook** (`tools/excel_exporter.py`): 20-column row per CRN, batch-mergeable.
- **Two report themes**: `bank` (FPDF) and `bank_v2` (Chart.js-powered HTML).
- **Bureau scaffolding present but inert**: `schemas/bureau_report.py`, `pipeline/renderers/bureau_pdf_renderer.py`, `pipeline/renderers/combined_report_renderer.py` exist as backward-compat stubs; `dpd_data.csv` / `tl_features.csv` are declared in `settings.py` but not present in `data/`. Combined report renders banking-only (bureau=None).

### Architecture in one breath
5-stage agentic pipeline + deterministic tool layer + multi-format renderers. All LLM calls hit local Ollama (`mistral` for parsing, `llama3.2` for narration); `LLM_TEMPERATURE=0.0`, `LLM_SEED=42` for reproducibility. No PII egress.

### What this project is *not*
- Not an FPD/DPD hindsighting tool (that was the parent Kotak Agentic Reader). Bank_Analyser has **no active bureau feature extractor and no key-findings engine** — `pipeline/reports/key_findings.py` is a 24-line dataclass stub.
- Not dependent on an external Transaction Tagger model — categorisation is config-driven.
- `batch_reports.py` is referenced in `CLAUDE.md` but **does not exist** in the working tree (verified). Batch flows happen via `tools/excel_exporter.merge_excel_reports`.

---

## 2. Presentation Goal & Audience

Build a `.pptx` for a **mixed audience: technical reviewers + C-suite**.
Split: **70% technically rigorous, 30% C-suite framing.**
Slot length: **20–30 minutes** → final size landed at **13 slides**.

### Tone rules (user-stated)
- Professional, no unnecessary text.
- Technical slides must be technically deep with **clear motivation** (a "why this choice" angle).
- Each technical slide should carry an **architecture image** (generic on the main slide, zoomed variants on deep-dives).
- Architecture diagrams must share a visual language across slides.
- Stay **directional** on quantified impact (no hard TAT numbers available yet).
- Frame as **shipped** (HTML/Excel done) — but make ReAct the aspirational story.

---

## 3. Style Constraints

**Primary visual reference (use this):**
`Kotak_Agentic_Reader_Presentation.pptx` — sits at the root of `/Users/ayyoob/Desktop/Projects/langchain_agentic_v7_hs/`. This is the deck produced by the conversation that generated this plan; it already embodies every styling decision documented below, plus the slide-2 60/40 split, the gold-highlighted Transaction Tagger tool, the slide-7 "Why Agentic?" framing, and the cover-card layout. **Open this file first and mirror it slide-for-slide where the scope overlaps.**

**Upstream style anchor (for fallback / cross-check):**
`Transaction_Tagger_Presentation.pptx` (Kotak AI-team standard) — same folder. Use this only to verify chrome details (slide-number position, footer-bar height, divider weight) if `Kotak_Agentic_Reader_Presentation.pptx` is ambiguous.

Do not deviate from these styles.

### Extracted palette
| Token | Hex | Use |
|---|---|---|
| NAVY   | `#1B3A6B` | Primary text / borders / panels |
| BLUE   | `#275BAD` | Secondary accent |
| GOLD   | `#B8860B` | Highlight accent (Transaction Tagger, agentic emphasis) |
| TINT   | `#E8EDF7` | Pale panel fill |
| BORDER | `#CCD3DD` | Dividers, card borders |
| TEXT   | `#556578` | Body copy |
| SUBTLE | `#99A8BB` | Captions, footer text |

### Layout standard for every content slide
- Thin navy strip on left edge (full height) + thin navy strip on top edge (full width).
- Slide number top-right (`NN / 13`, 10 pt, TEXT colour, right-aligned).
- Title: 24 pt **bold NAVY**, left-aligned.
- Hairline BORDER divider under the title.
- Subtitle: 12 pt TEXT under the divider.
- Footer bar: full-width TINT band with a 1 px BORDER top edge, 8 pt TEXT inside.
- Slide dimensions: **16:9 widescreen**, exact EMU: `12188952 × 6858000` (13.33″ × 7.5″).
- Font: **Calibri** throughout.

### Cover slide pattern (slide 1)
- Left dark NAVY panel covering ~35% width.
- Giant 2-letter mark inside (the Transaction Tagger uses `AI`; this deck uses `RG` — adapt for Bank_Analyser, e.g. `BA`).
- Right side: kicker → main title → gold divider → subtitle → 4 stat cards → byline.

---

## 4. Final Slide Structure  *(REVISED — 13 slides for Bank_Analyser, mirrors parent count)*

User sign-off 2026-05-25: keep 13 slides · keep Transaction Tagger slide · drop bureau entirely · keep screenshot placeholders · re-use parent's impact/roadmap/ask structure with banking framing.



Mirror the reference deck's chrome, palette, panel proportions, and typography slide-by-slide. Reused layouts are noted in **[ref §N]**.

| # | Slide | Layout & content |
|---|---|---|
| 1 | **Title / cover** [ref §1] | NAVY left panel (~35% width) with giant `BA` monogram. Right side: kicker `CONFIDENTIAL · BANKING INTELLIGENCE BRIEFING` → title `Bank Analyser \| Agentic Customer Intelligence` → gold divider → subtitle (one line on what it does) → 4 stat cards → byline. Stat cards (re-derived from §12): **24** intents · **46** categories · **13** event types · **100%** local LLM (zero PII egress). |
| 2 | **Problem & what we shipped** [ref §2 — 60/40 split] | Left 60% stacked rows: top *"What analysts do today"* (manual data pull from rgs.csv, per-customer aggregation, judgment) · bottom *"What Bank_Analyser ships"* (5 bullets: agentic Q&A across 24 intents · deterministic customer report (12 sections) · Excel workbook (20 cols) · two PDF themes · audit-logged tool calls). Right 40% full-height panel: *"Three pillars of the report"* — Cashflow & Income · Obligations & Events · Risk Scorecard. |
| 3 | **System architecture** [ref §3 — full-width arch PNG] | New `arch_generic.png`: CSV source (rgs.csv) → 5-stage agentic loop (IntentParser · Planner · Executor · InsightExtractor · Explainer) → deterministic tool layer (analytics · event_detector · scorecard · category_resolver · account_quality · excel_exporter) → config layer (categories.yaml · thresholds.py · intents.py) → outputs (HTML · PDF · XLSX). Footer: `mistral (intent) · llama3.2 (narration) · pandas · fpdf2 · Jinja2 · ~25 tool functions`. |
| 4 | **Determinism > Intelligence** [ref §4 — 9.1M arch + MOTIVATION panel] | New `arch_determinism.png`: rgs.csv → deterministic engine (gold) AND LLM layer (blue) running in parallel; LLM emits *plan + prose*, engine emits *numbers*; engine results feed back to LLM for narration. Right panel: 5 bullets — *Auditable line-by-line · Same input → same output · LLM never sees raw rows · Narration fails soft, numbers always render · Findings = threshold + comparator (`config/thresholds.py`, 38 constants)*. Footer: `LLM_TEMPERATURE=0.0 · LLM_SEED=42`. |
| 5 | **Customer Report — 12 deterministic sections + Event Detector + Scorecard** *(replaces parent's bureau slide)* | Full-width new `arch_report.png`: rgs.csv → `customer_report_builder` → 12 blocks (Salary · EMI · Bills · Rent · Savings · Risk Indicators · Account Quality · Anomalies · Events · Categories · Scorecard · Persona) → `pdf_renderer` → HTML+PDF. Two side-callouts on the diagram highlight `event_detector.py` (13 keyword rules + custom multi-step) and `scorecard.py` (LOW/CAUTION/HIGH + RAG, driven by 38 thresholds). Footer: `Two themes: bank (FPDF) · bank_v2 (Chart.js)  ·  Zero LLM in numbers`. |
| 6 | **Upstream Dependency — Transaction Tagger** [ref §6 — keep as in parent] | Big NAVY/GOLD card with mini-stats (43 categories · 35K records · 10M txns/mo · <15 ms). **Hyperlinked** to `Transaction_Tagger_Presentation.pptx` (relative). Caption: *Upstream model whose `category_of_txn` output feeds Bank_Analyser via `config/categories.yaml` resolution + `category_registry.py`*. (Internal repo defines its own 46-category schema; the upstream model produces the raw labels.) |
| 7 | **Why this pipeline needs an agent** [ref §7 — 9.1M arch + WHY AGENTIC panel] | New `arch_orchestration.png`: agent picks intent → resolves tools from `INTENT_TOOL_MAP` → executes ≤5 tools → optionally fans out to insight extractor → narrator. Right panel (5 bullets): *Pick the right tools per query · Skip irrelevant sections · Cache insights per customer · Fail-soft on LLM errors · Stream narration*. Scaling tagline: *"More intents. More tools. More signals per case. The agent scales linearly — a hand-written switch does not."* |
| 8 | **Agentic Foundation — Toward a ReAct Agent** [ref §8 — full-width arch] | New `arch_agentic.png`: TODAY (top) — linear flow `Query → Parser(LLM) → Planner(deterministic, INTENT_TOOL_MAP) → Executor → Insights(LLM) → Explainer(LLM) → AuditLogger`. TOMORROW (bottom) — full ReAct loop: reasoner → action → tool → observation → reflect → re-plan. Footer: *Already built: parser · planner · tool registry · audit log · cached insights · Gap: dynamic tool selection + observation-driven re-planning*. |
| 9 | **Sample Output — HTML/PDF Customer Report** [ref §9] | Placeholder card `[ Insert annotated bank_v2 HTML screenshot ]`. Sample CRN: **698167220** (confirmed by generated reports in `reports/`). Caption notes yellow highlights to be added. |
| 10 | **Sample Output — Excel workbook + Scorecard** [ref §10] | Two side-by-side placeholder cards: left = Excel row (20 columns, batch-mergeable) · right = Scorecard view (verdict + RAG chips + strengths/concerns). |
| 11 | **Impact — Directional** [ref §11] | 4 stacked rows (TINT panel + NAVY accent stripe + kicker + headline + body): THROUGHPUT (analyst-minutes per case collapses to seconds) · CONSISTENCY (same 38 thresholds, same verdict) · AUDITABILITY (JSONL trace + numbers traceable to `config/thresholds.py`) · SCALABILITY (interactive ↔ merge_excel_reports batch). |
| 12 | **Roadmap** [ref §12] | 4 numbered phases: (1) NOW — agentic Q&A + customer report (HTML/PDF/XLSX) shipped, (2) ReAct loop — replace `INTENT_TOOL_MAP` with LLM-driven tool selection + observation-driven re-plan, (3) Bureau integration — wire dpd_data / tl_features when the data is delivered, (4) Active learning — analyst overrides feed threshold tuning + category map refinement. |
| 13 | **Risks, Guardrails & Ask** [ref §13] | 2-column TINT panels. Left = guardrails (local Ollama · fail-soft tools · `LLM_TEMPERATURE=0.0` · audit log · single-source thresholds). Right = risks & ask (single-user today → concurrency hardening · manual cache invalidation → TTL · pilot ask: shadow-mode against analyst reviews on N CRNs · infra ask: Ollama capacity for batch · decision ask: green-light ReAct phase). |

**Dropped from parent deck**:
- Slide 5 content (Bureau Feature Extraction) — slot reused for "Customer Report — 12 sections".
- All bureau references on slide 3 architecture diagram and slide 12 roadmap (bureau moved to roadmap Phase 3 only).

---

## 5. Architecture Diagrams (PNG assets)  *(REVISED — regenerated from scratch)*

All regenerated with matplotlib using the reference deck's NAVY/BLUE/GOLD palette and box-style language. Output dir: `/tmp/ba_assets/`. **None of the parent deck's PNGs are reused** — they reference bureau data and a Transaction Tagger tool that don't exist here.

| File | Slide | Visual story |
|---|---|---|
| `arch_generic.png`      | 3 | `rgs.csv` → 5-stage agentic loop → deterministic tool layer (analytics · event_detector · scorecard · category_resolver · account_quality · excel_exporter) → config (categories.yaml · thresholds.py · intents.py) → HTML / PDF / XLSX |
| `arch_determinism.png`  | 4 | `rgs.csv` flows to deterministic engine (gold) AND LLM layer (blue); LLM emits plan + prose, engine emits numbers; engine results feed back to narrator |
| `arch_report.png`       | 5 | `rgs.csv` → `customer_report_builder` → 12 blocks (Salary · EMI · Bills · Rent · Savings · Risk · Account Quality · Anomalies · Events · Categories · Scorecard · Persona) → renderers → HTML+PDF |
| `arch_orchestration.png`| 7 | Intent → INTENT_TOOL_MAP → up-to-5 tools → optional insight extractor → narrator (with cache hit/miss branch) |
| `arch_agentic.png`      | 8 | TODAY (linear deterministic routing) vs TOMORROW (ReAct loop with reflection / re-plan) |

Palette tokens (carry over from §3): NAVY `#1B3A6B`, BLUE `#275BAD`, GOLD `#B8860B`, TINT `#E8EDF7`, BORDER `#CCD3DD`, TEXT `#556578`.

---

## 6. Build Toolchain & Conventions

- **Python**: `/Users/ayyoob/anaconda3/bin/python` (has `python-pptx`, `matplotlib`, `pandas`, `langchain`). Do **not** use `.venv`.
- **Build script lives at** `/tmp/build_deck.py` (single self-contained file). Rebuild with `python /tmp/build_deck.py`.
- **Output**: `Kotak_Agentic_Reader_Presentation.pptx` saved at project root.
- All sizes in EMU (`from pptx.util import Emu`).
- Helper functions in the build script: `add_rect`, `add_text`, `add_chrome` (renders the standard top/left strip + title + divider + subtitle + footer bar — call once per content slide).

### Slide-1 stat-card recipe (reusable pattern)
- TINT-filled rounded rect with BORDER outline, height 749808 EMU, width 1645920 EMU.
- 45720 EMU NAVY left edge strip.
- Stat number: 20 pt NAVY bold.
- Stat label: 8 pt TEXT below the number.

---

## 7. Slide-Wise Changes Already Made (history)

History from the parent Kotak Agentic Reader conversation (still useful for layout decisions on shared slides 1, 2, 4, 7, 11):

| Slide | Final state (parent deck) |
|---|---|
| 2 | Originally 3 columns. Changed to **60/40 split** with stacked rows on the left and a full-height right panel. |
| 4 | Diagram enlarged to 9.1M EMU. Right panel reduced to **5 concise noun-phrase bullets**. |
| 7 | Title reframed from descriptive to argumentative. Diagram enlarged to 9.1M EMU. Right "WHY AGENTIC?" panel reduced to 5 short bullets + scaling tagline. |
| 11 | Originally 4 cards in a row. Changed to **4 stacked rows** (same panel design as the roadmap slide). |

### Bank_Analyser revisions (2026-05-25)

- **Dropped slide 5** (Bureau Feature Extraction) — `pipeline/reports/key_findings.py` is a 24-line stub; no active bureau engine in this repo.
- **Dropped slide 6** (Transaction Tagger external dependency) — categorisation is internal via `config/categories.yaml` (46 categories) + `tools/category_registry.py`. No external tagger to hyperlink.
- **Repurposed slide 5 slot** → "Customer Report — 12 deterministic sections" (banking-specific).
- **New slide 6** → "Event Detector & Scorecard" deep-dive (the two pure-Python modules that carry the heavy lifting in this project).
- **Merged slides 11 + 12 + 13 → slide 11** ("Impact, Roadmap & Ask") to land at 11 total. Held open as Q5 in §11d below for user sign-off.
- **Cover monogram** `RG` → `BA`.
- **Stat cards re-derived from §12**: 24 intents · 46 categories · 13 event types · 100% local LLM.
- **Slide-2 right panel**: "Three failure modes" replaced with "Three pillars of the report" — Cashflow & Income · Obligations & Events · Risk Scorecard (the original FPD/DPD framing belongs to the parent project, not Bank_Analyser).
- **Slide-3 architecture**: replaced 6-tool gold-highlight Transaction Tagger row with the actual ~25-function tool layer.
- **Footer copy refreshed** to cite real constants (`mistral · llama3.2 · LLM_SEED=42 · 38 thresholds`).

---

## 8. Pending / Open Items

1. **Slides 9 & 10 screenshots** — user will supply annotated HTML/Excel screenshots with **yellow highlights** marking analyst review points. Placeholders are in place.
2. **Slide 13 "Ask"** — current copy is generic ("pilot ask · infra ask · decision ask"). User may want to tailor to their actual ask before sending the deck up.
3. **Hyperlink path on slide 6** — currently a relative path (`Transaction_Tagger_Presentation.pptx`). Both `.pptx` files must sit in the same folder when opened.
4. **Hard TAT numbers** — directional today. If real numbers come in, slide 11 should be updated.

---

## 9. Bank_Analyser — Verified Scope & Decisions  *(REVISED)*

### Verified scope (against §12 ledger)
- **Banking-only in practice.** `dpd_data.csv` and `tl_features.csv` are declared in `config/settings.py` but absent from `data/`. Bureau schemas/renderers are backward-compat stubs.
- **Agentic skeleton fully present**: `pipeline/core/{intent_parser,planner,executor,explainer,orchestrator,audit}.py`. Planner is **deterministic** (`INTENT_TOOL_MAP`), parser + explainer are LLM-driven (`mistral`, `llama3.2`).
- **Outputs**: HTML, PDF, and Excel — confirmed (`pipeline/renderers/`, `tools/excel_exporter.py`).
- **No external Transaction Tagger** — categorisation is local via `config/categories.yaml` + `tools/category_registry.py`.
- **Sample CRN with shipped reports**: `698167220` (PDF + HTML present in `reports/`).

### Slide-count decision
**Target = 11 slides.** (Reference deck is 13; we drop 2 inapplicable slides, repurpose 1, and merge impact + roadmap + ask into a single 11th — see Q5.)

### Verification checklist before handing the deck back to the user
- [ ] Chrome (NAVY strips, footer bar, slide-number `NN / 11`, hairline divider) matches reference deck pixel-for-pixel.
- [ ] All 5 architecture PNGs use NAVY/BLUE/GOLD palette and reference-deck box style.
- [ ] No slide has dense paragraphs — concise noun-phrase bullets on deep-dives.
- [ ] Every technical slide carries an architecture image + motivation panel.
- [ ] Cover monogram = `BA`; stat cards re-derived (§12).
- [ ] Every concrete claim on every slide cites a file/function from §12.
- [ ] Sample-output slides (9, 10) carry placeholders + ask user for screenshots.
- [ ] Build script is self-contained and rebuildable with one command.

---

## 10. Key Conversational Decisions (for context)

These were debated and resolved during the conversation. Do not re-open unless the user reopens.

- **Output format**: `.pptx` (not Marp / markdown).
- **Audience split**: technical slides must be rigorous; C-suite slides can stay directional.
- **Sample CRN**: `698167220` (already has reports generated in `reports/` of the source project).
- **Honesty framing for ReAct**: lead with ReAct ambition; be explicit that today's intent-parser + planner + tool-registry are the *skeleton*, and the gap is dynamic LLM-driven tool selection.
- **Determinism is the project's spine** — every slide must respect "LLM never invents numbers".
- **Local Ollama only** — no cloud LLM mentions anywhere.
- **One slide per concept**, never split a single argument across two slides.

---

## 11. **Mandatory First Step for the Next Agent — Discover, Then Revise**

Do **not** start building slides from this plan as-is. This plan was written for a different project (Kotak Agentic Reader). Before any slide work, perform codebase discovery on the Bank_Analyser project and revise both this document and the slide content to match what actually exists.

### 11a. Discovery checklist (do this first)

**Before touching the codebase, open `Kotak_Agentic_Reader_Presentation.pptx` and walk through all 13 slides.** It is the canonical reference for chrome, palette, layout patterns, diagram style, and tone. Treat it as your slide-template library — copy the shapes you need into the new deck rather than re-deriving them from scratch. Also inspect it programmatically (`python-pptx`) to extract exact EMU coordinates, colors, and font sizes if the build script is not directly reusable.

Then ground every claim before it ends up on a slide:

1. **Map the directory** — `ls`, then read `README.md`, `CLAUDE.md`, `instructions.md`, or equivalent. Identify entry points (CLI, web UI, batch script).
2. **Identify data sources** — what CSVs / databases does Bank_Analyser actually read? Columns? Cardinality? Any bureau data, or banking-only?
3. **List the tools / features** — grep for tool registrations, feature extractors, analytics functions. Build a real inventory; do not assume the 20+ tools from the parent project exist here.
4. **Find the LLM layer** — is there one? Ollama? Cloud? What models? What prompts? Any agentic skeleton (intent parser, planner, executor)?
5. **Find the output layer** — HTML? Excel? PDF? Templates? Renderers? Themes?
6. **Find existing reports / sample CRNs** — what's a known-good customer ID for screenshots?
7. **Find the visual / branding assets** — logo, existing PPTX in the repo (use as style anchor if newer than `Transaction_Tagger_Presentation.pptx`).
8. **Verify the "three failure modes" framing** still applies. If Bank_Analyser has a narrower scope (e.g., only categorization, only income estimation), revise the problem statement.

### 11b. Update this plan after discovery

Edit this `plan.md` in place before touching the deck:

- Rewrite §1 (Project Background) with what Bank_Analyser actually does — not what the parent project does.
- Rewrite §4 (Slide Structure) to reflect the real scope. Drop slides that don't apply; add slides for capabilities unique to Bank_Analyser.
- Update §5 (Diagrams) — list which diagrams need to be regenerated vs reused. Specify exactly what each new diagram should show, based on the real architecture.
- Update §7 (Change History) — strike-through entries that no longer apply; add a "Bank_Analyser revisions" subsection for new decisions.
- Update §9 (Adaptation instructions) — replace assumptions with verified facts.
- Add a §12 below this section titled "**Bank_Analyser Codebase Facts**" — a short evidence ledger of what the discovery turned up (file paths, line numbers, function names). Slide claims must cite this ledger.

### 11c. Update slide content (after the plan is current)

For every slide:

- **Start from `Kotak_Agentic_Reader_Presentation.pptx` as the template**, not from a blank deck. Fork its build script (`/tmp/build_deck.py` in the parent project, or rebuild from the deck via `python-pptx` introspection) and edit slide-by-slide. The chrome helpers (`add_chrome`, `add_rect`, `add_text`, `panel`, stat-card pattern) are already correct — keep them.
- **Verify every concrete claim against the codebase.** If the slide says "20+ tools", grep for tool registrations and put the actual count. If it says "5 themes", check the templates directory.
- **Regenerate architecture diagrams** to reflect the real architecture. Do not reuse `arch_*.png` files from the parent project blindly — they will mislead. Keep the same matplotlib palette and box-style language seen in the reference deck so the new diagrams look like siblings, not strangers.
- **Replace the cover mark** (`RG`) with the appropriate 2-letter mark for Bank_Analyser (e.g., `BA`).
- **Update sample CRN** on output-walkthrough slides to a customer ID that actually exists in Bank_Analyser's data.
- **Re-derive the stat-card numbers** on the cover slide from the real project (cases/day, failure modes covered, output formats, etc.) — but keep the 4-card slot layout, EMU dimensions, and NAVY-stripe accent identical to the reference deck.
- **Re-verify the Transaction Tagger dependency** — does Bank_Analyser actually depend on it? If not, drop slide 6. If yes, keep the hyperlink slide but verify the path.
- **Side-by-side check before saving:** open the new deck next to `Kotak_Agentic_Reader_Presentation.pptx` and confirm chrome, palette, type sizes, and panel proportions match. Any visual drift = bug.

### 11d. Confirm with the user before generating the .pptx

Before running the build script:

- Present the **revised plan** (or a diff against this document) to the user for sign-off.
- Surface every assumption the discovery could not resolve as an explicit question.
- Only after the user confirms the plan should you call `python-pptx` to produce the deck.

### 11e. Do not skip discovery to "save time"

A plausible-looking deck built from stale assumptions is worse than no deck — it goes in front of C-suite and gets caught. Discovery is the cheapest part of this work; getting it wrong is the most expensive.

---

*End of plan. The next agent should read this end-to-end, perform §11 discovery, update §1, §4, §5, §7, §9, and add §12, then confirm with the user before building the deck.*

---

## 12. Bank_Analyser Codebase Facts  *(evidence ledger — added 2026-05-25)*

Every quantitative claim on a slide must trace to a row in this ledger.

### 12.1 Entry points
- `main.py` — CLI: `--customer <id>`, free-text query, `--chat`, `--serve`, `--theme {bank,bank_v2}`. ~85 LOC.
- `batch_reports.py` — **NOT present in repo** despite CLAUDE.md mention. Batch consolidation happens via `tools/excel_exporter.merge_excel_reports`.

### 12.2 Agentic core (`pipeline/core/`)
| File | Role | LLM |
|---|---|---|
| `intent_parser.py` | JSON parse → `ParsedIntent`. Uses `PARSER_PROMPT`. | `mistral` |
| `planner.py` | Validates intent, resolves `REQUIRED_FIELDS`, maps via `INTENT_TOOL_MAP`. | — (deterministic) |
| `executor.py` | Dispatches to `tool_map` (16 analytics + report-gen functions). `ToolResult{success,data,error}`. | — |
| `explainer.py` | Prose synthesis from tool results. Streams output. | `llama3.2` |
| `orchestrator.py` (`TransactionPipeline`) | Chains all 4 + calls `TransactionInsightExtractor` for LENDER_PROFILE / CUSTOMER_REPORT / FINANCIAL_OVERVIEW. | hybrid |
| `audit.py` (`AuditLogger`) | JSONL trace per day. | — |

### 12.3 Tools (`tools/`, ~25 functions)
| Module | Functions of note |
|---|---|
| `analytics.py` (598 LOC) | `debit_total`, `get_total_income`, `get_spending_by_category`, `top_spending_categories`, `spending_in_date_range`, `list_customers`, `list_categories`, `get_credit_statistics`, `get_debit_statistics`, `get_transaction_counts`, `get_balance_trend`, `detect_anomalies`, `get_income_stability`, `get_cash_flow`, `generate_customer_report`, `generate_lender_profile` — **16 fns** |
| `bank_report.py` | `generate_bank_report(customer_id, theme)` orchestrator |
| `event_detector.py` | 13 keyword-rule events + custom multi-step detectors (post-salary routing, ECS bounce, loan redistribution, etc.) |
| `excel_exporter.py` | 20-column row, `build_excel_row`, `export_row_to_excel`, `merge_excel_reports` |
| `scorecard.py` | Deterministic LOW/CAUTION/HIGH + RAG + ≤3 strengths/concerns |
| `category_registry.py` | L1/L2 normalisation |
| `category_resolver.py` | `category_presence_lookup` |
| `account_quality.py` | Account quality score |
| `transaction_fetcher.py` | Raw row fetch + date filter |
| `category_override.py` | Manual corrections |

### 12.4 Data sources (`data/loader.py`, `config/settings.py`)
- **Present**: `rgs.csv` (banking transactions, tab-separated, sample CRN 698167220 → 61 txns).
- **Declared but absent**: `dpd_data.csv`, `tl_features.csv`, `rg_sal_strings.csv`, `rg_income_strings.csv`.

### 12.5 Schemas (`schemas/`)
9 files. Top models: `CustomerReport` (+ SalaryBlock, EMIBlock, BillBlock, RentBlock, SavingsBlock, RiskIndicatorsBlock), `BureauReport` (stub), `ParsedIntent` + `IntentType` (24 enum values), `ToolResult`, `PipelineResponse`, `TransactionInsights`, `TransactionPattern`, `LoanType` (13 canonical) + `LOAN_TYPE_NORMALIZATION_MAP` (105+ raw → canonical).

### 12.6 Config
| File | Counts / values |
|---|---|
| `settings.py` | `PARSER_MODEL="mistral"`, `EXPLAINER_MODEL="llama3.2"`, `SUMMARY_MODEL="llama3.2"`, `LLM_TEMPERATURE=0.0`, `LLM_TEMPERATURE_CREATIVE=0.1`, `LLM_SEED=42`, `STREAM_DELAY=0.025` |
| `thresholds.py` | **38 constants** spanning DPD, CC utilisation, portfolio, PL activity, payment, enquiries, trade-to-enquiry, IPT, composite signals, merchant concentration, persona brackets |
| `intents.py` | `INTENT_TOOL_MAP` over **24 intents**; `REQUIRED_FIELDS` per intent; `MAX_TOOLS_PER_QUERY=5` |
| `prompts.py` (365 LOC) | `PARSER_PROMPT`, `TRANSACTION_INSIGHT_PROMPT`, `EXPLAINER_PROMPT`, `CUSTOMER_REVIEW_PROMPT`, `CUSTOMER_PERSONA_PROMPT`, `BUREAU_REVIEW_PROMPT` (stub-only), `COMBINED_EXECUTIVE_PROMPT` (stub-only) |
| `categories.yaml` (947 LOC) | **46 categories** with display name, direction (C/D/null), keywords, aliases, min_count, fallback fuzzy threshold 70% |
| `keywords.py` | **13 `EVENT_KEYWORD_RULES`**; salary/self-transfer/lender/EMI/ATM/mandate/bounce keyword sets; `SMALL_TICKET_CATEGORIES` |

### 12.7 Reports (`pipeline/reports/`)
- `customer_report_builder.py` — `build_customer_report(customer_id, months=6)` → `CustomerReport`. 12 sections, **no LLM**.
- `report_orchestrator.py` — `generate_customer_report_pdf` (cached by customer_id + period).
- `report_planner.py` — optional LLM-driven section selection.
- `report_summary_chain.py` — `generate_customer_review`, `generate_customer_persona`.
- `key_findings.py` — **24-line stub** (`KeyFinding` dataclass + `findings_to_dicts` helper). No active rules.

### 12.8 Renderers + templates
- Renderers: `pdf_renderer.py`, `bureau_pdf_renderer.py` (stub), `combined_report_renderer.py`, `bank_v2_view_model.py`, `serve_report.py`.
- Templates: `bank_report.html` (1213 LOC), `bank_report_v2.html` (1675 LOC with Chart.js), `customer_report.html` (702 LOC legacy), `chart.min.js`.
- **Themes: 2** (`bank`, `bank_v2`).

### 12.9 Insights (`pipeline/insights/`)
- `transaction_flow.py` — `TransactionInsightExtractor`. LLM-driven pattern detection over an allow-list: subscription-heavy · salary-consistent · rent-recurring · discretionary-heavy · cash-heavy · utility-regular · emi-committed.
- `insight_store.py` — in-memory cache keyed by `(customer_id, scope)`.

### 12.10 Sample CRN
**`698167220`** — has both `customer_698167220_report.pdf` and `customer_698167220_report_v2.pdf` in `reports/`.

### 12.11 Summary counts (for stat cards / footers)
| Dimension | Count | Source |
|---|---|---|
| Intents | 24 | `config/intents.py::INTENT_TOOL_MAP` |
| Categories | 46 | `config/categories.yaml` |
| Tool functions | ~25 | `tools/*` |
| Threshold constants | 38 | `config/thresholds.py` |
| Event keyword rules | 13 | `config/keywords.py::EVENT_KEYWORD_RULES` |
| Canonical loan types | 13 | `schemas/loan_type.py::LoanType` |
| Loan-type normalisation entries | 105+ | `schemas/loan_type.py::LOAN_TYPE_NORMALIZATION_MAP` |
| Report sections (banking) | 12 | `customer_report_builder.py` |
| Report themes | 2 | `templates/bank_report*.html` |
| Output formats | 3 | HTML · PDF · XLSX |
| LLM models | 2 | `mistral` (parsing), `llama3.2` (narration) |
| LLM temperature / seed | 0.0 / 42 | `config/settings.py` |

