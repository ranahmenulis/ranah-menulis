"use client";

import { useId } from "react";
import { Canvas, Linear, MIST, Radial, Twinkles, glow, pine, url } from "./paint";

/*
 * Community and Lingkar Menulis (DESIGN.md 7.10): a street of houses with lit windows, and a circle
 * of writers around a campfire. Both share the Streak sky and ridges; the warm light comes only
 * from windows and fire (--art-moon, --art-flame).
 */

const SKY = [
  [0, "var(--scene-sky-1)"],
  [1, "var(--scene-sky-2)"],
] as const;

function SkyDefs({ id, light }: { id: string; light: string }) {
  return (
    <>
      <Linear id={`${id}-sky`} list={SKY} />
      <Linear id={`${id}-mist`} list={MIST} />
      <Radial id={`${id}-light`} list={glow(light, 0.75)} />
      <Radial id={`${id}-moon`} list={glow("var(--art-moon)", 0.5)} />
      <Linear
        id={`${id}-roof`}
        list={[
          [0, "var(--art-book-1)"],
          [1, "var(--art-book-3)"],
        ]}
      />
    </>
  );
}

function FarRidge({ id }: { id: string }) {
  return (
    <>
      <path
        d="M0 220 L0 150 L60 138 L110 124 L160 136 L210 112 L250 124 L300 104 L350 120 L400 110 L400 220 Z"
        fill="var(--scene-far)"
      />
      <rect x={0} y={118} width={400} height={44} fill={url(`${id}-mist`)} />
    </>
  );
}

type House = { x: number; w: number; h: number; lit: boolean[] };

/** One house: gable front, side wall, roof plane, a grid of windows (lit ones glow). */
function Townhouse({ id, base, house }: { id: string; base: number; house: House }) {
  const { x, w, h, lit } = house;
  const top = base - h;
  const d = 12;
  const apex = top - w * 0.42;
  const cols = 2;
  return (
    <g>
      <path
        d={`M${x + w} ${top} L${x + w + d} ${top - 4} L${x + w + d} ${base - 4} L${x + w} ${base} Z`}
        fill="var(--scene-mid-hi)"
      />
      <path
        d={`M${x} ${base} V${top} L${x + w / 2} ${apex} L${x + w} ${top} V${base} Z`}
        fill="var(--scene-far-hi)"
      />
      <path
        d={`M${x + w / 2} ${apex - 1} L${x + w / 2 + d} ${apex - 5} L${x + w + d + 2} ${top - 3} L${x + w + 2} ${top + 1} Z`}
        fill={url(`${id}-roof`)}
      />
      <path
        d={`M${x - 2} ${top + 1} L${x + w / 2} ${apex - 1} L${x + w + 2} ${top + 1}`}
        stroke="var(--art-book-3)"
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      {lit.map((on, i) => {
        const wx = x + 6 + (i % cols) * (w / 2 - 2);
        const wy = top + 7 + Math.floor(i / cols) * 16;
        return (
          <g key={i}>
            {on && <circle cx={wx + 5} cy={wy + 5} r={13} fill={url(`${id}-light`)} />}
            <rect
              x={wx}
              y={wy}
              width={w / 2 - 10}
              height={10}
              rx={1}
              fill={on ? "var(--art-moon)" : "var(--scene-sky-2)"}
            />
          </g>
        );
      })}
    </g>
  );
}

const STREET: House[] = [
  { x: 204, w: 40, h: 40, lit: [true, false, false, true] },
  { x: 250, w: 46, h: 60, lit: [false, true, true, true, true, false] },
  { x: 302, w: 38, h: 46, lit: [true, true, false, true] },
  { x: 346, w: 46, h: 70, lit: [true, false, true, true, false, true, true, true] },
];

