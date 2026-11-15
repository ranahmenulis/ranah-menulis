"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useLayoutEffect, useRef } from "react";
import "@/features/studio/components/editor.css";
import { blocksFromDocument, blocksToDocument } from "../../doc-blocks";
import type { PostBlock } from "../../types";

// Module-level so a parent re-render (typing in the title) does not hand the editor new options:
// that would reset its attributes and drop the writing-surface class.
const EXTENSIONS = [
  StarterKit.configure({
    heading: false,
    bold: false,
    italic: false,
    bulletList: false,
    orderedList: false,
    listItem: false,
    listKeymap: false,
    code: false,
    codeBlock: false,
    strike: false,
    horizontalRule: false,
    link: false,
    underline: false,
  }),
  Placeholder.configure({ placeholder: "Tulis prolog atau cuplikan, paling banyak 500 kata." }),
];
const EDITOR_PROPS = { attributes: { class: "studio-prose", "aria-label": "Isi postingan" } };

type Props = {
  title: string;
  initialBlocks: PostBlock[];
  onTitleChange: (title: string) => void;
  onBlocksChange: (blocks: PostBlock[]) => void;
};

/**
 * "Tulis langsung": a title and a plain body. Only paragraphs and quotes exist (a line starting
 * with ">" becomes a quote, Shift+Enter breaks a line inside a poem); bold, lists, and links do
 * not, because the public text is just text (STD-10).
 */
export function DirectEditor({ title, initialBlocks, onTitleChange, onBlocksChange }: Props) {
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    content: blocksToDocument(initialBlocks),
    extensions: EXTENSIONS,
    editorProps: EDITOR_PROPS,
    onUpdate: ({ editor: e }) => onBlocksChange(blocksFromDocument(e.getJSON())),
  });

  // A long title wraps, so the field grows with its content.
  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  });

  return (
    <div>
      <textarea
        ref={titleRef}
        rows={1}
        value={title}
        placeholder="Judul"
        aria-label="Judul postingan"
        onChange={(e) => onTitleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            editor?.commands.focus("start");
          }
        }}
        className="mb-5 block w-full resize-none overflow-hidden border-0 bg-transparent p-0 font-serif text-[28px] leading-9 font-semibold wrap-anywhere text-ink-read outline-none placeholder:text-ink-faint md:text-[32px] md:leading-10"
      />
      <EditorContent editor={editor} />
      <p className="mt-4 text-xs text-ink-muted">
        Awali baris dengan &gt; untuk kutipan. Tekan Shift+Enter untuk pindah baris di dalam satu
        bagian, misalnya pada puisi.
      </p>
    </div>
  );
}
