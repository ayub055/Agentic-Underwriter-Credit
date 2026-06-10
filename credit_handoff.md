# Agentic Credit Journey — Layer-2 Stitch · Design Handoff

> **Status:** Design agreed, not yet built. One blocker open (Bureau repo path).
> **Scope right now:** Stitch the **second layer only** — Banking ∥ Bureau as parallel
> calls — orchestrated by a journey agent. UI/UX deferred. Other layers (intake, ML,
> policy, decision, finalize) are planned later.
> **Source of truth for the target UX:** `credit_journey.html` (currently demo/dummy data).

---

## 1. Goal

Turn the demo in `credit_journey.html` into a real, agent-orchestrated journey for
**real customers**. Separately-built analysers (Bureau Analyser, Bank Analyser) get
**stitched together** and driven by a **journey agent**. The journey agent's job is to
produce everything the demo shows — but from real data.

**Current focus:** the second layer — Banking + Bureau running as **parallel** calls.

### Constraints (set by product owner)
- Leave UI/UX for later.
- Focus on *how to show* all of this, plus additional features.
- **Do not assume anything — clarify at every stage.**
- Build an optimised flow (implementation comes after).

---

## 2. What `credit_journey.html` actually models

A **6-stage agentic underwriting pipeline** over a shared "case dict" (Redis in the demo),
with an agent-call log and a per-stage validator.

| Stage | What it does | Nature |
|---|---|---|
| **1. Intake** | App form + KYC (Karza) + EPFO + sal-slip parse + address tag | Tools + LLM extractors |
| **2A. Bureau** ∥ | CIBIL fetch → bureau analyzer → risk grade / persona | **Parallel branch** |
| **2B. Banking** ∥ | CBS fetch → txn tagger → 100 features → banking analyzer | **Parallel branch** |
| **3. ML** | Scorecard PD, affluence, FOIR, policy features | Deterministic, no LLM |
| **4. Policy** | L1–L6 waterfall (Python rules, RBI DLG) | Deterministic + 1 LLM mid-zone |
| **5. Decision** | Selection → serviceability → consent → offer calc | Sequential gates |
| **6. Finalize** | Stamp + audit pack (S3) + push notify | Side-effects |

**Cross-cutting primitives** (callables that recur at every stage):
- **Orchestrator / journey agent** — decides which tool/agent to call.
- **Validator** — schema + sanity checks on every LLM output.
- **Case-dict store** — shared, enriched state.
- **Audit logger** — JSONL trace. *(This repo already has `pipeline/core/audit.py`.)*

---

## 3. Callable sub-modules mapped to THIS repo (`BANK_ANALYSER_SIMPLIFIED`)

| Demo piece | Exists here? | Where |
|---|---|---|
| **2B Banking analyzer** | ✅ Yes | `tools/bank_report.generate_bank_report(cid)` → `CustomerReport` |
| **Audit trace** | ✅ Yes | `pipeline/core/audit.py` (JSONL) |
| **Scorecard / affluence (Stage 3)** | ⚠️ Partial | `tools/scorecard.py`, `tools/account_quality.py` |
| **2A Bureau analyzer** | ❌ No | Separate repo (path pending) |
| **Journey agent / orchestrator** | ❌ No | To build (`journey/`) |
| **Validator** | ❌ No | To build |
| **Shared case-dict contract** | ❌ No | To build (`journey/state.py`) |

Bank Analyser entry contract (verified):
`generate_bank_report(customer_id, theme="bank_v2") -> (CustomerReport | None, path)`.

---

## 4. Decisions locked (Q&A with product owner)

| # | Question | Decision |
|---|---|---|
| 1 | Where does the Bureau Analyser live? | **Separate repo on this machine** (path pending) |
| 2 | How does the agent invoke each analyser? | **In-process library calls** |
| 3 | Runtime for parallel branches | **Local Python `asyncio`** |
| 4 | Shared-state contract | **Unified `CaseState` Pydantic model** |
| 5 | Fan-out identifier | **Same `customer_id` for both branches** |
| 6 | How CaseState holds branch output | **Native objects + thin flat mapper** |
| 7 | If one branch fails | **Fail-soft — degrade branch, continue, record warning** |

