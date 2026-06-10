# Credit Journey Dashboard — UI Requirements & Setup

React single-page app with two views:

- **Backend · Agentic Journey** — playback of a real pipeline run for demos: animated
  execution DAG (Bureau ∥ Banking fan-out), per-phase visualizations (parallel-overlap
  bars, L1–L6 policy waterfall, FOIR gauge, stage gantt), live agent-call console,
  scrubber + keyboard shortcuts, fullscreen Present mode.
- **Customer · Approval Hook** — the agent-narrated customer journey: analysis replay,
  moment rail, outcome cards (approved / review / rejected), "ask the agent" chips,
  live affordability simulator. See `CUSTOMER_JOURNEY_REDESIGN.md` for design rationale.

## Requirements

| Requirement | Version |
|---|---|
| Node.js | ≥ 18 (developed on v25) |
| npm | ≥ 9 |

All JS dependencies are pinned exactly in `package.json` / `package-lock.json`:

| Package | Version | Purpose |
|---|---|---|
| react / react-dom | 18.3.1 | UI runtime |
| lucide-react | 0.439.0 | Icon set |
| vite | 5.4.21 | Dev server & bundler |
| @vitejs/plugin-react | 4.7.0 | React fast-refresh |
| tailwindcss | 3.4.19 | Styling (custom palette in `tailwind.config.js`) |
| postcss / autoprefixer | 8.5.15 / 10.5.0 | CSS pipeline |

No other runtime dependencies — animations are hand-rolled CSS/SVG (no motion
library), and all data comes from local fixtures (`src/data/`), including a real
captured pipeline run in `src/data/realRun/`.

## Setup & run

```bash
cd dashboard
npm ci          # reproducible install from the lockfile
npm run dev     # http://localhost:5173
npm run build   # production bundle -> dist/
npm run preview # serve the production build
```

## Project layout

```
src/
  App.jsx                 # view switcher (backend / customer)
  backend/                # mission-control demo (DAG, viz, console, playback)
  journey/                # customer-facing agentic journey components
  components/             # customer outcome cards, sidebar, offer widgets
  data/                   # fixtures + CaseState -> view-model mapper
  lib/                    # formatting + motion utilities (typewriter, count-up)
```

The Python pipeline that produces the real run data has its own dependencies —
see `../requirements.txt`.
