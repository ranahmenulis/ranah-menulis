import { slugHash } from "@/features/projects/cover-model";
import type { DocumentKind } from "./document-classification";

/**
 * The small page drawn beside a document (DESIGN.md 6.4): its kind sets the layout of the lines,
 * and its word count sets how far down the page the writing has reached. Derived, never stored, so
 * one document looks the same everywhere and grows as it is written.
 */
export type PagePattern = DocumentKind | "polos";

export type PageLine = {
  /** Left edge and width in the 40×50 page box. */
  x: number;
  width: number;
  y: number;
  /** A heading or a speaker name: drawn thicker. */
  strong: boolean;
};

export type PageMark = { pattern: PagePattern; lines: PageLine[] };

export const PAGE_ROWS = 9;
const TOP = 9;
const STEP = 4.2;
const LEFT = 7;
const FULL = 26;

/** How many of the nine rows the writing fills: none for an empty page, all from 5.000 words. */
export function filledRows(words: number): number {
  if (words <= 0) return 0;
  return Math.min(PAGE_ROWS, Math.max(1, Math.ceil(Math.log2(words / 12 + 1))));
}

/** Pseudo-random lengths in [0.45, 1], stable per document (mulberry32 seeded by the id). */
function lengths(id: string): number[] {
  let state = slugHash(id);
  return Array.from({ length: PAGE_ROWS }, () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return Math.round((0.45 + r * 0.55) * 100) / 100;
  });
}

function line(pattern: PagePattern, row: number, length: number): PageLine {
  const y = TOP + row * STEP;
  switch (pattern) {
    case "puisi": {
      // Short centred lines in stanzas of three, a blank row between them.
      const width = FULL * 0.3 + FULL * 0.45 * length;
      return { x: 20 - width / 2, width, y: y + Math.floor(row / 3) * 1.4, strong: false };
    }
    case "esai":
      // A title bar, then justified lines.
      return row === 0
        ? { x: LEFT, width: FULL * 0.6, y, strong: true }
        : { x: LEFT, width: row % 4 === 3 ? FULL * length : FULL, y, strong: false };
    case "novel":
      // A chapter heading in the middle, then prose with an indented first line.
      if (row === 0) return { x: 20 - 5, width: 10, y, strong: true };
      return { x: LEFT + (row === 1 ? 3 : 0), width: FULL - (row === 1 ? 3 : 0), y, strong: false };
    case "naskah":
      // A speaker name, then their line, indented.
      return row % 2 === 0
        ? { x: 15, width: 10, y, strong: true }
        : { x: LEFT + 4, width: (FULL - 8) * length + 4, y, strong: false };
    case "cerpen": {
      // Prose: an indent at each paragraph start, the last line of a paragraph shorter.
      const start = row % 4 === 0;
      const end = row % 4 === 3;
      const x = LEFT + (start ? 3 : 0);
      return { x, width: (end ? FULL * length : FULL) - (start ? 3 : 0), y, strong: false };
    }
    default:
      return { x: LEFT, width: FULL * length, y, strong: false };
  }
}

export function pageMark(doc: { id: string; kind?: DocumentKind; wordCount: number }): PageMark {
  const pattern: PagePattern = doc.kind ?? "polos";
  const rows = filledRows(doc.wordCount);
  const random = lengths(doc.id);
  return {
    pattern,
    lines: Array.from({ length: rows }, (_, row) => line(pattern, row, random[row])),
  };
}
