"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
 * Painting helpers shared by the illustrations (DESIGN.md 7.10), after the Streak landscape:
 * gradient skies, radial light, mist bands, volume gradients and soft drop shadows. Colours are
 * always tokens (globals.css, --scene-* and --art-*), so each drawing follows the theme.
 */

export type Stop = readonly [offset: number, color: string, opacity?: number | string];

function stops(list: readonly Stop[]) {
  return list.map(([offset, color, opacity]) => (
    <stop
      key={`${offset}-${color}`}
      offset={offset}
      style={{ stopColor: color, stopOpacity: opacity }}
    />
  ));
}

/** A linear gradient, top to bottom unless told otherwise. */
export function Linear({
  id,
  list,
  x2 = 0,
  y2 = 1,
}: {
  id: string;
  list: readonly Stop[];
  x2?: number;
  y2?: number;
}) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
      {stops(list)}
    </linearGradient>
  );
}

/** A radial gradient centred in its box unless told otherwise. */
export function Radial({
  id,
  list,
  cx = 0.5,
  cy = 0.5,
  r = 0.5,
}: {
  id: string;
  list: readonly Stop[];
  cx?: number;
  cy?: number;
  r?: number;
}) {
  return (
    <radialGradient id={id} cx={cx} cy={cy} r={r}>
      {stops(list)}
    </radialGradient>
  );
}

/** A light source fading out: moon, sun, lamp, fire. */
export const glow = (color: string, strength = 0.55): Stop[] => [
  [0, color, strength],
  [0.45, color, strength / 4],
  [1, color, 0],
];

/** A horizontal band of mist, clear at both edges. */
export const MIST: Stop[] = [
  [0, "var(--scene-mist)", 0],
  [0.55, "var(--scene-mist)", "var(--scene-mist-o)"],
  [1, "var(--scene-mist)", 0],
];

/** Volume on a solid: the lit top, the colour itself, then the shaded foot. */
export const volume = (hi: string, base: string, lo: string): Stop[] => [
  [0, hi],
  [0.45, base],
  [1, lo],
];

export const url = (id: string) => `url(#${id})`;

/** A soft contact shadow under a standing object. */
export function Shadow({
  cx,
  cy,
  rx,
  ry = 4,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry?: number;
}) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill="var(--scene-shadow)"
      style={{ opacity: "var(--scene-shadow-o)" }}
    />
  );
}

type Point = [number, number];

/** A pine as stacked tiers, standing on `base` at `x`. */
export function pine(x: number, base: number, h: number, w: number): string {
  const half = w / 2;
  const tiers: Point[] = [
    [0, -h],
    [half * 0.44, -h * 0.68],
    [half * 0.24, -h * 0.68],
    [half * 0.7, -h * 0.36],
    [half * 0.42, -h * 0.36],
    [half, -h * 0.05],
    [half * 0.12, -h * 0.05],
    [half * 0.12, 0],
    [-half * 0.12, 0],
    [-half * 0.12, -h * 0.05],
    [-half, -h * 0.05],
    [-half * 0.42, -h * 0.36],
    [-half * 0.7, -h * 0.36],
    [-half * 0.24, -h * 0.68],
    [-half * 0.44, -h * 0.68],
  ];
  const points = tiers.map(([dx, dy]) => `${(x + dx).toFixed(1)} ${(base + dy).toFixed(1)}`);
  return `M${points.join(" L")} Z`;
}

/** A cloud as a row of overlapping puffs resting on `y`. */
export function cloud(x: number, y: number, w: number): string {
  const h = w * 0.32;
  return `M${x} ${y} a${h * 0.7} ${h * 0.7} 0 0 1 ${w * 0.22} ${-h * 0.55} a${h} ${h} 0 0 1 ${w * 0.38} ${-h * 0.35} a${h * 0.8} ${h * 0.8} 0 0 1 ${w * 0.3} ${h * 0.3} a${h * 0.5} ${h * 0.5} 0 0 1 ${w * 0.1} ${h * 0.6} Z`;
}

/** Four-point stars; `opacity` is a token so a scene can show them only at night. */
export function Twinkles({ points, opacity }: { points: Point[]; opacity: string }) {
  return (
    <g style={{ opacity }} fill="var(--art-moon)">
      {points.map(([x, y], i) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={i % 3 ? 0.9 : 1.4} />
      ))}
    </g>
  );
}

/**
 * A landscape that fills its box (sliced, anchored right) like the Streak hero; `object` drawings
 * instead fit inside their box, anchored bottom right.
 */
export function Canvas({
  className,
  children,
  object = false,
  viewBox = object ? "0 0 320 180" : "0 0 400 220",
}: {
  className?: string;
  children: ReactNode;
  object?: boolean;
  viewBox?: string;
}) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      aria-hidden
      focusable="false"
      preserveAspectRatio={object ? "xMaxYMax meet" : "xMaxYMid slice"}
      className={cn("rm-art pointer-events-none", className)}
    >
      {children}
    </svg>
  );
}
