import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../lib/motion.js";

// Drives the agent's replay: intro greeting -> each moment's facts tick in ->
// outcome reveal. Skippable at any point; reduced motion jumps straight to reveal.

const INTRO_MS = 2600;
const FACT_MS = 780;
const MOMENT_TAIL_MS = 1000;

function revealState(moments) {
  return { phase: "reveal", moment: moments.length - 1, facts: Infinity };
}

export function useJourneyPlayback(moments, restartKey) {
  const [state, setState] = useState(() =>
    prefersReducedMotion()
      ? revealState(moments)
      : { phase: "intro", moment: -1, facts: 0 }
  );
  const timers = useRef([]);

  useEffect(() => {
    const clearAll = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    clearAll();
    if (prefersReducedMotion()) {
      setState(revealState(moments));
      return clearAll;
    }
    setState({ phase: "intro", moment: -1, facts: 0 });

    const at = (ms, next) =>
      timers.current.push(
        setTimeout(() => setState(typeof next === "function" ? next : () => next), ms)
      );

    let t = INTRO_MS;
    moments.forEach((m, i) => {
      at(t, { phase: "working", moment: i, facts: 0 });
      m.facts.forEach((_, f) => {
        t += FACT_MS;
        at(t, (s) => ({ ...s, facts: f + 1 }));
      });
      t += MOMENT_TAIL_MS;
    });
    at(t, revealState(moments));

    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restartKey]);

  const skip = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setState(revealState(moments));
  };

  return { ...state, skip };
}
