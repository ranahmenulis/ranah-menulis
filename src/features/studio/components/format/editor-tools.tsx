"use client";

import type { Editor } from "@tiptap/react";
import type { DocumentLayout } from "../../document-layout";
import type { ViewMode } from "../../hooks/use-view-mode";
import { FormatBar } from "../format-bar";
import { ModeSwitch } from "./mode-switch";
import { ToolRow } from "./tool-row";

type Props = {
  editor: Editor;
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  layout: DocumentLayout;
  onLayoutChange: (next: DocumentLayout) => void;
};

/** The row under the editor bar: the format toolbar while writing, only the mode switch in the preview. */
export function EditorTools({ editor, mode, onModeChange, layout, onLayoutChange }: Props) {
  const modeSwitch = <ModeSwitch mode={mode} onChange={onModeChange} />;
  if (mode === "preview") return <ToolRow>{modeSwitch}</ToolRow>;
  return (
    <FormatBar
      editor={editor}
      layout={layout}
      onLayoutChange={onLayoutChange}
      trailing={modeSwitch}
    />
  );
}
