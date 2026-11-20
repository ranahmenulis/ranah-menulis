import { useEffect, type RefObject } from "react";
import { motionAllowed } from "./motion-env";

/** Time each card stays before the row moves on. */
export const AUTO_ADVANCE_MS = 3000;

/**
 * Where the row goes next: the scroll position that puts the next card at the row's snap edge
 * (its left edge plus scroll padding), or back to the start from the end. Read from the cards
 * themselves, so it always lands on a snap point, whatever their width.
 */
export function nextScrollLeft(row: HTMLElement): number {
  if (atRowEnd(row)) return 0;
  const edge = snapEdge(row);
  for (const card of Array.from(row.children)) {
    const offset = card.getBoundingClientRect().left - edge;
    if (offset > 4) return row.scrollLeft + offset;
  }
  return 0;
}

/** Whether the row is scrolled all the way to the end. */
export function atRowEnd(row: HTMLElement): boolean {
  return row.scrollLeft + row.clientWidth >= row.scrollWidth - 2;
}

/** The 0-based card nearest the row's snap edge: the one the reader is looking at. */
export function cardAtEdge(row: HTMLElement): number {
  const edge = snapEdge(row);
  let best = 0;
  let distance = Infinity;
  Array.from(row.children).forEach((card, i) => {
    const d = Math.abs(card.getBoundingClientRect().left - edge);
    if (d < distance) [best, distance] = [i, d];
  });
  return best;
}

/** Viewport x of the row's snap edge: its left side plus its scroll padding. */
function snapEdge(row: HTMLElement): number {
  const padding = parseFloat(getComputedStyle(row).scrollPaddingLeft) || 0;
  return row.getBoundingClientRect().left + padding;
}

/**
 * Moves a sideways row (the phone Studio legend) one card at a time while it is in view, the tab
 * is visible and `active()` holds (the phone layout). Pass a module-level `active`: it is an effect
 * dependency. The reader always wins: the first touch,
 * pointer press, wheel or keyboard focus on the row stops it for good, so it never fights a hand.
 * Off without landing motion (no script, reduced motion).
 */
export function useAutoAdvance(ref: RefObject<HTMLElement | null>, active: () => boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed()) return;

    let stopped = false;
    let visible = typeof IntersectionObserver === "undefined";
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => (visible = !!entry?.isIntersecting), {
            threshold: 0.6,
          });
    observer?.observe(el);

    const timer = window.setInterval(() => {
      if (stopped || !visible || document.hidden || !active()) return;
      el.scrollTo({ left: nextScrollLeft(el), behavior: "smooth" });
    }, AUTO_ADVANCE_MS);

    const stop = () => {
      stopped = true;
      window.clearInterval(timer);
    };
    const events = ["pointerdown", "touchstart", "wheel", "focusin"] as const;
    for (const name of events) el.addEventListener(name, stop, { passive: true });

    return () => {
      stop();
      observer?.disconnect();
      for (const name of events) el.removeEventListener(name, stop);
    };
  }, [ref, active]);
}
