"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { activeLoop, forgetLoop, reportRatio, subscribeLoops } from "./loop-registry";
import { markLandingReady, useMotionAllowed } from "./motion-env";

/** One cycle of a preview loop (design-taste-frontend `--m-cycle`, 2.5 to 4 s). */
export const CYCLE_MS = 3200;
/** The finished picture rests this long before the first cycle. */
const REST_MS = 600;
/** A pointer entering in the first part of a cycle does not restart it. */
const NO_RESTART_MS = 800;
const TICK_MS = 40;
const THRESHOLDS = [0, 0.25, 0.5, 0.6, 0.75, 0.9, 1];

/**
 * Time inside the current cycle in ms, or `null` for the finished picture: on the server, without
 * motion, while paused, and whenever the loop is not playing.
 */
export const LoopTimeContext = createContext<number | null>(null);

export function useLoopTime(): number | null {
  return useContext(LoopTimeContext);
}

/** True once the cycle reached `ms`; always true for the finished picture. */
export function reached(time: number | null, ms: number): boolean {
  return time === null || time >= ms;
}

export function useLoop(id: string) {
  const motion = useMotionAllowed();
  const [node, setNode] = useState<HTMLElement | null>(null);
  const active = useSyncExternalStore(
    subscribeLoops,
    () => activeLoop() === id,
    () => false,
  );
  const [hovered, setHovered] = useState(false);
  const [paused, setPaused] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [time, setTime] = useState<number | null>(null);

  useEffect(() => {
    if (!node || !motion || typeof IntersectionObserver === "undefined") return;
    markLandingReady();
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) reportRatio(id, entry.intersectionRatio);
      },
      { threshold: THRESHOLDS },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      forgetLoop(id);
    };
  }, [node, motion, id]);

  const playing = motion && !paused && (active || hovered);

  useEffect(() => {
    if (!playing) return;
    const start = performance.now();
    const rest = epoch === 0 ? REST_MS : 0;
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - start - rest;
      setTime(elapsed < 0 ? null : Math.floor((elapsed % CYCLE_MS) / TICK_MS) * TICK_MS);
    }, TICK_MS);
    return () => {
      window.clearInterval(timer);
      setTime(null);
    };
  }, [playing, epoch]);

  const enter = useCallback(() => {
    setHovered(true);
    if (time !== null && time > NO_RESTART_MS) setEpoch((n) => n + 1);
  }, [time]);
  const leave = useCallback(() => setHovered(false), []);
  const togglePause = useCallback(() => setPaused((p) => !p), []);

  return {
    attach: setNode,
    motion,
    active,
    paused,
    time: playing ? time : null,
    enter,
    leave,
    togglePause,
  };
}
