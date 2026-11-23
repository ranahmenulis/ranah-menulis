import { C, Hills, Scene, Stars, type ArtProps } from "./scene";

export type DayPart = "pagi" | "siang" | "senja" | "malam";

/** Which part of the day an hour (0–23, the writer's time zone) falls in. */
export function dayPart(hour: number): DayPart {
  if (hour >= 5 && hour < 11) return "pagi";
  if (hour >= 11 && hour < 15) return "siang";
  if (hour >= 15 && hour < 19) return "senja";
  return "malam";
}

/** A small house with a lit window, the writer at home. */
function House() {
  return (
    <g>
      <path d="M232 150 L262 124 L292 150 Z" fill={C.ink} />
      <rect x={238} y={148} width={48} height={22} fill={C.accent} opacity={0.75} />
      <rect x={254} y={154} width={12} height={10} rx={1} fill={C.moon} />
    </g>
  );
}

/** Beranda: the sky follows the writer's hour — morning sun, high sun, dusk, night moon. */
export function SkyByHour({ part, className }: ArtProps & { part: DayPart }) {
  return (
    <Scene className={className}>
      {part === "pagi" && (
        <g>
          <circle cx={118} cy={118} r={34} fill={C.moon} opacity={0.25} />
          <circle cx={118} cy={118} r={20} fill={C.moon} />
        </g>
      )}
      {part === "siang" && (
        <g>
          <circle cx={200} cy={42} r={30} fill={C.moon} opacity={0.22} />
          <circle cx={200} cy={42} r={17} fill={C.moon} />
          <path
            d="M120 60 h40 a10 10 0 0 0 -16 -12 a12 12 0 0 0 -24 12Z"
            fill={C.accent}
            opacity={0.18}
          />
        </g>
      )}
      {part === "senja" && (
        <g>
          <circle cx={170} cy={140} r={44} fill={C.flame} opacity={0.18} />
          <circle cx={170} cy={140} r={24} fill={C.flame} />
        </g>
      )}
      {part === "malam" && (
        <g>
          <circle cx={212} cy={42} r={16} fill={C.moon} />
          <Stars
            points={[
              [120, 30],
              [160, 56],
              [262, 28],
              [292, 62],
              [140, 84],
            ]}
          />
        </g>
      )}
      <Hills far={part === "malam" ? 0.3 : 0.2} near={part === "malam" ? 0.5 : 0.36} />
      <House />
    </Scene>
  );
}
