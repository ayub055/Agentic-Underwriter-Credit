# Dashboard Data Sources — Field-by-File Map

> Where every value the dashboard renders comes from, grouped by **source file**.
> For each file: the values read out of it, the field path, and which component(s)
> consume/populate them.

The dashboard has **two viewing surfaces** fed from a small set of data files:

- **Backend "Agentic Journey" view** (`src/backend/*`) — driven by `phaseModel.js`,
  which reads the captured real run (`caseState.json` + `trace.json` + `agentNarratives.js`).
- **Customer view** (`src/CustomerView.jsx`, `src/journey/*`, `src/components/*`) —
  driven by `mapCaseState.js`, which reads either the real `caseState.json` or the
  illustrative `caseFixtures.js`.
- **CAM report** (`src/cam/CamReport.jsx`) — reads `camModel.json` standalone.

```
caseState.json ─┬─► phaseModel.js ─► backend/* (BackendJourney, ExecutionGraph, …)
                └─► mapCaseState.js ─► CustomerView ─► journey/agentScript.js ─► journey/*
caseFixtures.js ──► CustomerView (illustrative cases) ─► mapCaseState.js
trace.json ───────► phaseModel.js (timings)
agentNarratives.js ► phaseModel.js (LLM excerpts, report links)
camModel.json ────► cam/CamReport.jsx (12-section memo)
public/reports/*.html ► opened via links from CamReport / CamReadyToast / backend
```

---

## 1. `src/data/realRun/caseState.json`  *(the captured real run — provenance "real")*

Top-level keys: `customer_id, case_id, run_id, intake, address, branches, summary,
ml, policy, decision, finalize, outcome, stage_status, warnings, hard_fail, audit_trace_path`.

Consumed by **`phaseModel.js`** (backend view) and **`mapCaseState.js`** (customer view),
plus directly by **`CustomerView.jsx`** as the "Captured run" case option.

### 1a. Read by `src/backend/phaseModel.js` → exported as `PHASES`, `META`, `VIZ`, `PROVENANCE`

| Field path | Used as / where it surfaces |
|---|---|
| `case_id`, `run_id`, `customer_id` | `META`, Phase 0 "open_case", `VIZ.form.caseId`, finalize audit path |
| `outcome` | `META.outcome`, Finalize/Notify `DECISION` line, VerdictCard |
| `warnings[]` | `META.warnings`; filtered per-phase (`intake*`, `layer2*`, `orchestrator*`, `finalize*`) |
| `finalize.provenance_map` | `PROVENANCE` export; every `line(..., provKey)` chip across phases |
| `finalize.model_versions` | Finalize phase "model_versions pinned" line |
| `finalize.push_sent`, `finalize.decision` | Finalize/Notify `push_sent`, patch |
| `intake.loan_amount_req` | Phase 0 form amount, `VIZ.form.amount`, presenter notes |
| `intake.tenure_req` | Phase 0 tenure, `VIZ.form.tenure` |
| `intake.declared_income` | Phase 0 income, `VIZ.form.income`, `VIZ.foir.income`, `VIZ.verdict.income` |
| `intake.employer` | Phase 0 employer line, `VIZ.form.employer` |
| `intake.address.{line,city,pincode}` | Phase 0 address line, `VIZ.form.address` |
| `intake.consent_captured` | Phase 0/1 `consent_captured`, `VIZ.form.consent` |
| `intake.kyc_verified` | Phase 1 `kyc_verified` |
| `address.{score,band,pd_adjustment,model_version,review_flag,reasons[]}` | Phase 1 sub-steps + agents + data; `VIZ.address.*` |
| `address.{prob_good,confidence}` | `VIZ.address.probGood/confidence` |
| `branches.bureau.{status,report_path,summary,elapsed_s}` | Phase 2A status/link/data; `VIZ.branches` |
| `branches.banking.{status,report_path,summary,elapsed_s}` | Phase 2B status/link/data; `VIZ.branches` |
| `branches.bureau.summary.{cibil_score,npa_flag,total_exposure,max_dpd_overall,enq_count}` | Phase 2A data lines; `VIZ.verdict.cibil` |
| `branches.banking.summary.{salary_income_detected,existing_emi_debits,affluence_band,spend_category,bounce_count}` | Phase 2B data lines |
| `summary` (whole) | Phase 2 `patch.summary` |
| `ml.{pd_score,risk_band,affluence_segment,income_used,income_source,foir_existing}` | Phase 3 ML data lines |
| `policy.{layers[],result,approved_segment,ai_assisted_flag}` | Phase 4 agents/data; `VIZ.policy`, `VIZ.verdict.policy*` |
| `policy.layers[].{layer,passed,detail,reason_code}` | Per-layer PASS/BREACH rows |
| `decision.{selected,serviceable,foir_proposed,offer_amount,offer_tenure,offer_irr,offer_emi}` | Phase 5 data lines; `VIZ.verdict.*`, `VIZ.foir.*` |
| `stage_status` *(via trace; see below)* | — |

