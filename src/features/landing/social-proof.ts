/**
 * Social proof numbers from the client's landing brief (15 Nov 2026). They are display strings,
 * not counts, so "1k+" stays as the client wrote it. [konfirmasi] The brief says not to invent
 * figures: the client must name the source (for example Penulis+ or past anthologies) before the
 * landing goes live. Change the values here only; the copy holds the labels.
 */
export const SOCIAL_PROOF = {
  writers: "1k+",
  works: "1k+",
  books: "100",
  programs: "10",
} as const;
