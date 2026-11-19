import type { WordCountPin } from "@/features/account/writing-preferences";
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

const number = new Intl.NumberFormat("id-ID");

export function wordCountDisplay(
  pin: WordCountPin | null,
  words: number,
  selectedWords: number | undefined,
  sprint: SprintState,
  target: WordCountTarget | null,
): CounterDisplay {
  const total = number.format(words);
  const documentLabel = `${total} kata`;
  const normal =
    selectedWords === undefined
      ? documentLabel
      : `${number.format(selectedWords)} dari ${documentLabel}`;

  if (pin === "document") return { label: documentLabel };

  if (pin === "sprint") {
    if (sprint.phase === "idle") {
      return {
        label: normal,
        fallbackNote: "Belum ada sprint di halaman ini. Mulai sprint untuk melihat jumlah katanya.",
      };
    }
    const delta = sprint.phase === "running" ? sprintWords(sprint.startWords, words) : sprint.words;
    const count = number.format(delta);
    return { label: `+${count} kata`, accessibleLabel: `Sprint: +${count} kata` };
  }

  if (pin === "target") {
    if (!target) {
      return { label: normal, fallbackNote: "Belum ada target dokumen yang perlu ditampilkan." };
    }
    const label = `${total} / ${number.format(target.words)}`;
    const qualifier = target.missed ? "terlewat" : undefined;
    return {
      label,
      qualifier,
      accessibleLabel: `Target dokumen: ${label}${qualifier ? ` · ${qualifier}` : ""}`,
    };
  }

  return { label: normal };
}
