import { Play, Pause, RotateCcw, FastForward } from "lucide-react";

const SPEEDS = [0.5, 1, 2];

const ghostBtn =
  "flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50";

export default function JourneyControls({
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
}) {
  const progress = length ? cursor / length : 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={playing ? pause : play}
        className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        {playing ? "Pause" : "Play"}
      </button>
      <button onClick={reset} className={ghostBtn}>
        <RotateCcw className="h-4 w-4" /> Reset
      </button>
      <button onClick={skipEnd} className={ghostBtn}>
        <FastForward className="h-4 w-4" /> Skip
      </button>
      <div className="ml-1 flex items-center gap-1 rounded-lg border border-slate-300 bg-white p-1">
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
      <div className="ml-auto flex min-w-[160px] flex-1 items-center gap-2 sm:max-w-[280px]">
        <input
          type="range"
          min={0}
          max={length}
          value={cursor}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Scrub the journey timeline"
          className="h-1.5 flex-1 cursor-pointer accent-primary-600"
        />
        <span className="w-9 text-right text-xs tabular-nums text-slate-500">
          {Math.round(progress * 100)}%
        </span>
      </div>
      <span className="hidden w-full text-right text-[10px] text-slate-400 lg:block">
        space play/pause · ←/→ scrub · R reset · S skip · ? help
      </span>
    </div>
  );
}
