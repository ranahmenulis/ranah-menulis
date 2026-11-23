"use client";

import { useId } from "react";
import { Canvas, Linear, MIST, Radial, Shadow, Twinkles, glow, pine, url } from "./paint";

/*
 * Statistik: a path switching back up a hill to a flag on the summit (DESIGN.md 7.10). Same sky
 * and ridges as the Streak hero so the Studio tabs read as one landscape; the light here rises
 * behind the summit instead of a moon, and cairns mark the way like milestones.
 */

const TRAIL =
  "M204 224 C236 208 282 200 272 186 C262 172 224 172 240 158 C256 144 294 146 296 130 C298 114 280 108 292 94 C302 82 318 76 326 66";

const CAIRNS: [number, number][] = [
  [272, 186],
  [240, 158],
  [296, 130],
];

const HILL_PINES: [number, number, number][] = [
  [356, 102, 14],
  [366, 108, 18],
  [378, 112, 12],
  [228, 152, 12],
  [218, 156, 16],
];

const NEAR_PINES: [number, number, number][] = [
  [330, 214, 36],
  [346, 212, 48],
  [362, 214, 30],
  [380, 210, 52],
  [396, 212, 36],
];

/** A cairn: three stones, lit from the top. */
function Cairn({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Shadow cx={x + 1} cy={y + 1} rx={7} ry={1.6} />
      <ellipse cx={x} cy={y - 2} rx={6} ry={2.6} fill="var(--art-wood-lo)" />
      <ellipse cx={x + 0.5} cy={y - 5.5} rx={4.4} ry={2.2} fill="var(--art-wood)" />
      <ellipse cx={x} cy={y - 8.6} rx={2.8} ry={1.8} fill="var(--art-wood-hi)" />
    </g>
  );
}

function PathDefs({ id }: { id: string }) {
  return (
    <defs>
      <Linear
        id={`${id}-sky`}
        list={[
          [0, "var(--scene-sky-1)"],
          [1, "var(--scene-sky-2)"],
        ]}
      />
      <Radial id={`${id}-dawn`} list={glow("var(--art-moon)", 0.5)} />
      <Radial id={`${id}-beacon`} list={glow("var(--art-flame)", 0.45)} />
      <Linear id={`${id}-mist`} list={MIST} />
    </defs>
  );
}

/** Statistik: a path climbing the hills, marked along the way, a flag at the top. */
export function RisingPath({ className }: { className?: string }) {
  const id = useId();
  return (
    <Canvas className={className}>
      <PathDefs id={id} />
      <rect className="rm-art-static" width={400} height={220} fill={url(`${id}-sky`)} />
      <Twinkles
        opacity="var(--scene-stars)"
        points={[
          [214, 26],
          [252, 58],
          [284, 16],
          [380, 36],
          [236, 92],
          [394, 70],
        ]}
      />
      <circle cx={330} cy={66} r={84} fill={url(`${id}-dawn`)} />
      <g>
        <path
          d="M0 220 L0 150 L50 140 L96 120 L130 132 L170 104 L204 116 L240 92 L268 104 L300 84 L336 100 L372 90 L400 104 L400 220 Z"
          fill="var(--scene-far)"
        />
        <path
          d="M240 92 L268 104 L256 106 Z M170 104 L204 116 L192 118 Z M372 90 L400 104 L386 104 Z"
          fill="var(--scene-far-hi)"
        />
      </g>
      <rect x={0} y={108} width={400} height={48} fill={url(`${id}-mist`)} />
      <g>
        <path
          d="M0 220 L0 196 C60 190 110 182 160 170 C200 160 236 140 262 118 C284 98 304 74 326 64 C340 70 356 84 372 96 C384 104 394 110 400 112 L400 220 Z"
          fill="var(--scene-mid)"
        />
        <path
          d="M326 64 C304 74 284 98 262 118 L278 116 C296 98 312 80 326 64 Z M326 64 C340 70 356 84 372 96 L360 96 C350 86 338 74 326 64 Z"
          fill="var(--scene-mid-hi)"
        />
        <g fill="var(--scene-near)">
          {HILL_PINES.map(([x, base, h]) => (
            <path key={x} d={pine(x, base, h, h * 0.55)} />
          ))}
        </g>
      </g>
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d={TRAIL} stroke="var(--scene-shadow)" strokeOpacity={0.25} strokeWidth={9} />
        <path d={TRAIL} stroke="var(--art-paper)" strokeOpacity={0.6} strokeWidth={6} />
        <path d={TRAIL} stroke="var(--art-book-3)" strokeWidth={1.6} strokeDasharray="1 6" />
      </g>
      <g>
        {CAIRNS.map(([x, y]) => (
          <Cairn key={x} x={x} y={y} />
        ))}
      </g>
      <g>
        <circle cx={340} cy={40} r={20} fill={url(`${id}-beacon`)} />
        <path d="M326 66 V28" stroke="var(--art-wood-lo)" strokeWidth={2} strokeLinecap="round" />
        <path d="M327 29 C336 31 342 28 352 33 C344 37 338 41 327 43 Z" fill="var(--art-flame)" />
        <path d="M327 29 C336 31 342 28 352 33 L327 36 Z" fill="var(--art-moon)" opacity={0.35} />
      </g>
      <rect x={0} y={168} width={400} height={36} fill={url(`${id}-mist`)} />
      <path
        d="M0 220 L0 208 C70 202 130 204 180 210 S270 216 310 210 S370 202 400 198 L400 220 Z"
        fill="var(--scene-near)"
      />
      <g fill="var(--scene-pine)">
        {NEAR_PINES.map(([x, base, h]) => (
          <path key={x} d={pine(x, base, h, h * 0.5)} />
        ))}
      </g>
    </Canvas>
  );
}
