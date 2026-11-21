import { describe, expect, it } from "vitest";
import { filledRows, PAGE_ROWS, pageMark } from "@/features/studio/document-mark";

describe("filledRows", () => {
  it("leaves an empty document blank and gives any writing at least one line", () => {
    expect(filledRows(0)).toBe(0);
    expect(filledRows(1)).toBe(1);
  });

  it("grows with the word count and stops at a full page", () => {
    const counts = [10, 167, 1_000, 5_000, 80_000].map(filledRows);
    expect([...counts].sort((a, b) => a - b)).toEqual(counts);
    expect(filledRows(5_000)).toBe(PAGE_ROWS);
    expect(filledRows(1_000_000)).toBe(PAGE_ROWS);
  });
});

describe("pageMark", () => {
  it("is the same for the same document", () => {
    const doc = { id: "d1", kind: "cerpen" as const, wordCount: 800 };
    expect(pageMark(doc)).toEqual(pageMark({ ...doc }));
  });

  it("follows the kind, and a document without one gets plain lines", () => {
    expect(pageMark({ id: "d1", kind: "puisi", wordCount: 300 }).pattern).toBe("puisi");
    expect(pageMark({ id: "d1", wordCount: 300 }).pattern).toBe("polos");
  });

  it("centres poem lines and draws speaker names thick in a script", () => {
    for (const l of pageMark({ id: "p", kind: "puisi", wordCount: 5_000 }).lines) {
      expect(l.x + l.width / 2).toBeCloseTo(20);
    }
    const script = pageMark({ id: "s", kind: "naskah", wordCount: 5_000 }).lines;
    expect(script.filter((_, i) => i % 2 === 0).every((l) => l.strong)).toBe(true);
  });

  it("keeps every line inside the page", () => {
    for (const kind of ["cerpen", "puisi", "esai", "novel", "naskah", "lainnya"] as const) {
      for (const l of pageMark({ id: `x-${kind}`, kind, wordCount: 9_000 }).lines) {
        expect(l.x).toBeGreaterThanOrEqual(0);
        expect(l.x + l.width).toBeLessThanOrEqual(40);
        expect(l.y).toBeLessThan(50);
      }
    }
  });
});
