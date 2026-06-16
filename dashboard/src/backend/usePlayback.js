import { useEffect, useRef, useState } from "react";

const BASE_MS = 850;

export function usePlayback(length) {
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timer = useRef(null);

  useEffect(() => {
    if (!playing) return;
    if (cursor >= length) {
      setPlaying(false);
      return;
    }
    timer.current = setTimeout(() => setCursor((c) => Math.min(c + 1, length)), BASE_MS / speed);
    return () => clearTimeout(timer.current);
  }, [playing, cursor, length, speed]);

  const play = () => {
    if (cursor >= length) setCursor(0);
    setPlaying(true);
  };
  const pause = () => setPlaying(false);
  const reset = () => {
    setPlaying(false);
    setCursor(0);
  };
  const skipEnd = () => {
    setPlaying(false);
    setCursor(length);
  };
  const seek = (i) => {
    setPlaying(false);
    setCursor(Math.max(0, Math.min(i, length)));
  };

  return { cursor, playing, speed, setSpeed, play, pause, reset, skipEnd, seek };
}
