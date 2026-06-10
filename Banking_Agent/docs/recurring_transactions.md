# Recurring Transactions Section

Source: `pipeline/renderers/bank_v2_view_model.py` (lines 648–714, helpers 858–888).
Template: `templates/bank_report_v2.html` (recurring panel ~line 360).

## How rows are built

### Debits — `_build_recurring_debits` (line 648)
Pulls from the already-built `CustomerReport`:
- `report.emis` → category `EMI`, class `emi`, amount = `emi.amount`.
- `report.bills` → category `Utility`, class `cat`, amount = `bill.avg_amount`.
- `report.rent` (single) → category `Rent`, class `cat`, amount = `rent.amount`.

Each item carries a `frequency` (int, count of occurrences) and a `sample_transaction` (`{date, ...}`).

### Credits — `_build_recurring_credits` (line 659)
- `report.salary` → 1 row, name from `rg_salary_data.rg_sal.merchant` (RGS) or salary narration. `last_seen` from `salary.latest_transaction` / `sample_transaction`.
- `report.top_merchants` where `type == "C"` and `count >= 2` (skipping anything that name-matches the salary narration) → category `Other`, class `inv`. **No date** is currently emitted — `last_seen` and `next_expected` are blank.

### Per-row shaping — `_recurring_row` (line 699)
Returns: `name` (≤40 chars), `category`, `category_class` (CSS tag), `frequency` (label), `last_seen` (short date), `next_expected` (short date), `avg_amount` (rounded).

## Helpers

- `_frequency_label(count)` (858): `>=5 → "Monthly"`, `>=2 → "Recurring"`, else `"Ad-hoc"`. **Loses the underlying count.**
- `_fmt_short_date(value)` (866): formats as `dd-Mon` (no year).
- `_next_expected(last_seen_short)` (878): reconstructs date against `datetime.now().year` and adds **30 days** as a flat heuristic. Year-boundary fragile (Dec → Jan crosses the year but year is taken from "now"). Single point estimate, not a window.

## Current behavior (after update)

### Schema change
`SalaryBlock`, `EMIBlock`, `BillBlock`, `RentBlock` now carry `dates: List[str]` — every occurrence date for the item (YYYY-MM-DD). Populated in `pipeline/reports/customer_report_builder.py`:
- EMI: per-group dates from `supporting_transactions[*]['date']`.
- Bill / Rent: dates from `supporting_transactions`.
- Salary: collected via `_get_all_salary_dates()` (mirrors the latest-salary scan).

### Window helper
`_recurring_window(dates)` in `bank_v2_view_model.py` returns:
- `day_range = (mode_day - 5, mode_day + 5)`, clamped to [1, 31] — mode day-of-month ± 5.
- `last_seen` = max(dates) formatted `dd-Mon-yyyy`.
- `median_gap_days` = median gap between sorted consecutive occurrences (defaults to 30 if <2 dates or all zero gaps).
- `next_window` = `[last_seen + median_gap − 5, last_seen + median_gap + 5]` formatted `dd-Mon → dd-Mon-yyyy`.

### Column outputs
- **Frequency**: `"Monthly · day 5-15"` (label · day-of-month range).
- **Last seen**: actual latest occurrence date with year, e.g. `12-Apr-2026`.
- **Next expected**: window string, e.g. `07-May → 17-May-2026`.

### Out of scope
Top-merchant recurring credits (`top_merchants` with type=C, count≥2) still emit blank `last_seen` / `next_expected`; per current scope.
