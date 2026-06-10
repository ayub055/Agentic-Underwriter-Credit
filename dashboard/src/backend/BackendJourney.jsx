import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, XCircle, Maximize2, Minimize2 } from "lucide-react";
import { PHASES, META, buildTimeline } from "./phaseModel.js";
import { usePlayback } from "./usePlayback.js";
import JourneyControls from "./JourneyControls.jsx";
import ExecutionGraph from "./ExecutionGraph.jsx";
import PhaseDetail from "./PhaseDetail.jsx";
import BackendConsole from "./BackendConsole.jsx";
import ResultsStrip from "./ResultsStrip.jsx";

function clock(i) {
  const total = Math.round(i * 0.4);
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function BackendJourney() {
  const timeline = useMemo(() => buildTimeline(PHASES), []);
  const bounds = useMemo(() => {
    const map = {};
    timeline.forEach((s, idx) => {
      if (s.kind === "start") map[s.phaseIndex] = { start: idx, done: idx };
      if (s.kind === "done") map[s.phaseIndex].done = idx;
    });
    return map;
  }, [timeline]);

  const { cursor, playing, speed, setSpeed, play, pause, reset, skipEnd, seek } = usePlayback(timeline.length);
  const [selected, setSelected] = useState(0);
  const [presenting, setPresenting] = useState(false);
  const containerRef = useRef(null);
  const loopRef = useRef(null);

  const statuses = PHASES.map((_, i) =>
    cursor > bounds[i].done ? "done" : cursor > bounds[i].start ? "running" : "waiting"
  );

  let activePhase = 0;
  for (let i = 0; i < PHASES.length; i++) if (cursor > bounds[i].start) activePhase = i;

  useEffect(() => {
    if (playing) setSelected(activePhase);
  }, [activePhase, playing]);

  const entries = [];
  timeline.slice(0, cursor).forEach((s, idx) => {
    if (s.kind === "agent") entries.push({ agent: s.agent, phase: PHASES[s.phaseIndex].phase, time: clock(idx) });
  });

  const dict = PHASES.reduce((acc, p, i) => (cursor > bounds[i].done ? { ...acc, ...p.patch } : acc), {});

  const complete = cursor >= timeline.length;
  const approved = META.outcome === "APPROVED";

  // Keyboard: space play/pause, arrows scrub, R reset, S skip to end.
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON") return;
      if (e.key === " ") {
        e.preventDefault();
        playing ? pause() : play();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        seek(cursor + 3);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        seek(cursor - 3);
      } else if (e.key === "r" || e.key === "R") {
        reset();
      } else if (e.key === "s" || e.key === "S") {
        skipEnd();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing, cursor]);

  // Presentation mode: fullscreen + autoplay + loop.
  const togglePresent = () => {
    const el = containerRef.current;
    if (!presenting) {
      el?.requestFullscreen?.()?.catch?.(() => {});
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.()?.catch?.(() => {});
    } else {
      setPresenting(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      const on = !!document.fullscreenElement;
      setPresenting(on);
      if (on) {
        reset();
        play();
      } else {
        pause();
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    if (presenting && complete) {
      loopRef.current = setTimeout(() => {
        reset();
        play();
      }, 2800);
      return () => clearTimeout(loopRef.current);
    }
  }, [presenting, complete]);

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-[#f6f7fb] ${presenting ? "overflow-auto" : ""}`}
    >
      <main className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-ink">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute h-full w-full rounded-full bg-primary-500 motion-safe:animate-ping" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-primary-600" />
              </span>
              Agentic Underwriting · Live Journey
            </h1>
            <p className="text-sm text-slate-500">
              Real pipeline run · case <span className="font-medium tabular-nums text-ink">{META.caseId}</span> ·
              customer <span className="tabular-nums">{META.customerId}</span> · run {META.runId.slice(0, 8)}
            </p>
          </div>
          <button
            onClick={togglePresent}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            {presenting ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {presenting ? "Exit" : "Present"}
          </button>
        </header>

        <div className="space-y-4">
          <ResultsStrip meta={META} />

          <JourneyControls
            playing={playing}
            play={play}
            pause={pause}
            reset={reset}
            skipEnd={skipEnd}
            speed={speed}
            setSpeed={setSpeed}
            cursor={cursor}
            length={timeline.length}
            seek={seek}
          />

          <ExecutionGraph
            statuses={statuses}
            selected={selected}
            onSelect={(i) => {
              pause();
              setSelected(i);
            }}
          />

          {complete && (
            <div
              className={`flex items-center gap-3 rounded-2xl border p-4 animate-fade-up ${
                approved ? "border-success-200 bg-success-50" : "border-caution-200 bg-caution-50"
              }`}
            >
              {approved ? (
                <CheckCircle2 className="h-6 w-6 text-success-700" />
              ) : (
                <XCircle className="h-6 w-6 text-caution-700" />
              )}
              <div className="text-xs text-slate-600">
                <span className={`text-sm font-semibold ${approved ? "text-success-700" : "text-caution-700"}`}>
                  Outcome: {META.outcome}
                </span>{" "}
                — {approved
                  ? "offer generated and stamped."
                  : "policy approved on credit, but the serviceability gate caught an unaffordable EMI (FOIR > cap) — customer protected."}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
            <section className="lg:col-span-3">
              <PhaseDetail phase={PHASES[selected]} status={statuses[selected]} />
            </section>
            <aside className="lg:col-span-2">
              <div className="h-[70vh] min-h-[420px]">
                <BackendConsole entries={entries} dict={dict} />
              </div>
            </aside>
          </div>
        </div>
      </main>

      {presenting && !complete && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-slate-200 bg-white/95 px-5 py-2.5 shadow-lg backdrop-blur animate-fade-up">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-agent-600">
            {PHASES[activePhase].phase}
          </span>
          <span className="mx-2 text-slate-300">·</span>
          <span className="text-sm font-medium text-ink">{PHASES[activePhase].title}</span>
          <span className="ml-2 text-xs text-slate-500">{PHASES[activePhase].subtitle}</span>
        </div>
      )}
    </div>
  );
}
