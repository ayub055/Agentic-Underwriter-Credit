# Bank Report v2 — Section-by-Section Reference

> **Audience:** future Claude (Sonnet/Opus) sessions and human reviewers.
> **Goal:** for every panel rendered by `templates/bank_report_v2.html`,
> document where the data comes from, how it's computed, and the exact
> place to change behaviour.
>
> **Conventions used throughout this doc:**
> - File paths are repo-relative.
> - Line numbers are accurate as of the last edit; treat ±10 as drift.
> - "View-model" = `pipeline/renderers/bank_v2_view_model.py`.
> - "Builder" = `pipeline/reports/customer_report_builder.py`.
> - Every view-model build function is wrapped by `_safe(...)` — exceptions
>   become `None`, and the corresponding panel/sub-section silently
>   disappears via Jinja `{% if %}` guards. Fail-soft is the default.
> - RAG colours: `red` = breach, `amber` = elevated, `green` = positive,
>   `neutral` = informational. Severity → colour mapping happens in the
>   view-model, not the template.

---

## Table of Contents

1. [System Map](#1-system-map)
2. [KPI Strip](#2-kpi-strip) — Salary · Balance · Net Cashflow · EMI · Stress
3. [Risk · FCU · Fraud Indicators](#3-risk--fcu--fraud-indicators)
4. [Banking Summary (LLM)](#4-banking-summary-llm)
5. [Cashflow Chart + Heatmap + Category Mix](#5-cashflow-chart--heatmap--category-mix)
6. [Recurring Transactions](#6-recurring-transactions)
7. [Loan Activity](#7-loan-activity) — EMIs + Disbursals
8. [Top Remitters](#8-top-remitters) — Credit Sources + Debit Beneficiaries
9. [All Transactions Table](#9-all-transactions-table) — sort · filter · paginate
10. [Cross-cutting Concerns](#10-cross-cutting-concerns)
11. [Open Improvements](#11-open-improvements)

---

## 1. System Map

```
data/loader.py (CSV cache, lru_cached)
        │   rgs.csv · dpd_data.csv · tl_features.csv (tab-separated)
        ▼
tools/                                ← pure deterministic analytics
        analytics.py        get_balance_trend, get_cash_flow, debit_total, …
        event_detector.py   detect_events  (keyword rules + multi-step detectors)
        category_resolver   resolve_category_presence  (NOT used for EMI any more)
        transaction_fetcher fetch_transaction_summary, _group_similar_transactions
        scorecard.py        compute_scorecard  (concerns / verify chips, RAG)
        ▼
pipeline/reports/customer_report_builder.py
        │   builds the canonical CustomerReport (Pydantic) — populates
        │   salary, emis, bills, rent, monthly_cashflow, top_merchants,
        │   events, account_quality, …
        ▼
pipeline/renderers/bank_v2_view_model.py::build_bank_v2_context(...)
        │   wraps every section builder in _safe(); returns the dict
        │   used by Jinja as `bank_v2`
        ▼
templates/bank_report_v2.html
        │   pure rendering — no data lookups, only `{{ … }}` and `{% if %}`
        ▼
PDF / HTML output (reports/customer_<id>_report_v2.{pdf,html})
```

**Key contracts (`schemas/`):**
- `customer_report.py` — `CustomerReport`, `SalaryBlock`, `EMIBlock`, `BillBlock`, `RentBlock`, `RiskIndicatorsBlock`. (Each presence-block now carries a `dates: List[str]`.)
- `bureau_report.py` — bureau side; only consulted by `compute_checklist`.
- `transaction_summary.py` — `TransactionSummary`, `HighFrequencyTransaction`.

---

## 2. KPI Strip

Template panel: `#kpis` (top of `bank_report_v2.html`, ~line 213).
View-model: `_build_kpis` (line 138) → keys in `bank_v2.kpis`:
`salary`, `balance`, `net_cashflow`, `emi`, `stress`.

Each KPI is its own `_kpi_*` function and is independent — one missing
upstream input only blanks that one tile.

### 2.1 Salary KPI — `_kpi_salary` (line 152)

- **Source:** `report.salary` (`SalaryBlock`).
- **Fields:** `avg_amount`, `frequency` (count of salary credits), `narration`,
  `latest_transaction`, `dates`.
- **Output:**
  - `avg_amount` = `round(sal.avg_amount)`
  - `frequency` = `sal.frequency`
  - `months_total` = `len(report.monthly_cashflow) or 6`
  - `strip` = list of `{label, title, status}` per month — `status=ok` for the
    first `n_present` months (capped at `months_total`), else `miss`. Used as
    coloured dots under the salary tile.
  - `rag` = `green` if `frequency >= max(3, n_total - 1)`, else `amber`.
- **Where to change:**
  - Salary detection itself → `tools/transaction_fetcher.py`
    (`is_salary_narration`, salary aggregation in `fetch_transaction_summary`).
  - Salary regularity threshold → the `max(3, n_total - 1)` heuristic in
    `_kpi_salary`.

### 2.2 Avg Closing Balance — `_kpi_balance` (line 175)

#### Upstream: `balance_info`
- Loaded by `_load_balance_info` (line 106) → `tools/analytics.py::get_balance_trend` (line 287).
- **Algorithm:**
  1. Pull customer's transactions, sort by `tran_date`.
  2. `signed_amount = +tran_amt_in_ac` for credits (`dr_cr_indctor == 'C'`),
     `-tran_amt_in_ac` for debits.
  3. `running_balance = signed_amount.cumsum()` — **starts at 0; no opening
     balance is read from source data.** Values are deltas from the first
     transaction, not true ledger balances.
  4. `monthly_balances` = last `running_balance` per `tran_date[:7]` (YYYY-MM).
  5. `min_balance` / `max_balance` = min/max of full `running_balance` series.
  6. `trend` = increasing/decreasing/stable from first vs last monthly value.

#### KPI computation
- `avg = mean(monthly_balances.values())` — simple mean across months (sorted).
- `min` / `max` = passed through.
- `series` / `labels` = month-sorted closing balances for the sparkline canvas
  (`#sparkBal`).

### 2.3 Net Cashflow — `_kpi_net_cashflow` (line 192)

- **Input:** `report.monthly_cashflow` — list of `{month, credits, debits, net}`.
- **Logic:**
  - `total = sum(net)`
  - `negative_months = [month for net < 0]`
  - **RAG:** `green` if `total ≥ 0`, `amber` if `total > -50_000`, else `red`.
- **Output:** `{total, series, labels, negative_months, rag}`. `series` drives
  the bar sparkline (`#sparkNet`).

### 2.4 Total EMI / mo — `_kpi_emi` (line 208)

- **Input:** `report.emis` (list of `EMIBlock`).
- **Logic:** `total = sum(emi.amount)`; if salary present,
  `pct_salary = total / salary.avg_amount * 100`.
  - **RAG:** `red` if `pct_salary ≥ 50`, `amber` if `pct_salary ≥ 40`, else `green`.
- **Output:** `{total, pct_salary, count, rag}`.

### 2.5 Stress Score — `_kpi_stress` (line 229)

- **Input:** `scorecard` from `tools/scorecard.compute_scorecard` (loaded once
  in `build_bank_v2_context`).
- **Formula:** `score = clamp(0, 100, 100 - 20*len(concerns) - 5*len(verify))`.
- **RAG:** taken from `scorecard["verdict_rag"]`.
- **Label:** `LOW` (green) / `MODERATE` (amber) / `HIGH` (red).
- **Drivers:** first 2 concerns (or first 2 verify items if no concerns).

---

## 3. Risk · FCU · Fraud Indicators

Template panel: `#checks` (lines 274–298). Three columns of tiles
(`Risk`, `FCU`, `Fraud`); each tile = icon (✓/!) + label + optional detail.
Header pill: `f"{N} checks · {red} red · {amber} amber"`.

### 3.1 View-model — `_build_checks` (line 251)

- Calls `pipeline.renderers.combined_report_renderer.compute_checklist(
  report, None, None)` → returns `{"bureau": [...], "banking": [...]}`.
- Pulls **only** `cl["banking"]` (bureau items render in v1, not v2).
- `_to_check(item)` maps severity → colour:
  `high → red`, `medium → amber`, `positive → green`, anything else → `neutral`.
- Buckets by **label string**:
  - `FCU_LABELS = {"Post-disbursement fund diversion", "Post-salary self-transfer",
    "Land purchase payments", "Automated (NACH/mandate) transactions",
    "Payment mode distribution shift"}`
  - `FRAUD_LABELS = {"ATM withdrawals elevated", "Transactions above 95th percentile",
    "Betting / gaming spend", "Round-trip transfer detected", "Credit-spend dependency"}`
  - default → Risk.
- **Note:** `_checks_risk`, `_checks_fcu`, `_checks_fraud` further down the
  view-model file are dead code — the active path always goes through
  `compute_checklist`.

### 3.2 The 13 banking checks (from `compute_checklist`, line 478)

| # | Label | Source | Severity rule |
|---|---|---|---|
| K1 | ECS / NACH bounces | `events.type == "ecs_bounce"` | `high` if any |
| K2 | Loan disbursement detected | events `loan_disbursal` ∪ `loan_redistribution_suspect` ∪ `large_single_credit` w/ "lender" or "loan" in desc | `high` if any |
| K3 | Post-disbursement fund diversion *(FCU)* | events `post_disbursement_usage` | `high` if `_amounts_match` or `_concentration_pct ≥ 50`; else `medium`; else `neutral` |
| K4 | Salary detected in banking | `report.salary is not None` | `positive` if salary |
| K5 | Post-salary self-transfer *(FCU)* | events `self_transfer_post_salary` | `medium` if any |
| K6 | EMI obligations present | `report.emis` non-empty | `medium` if any |
| K7 | NACH mandate EMI detected | events `mandate_emi` | `medium` if any |
| K8 | Rent payments present | `report.rent is not None` | always `neutral` |
| K9 | Credit card bill payments | events `cc_payment` | `positive` if any |
| K11 | Land purchase payments *(FCU)* | events `land_payment` | `medium` if any |
| K12 | ATM withdrawals elevated *(Fraud)* | events `atm_withdrawal[0]._is_elevated` | `medium` if elevated |
| K13 | Transactions above 95th percentile *(Fraud)* | per-direction `> p95` (only if ≥ 5 txns/direction) | `medium` if any outlier |
| K14 | Automated (NACH/mandate) transactions *(FCU)* | regex `NACH\|MANDATE` over `tran_partclr` | always `neutral` (count) |
| K15 | Payment mode distribution shift *(FCU)* | per-month mode mix from `_infer_mode(row)` (UPI/NEFT/IMPS/RTGS/NACH/MB/IFT/IB/ATL/PG/PCD/CLG/Other); compares earlier vs recent window | `medium` if any mode delta ≥ threshold |

K10 is intentionally absent (numbering quirk; no behaviour hidden).

### 3.3 Thresholds

K15 reads from `config/thresholds.py`:
`MODE_SHIFT_MIN_MONTHS`, `MODE_SHIFT_RECENT_MONTHS`, `MODE_SHIFT_MIN_TRANSACTIONS`,
`MODE_SHIFT_THRESHOLD_PP`. K15 silently no-ops if the customer has too few
months / txns. All other checks have inline literals — change them in
`compute_checklist` directly.

### 3.4 Where to change what

- **Add an indicator** → append to `banking_items` in `compute_checklist`
  (line 691+) with `{label, checked, severity, detail}`. If it should sit in
  FCU/Fraud, also add the label to `FCU_LABELS` / `FRAUD_LABELS` in
  `_build_checks`.
- **Move column** → edit the label set in `_build_checks`. Pure string match,
  so a label typo silently demotes the check to Risk.
- **Tune severity** → inline literals inside `compute_checklist`.
- **New event types** → declare in `config/keywords.py::EVENT_KEYWORD_RULES`
  (keyword-based) or write `_detect_…` in `tools/event_detector.py` and wire
  into `detect_events`.

---

## 4. Banking Summary (LLM)

Template panel: `#summary` (line 304). Single LLM-generated paragraph,
clamp/expand toggle.

- **Source:** `report.customer_review` (built by
  `pipeline/reports/report_summary_chain.py` using `config/prompts.py` against
  the local Ollama instance).
- **View-model:** trivial passthrough — `bank_v2.summary` carries
  `{text, has_more}`.
- **Failure mode:** if Ollama is down or the model is missing, the chain
  catches the exception and a deterministic stub is used; the toggle stays
  hidden.
- **Where to change:**
  - Prompt → `config/prompts.py` (`CUSTOMER_REVIEW_PROMPT` etc.).
  - Model name → `config/settings.py` (`LLM_MODEL_EXPLANATION`).
  - When using a DeepSeek-style reasoning model, route output through
    `utils/llm_utils.strip_think` before parsing.

---

## 5. Cashflow Chart + Heatmap + Category Mix

Template panel: `#cashflow` (lines 322–355). Three charts:

### 5.1 Cashflow chart — `bank_v2.cashflow`

- **Source:** `report.monthly_cashflow` (aggregates) + raw `cust_df` (per-txn
  trend series).
- **Output:**
  `{months, credits, debits, balances, spikes, max_credits, max_debits, median_credits, median_debits}`.
  The Chart.js block renders stacked bars (credits/debits) plus the balance
  line on the right axis, plus four optional per-transaction trend lines
  toggled via checkboxes.
- `spikes` = months whose outflow > 1.5× the median outflow.

#### 5.1.1 Per-transaction trend series — `_per_txn_trends(cust_df, months)`

Computed once from raw `cust_df`; each series is a list parallel to `months`.

| Series | Definition (per month) | Sign | Edge cases |
|---|---|---|---|
| `max_credits` | `max(abs(amt))` over rows where `dr_cr_indctor=='C'` | positive | `None` if no credits that month |
| `max_debits`  | `−max(abs(amt))` over rows where `dr_cr_indctor=='D'` | negative (mirrors stacked debit bar) | `None` if no debits that month |
| `median_credits` | `median(abs(amt))` over credits — **per-transaction** median, i.e. typical credit ticket size | positive | `None` if 0 credits; equals the single value if 1 credit |
| `median_debits`  | `−median(abs(amt))` over debits — typical debit ticket size | negative | `None` if 0 debits |

Notes on edge cases:
- `cust_df` missing/empty → all four series filled with `None`.
- `tran_amt_in_ac` is `abs`-d before aggregation (defensive against signed source data).
- Zero-amount rows are dropped before max/median.
- Even-count months use pandas' default `Series.median()` (linear interpolation).
- `None` values are passed through as JSON `null`; trend datasets render with
  `spanGaps:false` so empty months break the line rather than interpolating.

#### 5.1.2 Toolbar UX (template)

A row of checkbox chips above the chart toggles each series. Defaults:

- **On:** Credits, Debits, Closing Balance.
- **Off:** Max Credit, Max Debit, Median Credit, Median Debit.

Each chip carries `data-cf-series="<key>"`:
- Numeric keys (`0`,`1`,`2`) toggle the bars/balance datasets by index.
- Trend keys (`mc`/`md`/`medc`/`medd`) are looked up in a `trendIndex` map
  built when datasets are appended.

The handler calls `chart.setDatasetVisibility(idx, cb.checked)` + `chart.update()`.
All four trend lines plot on the same `y` (flow) axis as the bars, with
distinct colours and dash patterns:

| Series | Colour | Dash |
|---|---|---|
| Max Credit | `#059669` | `[6,3]` long dash |
| Max Debit | `#b91c1c` | `[6,3]` long dash |
| Median Credit | `#34d399` | `[2,3]` short dash |
| Median Debit | `#fb7185` | `[2,3]` short dash |

#### 5.1.3 Where to change

- **Add a new trend series** → extend `_per_txn_trends` to return another list,
  add it to the `cashflow` dict, append a dataset in the template's IIFE, and
  add a checkbox with a unique `data-cf-series` key (and a `trendIndex` entry
  in `trendOrder`).
- **Change defaults (which checkboxes start on)** → flip `hidden:true`/`false`
  in `trendBase` and the `checked` attribute on the corresponding `<input>`.
- **Switch median definition** to median *daily total* instead of median
  *per-transaction* → group by date inside `_per_txn_trends` before taking the
  median. The current per-transaction median answers "what's the typical
  ticket size?"; the daily-total median answers "what's the typical day?".

### 5.2 Heatmap — `bank_v2.heatmap`

- **What it is:** debit-velocity grid (rows = months, columns = day-of-month,
  cell intensity = number/value of debits).
- **Source:** built in `_build_heatmap` (view-model) from raw `cust_df`.
- **Output:** `{grid, month_labels, window_label}`.
- **Visibility:** drops if `cust_df` is empty.

### 5.3 Category Mix — `bank_v2.category_mix`

- **Source:** `report.category_overview` (debit-side spending by category).
- **Output:** `{labels, amounts}` consumed by the doughnut at `#catMix`.
- **Where to change:**
  - Categories list → `config/categories.yaml` (40+ entries, with keywords +
    aliases + direction).
  - Aggregation → `tools/analytics.get_spending_by_category`.

---

## 6. Recurring Transactions

Template panel: `#recurring` (~line 360). Two tabs: **Debits**
(EMI / Utility / Rent) and **Credits** (Salary + non-salary recurring credits
from `top_merchants`).

### 6.1 Schema (extended for date-window features)

Each presence-block in `schemas/customer_report.py` carries a
`dates: List[str]` field — every occurrence date for that item
(format `YYYY-MM-DD`). Populated in the builder:

| Block | Source for `dates` |
|---|---|
| `EMIBlock` | per-group dates from EMI matches (see §7.2) |
| `BillBlock` | `supporting_transactions[*]['date']` |
| `RentBlock` | `supporting_transactions[*]['date']` |
| `SalaryBlock` | `_get_all_salary_dates(cust_id)` — replays the salary scan |

### 6.2 View-model

- **Debits — `_build_recurring_debits`** (line 648): one row per
  `EMIBlock`, `BillBlock`, and (single) `RentBlock`. Calls `_recurring_row`.
- **Credits — `_build_recurring_credits`** (line 659): one row for
  `report.salary` (name from RGS merchant if available, else narration), plus
  rows for `report.top_merchants` where `type == "C"` and `count >= 2` and
  the name doesn't look like the salary narration. **Top-merchant credits
  emit blank `last_seen` / `next_expected`** because they don't carry per-occurrence
  dates.

### 6.3 The window helper — `_recurring_window(dates)`

Single source of truth for the columns. From a list of date strings:

- `day_range = (mode_day - 5, mode_day + 5)`, clamped to `[1, 31]` —
  the most-common day-of-month ± 5 days. Powers the **Frequency** column.
- `last_seen = max(dates)` formatted `dd MMM 'YY` (e.g. `27 Feb '26`).
- `median_gap_days` = median of consecutive sorted-date gaps; defaults to 30
  if fewer than 2 dates or all gaps are zero.
- `next_window = [last_seen + median_gap − 5, last_seen + median_gap + 5]`,
  rendered as either `7–17 May '26` (same month) or `28 Apr – 07 May '26`
  (cross-month). Powers the **Next Expected** column.

### 6.4 Column outputs

| Column | Format | Source |
|---|---|---|
| Frequency | `Monthly · day 5-15` | `_frequency_label_with_range(count, win)` |
| Last Seen | `27 Feb '26` | `win["last_seen"]` (fallback: `_fmt_full_date(sample.date)`) |
| Next Expected | `7–17 May '26` | `win["next_window"]` |
| Avg Amount | `₹ 51,020` | rounded `avg_amount` |

### 6.5 Where to change

- **EMI keyword set** for what counts as an EMI in this section →
  `config/keywords.py::EMI_ALL_KEYWORDS` (see §7).
- **Day-of-month width** (currently ±5) → constant `5` inside
  `_recurring_window`.
- **Window for next expected** (currently ±5 around `last + median_gap`) →
  same helper.
- **Date format** → `_fmt_full_date` and the strftime calls inside
  `_recurring_window`.

---

## 7. Loan Activity

Template panel: `#loans` (lines 411–445). Two tabs:
**Loan EMIs** (debit cards) and **Disbursal Events** (credit cards).
View-model: `_build_loan_cards` (line 718), `_build_loan_disbursals` (line 745).

### 7.1 Loan EMI cards — per-card fields

For each `EMIBlock` in `report.emis`:

| Field | Source / formula |
|---|---|
| `name` | `emi.name[:50]` (fallback `"EMI"`) |
| `amount` | `round(emi.amount)` (mean of group) |
| `emi_day` | `_day_of_month(emi.sample_transaction["date"])` — *one* sample, not mode-day |
| `months_paid` | `min(emi.frequency, n_months)` |
| `months_total` | `len(report.monthly_cashflow) or 6` |
| `bounces` | count of events where `type ∈ {"nach_bounce","cheque_bounce"}` AND `emi.name.split()[0].upper() in description` |
| `bounces_color` | `red` if `bounces > 0` else `green` |

> ⚠ **Known bug:** the active rule in `config/keywords.py` emits
> `type: "ecs_bounce"`, but `_build_loan_cards` checks `nach_bounce` /
> `cheque_bounce`. **Bounces always show 0** until the type tuple is
> changed to `("ecs_bounce",)`.

### 7.2 EMI detection — `_get_emi_block` (builder)

```
config/keywords.py
        EMI_ALL_KEYWORDS = MANDATE_EMI_KEYWORDS
                         + EMI_NARRATION_KEYWORDS
                         + HOME_LOAN_EMI_KEYWORDS
        ▼
pipeline/reports/customer_report_builder.py::_get_emi_block(cust_id)
        1) load all customer transactions (data.loader)
        2) filter to debits (dr_cr_indctor == 'D')
        3) build OR-regex from EMI_ALL_KEYWORDS via tools.event_detector._kw_to_regex
           (SQL-style % wildcard supported; everything else re.escape-d)
        4) match against UPPER(tran_partclr)
        5) group by extract_recipient_name(narration)
           fallback: clean_narration → "EMI Payment"
        6) emit one EMIBlock per group:
             amount = mean(group amounts)
             frequency = len(group)
             sample_transaction = first matching txn
             dates = every txn date in group
        ▼
_build_loan_cards → templates/bank_report_v2.html
```

The legacy `emi:` block in `config/categories.yaml` is **no longer used** for
the Loan Activity panel (still consumed by other category lookups).

### 7.3 Disbursal cards — per-card fields

For each event with `type ∈ {loan_disbursal, loan_redistribution_suspect,
post_disbursement_usage}`:

| Field | Source |
|---|---|
| `lender` | `_extract_lender(description)` — regex `r"from ([A-Z][A-Za-z/&\- ]{2,40})"`; defaults to literal `"Lender"` if no match |
| `amount` | `round(ev.amount)` |
| `date` | `ev.date` (passed through) |
| `month_label` | `ev.month_label` |
| `description` | `ev.description[:200]` |

### 7.4 Disbursal detection chain

```
config/keywords.py::LOAN_DISBURSEMENT_KEYWORDS
  ("LOAN DIS", "LOAN DISB", "LOAN DISBURS", "LOAN CREDIT",
   "LOAN A/C CR", "SANCTIONED", "LOAN AC NO", "PLCC")
        ▼  (rule: type=loan_disbursal, direction=C)
tools/event_detector.py::_apply_keyword_rules(df)
        - filter by direction
        - regex-OR keywords (SQL % → .*)
        - match UPPER(tran_partclr)
        - require ≥min_months distinct months if set
        ▼
tools/event_detector.py::detect_events(cust_id, rg_salary_data)
        also runs the multi-step detectors:
          _detect_post_salary_routing
          _detect_loan_redistribution      → loan_redistribution_suspect
          _detect_post_disbursement_usage  → post_disbursement_usage
                                              (sets _amounts_match, _concentration_pct)
          _detect_self_transfer_post_salary→ self_transfer_post_salary
          _detect_round_trips              → round_trip
          _detect_inflow_spike
          _detect_large_single_credit      → large_single_credit
          _detect_credit_spend_dependency
          _detect_atm_withdrawals          → atm_withdrawal
                                              (sets _is_elevated, _addresses)
        ▼
report.events
        ▼
_build_loan_disbursals (view-model) → templates/bank_report_v2.html
```

### 7.5 Where to change

- **Add EMI keyword variants** → any of `MANDATE_EMI_KEYWORDS`,
  `EMI_NARRATION_KEYWORDS`, `HOME_LOAN_EMI_KEYWORDS` in `config/keywords.py`.
  All flow into `EMI_ALL_KEYWORDS`.
- **EMI grouping (one card per recipient)** →
  `utils/narration_utils.extract_recipient_name` / `clean_narration`.
- **`emi_day` to use mode-of-month instead of one sample** → swap
  `_day_of_month(emi.sample_transaction["date"])` for
  `_recurring_window(emi.dates)["day_range"]`.
- **Bounce attribution** → fix the type tuple (see ⚠ above) and consider a
  stricter than `name.split()[0]` match.
- **Disbursal narrations** → `LOAN_DISBURSEMENT_KEYWORDS`. Add
  `"min_months": N` to the rule for recurrence requirement.
- **Lender extraction** → `_extract_lender` regex.

---

## 8. Top Remitters

Template panel: `#remitters` (lines 452–482). Two tabs each with a doughnut
chart + top-5 ranked list.

### 8.1 View-model — `_build_remitters(report, direction)` (line 777)

1. Filter `report.top_merchants` to `type == direction` (`"C"` or `"D"`).
2. Sort by `total` descending, take top 5.
3. Project rows: `{rank, name (≤40 chars), meta: f"{count} txn", amount: round(total)}`.
4. Return `{labels: [name…], amounts: [total…], rows: [...]}` or `None`.

`labels` + `amounts` drive the doughnut; `rows` drives the ranked list.

### 8.2 Upstream chain

```
data/loader.get_transactions_df()
        ▼
tools/transaction_fetcher.fetch_transaction_summary(cust_id)
        ▼
tools/transaction_fetcher._group_similar_transactions(txns)
        - splits debits (D) and credits (C)
        - drops salary credits (category=='SALARY' or salary narration)
        - calls _fuzzy_group_transactions per direction
        ▼
_fuzzy_group_transactions(txns, direction)
        recipient = extract_recipient_name(tran_partclr) or clean_narration(...)
        sort by recipient (deterministic)
        greedy-merge into existing group via _are_similar
            (fuzz.token_set_ratio on normalize_narration ≥ SIMILARITY_THRESHOLD=70)
        keep groups with len ≥ MIN_GROUP_SIZE  (=1; was 3)
        score = sqrt(count) * log10(1 + total_amount)
        ▼
pipeline/reports/customer_report_builder._get_top_merchants(cust_id)
        sort D and C separately by score desc
        take top 5 each
        ▼
report.top_merchants  (flat list of dicts {name, count, total, avg, type, score})
        ▼
_build_remitters → templates/bank_report_v2.html
```

### 8.3 Two ranking passes — important distinction

1. `_get_top_merchants` ranks by **score** and decides *which 5 survive*.
2. `_build_remitters` re-sorts the surviving 5 by **total** (display order only).

To change *which merchants appear* you must edit pass #1.

### 8.4 Where to change

- **Add/remove counter-parties** → fix `extract_recipient_name` /
  `clean_narration` — blank recipients are dropped, inconsistent ones split
  one merchant into multiple groups.
- **Merge near-duplicates** (e.g. "AMAZON PAY" vs "AMAZON") → adjust
  `SIMILARITY_THRESHOLD` (default 70) at top of
  `tools/transaction_fetcher.py`.
- **Show smaller merchants** → adjust `MIN_GROUP_SIZE` (currently 1).
- **Top-N count** → `[:5]` slices in `_get_top_merchants` *and*
  `_build_remitters`. Both must be bumped together.
- **Include salary in Credit Sources** → remove the salary filter in
  `_group_similar_transactions`.
- **Doughnut palette** → hard-coded in template Chart.js datasets
  (~lines 580–588).

---

## 9. All Transactions Table

Template panel: `#txns` (lines 489–517 + pager block). Headers:
Date · Narration · Mode · Category · Debit · Credit · Balance.

### 9.1 View-model — `_build_transactions` (line 801)

- Sort `cust_df` ascending by `tran_date`.
- `signed = +amt for credits, −amt for debits`; `_running = signed.cumsum()`.
  Starts at 0 (no opening balance).
- Re-sort descending and `head(250)` for the row cap.
- Per row emit:
  - `date` (display: `dd-Mon`), `date_raw` (sort key: `YYYY-MM-DD`).
  - `narration` (≤80 chars), `cls` from `_classify_txn(narration, category)`.
  - `category` (≤24 chars).
  - `debit` / `credit` (numbers; opposite side is `None`).
  - `balance` (rounded running balance).
  - `flag = "bounce"` if narration matches `BOUNCE|RTN|RETURN`.

### 9.2 Mode column

The "Mode" header (renamed from "Class") shows the per-row `cls` value
returned by `_classify_txn`: `salary | emi | upi | fraud | inv | other`.
Mapping is keyword-based on uppercased narration:

```
SALARY | PAYROLL → salary
EMI | BAJAJ | (HDFC + EMI) → emi
DREAM11 | MPL | BETTING | GAMING → fraud
MF | SIP | DIVIDEND | ZERODHA → inv
UPI | IMPS | NEFT → upi
otherwise → other
```

### 9.3 Client-side UX (in template `<script>`)

Three independent layers, all data-driven by `data-*` row attributes:

- **Filter:** `togClass(el)` (chip click) and `filterTx()` (search input)
  flow into `applyTxView()`. Match criteria: `data-cls === activeCls` AND
  `data-text` includes the search query (lowercased). Resets to page 1.
- **Sort:** `sortTx(key)` for `key ∈ {date, debit, credit, balance}`.
  Click toggles direction; new key starts descending. Numeric sort for
  amounts/balance, lexicographic for `date_raw`. Updates ▲/▼ caret on the
  active header. Resets to page 1.
- **Pagination:** page size set on `#txTable[data-page-size]` (currently 20).
  `applyTxView()` computes the current match set, slices `[page*20 :
  (page+1)*20]`, hides others. Pager shows `Showing N–M of K`,
  ‹ Prev | compact page numbers (with `…` ellipsis) | Next ›. Prev/Next
  disable at boundaries; active page is highlighted.

### 9.4 Where to change

- **Row cap** (currently 250) → `head(250)` in `_build_transactions`.
- **Page size** → `data-page-size` attribute on the table.
- **Mode keywords** → `_classify_txn` (view-model bottom).
- **Sortable columns** → add a clickable `<th>` and a `data-<key>` attribute
  per row; numeric vs string handled by the `numeric = (key !== 'date')`
  check in `sortTx`.

---

## 10. Cross-cutting Concerns

### 10.1 `_safe(fn, *args)` (view-model)

Every section builder is wrapped — exceptions are logged at debug level and
return `None`. The template's `{% if bank_v2.<section> %}` then hides the
section. Never throws upward.

### 10.2 Determinism

Per `CLAUDE.md`: numbers, thresholds, and classifications must live in
Python; LLMs only handle prose. Don't move thresholds into prompts. Don't
inline magic numbers; route them through `config/thresholds.py`.

### 10.3 LLM call surface (only two)

1. **Banking Summary** (§4) — `report_summary_chain.py` builds
   `report.customer_review`.
2. **Intent parsing** for the agentic query path — separate from reports.

Both must degrade to a deterministic fallback so reports complete even with
Ollama down.

### 10.4 Schemas as the contract

Cross-module data uses Pydantic models in `schemas/`. Don't pass
`Dict[str, Any]` across layer boundaries — extend the schema. Recent
extension: `dates: List[str]` on every presence-block (Salary/EMI/Bill/Rent).

### 10.5 Renderers are pure

Code in `pipeline/renderers/` must not load data or call analytics — it
consumes already-built schema objects. The view-model is the last place
where data assembly happens.

---

## 11. Open Improvements

Tracked here as future work for whoever picks this doc up next.

### Bugs / known quirks
- **Loan card bounces always 0** (§7.1). Fix the event-type tuple in
  `_build_loan_cards`.
- **`emi_day` uses one sample** (§7.1). Should use
  `_recurring_window(emi.dates)["day_range"]` mode-day for consistency with
  the Recurring Transactions panel.
- **Top-merchant recurring credits emit blank dates** (§6.2). To add
  `last_seen`/`next_expected` we'd need to plumb per-occurrence dates
  through `top_merchants` (today only `count`/`total`/`avg` survive).
- **`_extract_lender` defaults to literal `"Lender"`** when no `from <Name>`
  pattern is present. Could fall back to a token at the start of the
  description, or merge with `LENDER_FRAGMENTS`.

### Sections not yet documented in detail
- **Verdict pill** (top-right of header) — driven by `bank_v2.verdict`.
- **Account quality block** — fed by `tools/account_quality.py`.
- **Bureau side** of the combined report — `bureau_report_builder.py` and
  `compute_checklist` bureau items (B1–B10).
- **Excel export** — `tools/excel_exporter.py` writes one row per customer.
- **Audit trail** — `pipeline/core/audit.py` writes JSONL traces per query.

### Information that would add value here later
- A canonical **glossary** of event-type keys (`ecs_bounce`,
  `mandate_emi`, `loan_disbursal`, …) and the multi-step detectors that
  produce them, with the `_extra_*` fields each one sets.
- A **threshold index** — every magic number used across the report,
  with file/line and current value.
- A **schema map** — which view-model section reads which `CustomerReport`
  field. Useful when extending `CustomerReport` to know what panels need
  updates.
- A **screenshot** of `bank_report_v2.html` annotated with section IDs that
  match the headings in this doc — would make it easier for a small model
  to navigate by visual reference.
