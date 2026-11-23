import { C, Hills, Scene, Stars, type ArtProps } from "./scene";

/** Community: a street of houses with lit windows — many writers, each at their own desk. */
export function LitWindows({ className }: ArtProps) {
  const houses = [
    { x: 96, w: 46, h: 58, roof: 20, o: 0.45, lit: [true, false, true, true] },
    { x: 146, w: 54, h: 84, roof: 24, o: 0.65, lit: [false, true, true, false, true, true] },
    { x: 204, w: 44, h: 64, roof: 18, o: 0.5, lit: [true, true, false, true] },
    { x: 252, w: 58, h: 94, roof: 26, o: 0.75, lit: [true, false, true, true, false, true] },
  ];
  return (
    <Scene className={className}>
      <circle cx={300} cy={22} r={10} fill={C.moon} />
      <Stars
        points={[
          [176, 30],
          [232, 18],
        ]}
      />
      <g transform="translate(96 42) scale(0.7)">
        {houses.map((h) => {
          const top = 170 - h.h;
          const cols = 2;
          return (
            <g key={h.x}>
              <path
                d={`M${h.x - 3} ${top} L${h.x + h.w / 2} ${top - h.roof} L${h.x + h.w + 3} ${top} Z`}
                fill={C.ink}
                opacity={h.o}
              />
              <rect x={h.x} y={top} width={h.w} height={h.h} fill={C.accent} opacity={h.o} />
              {h.lit.map((on, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                return (
                  <rect
                    key={i}
                    x={h.x + 8 + col * (h.w / 2)}
                    y={top + 10 + row * 22}
                    width={h.w / 2 - 14}
                    height={12}
                    rx={1.5}
                    fill={on ? C.moon : C.surface}
                    opacity={on ? 1 : 0.35}
                  />
                );
              })}
            </g>
          );
        })}
      </g>
      <rect x={0} y={161} width={320} height={19} fill={C.accent} opacity={0.35} />
    </Scene>
  );
}

/** One seated person seen from the side. */
function Sitter({
  x,
  y,
  flip = false,
  o = 0.75,
}: {
  x: number;
  y: number;
  flip?: boolean;
  o?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`} opacity={o}>
      <circle cx={0} cy={-34} r={8} fill={C.ink} />
      <path d="M-10 0 C-12 -18 -8 -24 0 -24 C10 -24 12 -16 12 -6 L22 -4 L22 2 Z" fill={C.ink} />
    </g>
  );
}

/** Grup Penulis: a small circle of writers around a campfire. */
export function Campfire({ className }: ArtProps) {
  return (
    <Scene className={className}>
      <Hills far={0.16} near={0.3} />
      <ellipse cx={220} cy={150} rx={70} ry={18} fill={C.moon} opacity={0.18} />
      <Sitter x={150} y={156} o={0.6} />
      <Sitter x={290} y={156} flip o={0.6} />
      <Sitter x={178} y={140} o={0.45} />
      <Sitter x={262} y={140} flip o={0.45} />
      {/* Logs and fire */}
      <path
        d="M198 158 L242 146 M198 146 L242 158"
        stroke={C.ink}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path
        d="M220 104 C232 120 240 128 236 140 C232 152 208 152 204 140 C200 128 212 122 220 104Z"
        fill={C.flame}
      />
      <path
        d="M220 124 C226 132 228 136 226 142 C224 148 216 148 214 142 C212 136 216 132 220 124Z"
        fill={C.moon}
      />
    </Scene>
  );
}

/** Event: a tent under a line of bunting — a gathering with a date. */
export function Bunting({ className }: ArtProps) {
  const flags = [0, 1, 2, 3, 4, 5];
  const colors = [C.flame, C.accent, C.moon, C.ink];
  return (
    <Scene className={className}>
      <Hills far={0.16} near={0.3} />
      <path d="M168 52 Q240 80 316 48" stroke={C.ink} strokeWidth={1.5} />
      {flags.map((i) => {
        const x = 178 + i * 22;
        const y = 56 + Math.sin(((i + 0.5) / flags.length) * Math.PI) * 16;
        return (
          <path
            key={i}
            d={`M${x - 9} ${y} L${x + 9} ${y} L${x} ${y + 18} Z`}
            fill={colors[i % colors.length]}
            opacity={colors[i % colors.length] === C.accent ? 0.6 : 0.95}
          />
        );
      })}
      <path d="M150 162 L214 92 L278 162 Z" fill={C.accent} opacity={0.6} />
      <path d="M214 92 L198 162 H230 Z" fill={C.ink} opacity={0.85} />
    </Scene>
  );
}
