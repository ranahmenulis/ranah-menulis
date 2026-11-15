"use client";

import { useEffect, useRef } from "react";
import { markLandingReady, motionAllowed } from "../motion/motion-env";

const LINE_GAP_MS = 80;
/** Lead and buttons start as the last line is about half way up (700ms rise). */
const FOLLOW_MS = 350;

/**
 * The hero's entrance, once on load (design-taste-frontend motion.md): the h1 rises line by line
 * out of word masks, then the elements marked `data-enter-item` fade up. The server HTML is the
 * standing hero; CSS hides the words only while `html.lp-motion` is on and the section has no
 * `data-entered` yet, so without script or under reduced motion nothing waits.
 */
export function EnterTitle({
  id,
  text,
  className,
}: {
  id: string;
  text: string;
  className: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const title = ref.current;
    const section = title?.closest<HTMLElement>("[data-enter]");
    if (!title || !section) return;
    markLandingReady();
    if (!motionAllowed()) return;

    // Group words into lines by their top edge, as the browser wrapped them at this width.
    const words = [...title.querySelectorAll<HTMLElement>("[data-word]")];
    const tops: number[] = [];
    for (const word of words) {
      const top = Math.round(word.offsetTop);
      if (!tops.includes(top)) tops.push(top);
      word.style.setProperty("--line", String(tops.indexOf(top)));
    }
    section.style.setProperty("--follow", `${(tops.length - 1) * LINE_GAP_MS + FOLLOW_MS}ms`);
    // Next frame, so the hidden start state is committed before the transition runs.
    const frame = requestAnimationFrame(() => section.setAttribute("data-entered", ""));
    return () => cancelAnimationFrame(frame);
  }, []);

  const words = text.split(" ");
  return (
    <h1 id={id} ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i}>
          <span data-word className="lp-word">
            <span>{word}</span>
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </h1>
  );
}
