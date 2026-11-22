"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { useT } from "@/lib/i18n/provider";
import {
  PAGE_MM,
  layoutVars,
  textHeightMm,
  textWidthMm,
  type DocumentLayout,
} from "../../document-layout";
import { paginate, type PageWindow } from "../../paginate";
import { FlowContent } from "./flow-content";
import { MM_TO_PX, measureFlow } from "./measure-flow";
import { PreviewSheet } from "./preview-sheet";

/** Fits the sheet to the width it has, never enlarging it. */
function useFitScale(ref: RefObject<HTMLElement | null>) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const sheet = PAGE_MM.width * MM_TO_PX;
    const fit = () => setScale(Math.min(1, el.clientWidth / sheet) || 1);
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return scale;
}

/**
 * Page Preview: the document laid out on A5 sheets, read-only. Where each sheet ends is measured
 * in the browser from the same text and styles the sheets show, after the fonts have loaded. It is
 * an estimate: a printout or the PDF can break a little differently.
 */
export function PagePreview({
  title,
  html,
  layout,
}: {
  title: string;
  html: string;
  layout: DocumentLayout;
}) {
  const t = useT().studioLayout.preview;
  const wrapRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const scale = useFitScale(wrapRef);
  const [pages, setPages] = useState<PageWindow[]>([]);
  const empty = title.trim() === "" && html.replace(/<[^>]*>/g, "").trim() === "";

  useLayoutEffect(() => {
    let cancelled = false;
    const run = () => {
      const root = measureRef.current;
      if (cancelled || !root) return;
      const { total, lines } = measureFlow(root);
      setPages(paginate(total, lines, textHeightMm(layout) * MM_TO_PX));
    };
    run();
    // Text measured before the fonts arrive breaks differently, so measure again once they have.
    void document.fonts?.ready.then(run);
    return () => {
      cancelled = true;
    };
  }, [title, html, layout]);

  const vars = layoutVars(layout) as CSSProperties;
  const sheets = pages.length > 0 ? pages : [{ start: 0, height: 0 }];

  return (
    <section ref={wrapRef} aria-label={t.region} className="mx-auto grid w-full max-w-full gap-6">
      <p className="text-center text-xs text-ink-muted">{t.note}</p>
      <div
        ref={measureRef}
        aria-hidden
        inert
        className="pointer-events-none fixed top-0 left-0 -z-10 text-ink-read"
        style={{ ...vars, width: `${textWidthMm(layout)}mm`, visibility: "hidden" }}
      >
        <FlowContent title={title} html={html} />
      </div>
      {empty ? (
        <p className="text-center text-sm text-ink-muted">{t.empty}</p>
      ) : (
        <div className="grid justify-items-center gap-8" style={vars}>
          {sheets.map((page, i) => (
            <PreviewSheet
              key={i}
              number={i + 1}
              total={sheets.length}
              window={page}
              layout={layout}
              title={title}
              html={html}
              scale={scale}
            />
          ))}
        </div>
      )}
    </section>
  );
}
