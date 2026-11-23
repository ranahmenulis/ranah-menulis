import { C, Scene, type ArtProps } from "./scene";
import { BookRow } from "./book-spines";

const SPINES = [C.ink, C.accent, C.moon, C.ink, C.accent, C.flame, C.ink, C.accent];

/** Profil: the writer's own shelf, one spine per published work (at most 12 drawn). */
export function ProfileShelf({ works, className }: ArtProps & { works: number }) {
  const count = Math.max(0, Math.min(12, works));
  const books = Array.from({ length: count }, (_, i) => ({
    w: 11 + ((i * 7) % 6),
    h: 48 + ((i * 13) % 26),
    fill: SPINES[i % SPINES.length],
    o: SPINES[i % SPINES.length] === C.accent ? 0.7 : 1,
  }));
  return (
    <Scene className={className}>
      <rect x={124} y={150} width={190} height={8} rx={2} fill={C.accent} opacity={0.55} />
      <path d="M144 158 v16 M294 158 v16" stroke={C.accent} strokeOpacity={0.55} strokeWidth={5} />
      {count === 0 ? (
        <path
          d="M194 150 h50"
          stroke={C.ink}
          strokeWidth={2}
          strokeDasharray="3 6"
          strokeLinecap="round"
        />
      ) : (
        <BookRow x={134} y={150} books={books} />
      )}
      <path d="M296 150 v-22 a8 8 0 0 1 16 0 v22" fill={C.moon} opacity={0.9} />
    </Scene>
  );
}

/** Tersimpan: an open book with a ribbon marker. */
export function SavedBook({ className }: ArtProps) {
  return (
    <Scene className={className}>
      <ellipse cx={226} cy={154} rx={90} ry={8} fill={C.accent} opacity={0.15} />
      <path
        d="M226 72 C200 60 168 62 146 70 V146 C168 138 200 138 226 150 Z"
        fill={C.surface}
        stroke={C.ink}
        strokeWidth={2.5}
      />
      <path
        d="M226 72 C252 60 284 62 306 70 V146 C284 138 252 138 226 150 Z"
        fill={C.surface}
        stroke={C.ink}
        strokeWidth={2.5}
      />
      <path
        d="M160 86 c20 -6 40 -6 56 0 M160 98 c20 -6 40 -6 56 0 M160 110 c20 -6 40 -6 48 0"
        stroke={C.muted}
        strokeOpacity={0.45}
        strokeWidth={2}
      />
      <path
        d="M236 86 c20 -6 40 -6 56 0 M236 98 c20 -6 40 -6 40 0"
        stroke={C.muted}
        strokeOpacity={0.45}
        strokeWidth={2}
      />
      <path d="M262 64 V122 L254 114 L246 122 V64" fill={C.flame} />
    </Scene>
  );
}

/** Notifikasi: an envelope under a small lantern — news arriving. */
export function NoticeLantern({ className }: ArtProps) {
  return (
    <Scene className={className}>
      <path d="M268 0 V34" stroke={C.ink} strokeWidth={2} />
      <circle cx={268} cy={66} r={30} fill={C.moon} opacity={0.2} />
      <path d="M256 38 h24 l4 10 h-32 Z" fill={C.ink} />
      <rect x={256} y={48} width={24} height={30} rx={3} fill={C.moon} />
      <path d="M262 48 v30 M274 48 v30" stroke={C.ink} strokeOpacity={0.5} strokeWidth={2} />
      <path d="M254 78 h28 l-4 8 h-20 Z" fill={C.ink} />
      <g transform="rotate(-8 190 128)">
        <rect
          x={150}
          y={104}
          width={84}
          height={54}
          rx={4}
          fill={C.surface}
          stroke={C.ink}
          strokeWidth={2.5}
        />
        <path d="M150 108 L192 136 L234 108" stroke={C.ink} strokeWidth={2.5} />
        <circle cx={192} cy={136} r={7} fill={C.flame} />
      </g>
    </Scene>
  );
}

/** Pengaturan dan akun: a letter with a quill — who you are. */
export function LetterQuill({ className }: ArtProps) {
  return (
    <Scene className={className}>
      <rect
        x={160}
        y={46}
        width={96}
        height={118}
        rx={3}
        fill={C.surface}
        stroke={C.line}
        strokeWidth={2}
        transform="rotate(4 208 105)"
      />
      <g
        transform="rotate(4 208 105)"
        stroke={C.muted}
        strokeOpacity={0.45}
        strokeWidth={2}
        strokeLinecap="round"
      >
        <path d="M174 70 h56 M174 82 h68 M174 94 h60 M174 106 h66 M174 118 h40" />
      </g>
      <circle cx={232} cy={146} r={9} fill={C.flame} opacity={0.9} />
      <path
        d="M300 28 C276 44 258 74 250 112 C266 90 290 66 300 28Z"
        fill={C.accent}
        opacity={0.7}
      />
      <path d="M300 28 L248 120" stroke={C.ink} strokeWidth={2} strokeLinecap="round" />
    </Scene>
  );
}
