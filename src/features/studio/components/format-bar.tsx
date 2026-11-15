"use client";

import { ListBullets, Quotes } from "@phosphor-icons/react/dist/ssr";
import { useEditorState, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

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
      aria-pressed={pressed}
      // Keep the text selection: do not let the toolbar take focus from the editor.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "grid h-8 w-9 cursor-pointer place-items-center rounded-full font-serif text-base leading-none font-semibold",
        "hover:opacity-(--opacity-hover) aria-pressed:rounded-none aria-pressed:shadow-[inset_0_-2px_0_var(--on-ink)]",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Format toolbar: an ink pill that exists only while text is selected (DESIGN.md 6.3), 10px above
 * the selection. Five formats allowed by STD-01; the active one is underlined, not recolored.
 */
export function FormatBar({ editor }: { editor: Editor }) {
  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      heading: e.isActive("heading", { level: 2 }),
      quote: e.isActive("blockquote"),
      list: e.isActive("bulletList") || e.isActive("orderedList"),
    }),
  });
  const run = () => editor.chain().focus();

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top", offset: 10 }}
      updateDelay={0}
      role="toolbar"
      aria-label="Format teks"
      className="inline-flex h-10 items-center gap-0.5 rounded-full bg-ink px-1.5 text-on-ink shadow-float"
    >
      <FormatButton
        label="Tebal (Ctrl+B)"
        pressed={active.bold}
        onClick={() => run().toggleBold().run()}
      >
        B
      </FormatButton>
      <FormatButton
        label="Miring (Ctrl+I)"
        pressed={active.italic}
        onClick={() => run().toggleItalic().run()}
      >
        <i className="font-normal">I</i>
      </FormatButton>
      <span aria-hidden className="mx-1 h-5 w-px bg-on-ink opacity-30" />
      <FormatButton
        label="Judul"
        pressed={active.heading}
        onClick={() => run().toggleHeading({ level: 2 }).run()}
      >
        H
      </FormatButton>
      <FormatButton
        label="Kutipan"
        pressed={active.quote}
        onClick={() => run().toggleBlockquote().run()}
      >
        <Quotes size={18} aria-hidden />
      </FormatButton>
      <FormatButton
        label="Daftar"
        pressed={active.list}
        onClick={() => run().toggleBulletList().run()}
      >
        <ListBullets size={18} aria-hidden />
      </FormatButton>
    </BubbleMenu>
  );
}
