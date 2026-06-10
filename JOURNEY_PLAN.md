# Agentic Credit Journey — Full Pipeline Plan (Layer 2 first)

> **Revision note (2026-06-08):** Reworked after a code-level review of both analyser repos
> **and a product-owner decision pass (D1–D7 locked, table below)**. Also adds a **4th outcome
> `MANUAL_REVIEW`** (policy mid-zone, distinct from `INSUFFICIENT_DATA`) to back the customer
> dashboard's *review* state. Key changes vs the first
> draft: (a) the mapper is pinned against a **real dumped payload before** `state.py`/`mappers.py`
> are written (several field paths in the first draft were wrong/absent); (b) subprocess uses a
> **file-based result channel + enum-safe encoder**, not "one JSON line to stdout"; (c) added a
> **data-sufficiency terminal state**, **two FOIRs**, **declared-income precedence**, **provenance
> tagging**, **split max_dpd**, and a **scoped determinism contract**; (d) **Stage 2 renders every
> case up front** (product decision D3) using the repos' render entries. Changed/added items are
> tagged **[CHANGED]** / **[NEW]** inline.

## Context

`credit_journey.html` is a polished **demo** of a 6-stage agentic credit-underwriting
pipeline driven by dummy data. The goal is to make it **real**: a *journey agent* that
orchestrates separately-built analysers + greenfield stages and produces, from real customer
data, everything the demo visualizes (UI deferred).

Two analysers exist locally as sibling repos and are wrapped as-is (untouched). **Per D3, Stage 2
calls each repo's *render entry*** — one call returns the structured report **and** writes the
rendered HTML/PDF artifact **and** runs the LLM narrative:
- **`Banking_Agent/`** → `tools/bank_report.generate_bank_report(customer_id, theme="bank_v2") -> (CustomerReport|None, path)` (Pydantic v2, `schemas/customer_report.py`; also writes an Excel row + `customer_review` narrative).
- **`Bureau_Agent/`** → `tools/combined_report.generate_combined_report_pdf(customer_id, theme="original", save_intermediate=True) -> (BureauReport|None, path)` (dataclass, `schemas/bureau_report.py`).
- Lighter, render-free builders exist (`pipeline/reports/customer_report_builder.build_customer_report`,
  `pipeline/reports/bureau_report_builder.build_bureau_report`) — **used only by A0 field-pinning**,
  not on the live path, since D3 wants artifacts for every case anyway.

Both run on the same `anaconda3` interpreter, both use Ollama (langchain-ollama, sync
`.invoke()`), both are deterministic-core / LLM-periphery / fail-soft per their `CLAUDE.md`s.

### The fact that shapes execution
Both repos expose **identically-named top-level packages** (`config/`, `tools/`, `pipeline/`,
`schemas/`, `utils/` — and both even ship `schemas/customer_report.py`) with absolute imports.
They **cannot be co-imported into one process**. Hence the journey uses **two execution
mechanisms**:
1. **Subprocess isolation** — for foreign/colliding code (**Banking + Bureau**; the address
   scorer is *not* subprocessed yet — see below). Each runs in its repo as cwd + on `sys.path`,
   calls the render entry, builds an **explicit summary dict** from the returned report, and
   writes it over a **file-based channel** (artifact path included).
2. **Journey-native deterministic Python (in-process)** — for all greenfield stages
   (intake glue, ML, policy, decision, finalize). Fast, no collision, no subprocess overhead.

### Decisions locked — product owner (per stage)
| Stage | Build | Execution | Real / mock |
|---|---|---|---|
| **1 Intake** | greenfield in `journey/` | native; **input = known `customer_id`** | KYC + EPFO = deterministic mocks; **address = simple `verified` stub now** (real per-customer model + inference file assumed local; wiring deferred, seam left); sal-slip = **RAG placeholder**; **consent stub gate precedes Stage 2 (D7)** |
| **2 Banking ∥ Bureau** | wrap existing repos | **subprocess, asyncio parallel** | real; **render entry → data + artifact + narrative every case (D3)**; explicit summary dict per branch |
| **2.5 Data sufficiency** | greenfield | native | **[NEW]** gate: if both branches unusable → terminal *insufficient-data*, skip 3–5 |
| **3 ML** | greenfield | native deterministic | **placeholder PD (`provenance`), scorecard seam (D2)**; risk-band / affluence / `foir_existing`; income = **declared (D1)**; `policy_features` placeholder |
| **4 Policy** | greenfield | native deterministic | demo-semantic L1–L6 rules + placeholder thresholds; emits **APPROVED / DECLINED / MANUAL_REVIEW**; mid-zone → MANUAL_REVIEW (LLM hook stub now, `ai_assisted_flag`) |
| **5 Decision** | greenfield | native deterministic | gates (consent confirmed) + amortization math + placeholder pricing table; computes `foir_proposed` |
| **6 Finalize** | greenfield | native | **local** audit pack + **provenance map [NEW]**; **copies the artifacts rendered at S2**; push = mock/log; S3+KMS seam left |

