import { describe, expect, it } from "vitest";
import { countWords, formatClock } from "./count-words";

describe("countWords", () => {
  it("returns 0 for empty and whitespace-only text", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("  \n\t ")).toBe(0);
  });

  it("counts words separated by any whitespace", () => {
    expect(countWords("Hujan pertama bulan November")).toBe(4);
    expect(countWords("satu\n\ndua\tdua  tiga")).toBe(4);
  });

  it("treats a hyphenated word as one word", () => {
    expect(countWords("bunga-bunga jatuh")).toBe(2);
  });
});

describe("formatClock", () => {
  it("uses 24-hour time with a dot", () => {
    expect(formatClock(new Date(2026, 10, 15, 14, 2))).toBe("14.02");
  });

  it("renders midnight as 00.00, not 24.00", () => {
    expect(formatClock(new Date(2026, 10, 15, 0, 0))).toBe("00.00");
  });
});
