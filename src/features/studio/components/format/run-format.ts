import { AllSelection, Selection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";

/**
 * Ctrl+A gives ProseMirror an `AllSelection`, for which list and alignment commands misbehave:
 * `isActive` stays false and a second click wraps the text again instead of undoing it. Swapping it
 * for the equivalent text range first keeps every button a clean on and off.
 */
function selectTextRange(editor: Editor) {
  const { doc, selection } = editor.state;
  if (!(selection instanceof AllSelection)) return;
  editor.commands.setTextSelection({
    from: Selection.atStart(doc).from,
    to: Selection.atEnd(doc).to,
  });
}

/** A focused command chain on the editor, run after the selection has been made safe. */
export function runFormat(editor: Editor) {
  selectTextRange(editor);
  return editor.chain().focus();
}