### Decisions locked — D1–D7 (this pass)
| # | Question | **Decision** | Plan impact |
|---|---|---|---|
| D1 | Income precedence for FOIR/affluence | **Declared income** is canonical (fallback to banking-detected only if declared is `None`, to avoid None-arithmetic) | `MLBlock.income_source="declared"` |
| D2 | Stage-3 PD source | **Placeholder formula now, real-scorecard adapter seam left** (reuse `Banking_Agent/tools/scorecard.py` later) | `pd_provenance="placeholder"` |
| D3 | Render scope | **Every case, at Stage 2** (use render entries) | S2 not LLM-free; branches queue on Ollama (see notes) |
| D4 | Throughput | **One case at a time** | subprocess-per-call; worker-pool transport seam left |
| D5 | `max_dpd` aggregation | **Both, separate fields** — `max_dpd_overall` + `max_dpd_unsecured` | Layer2Summary + Policy reference both |
| D6 | `case_id` stability | **Derived/idempotent** `PL-YYYY-hash(customer_id)` + random `run_id` | reruns reuse `output/<case_id>/` |
| D7 | Consent timing | **Stub gate before Stage 2** | Intake sets `consent_captured`; gates bureau pull |

- **Location:** new **`journey/`** package at `Credit_Journey/` root; imports neither analyser repo.
- **Current focus / detail:** **Layer 2** is built and detailed first; later stages have an
  agreed design here and are detailed as each is reached.

---

## Package layout

```
Credit_Journey/
  Banking_Agent/        # untouched
  Bureau_Agent/         # untouched
  journey/              # NEW — orchestration; imports neither repo directly
    __init__.py
    config.py           # repo paths, interpreter, timeouts, model tags, pricing table,
                        #   thresholds, income-precedence order (declared-first)
    state.py            # CaseState + per-stage sub-models + BranchResult/Status (Pydantic)
    provenance.py       # [NEW] field-provenance enum + ProvenanceMap helper
    stages/
      base.py           # Stage ABC: name + async run(case)->case, wrapped w/ status/timing/audit/fail-soft
      intake.py         # S1: mock KYC/EPFO + consent stub gate + address verified-stub + sal-slip placeholder
      layer2.py         # S2: asyncio.gather banking∥bureau adapters -> fold -> validate
      sufficiency.py    # [NEW] S2.5: data-sufficiency gate -> may set terminal insufficient-data
      ml.py             # S3: placeholder PD/band/affluence/foir_existing/policy_features (deterministic)
      policy.py         # S4: L1–L6 waterfall, short-circuit on decline, per-layer reason_code
      decision.py       # S5: selection->serviceability(foir_proposed)->consent->offer calc
      finalize.py       # S6: stamp + copy S2 artifacts + assemble local audit pack + mock push
    adapters/           # subprocess-isolated foreign callables
      base.py           # [CHANGED] Transport ABC (send request -> JSON); SubprocessTransport impl;
                        #   file-based result channel + separate stderr capture; timeout + fail-soft
      banking.py        # banking branch spec (render entry: generate_bank_report)
      bureau.py         # bureau branch spec  (render entry: generate_combined_report_pdf)
      address_ner.py    # [DEFERRED SEAM] real address scorer: load local per-customer model + run
                        #   inference file -> address_zone_score. Not wired now; intake returns verified-stub.
      sal_slip_rag.py   # RAG placeholder adapter
    runners/
      _run_branch.py    # [CHANGED] in-subprocess entry: sys.path-insert repo, import render entry,
                        #   call it, build EXPLICIT summary dict, write JSON (+artifact path) to --out, log to stderr
      _encode.py        # [NEW] JSON encoder handling enum KEYS/values, Decimal, datetime
    mappers.py          # [CHANGED] explicit-summary dict -> Layer2Summary; pinned to A0 real dump
    validator.py        # schema + enumerated cross-branch/cross-stage invariants -> warnings + 1 hard-fail class
    audit.py            # journey-local JSONL trace (cannot reuse repo audit due to namespace)
    output/             # per-case audit packs:  output/<case_id>/
    logs/               # journey JSONL traces
    __main__.py         # smoke: full journey + layer2-only
    _tools/dump_payload.py  # [NEW] A0: dump a real builder payload for field-pinning
```

