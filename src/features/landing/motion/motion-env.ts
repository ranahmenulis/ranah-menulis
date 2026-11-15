import { useSyncExternalStore } from "react";

/**
 * Landing motion runs only when the inline script in `app/page.tsx` put `lp-motion` on <html>
 * before first paint (it skips reduced motion). Without that class every part shows its final
 * state, so the page is whole without script.
 */
export const MOTION_CLASS = "lp-motion";

export function motionAllowed(): boolean {
  return (
    typeof document !== "undefined" && document.documentElement.classList.contains(MOTION_CLASS)
  );
}

/** Tells the inline script's safety timer that the landing hydrated, so it keeps motion on. */
export function markLandingReady(): void {
  document.documentElement.setAttribute("data-lp-ready", "");
}

const noSubscription = () => () => {};

/** `false` on the server and during hydration, then whether motion is allowed. */
export function useMotionAllowed(): boolean {
  return useSyncExternalStore(noSubscription, motionAllowed, () => false);
}
