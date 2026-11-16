"use client";

import { Button } from "@/components/ui/button";
import { stageRank } from "../contest-model";
import { advanceContest, markMineFinalist } from "../stage-store";
import type { ContestStage } from "../types";

const STEPS: { stage: ContestStage; label: string }[] = [
  { stage: "dinilai", label: "Tutup penerimaan, mulai dinilai" },
  { stage: "finalis", label: "Umumkan finalis" },
  { stage: "pemenang", label: "Umumkan pemenang" },
];

type Props = {
  slug: string;
  stage: ContestStage;
  hasWork: boolean;
  /** Whether the reader's own work is already a finalist. */
  isFinalist: boolean;
  /** Runs after a button, so focus can move off a button that is about to disappear. */
  onDone: () => void;
};

/**
 * Stands in for the Organizer panel, which comes in 6g, so the stages of a contest can be tried
 * now. Development only (like the reviewer and mentor panels): it never shows in production. It can
 * only move a contest on, since an announcement is not taken back.
 */
export function DevOrganizerPanel({ slug, stage, hasWork, isFinalist, onDone }: Props) {
  if (process.env.NODE_ENV === "production") return null;
  const next = STEPS.filter((s) => stageRank(s.stage) > stageRank(stage));
  const canMark = hasWork && !isFinalist;
  if (next.length === 0 && !canMark) return null;

  return (
    <aside
      aria-label="Organizer, hanya untuk pengembangan"
      className="grid gap-2 border-t border-line pt-4"
    >
      <p className="text-xs text-ink-muted">
        Hanya untuk pengembangan. Panel Organizer menyusul; sampai itu, mainkan peran Organizer di
        sini. Tahap hanya bisa maju.
      </p>
      <div className="flex flex-wrap gap-2">
        {next.map((s) => (
          <Button
            key={s.stage}
            variant="secondary"
            size="sm"
            onClick={() => {
              advanceContest(slug, s.stage);
              onDone();
            }}
          >
            {s.label}
          </Button>
        ))}
        {canMark && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              markMineFinalist(slug);
              onDone();
            }}
          >
            Jadikan karyaku finalis
          </Button>
        )}
      </div>
    </aside>
  );
}
