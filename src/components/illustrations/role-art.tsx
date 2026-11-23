"use client";

import { useId } from "react";
import { Canvas, Linear, Radial, Shadow, glow, url } from "./paint";

/*
 * Kelola (DESIGN.md 7.10): one painted object per role, at the right of each role's hero card —
 * a magnifier over a manuscript, brass scales, a chalkboard on an easel, a pinned schedule board
 * and a shield. Gold is the illustration-only moon and flame tokens.
 */

type Props = { className?: string };

const WOOD_SIDE: [number, string][] = [
  [0, "var(--art-wood-lo)"],
  [0.4, "var(--art-wood)"],
  [1, "var(--art-wood-lo)"],
];
const GOLD: [number, string][] = [
  [0, "var(--art-flame)"],
  [0.45, "var(--art-moon)"],
  [1, "var(--art-flame)"],
];

/** Shared gradients: paper, side-lit wood, gold, a soft light. */
function RoleDefs({ id }: { id: string }) {
  return (
    <defs>
      <Linear
        id={`${id}-paper`}
        list={[
          [0, "var(--art-paper)"],
          [1, "var(--art-wood-hi)"],
        ]}
      />
      <Linear id={`${id}-wood`} x2={1} y2={0} list={WOOD_SIDE} />
      <Linear id={`${id}-gold`} x2={1} y2={0} list={GOLD} />
      <Radial id={`${id}-glow`} list={glow("var(--art-moon)", 0.5)} />
      <Radial
        id={`${id}-lens`}
        cx={0.35}
        cy={0.3}
        r={0.8}
        list={[
          [0, "var(--art-paper)", 0.7],
          [1, "var(--scene-sky-2)", 0.35],
        ]}
      />
    </defs>
  );
}

/** A page of manuscript with lines of writing. */
function Page({ id, x, y }: { id: string; x: number; y: number }) {
  return (
    <g>
      <rect
        x={x + 4}
        y={y + 4}
        width={90}
        height={118}
        rx={3}
        fill="var(--scene-shadow)"
        opacity={0.15}
      />
      <rect x={x} y={y} width={90} height={118} rx={3} fill={url(`${id}-paper`)} />
      <path
        d={`M${x + 14} ${y + 22} h60 M${x + 14} ${y + 36} h52 M${x + 14} ${y + 50} h60 M${x + 14} ${y + 64} h44 M${x + 14} ${y + 78} h56 M${x + 14} ${y + 92} h38`}
        stroke="var(--art-wood)"
        strokeOpacity={0.55}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </g>
  );
}

/** Editor: a magnifying glass over a page. */
export function EditorArt({ className }: Props) {
  const id = useId();
  return (
    <Canvas object className={className}>
      <RoleDefs id={id} />
      <Shadow cx={226} cy={166} rx={70} ry={4} />
      <Page id={id} x={172} y={40} />
      <g>
        <path
          d="M276 126 L302 152"
          stroke={url(`${id}-wood`)}
          strokeWidth={10}
          strokeLinecap="round"
        />
        <path d="M270 120 L278 128" stroke="var(--art-book-3)" strokeWidth={8} />
        <circle cx={252} cy={100} r={26} fill={url(`${id}-lens`)} />
        <path
          d="M232 96 h36"
          stroke="var(--art-book-3)"
          strokeOpacity={0.7}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={252} cy={100} r={26} stroke={url(`${id}-gold`)} strokeWidth={5} />
        <path
          d="M236 86 a20 20 0 0 1 14 -8"
          stroke="var(--art-paper)"
          strokeWidth={2.4}
          strokeLinecap="round"
        />
      </g>
    </Canvas>
  );
}

/** Juri: balanced scales. */
export function JudgeArt({ className }: Props) {
  const id = useId();
  const pan = (x: number) => (
    <g>
      <path
        d={`M${x} 60 L${x - 18} 104 M${x} 60 L${x + 18} 104`}
        stroke="var(--art-wood-lo)"
        strokeWidth={1.2}
      />
      <path d={`M${x - 22} 104 h44 a22 12 0 0 1 -44 0 Z`} fill={url(`${id}-gold`)} />
      <ellipse cx={x} cy={104} rx={22} ry={3} fill="var(--art-moon)" opacity={0.7} />
    </g>
  );
  return (
    <Canvas object className={className}>
      <RoleDefs id={id} />
      <circle cx={240} cy={44} r={50} fill={url(`${id}-glow`)} />
      <Shadow cx={240} cy={166} rx={52} ry={4} />
      <g>
        <path d="M212 158 h56 l-6 -8 h-44 Z" fill={url(`${id}-gold`)} />
        <rect x={236} y={44} width={8} height={106} fill={url(`${id}-gold`)} />
        <rect x={182} y={58} width={116} height={4} rx={2} fill={url(`${id}-gold`)} />
        <circle cx={240} cy={42} r={8} fill={url(`${id}-gold`)} />
        <circle cx={238} cy={40} r={2.6} fill="var(--art-paper)" opacity={0.7} />
      </g>
      {pan(186)}
      {pan(294)}
    </Canvas>
  );
}