> Note: `VIZ.*.foirCap = 0.50` and address band thresholds (`75/50`) are **hard-coded
> constants** in `phaseModel.js`, not from the file.

### 1b. Read by `src/data/mapCaseState.js` → `mapCaseStateToView(cs)` (customer view model)

| Field path | Mapped to view field | Where consumed |
|---|---|---|
| `outcome` | `status` (via `OUTCOME_TO_STATUS`), `outcome` | CustomerView state routing, agentScript reveal |
| `case_id` | `applicationId` | state cards |
| `stage_status.{intake,layer2,decision}` | `tracker[].state` | JourneyProgress / tracker UI |
| `address.{score,band,review_flag,reasons}` + `intake.address.city` | `addressQuality.*` | agentScript "Identity & Address" moment |
| `intake.declared_income` | `applicant.income` | EMI share, affordability, agentScript |
| `intake.loan_amount_req` | `applicant.requestedAmount` | greeting, headline |
| `intake.tenure_req` | `applicant.requestedTenure` | greeting |
| `summary.{cibil_score,salary_income_detected,existing_emi_debits,total_exposure,bounce_count,enq_count,npa_flag}` | `summary.*` | agentScript "Income & Banking" / "Credit History" moments |
| `decision.{foir_proposed,offer_amount,offer_irr,offer_emi,offer_tenure,processing_fee}` | `affordability.*`, `offer.*` | OfferSimulator, MetricsGrid, reveal |
| *derived*: `foir_proposed*income − offer_emi` | `affordability.existingObligations` | affordability narration |

---

## 2. `src/data/caseFixtures.js`  *(illustrative cases — badge "illustrative")*

Hand-written CaseState-shaped fixtures, keyed `approved` / `review` / `rejected`.
Imported by **`CustomerView.jsx`** as selectable non-real cases; passed through the
**same `mapCaseStateToView()`** as the real run (so the field paths in §1b apply).

| Field group provided per fixture | Consumed via |
|---|---|
| `customer_id`, `case_id`, `outcome` | CustomerView case label, mapCaseState routing |
| `intake.{loan_amount_req,tenure_req,declared_income,address.{city,pincode,ownership}}` | mapCaseState → applicant/addressQuality |
| `address.{score,band,review_flag,reasons[]}` | mapCaseState → addressQuality |
| `stage_status.{intake…finalize}` | mapCaseState → tracker states |
| `decision.{selected,serviceable,contactible,foir_proposed,offer_amount,offer_tenure,offer_irr,offer_emi,processing_fee}` | mapCaseState → offer/affordability |

> These fixtures have **no `summary` or `ml`** block, so the customer view falls back
> to declared figures (agentScript handles the null case).

---

## 3. `src/data/realRun/trace.json`  *(per-stage/branch timings — 10 records)*

Records of `kind ∈ {stage, branch, fold}` with `{stage|branch, status, elapsed_s, error}`.
Read **only by `src/backend/phaseModel.js`**.

| Field | Used as |
|---|---|
| record where `kind==="stage" && stage==="layer2"` → `elapsed_s` | `layer2Elapsed` (Phase 2 wall-clock, presenter note) |
| record where `kind==="branch" && branch===X` → `elapsed_s` | per-branch elapsed tag (`VIZ.branches[].elapsed`, modelTags) |
| all `kind==="stage"` → `{stage, elapsed_s}` | `VIZ.stages`, `META.wallClockS` (summed) |

---

## 4. `src/data/realRun/agentNarratives.js`  *(verbatim LLM analyser output)*

Exports `AGENT_NARRATIVES.{banking,bureau}`. Read **only by `phaseModel.js`**
(Phase 2A/2B), then the narrative object is passed into `backend/parts.jsx`.

| Field path | Used as / where |
|---|---|
| `banking.consoleLines[]`, `bureau.consoleLines[]` | Phase 2 agent console rows (`▸` lines) |
| `*.{agent,model,elapsed,excerpt,findings[]}` | branch `narrative` block (panel text) |
| `*.source` | cited source artifact label |
| `*.artifact` | link target → opened as `BASE_URL + artifact` in `parts.jsx:151` |

