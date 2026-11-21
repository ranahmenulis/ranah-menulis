import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import type { DocumentKind } from "../../document-classification";
import { pageMark } from "../../document-mark";

type Page = { id: string; kind?: DocumentKind; wordCount: number };

/**
 * A document as a small sheet of paper (DESIGN.md 6.4): the lines follow its kind and fill down
 * the page as it grows. The lines write themselves in once, and the sheet lifts when its row is
 * pointed at (`rm-page-host` on the row). Decorative: the kind and word count are also text.
 */
export function DocumentMark({
  page,
  faded = false,
  className,
}: {
  page: Page;
  /** Archived and trashed documents: the sheet sits back. */
  faded?: boolean;
  className?: string;
}) {
  const mark = pageMark(page);
  return (
    <span
      aria-hidden
      data-page={mark.pattern}
      className={cn(
        "rm-page block aspect-[4/5] w-full bg-canvas text-ink outline -outline-offset-1 outline-line-strong",
        faded && "opacity-55",
        className,
      )}
    >
      <svg viewBox="0 0 40 50" className="block size-full" fill="none">
        {mark.pattern === "novel" && (
          <line x1={3.5} x2={3.5} y1={4} y2={46} stroke="currentColor" strokeWidth={0.8} />
        )}
        {mark.lines.map((l, i) => (
          <line
            key={i}
            x1={l.x}
            x2={l.x + l.width}
            y1={l.y}
            y2={l.y}
            stroke="currentColor"
            strokeWidth={l.strong ? 1.8 : 1}
            strokeLinecap="round"
            className="rm-page-line"
            style={{ "--i": i } as CSSProperties}
          />
        ))}
      </svg>
    </span>
  );
}

/** A folder: two sheets fanned behind a third, so it reads as "more than one". */
export function FolderMark({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("rm-page relative block aspect-[4/5] w-full", className)}>
      <span className="rm-page-fan absolute inset-0 rotate-[-7deg] bg-subtle outline -outline-offset-1 outline-line" />
      <span
        data-fan="right"
        className="rm-page-fan absolute inset-0 rotate-[5deg] bg-subtle outline -outline-offset-1 outline-line"
      />
      <span className="absolute inset-0 bg-canvas outline -outline-offset-1 outline-line-strong">
        <span className="absolute inset-x-[18%] top-[22%] h-[3px] bg-ink" />
      </span>
    </span>
  );
}
