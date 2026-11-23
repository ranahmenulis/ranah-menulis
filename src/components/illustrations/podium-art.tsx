"use client";

import { useId } from "react";
import { Canvas, Linear, Radial, Shadow, glow, url } from "./paint";

/*
 * Hasil Lomba (DESIGN.md 7.10): a three-step podium under a spotlight, a gold cup between laurel
 * branches, a little confetti. Gold is the illustration-only moon and flame tokens.
 */

type Step = { x: number; w: number; h: number };

const STEPS: Step[] = [
  { x: 146, w: 52, h: 34 },
  { x: 198, w: 56, h: 58 },
  { x: 254, w: 52, h: 24 },
];
const FLOOR = 172;
const DEPTH = 10;

/** One podium block: lit top, front face, a numeral-free stripe. */
function Block({ id, step }: { id: string; step: Step }) {
  const { x, w, h } = step;
  const top = FLOOR - h;
  return (
    <g>
      <path
        d={`M${x} ${top} L${x + DEPTH} ${top - DEPTH * 0.6} H${x + w + DEPTH} L${x + w} ${top} Z`}
        fill="var(--art-wood-hi)"
      />
      <rect x={x} y={top} width={w} height={h} fill={url(`${id}-front`)} />
      <rect
        x={x + 8}
        y={top + 8}
        width={w - 16}
        height={3}
        rx={1.5}
        fill="var(--art-paper)"
        opacity={0.5}
      />
    </g>
  );
}

/** Laurel branch, mirrored for the right side. */
function Laurel({ flip = false }: { flip?: boolean }) {
  return (
    <g transform={`scale(${flip ? -1 : 1} 1)`}>
      <path d="M-14 66 C-26 56 -28 40 -22 28" stroke="var(--art-wood-lo)" strokeWidth={1.2} />
      {[0, 1, 2, 3, 4].map((i) => {
        const cx = -24 + i * 1.6;
        const cy = 32 + i * 8;
        return (
          <g key={i} transform={`rotate(-35 ${cx} ${cy})`}>
            <ellipse cx={cx} cy={cy} rx={3.6} ry={7} fill="var(--scene-pine)" />
            <ellipse
              cx={cx - 1}
              cy={cy - 1}
              rx={1.6}
              ry={5}
              fill="var(--scene-mid-hi)"
              opacity={0.5}
            />
          </g>
        );
      })}
    </g>
  );
}

const CONFETTI: [number, number, number, string][] = [
  [170, 40, 20, "var(--art-flame)"],
  [196, 22, -30, "var(--art-book-2)"],
  [262, 30, 40, "var(--art-moon)"],
  [286, 52, -10, "var(--art-flame)"],
  [180, 70, 60, "var(--art-moon)"],
  [276, 78, 15, "var(--art-book-1)"],
];

/** Hasil Lomba: a podium with a trophy between laurels. */
export function Podium({ className }: { className?: string }) {
  const id = useId();
  return (
    <Canvas object className={className}>
      <defs>
        <Linear
          id={`${id}-front`}
          list={[
            [0, "var(--art-wood)"],
            [1, "var(--art-wood-lo)"],
          ]}
        />
        <Linear
          id={`${id}-gold`}
          x2={1}
          y2={0}
          list={[
            [0, "var(--art-flame)"],
            [0.4, "var(--art-moon)"],
            [1, "var(--art-flame)"],
          ]}
        />
        <Radial id={`${id}-spot`} list={glow("var(--art-moon)", 0.55)} />
      </defs>
      <circle cx={232} cy={70} r={86} fill={url(`${id}-spot`)} />
      <g>
        {CONFETTI.map(([x, y, r, fill]) => (
          <rect
            key={x}
            x={x}
            y={y}
            width={5}
            height={2.4}
            fill={fill}
            transform={`rotate(${r} ${x} ${y})`}
          />
        ))}
      </g>
      <g>
        <Shadow cx={230} cy={FLOOR} rx={96} ry={4} />
        {STEPS.map((step) => (
          <Block key={step.x} id={id} step={step} />
        ))}
      </g>
      <g transform="translate(231 30)">
        <Laurel />
        <Laurel flip />
        <path d="M-15 40 h30 v10 a15 15 0 0 1 -30 0 Z" fill={url(`${id}-gold`)} />
        <path
          d="M-15 44 h-6 a6 6 0 0 0 6 10 M15 44 h6 a6 6 0 0 1 -6 10"
          stroke="var(--art-moon)"
          strokeWidth={3}
        />
        <ellipse cx={0} cy={40} rx={15} ry={2.6} fill="var(--art-flame)" opacity={0.6} />
        <rect x={-3} y={64} width={6} height={10} fill={url(`${id}-gold`)} />
        <path d="M-11 74 h22 l2 6 h-26 Z" fill="var(--art-book-3)" />
        <path
          d="M-8 44 v8"
          stroke="var(--art-paper)"
          strokeOpacity={0.7}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </g>
    </Canvas>
  );
}
