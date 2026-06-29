import { useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { PHASES, META, VIZ, buildTimeline } from "./phaseModel.js";
import VerdictCard from "./VerdictCard.jsx";
import ScalePanel from "./ScalePanel.jsx";
import HintOverlay from "../components/HintOverlay.jsx";
import JourneySpine from "../components/JourneySpine.jsx";

// Backend phase index → shared journey-spine stage. Voice PD Agent (agentic voice
// agent) shares the policy stage; finalize+notify share "outcome".
const SPINE_BY_PHASE = [0, 1, 2, 3, 4, 4, 5, 6, 6];
import { usePlayback } from "./usePlayback.js";
import JourneyControls from "./JourneyControls.jsx";
import ExecutionGraph from "./ExecutionGraph.jsx";
import PhaseDetail from "./PhaseDetail.jsx";
import BackendConsole from "./BackendConsole.jsx";
import ResultsStrip from "./ResultsStrip.jsx";
import CamReport from "../cam/CamReport.jsx";
import CamReadyToast from "../cam/CamReadyToast.jsx";
import ExportCenter from "../components/ExportCenter.jsx";

function clock(i) {
  const total = Math.round(i * 0.4);
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function BackendJourney({ onSeeCustomer }) {
  // Playback runs over the AGENT stream only (the shared buildTimeline keeps its
  // start/done markers for the Flow/Cockpit views, but those empty marker ticks
  // are what made the DAG/detail drift ±1 step from the log). Here, one tick =
  // one logged agent line, so the DAG stage, the detail panel and the Agent Call
  // Log all advance in lockstep — nothing lights up before its line is logged.
  const timeline = useMemo(() => buildTimeline(PHASES).filter((s) => s.kind === "agent"), []);
  const bounds = useMemo(() => {
    const map = {};
    timeline.forEach((s, idx) => {
      if (!(s.phaseIndex in map)) map[s.phaseIndex] = { start: idx, last: idx };
      map[s.phaseIndex].last = idx;
    });
    return map;
  }, [timeline]);

  // Slow the human-paced stages (~2×) so viewers can read each intake check and
  // each Tele PD question (intake = phase 1, Voice PD = phase 5), and hold a
  // just-finished stage on "running" for a brief beat before the next lights up.
  const SLOW_PHASES = new Set([1, 5]);
  const stepDelay = (c) => {
    const next = timeline[c]; // the agent about to be revealed at cursor c+1
    const shown = timeline[c - 1]; // the agent currently newest in the log
    let d = next && SLOW_PHASES.has(next.phaseIndex) ? 1700 : 850;
    if (shown?.lastOfPhase) d += 600; // brief beat: let the completed stage settle
    return d;
  };
  const { cursor, playing, speed, setSpeed, play, pause, reset, skipEnd, seek } = usePlayback(
    timeline.length,
    stepDelay
  );
  const [selected, setSelected] = useState(0);
  const [presenting, setPresenting] = useState(false);
  const [camOpen, setCamOpen] = useState(false);
  const [hints, setHints] = useState(() => {
    try {
      return !localStorage.getItem("cj-hints-seen");
    } catch {
      return false;
    }
  });
  const closeHints = () => {
    try {
      localStorage.setItem("cj-hints-seen", "1");
    } catch {
      /* private mode */
    }
    setHints(false);
  };
  const containerRef = useRef(null);
  const loopRef = useRef(null);

  // `latest` = index of the agent line just revealed (the newest log line). A
  // stage is "running" while that newest line belongs to it, flips to "done" only
  // once the next stage's first line is logged (and everything is "done" at the end).
  const latest = cursor - 1;
  const statuses = PHASES.map((_, i) => {
    const b = bounds[i];
    if (!b) return "waiting";
    if (cursor >= timeline.length) return "done";
    if (latest > b.last) return "done";
    if (latest >= b.start) return "running";
    return "waiting";
  });

  const activePhase = cursor > 0 ? timeline[Math.min(cursor, timeline.length) - 1].phaseIndex : 0;

  useEffect(() => {
    if (playing) setSelected(activePhase);
  }, [activePhase, playing]);

  const entries = timeline.slice(0, cursor).map((s, idx) => ({
    agent: s.agent,
    phase: PHASES[s.phaseIndex].phase,
    time: clock(idx),
  }));

  // A phase's patch lands in the Live Case Dict the moment its last line is logged.
  const dict = PHASES.reduce((acc, p, i) => (bounds[i] && cursor > bounds[i].last ? { ...acc, ...p.patch } : acc), {});

  const complete = cursor >= timeline.length;

  // Intake (phase 1) verification ceremony: a modal pops up only while intake is
  // running, ticking through checks in sync with the intake stage's playback.
  const ib = bounds[1] ?? { start: 0, last: 0 };
  const intakeOpen = statuses[1] === "running";
  const intakeProgress =
    cursor <= ib.start ? 0 : cursor > ib.last ? 1 : (cursor - ib.start) / Math.max(ib.last - ib.start + 1, 1);

  // Voice PD (phase 5) call ceremony: the question callout ticks through in sync.
  const pb = bounds[5] ?? { start: 0, last: 0 };
  const telePdOpen = statuses[5] === "running";
  const telePdProgress =
    cursor <= pb.start ? 0 : cursor > pb.last ? 1 : (cursor - pb.start) / Math.max(pb.last - pb.start + 1, 1);

  // Decision (phase 6) fold ceremony: the Voice PD → Decision callout reveals each
  // evidence→decision link in sync with the decision stage's playback.
  const db = bounds[6] ?? { start: 0, last: 0 };
  const decisionOpen = statuses[6] === "running";
  const decisionProgress =
    cursor <= db.start ? 0 : cursor > db.last ? 1 : (cursor - db.start) / Math.max(db.last - db.start + 1, 1);

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
      } else if (e.key === "?") {
        setHints((h) => !h);
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
      // Long enough to read the verdict + scale end-cards before looping.
      loopRef.current = setTimeout(() => {
        reset();
        play();
      }, 7000);
      return () => clearTimeout(loopRef.current);
    }
  }, [presenting, complete]);

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-canvas ${presenting ? "overflow-auto" : ""}`}
      style={presenting ? { zoom: 1.15 } : undefined}
    >
      <main className={`mx-auto px-4 py-6 ${presenting ? "max-w-[1380px]" : "max-w-6xl"}`}>
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2.5 font-display text-title font-semibold tracking-tight text-ink">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute h-full w-full rounded-full bg-primary-500 motion-safe:animate-ping" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-primary-600" />
              </span>
              Credit Underwriting · Live Journey
            </h1>
            <p className="text-sm text-slate-500">
              Real pipeline run · case <span className="font-medium tabular-nums text-ink">{META.caseId}</span> ·
              customer <span className="tabular-nums">{META.customerId}</span> · run {META.runId.slice(0, 8)}
            </p>
          </div>
          <button
            onClick={togglePresent}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-surface px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            {presenting ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {presenting ? "Exit" : "Present"}
          </button>
        </header>

        <div className="space-y-4">
          <JourneySpine
            current={SPINE_BY_PHASE[activePhase] ?? 0}
            complete={complete}
            outcomeTone={META.outcome === "APPROVED" ? "success" : "danger"}
            times={VIZ.layer2Wall != null ? { analysers: `${VIZ.layer2Wall}s` } : {}}
            className="rounded-2xl border border-slate-200 bg-surface px-5 py-3 shadow-sm"
          />

          <ExecutionGraph
            statuses={statuses}
            selected={selected}
            intakeOpen={intakeOpen}
            intakeProgress={intakeProgress}
            telePdOpen={telePdOpen}
            telePdProgress={telePdProgress}
            decisionOpen={decisionOpen}
            decisionProgress={decisionProgress}
            onSelect={(i) => {
              pause();
              setSelected(i);
            }}
            footer={
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
            }
          />

          <ResultsStrip meta={META} progress={timeline.length ? cursor / timeline.length : 0} complete={complete} />

          {complete && <VerdictCard onSeeCustomer={onSeeCustomer} onOpenCam={() => setCamOpen(true)} />}
          {complete && <ExportCenter id="export-center" onOpenCam={() => setCamOpen(true)} />}
          {complete && <ScalePanel />}

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

      <HintOverlay open={hints && !presenting} onClose={closeHints} />

      {complete && !presenting && !camOpen && (
        <CamReadyToast
          caseId={META.caseId}
          onViewExports={() =>
            document.getElementById("export-center")?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          onPreview={() => setCamOpen(true)}
        />
      )}
      {camOpen && <CamReport onClose={() => setCamOpen(false)} />}

      {presenting && !complete && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 w-max max-w-[80vw] -translate-x-1/2 rounded-full border border-slate-200 bg-surface/95 px-5 py-2.5 text-center shadow-lg backdrop-blur animate-fade-up">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-agent-600">
            {PHASES[activePhase].phase}
          </span>
          <span className="mx-2 text-slate-300">·</span>
          <span className="text-sm font-medium text-ink">{PHASES[activePhase].title}</span>
          {PHASES[activePhase].presenterNote && (
            <span className="ml-2 text-sm text-slate-500">{PHASES[activePhase].presenterNote}</span>
          )}
        </div>
      )}
    </div>
  );
}
