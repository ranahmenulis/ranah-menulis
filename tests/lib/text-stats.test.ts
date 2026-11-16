import { describe, expect, it } from "vitest";
import {
  countCharacters,
  countWords,
  readingMinutes,
  textStats,
  WORDS_PER_MINUTE,
} from "@/lib/text-stats";

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

describe("countCharacters", () => {
  it("counts spaces but not line breaks", () => {
    expect(countCharacters("satu dua\ntiga")).toBe(12);
    expect(countCharacters("a\r\nb")).toBe(2);
  });

  it("counts an emoji as one character", () => {
    expect(countCharacters("hujan 🌧")).toBe(7);
  });

  it("returns 0 for empty text", () => {
    expect(countCharacters("")).toBe(0);
  });
});

describe("readingMinutes", () => {
  it("is at least one minute, even for no words", () => {
    expect(readingMinutes(0)).toBe(1);
    expect(readingMinutes(1)).toBe(1);
  });

  it("rounds up at 200 words a minute", () => {
    expect(readingMinutes(WORDS_PER_MINUTE)).toBe(1);
    expect(readingMinutes(WORDS_PER_MINUTE + 1)).toBe(2);
  });
});

describe("textStats", () => {
  it("counts words, characters without line breaks, and at least one minute", () => {
    expect(textStats(["satu dua tiga", "empat lima"])).toEqual({
      words: 5,
      characters: 23,
      minutes: 1,
    });
  });
});
