"use client";

import { useEffect } from "react";
import { studioStore } from "@/features/studio/storage/store";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import { syncOwnWords } from "./board-actions";

/**
 * Copies the reader's own word counts from Studio into the circle when its page is open. Runs in an
 * effect, never while rendering, and only for a member who opted in. Words of other members are not
 * touched: without a server they stay sample data.
 */
export function useCircleSync(
  groupId: string,
  joined: boolean,
  since: string | undefined,
  store: DocumentStore = studioStore,
) {
  useEffect(() => {
    if (!joined || !since) return;
    let live = true;
    store
      .history()
      .then((history) => {
        if (live) syncOwnWords(groupId, history);
      })
      .catch(() => {
        // A failed read leaves the earlier counts as they were.
      });
    return () => {
      live = false;
    };
  }, [groupId, joined, since, store]);
}
