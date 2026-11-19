"use client";

import { useCallback, useRef } from "react";
import { useToast } from "@/components/ui/toast";
import { isActiveDocument } from "@/features/studio/document-archive";
import { readGroupReader } from "../groups/group-viewer";
import { recordEventSave, type EventSaveSnapshot } from "./event-actions";
import { tracksEventDocument } from "./event-store";

export function useEventSave(eventId?: string) {
  const toast = useToast();
  const pending = useRef<EventSaveSnapshot[]>([]);
  const running = useRef<Promise<void> | null>(null);
  const trackedDocuments = useRef(new Set<string>());

  const flush = useCallback(
    function flushPending(): Promise<void> {
      if (running.current) return running.current;
      if (pending.current.length === 0) return Promise.resolve();
      const run = async () => {
        while (pending.current.length) {
          await recordEventSave(pending.current[0]);
          pending.current.shift();
        }
      };
      running.current = run()
        .catch(() => {
          toast({
            key: "event-progress-error",
            message: "Progres event belum tersimpan. Coba lagi.",
            tone: "error",
            action: { label: "Coba lagi", onSelect: () => void flushPending() },
          });
        })
        .finally(() => {
          running.current = null;
        });
      return running.current;
    },
    [toast],
  );

  const onSaved = useCallback(
    ({ id, version, updatedAt, wordCount, deletedAt, archivedAt }: EventSaveSnapshot) => {
      const actor = readGroupReader();
      if (!actor || !isActiveDocument({ deletedAt, archivedAt })) return;
      const tracked = tracksEventDocument(actor, id);
      if (tracked === false) trackedDocuments.current.delete(id);
      if (tracked === true) trackedDocuments.current.add(id);
      if (!(tracked ?? (Boolean(eventId) || trackedDocuments.current.has(id)))) return;
      pending.current.push({ id, version, updatedAt, wordCount, deletedAt, archivedAt });
      void flush();
    },
    [eventId, flush],
  );

  return { onSaved, flush };
}
