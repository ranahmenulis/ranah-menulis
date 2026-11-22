import { describe, expect, it } from "vitest";
import { mergeLines, paginate, type LineBox } from "@/features/studio/paginate";

/** `n` lines of `h` pixels with `gap` between them, starting at `top`. */
function lines(n: number, h = 20, gap = 0, top = 0): LineBox[] {
  return Array.from({ length: n }, (_, i) => ({
    top: top + i * (h + gap),
    bottom: top + i * (h + gap) + h,
  }));
}

describe("paginate", () => {
  it("returns one page for a flow that fits", () => {
    expect(paginate(100, lines(5), 200)).toEqual([{ start: 0, height: 100 }]);
  });

  it("returns one empty page for an empty flow or a bad page height", () => {
    expect(paginate(0, [], 200)).toEqual([{ start: 0, height: 200 }]);
    expect(paginate(100, [], 0)).toEqual([{ start: 0, height: 0 }]);
  });

  it("cuts at a line boundary when lines fit the page exactly", () => {
    // 10 lines of 20px, pages of 100px: five lines per page.
    expect(paginate(200, lines(10), 100)).toEqual([
      { start: 0, height: 100 },
      { start: 100, height: 100 },
    ]);
  });

  it("moves a line that would be cut to the next page", () => {
    // Pages of 90px: the fifth line (80 to 100) does not fit and starts page two.
    const pages = paginate(200, lines(10), 90);
    expect(pages[0]).toEqual({ start: 0, height: 80 });
    expect(pages[1].start).toBe(80);
    expect(pages.at(-1)!.start + pages.at(-1)!.height).toBe(200);
  });

  it("leaves the spacing above the first line of a page behind", () => {
    // Two paragraphs of three lines with a 30px gap; the page ends inside the gap.
    const flow = [...lines(3, 20, 0, 0), ...lines(3, 20, 0, 90)];
    const pages = paginate(150, flow, 80);
    expect(pages[0]).toEqual({ start: 0, height: 80 });
    expect(pages[1].start).toBe(90);
  });

  it("never loops on a line taller than a page", () => {
    const pages = paginate(300, [{ top: 0, bottom: 300 }], 100);
    expect(pages.length).toBeGreaterThan(1);
    expect(pages.every((p) => p.height > 0)).toBe(true);
    expect(pages.at(-1)!.start + pages.at(-1)!.height).toBeCloseTo(300);
  });

  it("covers the whole flow without gaps or overlaps", () => {
    const flow = lines(57, 21, 7);
    const total = flow.at(-1)!.bottom;
    const pages = paginate(total, flow, 250);
    let next = 0;
    for (const page of pages) {
      // A page starts where the previous one ended, or at the next line after spacing.
      expect(page.start).toBeGreaterThanOrEqual(next - 0.001);
      expect(page.height).toBeLessThanOrEqual(250.5);
      next = page.start + page.height;
    }
    expect(next).toBeCloseTo(total);
  });
});

describe("mergeLines", () => {
  it("merges fragments of one row and keeps rows apart", () => {
    const merged = mergeLines([
      { top: 0, bottom: 20 },
      { top: 0.5, bottom: 19 },
      { top: 20, bottom: 40 },
      { top: 41, bottom: 61 },
    ]);
    expect(merged).toEqual([
      { top: 0, bottom: 20 },
      { top: 20, bottom: 40 },
      { top: 41, bottom: 61 },
    ]);
  });

  it("drops empty boxes and sorts by position", () => {
    expect(
      mergeLines([
        { top: 40, bottom: 60 },
        { top: 10, bottom: 10 },
        { top: 0, bottom: 20 },
      ]),
    ).toEqual([
      { top: 0, bottom: 20 },
      { top: 40, bottom: 60 },
    ]);
  });
});
