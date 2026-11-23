import { C, Hills, Scene, type ArtProps } from "./scene";

type Book = { w: number; h: number; fill: string; o?: number; tilt?: number };

/** A row of book spines standing on a shelf at y, starting at x. */
export function BookRow({ x, y, books }: { x: number; y: number; books: Book[] }) {
  const lefts = books.map((_, i) => x + books.slice(0, i).reduce((sum, b) => sum + b.w + 2, 0));
  return (
    <g>
      {books.map((b, i) => {
        const bx = lefts[i];
        return (
          <g key={i} transform={b.tilt ? `rotate(${b.tilt} ${bx + b.w} ${y})` : undefined}>
            <rect
              x={bx}
              y={y - b.h}
              width={b.w}
              height={b.h}
              rx={1.5}
              fill={b.fill}
              opacity={b.o ?? 1}
            />
            <rect
              x={bx + 2}
              y={y - b.h + 6}
              width={b.w - 4}
              height={2}
              fill={C.surface}
              opacity={0.5}
            />
          </g>
        );
      })}
    </g>
  );
}

/** Projects: a bookshelf — the door to publishing. */
export function Bookshelf({ className }: ArtProps) {
  return (
    <Scene className={className}>
      <rect x={120} y={28} width={190} height={146} rx={4} fill={C.accent} opacity={0.14} />
      {[90, 160].map((y) => (
        <rect key={y} x={120} y={y} width={190} height={6} fill={C.accent} opacity={0.55} />
      ))}
      <BookRow
        x={130}
        y={90}
        books={[
          { w: 12, h: 48, fill: C.ink },
          { w: 16, h: 54, fill: C.accent, o: 0.7 },
          { w: 10, h: 42, fill: C.moon },
          { w: 14, h: 50, fill: C.ink, o: 0.6 },
          { w: 18, h: 56, fill: C.accent },
          { w: 12, h: 44, fill: C.ink, o: 0.8, tilt: 14 },
        ]}
      />
      <BookRow
        x={136}
        y={160}
        books={[
          { w: 16, h: 52, fill: C.accent, o: 0.8 },
          { w: 12, h: 46, fill: C.ink },
          { w: 20, h: 58, fill: C.accent, o: 0.55 },
          { w: 12, h: 50, fill: C.flame },
          { w: 14, h: 44, fill: C.ink, o: 0.7 },
        ]}
      />
      <rect x={262} y={146} width={36} height={14} rx={2} fill={C.ink} opacity={0.8} />
      <rect x={258} y={134} width={40} height={12} rx={2} fill={C.accent} opacity={0.6} />
    </Scene>
  );
}

/** Dasbor Kelas: a path up a hill with one marker per module and a flag at the top. */
export function ClassPath({ className }: ArtProps) {
  const marks: [number, number][] = [
    [140, 158],
    [210, 138],
    [176, 112],
    [236, 88],
  ];
  return (
    <Scene className={className}>
      <path d="M80 180 L230 54 L320 130 L320 180 Z" fill={C.accent} opacity={0.24} />
      <Hills far={0.14} near={0.34} />
      <path
        d="M110 172 L140 158 L210 138 L176 112 L236 88 L232 60"
        stroke={C.ink}
        strokeWidth={3}
        strokeDasharray="2 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {marks.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={5.5}
          fill={i < 2 ? C.accent : C.surface}
          stroke={C.ink}
          strokeWidth={2.5}
        />
      ))}
      <path d="M232 60 V30" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
      <path d="M233 30 L256 37 L233 45 Z" fill={C.flame} />
    </Scene>
  );
}