/** Mentor: a chalkboard on an easel with a lesson on it. */
export function MentorArt({ className }: Props) {
  const id = useId();
  return (
    <Canvas object className={className}>
      <RoleDefs id={id} />
      <Shadow cx={226} cy={170} rx={70} ry={4} />
      <path
        d="M182 130 L166 170 M270 130 L286 170 M226 30 V40"
        stroke={url(`${id}-wood`)}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <g>
        <rect x={150} y={34} width={152} height={98} rx={4} fill={url(`${id}-wood`)} />
        <rect x={157} y={41} width={138} height={84} rx={2} fill="var(--scene-pine)" />
        <rect x={157} y={41} width={138} height={30} fill="var(--art-paper)" opacity={0.06} />
        <path
          d="M170 60 h70 M170 76 h96 M170 92 h56"
          stroke="var(--art-paper)"
          strokeOpacity={0.75}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
        <path
          d="M246 106 l10 10 l22 -26"
          stroke="var(--art-moon)"
          strokeWidth={3.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M150 132 h152 l-6 6 h-140 Z" fill="var(--art-wood-hi)" />
        <rect x={180} y={128} width={12} height={4} rx={1.5} fill="var(--art-paper)" />
      </g>
    </Canvas>
  );
}

/** Organizer: a schedule board with pinned cards. */
export function OrganizerArt({ className }: Props) {
  const id = useId();
  const cards: [number, number, boolean][] = [
    [164, 50, false],
    [212, 50, true],
    [260, 50, false],
    [164, 100, false],
    [212, 100, false],
    [260, 100, false],
  ];
  return (
    <Canvas object className={className}>
      <RoleDefs id={id} />
      <Shadow cx={230} cy={166} rx={84} ry={4} />
      <rect x={150} y={32} width={160} height={128} rx={5} fill={url(`${id}-wood`)} />
      <rect x={156} y={38} width={148} height={116} rx={3} fill="var(--art-wood-hi)" />
      <g>
        {cards.map(([x, y, hot], i) => (
          <g key={`${x}-${y}`} transform={`rotate(${(i % 3) - 1} ${x + 18} ${y})`}>
            <rect
              x={x + 2}
              y={y + 3}
              width={36}
              height={36}
              rx={2}
              fill="var(--scene-shadow)"
              opacity={0.2}
            />
            <rect
              x={x}
              y={y}
              width={36}
              height={36}
              rx={2}
              fill={hot ? "var(--art-moon)" : url(`${id}-paper`)}
            />
            <path
              d={`M${x + 7} ${y + 14} h22 M${x + 7} ${y + 22} h14`}
              stroke="var(--art-wood)"
              strokeOpacity={0.6}
              strokeWidth={1.8}
              strokeLinecap="round"
            />
            <circle cx={x + 18} cy={y + 2} r={3.4} fill="var(--art-flame)" />
            <circle cx={x + 17} cy={y + 1} r={1.1} fill="var(--art-paper)" opacity={0.7} />
          </g>
        ))}
      </g>
    </Canvas>
  );
}

/** Admin: a shield — keeping the place safe. */
export function AdminArt({ className }: Props) {
  const id = useId();
  return (
    <Canvas object className={className}>
      <RoleDefs id={id} />
      <circle cx={240} cy={96} r={74} fill={url(`${id}-glow`)} />
      <Shadow cx={240} cy={166} rx={40} ry={4} />
      <g>
        <path
          d="M240 36 L294 56 V98 C294 128 270 150 240 160 C210 150 186 128 186 98 V56 Z"
          fill={url(`${id}-gold`)}
        />
        <path d="M240 46 L284 62 V98 C284 122 264 140 240 148 Z" fill="var(--art-book-3)" />
        <path d="M240 46 L196 62 V98 C196 122 216 140 240 148 Z" fill="var(--art-book-2)" />
        <path
          d="M220 98 l14 14 l26 -30"
          stroke="var(--art-moon)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </Canvas>
  );
}
