import { motionAllowed } from "./motion-env";

/**
 * Scroll-linked drift of the landing's plates (DESIGN.md 4.6): a photo moves a few pixels against
 * the page as it passes through the screen. One passive scroll listener drives every registered
 * element, once per frame, and each one only writes CSS variables that a `transform` reads
 * (globals.css, "Landing plates"); nothing here touches layout. Without `lp-motion` (no script,
 * reduced motion) nothing registers and the plates stand at rest.
 */

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** How far an element has travelled through the screen: 0 as it enters at the bottom, 1 as it leaves. */
export function passage(top: number, height: number, viewport: number): number {
  return clamp01((viewport - top) / (viewport + height));
}

/** Hero band: 0 while its top is at the bottom of the screen, 1 once its top reaches the top. */
export function heroProgress(top: number, viewport: number): number {
  return clamp01(1 - top / viewport);
}

/** Variables for the hero band: the engraving rises and settles, the editor lifts over it. */
export function heroDrift(progress: number) {
  return {
    "--par": `${(progress * -60).toFixed(1)}px`,
    "--sc": (1.1 - progress * 0.08).toFixed(3),
    "--lift": `${(progress * -36).toFixed(1)}px`,
  };
}

export type DriftOptions = {
  /** Total travel in px over the whole passage. */
  range: number;
  /** Scale at the start and the end of the passage; a plain number keeps it fixed. */
  zoom: number | readonly [number, number];
};

/** Variables for a plate behind content (printing room, closing band). */
export function plateDrift(p: number, { range, zoom }: DriftOptions) {
  const scale = typeof zoom === "number" ? zoom : zoom[0] + (zoom[1] - zoom[0]) * p;
  return {
    "--dy": `${((p - 0.5) * -range).toFixed(1)}px`,
    "--ds": scale.toFixed(3),
  };
}

/** The covers' shared offset: -0.5 as the stack enters, 0 mid-screen, 0.5 as it leaves. */
export function coverDrift(p: number) {
  return { "--cp": (p - 0.5).toFixed(3) };
}

type Update = () => void;
const targets = new Set<Update>();
let queued = false;

function flush() {
  queued = false;
  for (const update of targets) update();
}

function onScroll() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(flush);
}

/**
 * Registers `update` to run once now and then once per animation frame while the page scrolls or
 * resizes. Returns the unregister function. Does nothing when landing motion is off.
 */
export function registerDrift(update: Update): () => void {
  if (!motionAllowed()) return () => {};
  targets.add(update);
  if (targets.size === 1) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  }
  update();
  return () => {
    targets.delete(update);
    if (targets.size === 0) {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    }
  };
}

/** Writes variables onto an element. */
export function setVars(el: HTMLElement, vars: Record<string, string>) {
  for (const [name, value] of Object.entries(vars)) el.style.setProperty(name, value);
}
