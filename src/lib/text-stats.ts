/**
 * Text counts shared by the Studio editor, the Streak delta, Community and the landing mockup, so
 * the number a writer sees is the number that is recorded (PRD STD-04).
 */

/** [konfirmasi] Q-52: reading time is words divided by 200 per minute, rounded up. */
export const WORDS_PER_MINUTE = 200;

/** Words separated by any whitespace; a hyphenated word stays one word. */
export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/u).length : 0;
}

/**
 * Characters including spaces, without line breaks. Counted per code point, so an emoji is one
 * character; full grapheme segmentation is skipped because it would run on every keystroke.
 */
export function countCharacters(text: string): number {
  let count = 0;
  for (const char of text) if (char !== "\n" && char !== "\r") count++;
  return count;
}

/** Minutes to read `words`: rounded up, never below one minute. */
export function readingMinutes(words: number): number {
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/** The counts a writer would see for these paragraphs: words, characters, minutes to read. */
export function textStats(paragraphs: readonly string[]) {
  const words = countWords(paragraphs.join("\n"));
  return {
    words,
    characters: countCharacters(paragraphs.join("")),
    minutes: readingMinutes(words),
  };
}
