import { useEffect, useMemo, useRef, useState } from "react";
import {
  CHAPTERS,
  META,
  PHASES,
  PIPELINE_COUNT,
  buildJourneyTimeline,
} from "./cockpit/chapterModel.js";
import TopBar from "./cockpit/TopBar.jsx";
import StageRail from "./cockpit/StageRail.jsx";
import StagePanel from "./cockpit/StagePanel.jsx";
import { usePlayback } from "./backend/usePlayback.js";

function clock(i) {
  const total = Math.round(i * 0.4);
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

// Finale chapter positions (used by in-panel CTAs to advance the cursor).
const INDICES = { verdict: PIPELINE_COUNT, customer: PIPELINE_COUNT + 1, cam: PIPELINE_COUNT + 2 };

export default function Cockpit({ onExit }) {
  const timeline = useMemo(() => buildJourneyTimeline(), []);

  // chapterIndex -> { start, last } cursor positions (one step per agent / beat).
  const bounds = useMemo(() => {
    const map = {};
    timeline.forEach((s, idx) => {
      if (!(s.chapterIndex in map)) map[s.chapterIndex] = { start: idx, last: idx };
      map[s.chapterIndex].last = idx;
    });
    return map;
  }, [timeline]);

  // Slow the human-paced stages (~2×) so each intake check / Voice-PD question is
  // readable (intake = chapter 1, Voice PD = chapter 5), and hold a just-finished
  // chapter on "running" for a brief beat before the next lights up.
  const SLOW_CHAPTERS = new Set([1, 5]);
  const stepDelay = (c) => {
    const next = timeline[c];
    const shown = timeline[c - 1];
    let d = next && SLOW_CHAPTERS.has(next.chapterIndex) ? 1700 : 850;
    if (shown?.lastOfPhase) d += 600;
    return d;
  };

  const { cursor, playing, speed, setSpeed, play, pause, reset, skipEnd, seek } = usePlayback(
    timeline.length,
    stepDelay
  );
  // Optional deep-link: #ch=<index> opens straight to a chapter (handy for demos
  // and for jumping back to the verdict/CAM without replaying).
  const initialChapter = useMemo(() => {
    const m = /ch=(\d+)/.exec(typeof window !== "undefined" ? window.location.hash : "");
    return m ? Math.min(Number(m[1]), CHAPTERS.length - 1) : 0;
  }, []);
  const [selected, setSelected] = useState(initialChapter);
  const [presenting, setPresenting] = useState(false);
  const containerRef = useRef(null);
  const loopRef = useRef(null);

  // `latest` = index of the step just revealed; the chapter it belongs to is the
  // one "running" (and, for pipeline chapters, the one whose newest agent line is
  // showing) — rail, panel and log stay in lockstep.
  const latest = cursor - 1;
  const statuses = CHAPTERS.map((_, i) => {
    const b = bounds[i];
    if (!b) return "waiting";
    if (cursor >= timeline.length) return "done";
    if (latest > b.last) return "done";
    if (latest >= b.start) return "running";
    return "waiting";
  });

  const activeChapter = cursor > 0 ? timeline[Math.min(cursor, timeline.length) - 1].chapterIndex : 0;

  useEffect(() => {
    if (playing) setSelected(activeChapter);
  }, [activeChapter, playing]);

  // Cumulative agent-call log (only pipeline agent steps emit lines) + live dict.
  const entries = timeline
    .slice(0, cursor)
    .filter((s) => s.kind === "agent")
    .map((s, idx) => ({ agent: s.agent, phase: PHASES[s.phaseIndex].phase, time: clock(idx) }));
  const dict = CHAPTERS.reduce(
    (acc, c, i) => (c.patch && bounds[i] && cursor > bounds[i].last ? { ...acc, ...c.patch } : acc),
    {}
  );

  const complete = cursor >= timeline.length;

  // Intake (chapter 1) + Voice PD (chapter 5) ceremonies tick in sync with their
  // stage's playback.
  const progressFor = (i) => {
    const b = bounds[i];
    if (!b || cursor <= b.start) return 0;
    if (cursor > b.last) return 1;
    return (cursor - b.start) / Math.max(b.last - b.start + 1, 1);
  };
  const intakeOpen = statuses[1] === "running";
  const telePdOpen = statuses[5] === "running";

  // Click a rail row (or an in-panel CTA): pause, jump the cursor to that
  // chapter fully revealed, and view it.
  const goTo = (i) => {
    const b = bounds[i];
    seek(b ? b.last + 1 : cursor);
    setSelected(i);
  };

  // Honor a #ch= deep link on first load by revealing that chapter.
  useEffect(() => {
    if (initialChapter > 0 && bounds[initialChapter]) seek(bounds[initialChapter].last + 1);
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (presenting && complete) {
      loopRef.current = setTimeout(() => {
        reset();
        play();
      }, 9000);
      return () => clearTimeout(loopRef.current);
    }
  }, [presenting, complete]); // eslint-disable-line react-hooks/exhaustive-deps

  const chapter = CHAPTERS[selected] ?? CHAPTERS[0];

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

      <div className="grid min-h-0 grid-cols-[212px_minmax(0,1fr)] lg:grid-cols-[252px_minmax(0,1fr)]">
        <StageRail statuses={statuses} selected={selected} onSelect={goTo} />
        <main className="min-h-0 overflow-hidden">
          <StagePanel
            chapter={chapter}
            status={statuses[selected]}
            entries={entries}
            dict={dict}
            intakeOpen={intakeOpen && selected === 1}
            intakeProgress={progressFor(1)}
            telePdOpen={telePdOpen && selected === 5}
            telePdProgress={progressFor(5)}
            goTo={goTo}
            indices={INDICES}
          />
        </main>
      </div>
    </div>
  );
}