---

## Execution DAG (orchestrator)

```
customer_id
  └─ JourneyAgent.run(customer_id) -> CaseState
       S1 Intake        (native; KYC/EPFO mock ∥ address verified-stub ∥ sal-slip placeholder;
                         consent stub gate — bureau pull blocked if not captured)        [D7]
         ▼
       S2 Layer 2       (asyncio.gather: banking-subprocess ∥ bureau-subprocess,
                         render entries → data + artifact + narrative) -> fold -> validate [D3]
         ▼
       S2.5 Sufficiency (native) ── both branches unusable ──┐                            [NEW]
         ▼ (usable)                                          │
       S3 ML            (native; placeholder PD; foir_existing)│
         ▼                                                    │
       S4 Policy        (native; DECLINE / MANUAL_REVIEW short-circuit ──┐)  │
         ▼ (clean approve)                                            │   │
       S5 Decision      (native; foir_proposed + offer)               │   │
         ▼                                                             │   │
       S6 Finalize  ◄──────────────────────────────────────────────────┴───┘
                        (stamp APPROVED / MANUAL_REVIEW / DECLINED / INSUFFICIENT_DATA
                         + copy S2-rendered artifacts + local audit pack + mock push)
```

**Optimal-run notes (why this shape):**
- **Only Layer 2 is parallel** — two independent heavy I/O + pandas branches. Everything
  else has a hard data dependency on the prior stage, so it's sequential.
- **S1** is now all-native and cheap (KYC/EPFO mocks + address verified-stub + sal-slip
  placeholder) → runs sequentially in-process; no `asyncio.gather` needed until the real
  address model is wired (then it becomes the third subprocess via the deferred seam).
- **Parallelism caveat (D3):** because Stage 2 uses the **render entries**, each branch runs the
  LLM narrative → both hit the **single local Ollama and serialize**. Wall-clock overlap therefore
  comes from the deterministic pandas/feature work + render I/O, **not** the narration. This is the
  accepted cost of rendering every case up front; it is expected, not a bug. (If S2 latency ever
  matters, the lever is to move narration/render to Finalize — explicitly rejected for now.)
- The **decision** stays deterministic regardless: only **numeric** report fields are mapped into
  `Layer2Summary`; the LLM narrative lives in the artifact and is excluded from the determinism contract.
- **Subprocess only where required** (Banking, Bureau, address-NER repo). Native stages run
  in-process for speed and simple CaseState threading.
