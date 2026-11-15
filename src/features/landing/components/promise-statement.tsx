"use client";

import { useEffect, useRef } from "react";
import { clamp01, markLandingReady, motionAllowed } from "../motion/motion-env";

/** The statement's top at this share of the screen turns the first word ... */
const FROM = 0.85;
/** ... and its bottom at this share turns the last. */
const TO = 0.45;

/**
 * The page's one dealt moment, `word-highlight` (design-taste-frontend): the statement rests at
 * half ink and turns to ink word by word as it crosses the middle of the screen, running back on
 * the way up. Without motion every word is ink (CSS greys words only under `html.lp-motion`).
 * The kit turns one strong word to the accent; RanahMenulis is monochrome, so none is.
 */
export function PromiseStatement({ id, text }: { id: string; text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    markLandingReady();
    if (!motionAllowed()) return;

    const words = [...el.querySelectorAll<HTMLElement>("[data-w]")];
    let lit = -1;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const start = innerHeight * FROM;
      const end = innerHeight * TO;
      const share = clamp01((start - rect.top) / Math.max(1, start - end + rect.height));
      // At the bottom of the page it can climb no further: the statement stands in full ink.
      const atEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
      const count = atEnd ? words.length : Math.round(share * words.length);
      if (count === lit) return;
      lit = count;
      words.forEach((word, i) => word.classList.toggle("is-on", i < count));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const words = text.split(" ");
  return (
    <h2 id={id} ref={ref} className="lp-wh landing-statement">
      {words.map((word, i) => (
        <span key={i}>
          <span data-w>{word}</span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </h2>
  );
}
