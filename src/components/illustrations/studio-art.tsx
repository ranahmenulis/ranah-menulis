import { C, Hills, Scene, type ArtProps } from "./scene";

/** Dokumen: a writing desk with a lamp, a stack of pages and a pen. */
export function WritingDesk({ className }: ArtProps) {
  return (
    <Scene className={className}>
      {/* Window with the moon behind the desk */}
      <rect x={150} y={22} width={74} height={70} rx={6} fill={C.soft} />
      <rect
        x={150}
        y={22}
        width={74}
        height={70}
        rx={6}
        stroke={C.accent}
        strokeOpacity={0.35}
        strokeWidth={3}
      />
      <path d="M187 22 V92 M150 57 H224" stroke={C.accent} strokeOpacity={0.35} strokeWidth={3} />
      <circle cx={206} cy={40} r={8} fill={C.moon} />
      {/* Lamp light */}
      <path d="M256 74 L214 150 H312 Z" fill={C.moon} opacity={0.22} />
      {/* Desk */}
      <rect x={110} y={148} width={210} height={9} rx={3} fill={C.accent} opacity={0.55} />
      <rect x={124} y={157} width={8} height={23} fill={C.accent} opacity={0.4} />
      <rect x={298} y={157} width={8} height={23} fill={C.accent} opacity={0.4} />
      {/* Lamp */}
      <path d="M292 148 h-24 a12 4 0 0 1 24 0Z" fill={C.ink} />
      <path d="M280 145 L286 104 L258 80" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
      <path d="M244 70 L270 62 L276 82 L250 90 Z" fill={C.ink} />
      {/* Pages */}
      <rect x={150} y={136} width={58} height={12} rx={1.5} fill={C.surface} stroke={C.line} />
      <rect
        x={146}
        y={126}
        width={58}
        height={12}
        rx={1.5}
        fill={C.surface}
        stroke={C.line}
        transform="rotate(-3 175 132)"
      />
      <rect
        x={154}
        y={112}
        width={56}
        height={16}
        rx={1.5}
        fill={C.surface}
        stroke={C.line}
        transform="rotate(4 182 120)"
      />
      <path
        d="M162 118 h30 M162 122 h22"
        stroke={C.muted}
        strokeOpacity={0.5}
        strokeWidth={1.5}
        strokeLinecap="round"
        transform="rotate(4 182 120)"
      />
      {/* Pen */}
      <path d="M216 146 L252 128" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
      <path d="M216 146 L211 149" stroke={C.flame} strokeWidth={4} strokeLinecap="round" />
    </Scene>
  );
}

/** Statistik: a path climbing the hills, marked along the way, a flag at the top. */
export function RisingPath({ className }: ArtProps) {
  const marks: [number, number][] = [
    [120, 150],
    [178, 126],
    [226, 98],
  ];
  return (
    <Scene className={className}>
      <path
        d="M40 180 L170 96 L230 120 L290 56 L320 76 L320 180 Z"
        fill={C.accent}
        opacity={0.18}
      />
      <Hills far={0.22} near={0.38} />
      <path
        d="M70 172 C110 160 120 150 150 140 S196 118 214 106 S258 72 280 62"
        stroke={C.ink}
        strokeWidth={3}
        strokeDasharray="2 7"
        strokeLinecap="round"
      />
      {marks.map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r={5} fill={C.surface} stroke={C.ink} strokeWidth={2.5} />
      ))}
      <path d="M280 62 V30" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
      <path d="M281 30 L304 37 L281 45 Z" fill={C.flame} />
    </Scene>
  );
}
