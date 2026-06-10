import { useEffect, useState } from "react";

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

// Streams `text` in character chunks; renders it whole under reduced motion.
export function useTypewriter(text, { speed = 22, chunk = 2, enabled = true } = {}) {
  const [shown, setShown] = useState(0);
  const full = text ?? "";

  useEffect(() => {
    if (!enabled || prefersReducedMotion()) {
      setShown(full.length);
      return;
    }
    setShown(0);
    let i = 0;
    const id = setInterval(() => {
      i += chunk;
      setShown(Math.min(i, full.length));
      if (i >= full.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [full, enabled, speed, chunk]);

  return { text: full.slice(0, shown), done: shown >= full.length };
}

// rAF count-up with ease-out cubic; jumps straight to target under reduced motion.
export function useCountUp(target, { duration = 1100 } = {}) {
  const [value, setValue] = useState(target == null || prefersReducedMotion() ? target : 0);

  useEffect(() => {
    if (target == null || prefersReducedMotion()) {
      setValue(target);
      return;
    }
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
