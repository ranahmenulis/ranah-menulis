"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { markLandingReady, motionAllowed } from "../motion/motion-env";

const LINE_GAP_MS = 80;
/** Lead and buttons start as the last line is about half way up (700ms rise). */
const FOLLOW_MS = 350;
/** A `view` title enters once it is past the bottom 15% of the screen (DESIGN.md 4.6). */
const VIEW_MARGIN = "0px 0px -15% 0px";

/** Groups words into lines by their top edge, as the browser wrapped them at this width. */
function numberLines(title: HTMLElement): number {
  const tops: number[] = [];
  for (const word of title.querySelectorAll<HTMLElement>("[data-word]")) {
    const top = Math.round(word.offsetTop);
    if (!tops.includes(top)) tops.push(top);
    word.style.setProperty("--line", String(tops.indexOf(top)));
  }
  return tops.length;
}

/**
 * A landing title's entrance (design-taste-frontend motion.md): it rises line by line out of word
 * masks, then the elements marked `data-enter-item` fade up. `load` runs once on load (the hero);
 * `view` runs once when the title comes into view (the closing title, the landing's one arrival
 * moment). The server HTML is the standing title; CSS hides the words only while `html.lp-motion`
 * is on and the section has no `data-entered` yet, so without script, under reduced motion, or
 * without IntersectionObserver nothing waits.
 *
 * The title is either one `text` that wraps where the browser wraps it, or `lines` that are set on
 * their own line each (the hero), optionally with a class per line. Either way the heading reads
 * as one sentence.
 */
export function EnterTitle({
  id,
  text,
  lines,
  lineClasses,
  className,
  as: Tag = "h1",
  trigger = "load",
}: {
  id: string;
  text?: string;
  lines?: readonly string[];
  lineClasses?: readonly string[];
  className: string;
  as?: "h1" | "h2";
  trigger?: "load" | "view";
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const title = ref.current;
    const section = title?.closest<HTMLElement>("[data-enter]");
    if (!title || !section) return;
    markLandingReady();
    if (!motionAllowed()) return;

    const lines = numberLines(title);
    section.style.setProperty("--follow", `${(lines - 1) * LINE_GAP_MS + FOLLOW_MS}ms`);
    const enter = () => section.setAttribute("data-entered", "");

    if (trigger === "view") {
      if (typeof IntersectionObserver === "undefined") return enter();
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          observer.disconnect();
          enter();
        },
        { rootMargin: VIEW_MARGIN },
      );
      observer.observe(title);
      return () => observer.disconnect();
    }

    // Next frame, so the hidden start state is committed before the transition runs.
    const frame = requestAnimationFrame(enter);
    return () => cancelAnimationFrame(frame);
  }, [trigger]);

  return (
    <Tag id={id} ref={ref} className={className}>
      {lines ? (
        lines.map((line, i) => (
          <span key={i} className={cn("block", lineClasses?.[i])}>
            <Words text={line} />
            {i < lines.length - 1 && " "}
          </span>
        ))
      ) : (
        <Words text={text ?? ""} />
      )}
    </Tag>
  );
}

function Words({ text }: { text: string }) {
  const words = text.split(" ");
  return words.map((word, i) => (
    <span key={i}>
      <span data-word className="lp-word">
        <span>{word}</span>
      </span>
      {i < words.length - 1 && " "}
    </span>
  ));
}
