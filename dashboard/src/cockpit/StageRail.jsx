import { Check, Loader2 } from "lucide-react";
import { CHAPTERS, CHAPTER_ICON, PIPELINE_COUNT } from "./chapterModel.js";

// Vertical journey rail — one row per chapter, status-driven, click to seek.
// Lives in a fixed-width column with its own scroll, so the rest of the cockpit
// never reflows when it advances.
function Row({ chapter, status, active, onSelect }) {
  const Icon = CHAPTER_ICON[chapter.id];
  const done = status === "done";
  const running = status === "running";
  const num = chapter.chapterIndex + 1;

  return (
    <button
      onClick={onSelect}
      aria-label={`${chapter.title} — ${status}`}
      className={`group relative flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
        active
          ? "border-primary-600 bg-surface shadow-sm ring-1 ring-primary-600/25"
          : running
          ? "border-agent-300 bg-agent-50/60"
          : "border-transparent hover:border-slate-200 hover:bg-surface"
      }`}
    >
      <span
        className={`relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border transition-colors ${
          done
            ? "border-primary-200 bg-primary-50 text-primary-700"
            : running
            ? "border-agent-500 bg-agent-50 text-agent-700 shadow-[0_0_14px_rgba(124,58,237,.25)]"
            : "border-slate-200 bg-surface text-slate-300"
        }`}
      >
        {Icon ? <Icon className="h-4 w-4" strokeWidth={2} /> : num}
        {done && (
          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary-700 text-white">
            <Check className="h-2 w-2" strokeWidth={4} />
          </span>
        )}
        {running && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-agent-500 motion-safe:animate-ping" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
            {chapter.phase}
          </span>
          {chapter.parallel && (
            <span className="rounded border border-caution-200 bg-caution-50 px-1 text-[8px] font-bold text-caution-700">
              ∥
            </span>
          )}
        </span>
        <span
          className={`block truncate text-[13px] font-medium ${
            done || running || active ? "text-ink" : "text-slate-400"
          }`}
        >
          {chapter.title}
        </span>
      </span>

      {running ? (
        <Loader2 className="h-3.5 w-3.5 flex-shrink-0 text-agent-500 motion-safe:animate-spin" />
      ) : (
        <span
          className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
            done ? "bg-primary-500" : "bg-slate-200"
          }`}
        />
      )}
    </button>
  );
}

export default function StageRail({ statuses, selected, onSelect }) {
  return (
    <nav className="flex h-full flex-col overflow-y-auto border-r border-slate-200 bg-slate-50/60 px-3 py-3">
      <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        Pipeline
      </div>
      <div className="space-y-0.5">
        {CHAPTERS.slice(0, PIPELINE_COUNT).map((c) => (
          <Row
            key={c.id}
            chapter={c}
            status={statuses[c.chapterIndex]}
            active={selected === c.chapterIndex}
            onSelect={() => onSelect(c.chapterIndex)}
          />
        ))}
      </div>

      <div className="mb-2 mt-4 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        Outcome
      </div>
      <div className="space-y-0.5">
        {CHAPTERS.slice(PIPELINE_COUNT).map((c) => (
          <Row
            key={c.id}
            chapter={c}
            status={statuses[c.chapterIndex]}
            active={selected === c.chapterIndex}
            onSelect={() => onSelect(c.chapterIndex)}
          />
        ))}
      </div>
    </nav>
  );
}
