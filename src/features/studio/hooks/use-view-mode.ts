"use client";

import type { Editor } from "@tiptap/react";
import { useCallback, useState } from "react";

export type ViewMode = "write" | "preview";

/**
 * Writing Mode or Page Preview. The editor stays mounted while the preview is open, so nothing
 * typed is lost and going back resumes at the same place. The preview shows the text as it was
 * when it was opened; it is read-only, so it cannot go stale.
 */
export function useViewMode(editor: Editor | null, focusMode: boolean) {
  const [mode, setMode] = useState<ViewMode>("write");
  const [html, setHtml] = useState("");

  const change = useCallback(
    (next: ViewMode) => {
      if (next === "preview" && editor) setHtml(editor.getHTML());
      setMode(next);
      // Back in the editor, bring the caret into view again: the page was hidden and lost its place.
      if (next === "write") requestAnimationFrame(() => editor?.commands.scrollIntoView());
    },
    [editor],
  );

  // Focus mode is for writing, so it always shows the editor even when the preview was open.
  return { mode, html, change, showPreview: mode === "preview" && !focusMode };
}
