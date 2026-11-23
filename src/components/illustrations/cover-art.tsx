import { C, Scene, type ArtProps } from "./scene";
import { BookRow } from "./projects-art";

/*
 * Category covers, 4:5 (80 × 100). They replace the typographic cover patterns; an uploaded poster
 * still wins. The picture sits in the lower part so the title can stand above it.
 */

function Cover({ className, children }: ArtProps & { children: React.ReactNode }) {
  return (
    <Scene className={className} viewBox="0 0 80 100" align="xMidYMid">
      <rect width={80} height={100} fill={C.soft} />
      {children}
    </Scene>
  );
}

/** Antologi: several books leaning together. */
export function AnthologyCover({ className }: ArtProps) {
  return (
    <Cover className={className}>
      <rect x={10} y={88} width={60} height={3} fill={C.accent} opacity={0.6} />
      <BookRow
        x={14}
        y={88}
        books={[
          { w: 8, h: 34, fill: C.ink },
          { w: 10, h: 40, fill: C.accent, o: 0.75 },
          { w: 7, h: 30, fill: C.moon },
          { w: 9, h: 36, fill: C.ink, o: 0.65 },
          { w: 9, h: 33, fill: C.accent, tilt: 18 },
        ]}
      />
    </Cover>
  );
}

/** Solo: one book with a ribbon — your own book. */
export function SoloCover({ className }: ArtProps) {
  return (
    <Cover className={className}>
      <ellipse cx={40} cy={88} rx={24} ry={3} fill={C.accent} opacity={0.2} />
      <path d="M26 46 h28 a3 3 0 0 1 3 3 v37 h-31 Z" fill={C.ink} />
      <rect x={26} y={46} width={5} height={40} fill={C.accent} />
      <rect x={31} y={82} width={26} height={4} fill={C.surface} opacity={0.7} />
      <path d="M48 46 v16 l-3.5 -3 l-3.5 3 v-16" fill={C.flame} />
    </Cover>
  );
}

/** Kelas Menulis: a small chalkboard and a pen. */
export function ClassCover({ className }: ArtProps) {
  return (
    <Cover className={className}>
      <rect x={14} y={48} width={52} height={34} rx={2} fill={C.accent} />
      <rect x={14} y={48} width={52} height={34} rx={2} stroke={C.ink} strokeWidth={3} />
      <path
        d="M22 58 h22 M22 65 h30 M22 72 h16"
        stroke={C.surface}
        strokeOpacity={0.75}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <path
        d="M26 82 L20 94 M54 82 L60 94"
        stroke={C.accent}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <path d="M50 76 L62 64" stroke={C.flame} strokeWidth={3} strokeLinecap="round" />
    </Cover>
  );
}

/** Lomba: a trophy between laurel leaves. */
export function ContestCover({ className }: ArtProps) {
  return (
    <Cover className={className}>
      <g fill={C.accent} opacity={0.7}>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <ellipse
              cx={22 + i * 2}
              cy={56 + i * 10}
              rx={3}
              ry={6}
              transform={`rotate(-30 ${22 + i * 2} ${56 + i * 10})`}
            />
            <ellipse
              cx={58 - i * 2}
              cy={56 + i * 10}
              rx={3}
              ry={6}
              transform={`rotate(30 ${58 - i * 2} ${56 + i * 10})`}
            />
          </g>
        ))}
      </g>
      <path d="M30 52 h20 v8 a10 10 0 0 1 -20 0 Z" fill={C.moon} />
      <path
        d="M30 55 h-5 a5 5 0 0 0 5 8 M50 55 h5 a5 5 0 0 1 -5 8"
        stroke={C.moon}
        strokeWidth={2.5}
        fill="none"
      />
      <rect x={38} y={70} width={4} height={8} fill={C.moon} />
      <rect x={31} y={78} width={18} height={6} rx={1} fill={C.ink} />
    </Cover>
  );
}