- **Four outcomes [CHANGED]:**
  - **APPROVED** = full path through S5 (clean policy pass → offer generated).
  - **DECLINED** = valid policy outcome → skip S5, finalize declined with deciding layer's reason_code.
  - **MANUAL_REVIEW [NEW]** = policy **mid-zone** — enough data to assess, but the case lands
    neither in clean-approve nor clean-decline (the L1–L6 waterfall's grey band, surfaced via the
    Policy LLM mid-zone hook). Skip S5 (no offer yet), finalize as *pending human adjudication*.
    `ai_assisted_flag=True` when the LLM hook routes it. **Distinct from INSUFFICIENT_DATA** (which is
    *can't* assess; this is *assessed → needs a human*). This is the customer-facing **review** screen.
  - **INSUFFICIENT_DATA** = both Layer-2 branches unusable (CIBIL *and* banking absent)
    → skip S3–S5, finalize "unable to assess." Never run ML/Policy on all-None.
  - *Customer dashboard mapping:* `APPROVED→approved`, `MANUAL_REVIEW→review`, `DECLINED→rejected`;
    `INSUFFICIENT_DATA` is operational (not its own customer screen) — folds into the review screen for now.
- **Fail-soft**: a *single* Layer-2 branch failure → `degraded/failed` + warning, journey continues
  with partial data (the sufficiency gate decides whether partial is enough).

---

## Contracts (`journey/state.py`, schema-first, journey-owned — no foreign imports)

```python
class BranchStatus(str, Enum): ok="ok"; degraded="degraded"; failed="failed"
class StageStatus(str, Enum):  waiting="waiting"; running="running"; done="done"; failed="failed"; skipped="skipped"
class Outcome(str, Enum):       approved="APPROVED"; manual_review="MANUAL_REVIEW"; declined="DECLINED"; insufficient="INSUFFICIENT_DATA"  # [CHANGED] +MANUAL_REVIEW
class Provenance(str, Enum):    real="real"; derived="derived"; mock="mock"; placeholder="placeholder"      # [NEW]

class BranchResult(BaseModel):
    branch: str                       # "banking" | "bureau" | "address_ner"
    status: BranchStatus
    summary: Optional[dict] = None    # [CHANGED] EXPLICIT mapped dict from the subprocess (not a blind report dump)
    report_path: Optional[str] = None # rendered artifact path (render entry runs at S2, per D3)
    model_used: Optional[str] = None  # Ollama tag (narrative runs at S2)
    error: Optional[str] = None
    elapsed_s: float = 0.0

class IntakeBlock(BaseModel):         # S1 (mostly mock now)
    loan_amount_req: Optional[float]=None; tenure_req: Optional[int]=None
    declared_income: Optional[float]=None; employer: Optional[str]=None      # declared = canonical income (D1)
    kyc_verified: Optional[bool]=None; employment_verified: Optional[bool]=None
    consent_captured: Optional[bool]=None                               # [NEW/D7] gates Stage 2 bureau pull
    sal_gross: Optional[float]=None; sal_net: Optional[float]=None       # sal-slip RAG placeholder
    address_verified: bool=True                                         # [CHANGED] simple stub now (=True)
    address_zone_score: Optional[float]=None                            # real model output — deferred (left None)

class Layer2Summary(BaseModel):       # flat keys the demo + future UI consume
    cibil_score: Optional[int]=None; bureau_risk_grade: Optional[str]=None
    max_dpd_overall: Optional[int]=None; max_dpd_unsecured: Optional[int]=None   # [CHANGED/D5] split
    npa_flag: Optional[bool]=None; enq_count: Optional[int]=None; total_exposure: Optional[float]=None
    bureau_persona: Optional[str]=None
    salary_income_detected: Optional[float]=None; existing_emi_debits: Optional[float]=None
    bounce_count: Optional[int]=None; affluence_band: Optional[str]=None
    cashflow_consistency: Optional[str]=None; negative_flags: Optional[str]=None; spend_category: Optional[str]=None

class MLBlock(BaseModel):             # S3
    pd_score: Optional[float]=None; pd_provenance: Provenance=Provenance.placeholder   # [D2]
    risk_band: Optional[int]=None
    affluence_value: Optional[float]=None; affluence_segment: Optional[str]=None
    income_used: Optional[float]=None; income_source: str="declared"                   # [D1]
    foir_existing: Optional[float]=None                                                # existing-obligations only
    policy_features: dict = {}        # placeholder dict for now

class PolicyLayerResult(BaseModel):
    layer: str; passed: bool; reason_code: str; detail: Optional[str]=None
class PolicyBlock(BaseModel):         # S4
    result: Optional[str]=None        # APPROVED | DECLINED | MANUAL_REVIEW   [CHANGED]
    approved_segment: Optional[str]=None; decline_layer: Optional[str]=None
    review_reason: Optional[str]=None  # [NEW] why the mid-zone routed to manual review
    layers: list[PolicyLayerResult]=[]; ai_assisted_flag: bool=False  # True when LLM mid-zone hook fires

class DecisionBlock(BaseModel):       # S5
    selected: Optional[bool]=None; serviceable: Optional[bool]=None; contactible: Optional[bool]=None
    foir_proposed: Optional[float]=None                                                # post-offer FOIR
    offer_amount: Optional[float]=None; offer_tenure: Optional[int]=None
    offer_irr: Optional[float]=None; offer_emi: Optional[float]=None; processing_fee: Optional[float]=None

class FinalizeBlock(BaseModel):       # S6
    decision: Optional[Outcome]=None; audit_pack_path: Optional[str]=None
    push_sent: bool=False; model_versions: dict={}; provenance_map: dict={}            # [NEW]

class CaseState(BaseModel):
    customer_id: int
    case_id: str                      # [D6] DERIVED: PL-YYYY-<hash(customer_id)>  (idempotent)
    run_id: str                       # [D6] random per execution (traceability, not identity)
    intake: IntakeBlock = IntakeBlock()
    branches: dict[str, BranchResult] = {}
    summary: Layer2Summary = Layer2Summary()
    ml: MLBlock = MLBlock()
    policy: PolicyBlock = PolicyBlock()
    decision: DecisionBlock = DecisionBlock()
    finalize: FinalizeBlock = FinalizeBlock()
    outcome: Optional[Outcome] = None                                                  # [NEW] terminal state
    stage_status: dict[str, StageStatus] = {}
    warnings: list[str] = []
    hard_fail: Optional[str] = None                                                    # [NEW] validator escalation
    audit_trace_path: Optional[str] = None
```

### Subprocess contract (`runners/_run_branch.py`) **[CHANGED — was "one JSON line to stdout"]**
- Args: `--repo <path> --branch <name> --customer-id <id> --out <tmpfile>`.
- Child: insert repo on `sys.path`, `chdir` to repo, import the **render entry**
  (`generate_bank_report` / `generate_combined_report_pdf`), call it, then **build the explicit
  summary dict** (only the mapped fields) and `json.dump({summary, report_path, model_used,
  elapsed, ok, error}, default=_encode)` to `--out`.
- **Result travels via the `--out` file, not stdout.** stdout/stderr are captured separately
  and logged (pandas/langchain/tqdm prints can no longer corrupt the protocol).
- Exit code: `0` ok, non-zero on exception (last stderr lines surfaced into `BranchResult.error`).
- Repo render paths are **relative** (e.g. `reports/customer_<id>_report_v2.html`) and overwritten
  per rerun → the returned `report_path` is repo-relative; **Finalize copies it** into `output/<case_id>/`.
- `_encode.py` handles **enum keys** (`Dict[LoanType, …]` in BureauReport!), enum values,
  `Decimal`, `datetime`. A blind `json.dumps(asdict(report), default=str)` would **raise** on
  the enum-keyed `feature_vectors` — do not use it. (We emit only the small summary dict anyway.)

### Mapper field map (`mappers.py`) — **PIN AT A0, do not trust these paths blind [CHANGED]**
> The first draft's paths were largely guesses; code inspection found several wrong/absent.
> **Phase A0 dumps a real payload and pins every path before this file is written.** Rule
> unchanged: do **not** fabricate — leave `None` + warn if a source field is absent.

- **Bureau** (`BureauReport`, dataclass):
  - `enq_count ← tradeline_features.unsecured_enquiries_12m` — ✅ **confirmed** (`features/tradeline_features.py:45`).
  - `total_exposure ← …total_outstanding_amount` — ⚠️ **name corrected** (was `total_outstanding`; actual `features/bureau_features.py:21`).
  - `max_dpd_overall` / `max_dpd_unsecured` — ⚠️ **[D5] both derived.** DPD is per-product
    (`max_dpd_6m_cc/pl`, …). Overall = worst across all; unsecured = worst across PL/CC. Pin exact source on A0.
  - `cibil_score`, `npa_flag` — ⚠️ **source UNVERIFIED** (`tu_score` / `has_delinquency` not found
    in schemas; likely computed elsewhere). Locate on A0; leave `None`+warn until pinned.
  - `bureau_persona ← raw_loan_profile/persona`, `bureau_risk_grade ← key_findings severity` — derived; pin on A0.
- **Banking** (`CustomerReport`, Pydantic v2):
  - `salary_income_detected ← salary.avg_amount` — ✅ confirmed.
  - `existing_emi_debits ← sum(emis[*].amount)` — confirmed (EMIBlock.amount).
  - `cashflow_consistency ← risk_indicators.income_stability_score` (bucketed) — confirmed.
  - `negative_flags ← risk_indicators.risk_flags`; `spend_category ← top(category_overview)` — confirmed.
  - `affluence_band ← account_quality["classification"]` — ⚠️ `account_quality` is `Optional[Dict[str,Any]]`
    (untyped blob, `customer_report.py:154`); treat as a **defensive dict-key lookup**, not a typed field.
  - `bounce_count ← derived from risk_flags/events` — derived; pin on A0.

---

## Build roadmap (each phase independently testable)

**Phase A — Layer 2 stitch (current focus, fully detailed):**
0. **[NEW] A0 field-pinning:** `journey/_tools/dump_payload.py` runs each render-free **builder**
   (`build_customer_report`, `build_bureau_report`) for `698167220` in-subprocess and dumps the
   serialized structure (cheap, no LLM). **Eyeball it; pin every mapper path** (esp.
   `cibil_score`/`npa_flag` source, `max_dpd_overall`/`unsecured`, `total_outstanding_amount`).
   *Mappers/`state.py` are written against this, not against guesses.*
1. `journey/config.py`, `journey/state.py` (models above), `journey/provenance.py`.
2. `journey/runners/_run_branch.py` + `runners/_encode.py` — render-entry call, explicit-summary
   build, file-based result, enum-safe encoder. Test by hand per repo.
3. `journey/adapters/base.py` (Transport ABC + SubprocessTransport: timeout, stderr capture,
   fail-soft) + `banking.py` + `bureau.py`. Testable against `698167220`.
4. `journey/mappers.py` — fold explicit summaries → `Layer2Summary` using the **A0-pinned** paths.
5. `journey/validator.py` (enumerated invariants + 1 hard-fail) + `journey/audit.py` (JSONL).
6. `journey/orchestrator.py::run_layer2` — `asyncio.gather` fan-out + fold + validate + audit → `CaseState`.
7. `journey/__main__.py` smoke (Layer-2 only).

**Phase B — Stage framework:** `stages/base.py` (Stage ABC: status/timing/audit/fail-soft wrapper)
+ `orchestrator.run()` threading one `CaseState` through the DAG; refactor Layer-2 into
`stages/layer2.py`; add `stages/sufficiency.py` (S2.5) and the four-outcome terminal logic
(APPROVED / MANUAL_REVIEW / DECLINED / INSUFFICIENT_DATA).

**Phase C — S1 Intake:** `stages/intake.py` (deterministic KYC/EPFO mocks + **consent stub gate
before S2, D7** + **address `verified`-stub**: `address_verified=True`, `address_zone_score=None`),
`adapters/address_ner.py` (**deferred seam** — real per-customer model load + inference file, not
wired now), `adapters/sal_slip_rag.py` (placeholder). Seeds `IntakeBlock`.

**Phase D — S3 ML:** `stages/ml.py` — **placeholder PD tagged `pd_provenance` (D2)** /risk-band/
affluence / **`foir_existing`** from Layer-2 + intake; **income = declared, fallback banking-detected
(D1)** recorded in `income_used`/`income_source`; `policy_features` placeholder; **scorecard adapter seam left**.

**Phase E — S4 Policy:** `stages/policy.py` — L1–L6 waterfall (demo semantics + placeholder
thresholds; L2/L3 reference both `max_dpd_overall`/`max_dpd_unsecured`), per-layer `reason_code`,
short-circuit on decline. **Emits `MANUAL_REVIEW`** for mid-zone cases (deterministic grey-band rule
now; LLM mid-zone hook stub, `ai_assisted_flag` + `review_reason`) → skips S5, finalized as pending.

**Phase F — S5 Decision:** `stages/decision.py` — selection/serviceability gates computing
**`foir_proposed`** (post-offer EMI) + consent-confirmed + EMI amortization + placeholder pricing
table (`config.py`).

**Phase G — S6 Finalize:** `stages/finalize.py` — stamp `Outcome`; **copy the S2-rendered artifacts**
(banking HTML, bureau PDF — repo-relative, so copy now) into `output/<case_id>/`; assemble bundle
(artifacts, sal-slip JSON placeholder, policy trace, decision log, model versions, **provenance map**,
CaseState snapshot, journey JSONL); mock push (log entry); S3+KMS adapter seam left.

---

## Additional features folded in (realizing the demo's cross-cutting primitives)
- **Validator** (`validator.py`) — schema + **enumerated cross-branch/cross-stage invariants** →
  `warnings`, with **one hard-fail class**. Concrete invariants:
  - CIBIL present but bureau branch `failed` → contradiction (warn).
  - `salary_income_detected` vs `declared_income` divergence > threshold → warn.
  - `max_dpd_*` present but `enq_count` None (or vice-versa) → warn.
  - **HARD FAIL:** policy `APPROVED` while bureau branch `failed` *and* `cibil_score is None`
    ("approve-on-blind") → set `hard_fail`, force outcome to `INSUFFICIENT_DATA`.
- **Journey audit trace** (`audit.py`) — JSONL, one record per stage/branch + fold.
- **Provenance map [NEW]** — per surfaced field: real / derived / mock / placeholder, persisted in
  the audit pack so a placeholder-PD decline is never read as a real adjudication.
- **Model-version capture** — `BranchResult.model_used` (narrative at S2) + `FinalizeBlock.model_versions`.
- **`case_id` (derived/idempotent) + `run_id` (random) + per-stage `StageStatus`/timing (D6).**

---

## Verification
- **A0 (field-pin):** dumped builder payloads for `698167220`; every mapper path confirmed
  present (or explicitly marked absent → `None`+warn). No path is taken on faith.
- **Layer 2 (Phase A):** `python -m journey 698167220 --layer2` → populated `Layer2Summary`;
  fresh artifacts in both repos' `reports/`; `journey/logs/` JSONL with 2 branch + 1 fold records.
- **Subprocess robustness:** inject a stray `print()`/warning in a branch → result still parses
  (file channel); kill/timeout a branch → `failed` + `error` from stderr, no hang.
- **Encoder:** bureau branch with enum-keyed `feature_vectors` serializes without raising.
- **Fail-soft + sufficiency:** break one adapter → that branch `failed`, other completes, partial
  `CaseState`. Break **both** → `outcome=INSUFFICIENT_DATA`, S3–S5 `skipped`, no None-arithmetic crash.
- **Full journey (Phases B–G):** `python -m journey 698167220` → `CaseState` all blocks populated;
  `output/<case_id>/` audit pack assembled (artifacts **copied**, not referenced); provenance map present.
- **Idempotency (D6):** rerun same `customer_id` → same `case_id`/`output` dir; new `run_id`.
- **Policy short-circuit:** craft inputs that trip an L-layer → `DECLINED`, `decline_layer` set, S5 skipped.
- **Manual review:** craft a mid-zone (grey-band) case → `policy.result=MANUAL_REVIEW`, `review_reason` set,
  `ai_assisted_flag` reflects the hook, S5 skipped, S6 stamps `MANUAL_REVIEW` (maps to the customer review screen).
- **Field fidelity:** spot-check 3–4 `Layer2Summary`/`MLBlock` values against freshly rendered reports.
- **Determinism (scoped):** repeat run → identical **numeric decision fields** (`Layer2Summary`,
  `ml`, `policy.result`, `decision` offers) and identical `case_id`. LLM narrative, timestamps,
  `run_id`, and file mtimes are **excluded** from the contract.

## Open items to confirm at build time (no fabrication)
1. **Address scorer (deferred)** — real path is: load the per-customer model saved locally + run
   the address inference file → `address_zone_score`. **Stubbed `verified=True` for now**; model
   location + inference-file signature pinned when the seam is wired.
2. **Bureau `cibil_score`/`npa_flag` sources** (`tu_score`/`has_delinquency` not found in schemas)
   + `bureau_persona`/`bureau_risk_grade` derivations + banking `bounce_count` — pinned at **A0**.
3. **Per-product → `max_dpd_overall`/`max_dpd_unsecured`** exact source fields (D5) — pinned at A0.
4. **Specific Layer-2 variables** S3 consumes for PD/affluence/FOIR.

## Out of scope (now)
UI/UX wiring of `credit_journey.html`; real Karza/EPFO/consent/push/S3 integrations; **real address
model + inference wiring** (verified-stub now, seam only); real policy/pricing matrices; the real
scorecard wiring (seam only, D2); replacing Ollama with SageMaker
(demo branding is aspirational); a persistent per-repo worker pool (transport seam left, D4); any
edits inside `Banking_Agent/` or `Bureau_Agent/`.
