"use client";

import { useId } from "react";
import { BookRow } from "./book-spines";
import { Canvas, Linear, Radial, Shadow, glow, pine, url, volume } from "./paint";

/*
 * Projects catalog and Solo dashboard (DESIGN.md 7.10): a slate bookcase lit from the left, and
 * a manuscript becoming a cover becoming a finished book. Objects, so no sky: volume comes from
 * lit and shaded faces and soft contact shadows.
 */

const WOOD = volume("var(--art-wood-hi)", "var(--art-wood)", "var(--art-wood-lo)");

/** One shelf board: lit top face, front edge. */
function Board({ id, y }: { id: string; y: number }) {
  return (
    <g>
      <path d={`M132 ${y} H292 L300 ${y - 6} H140 Z`} fill="var(--art-wood-hi)" />
      <rect x={132} y={y} width={160} height={6} fill={url(`${id}-front`)} />
    </g>
  );
}

/** Projects: a bookshelf — the door to publishing. */
export function Bookshelf({ className }: { className?: string }) {
  const id = useId();
  return (
    <Canvas object className={className}>
      <defs>
        <Linear id={`${id}-front`} list={WOOD} />
        <Linear
          id={`${id}-back`}
          list={[
            [0, "var(--art-wood-lo)"],
            [1, "var(--scene-shadow)"],
          ]}
        />
        <Radial id={`${id}-light`} list={glow("var(--art-moon)", 0.4)} />
      </defs>
      <Shadow cx={214} cy={176} rx={100} ry={4} />
      <g>
        <path d="M140 22 H300 V164 H140 Z" fill={url(`${id}-back`)} />
        <path d="M292 30 L300 22 V170 L292 176 Z" fill="var(--art-wood-lo)" />
        <path d="M124 30 H132 V176 H124 Z" fill={url(`${id}-front`)} />
        <path d="M124 30 L132 22 H300 L292 30 Z" fill="var(--art-wood-hi)" />
        <rect x={132} y={30} width={160} height={6} fill={url(`${id}-front`)} />
      </g>
      <circle cx={170} cy={70} r={70} fill={url(`${id}-light`)} />
      <BookRow
        x={140}
        y={94}
        books={[
          { w: 11, h: 48, fill: "var(--art-book-3)" },
          { w: 15, h: 54, fill: "var(--art-book-1)" },
          { w: 10, h: 42, fill: "var(--art-moon)" },
          { w: 13, h: 50, fill: "var(--art-book-2)" },
          { w: 17, h: 56, fill: "var(--art-book-1)" },
          { w: 11, h: 44, fill: "var(--art-book-3)", tilt: 14 },
        ]}
      />
      <Board id={id} y={94} />
      <BookRow
        x={144}
        y={164}
        books={[
          { w: 15, h: 52, fill: "var(--art-book-2)" },
          { w: 11, h: 46, fill: "var(--art-book-3)" },
          { w: 19, h: 58, fill: "var(--art-book-1)" },
          { w: 11, h: 50, fill: "var(--art-flame)" },
          { w: 13, h: 44, fill: "var(--art-book-3)" },
        ]}
      />
      <g>
        <path d="M244 164 H284 L288 160 H248 Z" fill="var(--art-book-2)" />
        <rect x={244} y={150} width={40} height={14} fill="var(--art-book-3)" />
        <path d="M248 150 H282 L285 146 H251 Z" fill="var(--art-book-1)" />
        <rect x={248} y={140} width={34} height={10} fill="var(--art-book-1)" />
        <path d="M282 140 L285 136 V146 L282 150 Z" fill="var(--art-paper)" />
      </g>
      <Board id={id} y={164} />
      <rect x={132} y={170} width={160} height={6} fill="var(--art-wood-lo)" />
      <g>
        <path d="M270 30 h16 l-2 -10 h-12 Z" fill="var(--art-flame)" />
        <path
          d="M278 20 c-10 -4 -10 -14 -4 -18 c2 6 4 10 4 18 c0 -8 6 -14 10 -16 c2 8 -2 14 -10 16"
          fill="var(--scene-pine)"
        />
      </g>
    </Canvas>
  );
}

/** A sheet of manuscript lying flat with lines of writing. */
function Sheet({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path
        d={`M${x} ${y} H${x + 40} L${x + 52} ${y - 14} H${x + 12} Z`}
        fill="var(--art-paper)"
        stroke="var(--art-wood-lo)"
        strokeOpacity={0.25}
        strokeWidth={0.6}
      />
      <path
        d={`M${x + 12} ${y - 4} h22 M${x + 15} ${y - 8} h20 M${x + 18} ${y - 11} h12`}
        stroke="var(--art-wood)"
        strokeOpacity={0.6}
        strokeLinecap="round"
      />
    </g>
  );
}

/** Dasbor Solo: pages become a cover become a finished book. */
export function BookAssembly({ className }: { className?: string }) {
  const id = useId();
  return (
    <Canvas object className={className}>
      <defs>
        <Linear
          id={`${id}-cover`}
          x2={1}
          y2={1}
          list={[
            [0, "var(--art-book-2)"],
            [1, "var(--art-book-3)"],
          ]}
        />
        <Linear
          id={`${id}-spine`}
          x2={1}
          y2={0}
          list={[
            [0, "var(--art-book-3)"],
            [1, "var(--art-book-1)"],
          ]}
        />
        <Radial id={`${id}-glow`} list={glow("var(--art-moon)", 0.5)} />
      </defs>
      <g>
        <Shadow cx={130} cy={160} rx={36} ry={3} />
        {[0, 1, 2].map((i) => (
          <Sheet key={i} x={96 + i * 2} y={158 - i * 4} />
        ))}
      </g>
      <path
        d="M156 140 h16 M226 132 h16"
        stroke="var(--art-wood)"
        strokeWidth={2}
        strokeDasharray="2 5"
        strokeLinecap="round"
      />
      <g>
        <Shadow cx={200} cy={160} rx={24} ry={3} />
        <rect x={180} y={98} width={40} height={60} rx={2} fill={url(`${id}-cover`)} />
        <circle cx={200} cy={120} r={14} fill={url(`${id}-glow`)} />
        <circle cx={200} cy={120} r={7} fill="var(--art-moon)" />
        <path
          d="M188 144 h24 M192 149 h16"
          stroke="var(--art-paper)"
          strokeOpacity={0.8}
          strokeLinecap="round"
        />
        <path d={pine(212, 158, 14, 8)} fill="var(--art-book-3)" opacity={0.8} />
      </g>
      <g>
        <Shadow cx={280} cy={161} rx={34} ry={3.5} />
        <path d="M258 84 L266 78 H304 L296 84 Z" fill="var(--art-paper)" />
        <path d="M296 84 L304 78 V154 L296 160 Z" fill="var(--art-paper)" />
        <path
          d="M298 86 V156 M300 84 V154"
          stroke="var(--art-wood-lo)"
          strokeOpacity={0.25}
          strokeWidth={0.6}
        />
        <rect x={250} y={84} width={46} height={76} rx={2} fill={url(`${id}-cover`)} />
        <rect x={250} y={84} width={8} height={76} fill={url(`${id}-spine`)} />
        <circle cx={277} cy={112} r={8} fill="var(--art-moon)" />
        <path d="M266 136 h22 M269 142 h16" stroke="var(--art-paper)" strokeLinecap="round" />
        <path d="M286 84 v22 l-4 -4 l-4 4 v-22 Z" fill="var(--art-flame)" />
      </g>
    </Canvas>
  );
}
