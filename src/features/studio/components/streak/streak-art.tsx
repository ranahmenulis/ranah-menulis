"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

/*
 * Illustrations for the Streak tab, painted after the client's reference (23 November 2026):
 * a moonlit mountain range for the hero, a flame beside the streak, and a stack of books for the
 * "keep your rhythm" card. Colours come from the --scene-* and --art-* tokens (globals.css), so
 * the light page shows a pale morning and the dark page a night. Decorative, so aria-hidden.
 */

type Point = [number, number];

/** A pine as stacked tiers, standing on `base` at `x`. */
function pine(x: number, base: number, h: number, w: number): string {
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

const FAR_PINES: Point[] = [
  [214, 16],
  [224, 12],
  [236, 18],
  [248, 11],
];
const NEAR_PINES: [number, number, number][] = [
  [318, 214, 34],
  [332, 216, 46],
  [346, 212, 30],
  [360, 216, 54],
  [374, 214, 38],
  [388, 217, 48],
  [400, 214, 32],
];
const STARS: Point[] = [
  [196, 24],
  [232, 46],
  [268, 18],
  [376, 30],
  [392, 74],
  [214, 82],
];

function SceneDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style={{ stopColor: "var(--scene-sky-1)" }} />
        <stop offset="1" style={{ stopColor: "var(--scene-sky-2)" }} />
      </linearGradient>
      <radialGradient id={`${id}-glow`}>
        <stop offset="0" style={{ stopColor: "var(--art-moon)", stopOpacity: 0.55 }} />
        <stop offset="0.45" style={{ stopColor: "var(--art-moon)", stopOpacity: 0.14 }} />
        <stop offset="1" style={{ stopColor: "var(--art-moon)", stopOpacity: 0 }} />
      </radialGradient>
      <linearGradient id={`${id}-mist`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style={{ stopColor: "var(--scene-mist)", stopOpacity: 0 }} />
        <stop
          offset="0.55"
          style={{ stopColor: "var(--scene-mist)", stopOpacity: "var(--scene-mist-o)" }}
        />
        <stop offset="1" style={{ stopColor: "var(--scene-mist)", stopOpacity: 0 }} />
      </linearGradient>
    </defs>
  );
}

/** The Streak hero: sky, moon (or morning sun), layered ridges, mist and pines. */
export function MountainScene({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      aria-hidden
      focusable="false"
      preserveAspectRatio="xMaxYMid slice"
      className={cn("rm-art pointer-events-none", className)}
    >
      <SceneDefs id={id} />
      <rect className="rm-art-static" width={400} height={220} fill={`url(#${id}-sky)`} />
      <g style={{ opacity: "var(--scene-stars)" }} fill="var(--art-moon)">
        {STARS.map(([x, y], i) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={i % 2 ? 0.9 : 1.3} />
        ))}
      </g>
      <g>
        <circle cx={334} cy={54} r={62} fill={`url(#${id}-glow)`} />
        <circle cx={334} cy={54} r={19} fill="var(--art-moon)" />
        <circle cx={328} cy={50} r={4} fill="var(--scene-sky-2)" opacity={0.12} />
        <circle cx={340} cy={60} r={2.6} fill="var(--scene-sky-2)" opacity={0.1} />
      </g>
      <g>
        <path
          d="M0 220 L0 172 L60 156 L110 140 L150 118 L176 128 L214 92 L240 106 L268 78 L296 100 L322 90 L360 112 L400 100 L400 220 Z"
          fill="var(--scene-far)"
        />
        <path
          d="M268 78 L296 100 L284 102 L276 92 Z M214 92 L240 106 L230 108 Z M322 90 L360 112 L344 110 Z"
          fill="var(--scene-far-hi)"
        />
      </g>
      <rect x={0} y={112} width={400} height={46} fill={`url(#${id}-mist)`} />
      <g>
        <path
          d="M0 220 L0 200 L70 190 L130 184 L182 176 L204 164 L236 128 L258 112 L282 132 L304 126 L334 150 L366 142 L400 160 L400 220 Z"
          fill="var(--scene-mid)"
        />
        <path
          d="M258 112 L282 132 L270 136 L262 128 Z M236 128 L258 112 L250 132 L242 138 Z M304 126 L334 150 L318 150 Z"
          fill="var(--scene-mid-hi)"
        />
        <g fill="var(--scene-mid)">
          {FAR_PINES.map(([x, h]) => (
            <path key={x} d={pine(x, 170, h, h * 0.55)} />
          ))}
        </g>
      </g>
      <rect x={0} y={152} width={400} height={40} fill={`url(#${id}-mist)`} />
      <path
        d="M0 220 L0 212 C80 208 150 204 210 202 C240 200 270 197 296 198 S360 192 400 186 L400 220 Z"
        fill="var(--scene-near)"
      />
      <g fill="var(--scene-pine)">
        {NEAR_PINES.map(([x, base, h]) => (
          <path key={x} d={pine(x, base, h, h * 0.5)} />
        ))}
      </g>
    </svg>
  );
}

