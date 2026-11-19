import { Extension, InputRule, type InputRuleMatch } from "@tiptap/react";
import type { WritingPreferences } from "@/features/account/writing-preferences";

type TypographyPreferences = Pick<WritingPreferences, "curlyQuotes" | "substitutions">;

declare module "@tiptap/core" {
  interface Storage {
    studioTypography: TypographyPreferences;
  }
}

const SUBSTITUTIONS = [
  ["--", "—"],
  ["...", "…"],
] as const;

function matchEnding(input: string, text: string, replacement: string): InputRuleMatch {
  return { index: input.length - text.length, text, data: { replacement } };
}

function typographyMatch(input: string, prefs: TypographyPreferences): InputRuleMatch | null {
  const substitution = prefs.substitutions && SUBSTITUTIONS.find(([text]) => input.endsWith(text));
  if (substitution) return matchEnding(input, substitution[0], substitution[1]);

  const quote = input.at(-1);
  if (!prefs.curlyQuotes || (quote !== "'" && quote !== '"')) return null;
  const previous = input.at(-2);
  const opening = previous === undefined || /[\s([{“‘—–]/u.test(previous);
  const replacement = quote === "'" ? (opening ? "‘" : "’") : opening ? "“" : "”";
  return matchEnding(input, quote, replacement);
}

/** One extension instance per editor. Updating its preferences never resets the editor state. */
export const StudioTypography = Extension.create<object, TypographyPreferences>({
  name: "studioTypography",
  addStorage() {
    return { curlyQuotes: false, substitutions: false };
  },
  addInputRules() {
    return [
      new InputRule({
        find: (input) => typographyMatch(input, this.storage),
        handler: ({ state, range, match }) => {
          // Tiptap also probes rules after composition and programmatic inserts. Only direct text
          // input prepares a separate transaction containing the newly typed text before this rule.
          if (state.tr.before === this.editor.state.doc) return null;
          const replacement: unknown = match.data?.replacement;
          if (typeof replacement !== "string") return null;
          state.tr.insertText(replacement, range.from, range.to);
        },
      }),
    ];
  },
});
