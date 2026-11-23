"use client";

import { useId } from "react";
import { Canvas, Linear, MIST, Radial, Shadow, Twinkles, glow, pine, url } from "./paint";

/*
 * Dasbor Kelas (DESIGN.md 7.10): a path across a meadow to a small schoolhouse on the hill, one
 * lantern post per module. The modules behind you are lit, the ones ahead still dark.
 */

const PATH =
  "M196 224 C220 212 252 208 262 196 C272 184 250 176 262 166 C274 156 300 158 310 148 C318 140 312 132 322 126";

const POSTS: { x: number; y: number; lit: boolean }[] = [
  { x: 244, y: 206, lit: true },
  { x: 252, y: 176, lit: true },
  { x: 292, y: 156, lit: false },
  { x: 306, y: 136, lit: false },
];

/** A lantern on a post: a warm halo when the module is done. */
function Post({ id, x, y, lit }: { id: string; x: number; y: number; lit: boolean }) {
  return (
    <g>
      {lit && <circle cx={x} cy={y - 20} r={16} fill={url(`${id}-lamp`)} />}
      <Shadow cx={x + 2} cy={y} rx={5} ry={1.4} />
      <path d={`M${x} ${y} V${y - 18}`} stroke="var(--art-wood-lo)" strokeWidth={2} />
      <rect
        x={x - 3.5}
        y={y - 25}
        width={7}
        height={8}
        rx={1.5}
        fill={lit ? "var(--art-moon)" : "var(--scene-mid)"}
        stroke="var(--art-wood-lo)"
        strokeWidth={1}
      />
    </g>
  );
}

/** The schoolhouse: front gable with a round window, side wall, roof and a small bell. */
function Schoolhouse({ id }: { id: string }) {
  return (
    <g transform="translate(316 128)">
      <circle cx={18} cy={-14} r={24} fill={url(`${id}-lamp`)} />
      <path d="M36 -22 L58 -27 V-4 L36 0 Z" fill="var(--scene-mid-hi)" />
      <path d="M0 0 V-22 L18 -38 L36 -22 V0 Z" fill="var(--scene-far-hi)" />
      <path d="M18 -40 L40 -45 L60 -26 L38 -21 Z" fill={url(`${id}-roof`)} />
      <path
        d="M-3 -20 L18 -40 L39 -20"
        stroke="var(--art-book-3)"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path d="M26 -42 V-52 L32 -54 V-44" fill="var(--art-book-3)" />
      <circle cx={18} cy={-26} r={4} fill="var(--art-moon)" />
      <path d="M12 0 V-12 a6 6 0 0 1 12 0 V0 Z" fill="var(--art-book-1)" />
      <rect x={42} y={-18} width={9} height={7} fill="var(--art-moon)" opacity={0.85} />
    </g>
  );
}

/** Dasbor Kelas: a path up a hill with one marker per module and a flag at the top. */
export function ClassPath({ className }: { className?: string }) {
  const id = useId();
  return (
    <Canvas className={className}>
      <defs>
        <Linear
          id={`${id}-sky`}
          list={[
            [0, "var(--scene-sky-1)"],
            [1, "var(--scene-sky-2)"],
          ]}
        />
        <Linear id={`${id}-mist`} list={MIST} />
        <Radial id={`${id}-lamp`} list={glow("var(--art-moon)", 0.7)} />
        <Radial id={`${id}-sun`} list={glow("var(--art-moon)", 0.45)} />
        <Linear
          id={`${id}-roof`}
          list={[
            [0, "var(--art-book-1)"],
            [1, "var(--art-book-3)"],
          ]}
        />
      </defs>
      <rect className="rm-art-static" width={400} height={220} fill={url(`${id}-sky`)} />
      <Twinkles
        opacity="var(--scene-stars)"
        points={[
          [216, 30],
          [262, 18],
          [292, 52],
          [386, 34],
        ]}
      />
      <circle cx={380} cy={70} r={80} fill={url(`${id}-sun`)} />
      <g>
        <path
          d="M0 220 L0 146 L70 130 L130 138 L190 114 L240 126 L290 100 L340 116 L400 98 L400 220 Z"
          fill="var(--scene-far)"
        />
        <path
          d="M290 100 L340 116 L324 118 Z M190 114 L240 126 L224 128 Z"
          fill="var(--scene-far-hi)"
        />
      </g>
      <rect x={0} y={112} width={400} height={44} fill={url(`${id}-mist`)} />
      <g>
        <path
          d="M0 220 L0 192 C70 184 140 178 200 168 C250 158 290 132 330 126 C360 122 384 128 400 130 L400 220 Z"
          fill="var(--scene-mid)"
        />
        <path
          d="M250 152 C280 136 306 128 330 126 C356 124 380 128 400 130 L400 134 C378 132 354 130 330 131 C306 133 282 142 258 156 Z"
          fill="var(--scene-mid-hi)"
        />
      </g>
      <Schoolhouse id={id} />
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d={PATH} stroke="var(--scene-shadow)" strokeOpacity={0.22} strokeWidth={8} />
        <path d={PATH} stroke="var(--art-paper)" strokeOpacity={0.55} strokeWidth={5} />
      </g>
      <g>
        {POSTS.map((p) => (
          <Post key={p.x} id={id} {...p} />
        ))}
      </g>
      <path
        d="M0 220 L0 210 C70 204 140 206 190 212 S290 216 330 210 S380 204 400 202 L400 220 Z"
        fill="var(--scene-near)"
      />
      <g fill="var(--scene-pine)">
        {[
          [352, 214, 40],
          [368, 212, 28],
          [384, 214, 46],
          [212, 216, 28],
        ].map(([x, base, h]) => (
          <path key={x} d={pine(x, base, h, h * 0.5)} />
        ))}
      </g>
    </Canvas>
  );
}
