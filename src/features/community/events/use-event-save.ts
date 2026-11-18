"use client";

import { useCallback, useRef } from "react";
import { useToast } from "@/components/ui/toast";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import { recordEventSave } from "./event-actions";

export function useEventSave() {
  const toast = useToast();
  const pending = useRef<StudioDocument[]>([]);
  const running = useRef<Promise<void> | null>(null);

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
    (doc: StudioDocument) => {
      pending.current.push(doc);
      void flush();
    },
    [flush],
  );

  return { onSaved, flush };
}
