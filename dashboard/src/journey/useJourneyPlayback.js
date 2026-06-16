import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../lib/motion.js";

// Drives the agent's replay: intro greeting -> each moment's facts tick in ->
// outcome reveal. Step-driven so it can be paused ("stay on this step") and
// resumed; skippable at any point; reduced motion jumps straight to reveal.

const INTRO_MS = 2600;
const FACT_MS = 780;
const MOMENT_TAIL_MS = 1000;

function revealState(moments) {
  return { phase: "reveal", moment: moments.length - 1, facts: Infinity };
}

// Flatten the script into a sequence of {delay, state} steps a single timer walks.
function buildSequence(moments) {
  const seq = [];
  moments.forEach((m, i) => {
    seq.push({ delay: i === 0 ? INTRO_MS : MOMENT_TAIL_MS, state: { phase: "working", moment: i, facts: 0 } });
    m.facts.forEach((_, f) => seq.push({ delay: FACT_MS, state: { phase: "working", moment: i, facts: f + 1 } }));
  });
  seq.push({ delay: MOMENT_TAIL_MS, state: revealState(moments) });
  return seq;
}

export function useJourneyPlayback(moments, restartKey) {
  const reduce = prefersReducedMotion();
  const [state, setState] = useState(() =>
    reduce ? revealState(moments) : { phase: "intro", moment: -1, facts: 0 }
  );
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(reduce);
  const seqRef = useRef([]);
  const idxRef = useRef(0);
  const timerRef = useRef(null);

  // (Re)start whenever the scenario/replay key changes.
  useEffect(() => {
    clearTimeout(timerRef.current);
    seqRef.current = buildSequence(moments);
    idxRef.current = 0;
    setPaused(false);
    if (reduce) {
      setState(revealState(moments));
      setDone(true);
      return;
    }
    setDone(false);
    setState({ phase: "intro", moment: -1, facts: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restartKey]);

  // Run loop: schedules one step at a time; pausing freezes, resuming continues
  // from the current step.
  useEffect(() => {
    if (reduce || done || paused) return;
    let cancelled = false;
    const run = () => {
      const seq = seqRef.current;
      if (idxRef.current >= seq.length) {
        setDone(true);
        return;
      }
      const step = seq[idxRef.current];
      timerRef.current = setTimeout(() => {
        if (cancelled) return;
        setState(step.state);
        idxRef.current += 1;
        run();
      }, step.delay);
    };
    run();
    return () => {
      cancelled = true;
      clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, done, restartKey]);

  const skip = () => {
    clearTimeout(timerRef.current);
    idxRef.current = seqRef.current.length;
    setState(revealState(moments));
    setDone(true);
  };
  const togglePause = () => setPaused((p) => !p);

  return { ...state, skip, paused, togglePause, done };
}
