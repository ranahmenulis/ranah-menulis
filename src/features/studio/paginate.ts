/**
 * Splits a continuous flow into pages (Page Preview). Pure: the caller measures the flow in the
 * browser and hands in the line boxes, so the cutting rule can be tested without layout.
 */

/** One rendered line of text, measured from the top of the flow, in pixels. */
export type LineBox = { top: number; bottom: number };

/** The part of the flow shown on one page: from `start`, `height` pixels tall. */
export type PageWindow = { start: number; height: number };

/** Lines in the same row (inline fragments of one line) become one box. */
export function mergeLines(rects: readonly LineBox[], tolerance = 1): LineBox[] {
  const sorted = [...rects]
    .filter((r) => r.bottom > r.top)
    .sort((a, b) => a.top - b.top || a.bottom - b.bottom);
  const lines: LineBox[] = [];
  for (const rect of sorted) {
    const last = lines[lines.length - 1];
    if (last && rect.top < last.bottom - tolerance) {
      last.bottom = Math.max(last.bottom, rect.bottom);
    } else {
      lines.push({ ...rect });
    }
  }
  return lines;
}

/**
 * Cuts a flow of `total` pixels into pages at most `pageHeight` tall. A page never ends in the
 * middle of a line: a line that does not fit moves to the next page, and the next page starts at
 * that line's top, so spacing that sat above it is left behind. A line taller than a page is cut.
 */
export function paginate(
  total: number,
  lines: readonly LineBox[],
  pageHeight: number,
): PageWindow[] {
  if (!(pageHeight > 0) || !(total > 0)) return [{ start: 0, height: Math.max(pageHeight, 0) }];
  const pages: PageWindow[] = [];
  let start = 0;
  while (total - start > pageHeight + 0.5) {
    const limit = start + pageHeight;
    const first = lines.find((line) => line.bottom > limit + 0.5);
    const cut = first && first.top > start + 0.5 ? first.top : limit;
    // A line that starts below the limit leaves whitespace at the end of this page, never more.
    pages.push({ start, height: Math.min(cut, limit) - start });
    start = cut;
  }
  pages.push({ start, height: Math.max(total - start, 0) });
  return pages;
}
