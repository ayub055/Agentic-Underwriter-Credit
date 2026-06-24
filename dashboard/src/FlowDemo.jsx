import { useEffect, useMemo, useRef, useState } from "react";
import { PHASES, META, buildTimeline } from "./backend/phaseModel.js";
import { usePlayback } from "./backend/usePlayback.js";
import ExecutionGraph from "./backend/ExecutionGraph.jsx";
import IntakeChecksCallout from "./backend/IntakeChecksCallout.jsx";
import TelePdCallout from "./backend/TelePdCallout.jsx";
import TopBar from "./cockpit/TopBar.jsx";
import NodeLiveCard from "./flow/NodeLiveCard.jsx";

// "Flow Demo" — the whole credit journey as one horizontal DAG. A single cursor
// walks node to node; the active node lights up and pops a live "happening now"
// card. Startup-launch feel: everything on one screen, smooth transitions.
export default function FlowDemo({ onExit }) {
  const timeline = useMemo(() => buildTimeline(PHASES), []);

  const bounds = useMemo(() => {
    const map = {};
    timeline.forEach((s, idx) => {
      if (s.kind === "start") map[s.phaseIndex] = { start: idx, done: idx };
      if (s.kind === "done") map[s.phaseIndex].done = idx;
    });
    return map;
  }, [timeline]);

  // Slow the human-paced stages so each intake check / Voice-PD question reads.
  const slowBounds = [bounds[1], bounds[5]].filter(Boolean);
  const stepDelay = (c) => (slowBounds.some((b) => c >= b.start && c < b.done) ? 1700 : 850);

  const { cursor, playing, speed, setSpeed, play, pause, reset, skipEnd, seek } = usePlayback(
    timeline.length,
    stepDelay
  );
  const [presenting, setPresenting] = useState(false);
  const containerRef = useRef(null);
  const loopRef = useRef(null);

  const statuses = PHASES.map((_, i) => {
    const b = bounds[i];
    if (!b) return "waiting";
    return cursor > b.done ? "done" : cursor > b.start ? "running" : "waiting";
  });

  let activePhase = 0;
  for (let i = 0; i < PHASES.length; i++) if (bounds[i] && cursor > bounds[i].start) activePhase = i;

  const progressFor = (i) => {
    const b = bounds[i];
    if (!b || cursor <= b.start) return 0;
    if (cursor >= b.done) return 1;
    return (cursor - b.start) / Math.max(b.done - b.start, 1);
  };

  // Agent calls of the active node, revealed up to the cursor (drives the card).
  const activeAgents = [];
  timeline.slice(0, cursor).forEach((s) => {
    if (s.kind === "agent" && s.phaseIndex === activePhase) activeAgents.push(s.agent);
  });

  const complete = cursor >= timeline.length;

  const activeCard =
    activePhase === 1 ? (
      <IntakeChecksCallout progress={progressFor(1)} frost />
    ) : activePhase === 5 ? (
      <TelePdCallout progress={progressFor(5)} frost />
    ) : (
      <NodeLiveCard phase={PHASES[activePhase]} status={statuses[activePhase]} agents={activeAgents} />
    );

  const goTo = (i) => {
    const b = bounds[i];
    seek(b ? b.done : cursor);
  };

  // Optional deep link: #at=<phase> opens mid-way through that node (its card
  // caught "in progress") — handy for demos and for screenshots.
  useEffect(() => {
    const m = /at=(\d+)/.exec(typeof window !== "undefined" ? window.location.hash : "");
    if (!m) return;
    const i = Math.min(Number(m[1]), PHASES.length - 1);
    const b = bounds[i];
    if (b) seek(Math.floor((b.start + b.done) / 2));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard: space play/pause, arrows scrub, R reset, S skip.
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
  }, [playing, cursor]); // eslint-disable-line react-hooks/exhaustive-deps

  // Present mode: fullscreen + autoplay + loop.
  const togglePresent = () => {
    const el = containerRef.current;
    if (!presenting) el?.requestFullscreen?.()?.catch?.(() => {});
    else if (document.fullscreenElement) document.exitFullscreen?.()?.catch?.(() => {});
    else setPresenting(false);
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (presenting && complete) {
      loopRef.current = setTimeout(() => {
        reset();
        play();
      }, 7000);
      return () => clearTimeout(loopRef.current);
    }
  }, [presenting, complete]); // eslint-disable-line react-hooks/exhaustive-deps

  const approved = META.outcome === "APPROVED";

  return (
    <div
      ref={containerRef}
      className="grid h-screen grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-canvas font-sans text-ink"
    >
      <TopBar
        meta={META}
        outcome={META.outcome}
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
        presenting={presenting}
        togglePresent={togglePresent}
        onExit={onExit}
      />

      {/* DAG sits low so the live card has full headroom to pop above each node. */}
      <main className="relative flex min-h-0 flex-col items-center justify-end overflow-hidden px-6 pb-[7vh]">
        {/* completion ribbon */}
        {complete && (
          <div
            className={`absolute top-5 left-1/2 -translate-x-1/2 rounded-full border px-4 py-1.5 text-sm font-bold shadow-sm animate-fade-up ${
              approved
                ? "border-success-200 bg-success-50 text-success-700"
                : "border-danger-200 bg-danger-50 text-danger-600"
            }`}
          >
            Decision · {META.outcome}
          </div>
        )}

        <div className="w-full max-w-[1240px]">
          <ExecutionGraph
            statuses={statuses}
            selected={activePhase}
            onSelect={goTo}
            activePhase={activePhase}
            activeCard={activeCard}
          />
        </div>

        {!playing && cursor === 0 && (
          <p className="absolute top-6 left-1/2 -translate-x-1/2 text-sm text-slate-400 animate-fade-in">
            Press <span className="font-semibold text-slate-500">Play</span> to watch the agent
            underwrite a real application — node by node.
          </p>
        )}
      </main>
    </div>
  );
}
