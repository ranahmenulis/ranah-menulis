"use client";

import { useCallback, useEffect } from "react";
import { readViewerNow, useViewer } from "@/lib/viewer";

export function useStudioSearchShortcut(enabled: boolean, open: () => void) {
  useEffect(() => {
    if (!enabled) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k" || event.ctrlKey === event.metaKey) return;
      if (event.altKey || event.shiftKey || event.isComposing || event.repeat) return;
      if (event.defaultPrevented || document.querySelector("dialog[open]")) return;
      event.preventDefault();
      event.stopPropagation();
      open();
    }
    window.addEventListener("keydown", handleKey, true);
    return () => window.removeEventListener("keydown", handleKey, true);
  }, [enabled, open]);
}

export function useEditorSearchShortcut(
  dialog: string | null,
  hasConflict: boolean,
  open: () => void,
) {
  const canSearch = useViewer() === "masuk";
  const show = useCallback(() => {
    if (readViewerNow().viewer === "masuk") open();
  }, [open]);
  useStudioSearchShortcut(canSearch && dialog === null && !hasConflict, show);
  return {
    onOpen: canSearch ? show : undefined,
    isOpen: canSearch && dialog === "search",
  };
}
