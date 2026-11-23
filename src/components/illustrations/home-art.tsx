"use client";

import { useId } from "react";
import { Canvas, Linear, MIST, Radial, Twinkles, cloud, glow, pine, url } from "./paint";

export type DayPart = "pagi" | "siang" | "senja" | "malam";

/** Which part of the day an hour (0–23, the writer's time zone) falls in. */
export function dayPart(hour: number): DayPart {
  if (hour >= 5 && hour < 11) return "pagi";
  if (hour >= 11 && hour < 15) return "siang";
  if (hour >= 15 && hour < 19) return "senja";
  return "malam";
}

/*
 * Beranda: the writer's house on a hill under the sky of their hour (DESIGN.md 7.10). The hour
 * picks the sky, where the sun or moon stands and how brightly the window burns; the theme picks
 * how light the whole scene is (--sky-<part>-* tokens use light-dark()).
 */

type Light = { x: number; y: number; r: number; halo: number; color: string; strength: number };

type Look = {
  light: Light;
  clouds: [number, number, number][];
  window: number;
  stars: string;
  smoke: boolean;
};

const MOON = "var(--art-moon)";
const FLAME = "var(--art-flame)";

const LOOKS: Record<DayPart, Look> = {
  pagi: {
    light: { x: 236, y: 120, r: 17, halo: 90, color: MOON, strength: 0.65 },
    clouds: [
      [286, 62, 54],
      [358, 44, 40],
    ],
    window: 0.25,
    stars: "0",
    smoke: true,
  },
  siang: {
    light: { x: 300, y: 38, r: 15, halo: 72, color: MOON, strength: 0.5 },
    clouds: [
      [214, 70, 50],
      [330, 82, 62],
      [362, 34, 38],
    ],
    window: 0,
    stars: "0",
    smoke: false,
  },
  senja: {
    light: { x: 236, y: 132, r: 22, halo: 110, color: FLAME, strength: 0.55 },
    clouds: [
      [292, 70, 58],
      [216, 48, 36],
    ],
    window: 0.7,
    stars: "0",
    smoke: false,
  },
  malam: {
    light: { x: 330, y: 44, r: 14, halo: 60, color: MOON, strength: 0.5 },
    clouds: [],
    window: 1,
    stars: "var(--sky-stars-malam)",
    smoke: true,
  },
};

const STARS: [number, number][] = [
  [204, 22],
  [238, 50],
  [270, 16],
  [296, 70],
  [372, 24],
  [392, 82],
  [222, 92],
];

const PINES: [number, number, number][] = [
  [266, 156, 22],
  [276, 158, 16],
  [362, 150, 26],
  [374, 152, 18],
];

const NEAR_PINES: [number, number, number][] = [
  [214, 214, 30],
  [228, 216, 42],
  [386, 208, 46],
  [400, 210, 32],
];