**Flagged tension:** "in-process" + "separate repo" ⇒ both analysers must import cleanly
into **one venv**. If the Bureau repo pins conflicting deps (pandas / pydantic / langchain),
either reconcile versions or fall back to **subprocess** for the bureau branch only. To be
confirmed when the bureau repo is read.

---

## 5. Proposed layer-2 design (the stitch)

New top-level package, isolated from the existing report pipeline:

```
journey/
  state.py        # CaseState Pydantic model — the shared "case dict"
  orchestrator.py # JourneyAgent: asyncio fan-out + fail-soft + audit
  adapters/
    banking.py    # wraps tools.bank_report.generate_bank_report
    bureau.py     # wraps <bureau repo>.<entry>   (PENDING PATH)
  mappers.py      # native report objects -> flat CaseState.summary
```

**Parallel flow:**
```
customer_id
   │
   ▼  JourneyAgent.run_layer2(customer_id)
   ├─ asyncio.gather(
   │     to_thread( banking_adapter.run )   # blocking pandas/LLM → thread
   │     to_thread( bureau_adapter.run )
   │  )
   ├─ each adapter returns BranchResult{ ok, report|None, error|None, elapsed }
   ├─ mappers.fold(case_state, banking_result, bureau_result)
   └─ audit.write(layer2 trace)  →  returns enriched CaseState
```

**`CaseState` sketch** (banking fields real; bureau fields TBD from the real repo):
```python
class BranchStatus(str, Enum): ok / degraded / failed

class CaseState(BaseModel):
    customer_id: int
    banking: Optional[CustomerReport]     # native object (this repo)
    bureau:  Optional[BureauReport]       # native object (bureau repo) — TBD
    summary: Layer2Summary                # flat demo 2A/2B keys for rendering
    branch_status: dict[str, BranchStatus]
    warnings: list[str]
    audit_trace_path: Optional[str]
```

`Layer2Summary` = the flat keys the demo shows (and a future UI consumes), e.g.
`cibil_score`, `bureau_risk_grade`, `max_dpd`, `npa_flag`, `enq_count_l6m`,
`salary_income_detected`, `existing_emi_debits`, `affluence_band`,
`cashflow_consistency`, `negative_flags`, `spend_category`.

**Explicit design choices (open to correction):**
1. Adapters are the **only** place importing a concrete analyser → a future swap to
   subprocess/HTTP touches one file, not the orchestrator.
2. Blocking analysers run via `asyncio.to_thread`; Ollama calls serialize on the local
   server, so real parallelism is mostly pandas/feature work + I/O.
3. `mappers.py` (native → flat) is exactly what the future `credit_journey` UI consumes;
   the demo's dict keys become the `Layer2Summary` schema.
4. Audit reuses `pipeline/core/audit.py` (JSONL): one record per branch + one for the fold.

---

## 6. Build order for layer 2 (each independently testable)

1. `journey/state.py` — `CaseState` + `Layer2Summary` + `BranchResult`
   (banking fields real, bureau placeholder).
2. `journey/adapters/banking.py` — wrap `generate_bank_report`, return `BranchResult`.
   **Testable today** against customer `698167220`.
3. **[needs path]** `journey/adapters/bureau.py` — wrap real bureau entry.
4. `journey/mappers.py` — fold both into `Layer2Summary`.
5. `journey/orchestrator.py` — asyncio fan-out + fail-soft + audit.
6. Smoke test: `JourneyAgent.run_layer2(698167220)` → printed `CaseState`.

---

## 7. Open blockers / next questions

1. **Bureau repo absolute path** — needed to lock the 2A adapter + `BureauReport` /
   `Layer2Summary` fields against the real output (no fabrication). *(One true blocker.)*
2. Confirm package name `journey/` and that it's a **new package in this repo**
   (vs. a separate orchestrator repo).

---

## 8. Convention guardrails (from this repo's `CLAUDE.md`)

- Deterministic core, LLM periphery — no business logic in prompts.
- Schema-first — Pydantic across layer boundaries, no `Dict[str, Any]`.
- Config is single source of truth (`config/`).
- Renderers are pure.
- Fail-soft on LLM/network failure.

These apply to `journey/` too: `CaseState` is schema-first; the orchestrator is
deterministic glue; analysers stay behind adapters.
