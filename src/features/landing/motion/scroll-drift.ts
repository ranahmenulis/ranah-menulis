import { motionAllowed } from "./motion-env";

/**
 * Scroll-linked drift on the landing (DESIGN.md 4.6): the hero's editor lifts and the publishing
 * covers move a few pixels against the page as they pass through the screen. One passive scroll listener drives every registered
 * element, once per frame, and each one only writes CSS variables that a `transform` reads
 * (globals.css, "Landing plates"); nothing here touches layout. Without `lp-motion` (no script,
 * reduced motion) nothing registers and everything stands at rest.
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

/** Variable for the hero band: the editor lifts as the stage scrolls into place. */
export function heroDrift(progress: number) {
  return { "--lift": `${(progress * -36).toFixed(1)}px` };
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
