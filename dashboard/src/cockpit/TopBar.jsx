import { Play, Pause, RotateCcw, FastForward, Maximize2, Minimize2, LayoutGrid } from "lucide-react";
import BrandMark from "../components/BrandMark.jsx";
import ThemeSwitch from "../components/ThemeSwitch.jsx";

const SPEEDS = [0.5, 1, 2];
const ghost =
  "flex items-center justify-center rounded-lg border border-slate-300 bg-surface px-2.5 py-2 text-slate-600 transition hover:bg-slate-50";

// Persistent cockpit header: brand + LIVE case meta on the left, the single
// transport (one cursor drives the whole journey) + scrub + present on the right.
// Fixed height — it never moves, so the stage below never jumps.
export default function TopBar({
  meta,
  outcome,
  playing,
  play,
  pause,
  reset,
  skipEnd,
  speed,
  setSpeed,
  cursor,
  length,
  seek,
  presenting,
  togglePresent,
  onExit,
}) {
  const progress = length ? Math.round((cursor / length) * 100) : 0;
  const done = outcome === "APPROVED";

  return (
    <header className="z-30 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-200 bg-surface/95 px-4 py-2.5 backdrop-blur">
      <BrandMark size="sm" subtitle="Agentic Underwriting" />

      <div className="hidden items-center gap-2 md:flex">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute h-full w-full rounded-full bg-primary-500 motion-safe:animate-ping" />
          <span className="relative h-2.5 w-2.5 rounded-full bg-primary-600" />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-primary-700">Live</span>
        <span className="text-xs text-slate-500">
          case <span className="font-medium tabular-nums text-ink">{meta.caseId}</span>
          <span className="mx-1.5 text-slate-300">·</span>
          customer <span className="tabular-nums">{meta.customerId}</span>
          <span className="mx-1.5 text-slate-300">·</span>
          run {String(meta.runId).slice(0, 8)}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={playing ? pause : play}
          className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="hidden sm:inline">{playing ? "Pause" : "Play"}</span>
        </button>
        <button onClick={reset} className={ghost} title="Reset (R)">
          <RotateCcw className="h-4 w-4" />
        </button>
        <button onClick={skipEnd} className={ghost} title="Skip to end (S)">
          <FastForward className="h-4 w-4" />
        </button>

        <div className="hidden items-center gap-1 rounded-lg border border-slate-300 bg-surface p-1 sm:flex">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`rounded-md px-2 py-1 text-xs font-medium transition ${
                speed === s ? "bg-primary-600 text-white" : "text-slate-500 hover:text-ink"
              }`}
            >
              {s}×
            </button>
          ))}
        </div>

        <div className="hidden min-w-[140px] items-center gap-2 lg:flex">
          <input
            type="range"
            min={0}
            max={length}
            value={cursor}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Scrub the journey timeline"
            className="h-1.5 w-32 cursor-pointer accent-primary-600"
          />
          <span className="w-8 text-right text-xs tabular-nums text-slate-500">{progress}%</span>
        </div>

        <button onClick={togglePresent} className={ghost} title="Present (fullscreen)">
          {presenting ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
        {onExit && (
          <button onClick={onExit} className={ghost} title="Back to classic view">
            <LayoutGrid className="h-4 w-4" />
            <span className="ml-1.5 hidden text-sm font-medium lg:inline">Classic</span>
          </button>
        )}
        <ThemeSwitch />
      </div>
    </header>
  );
}
