"use client";

import { Button } from "@/components/ui/button";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
import type { Locale } from "@/lib/i18n/config";
import type { DailyLog } from "../daily-progress";
import { totalWords } from "../daily-progress";
import { formatClock } from "../count-words";
import type { SprintApi } from "../hooks/use-sprint";
import type { SaveStatus } from "../hooks/use-studio-document";
import { formatRemaining, remainingMs, resultText } from "../sprint";

type FocusHudProps = {
  status: SaveStatus;
  savedAt: Date | null;
  words: number;
  progress: DailyLog;
  target: number;
  sprint: SprintApi;
  onExit: () => void;
};

type EditorText = ReturnType<typeof useT>["studioEditor"];

function saveText(status: SaveStatus, savedAt: Date | null, t: EditorText, locale: Locale) {
  if (status === "failed") return t.save.failedLabel;
  if (status === "saving") return t.save.saving;
  if (status === "draft" || !savedAt) return t.save.draft;
  return format(t.save.savedAt, { time: formatClock(savedAt, locale) });
}

/**
 * Focus mode leaves only the text plus two quiet corners: the way out, and one dim line with save
 * state, word count, and today's target (DESIGN.md 6.3). No lines, no filled buttons.
 */
export function FocusHud({
  status,
  savedAt,
  words,
  progress,
  target,
  sprint,
  onExit,
}: FocusHudProps) {
  const t = useT().studioEditor;
  const locale = useLocale();
  const fmt = useFormat();
  return (
    <>
      <div className="fixed top-[calc(1rem+var(--safe-top))] right-4 z-20 md:top-[calc(1.25rem+var(--safe-top))] md:right-6">
        <Button variant="text" size="sm" onClick={onExit} className="font-normal text-ink-faint">
          {t.focus.exit}
        </Button>
      </div>
      <p
        role="status"
        className="fixed right-4 bottom-4 z-20 flex flex-wrap justify-end gap-x-3 text-xs text-ink-faint md:right-8 md:bottom-6"
      >
        {sprint.state.phase === "running" && (
          <span className="tabular-nums" aria-hidden>
            {t.focus.sprint}{" "}
            {formatRemaining(
              remainingMs(sprint.state.startedAt, sprint.state.minutes, sprint.nowMs),
            )}
          </span>
        )}
        {sprint.state.phase === "done" && (
          <span>{format(t.focus.sprintResult, { result: resultText(sprint.state, locale) })}</span>
        )}
        <span>{saveText(status, savedAt, t, locale)}</span>
        <span>{format(t.focus.words, { n: fmt.number(words) })}</span>
        <span>
          {format(t.focus.today, {
            done: fmt.number(totalWords(progress)),
            target: fmt.number(target),
          })}
        </span>
      </p>
    </>
  );
}
