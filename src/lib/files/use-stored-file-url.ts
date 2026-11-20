"use client";

import { useEffect, useState } from "react";
import type { FileStore } from "./file-store";
import { fileStore } from "./store";

export type StoredFileUrl =
  | { status: "loading"; url: null }
  | { status: "ready"; url: string }
  | { status: "missing"; url: null };

/** An object URL for a stored file (to show an image), released when the screen leaves. */
export function useStoredFileUrl(fileId: string, store?: FileStore): StoredFileUrl {
  const [state, setState] = useState<{ id: string; url: string | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    let created: string | null = null;
    (store ?? fileStore())
      .get(fileId)
      .then((stored) => {
        if (cancelled) return;
        created = stored ? URL.createObjectURL(stored.blob) : null;
        setState({ id: fileId, url: created });
      })
      .catch(() => {
        if (!cancelled) setState({ id: fileId, url: null });
      });
    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [fileId, store]);

  if (!state || state.id !== fileId) return { status: "loading", url: null };
  return state.url ? { status: "ready", url: state.url } : { status: "missing", url: null };
}
