"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import type { ReactNode } from "react";
import { DEFAULT_LAYOUT, type DocumentLayout } from "../document-layout";
import { FormatBarView, type FormatCommand, type FormatState } from "./format/format-bar-view";
import { runFormat } from "./format/run-format";

/**
 * Format toolbar: a hairline pill under the editor bar, centered over the writing column. Minimal
 * on purpose (client brief, 22 November 2026): font, size, paragraph style, alignment, the basic
 * marks and lists. Font and size belong to the whole document, so they change the layout; the rest
 * are commands on the selection. The active format takes the accent tint (DESIGN.md 4.1). On a
 * phone the row scrolls sideways without a visible scrollbar.
 */
export function FormatBar({
  editor,
  layout = DEFAULT_LAYOUT,
  onLayoutChange,
  trailing,
}: {
  editor: Editor;
  layout?: DocumentLayout;
  onLayoutChange?: (next: DocumentLayout) => void;
  /** Shown after the toolbar in the same row (the view mode switch). */
  trailing?: ReactNode;
}) {
  const active = useEditorState({
    editor,
    selector: ({ editor: e }): FormatState => ({
      style: e.isActive("heading", { level: 2 })
        ? "h2"
        : e.isActive("heading", { level: 3 })
          ? "h3"
          : "p",
      align:
        (["center", "right", "justify"] as const).find((a) => e.isActive({ textAlign: a })) ??
        "left",
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      quote: e.isActive("blockquote"),
      bullets: e.isActive("bulletList"),
      numbers: e.isActive("orderedList"),
    }),
  });

  const run = (command: FormatCommand) => {
    const chain = runFormat(editor);
    switch (command.type) {
      case "style":
        if (command.value === "p") chain.setParagraph().run();
        else chain.setHeading({ level: command.value === "h2" ? 2 : 3 }).run();
        return;
      case "align":
        return void chain.setTextAlign(command.value).run();
      case "bold":
        return void chain.toggleBold().run();
      case "italic":
        return void chain.toggleItalic().run();
      case "quote":
        return void chain.toggleBlockquote().run();
      case "bullets":
        return void chain.toggleBulletList().run();
      case "numbers":
        return void chain.toggleOrderedList().run();
    }
  };

  return (
    <FormatBarView
      active={active}
      layout={layout}
      onLayoutChange={onLayoutChange}
      onCommand={run}
      trailing={trailing}
    />
  );
}