/** Dasbor Solo: pages become a cover become a finished book. */
export function BookAssembly({ className }: ArtProps) {
  return (
    <Scene className={className}>
      <ellipse cx={210} cy={164} rx={110} ry={8} fill={C.accent} opacity={0.15} />
      {/* Pages */}
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={96 + i * 4}
          y={104 - i * 6}
          width={38}
          height={52}
          rx={2}
          fill={C.surface}
          stroke={C.line}
        />
      ))}
      <path
        d="M112 106 h20 M112 112 h16 M112 118 h20"
        stroke={C.muted}
        strokeOpacity={0.5}
        strokeWidth={1.5}
      />
      <path
        d="M150 128 h18"
        stroke={C.ink}
        strokeWidth={2}
        strokeDasharray="2 5"
        strokeLinecap="round"
      />
      {/* Cover */}
      <rect x={176} y={96} width={42} height={58} rx={3} fill={C.accent} opacity={0.75} />
      <circle cx={197} cy={118} r={9} fill={C.moon} />
      <path d="M186 140 h22" stroke={C.surface} strokeWidth={2} strokeOpacity={0.8} />
      <path
        d="M226 128 h18"
        stroke={C.ink}
        strokeWidth={2}
        strokeDasharray="2 5"
        strokeLinecap="round"
      />
      {/* Book */}
      <path d="M252 90 h44 a4 4 0 0 1 4 4 v62 h-48 Z" fill={C.ink} />
      <rect x={252} y={90} width={8} height={66} fill={C.accent} />
      <rect x={260} y={150} width={40} height={6} fill={C.surface} opacity={0.7} />
      <path d="M286 90 v22 l-5 -4 l-5 4 v-22" fill={C.flame} />
    </Scene>
  );
}

/** Laurel branch, mirrored for the right side. */
function Laurel({ x, flip = false }: { x: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} 0) scale(${flip ? -1 : 1} 1)`} fill={C.accent} opacity={0.7}>
      {[0, 1, 2, 3].map((i) => (
        <ellipse
          key={i}
          cx={-10 + i * 2}
          cy={40 + i * 12}
          rx={4}
          ry={8}
          transform={`rotate(-30 ${-10 + i * 2} ${40 + i * 12})`}
        />
      ))}
    </g>
  );
}

/** Hasil Lomba: a podium with a trophy between laurels. */
export function Podium({ className }: ArtProps) {
  return (
    <Scene className={className}>
      <rect x={150} y={128} width={50} height={44} fill={C.accent} opacity={0.5} />
      <rect x={200} y={106} width={52} height={66} fill={C.accent} opacity={0.8} />
      <rect x={252} y={140} width={50} height={32} fill={C.accent} opacity={0.4} />
      <g transform="translate(226 27)">
        <Laurel x={-26} />
        <Laurel x={26} flip />
        <path d="M-14 40 h28 v10 a14 14 0 0 1 -28 0 Z" fill={C.moon} />
        <path
          d="M-14 44 h-6 a6 6 0 0 0 6 10 M14 44 h6 a6 6 0 0 1 -6 10"
          stroke={C.moon}
          strokeWidth={3}
          fill="none"
        />
        <rect x={-3} y={63} width={6} height={10} fill={C.moon} />
        <rect x={-11} y={73} width={22} height={6} rx={1} fill={C.ink} />
      </g>
      <rect x={130} y={172} width={190} height={8} fill={C.accent} opacity={0.3} />
    </Scene>
  );
}

/** Proyek saya: envelopes on their way — works sent and waiting for an answer. */
export function SentEnvelopes({ className }: ArtProps) {
  const envelope = (x: number, y: number, r: number, o: number) => (
    <g transform={`rotate(${r} ${x + 24} ${y + 16})`} opacity={o}>
      <rect
        x={x}
        y={y}
        width={48}
        height={32}
        rx={3}
        fill={C.surface}
        stroke={C.ink}
        strokeWidth={2}
      />
      <path
        d={`M${x} ${y + 2} L${x + 24} ${y + 19} L${x + 48} ${y + 2}`}
        stroke={C.ink}
        strokeWidth={2}
      />
    </g>
  );
  return (
    <Scene className={className}>
      <path
        d="M120 150 C170 130 200 100 236 92 S290 70 306 40"
        stroke={C.ink}
        strokeOpacity={0.5}
        strokeWidth={2}
        strokeDasharray="2 7"
        strokeLinecap="round"
      />
      {envelope(132, 124, -6, 1)}
      {envelope(214, 74, -14, 0.85)}
      {envelope(272, 24, -22, 0.6)}
      <circle cx={162} cy={146} r={6} fill={C.flame} />
      <rect x={100} y={164} width={220} height={8} rx={3} fill={C.accent} opacity={0.45} />
    </Scene>
  );
}
