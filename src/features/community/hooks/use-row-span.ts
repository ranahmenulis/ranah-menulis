"use client";

import { useLayoutEffect, useRef } from "react";

/** Row track of the Jelajahi masonry grid and the gap under every tile, in px. */
export const MASONRY_ROW = 4;
export const MASONRY_GAP = 24;

/** How many row tracks a tile of this height takes, its gap included. */
export const rowSpan = (height: number) => Math.ceil((height + MASONRY_GAP) / MASONRY_ROW);

/**
 * Masonry by measurement: the grid has tiny rows and every tile spans as many as its own height
 * needs, so wide and narrow tiles pack without holes (CSS has no masonry yet). The span is written
 * as `--span`; the grid only reads it where it lays tiles out in lanes. Photos carry their size, so
 * the height is right before they load; a later change (font, width) is caught by the observer.
 */
export function useRowSpan<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () =>
      el.style.setProperty("--span", String(rowSpan(el.getBoundingClientRect().height)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}