---

## 5. `src/data/realRun/camModel.json`  *(the CAM view-model — generated by `journey/cam/build.py`)*

Read **only by `src/cam/CamReport.jsx`** (the 12-section memo). Each `provenance.<key>`
stamps a chip; `—` is shown wherever the value is null.

| Model slice | Fields | CAM section that renders them |
|---|---|---|
| `meta` | `case_id, run_id, customer_id, outcome, generated_at, product` | header + verdict badge |
| `application` | `loan_amount_req, tenure_req, product, location, pincode, lead_reference, sub_source, existing_kotak_customer, purpose_of_loan, dma_name` | §1 General Detail |
| `applicant` | `name, age, marital_status, residence_type, qualification, color_band, salary_account_flag, salary_disb_same, address_*` | §2.1 Applicant Detail |
| `employment` | `employer, designation, category, years_in_current_company, total_experience, income_band` | §2.2 Employment Detail |
| `loan.{system_approval,applied,sanctioned}` | `amount, tenure, irr, emi, foir, unsecured_foir, multiplier` | §3 Loan Details (3-col table) |
| `financial` | `net_salary, current_fixed_obligation, monthly_obligation[], obligation_months[], fcu_trigger, max_serviceable_emi, declared_income, income_used, foir_existing, total_exposure` | §4 Financial Summary |
| `obligations` | `obligations[], totals, monthly_exposure` | §5 Obligation (table + sparkline) |
| `banking_matrix` | `months[], rows[].{feature,values[],prov}` | §6 Banking Summary (feature×month) |
| `banking.emis[]` | `name, amount, frequency` | §6 EMI debits sub-table |
| `verification[]` | `label, status, detail, prov_key` | §7 Verification (10-item) |
| `deviations.rows[]` | `deviation_type, applicant_type, rule_description, credit_approval_level, system_decision` | §8 Deviation table |
| `credit_conditions[]` | `applicant_type, condition_for, condition_name, remarks` | §9 Credit Condition table |
| `loan_amount` | `final_amount, final_tenor, rejection_reason, reject_datetime` | §10 Loan Amount |
| `credit_manager` | `decisioned_by, ai_assisted, decision_date, reviewed_by, approved_by, remarks, model_versions` | §11 Credit Manager |
| `pd_sheet` | `remarks, pd_score, risk_band, affluence_segment, affluence_value, pd_provenance, policy_features` | §12 PD Sheet Remarks |
| `provenance{}` | dotted-key → `real\|derived\|mock\|placeholder` | provenance bar + per-row chips |

> Generated server-side: `journey/cam/build.py::build_cam_model(case_state, cam_data, sal_slip)`
> folds `journey/output/<case_id>/{case_state,cam_data,sal_slip}.json` into this shape;
> `journey/_tools/capture_for_ui.py` copies it into `src/data/realRun/`.

---

## 6. `public/reports/*.html`  *(static artifacts opened in a new tab)*

Not imported as data — linked to by URL (`import.meta.env.BASE_URL + path`).

| File | Opened from |
|---|---|
| `reports/cam_report.html` | `cam/CamReport.jsx` (PDF/Tab buttons), `cam/CamReadyToast.jsx` |
| `reports/banking_agent_report.html` | `agentNarratives.banking.artifact` → `backend/parts.jsx` |
| `reports/bureau_agent_report.html` | `agentNarratives.bureau.artifact` → `backend/parts.jsx` |
| `branches.{bureau,banking}.report_path` (from caseState) | `phaseModel.js` branch `report` link |

---

## Non-data inputs (for completeness — values defined in code, not data files)

| File | What it defines |
|---|---|
| `src/backend/phaseModel.js` | Hard-coded constants: FOIR cap `0.50`, address band thresholds `75/50`, presenter notes, agent-call descriptors |
| `src/journey/agentScript.js` | Customer-facing copy (`buildScript`, `DECISION_NARRATION`, `REVEAL`, `CHIPS`) computed from the mapped view |
| `src/backend/IntakeChecksCallout.jsx` | The 10-item intake checklist (`CHECKS`) — also the canonical list mirrored in CAM §7 |
| `src/lib/format.js` | `formatINR/formatEMI/formatPct/formatTenure/emDash` formatters used everywhere |
| `src/lib/tones.js` | `provPill` + tone maps for provenance chips |
