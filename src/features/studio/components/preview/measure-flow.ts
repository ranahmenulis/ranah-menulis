import { mergeLines, type LineBox } from "../../paginate";

/** CSS defines a millimetre as 96 / 25.4 pixels, whatever the screen. */
export const MM_TO_PX = 96 / 25.4;

/**
 * Measures a flow that is laid out in the page (browser only): its total height and the box of
 * every line, from the top of the flow. A line box is the text box widened to the full line
 * height, so a page never ends inside the half-leading of a line.
 */
export function measureFlow(root: HTMLElement): { total: number; lines: LineBox[] } {
  const base = root.getBoundingClientRect().top;
  const rects: LineBox[] = [];
  const range = document.createRange();
  // Not every environment can measure text ranges (jsdom cannot): the flow then has no lines.
  if (typeof range.getClientRects !== "function") {
    return { total: root.getBoundingClientRect().height, lines: [] };
  }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim()) continue;
    const parent = node.parentElement;
    const lineHeight = parent ? parseFloat(getComputedStyle(parent).lineHeight) : Number.NaN;
    range.selectNodeContents(node);
    for (const rect of Array.from(range.getClientRects())) {
      const pad = Number.isFinite(lineHeight) ? Math.max(0, (lineHeight - rect.height) / 2) : 0;
      rects.push({ top: rect.top - base - pad, bottom: rect.bottom - base + pad });
    }
  }
  return { total: root.getBoundingClientRect().height, lines: mergeLines(rects) };
}