/** Community: a street of houses with lit windows — many writers, each at their own desk. */
export function LitWindows({ className }: { className?: string }) {
  const id = useId();
  return (
    <Canvas className={className}>
      <defs>
        <SkyDefs id={id} light="var(--art-moon)" />
      </defs>
      <rect className="rm-art-static" width={400} height={220} fill={url(`${id}-sky`)} />
      <Twinkles
        opacity="var(--scene-stars)"
        points={[
          [214, 24],
          [252, 54],
          [286, 18],
          [384, 70],
          [232, 84],
        ]}
      />
      <g>
        <circle cx={340} cy={40} r={50} fill={url(`${id}-moon`)} />
        <circle cx={340} cy={40} r={12} fill="var(--art-moon)" />
      </g>
      <g>
        <FarRidge id={id} />
      </g>
      <g fill="var(--scene-mid)">
        <path d="M180 196 V150 L196 138 L212 150 V160 H236 V136 L252 124 L268 136 V150 H300 V142 L318 128 L336 142 V160 H372 V134 L388 122 L400 130 V196 Z" />
        {[
          [190, 156],
          [256, 142],
          [322, 148],
          [384, 140],
        ].map(([x, y]) => (
          <rect key={x} x={x} y={y} width={6} height={6} fill="var(--art-moon)" opacity={0.7} />
        ))}
      </g>
      <g>
        {STREET.map((house) => (
          <Townhouse key={house.x} id={id} base={196} house={house} />
        ))}
      </g>
      <path
        d="M0 220 L0 202 C80 198 160 196 230 196 S340 194 400 192 L400 220 Z"
        fill="var(--scene-near)"
      />
      <g>
        <circle cx={194} cy={176} r={18} fill={url(`${id}-light`)} />
        <path d="M194 206 V178" stroke="var(--scene-pine)" strokeWidth={2} />
        <rect x={190} y={172} width={8} height={7} rx={1.5} fill="var(--art-moon)" />
      </g>
    </Canvas>
  );
}

/** One seated writer seen from the side, facing +x, rimmed by the firelight. */
function Sitter({
  x,
  y,
  flip = false,
  s = 1,
}: {
  x: number;
  y: number;
  flip?: boolean;
  s?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <circle cx={0} cy={-34} r={7} fill="var(--scene-pine)" />
      <path
        d="M-10 0 C-12 -16 -8 -26 0 -26 C9 -26 12 -18 12 -8 L22 -6 L22 0 Z"
        fill="var(--scene-pine)"
      />
      <path
        d="M0 -26 C9 -26 12 -18 12 -8 L22 -6 M3 -40 a7 7 0 0 1 3 11"
        stroke="var(--art-flame)"
        strokeOpacity={0.75}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <path d="M10 -14 L20 -17 L21 -12 L11 -9 Z" fill="var(--art-paper)" />
    </g>
  );
}

/** Lingkar Menulis: a small circle of writers around a campfire. */
export function Campfire({ className }: { className?: string }) {
  const id = useId();
  return (
    <Canvas className={className}>
      <defs>
        <SkyDefs id={id} light="var(--art-flame)" />
        <Radial
          id={`${id}-flame`}
          cx={0.5}
          cy={0.8}
          r={0.7}
          list={[
            [0, "var(--art-moon)"],
            [0.5, "var(--art-flame)"],
            [1, "var(--art-flame)"],
          ]}
        />
      </defs>
      <rect className="rm-art-static" width={400} height={220} fill={url(`${id}-sky`)} />
      <Twinkles
        opacity="var(--scene-stars)"
        points={[
          [220, 26],
          [262, 50],
          [300, 20],
          [356, 36],
          [388, 62],
        ]}
      />
      <g>
        <FarRidge id={id} />
      </g>
      <g>
        <path
          d="M0 220 L0 180 C80 170 170 168 240 160 C300 154 350 160 400 156 L400 220 Z"
          fill="var(--scene-mid)"
        />
        <g fill="var(--scene-near)">
          {[
            [226, 164, 26],
            [240, 162, 34],
            [366, 158, 30],
            [380, 160, 22],
          ].map(([x, base, h]) => (
            <path key={x} d={pine(x, base, h, h * 0.5)} />
          ))}
        </g>
      </g>
      <circle cx={300} cy={180} r={110} fill={url(`${id}-light`)} />
      <path
        d="M0 220 L0 206 C90 200 180 196 260 196 S360 196 400 192 L400 220 Z"
        fill="var(--scene-near)"
      />
      <g>
        <Sitter x={278} y={170} s={0.8} />
        <Sitter x={322} y={170} flip s={0.8} />
      </g>
      <g>
        {[284, 300, 316].map((x, i) => (
          <ellipse key={x} cx={x} cy={196 - (i % 2)} rx={7} ry={3} fill="var(--art-wood-lo)" />
        ))}
        <path
          d="M282 194 L318 184 M282 184 L318 194"
          stroke="var(--art-wood)"
          strokeWidth={6}
          strokeLinecap="round"
        />
        <path
          d="M300 140 C312 156 322 164 318 178 C314 192 286 192 282 178 C278 164 292 158 300 140 Z"
          fill={url(`${id}-flame`)}
        />
        <path
          d="M300 162 C306 170 308 174 306 180 C304 186 296 186 294 180 C292 174 296 170 300 162 Z"
          fill="var(--art-paper)"
        />
        {[
          [292, 132],
          [310, 124],
          [302, 112],
        ].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r={1.4} fill="var(--art-flame)" />
        ))}
      </g>
      <g>
        <Sitter x={250} y={204} />
        <Sitter x={350} y={204} flip />
      </g>
    </Canvas>
  );
}