/** The house at its own origin (front-left foot at 0,0): gable front, side wall, roof plane. */
function House({ id, look }: { id: string; look: Look }) {
  const lit = look.window > 0;
  return (
    <g transform="translate(284 154)">
      <circle cx={18} cy={-14} r={26} fill={url(`${id}-window`)} opacity={look.window} />
      <path d="M36 -24 L60 -30 L60 -6 L36 0 Z" fill="var(--scene-mid-hi)" />
      <path d="M0 0 V-24 L18 -40 L36 -24 V0 Z" fill="var(--scene-far-hi)" />
      <rect x={46} y={-54} width={5} height={14} fill="var(--art-book-3)" />
      <path d="M18 -42 L42 -48 L63 -29 L39 -23 Z" fill={url(`${id}-roof`)} />
      <path
        d="M-3 -22 L18 -42 L39 -22"
        stroke="var(--art-book-3)"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <rect
        x={12}
        y={-19}
        width={12}
        height={10}
        rx={1}
        fill={lit ? "var(--art-moon)" : "var(--scene-sky-1)"}
      />
      <path d="M18 -19 V-9 M12 -14 H24" stroke="var(--scene-mid)" strokeWidth={1.2} />
      <path d="M44 -2 L52 -4 V-18 L44 -16 Z" fill="var(--art-book-1)" />
      {look.smoke && (
        <path
          d="M48 -56 c-4 -5 4 -8 0 -13 s4 -8 0 -12"
          stroke="var(--scene-mist)"
          strokeOpacity={0.55}
          strokeWidth={2}
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

function HomeDefs({ id, part, look }: { id: string; part: DayPart; look: Look }) {
  return (
    <defs>
      <Linear
        id={`${id}-sky`}
        list={[
          [0, `var(--sky-${part}-1)`],
          [1, `var(--sky-${part}-2)`],
        ]}
      />
      <Radial id={`${id}-halo`} list={glow(look.light.color, look.light.strength)} />
      <Radial id={`${id}-window`} list={glow(MOON, 0.8)} />
      <Linear id={`${id}-mist`} list={MIST} />
      <Linear
        id={`${id}-veil`}
        list={[
          [0, "var(--scene-shadow)", 0],
          [0.45, "var(--scene-shadow)", 1],
          [1, "var(--scene-shadow)", 1],
        ]}
      />
      <Linear
        id={`${id}-roof`}
        list={[
          [0, "var(--art-book-1)"],
          [1, "var(--art-book-3)"],
        ]}
      />
    </defs>
  );
}

/** Beranda: the sky follows the writer's hour — morning sun, high sun, dusk, night moon. */
export function SkyByHour({ part, className }: { part: DayPart; className?: string }) {
  const id = useId();
  const look = LOOKS[part];
  const { light } = look;
  return (
    <Canvas className={className}>
      <HomeDefs id={id} part={part} look={look} />
      <rect className="rm-art-static" width={400} height={220} fill={url(`${id}-sky`)} />
      <Twinkles opacity={look.stars} points={STARS} />
      <g>
        <circle cx={light.x} cy={light.y} r={light.halo} fill={url(`${id}-halo`)} />
        <circle cx={light.x} cy={light.y} r={light.r} fill={light.color} />
        {part === "malam" && (
          <>
            <circle
              cx={light.x - 5}
              cy={light.y - 3}
              r={3.4}
              fill="var(--scene-sky-2)"
              opacity={0.14}
            />
            <circle
              cx={light.x + 5}
              cy={light.y + 5}
              r={2.2}
              fill="var(--scene-sky-2)"
              opacity={0.12}
            />
          </>
        )}
      </g>
      <g fill="var(--scene-mist)" style={{ opacity: "var(--scene-mist-o)" }}>
        {look.clouds.map(([x, y, w]) => (
          <path key={x} d={cloud(x, y, w)} />
        ))}
      </g>
      <g>
        <path
          d="M0 220 L0 150 C50 140 90 128 140 134 C190 140 222 116 270 112 C320 108 350 124 400 118 L400 220 Z"
          fill="var(--scene-far)"
        />
        <path
          d="M222 122 C240 115 254 112 270 112 C300 110 330 117 360 121 L346 124 C320 120 294 117 270 118 C252 119 238 123 222 128 Z"
          fill="var(--scene-far-hi)"
        />
      </g>
      <rect x={0} y={116} width={400} height={44} fill={url(`${id}-mist`)} />
      <g>
        <path
          d="M0 220 L0 186 C60 178 120 176 180 170 C230 165 270 150 310 150 C350 150 380 160 400 158 L400 220 Z"
          fill="var(--scene-mid)"
        />
        <path
          d="M240 162 C266 153 288 150 310 150 C340 150 366 157 400 158 L400 163 C368 162 340 156 310 155 C288 155 266 158 240 166 Z"
          fill="var(--scene-mid-hi)"
        />
        <g fill="var(--scene-near)">
          {PINES.map(([x, base, h]) => (
            <path key={x} d={pine(x, base, h, h * 0.55)} />
          ))}
        </g>
      </g>
      {part === "malam" && (
        <rect
          y={70}
          width={400}
          height={150}
          fill={url(`${id}-veil`)}
          style={{ opacity: "var(--sky-veil-malam)" }}
        />
      )}
      <House id={id} look={look} />
      <path
        d="M0 220 L0 204 C80 196 160 200 220 206 S320 212 400 196 L400 220 Z"
        fill="var(--scene-near)"
      />
      <path
        d="M332 154 C326 170 300 178 296 192 S304 210 296 222"
        stroke="var(--art-paper)"
        strokeOpacity={0.35}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <g fill="var(--scene-pine)">
        {NEAR_PINES.map(([x, base, h]) => (
          <path key={x} d={pine(x, base, h, h * 0.5)} />
        ))}
      </g>
    </Canvas>
  );
}
