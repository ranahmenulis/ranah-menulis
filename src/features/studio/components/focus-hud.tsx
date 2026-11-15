"use client";

import { Button } from "@/components/ui/button";
import type { DailyLog } from "../daily-progress";
import { totalWords } from "../daily-progress";
import { formatClock } from "../count-words";
import type { SaveStatus } from "../hooks/use-studio-document";

type FocusHudProps = {
  status: SaveStatus;
  savedAt: Date | null;
  words: number;
  progress: DailyLog;
  target: number;
  onExit: () => void;
};

function saveText(status: SaveStatus, savedAt: Date | null) {
  if (status === "failed") return "Belum tersimpan";
  if (status === "saving") return "Menyimpan…";
  if (status === "draft" || !savedAt) return "Draf baru";
  return `Tersimpan ${formatClock(savedAt)}`;
}

/**
 * Focus mode leaves only the text plus two quiet corners: the way out, and one dim line with save
 * state, word count, and today's target (DESIGN.md 6.3). No lines, no filled buttons.
 */
export function FocusHud({ status, savedAt, words, progress, target, onExit }: FocusHudProps) {
  const number = new Intl.NumberFormat("id-ID");
  return (
    <>
      <div className="fixed top-4 right-4 z-20 md:top-5 md:right-6">
        <Button variant="text" size="sm" onClick={onExit} className="font-normal text-ink-faint">
          Keluar dari mode fokus · Esc
        </Button>
      </div>
      <p
        role="status"
        className="fixed right-4 bottom-4 z-20 flex flex-wrap justify-end gap-x-3 text-xs text-ink-faint md:right-8 md:bottom-6"
      >
        <span>{saveText(status, savedAt)}</span>
        <span>{number.format(words)} kata</span>
        <span>
          {number.format(totalWords(progress))} / {number.format(target)} hari ini
        </span>
      </p>
    </>
  );
}
