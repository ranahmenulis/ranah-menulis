"use client";

import { useId } from "react";
import { Canvas, Linear, MIST, Radial, Shadow, Twinkles, glow, pine, url } from "./paint";

/*
 * Event (DESIGN.md 7.10): a striped tent in a meadow under strings of bunting, a small tent
 * behind it, and a warm glow from the open door — a gathering with a date.
 */

const FLAGS = ["var(--art-flame)", "var(--art-book-1)", "var(--art-moon)", "var(--art-book-2)"];

/** A string of pennants hanging between two points, sagging in the middle. */
function Pennants({
  from,
  to,
  sag,
}: {
  from: [number, number];
  to: [number, number];
  sag: number;
}) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const count = Math.round((x2 - x1) / 18);
  const at = (t: number): [number, number] => [
    x1 + (x2 - x1) * t,
    y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * sag,
  ];
  return (
    <g>
      <path
        d={`M${x1} ${y1} Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag * 2} ${x2} ${y2}`}
        stroke="var(--art-wood-lo)"
        strokeWidth={1}
      />
      {Array.from({ length: count }, (_, i) => {
        const [x, y] = at((i + 0.5) / count);
        const fill = FLAGS[i % FLAGS.length];
        return (
          <g key={i}>
            <path d={`M${x - 6} ${y} L${x + 6} ${y} L${x} ${y + 13} Z`} fill={fill} />
            <path
              d={`M${x} ${y} L${x + 6} ${y} L${x} ${y + 13} Z`}
              fill="var(--scene-shadow)"
              opacity={0.22}
            />
          </g>
        );
      })}
    </g>
  );
}

/** A ridge tent: striped front, shaded side, a glowing door. `s` scales it about its foot. */
function Tent({ id, x, base, s = 1 }: { id: string; x: number; base: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${base}) scale(${s})`}>
      <Shadow cx={14} cy={1} rx={60} ry={4} />
      <path d="M0 -92 L26 -100 L76 -8 L50 0 Z" fill="var(--scene-mid-hi)" />
      <path d="M0 -92 L50 0 H-50 Z" fill="var(--art-paper)" />
      <path
        d="M0 -92 L-25 0 H-15 Z M0 -92 L5 0 H15 Z M0 -92 L35 0 H45 Z"
        fill="var(--art-book-2)"
        opacity={0.7}
      />
      <path d="M0 -40 L-14 0 H14 Z" fill="var(--scene-pine)" />
      <path d="M0 -40 L-14 0 H14 Z" fill={url(`${id}-door`)} />
      <path d="M0 -92 V-112" stroke="var(--art-wood-lo)" strokeWidth={1.6} />
      <path d="M1 -112 L14 -107 L1 -102 Z" fill="var(--art-flame)" />
    </g>
  );
}

/** Event: a tent under a line of bunting — a gathering with a date. */
export function Bunting({ className }: { className?: string }) {
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
        <Radial id={`${id}-glow`} list={glow("var(--art-moon)", 0.5)} />
        <Radial id={`${id}-door`} cx={0.5} cy={1} r={0.9} list={glow("var(--art-moon)", 0.95)} />
      </defs>
      <rect className="rm-art-static" width={400} height={220} fill={url(`${id}-sky`)} />
      <Twinkles
        opacity="var(--scene-stars)"
        points={[
          [212, 22],
          [256, 46],
          [372, 26],
          [394, 60],
        ]}
      />
      <circle cx={320} cy={150} r={90} fill={url(`${id}-glow`)} />
      <g>
        <path
          d="M0 220 L0 152 C60 140 120 132 180 138 C230 142 270 124 320 122 C360 120 380 130 400 128 L400 220 Z"
          fill="var(--scene-far)"
        />
        <rect x={0} y={124} width={400} height={44} fill={url(`${id}-mist`)} />
      </g>
      <g>
        <path
          d="M0 220 L0 190 C80 184 160 180 220 178 C290 176 340 172 400 170 L400 220 Z"
          fill="var(--scene-mid)"
        />
        <g fill="var(--scene-near)">
          {[
            [222, 182, 22],
            [234, 180, 30],
            [390, 172, 30],
          ].map(([x, base, h]) => (
            <path key={x} d={pine(x, base, h, h * 0.5)} />
          ))}
        </g>
      </g>
      <Tent id={id} x={378} base={184} s={0.4} />
      <g>
        <path d="M236 200 V142 M398 196 V120" stroke="var(--art-wood-lo)" strokeWidth={2} />
        <Pennants from={[236, 144]} to={[320, 92]} sag={8} />
        <Pennants from={[320, 92]} to={[398, 122]} sag={6} />
      </g>
      <Tent id={id} x={320} base={200} />
      <path
        d="M0 220 L0 208 C100 202 200 204 280 206 S360 204 400 200 L400 220 Z"
        fill="var(--scene-near)"
      />
    </Canvas>
  );
}
