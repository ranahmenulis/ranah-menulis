"use client";

import {
  ListBullets,
  ListNumbers,
  Quotes,
  TextB,
  TextH,
  TextItalic,
} from "@phosphor-icons/react/dist/ssr";
import { AllSelection, Selection } from "@tiptap/pm/state";
import { useEditorState, type Editor } from "@tiptap/react";
import type { ReactNode } from "react";

type ButtonProps = {
  label: string;
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
};

function FormatButton({ label, pressed, onClick, children }: ButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      // Keep the caret and selection: do not let the toolbar take focus from the editor.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="grid h-9 w-10 cursor-pointer place-items-center rounded-full text-ink hover:opacity-(--opacity-hover) aria-pressed:rounded-none aria-pressed:shadow-[inset_0_-2px_0_var(--ink)] md:h-8 md:w-9"
    >
      {children}
    </button>
  );
}

/**
 * Ctrl+A gives ProseMirror an `AllSelection`, for which list commands misbehave: `isActive` stays
 * false and a second click wraps the text again instead of undoing the list. Swapping it for the
 * equivalent text range first keeps every button a clean on and off.
 */
function selectTextRange(editor: Editor) {
  const { doc, selection } = editor.state;
  if (!(selection instanceof AllSelection)) return;
  editor.commands.setTextSelection({
    from: Selection.atStart(doc).from,
    to: Selection.atEnd(doc).to,
  });
}

/**
 * Format toolbar: a hairline pill that stays under the editor bar, centered over the writing column
 * (the landing mockup's promise; it replaces the floating selection pill of DESIGN.md 6.3). Only the
 * six formats STD-01 allows. The active one is underlined, not recolored.
 */
export function FormatBar({ editor }: { editor: Editor }) {
  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      heading: e.isActive("heading", { level: 2 }),
      quote: e.isActive("blockquote"),
      bullets: e.isActive("bulletList"),
      numbers: e.isActive("orderedList"),
    }),
  });
  const run = () => {
    selectTextRange(editor);
    return editor.chain().focus();
  };

  return (
    <div className="flex flex-none justify-center border-b border-line bg-canvas px-4 py-1.5 md:py-2">
      <div
        role="toolbar"
        aria-label="Format teks"
        className="inline-flex items-center gap-0.5 rounded-full border border-line p-0.5 md:px-1.5"
      >
        <FormatButton
          label="Tebal (Ctrl+B)"
          pressed={active.bold}
          onClick={() => run().toggleBold().run()}
        >
          <TextB size={18} aria-hidden />
        </FormatButton>
        <FormatButton
          label="Miring (Ctrl+I)"
          pressed={active.italic}
          onClick={() => run().toggleItalic().run()}
        >
          <TextItalic size={18} aria-hidden />
        </FormatButton>
        <FormatButton
          label="Judul"
          pressed={active.heading}
          onClick={() => run().toggleHeading({ level: 2 }).run()}
        >
          <TextH size={18} aria-hidden />
        </FormatButton>
        <FormatButton
          label="Kutipan"
          pressed={active.quote}
          onClick={() => run().toggleBlockquote().run()}
        >
          <Quotes size={18} aria-hidden />
        </FormatButton>
        <FormatButton
          label="Daftar berpoin"
          pressed={active.bullets}
          onClick={() => run().toggleBulletList().run()}
        >
          <ListBullets size={18} aria-hidden />
        </FormatButton>
        <FormatButton
          label="Daftar bernomor"
          pressed={active.numbers}
          onClick={() => run().toggleOrderedList().run()}
        >
          <ListNumbers size={18} aria-hidden />
        </FormatButton>
      </div>
    </div>
  );
}
