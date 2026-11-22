import { describe, expect, it } from "vitest";
import {
  DEFAULT_LAYOUT,
  layoutVars,
  sameLayout,
  sanitizeLayout,
  textHeightMm,
  textWidthMm,
} from "@/features/studio/document-layout";

describe("document layout", () => {
  it("defaults to the client brief: Times New Roman 12 pt, 1.5, 20 mm margins", () => {
    expect(DEFAULT_LAYOUT).toEqual({ font: "times", sizePt: 12, lineSpacing: 1.5, marginMm: 20 });
  });

  it("falls back to the default for anything that is not a layout", () => {
    for (const bad of [undefined, null, "x", 5, [], true]) {
      expect(sanitizeLayout(bad)).toEqual(DEFAULT_LAYOUT);
    }
  });

  it("reads each field on its own and drops invalid values", () => {
    expect(sanitizeLayout({ font: "sans", sizePt: 99, lineSpacing: 2, marginMm: 12 })).toEqual({
      font: "sans",
      sizePt: 12,
      lineSpacing: 2,
      marginMm: 12,
    });
    expect(sanitizeLayout({ font: "comic", marginMm: 5 })).toEqual(DEFAULT_LAYOUT);
    expect(sanitizeLayout({ marginMm: Number.NaN })).toEqual(DEFAULT_LAYOUT);
    expect(sanitizeLayout({ marginMm: 41 }).marginMm).toBe(20);
    expect(sanitizeLayout({ marginMm: 40 }).marginMm).toBe(40);
  });

  it("measures the text area of an A5 page", () => {
    expect(textWidthMm(DEFAULT_LAYOUT)).toBe(108);
    expect(textHeightMm(DEFAULT_LAYOUT)).toBe(170);
    expect(textWidthMm({ ...DEFAULT_LAYOUT, marginMm: 10 })).toBe(128);
  });

  it("compares layouts by value", () => {
    expect(sameLayout(DEFAULT_LAYOUT, { ...DEFAULT_LAYOUT })).toBe(true);
    expect(sameLayout(DEFAULT_LAYOUT, { ...DEFAULT_LAYOUT, sizePt: 14 })).toBe(false);
  });

  it("exposes the layout as CSS custom properties", () => {
    const vars = layoutVars({ font: "sans", sizePt: 14, lineSpacing: 2, marginMm: 25 });
    expect(vars["--doc-font"]).toBe("var(--font-sans)");
    expect(vars["--doc-size"]).toBe("14pt");
    expect(vars["--doc-line"]).toBe("2");
    expect(vars["--doc-margin"]).toBe("25mm");
    expect(vars["--doc-text-width"]).toBe("98mm");
    expect(vars["--doc-title-size"]).toBe("20pt");
    expect(layoutVars(DEFAULT_LAYOUT)["--doc-font"]).toContain("Times New Roman");
  });
});
