import { useEffect, type RefObject } from "react";
import { motionAllowed } from "./motion-env";

/** An element reveals once it is past the bottom quarter of the screen. */
export const REVEAL_MARGIN = "0px 0px -25% 0px";

/**
 * Marks an element `data-seen` the first time it comes into view, once. globals.css keeps a
 * `[data-reveal]` element in its start state only while `html.lp-motion` is on and `data-seen` is
 * missing, so without script, under reduced motion, or without IntersectionObserver it is marked at
 * once and nothing waits.
 */
export function useReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const show = () => el.setAttribute("data-seen", "");
    if (!motionAllowed() || typeof IntersectionObserver === "undefined") return show();
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        show();
      },
      { rootMargin: REVEAL_MARGIN },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
}
