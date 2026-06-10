# Bank Report v2 — Improvement & New-Feature Suggestions

> **Scope:** UI/UX upgrades to existing panels + new banking-intelligence
> features that help an analyst understand a customer faster from a single
> glance at the report.
> **Audience:** future Claude implementation sessions. Each suggestion includes
> a concrete *Implementation hint* — file paths, function names, schema
> changes, and the smallest viable diff.
> **Conventions:** "view-model" = `pipeline/renderers/bank_v2_view_model.py`;
> "builder" = `pipeline/reports/customer_report_builder.py`;
> "template" = `templates/bank_report_v2.html`.
> Keep deterministic core / LLM-only-for-prose rule (per `CLAUDE.md`).

---

## Table of Contents

- [Part A — UI/UX Upgrades to Existing Features](#part-a--uiux-upgrades-to-existing-features)
  - [A1. Header & Verdict Pill](#a1-header--verdict-pill)
  - [A2. KPI Strip](#a2-kpi-strip)
  - [A3. Risk · FCU · Fraud Checks](#a3-risk--fcu--fraud-checks)
  - [A4. Banking Summary (LLM)](#a4-banking-summary-llm)
  - [A5. Cashflow Chart](#a5-cashflow-chart)
  - [A6. Debit-Velocity Heatmap](#a6-debit-velocity-heatmap)
  - [A7. Category Spend Mix](#a7-category-spend-mix)
  - [A8. Recurring Transactions](#a8-recurring-transactions)
  - [A9. Loan Activity (EMIs + Disbursals)](#a9-loan-activity-emis--disbursals)
  - [A10. Top Remitters](#a10-top-remitters)
  - [A11. All Transactions Table](#a11-all-transactions-table)
- [Part B — New Banking-Intelligence Features](#part-b--new-banking-intelligence-features)
  - [B1. Daily Balance Trend (Line)](#b1-daily-balance-trend-line)
  - [B2. Days-Below-Threshold Indicator](#b2-days-below-threshold-indicator)
  - [B3. Salary-to-Spend Funnel](#b3-salary-to-spend-funnel)
  - [B4. Weekday × Hour Spend Heatmap](#b4-weekday--hour-spend-heatmap)
  - [B5. Channel / Mode Mix Breakdown](#b5-channel--mode-mix-breakdown)
  - [B6. Behavioural Persona Card](#b6-behavioural-persona-card)
  - [B7. Counter-Party Concentration (HHI)](#b7-counter-party-concentration-hhi)
  - [B8. ATM-Withdrawal Map / Locations](#b8-atm-withdrawal-map--locations)
  - [B9. Income-Stability Score](#b9-income-stability-score)
  - [B10. Surplus / Savings-Rate Tile](#b10-surplus--savings-rate-tile)
  - [B11. Discretionary vs Essential Split](#b11-discretionary-vs-essential-split)
  - [B12. Anomaly Timeline Strip](#b12-anomaly-timeline-strip)
  - [B13. Period Comparison (vs Prior 3M)](#b13-period-comparison-vs-prior-3m)
  - [B14. Festival / Seasonal Spend Lens](#b14-festival--seasonal-spend-lens)
  - [B15. Cashflow Forecast (Next 30 Days)](#b15-cashflow-forecast-next-30-days)
  - [B16. Lifestyle Inflation Indicator](#b16-lifestyle-inflation-indicator)
  - [B17. Credit-Card Health Block](#b17-credit-card-health-block)
- [Part C — Cross-Cutting UX Polish](#part-c--cross-cutting-ux-polish)

---

## Part A — UI/UX Upgrades to Existing Features

### A1. Header & Verdict Pill

**Today:** small pill (`LOW`/`MODERATE`/`HIGH`) with one colour. Customer
metadata is plain text.

**Suggestions:**
1. **Verdict tooltip with top 3 drivers.** Hovering the pill reveals the
   concrete reasons (e.g. "EMI 53% of salary · 2 NACH bounces · negative net
   cashflow in 3 of 6 months").
   - *Hint:* `bank_v2.verdict` already gets `scorecard.concerns`; extend
     `_build_verdict` to attach `drivers: [str]`. Render as `<span title="…">`
     or a CSS `::after` popover.
2. **Period micro-sparkline next to "Period: Nov '25 – Apr '26".** Tiny
   inflow vs outflow bars per month, ~10px tall.
   - *Hint:* reuse `bank_v2.cashflow.credits/debits`, draw a `<canvas>` 80×16
     with Chart.js `bar` and `display:false` axes.
3. **Sticky header on scroll** so customer ID and verdict stay visible while
   reading lower panels.
   - *Hint:* `position:sticky;top:0;z-index:10;background:#fff` on `.topbar`.

---

### A2. KPI Strip

**Today:** 5 tiles (Salary / Balance / Net Cashflow / EMI / Stress) with a
small RAG colour and a sparkline on two of them.

**Suggestions:**
1. **Trend arrows (▲/▼) with delta-vs-prior-period.** Each KPI shows a small
   "+12% vs prev 3M" subtitle, coloured.
   - *Hint:* in `_kpi_*` functions, split the period in half (or use
     `monthly_cashflow[:n//2]` vs `[n//2:]`) and emit `delta_pct`. Template:
     `<span class="delta {{ 'up' if delta>0 else 'down' }}">▲ {{ delta }}%</span>`.
2. **Click-to-expand on each KPI.** Clicking a tile scrolls + flashes the
   relevant panel (Salary → Recurring Credits, EMI → Loan Activity, etc.).
   - *Hint:* wrap tiles in `<a href="#recurring">` or use `onclick`
     scrolling to anchor and a brief `outline` flash via `requestAnimationFrame`.
3. **Salary strip → mini-calendar of credit dates** instead of opaque dots.
   Today the strip shows N first months as "ok"; instead show the actual
   month a salary landed.
   - *Hint:* `_kpi_salary` already has `sal.dates`. Build `strip` from real
     month membership: `status='ok' if month in salary_months else 'miss'`.
4. **Stress score → segmented gauge (0–25 / 25–50 / 50–75 / 75–100)** with
   the score on a graduated background instead of a single fill bar.
   - *Hint:* replace `.stress-gauge .fill` with 4 segments via CSS
     `linear-gradient` and a thumb pointer.

---

### A3. Risk · FCU · Fraud Checks

**Today:** 3 columns of tiles, each with icon + label + optional detail.

**Suggestions:**
1. **Severity badges on each column header.** "Risk · 1 red · 2 amber"
   instead of just the global summary.
   - *Hint:* count colours per bucket in `_build_checks` and pass
     `risk_summary`, `fcu_summary`, `fraud_summary` to template.
2. **Collapse green checks behind a "+N passed" toggle.** Reduces noise so
   the eye lands on red/amber first.
   - *Hint:* template-side: render greens inside a `<details>` element,
     summary text `+{{ green|length }} passed`.
3. **"Why?" expandable on each tile.** Click → reveals the underlying event
   list (dates, amounts, narrations) without navigating away.
   - *Hint:* extend `compute_checklist` items with `evidence: [{date, amt,
     narration}]`. Template-side: hidden `<div class="evidence">` toggled by
     click. No backend changes needed beyond passing through.
4. **Sort tiles by severity within each column** (red → amber → neutral →
   green) for predictable scanning.
   - *Hint:* in `_build_checks`, sort each bucket by
     `{red:0,amber:1,neutral:2,green:3}[c["color"]]`.

---

### A4. Banking Summary (LLM)

**Today:** single paragraph with read-more clamp.

**Suggestions:**
1. **Sectioned bullet list instead of prose.** Income · Spending · Risk ·
   Recommendation — analyst-friendly skim.
   - *Hint:* update `CUSTOMER_REVIEW_PROMPT` in `config/prompts.py` to ask for
     four labelled sections; parse into a dict in `report_summary_chain.py`;
     view-model emits `{income, spending, risk, recommendation}`.
2. **Inline highlight of numbers.** Wrap currency / percentages with a
   subtle background so they pop.
   - *Hint:* template-side regex on `bank_v2.summary.teaser`:
     `re.sub(r'(₹\s*[\d,]+|\d+%)', r'<mark>\1</mark>', text)` (use a Jinja
     filter to keep template tidy).
3. **Show generation timestamp + model name** in fine print so reviewers
   know it's LLM-derived.
   - *Hint:* pass `LLM_MODEL_EXPLANATION` and `datetime.now()` into the
     summary context.

---

### A5. Cashflow Chart

**Today:** stacked bars (credit/debit), balance line, trend toggle row
(Max/Median Credit/Debit).

**Suggestions:**
1. **Annotation pins on spike months.** Today there's a tiny note below the
   chart; instead overlay a `!` pin on the spike bar with hover detail.
   - *Hint:* Chart.js `chartjs-plugin-annotation` (or pure DOM overlay
     positioned via `chart.scales.x.getPixelForValue(month)`).
2. **Net-cashflow line as a separate dataset.** A single line equal to
   `credits + debits` per month makes "is this month positive?" instant.
   - *Hint:* add a 4th dataset built in `_build_cashflow` from `m["net"]`,
     append a checkbox `data-cf-series="net"` to the toolbar.
3. **Hover crosshair + custom tooltip table** showing all visible series for
   that month side-by-side.
   - *Hint:* Chart.js `interaction:{mode:'index', intersect:false}` + custom
     `tooltip.callbacks.label`.
4. **Brush / zoom for >12 month windows.** When the period is long, a small
   overview strip below the main chart lets users zoom a sub-range.
   - *Hint:* Chart.js `chartjs-plugin-zoom` or two charts — main +
     overview — synced via `chart.options.scales.x.min/max`.

---

### A6. Debit-Velocity Heatmap

**Today:** months × day-of-month grid, 5 quantile shades, debit count only.

**Suggestions:**
1. **Cell tooltip showing total amount + txn count.** Currently it's "level
   only", no number reveals on hover.
   - *Hint:* set `title="₹{amt} · {count} txns"` per cell in
     `_build_heatmap`; template pipes into `<div title="...">`.
2. **Toggle: count vs amount-weighted.** Let user switch what intensity
   means.
   - *Hint:* emit two grids (`grid_count`, `grid_amt`) from `_build_heatmap`;
     template adds a small radio above heatmap that swaps the data binding.
3. **Highlight the customer's salary day-of-month** with a vertical column
   tint so heavy debits right after salary stand out.
   - *Hint:* `_build_heatmap` already gets `cust_df`; add `salary_day` from
     `_recurring_window(report.salary.dates)["day_range"]` and pass to template;
     CSS overlay column with `background:rgba(99,102,241,.06)`.
4. **Weekly view toggle** (rows = ISO week, cols = Mon–Sun) for short
   periods.
   - *Hint:* mode selector already exists in payload (`mode: "monthly"`).
     Build a parallel weekly grid; toggle = client-side only.

---

### A7. Category Spend Mix

**Today:** doughnut, top-5 categories + "Others".

**Suggestions:**
1. **Side legend with absolute values + % of total.** Doughnuts read poorly
   without numbers; render a 2-column list next to the chart.
   - *Hint:* template change only — iterate `bank_v2.category_mix.labels|zip(amounts)`
     beside the canvas.
2. **Click-a-slice → filters Transactions table to that category.** Cross-
   panel discoverability.
   - *Hint:* Chart.js `onClick` reads `evt.chart.getElementsAtEventForMode`,
     calls `togClass(...)` after mapping category → cls; or jump to `#txns`
     with the search prefilled.
3. **Month-over-month bar** below doughnut showing whether each category is
   growing or shrinking — a tiny diverging bar (current vs avg-of-prior).
   - *Hint:* extend `report.category_overview` to monthly form
     (`get_spending_by_category` → already does monthly aggregation
     internally; expose it). View-model emits `category_trend: {label: [m1..mn]}`.

---

### A8. Recurring Transactions

**Today:** two tables (debits/credits) with Frequency, Last Seen, Next
Expected, Avg Amount.

**Suggestions:**
1. **Confidence badge per row** based on regularity (gap variance).
   - *Hint:* in `_recurring_window`, compute `cv = stdev(gaps)/mean(gaps)`;
     emit `confidence: "high" if cv<0.15 else "med" if cv<0.4 else "low"`.
     Render as a tiny dot + tooltip.
2. **Mini timeline per row.** A 6-month strip of dots showing which months
   the recurrence actually fired — instantly shows skipped months.
   - *Hint:* `dates` list is already on `EMIBlock`/`BillBlock`/`RentBlock`
     and `SalaryBlock`. View-model emits `month_strip: [{month, hit}]`.
     Template: 6 small dots, green if hit, grey otherwise.
3. **Amount drift indicator.** ▲₹500 if the latest amount is higher than
   the average — flags fee creep / ratchet hikes.
   - *Hint:* `latest - mean(amounts)` per row; emit `drift_pct`.
4. **Plumb dates through `top_merchants`** so non-salary recurring credits
   also get Last Seen / Next Expected (currently blank).
   - *Hint:* `_group_similar_transactions` aggregates dates per group; bubble
     them up in `_get_top_merchants` → schema change in the dict shape.

---

### A9. Loan Activity (EMIs + Disbursals)

**Today:** card grid with name, amount, EMI day, months paid, bounces.

**Suggestions:**
1. **Progress bar for "months paid / months total".** Visual ratio is
   faster than reading "5/6".
   - *Hint:* template-only — `<div class="progress"><div style="width:{{
     ln.months_paid/ln.months_total*100 }}%"></div></div>`.
2. **Bounce attribution fix + a "last bounce date" detail.** Today bounces
   show 0 because event-type tuple is wrong (see `kpi_calculations.md` §11).
   - *Hint:* swap `("nach_bounce","cheque_bounce")` for `("ecs_bounce",)` in
     `_build_loan_cards`. Add `last_bounce_date` from the matched event.
3. **Inferred outstanding tenure.** "≈ 14 EMIs left @ ₹12,500" estimated
   from typical loan tenor — surfaces real burden vs single-month figure.
   - *Hint:* requires loan-amount estimate; can be approximated from
     disbursal events that match the EMI lender (`_extract_lender`). Defer
     if no disbursal match — emit `None`.
4. **Disbursal cards: lender logo / type pill** instead of just text.
   - *Hint:* maintain a small dict `LENDER_CATEGORIES` in `config/keywords.py`
     mapping fragments → category ("Bank loan", "NBFC PL", "BNPL", "Gold
     loan"); render coloured pill.

---

### A10. Top Remitters

**Today:** doughnut + ranked list (top 5).

**Suggestions:**
1. **Column "% of total" next to amount.** Concentration is the question —
   show it directly.
   - *Hint:* in `_build_remitters` compute `total_all = sum(amounts)`;
     emit `pct = round(amount/total_all*100, 1)` per row.
2. **Show first-seen / last-seen + active months** for each remitter.
   Distinguishes stable counter-parties from one-off spikes.
   - *Hint:* extend `_group_similar_transactions` to retain min/max
     `tran_date` and distinct months; surface in `top_merchants` dict.
3. **"View all" expand** to top 15 (currently 5 only).
   - *Hint:* `_get_top_merchants` returns top 5; bump to 15 and
     `_build_remitters` slices `[:5]` for default display, `[:15]` for
     expanded; client-side toggle.
4. **Search & merge UI for analyst.** Sometimes "AMAZON" and "AMAZON PAY"
   split — let the user merge them client-side and recompute totals.
   - *Hint:* read-only view-model; merging is purely DOM-layer aggregation
     against rendered list.

---

### A11. All Transactions Table

**Today:** sortable, filterable (chips + search), paginated 20/page,
balance column, mode tag.

**Suggestions:**
1. **Column visibility toggle.** Some users want narration-heavy view, others
   want amounts only.
   - *Hint:* small "⚙" menu emitting checkboxes that add/remove a class on
     `<table>` toggling `display` on `td:nth-child(N)`.
2. **Date-range picker.** Currently only text-search; a real date filter
   shrinks the set fast.
   - *Hint:* two `<input type="date">` inputs feeding `applyTxView()`;
     match `data-date >= from && <= to`.
3. **Amount-range slider** — debits over ₹X, credits under ₹Y.
   - *Hint:* dual-thumb slider feeding `applyTxView()` with
     `data-debit / data-credit`.
4. **Row-expand for narration drilldown.** Click row → reveals raw narration
   (no truncation), full category path, derived flags.
   - *Hint:* keep raw `narration` (untruncated) on `data-narration-raw`;
     click handler injects a `<tr class="detail">` below.
5. **Sticky header row** when scrolling long pages.
   - *Hint:* `position:sticky;top:0` on `<thead> th`.
6. **CSV export of current filtered view.**
   - *Hint:* button that walks visible `<tr>`, builds `Blob([csv],{type:
     'text/csv'})` and triggers `download` attribute. No backend.

---

## Part B — New Banking-Intelligence Features

### B1. Daily Balance Trend (Line)

**What it tells you:** the shape of cashflow inside a month — does the
customer live paycheck-to-paycheck or stay above ₹X consistently?

**Why valuable:** the existing closing-balance line is monthly granularity;
day-level reveals salary-dip-zero patterns.

**UI:** small panel under the cashflow chart, full-width line chart, X =
date, Y = running balance. Salary days marked with green diamonds, EMI days
with red triangles.

**Hint:**
- View-model: `_build_daily_balance(cust_df)` — sort ascending,
  cumulative-sum signed amounts (already done in `_build_transactions`),
  produce `{dates, balances, salary_days, emi_days}`.
- Template: new `<canvas id="dailyBalChart">`, Chart.js `line`, with point
  styles per index using a `pointStyle` array.
- Place in `bank_v2.daily_balance` next to `cashflow`.

---

### B2. Days-Below-Threshold Indicator

**What it tells you:** how many days the running balance fell below an MAB
(monthly average balance) threshold or below ₹0.

**UI:** a tile inside the KPI strip OR a row of small numbers in the
balance KPI: "12 days below ₹5K · 3 days below ₹0".

**Hint:**
- View-model: walk the daily-balance series from B1, count
  `sum(b < THRESHOLD)`. Threshold from `config/thresholds.py::LOW_BALANCE_INR`
  (new constant).
- Add to `_kpi_balance` output: `days_below_threshold`, `days_negative`.
- RAG: `red` if `days_negative > 0`, `amber` if `days_below_threshold > 5`.

---

### B3. Salary-to-Spend Funnel

**What it tells you:** of every ₹1 salary, how much goes to EMI / Rent /
Bills / Discretionary / Saved. Single visual.

**UI:** horizontal stacked bar (Sankey is overkill in PDF) showing percentage
allocations, summing to 100%.

**Hint:**
- View-model: `_build_salary_funnel(report)` —
  `{emi: emi_total/sal*100, rent: ..., bills: ..., disc: ..., saved: ...}`.
  All inputs already on `CustomerReport`.
- Template: a single `<div class="funnel-bar">` with 5 absolutely-positioned
  segments + legend. CSS only, no chart library.
- Edge case: if `salary` missing, hide.

---

### B4. Weekday × Hour Spend Heatmap

**What it tells you:** lifestyle pattern — is this person spending at
3 AM (gambling/late-night), or strictly 9–6?

**UI:** 7×24 grid (rows weekdays, cols hours). Reuse heatmap CSS.

**Hint:**
- Requires `tran_time` in `cust_df` (check `data/loader.py` — column may
  exist; if only date, derive hour=0 and skip).
- View-model: `_build_time_heatmap(cust_df)` returning `grid[7][24]` of
  debit counts. Reuse the quantile-bucketing logic from `_build_heatmap`.
- Template: clone the existing heatmap markup and CSS classes.

---

### B5. Channel / Mode Mix Breakdown

**What it tells you:** UPI-heavy vs cheque-heavy vs ATM-heavy customer.
Already have `_infer_mode` (UPI/NEFT/IMPS/RTGS/NACH/MB/IFT/IB/ATL/PG/PCD/CLG)
used internally for K15 but not surfaced as its own panel.

**UI:** stacked horizontal bar — one bar per month, segments per mode. Or
a small doughnut beside the existing category mix.

**Hint:**
- View-model: `_build_mode_mix(cust_df)` reusing `_infer_mode`. Group by
  `(month, mode)` → counts and amounts.
- Add `bank_v2.mode_mix` and a new panel between Cashflow and Recurring.
- Bonus: highlight the mode whose share shifted most (already computed by
  K15 for the FCU check; reuse).

---

### B6. Behavioural Persona Card

**What it tells you:** one-line categorisation — "Salaried Saver",
"Self-employed Cash-handler", "EMI-stretched", "Gig-worker", "Inflow-bursty".

**UI:** small card top-right of header, 2 lines: persona label + 3 supporting
bullets. Replaces nothing; sits beside the verdict pill.

**Hint:**
- Pure rule engine in `tools/persona.py` (new file). Inputs:
  `account_quality`, `salary`, `emis`, `events`, `monthly_cashflow`,
  category mix.
- Decision tree: e.g. if `account_quality == "PRIMARY"` and salary regular
  and EMI<40% → "Salaried Saver"; ATM count high + cash deposits →
  "Cash-handler"; etc. Codify in a small list of rules.
- View-model: `_build_persona(report)` → `{label, supports: [str]}`.
- Deterministic — no LLM.

---

### B7. Counter-Party Concentration (HHI)

**What it tells you:** is income/outflow diversified or dependent on one
party? HHI > 25% on credit side often = single employer / dependency.

**UI:** two donut-style gauges in the Top Remitters panel: "Inflow HHI:
0.34 · concentrated", "Outflow HHI: 0.12 · diverse".

**Hint:**
- View-model: in `_build_remitters` compute
  `hhi = sum((a/total)**2 for a in amounts)`. Add to returned dict.
- Template: a CSS conic-gradient gauge or just a coloured pill.
- Threshold from `config/thresholds.py::HHI_HIGH=0.25`.

---

### B8. ATM-Withdrawal Map / Locations

**What it tells you:** is the customer withdrawing across many cities (could
indicate travel/mule activity) or one fixed location?

**UI:** list of ATM addresses (already parsed by `_detect_atm_withdrawals`,
which sets `_addresses`). Show top 5 with count + total amount, plus a
coverage stat ("3 distinct cities, 12 ATMs").

**Hint:**
- `_addresses` is already on the `atm_withdrawal` event. Currently unused
  in the v2 template.
- View-model: `_build_atm_block(report)` returning sorted list + counts.
- Template: small panel inside Loan Activity area or its own under Cashflow.
- Optional: simple India SVG with city-name tags (no real geocoding —
  string-match against a hardcoded city list).

---

### B9. Income-Stability Score

**What it tells you:** beyond "salary detected", *how stable* is it?
Combines amount variance, on-time variance (day-of-month CV), and gap
regularity into 0–100.

**UI:** small KPI strip card OR an addition to the Salary KPI (under the
dot strip, replace "5 of 6 months" with "5 of 6 months · stability 82/100").

**Hint:**
- View-model: `_income_stability(salary)` —
  `amount_cv = stdev(amounts)/mean(amounts)`, `day_cv = stdev(days)/mean(days)`,
  `gap_cv = stdev(gaps)/mean(gaps)`. Score = `100 * (1 - clamp(weighted_avg))`.
- All inputs from `salary.dates` + raw amounts (need to extend
  `SalaryBlock.amounts: List[float]`).
- Threshold buckets in `config/thresholds.py`.

---

### B10. Surplus / Savings-Rate Tile

**What it tells you:** `(salary − essential outflows) / salary`. The number
underwriters actually care about.

**UI:** new KPI strip tile (6th) or replaces the redundant `Net Cashflow`
when salary is present.

**Hint:**
- View-model: `_kpi_surplus(report)` —
  `essentials = emi_total + rent + bills_total`. Output:
  `surplus_inr`, `surplus_pct`, RAG (`red <10%`, `amber 10-25%`, `green >25%`).
- Template: same tile shape as existing KPIs.

---

### B11. Discretionary vs Essential Split

**What it tells you:** of total spend, what's needs vs wants. Helps lenders
size affordable EMI capacity.

**UI:** horizontal stacked bar: Essential (rent, bills, EMI, fuel, grocery)
vs Discretionary (entertainment, dining, shopping, gaming) with both ₹ and %.

**Hint:**
- Tag each category in `config/categories.yaml` with a new key
  `essential: true|false`.
- View-model: `_build_spend_split(report.category_overview)` returning
  `{essential: ₹, discretionary: ₹, ratio_pct: float}`.
- Template: same `funnel-bar` CSS as B3.

---

### B12. Anomaly Timeline Strip

**What it tells you:** when did notable events happen, in chronological
order? A horizontal timeline beats reading multiple panels.

**UI:** a 1-row strip below the cashflow chart. Each event is a dot on a
date axis, coloured by significance, hover reveals detail. Salary credits
green, bounces red, disbursals blue, large credits orange.

**Hint:**
- All inputs already in `report.events` (`type`, `date`, `description`,
  `significance`).
- View-model: `_build_event_timeline(events)` → sorted list of
  `{date, label, color}`.
- Template: SVG line + `<circle>` per event, positioned by date.

---

### B13. Period Comparison (vs Prior 3M)

**What it tells you:** is the customer's recent behaviour different from
3 months ago? Catches lifestyle changes / income loss.

**UI:** a row of "Δ" deltas inside the KPI strip subtitles, plus a panel
"Last 3M vs Prior 3M" with 4 mini bars (income, spend, EMI, savings rate).

**Hint:**
- Split monthly-cashflow at midpoint; compute aggregates for each half.
- View-model: `_build_period_compare(report)` with `{recent: {...},
  prior: {...}, deltas: {...}}`.
- Template: small grid of comparison rows.

---

### B14. Festival / Seasonal Spend Lens

**What it tells you:** does spending spike at Diwali / wedding season /
year-end? Useful in India underwriting context.

**UI:** annotation overlay on the cashflow chart marking known festival
months + a small "Festival lift: +24%" callout.

**Hint:**
- Hardcode festival windows in `config/festivals.py` (Diwali Oct/Nov,
  wedding Nov–Feb, year-end Dec).
- View-model: compute month-over-baseline lift for each festival window.
- Template: re-use the spike-pin idea from A5.1.

---

### B15. Cashflow Forecast (Next 30 Days)

**What it tells you:** projected balance trajectory using known recurring
debits and expected salary.

**UI:** dashed extension of the daily-balance line (B1) into the next 30
days, with the salary expected day and EMI debit days marked.

**Hint:**
- View-model: `_forecast_balance(report, daily_balance)` —
  use `_recurring_window(salary.dates)` for next salary date,
  `_recurring_window(emi.dates)` for next EMI dates, project running
  balance forward.
- All deterministic; no LLM.
- Carries a clear "projection" disclaimer in template.

---

### B16. Lifestyle Inflation Indicator

**What it tells you:** is discretionary spend growing faster than income?

**UI:** a single line "Discretionary spend ↑ 18% over 6M; income ↑ 4%" in
the Banking Summary or as its own one-line callout above Recurring.

**Hint:**
- View-model: linear-fit slope (or first-half vs second-half mean) on
  monthly discretionary spend (B11) and on salary amounts.
- Emit `lifestyle_inflation: {spend_slope_pct, income_slope_pct, verdict}`.

---

### B17. Credit-Card Health Block

**What it tells you:** are CC payments full vs minimum? Are they recurring
on time? Today CC payments only show as a positive event.

**UI:** small card panel — for each detected card (deduplicated by lender),
show: avg payment, biggest payment, last paid date, frequency, "looks like
minimums?" (small payments) flag.

**Hint:**
- Inputs: `events` of type `cc_payment` already exist (from
  `CC_PAYMENT_KEYWORDS`).
- View-model: `_build_cc_health(events)` — group by lender via
  `_extract_lender`, compute stats.
- "Minimums" flag: heuristic — if avg payment is < 10% of last credit-card
  bill statement amount (need bill amount; skip if unavailable).

---

## Part C — Cross-Cutting UX Polish

These apply globally and don't fit a single panel.

| # | Suggestion | Hint |
|---|---|---|
| C1 | **Dark-mode** stylesheet via `prefers-color-scheme`. | Add a `:root[data-theme="dark"]` block in template `<style>`; toggle via small button next to "Export PDF". |
| C2 | **Print stylesheet** that hides toolbars/buttons and keeps charts crisp. | `@media print { .tx-tools, .cf-trend-toolbar, button { display:none } }`. |
| C3 | **Section anchors visible on hover** (`#` icon next to each panel `<h2>`). | Pure CSS — `h2:hover .anchor { opacity:1 }`. |
| C4 | **Keyboard shortcuts** (`/` focuses search, `j/k` paginate transactions). | Listen to `keydown` on `document`. |
| C5 | **Loading skeletons** when sections are missing instead of just hiding. | Render greyed-out placeholder with `data-section="..."` + reason text. |
| C6 | **Inline glossary** for jargon (HHI, MAB, NACH) with `<abbr title="...">`. | Maintain map in template or pass via `bank_v2.glossary`. |
| C7 | **Top-of-page jump links + back-to-top button.** | Floating button, `position:fixed;bottom:24px;right:24px`. |
| C8 | **Section-level "review note" textarea** in HTML view (analyst scratchpad). | `<textarea>` with `localStorage` persistence keyed by customer ID. |
| C9 | **Risk-trail download** — JSON export of all events + checks behind every score. | New button calling `bank_v2|tojson` blob download. |
| C10 | **Annotated screenshot in `kpi_calculations.md`** with section anchors. | Manual; add `docs/img/bank_report_v2_annotated.png`. |

---

## Implementation Priority (Suggested)

A pragmatic order if implementing in waves — high impact, low cost first.

| Wave | Items | Rationale |
|---|---|---|
| 1 — quick wins (≤1 day each) | A2.1, A3.1, A3.4, A6.1, A7.1, A10.1, A11.5, A11.6, C2 | UI polish, no backend changes |
| 2 — small features | A8.1, A8.2, A9.1, A9.2 (bug fix), B2, B10, B12 | Reuse existing data |
| 3 — new analytics | B1, B3, B6, B7, B11, B13 | Need new view-model functions but inputs exist |
| 4 — heavier | B4, B8, B15, B17 | Need raw-data exploration / new schemas |

---

## Notes for Future Implementer

- **Don't break determinism** — none of the new tiles should call an LLM.
  Persona, stability, surplus, HHI, splits are all deterministic.
- **Schema-first** — extend the relevant schema in `schemas/customer_report.py`
  before populating from the builder. Don't pass dicts across layers.
- **Renderers stay pure** — view-model is the last place where new fields
  are derived; templates only read.
- **Add to `kpi_calculations.md`** as each suggestion lands, mirroring the
  existing per-section format.
- **Threshold values** belong in `config/thresholds.py` — never inline.
