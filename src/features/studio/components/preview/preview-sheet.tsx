"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { format, useT } from "@/lib/i18n/provider";
import { PAGE_MM, textHeightMm, type DocumentLayout } from "../../document-layout";
import type { PageWindow } from "../../paginate";
import { FlowContent } from "./flow-content";
import { MM_TO_PX } from "./measure-flow";

type Props = {
  number: number;
  total: number;
  window: PageWindow;
  layout: DocumentLayout;
  title: string;
  html: string;
  scale: number;
};

/** Whether the element is near the screen. Without IntersectionObserver every page counts as near. */
function useNearScreen(ref: RefObject<HTMLElement | null>) {
  const [near, setNear] = useState(() => typeof IntersectionObserver === "undefined");
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => setNear(entries.some((e) => e.isIntersecting)),
      { rootMargin: "100% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return near;
}

/**
 * One A5 sheet: the margin around a window onto the flow. Pages far from the screen keep their
 * size but draw no text, so a long book does not put hundreds of copies of itself in the page.
 */
export function PreviewSheet({ number, total, window: page, layout, title, html, scale }: Props) {
  const t = useT().studioLayout.preview;
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearScreen(ref);
  const heightPx = textHeightMm(layout) * MM_TO_PX;

  return (
    <figure className="m-0 grid justify-items-center gap-2">
      <div
        ref={ref}
        role="img"
        aria-label={format(t.sheet, { n: String(number) })}
        className="border border-line bg-surface"
        style={{
          width: `${PAGE_MM.width}mm`,
          height: `${PAGE_MM.height}mm`,
          padding: `${layout.marginMm}mm`,
          zoom: scale,
        }}
      >
        <div
          style={{ height: Math.min(page.height, heightPx), overflow: "hidden" }}
          className="text-ink-read"
        >
          {near && (
            <div style={{ transform: `translateY(-${page.start}px)` }}>
              <FlowContent title={title} html={html} />
            </div>
          )}
        </div>
      </div>
      <figcaption className="text-xs text-ink-muted">
        {format(t.pageOf, { n: String(number), total: String(total) })}
      </figcaption>
    </figure>
  );
}
