"use client";

import { useCallback, useEffect, useRef } from "react";
import { useT } from "@/lib/i18n/provider";
import { chapterButtonId } from "../components/book/chapter-controls";
import type { DocumentList } from "./use-document-list";

type Moved = { id: string; step: -1 | 1 };

/**
 * Saves a book's new chapter order and says so. Once the list shows the new order, focus goes back
 * to the button that was pressed, or to its twin when the chapter reached an end of the list (the
 * pressed button is off by then). Focus waits for the list because the row only moves after the
 * list has reloaded.
 */
export function useChapterReorder(
  list: DocumentList,
  folderId: string | null,
  report: (text: string, failed: boolean) => void,
) {
  const t = useT().studioBook.chapters;
  const waiting = useRef<(Moved & { ids: string[] }) | null>(null);
  const order = list.folders.find((f) => f.id === folderId)?.chapterOrder;

  useEffect(() => {
    const move = waiting.current;
    if (!move || order?.join() !== move.ids.join()) return;
    waiting.current = null;
    const press = document.getElementById(chapterButtonId(move.id, move.step));
    const twin = document.getElementById(chapterButtonId(move.id, move.step === 1 ? -1 : 1));
    (press instanceof HTMLButtonElement && !press.disabled ? press : twin)?.focus();
  }, [order]);

  return useCallback(
    async (ids: string[], moved: Moved) => {
      if (!folderId) return;
      waiting.current = { ...moved, ids };
      try {
        await list.updateFolder(folderId, { chapterOrder: ids });
        report(t.moved, false);
      } catch {
        waiting.current = null;
        report(t.moveFailed, true);
      }
    },
    [list, folderId, report, t],
  );
}
