import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { coverOf, type Cover } from "../cover-model";
import type { ProjectCategory } from "../types";

type Props = {
  project: { slug: string; category: ProjectCategory; title: string };
  /** Print the title on the cover (header and featured band); tiles show it under the cover. */
  showTitle?: boolean;
  className?: string;
};

const vars = (values: Record<string, string | number>) => values as CSSProperties;

/** Antologi: a stack of pages, one rule per contributor, aligned by variant. */
function Pages({ cover }: { cover: Cover }) {
  const align = cover.variant; // 0 left, 1 right, 2 centered
  return (
    <svg viewBox="0 0 80 100" className="absolute inset-0 size-full" fill="none">
      {cover.lines.map((length, i) => {
        const width = 60 * length;
        const x = align === 0 ? 10 : align === 1 ? 70 - width : 40 - width / 2;
        const origin = align === 0 ? "left" : align === 1 ? "right" : "center";
        return (
          <line
            key={i}
            x1={x}
            x2={x + width}
            y1={26 + i * 5.2}
            y2={26 + i * 5.2}
            stroke="currentColor"
            strokeWidth={i === 4 ? 1.6 : 0.7}
            className="rm-cover-line"
            style={vars({ "--i": i, "--origin": origin })}
          />
        );
      })}
    </svg>
  );
}

/** Lomba: a rosette of rings and ticks that turns when the tile is pointed at. */
function Rosette({ cover, compact }: { cover: Cover; compact: boolean }) {
  // Variant 0: a centred seal; 1: a large seal cut by the edge; 2: a medal on two ribbon tails.
  const [cx, cy, scale] = [
    [40, 46, 1],
    [56, 66, 1.7],
    [40, 40, 0.8],
  ][cover.variant];
  const count = 3 + Math.round(cover.lines[0] * 3);
  const rings = Array.from({ length: count }, (_, i) => (7 + i * (20 / count)) * scale);
  const tickCount = [32, 48, 24][cover.variant];
  const ticks = Array.from({ length: tickCount }, (_, i) => (i / tickCount) * Math.PI * 2);
  const outer = 30 * scale;
  return (
    <svg
      viewBox="0 0 80 100"
      className={cn("absolute inset-x-0 top-0 w-full", compact ? "h-[72%]" : "h-full")}
      fill="none"
    >
      {cover.variant === 2 && (
        <path
          d={`M${cx - 6} ${cy + 20} L${cx - 12} 92 L${cx - 6} 86 L${cx} 92 L${cx - 2} ${cy + 22} M${cx + 6} ${cy + 20} L${cx + 12} 92 L${cx + 6} 86 L${cx} 92`}
          stroke="currentColor"
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
      )}
      <g
        className="rm-cover-spin"
        stroke="currentColor"
        style={vars({ "--ox": `${cx}px`, "--oy": `${cy}px` })}
      >
        {rings.map((r, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            strokeWidth={i === rings.length - 1 ? 1.2 : 0.6}
            strokeDasharray={cover.variant === 1 && i % 2 === 0 ? "1.4 1.6" : undefined}
          />
        ))}
        {ticks.map((a, i) => (
          <line
            key={i}
            x1={cx + Math.cos(a) * outer}
            y1={cy + Math.sin(a) * outer}
            x2={cx + Math.cos(a) * outer * (i % 4 === 0 ? 1.16 : 1.08)}
            y2={cy + Math.sin(a) * outer * (i % 4 === 0 ? 1.16 : 1.08)}
            strokeWidth={0.6}
          />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={cover.variant === 2 ? 3.4 : 2.4 * scale} fill="currentColor" />
    </svg>
  );
}

/** Kelas: ruled exercise paper with a margin line and one handwritten stroke that draws in. */
function Ruled({ cover }: { cover: Cover }) {
  // The margin line stays left of the label printed at 9%.
  const margin = [5.5, 5.5, 4.5][cover.variant];
  const rows = Array.from({ length: 13 }, (_, i) => 22 + i * 6);
  const end = 30 + cover.lines[1] * 40;
  return (
    <svg viewBox="0 0 80 100" className="absolute inset-0 size-full" fill="none">
      {rows.map((y) => (
        <line key={y} x1={0} x2={80} y1={y} y2={y} stroke="currentColor" strokeOpacity={0.28} />
      ))}
      <line x1={margin} x2={margin} y1={0} y2={100} stroke="currentColor" strokeWidth={0.8} />
      {cover.variant === 2 && (
        <line x1={margin + 1.6} x2={margin + 1.6} y1={0} y2={100} stroke="currentColor" />
      )}
      <path
        d={`M${margin + 5} 57 q3 -7 6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 L${end + margin} 57`}
        pathLength={1}
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinecap="round"
        className="rm-cover-pen"
      />
    </svg>
  );
}

/** Solo: the author's book, so one huge initial and a thin frame. */
function Initial({ cover }: { cover: Cover }) {
  return (
    <>
      {cover.variant !== 2 && (
        <span className="absolute inset-[3.5%] border border-current opacity-40" aria-hidden />
      )}
      <span
        className={cn(
          "rm-cover-initial absolute font-serif leading-[0.8] font-light",
          cover.variant === 1 ? "right-[8%] bottom-[2%]" : "bottom-[6%] left-[10%]",
        )}
        style={{ fontSize: "92cqw" }}
      >
        {cover.initial}
      </span>
    </>
  );
}

/**
 * A project's cover (DESIGN.md 7.6): a printed object in the two cover tones, never a photo. It
 * keeps its own colours in both themes, like BookCover. Decorative: the title is always also text.
 */
export function ProjectCover({ project, showTitle = false, className }: Props) {
  const cover = coverOf(project);
  const ink = cover.tone === "ink";
  return (
    <span
      aria-hidden
      data-cover={cover.pattern}
      className={cn(
        "rm-cover block outline -outline-offset-1",
        ink ? "outline-(--cover-edge)" : "outline-line",
        className,
      )}
    >
      <span
        data-theme="light"
        className={cn(
          "@container relative block aspect-[4/5] overflow-hidden",
          ink ? "bg-ink text-on-ink" : "bg-subtle text-ink",
        )}
      >
        {cover.pattern === "antologi" && <Pages cover={cover} />}
        {cover.pattern === "lomba" && <Rosette cover={cover} compact={showTitle} />}
        {cover.pattern === "kelas" && <Ruled cover={cover} />}
        {cover.pattern === "solo" && <Initial cover={cover} />}

        <span className="absolute top-[7%] left-[9%] font-sans text-[6.5cqw] leading-none font-medium">
          {cover.mark}
        </span>
        {showTitle && (
          <span
            className={cn(
              "absolute right-[9%] bottom-[8%] left-[9%] line-clamp-4 font-serif text-[9cqw] leading-[1.1] text-balance",
              cover.pattern === "solo" && "top-[16%] bottom-auto",
            )}
          >
            {project.title}
          </span>
        )}
      </span>
    </span>
  );
}
