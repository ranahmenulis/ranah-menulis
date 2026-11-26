"use client";

import { useState } from "react";
import { problemText } from "@/lib/files/problem-text";
import { discardImage, storeImage } from "@/lib/files/store-image";
import { useLocale } from "@/lib/i18n/provider";
import { coverFileStore } from "../storage/cover-store";
import type { FolderCover } from "../storage/document-store";

/**
 * The cover being edited in the book dialog. An image picked here but never saved is freed when it
 * is replaced, removed, or the dialog is cancelled; the saved cover stays until a save replaces it.
 */
export function useBookCover(saved: FolderCover | null) {
  const locale = useLocale();
  const [cover, setCover] = useState<FolderCover | null>(saved);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const picked = cover && cover.fileId !== saved?.fileId ? cover.fileId : "";

  return {
    cover,
    error,
    busy,
    setError,
    setBusy,
    setAlt: (alt: string) => setCover((c) => c && { ...c, alt }),
    async pick(file: File) {
      setBusy(true);
      setError(null);
      const result = await storeImage(file, coverFileStore);
      setBusy(false);
      if (!result.ok) return setError(problemText(result.problem, "image", locale));
      await discardImage(picked, coverFileStore);
      setCover({ fileId: result.id, alt: "" });
    },
    async remove() {
      setError(null);
      await discardImage(picked, coverFileStore);
      setCover(null);
    },
    /** Free what was picked and not kept (cancel). */
    discardPicked: () => discardImage(picked, coverFileStore),
    /** After a save: the cover it replaced is no longer pointed to. */
    discardReplaced: async () => {
      if (saved && saved.fileId !== cover?.fileId) await discardImage(saved.fileId, coverFileStore);
    },
  };
}
