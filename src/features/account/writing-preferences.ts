export const WRITING_TEXT_SIZES = ["small", "standard", "large"] as const;
export const WRITING_MODES = ["standard", "typewriter"] as const;
export const TYPEWRITER_POSITIONS = ["high", "middle", "low"] as const;
export const WORD_COUNT_PINS = ["document", "sprint", "target"] as const;

export type WordCountPin = (typeof WORD_COUNT_PINS)[number];

export type WritingPreferences = {
  textSize: (typeof WRITING_TEXT_SIZES)[number];
  mode: (typeof WRITING_MODES)[number];
  typewriterPosition: (typeof TYPEWRITER_POSITIONS)[number];
  curlyQuotes: boolean;
  substitutions: boolean;
  wordCountPin: WordCountPin | null;
};

export const DEFAULT_WRITING_PREFERENCES: WritingPreferences = {
  textSize: "standard",
  mode: "standard",
  typewriterPosition: "middle",
  curlyQuotes: false,
  substitutions: false,
  wordCountPin: null,
};

export function parseWritingPreferences(value: unknown): WritingPreferences {
  const defaults = DEFAULT_WRITING_PREFERENCES;
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaults;

  const input = value as Record<string, unknown>;
  return {
    textSize: WRITING_TEXT_SIZES.find((size) => size === input.textSize) ?? defaults.textSize,
    mode: WRITING_MODES.find((mode) => mode === input.mode) ?? defaults.mode,
    typewriterPosition:
      TYPEWRITER_POSITIONS.find((position) => position === input.typewriterPosition) ??
      defaults.typewriterPosition,
    curlyQuotes: input.curlyQuotes === true,
    substitutions: input.substitutions === true,
    wordCountPin:
      WORD_COUNT_PINS.find((pin) => pin === input.wordCountPin) ?? defaults.wordCountPin,
  };
}
