"use client";

import { useId } from "react";
import { Canvas, Linear, Radial, Shadow, Twinkles, glow, url, volume } from "./paint";

/*
 * Dokumen: a writing desk at night (DESIGN.md 7.10). The window shows the Streak sky, the lamp
 * throws a warm cone onto the desk, and the pages, books, mug and pen sit in its pool of light.
 */

const WOOD = volume("var(--art-wood-hi)", "var(--art-wood)", "var(--art-wood-lo)");

function DeskDefs({ id }: { id: string }) {
  return (
    <defs>
      <Linear
        id={`${id}-sky`}
        list={[
          [0, "var(--scene-sky-1)"],
          [1, "var(--scene-sky-2)"],
        ]}
      />
      <Radial id={`${id}-moon`} list={glow("var(--art-moon)")} />
      <Radial id={`${id}-bulb`} list={glow("var(--art-moon)", 0.9)} />
      <Radial id={`${id}-pool`} list={glow("var(--art-moon)", 0.6)} />
      <Linear
        id={`${id}-cone`}
        list={[
          [0, "var(--art-moon)", 0.5],
          [1, "var(--art-moon)", 0.04],
        ]}
      />
      <Linear id={`${id}-top`} list={WOOD} />
      <Linear
        id={`${id}-front`}
        list={[
          [0, "var(--art-wood)"],
          [1, "var(--art-wood-lo)"],
        ]}
      />
      <Linear
        id={`${id}-leg`}
        x2={1}
        y2={0}
        list={[
          [0, "var(--art-wood-lo)"],
          [0.4, "var(--art-wood)"],
          [1, "var(--art-wood-lo)"],
        ]}
      />
      <Linear
        id={`${id}-round`}
        x2={1}
        y2={0}
        list={[
          [0, "var(--art-book-3)"],
          [0.35, "var(--art-book-2)"],
          [1, "var(--art-book-3)"],
        ]}
      />
      <clipPath id={`${id}-pane`}>
        <rect x={152} y={18} width={72} height={68} />
      </clipPath>
    </defs>
  );
}

/** The window: night (or morning) sky with the moon over a ridge, frame and sill in wood. */
function DeskWindow({ id }: { id: string }) {
  return (
    <g>
      <rect x={146} y={12} width={84} height={80} rx={3} fill={url(`${id}-top`)} />
      <rect x={152} y={18} width={72} height={68} fill={url(`${id}-sky`)} />
      <g clipPath={url(`${id}-pane`)}>
        <Twinkles
          opacity="var(--scene-stars)"
          points={[
            [162, 28],
            [178, 46],
            [216, 60],
            [170, 64],
          ]}
        />
        <circle cx={204} cy={36} r={28} fill={url(`${id}-moon`)} />
        <circle cx={204} cy={36} r={8} fill="var(--art-moon)" />
        <path
          d="M152 86 L152 70 L168 62 L184 70 L200 57 L224 72 L224 86 Z"
          fill="var(--scene-far)"
        />
        <path d="M200 57 L224 72 L212 72 Z" fill="var(--scene-far-hi)" />
        <path d="M152 86 L152 78 L180 73 L206 80 L224 76 L224 86 Z" fill="var(--scene-mid)" />
      </g>
      <rect
        x={152}
        y={18}
        width={72}
        height={68}
        stroke="var(--art-wood-lo)"
        strokeOpacity={0.35}
      />
      <rect x={187} y={18} width={3} height={68} fill="var(--art-wood-hi)" />
      <rect x={152} y={50} width={72} height={3} fill="var(--art-wood-hi)" />
      <path d="M140 92 H236 L240 97 H136 Z" fill="var(--art-wood-hi)" />
      <rect x={136} y={97} width={104} height={4} fill={url(`${id}-front`)} />
    </g>
  );
}

/** The desk slab: lit top face, shaded front, round legs and their shadow on the floor. */
function Desk({ id }: { id: string }) {
  return (
    <g>
      <Shadow cx={206} cy={178} rx={118} ry={3} />
      <rect x={102} y={156} width={8} height={23} fill={url(`${id}-leg`)} />
      <rect x={302} y={156} width={8} height={23} fill={url(`${id}-leg`)} />
      <rect x={110} y={156} width={192} height={6} fill="var(--art-wood-lo)" />
      <path d="M104 136 H320 V148 H92 Z" fill={url(`${id}-top`)} />
      <rect x={92} y={148} width={228} height={9} fill={url(`${id}-front`)} />
      <path d="M92 148.5 H320" stroke="var(--art-wood-hi)" strokeOpacity={0.7} />
      <rect x={196} y={150.5} width={14} height={2.5} rx={1.2} fill="var(--art-wood-hi)" />
    </g>
  );
}

