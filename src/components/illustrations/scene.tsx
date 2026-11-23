import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
 * Shared frame for the illustrations (DESIGN.md 7.10, client reference 23 November 2026): flat
 * layered shapes in the slate tokens, with the warm illustration-only tokens (--art-moon,
 * --art-flame) only where they mean something (light, fire, a prize). Every illustration is
 * decorative, so the frame is aria-hidden and follows the light and dark theme through tokens.
 */

/** Colours as CSS variables, so one drawing works in both themes. */
export const C = {
  accent: "var(--accent)",
  ink: "var(--accent-ink)",
  soft: "var(--accent-subtle)",
  surface: "var(--surface)",
  line: "var(--line)",
  muted: "var(--ink-muted)",
  moon: "var(--art-moon)",
  flame: "var(--art-flame)",
} as const;

export type ArtProps = { className?: string };

/** A hero scene: 320 × 180, anchored bottom right like the Streak ridge. */
export function Scene({
  className,
  children,
  viewBox = "0 0 320 180",
  align = "xMaxYMax",
}: ArtProps & { children: ReactNode; viewBox?: string; align?: string }) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      aria-hidden
      focusable="false"
      preserveAspectRatio={`${align} meet`}
      className={cn("rm-art pointer-events-none", className)}
    >
      {children}
    </svg>
  );
}

/** Two soft hills along the bottom, the ground most scenes stand on. */
export function Hills({ far = 0.18, near = 0.34 }: { far?: number; near?: number }) {
  return (
    <>
      <path d="M0 180 L0 150 Q70 118 150 138 T320 128 L320 180 Z" fill={C.accent} opacity={far} />
      <path d="M0 180 L0 166 Q90 146 180 160 T320 154 L320 180 Z" fill={C.accent} opacity={near} />
    </>
  );
}

/** A few four-point stars for night scenes. */
export function Stars({ points }: { points: [number, number][] }) {
  return (
    <g fill={C.moon} opacity={0.8}>
      {points.map(([x, y]) => (
        <path
          key={`${x}-${y}`}
          d={`M${x} ${y - 3} L${x + 0.8} ${y - 0.8} L${x + 3} ${y} L${x + 0.8} ${y + 0.8} L${x} ${y + 3} L${x - 0.8} ${y + 0.8} L${x - 3} ${y} L${x - 0.8} ${y - 0.8} Z`}
        />
      ))}
    </g>
  );
}
