"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { BookCover } from "@/components/ui/book-cover";
import { coverDrift, passage, registerDrift, setVars } from "../motion/scroll-drift";
import { useReveal } from "../motion/use-reveal";

/**
 * The three covers in front of the printing room. They rise in once when the stack comes into view
 * (side covers first, the middle one last), then sit at two depths while the page scrolls: the
 * side covers drift half as far as the middle one, so room, covers and page read as three layers.
 * Only `--cp` is written here; the transforms are `.lp-cover` in globals.css ("Landing reveals").
 */
export function CoverStack({ titles }: { titles: readonly string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  const [left, middle, right] = titles;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return registerDrift(() => {
      const { top, height } = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      if (top > viewport * 2 || top + height < -viewport) return;
      setVars(el, coverDrift(passage(top, height, viewport)));
    });
  }, []);

  const order = (i: number) => ({ "--i": i }) as CSSProperties;
  return (
    <div
      ref={ref}
      data-reveal="covers"
      className="lp-covers flex items-end justify-center gap-2.5 md:gap-5"
    >
      <div className="lp-cover" style={order(0)}>
        <BookCover title={left} width={80} className="md:hidden" />
        <BookCover title={left} width={128} className="max-md:hidden" />
      </div>
      <div className="lp-cover" data-depth="2" style={order(2)}>
        <BookCover title={middle} width={116} className="-translate-y-4 md:hidden" />
        <BookCover title={middle} width={184} className="-translate-y-6 max-md:hidden" />
      </div>
      <div className="lp-cover" style={order(1)}>
        <BookCover title={right} width={80} className="md:hidden" />
        <BookCover title={right} width={128} className="max-md:hidden" />
      </div>
    </div>
  );
}