/** A flame beside the streak number: warm edge, bright core, like the reference. */
export function FlameMark({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 28 36" aria-hidden focusable="false" className={className}>
      <defs>
        <radialGradient id={`${id}-outer`} cx="0.5" cy="0.78" r="0.7">
          <stop offset="0" style={{ stopColor: "var(--art-moon)" }} />
          <stop offset="0.5" style={{ stopColor: "var(--art-flame)" }} />
          <stop offset="1" style={{ stopColor: "var(--art-flame)" }} />
        </radialGradient>
        <linearGradient id={`${id}-core`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--art-moon)", stopOpacity: 0.85 }} />
          <stop offset="1" style={{ stopColor: "var(--art-paper)" }} />
        </linearGradient>
      </defs>
      <path
        d="M14 1.5c1.2 5.5-4.4 8.6-4.4 14 0 1.2.4 2.3 1 3.1-2.6-1.4-4.2-3.8-3.8-7.2C3.4 14.7 1.5 19 1.5 23.2 1.5 30 7.1 34.5 14 34.5S26.5 30 26.5 23.2c0-7.6-5.6-11-7.8-15.4-1 3.2-2.3 4.6-3.6 4.6 1.2-3.4.2-7.6-1.1-10.9Z"
        fill={`url(#${id}-outer)`}
      />
      <path
        d="M14 34.5c-3.6 0-6.3-2.6-6.3-6.1 0-3.4 2.7-5.6 3.9-9 1.1 2.3 1.8 3.4 3.4 3.4.6-1.1.6-2.3.5-3.4 2.4 2.3 4.8 5 4.8 9 0 3.5-2.7 6.1-6.3 6.1Z"
        fill={`url(#${id}-core)`}
      />
    </svg>
  );
}

/** One book lying flat: cover on top, spine facing us, the page block at the right end. */
function Book({ x, y, w, tilt = 0 }: { x: number; y: number; w: number; tilt?: number }) {
  const depth = 14;
  const rise = depth * 0.7;
  const h = 15;
  const lines = [4, 8, 12]
    .map((dy) => `M${x + w + 2} ${y + dy} l${depth - 4} ${-rise + 2}`)
    .join(" ");
  return (
    <g transform={tilt ? `rotate(${tilt} ${x + w / 2} ${y})` : undefined}>
      <path
        d={`M${x} ${y} L${x + w} ${y} L${x + w + depth} ${y - rise} L${x + depth} ${y - rise} Z`}
        fill="var(--art-book-2)"
      />
      <path
        d={`M${x + w} ${y} L${x + w + depth} ${y - rise} L${x + w + depth} ${y - rise + h} L${x + w} ${y + h} Z`}
        fill="var(--art-paper)"
      />
      <path d={lines} stroke="var(--art-book-3)" strokeOpacity={0.2} strokeWidth={0.8} />
      <rect x={x} y={y} width={w} height={h} rx={1.5} fill="var(--art-book-1)" />
      <rect x={x} y={y + h - 3} width={w} height={3} fill="var(--art-book-3)" opacity={0.55} />
      <rect x={x + 8} y={y + 3} width={3} height={h - 6} fill="var(--art-paper)" opacity={0.55} />
      <rect
        x={x + w - 12}
        y={y + 3}
        width={3}
        height={h - 6}
        fill="var(--art-paper)"
        opacity={0.55}
      />
      <rect
        x={x + 18}
        y={y + 6}
        width={w * 0.38}
        height={2.5}
        rx={1}
        fill="var(--art-paper)"
        opacity={0.35}
      />
    </g>
  );
}

/** A stack of three books for the "keep your rhythm" card. */
export function BookStack({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 100"
      fill="none"
      aria-hidden
      focusable="false"
      className={cn("rm-art", className)}
    >
      <ellipse cx={80} cy={92} rx={70} ry={6} fill="var(--art-book-3)" opacity={0.18} />
      <Book x={14} y={74} w={112} />
      <Book x={22} y={56} w={102} />
      <Book x={12} y={38} w={106} tilt={-4} />
    </svg>
  );
}