/** Two closed books, the page stack with lines of writing, a mug with steam and a pen. */
function DeskThings({ id }: { id: string }) {
  return (
    <g>
      <Shadow cx={126} cy={142} rx={22} ry={2.5} />
      <path d="M108 140 H142 L146 135 H112 Z" fill="var(--art-book-2)" />
      <rect x={108} y={140} width={34} height={5} fill="var(--art-book-1)" />
      <path d="M142 140 L146 135 V139 L142 145 Z" fill="var(--art-paper)" />
      <path d="M112 134 H140 L143 130 H115 Z" fill="var(--art-book-1)" />
      <rect x={112} y={134} width={28} height={4} fill="var(--art-book-3)" />
      <Shadow cx={180} cy={143} rx={34} ry={3} />
      <path d="M150 141 H206 L210 135 H154 Z" fill="var(--art-paper)" />
      <rect x={150} y={141} width={56} height={3} fill="var(--art-paper)" />
      <path d="M150 142.5 H206" stroke="var(--art-wood-lo)" strokeOpacity={0.3} strokeWidth={0.6} />
      <path
        d="M158 134 L210 130 L214 124 L162 128 Z"
        fill="var(--art-paper)"
        stroke="var(--art-wood-lo)"
        strokeOpacity={0.2}
        strokeWidth={0.6}
      />
      <path
        d="M168 128.6 L198 126.4 M170 130.6 L192 129"
        stroke="var(--art-wood)"
        strokeOpacity={0.7}
        strokeLinecap="round"
      />
      <Shadow cx={234} cy={139} rx={10} ry={2} />
      <path
        d="M231 118 c-3 -4 3 -6 0 -10 M236 118 c-3 -4 3 -6 0 -10"
        stroke="var(--ink-muted)"
        strokeOpacity={0.35}
        strokeLinecap="round"
      />
      <path d="M241 125 c6 0 6 9 0 9" stroke="var(--art-book-2)" strokeWidth={2.4} />
      <path d="M226 121 h15 v15 a3 3 0 0 1 -3 3 h-9 a3 3 0 0 1 -3 -3 Z" fill={url(`${id}-round`)} />
      <ellipse cx={233.5} cy={121} rx={7.5} ry={2} fill="var(--art-book-3)" />
      <path
        d="M190 147 L232 139"
        stroke="var(--art-book-3)"
        strokeWidth={3.4}
        strokeLinecap="round"
      />
      <path
        d="M196 145.5 L230 139"
        stroke="var(--art-book-2)"
        strokeWidth={0.9}
        strokeLinecap="round"
      />
      <path
        d="M190 147 L185 148.2"
        stroke="var(--art-flame)"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </g>
  );
}

/** The lamp: weighted base, jointed arm, shade with its bright mouth. */
function Lamp({ id }: { id: string }) {
  return (
    <g>
      <Shadow cx={290} cy={140} rx={16} ry={2.5} />
      <ellipse cx={290} cy={137} rx={13} ry={3.5} fill="var(--art-book-3)" />
      <path d="M277 137 a13 3.5 0 0 0 26 0 v-2 a13 3.5 0 0 1 -26 0 Z" fill="var(--art-book-1)" />
      <path
        d="M290 135 L298 106 L272 84"
        stroke="var(--art-book-3)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={298} cy={106} r={3} fill="var(--art-book-1)" />
      <circle cx={265} cy={93} r={16} fill={url(`${id}-bulb`)} />
      <path d="M256 76 L276 70 L284 86 L248 98 Z" fill={url(`${id}-round`)} />
      <path d="M248 98 L284 86" stroke="var(--art-moon)" strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
}

/** Dokumen: a writing desk with a lamp, a stack of pages and a pen. */
export function WritingDesk({ className }: { className?: string }) {
  const id = useId();
  return (
    <Canvas object className={className}>
      <DeskDefs id={id} />
      <DeskWindow id={id} />
      <path d="M248 98 L284 86 L320 137 L204 137 Z" fill={url(`${id}-cone`)} />
      <Desk id={id} />
      <ellipse cx={258} cy={141} rx={56} ry={7} fill={url(`${id}-pool`)} />
      <DeskThings id={id} />
      <Lamp id={id} />
    </Canvas>
  );
}
