import type { WordCountPin } from "@/features/account/writing-preferences";
import type { Locale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/i18n/format";
import { format } from "@/lib/i18n/provider";
import { studioEditor } from "./copy/editor-id";
import { sprintWords, type SprintState } from "./sprint";

export type WordCountTarget = {
  words: number;
  missed: boolean;
  summary: string;
};

type CounterDisplay = {
  label: string;
  accessibleLabel?: string;
  qualifier?: string;
  fallbackNote?: string;
};

/** The words of the counter, in the interface language (Indonesian when no copy is given). */
export type PinCopy = typeof studioEditor.pin;

export function wordCountDisplay(
  pin: WordCountPin | null,
  words: number,
  selectedWords: number | undefined,
  sprint: SprintState,
  target: WordCountTarget | null,
  copy: PinCopy = studioEditor.pin,
  locale: Locale = "id",
): CounterDisplay {
  const number = (n: number) => formatNumber(n, locale);
  const total = number(words);
  const documentLabel = format(copy.words, { n: total });
  const normal =
    selectedWords === undefined
      ? documentLabel
      : format(copy.selectionOf, { selected: number(selectedWords), total });

  if (pin === "document") return { label: documentLabel };

  if (pin === "sprint") {
    if (sprint.phase === "idle") {
      return {
        label: normal,
        fallbackNote: copy.noSprint,
      };
    }
    const delta = sprint.phase === "running" ? sprintWords(sprint.startWords, words) : sprint.words;
    const count = number(delta);
    return {
      label: format(copy.sprintLabel, { n: count }),
      accessibleLabel: format(copy.sprintAccessible, { n: count }),
    };
  }

  if (pin === "target") {
    if (!target) {
      return { label: normal, fallbackNote: copy.noTarget };
    }
    const label = `${total} / ${number(target.words)}`;
    const qualifier = target.missed ? copy.missed : undefined;
    return {
      label,
      qualifier,
      accessibleLabel: qualifier
        ? format(copy.targetAccessibleMissed, { label, qualifier })
        : format(copy.targetAccessible, { label }),
    };
  }

  return { label: normal };
}
