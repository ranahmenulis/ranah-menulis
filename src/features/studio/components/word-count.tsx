"use client";

import { useRef, useState } from "react";
import { Popover } from "@/components/ui/popover";
import { saveAccountAsync, useAccount } from "@/features/account/account-store";
import { useHydrated } from "@/features/account/hooks/use-hydrated";
import { WORD_COUNT_PINS, type WordCountPin } from "@/features/account/writing-preferences";
import { cn } from "@/lib/cn";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/config";
import { readingMinutes } from "@/lib/text-stats";
import type { EditorStats } from "../editor-stats";
import type { SprintState } from "../sprint";
import { wordCountDisplay, type WordCountTarget } from "../word-count-pin";
import type { studioEditor } from "../copy/editor-id";

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

const NONE = "—";
const PIN_OPTIONS = [...WORD_COUNT_PINS, null];

type CounterCopy = (typeof studioEditor)["counter"];

/** Reading time reads "—" for no words: "1 mnt" would suggest there is something to read. */
const minutes = (words: number, t: CounterCopy) =>
  words > 0 ? format(t.readingMinutes, { n: String(readingMinutes(words)) }) : NONE;

type Row = { label: string; document: string; selected?: string };

function rowsOf(
  words: number,
  stats: EditorStats | null,
  selection: EditorStats | null,
  t: CounterCopy,
  locale: Locale,
): Row[] {
  const count = (value: number | undefined) =>
    value === undefined ? NONE : formatNumber(value, locale);
  const sel = (read: (s: EditorStats) => string) => (selection ? read(selection) : undefined);
  return [
    { label: t.words, document: count(words), selected: sel((s) => count(s.words)) },
    {
      label: t.characters,
      document: count(stats?.characters),
      selected: sel((s) => count(s.characters)),
    },
    {
      label: t.paragraphs,
      document: count(stats?.paragraphs),
      selected: sel((s) => count(s.paragraphs)),
    },
    {
      label: t.readingTime,
      document: minutes(words, t),
      selected: sel((s) => minutes(s.words, t)),
    },
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
  const copy = useT().studioEditor;
  const t = copy.counter;
  const locale = useLocale();
  const pinLabels = { document: t.pinDocument, sprint: t.pinSprint, target: t.pinTarget };

  if (!hydrated || (wordCountPin === "target" && target === undefined)) {
    return <span aria-hidden className="inline-block min-h-8 w-12 shrink-0" />;
  }

  const rows = rowsOf(words, stats, selection, t, locale);
  const display = wordCountDisplay(
    wordCountPin,
    words,
    selection?.words,
    sprint,
    target ?? null,
    copy.pin,
    locale,
  );

  const choose = async (pin: WordCountPin | null) => {
    setSaveFailed(!(await saveAccountAsync({ prefs: { writing: { wordCountPin: pin } } })));
  };
  const retry = async () => {
    if (!(await saveAccountAsync({}))) return;
    activeOption.current?.focus();
    setSaveFailed(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      label={t.label}
      className={cn("max-md:static", className)}
      panelClassName="w-72 p-4 text-sm max-md:inset-x-4 max-md:w-auto"
      renderTrigger={(props) => (
        <button
          {...props}
          type="button"
          aria-label={display.accessibleLabel}
          title={display.accessibleLabel ?? t.details}
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
          {selection ? t.selectedText : t.body}
        </caption>
        {selection && (
          <thead>
            <tr className="text-xs text-ink-muted">
              <td />
              <th scope="col" className="py-1 text-right font-normal">
                {t.selection}
              </th>
              <th scope="col" className="py-1 text-right font-normal">
                {t.documentColumn}
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
          {format(t.targetLine, { summary: target.summary })}
        </p>
      )}
      <div className="mt-3 border-t border-line pt-3">
        <p className="text-xs font-medium">{t.pinTitle}</p>
        <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label={t.pinTitle}>
          {PIN_OPTIONS.map((pin) => (
            <button
              key={pin ?? "none"}
              type="button"
              ref={pin === wordCountPin ? activeOption : undefined}
              aria-pressed={pin === wordCountPin}
              onClick={() => choose(pin)}
              className="h-8 cursor-pointer rounded-full border border-line px-3 text-xs text-ink-muted transition-colors duration-150 hover:bg-subtle hover:text-ink aria-pressed:border-transparent aria-pressed:bg-accent-subtle aria-pressed:font-medium aria-pressed:text-accent-ink"
            >
              {pin === null ? t.pinNone : pinLabels[pin]}
            </button>
          ))}
        </div>
        {display.fallbackNote && (
          <p className="mt-2 text-xs text-ink-muted">{display.fallbackNote}</p>
        )}
        {saveFailed && (
          <div className="mt-2 text-xs text-danger">
            <p role="alert">{t.pinFailed}</p>
            <button
              type="button"
              onClick={retry}
              className="min-h-9 cursor-pointer underline underline-offset-3"
            >
              {t.retry}
            </button>
          </div>
        )}
      </div>
    </Popover>
  );
}
