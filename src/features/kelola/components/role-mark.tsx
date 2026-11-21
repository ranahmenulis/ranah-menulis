import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Area } from "../access";
import { MARK_PEOPLE_MAX } from "../role-band";

/**
 * The mark of each management role (DESIGN.md 7.8): a small typographic drawing in ink, from the
 * same family as the project covers. Lines write in from the left, strokes draw themselves, dots
 * pop in; all once per mount and still under reduced motion. Always decorative.
 */
const step = (i: number) => ({ "--i": i }) as CSSProperties;
const draw = (i: number) => ({ animationDelay: `${300 + i * 160}ms` }) as CSSProperties;

function Line({
  x,
  y,
  w,
  i,
  faint,
}: {
  x: number;
  y: number;
  w: number;
  i: number;
  faint?: boolean;
}) {
  return (
    <line
      x1={x}
      y1={y}
      x2={x + w}
      y2={y}
      stroke="currentColor"
      strokeWidth={faint ? 1.5 : 2.5}
      strokeLinecap="round"
      opacity={faint ? 0.45 : 0.8}
      className="rm-page-line"
      style={step(i)}
    />
  );
}

/** A stroke that draws itself (pathLength 1, like the today ring). */
function Stroke({ d, i, width = 2.5 }: { d: string; i: number; width?: number }) {
  return (
    <path
      d={d}
      pathLength={1}
      strokeDasharray={1}
      stroke="currentColor"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="rm-ring"
      style={draw(i)}
    />
  );
}

/** Editor: a manuscript with proof marks: a struck word, a caret, a circled word. */
function EditorMark() {
  const lines = [56, 48, 60, 40, 58, 52, 34];
  return (
    <>
      <rect
        x={22}
        y={10}
        width={76}
        height={100}
        stroke="currentColor"
        strokeWidth={1.5}
        opacity={0.5}
      />
      {lines.map((w, i) => (
        <Line key={i} x={32} y={24 + i * 12} w={w} i={i} faint />
      ))}
      <Stroke d="M44 48 H82" i={0} />
      <Stroke d="M60 66 l5 -7 l5 7" i={1} />
      <Stroke d="M60 84 a14 7 0 1 0 28 0 a14 7 0 1 0 -28 0" i={2} width={2} />
    </>
  );
}

/** Juri: weighted criteria above a score ruler from 1 to 10, with the mark set near the top. */
function JudgeMark() {
  const gap = 92 / 9;
  return (
    <>
      {[64, 44, 76].map((w, i) => (
        <Line key={i} x={14} y={18 + i * 11} w={w} i={i} />
      ))}
      <line
        x1={14}
        y1={88}
        x2={106}
        y2={88}
        stroke="currentColor"
        strokeWidth={1.5}
        opacity={0.6}
      />
      {Array.from({ length: 10 }, (_, i) => {
        const tall = i === 4 || i === 9;
        return (
          <rect
            key={i}
            x={14 + i * gap - 0.75}
            y={tall ? 72 : 78}
            width={1.5}
            height={tall ? 16 : 10}
            fill="currentColor"
            className="rm-bar"
            style={step(i * 3)}
          />
        );
      })}
      <text x={14} y={104} fontSize={9} fill="currentColor" opacity={0.6} textAnchor="middle">
        1
      </text>
      <text x={106} y={104} fontSize={9} fill="currentColor" opacity={0.6} textAnchor="middle">
        10
      </text>
      <path
        d={`M${14 + 7 * gap} 70 l-6 -10 h12 z`}
        fill="currentColor"
        className="rm-pop"
        style={step(40)}
      />
    </>
  );
}

/** Mentor: a checklist of tasks, ticked one after another, the last still open. */
function MentorMark() {
  const rows = [52, 64, 44, 58];
  return (
    <>
      {rows.map((w, i) => {
        const y = 16 + i * 25;
        return (
          <g key={i}>
            <rect
              x={14}
              y={y}
              width={16}
              height={16}
              stroke="currentColor"
              strokeWidth={1.5}
              opacity={0.6}
            />
            <Line x={42} y={y + 8} w={w} i={i} faint={i === 3} />
            {i < 3 && <Stroke d={`M17.5 ${y + 8} l4 4.5 l8 -10`} i={i} width={2.5} />}
          </g>
        );
      })}
    </>
  );
}

/** Organizer: a project's stages on a line, the passed ones filled, a flag at the deadline. */
function OrganizerMark() {
  const nodes = [14, 37, 60, 83, 106];
  return (
    <>
      <Line x={14} y={64} w={92} i={0} faint />
      {nodes.map((x, i) => (
        <g key={x}>
          <circle
            cx={x}
            cy={64}
            r={5.5}
            fill={i < 3 ? "currentColor" : "var(--canvas)"}
            stroke="currentColor"
            strokeWidth={1.5}
            className="rm-pop"
            style={step(i * 6 + 6)}
          />
          <Line x={x - 7} y={84} w={14} i={i + 1} faint />
        </g>
      ))}
      <line x1={106} y1={58} x2={106} y2={26} stroke="currentColor" strokeWidth={1.5} />
      <path
        d="M106 26 h-16 l5 6 l-5 6 h16 z"
        fill="currentColor"
        className="rm-pop"
        style={step(40)}
      />
      {[34, 22].map((w, i) => (
        <Line key={w} x={14} y={30 + i * 11} w={w} i={i + 2} />
      ))}
    </>
  );
}

/** Admin: one dot per person on the platform, the suspended ones as rings. */
function AdminMark({ people }: { people: readonly ("full" | "ring")[] }) {
  const cols = 6;
  const gap = 92 / (cols - 1);
  return (
    <>
      {Array.from({ length: MARK_PEOPLE_MAX }, (_, i) => {
        const cx = 14 + (i % cols) * gap;
        const cy = 14 + Math.floor(i / cols) * gap;
        const kind = people[i];
        if (!kind)
          return <circle key={i} cx={cx} cy={cy} r={1.4} fill="currentColor" opacity={0.35} />;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={kind === "full" ? 5 : 4.2}
            fill={kind === "full" ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={kind === "full" ? 0 : 1.5}
            className="rm-pop"
            style={step(i * 3)}
          />
        );
      })}
    </>
  );
}

export function RoleMark({
  area,
  people = [],
  className,
}: {
  area: Area;
  /** Admin only: the people dots (see `peopleDots`). */
  people?: readonly ("full" | "ring")[];
  className?: string;
}) {
  const marks: Record<Area, ReactNode> = {
    editor: <EditorMark />,
    juri: <JudgeMark />,
    mentor: <MentorMark />,
    organizer: <OrganizerMark />,
    admin: <AdminMark people={people} />,
  };
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden
      data-mark={area}
      className={cn("rm-mark shrink-0 text-ink", className)}
    >
      {marks[area]}
    </svg>
  );
}
