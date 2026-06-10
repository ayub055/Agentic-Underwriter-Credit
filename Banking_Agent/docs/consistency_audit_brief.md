# Consistency Audit Brief (handoff prompt for a new chat)

> Paste the block below as the opening prompt for a new session. It encodes the
> current architecture, the canonical homes, the golden-verification workflow,
> and the mission: a file-by-file correctness + consistency pass.

---

You are a senior Python engineer continuing a consolidation effort on
`BANK_ANALYSER_SIMPLIFIED` (at `/Users/ayyoob/Desktop/BANK_ANALYSER_SIMPLIFIED`),
a deterministic banking-report tool. A large restructure is already done; you are
now doing a **file-by-file correctness + consistency pass**. Work on git branch
`restructure/consolidation`.

**Mission:** Go through each source file. For every function, (a) verify its
computation is *correct* (against `docs/kpi_calculations.md`,
`docs/recurring_transactions.md`, and the data semantics), and (b) ensure every
**report field / metric is computed exactly one way, in one canonical place** —
no two files deriving the "same" number differently. When you find a field
computed divergently in >1 place, consolidate it onto the canonical source.

**Architecture (current ground truth — also in `CLAUDE.md`):**
- **One report path:** `main.py` → `tools/bank_report.generate_bank_report` →
  `pipeline/reports/customer_report_builder.build_customer_report` →
  `report_summary_chain` (LLM review) →
  `pipeline/renderers/combined_report_renderer.render_combined_report`. HTML-only,
  `bank_v2` theme. The `--chat` path lives in `pipeline/core/`.
- **Canonical homes (route everything through these — never re-derive):**
  - Row-level predicates → `tools/rules.py` (`is_salary_credit`, `is_emi_debit`,
    `is_loan_disbursal`, `is_recurring_category`, `is_self_transfer`,
    `is_atm_debit`).
  - Category roles / L1↔L2 → `tools/category/registry.py` (`has_role`,
    `categories_with_role`, `l2_canonical`, `l1_of`).
  - Thresholds → `config/thresholds.py`; keywords → `config/keywords.py`;
    prompts → `config/prompts.py`.
  - Narration helpers (recipient extraction, `are_similar`, `like_to_regex`,
    fuzzy grouping) → `utils/narration_utils.py`; formatting/mask →
    `utils/helpers.py`.
  - Review checklist → `pipeline/reports/checklist_builder.py` →
    `CustomerReport.checklist`.
- `CustomerReport` (`schemas/customer_report.py`) is the single contract;
  renderers are **pure** (no data loading / analytics).

**Known hot-spots for field divergence to scrutinize** (some already unified,
re-verify nothing regressed): salary detection, EMI detection, loan-disbursal,
self-transfer, ATM, recurring, account-quality thresholds, average/closing
balance, income/credit aggregation (`analytics.get_total_income` vs
`get_credit_statistics`), credit/debit ratio, monthly/date bucketing (`str[:7]`
scattered), merchant/recipient grouping (3 impls in `transaction_fetcher`,
`merchant_features`, `category/resolver` — still divergent, deferred).

**Mandatory verification workflow (a golden harness already exists; `.golden/`
is gitignored):**
1. Baseline check before editing: `zsh .golden/verify.sh 698167220` (diffs a
   canonical, list-sorted, LLM-stripped `CustomerReport` JSON).
2. After each change: re-run `verify.sh`; also regenerate HTML via
   `python main.py --customer 698167220` and diff
   `reports/customer_698167220_report_v2.html` against
   `.golden/report_698167220_v2.html` (ignore the `generated`/timestamp lines).
3. A change must be **behavior-preserving** unless it's an intended correctness
   fix — in which case inspect the exact JSON diff, confirm it's correct (not a
   regression), then refresh the golden baseline (`cp` the new outputs into
   `.golden/`) and explain the delta in the commit.
4. Commit per logical change with a clear message; end messages with
   `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

**Rules of engagement:**
- **Do not break things.** Prefer the smallest behavior-preserving consolidation.
  Verify every step.
- When two formulas compute the same field and you can't tell which is correct,
  **STOP and ask the owner** which is canonical before unifying (this changes
  numbers).
- Conventions: deterministic core / LLM periphery (LLMs only parse intent + write
  prose, always with a fallback); config is the single source of truth;
  schema-first across layer boundaries; never hardcode category strings or inline
  a rule/threshold.
- Runtime: needs local **Ollama** (`mistral`, `llama3.2`) for narration — but it's
  fail-soft, so numeric work proceeds without it. The CSV loader prints to stdout
  (the golden dump silences it). Verification anchor customer: **698167220**.
- Reference `git log` on `restructure/consolidation` for what's already been done
  and why; `docs/` for calculation definitions.

Start by listing the files you'll audit and the order, then go one file at a
time: state what each function computes, flag any incorrect or divergent field
computation, propose the canonical fix, apply it, and verify against the golden
before moving on.

---

## Caveat for the next pass

The golden harness currently covers only customer `698167220`. For a thorough
correctness audit, add 2–3 more customer IDs to the golden set (re-run
`.golden/dump_report.py <id>` and capture each) so consolidations are verified
across varied data profiles, not just one customer.

## Restructure already completed (for context)

16 commits on `restructure/consolidation` (baseline `1e86f93`): retired the
planner path, PDF output (`fpdf2`), the bureau subsystem, and the v1 `bank`
theme; collapsed `features/` and `pipeline/extractors/` into `tools/`; grouped
category modules into `tools/category/`; centralized rules (`tools/rules.py`),
thresholds (`config/thresholds.py` `AQ_*`), similarity/regex
(`utils/narration_utils`), and the checklist (`checklist_builder.py`); dropped
orphaned schemas (`bureau_report.py`, `loan_type.py`, `customer_persona`,
`sections_meta`); unified the salary, self-transfer, and ATM rules. Two intended
behavior changes verified along the way: NACH `FINANCE EMI` rows now tag EMI not
OTHER; merchant_features excludes own-account `FROM/TO OWN` transfers via the
registry `Self_Transfer` role.

**Deferred items** (open consolidation work): merge the 3 merchant-grouping
implementations; unify the ~30 inline `cust_id`/`dr_cr_indctor` dataframe filters
+ add a shared `parse_txn_date`; decide `credit_debit_ratio` (count) vs
`cash_flow` (amount); clarify the two senses of "recurring" (registry role vs
event "observed in >= N months").
