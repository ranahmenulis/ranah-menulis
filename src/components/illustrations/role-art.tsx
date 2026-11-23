import { C, Scene, type ArtProps } from "./scene";

/* Kelola: one object per role, drawn at the right of each role's hero card. */

/** Editor: a magnifying glass over a page. */
export function EditorArt({ className }: ArtProps) {
  return (
    <Scene className={className}>
      <rect
        x={176}
        y={40}
        width={90}
        height={118}
        rx={3}
        fill={C.surface}
        stroke={C.line}
        strokeWidth={2}
      />
      <path
        d="M190 62 h60 M190 76 h52 M190 90 h60 M190 104 h44 M190 118 h56"
        stroke={C.muted}
        strokeOpacity={0.45}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle
        cx={256}
        cy={104}
        r={26}
        fill={C.soft}
        fillOpacity={0.6}
        stroke={C.ink}
        strokeWidth={6}
      />
      <path d="M275 123 L302 150" stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
    </Scene>
  );
}

/** Juri: balanced scales. */
export function JudgeArt({ className }: ArtProps) {
  return (
    <Scene className={className}>
      <path d="M240 40 V150 M210 160 h60" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      <path d="M186 60 H294" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
      <circle cx={240} cy={40} r={7} fill={C.moon} />
      <path
        d="M186 60 L170 104 M186 60 L202 104 M294 60 L278 104 M294 60 L310 104"
        stroke={C.ink}
        strokeWidth={1.5}
      />
      <path d="M166 104 h40 a20 12 0 0 1 -40 0Z" fill={C.accent} opacity={0.7} />
      <path d="M274 104 h40 a20 12 0 0 1 -40 0Z" fill={C.accent} opacity={0.7} />
    </Scene>
  );
}

/** Mentor: a chalkboard with a lesson on it. */
export function MentorArt({ className }: ArtProps) {
  return (
    <Scene className={className}>
      <rect x={150} y={34} width={150} height={96} rx={4} fill={C.accent} />
      <rect x={150} y={34} width={150} height={96} rx={4} stroke={C.ink} strokeWidth={5} />
      <path
        d="M166 58 h70 M166 74 h96 M166 90 h56"
        stroke={C.surface}
        strokeOpacity={0.75}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d="M244 104 l10 10 l22 -26"
        stroke={C.moon}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M180 130 L166 170 M270 130 L284 170"
        stroke={C.accent}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </Scene>
  );
}

/** Organizer: a schedule board with pinned cards. */
export function OrganizerArt({ className }: ArtProps) {
  const cards: [number, number, string][] = [
    [164, 52, C.surface],
    [214, 52, C.moon],
    [264, 52, C.surface],
    [164, 100, C.surface],
    [214, 100, C.surface],
    [264, 100, C.soft],
  ];
  return (
    <Scene className={className}>
      <rect x={150} y={32} width={160} height={124} rx={6} fill={C.accent} opacity={0.3} />
      {cards.map(([x, y, fill]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width={40} height={36} rx={3} fill={fill} stroke={C.line} />
          <path
            d={`M${x + 8} ${y + 14} h22 M${x + 8} ${y + 22} h16`}
            stroke={C.muted}
            strokeOpacity={0.5}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <circle cx={x + 20} cy={y} r={3.5} fill={C.flame} />
        </g>
      ))}
    </Scene>
  );
}

/** Admin: a shield — keeping the place safe. */
export function AdminArt({ className }: ArtProps) {
  return (
    <Scene className={className}>
      <circle cx={240} cy={96} r={64} fill={C.soft} />
      <path
        d="M240 40 L290 58 V98 C290 126 268 146 240 156 C212 146 190 126 190 98 V58 Z"
        fill={C.accent}
        opacity={0.85}
      />
      <path d="M240 52 L278 66 V98 C278 120 262 136 240 144 Z" fill={C.ink} opacity={0.5} />
      <path
        d="M220 98 l14 14 l26 -30"
        stroke={C.moon}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Scene>
  );
}
