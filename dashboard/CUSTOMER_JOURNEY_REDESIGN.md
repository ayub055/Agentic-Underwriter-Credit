# Customer Journey Redesign — "Guided by the Agent"

The customer view (`src/CustomerView.jsx` → `src/journey/`) is redesigned from a static,
state-card UI into a narrative-driven experience where the Aolis credit agent visibly
works, explains, and guides. Everything below is implemented and driven by the real
mapped `CaseState` (`src/data/mapCaseState.js`) — no copy is generic if the data can
make it personal.

---

## 1. Reimagined journey flow

The screen is no longer "a result page with a sidebar." It is one connected story in
four beats, orchestrated by `JourneyExperience.jsx` + `useJourneyPlayback.js`:

| Beat | What the user sees | Intent |
|---|---|---|
| **Entry — Greeting** | The agent introduces itself and recaps *their* application ("your ₹8,00,000 application over 60 mo"). Skeleton file "pulls up." | Establish a guide and confirm context before anything is asked of the user. |
| **Engagement — Replay** | The agent replays its analysis moment by moment (Identity → Income & Banking → Credit History → Decision). Findings tick in live; the moment rail fills; narration streams in plain language. Skippable at any time. | Build momentum and trust: the decision is *earned on screen*, not delivered cold. The user learns what was checked and why. |
| **Action — Reveal** | The outcome card lands as the story's payoff (count-up amount / handoff timeline / affordability explainer), and the narrator pivots to a single **next best action** pill. | Every status has one obvious primary action; the agent names it instead of leaving the user to scan. |
| **Outcome — Dialogue** | "Ask the agent" chips answer the questions users actually have; on rejection, the simulator re-runs real FOIR math live as they drag. | Keep the relationship open. A decision is the start of a conversation, not a dead end. |

The flow degrades gracefully: `prefers-reduced-motion` (or "Skip to result") jumps
straight to the reveal with full content.

## 2. Visual language

- **Color** — The existing trust palette stays (teal `primary`, stone neutrals, semantic
  `success`/`progress`/`caution`). One addition: an **`agent` violet** (`agent-50…700`)
  reserved exclusively for intelligence — the narrator panel, live analysis, insight
  callouts, simulator. The user subconsciously learns: *violet = the agent is working
  for me*. Brand teal keeps owning navigation and primary CTAs, so the system stays
  cohesive and AA-contrast.
- **Type** — Inter, unchanged hierarchy philosophy: one outsized hero number
  (`text-5xl/6xl` tabular), `text-2xl/3xl` headlines, `text-sm` body, 10–11px uppercase
  tracked labels for wayfinding. Numbers are always `tabular-nums`.
- **Spacing & layout** — Single `max-w-4xl` column for the narrative beats (rail →
  narrator → canvas), splitting into the 2:1 card/support grid only at the reveal.
  Generous `p-6/p-8` cards, `rounded-2xl` surfaces, hairline `stone-200` borders.
- **Iconography** — lucide throughout, 2–2.4 stroke. Each journey moment owns an icon
  (ShieldCheck, Wallet, BarChart3, Scale); Sparkles is the agent's mark.
- **Motion** (`tailwind.config.js`) — A small, purposeful vocabulary:
  `fade-up` (content entering, 0.5s spring-like ease), `pop` (achievements: checks,
  badges), `shimmer` (work in progress), `pulse-ring` (the agent thinking),
  typewriter streaming (the agent speaking), rAF count-up (the payoff number).
  Rule: motion only ever communicates *state change or liveness*, never decoration —
  and every animation respects `motion-safe`/reduced-motion.

## 3. Agentic UI patterns (all implemented)

1. **Persistent narrator** (`Narrator.jsx`, `AgentAvatar.jsx`) — one voice across the
   whole journey: streams text, shows thinking dots while working, and ends with a
   "next best action" pill. `aria-live="polite"` so screen readers follow the story.
2. **Journey replay with live findings** (`AnalysisCanvas.jsx`, `useJourneyPlayback.js`)
   — visible "thinking": facts tick in with check pops while skeleton rows hold space
   for what's still being checked. Always skippable.
3. **Moment rail** (`MomentRail.jsx`) — dynamic progress as a horizontal spine; the
   outcome node stays a dashed unknown until the reveal colors it. "Where am I / what's
   next" is answerable at a glance at any second.
4. **Smart summaries** (`agentScript.js`) — every narration is computed from the case:
   salary credits, requested amount/tenure, the EMI that broke affordability. Plain
   language, first person, no jargon.
5. **Proactive insight callouts** — approved: "your EMI is 15% of income, 31% with
   obligations — inside the 40% healthy zone"; rejected: "your existing ₹26,434/mo of
   EMIs is what's squeezing the budget." The agent surfaces the *why* before the user asks.
6. **Conversational moments** (`ExplainChips.jsx`) — tappable questions ("Why this
   rate?", "Will this affect my score?") answered inline in the agent's voice.
7. **Live co-pilot simulator** (`OfferSimulator.jsx`) — on rejection the agent re-runs
   the pipeline's own FOIR math in real time as the user drags amount/tenure, with a
   comfort meter, instant verdicts, and a CTA that only arms when the numbers work.
8. **Human handoff made visible** (`ReviewCard.jsx`) — manual review is narrated as a
   warm escalation ("a senior underwriter has my full analysis attached"), with a live
   handoff timeline instead of an anonymous spinner.

## 4. Before / after rationale — key screens

**Approved.** *Before:* the amount and metrics appeared instantly; impressive but
weightless, and the sidebar tracker was passive furniture. *After:* the approval is the
climax of a replay the user just watched; the amount counts up; an agent insight
contextualizes the EMI against their income; chips answer rate/EMI/disbursal questions;
the offer-lock badge and unchanged ActionZone keep the e-sign path obvious.
Why: a decision the user *watched being made* is trusted and accepted faster.

**Under review.** *Before:* a spinner, a countdown, and "we're verifying your details" —
the anxious state with the least information. *After:* the agent says exactly what
happened (cleared checks, one grey-zone result, routed to a named role), shows a 3-step
handoff timeline with the current step alive, commits to pinging the user, and chips
defuse the scary questions (score impact, "do I need to do anything?").
Why: uncertainty, not waiting, is what kills conversion in this state.

**Rejected.** *Before:* a polite no with generic alternatives and a dumb slider that
checked nothing. *After:* a plain-number explanation of why the EMI didn't fit, then the
agent turns the screen into a workspace — live affordability simulation, a tip about
which existing EMI is squeezing the budget, and a CTA that activates only on workable
numbers. Why: a rejection that teaches and simulates converts a dead end into a
retained customer with a concrete path back.

**Journey chrome.** *Before:* a vertical sidebar tracker (Identity / Income / Offer) that
duplicated state and never changed. *After:* the moment rail — horizontal, animated,
tied beat-for-beat to the narration, ending in an outcome node that resolves on reveal.
The sidebar now carries only support + FAQs, where it earns its place.
