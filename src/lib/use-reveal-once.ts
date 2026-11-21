"use client";

import { useEffect, useState, type RefObject } from "react";

/** Staggering is by lane, not by position in the list, so a tile far down the page never waits. */
export const REVEAL_STEP_MS = 60;
export const REVEAL_LANES = 4;

/** Delay for the tile at this position: a short cascade across one row, then it repeats. */
export const revealDelay = (index: number) => (index % REVEAL_LANES) * REVEAL_STEP_MS;

/**
 * True once the element has come into view, and it stays true (a tile is revealed once, never
 * hidden again when it scrolls away). Without IntersectionObserver the tile is shown at once, so
 * nothing can stay invisible. Under reduced motion the CSS skips the transition, so the state is
 * still honest but nothing moves.
 */
export function useRevealOnce(ref: RefObject<HTMLElement | null>) {
  const [seen, setSeen] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const el = ref.current;
    if (seen || !el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        setSeen(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, seen]);

  return seen;
}
