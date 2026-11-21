"use client";

import { useEffect, useRef, useState } from "react";

/** Ease-out cubic between two whole numbers; `t` is clamped to [0, 1]. */
export function countFrame(from: number, to: number, t: number): number {
  const p = Math.min(1, Math.max(0, t));
  const eased = 1 - (1 - p) ** 3;
  return Math.round(from + (to - from) * eased);
}

function motionAllowed(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches
  );
}

/**
 * A number that rolls to its value (DESIGN.md 4.6): from 0 on first show, then from the old value
 * whenever it changes. Without motion (reduced motion, no matchMedia as in tests, the server) it is
 * the value itself, so text is never wrong for anyone who cannot see it move.
 */
export function useCountUp(value: number, duration = 900): number {
  const [shown, setShown] = useState(() => (motionAllowed() ? 0 : value));
  // The last number drawn; written only inside animation frames.
  const drawn = useRef(shown);

  useEffect(() => {
    if (!motionAllowed()) return;
    const from = drawn.current;
    if (from === value) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / duration;
      const next = countFrame(from, value, t);
      drawn.current = next;
      setShown(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return motionAllowed() ? shown : value;
}
