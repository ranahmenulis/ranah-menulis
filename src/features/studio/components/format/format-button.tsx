"use client";

import { AllSelection, Selection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import type { ReactNode } from "react";

type ButtonProps = {
  label: string;
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
};

export function FormatButton({ label, pressed, onClick, children }: ButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      // Keep the caret and selection: do not let the toolbar take focus from the editor.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="grid h-9 w-10 flex-none cursor-pointer place-items-center rounded-full text-ink hover:opacity-(--opacity-hover) aria-pressed:rounded-none aria-pressed:shadow-[inset_0_-2px_0_var(--ink)] md:h-8 md:w-9"
    >
      {children}
    </button>
  );
}

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
