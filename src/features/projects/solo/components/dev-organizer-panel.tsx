"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addPreviewFile, advanceStage, type ActionResult } from "../solo-actions";
import { currentStage, neededPreviews, STAGE_LABEL, withAdvance } from "../stage-model";
import type { SoloStore } from "../storage/solo-store";
import type { SoloProgress, SoloStage } from "../types";

type Props = {
  target: { id: string; slug: string; stages: SoloStage[] };
  progress: SoloProgress | null;
  store: SoloStore;
};

/**
 * Stands in for the Organizer panel (6g) so the stages can be tried now. Development only: it never
 * shows in production. It calls the same functions the real panel will, which follow the same
 * rules, so it cannot do anything the publishing team could not.
 */
export function DevOrganizerPanel({ target, progress, store }: Props) {
  const [busy, setBusy] = useState(false);
  if (process.env.NODE_ENV === "production") return null;

  const current = currentStage(target.stages, progress);
  const next = withAdvance(target.stages, progress, target, 0) !== null;
  const nextLabel = STAGE_LABEL[target.stages[target.stages.indexOf(current) + 1] ?? "selesai"];
  const kinds = neededPreviews(target.stages);

  async function act(run: () => Promise<ActionResult>) {
    setBusy(true);
    try {
      await run();
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside
      aria-label="Organizer, hanya untuk pengembangan"
      className="grid gap-2 border-t border-line pt-4"
    >
      <p className="text-xs text-ink-muted">
        Hanya untuk pengembangan. Panel Organizer menyusul; sampai itu, mainkan peran tim penerbitan
        di sini.
      </p>
      <div className="flex flex-wrap gap-2">
        {next && (
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => void act(() => advanceStage(store, target))}
          >
            Lanjut ke {nextLabel.toLowerCase()}
          </Button>
        )}
        {kinds.map((kind) => (
          <Button
            key={kind}
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => void act(() => addPreviewFile(store, target, kind))}
          >
            Tambah pratinjau {kind === "cover" ? "sampul" : "isi buku"}
          </Button>
        ))}
      </div>
    </aside>
  );
}
