"use client";

import { useRef, type ReactNode } from "react";
import { useReveal } from "../motion/use-reveal";

/**
 * A wrapper that reveals its content once it comes into view (`useReveal`). `kind` names the
 * motion in globals.css ("Landing reveals"); here only `plate`, the public-domain plates that are
 * pulled down like a fresh print.
 */
export function Reveal({
  kind,
  className,
  children,
}: {
  kind: "plate";
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  return (
    <div ref={ref} data-reveal={kind} className={className}>
      {children}
    </div>
  );
}
