"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  passage,
  plateDrift,
  registerDrift,
  setVars,
  type DriftOptions,
} from "../motion/scroll-drift";

/**
 * A plate that drifts against the page while it crosses the screen. It wraps the image (a server
 * `<img>` passed as children) and only sets `--dy` and `--ds` on itself; the transform that reads
 * them is `.lp-drift > img` in globals.css. Used by the printing room and the closing band.
 */
export function ScrollDrift({
  range,
  zoom,
  className,
  children,
}: DriftOptions & { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return registerDrift(() => {
      const { top, height } = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      // Far off screen: nothing to move, and nothing to measure again until it comes close.
      if (top > viewport * 2 || top + height < -viewport) return;
      setVars(el, plateDrift(passage(top, height, viewport), { range, zoom }));
    });
  }, [range, zoom]);

  return (
    <div ref={ref} aria-hidden className={cn("lp-drift", className)}>
      {children}
    </div>
  );
}
