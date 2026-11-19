"use client";

import { useRef, useState } from "react";
import { Popover } from "@/components/ui/popover";
import { saveAccount, useAccount } from "@/features/account/account-store";
import { useHydrated } from "@/features/account/hooks/use-hydrated";
import { WORD_COUNT_PINS, type WordCountPin } from "@/features/account/writing-preferences";
import { cn } from "@/lib/cn";
import { readingMinutes } from "@/lib/text-stats";
import type { EditorStats } from "../editor-stats";
import type { SprintState } from "../sprint";
import { wordCountDisplay, type WordCountTarget } from "../word-count-pin";

type WordCountProps = {
  /** Words in the document, the same number the daily target counts. */
  words: number;
  /** Characters and paragraphs; `null` until the editor has opened the text. */
  stats: EditorStats | null;
  /** Counts for the selected text, or `null` while nothing is selected. */
  selection: EditorStats | null;
  sprint: SprintState;
  /** Undefined while today's date is loading, null when there is no target to show. */
  target: WordCountTarget | null | undefined;
  className?: string;
};

const number = new Intl.NumberFormat("id-ID");
const NONE = "—";
const PIN_LABELS = { document: "Dokumen", sprint: "Sprint", target: "Target dokumen" };
const PIN_OPTIONS = [...WORD_COUNT_PINS, null];

/** Reading time reads "—" for no words: "1 mnt" would suggest there is something to read. */
const minutes = (words: number) => (words > 0 ? `${readingMinutes(words)} mnt` : NONE);

type Row = { label: string; document: string; selected?: string };

function rowsOf(words: number, stats: EditorStats | null, selection: EditorStats | null): Row[] {
  const count = (value: number | undefined) => (value === undefined ? NONE : number.format(value));
  const sel = (read: (s: EditorStats) => string) => (selection ? read(selection) : undefined);
  return [
    { label: "Kata", document: count(words), selected: sel((s) => count(s.words)) },
    {
      label: "Karakter",
      document: count(stats?.characters),
      selected: sel((s) => count(s.characters)),
    },
    {
      label: "Paragraf",
      document: count(stats?.paragraphs),
      selected: sel((s) => count(s.paragraphs)),
    },
    { label: "Waktu baca", document: minutes(words), selected: sel((s) => minutes(s.words)) },
  ];
}

/**
 * The editor bar's counter and live text statistics (STD-04). [usulan] The popover also changes
 * which metric occupies the counter slot (STD-18). Reading time remains 200 words/min (Q-52).
 */
export function WordCount({ words, stats, selection, sprint, target, className }: WordCountProps) {
  const [open, setOpen] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const activeOption = useRef<HTMLButtonElement>(null);
  const hydrated = useHydrated();
  const { wordCountPin } = useAccount().prefs.writing;

  if (!hydrated || (wordCountPin === "target" && target === undefined)) {
    return <span aria-hidden className="inline-block min-h-8 w-12 shrink-0" />;
  }

  const rows = rowsOf(words, stats, selection);
  const display = wordCountDisplay(wordCountPin, words, selection?.words, sprint, target ?? null);

  const choose = (pin: WordCountPin | null) => {
    setSaveFailed(!saveAccount({ prefs: { writing: { wordCountPin: pin } } }));
  };
  const retry = () => {
    if (!saveAccount({})) return;
    activeOption.current?.focus();
    setSaveFailed(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      label="Penghitung tulisan"
      className={cn("max-md:static", className)}
      panelClassName="w-72 p-4 text-sm max-md:inset-x-4 max-md:w-auto"
      renderTrigger={(props) => (
        <button
          {...props}
          type="button"
          aria-label={display.accessibleLabel}
          title={display.accessibleLabel ?? "Rincian penghitung"}
          className="inline-flex min-h-8 cursor-pointer items-center text-xs whitespace-nowrap text-ink-muted tabular-nums hover:text-ink hover:underline hover:underline-offset-3 aria-expanded:text-ink aria-expanded:underline aria-expanded:underline-offset-3 max-md:flex-col max-md:items-end max-md:justify-center max-md:leading-tight"
        >
          <span>{display.label}</span>
          {display.qualifier && (
            <span>
              <span className="whitespace-pre max-md:hidden">{" · "}</span>
              {display.qualifier}
            </span>
          )}
        </button>
      )}
    >
      <table className="w-full border-collapse tabular-nums">
        <caption className="pb-3 text-left font-medium">
          {selection ? "Teks yang dipilih" : "Isi tulisan"}
        </caption>
        {selection && (
          <thead>
            <tr className="text-xs text-ink-muted">
              <td />
              <th scope="col" className="py-1 text-right font-normal">
                Pilihan
              </th>
              <th scope="col" className="py-1 text-right font-normal">
                Dokumen
              </th>
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-line">
              <th scope="row" className="py-2 text-left font-normal text-ink-muted">
                {row.label}
              </th>
              {row.selected !== undefined && <td className="py-2 text-right">{row.selected}</td>}
              <td className={cn("py-2 text-right", row.selected !== undefined && "text-ink-muted")}>
                {row.document}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {target && (
        <p className="mt-3 border-t border-line pt-3 text-xs text-ink-muted tabular-nums">
          Target dokumen · {target.summary}
        </p>
      )}
      <div className="mt-3 border-t border-line pt-3">
        <p className="text-xs font-medium">Sematkan di bilah</p>
        <div className="mt-1 flex flex-wrap gap-x-3" role="group" aria-label="Sematkan di bilah">
          {PIN_OPTIONS.map((pin) => (
            <button
              key={pin ?? "none"}
              type="button"
              ref={pin === wordCountPin ? activeOption : undefined}
              aria-pressed={pin === wordCountPin}
              onClick={() => choose(pin)}
              className="min-h-9 cursor-pointer text-xs text-ink-muted hover:text-ink aria-pressed:font-medium aria-pressed:text-ink aria-pressed:underline aria-pressed:underline-offset-3"
            >
              {pin === null ? "Lepas sematan" : PIN_LABELS[pin]}
            </button>
          ))}
        </div>
        {display.fallbackNote && <p className="text-xs text-ink-muted">{display.fallbackNote}</p>}
        {saveFailed && (
          <div className="mt-2 text-xs text-danger">
            <p role="alert">Sematan hanya berlaku di tab ini sampai tersimpan.</p>
            <button
              type="button"
              onClick={retry}
              className="min-h-9 cursor-pointer underline underline-offset-3"
            >
              Coba lagi
            </button>
          </div>
        )}
      </div>
    </Popover>
  );
}
