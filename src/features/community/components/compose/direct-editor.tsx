"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useT } from "@/lib/i18n/provider";
import "@/features/studio/components/editor.css";
import { blocksFromDocument, blocksToDocument } from "../../doc-blocks";
import type { PostBlock } from "../../types";

// Module-level so a parent re-render (typing in the title) does not hand the editor new options:
// that would reset its attributes and drop the writing-surface class.
const BASE_EXTENSIONS = [
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
];

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
  const t = useT().compose.direct;
  const titleRef = useRef<HTMLTextAreaElement>(null);
  // Stable between renders (typing in the title must not reset the editor); the parent remounts
  // this component when the interface language changes.
  const extensions = useMemo(
    () => [...BASE_EXTENSIONS, Placeholder.configure({ placeholder: t.placeholder })],
    [t.placeholder],
  );
  const editorProps = useMemo(
    () => ({ attributes: { class: "studio-prose", "aria-label": t.bodyLabel } }),
    [t.bodyLabel],
  );

  const editor = useEditor({
    immediatelyRender: false,
    content: blocksToDocument(initialBlocks),
    extensions,
    editorProps,
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
    <div className="flex flex-1 flex-col">
      <textarea
        ref={titleRef}
        rows={1}
        value={title}
        placeholder={t.titlePlaceholder}
        aria-label={t.titleLabel}
        onChange={(e) => onTitleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            editor?.commands.focus("start");
          }
        }}
        className="mb-5 block w-full resize-none overflow-hidden border-0 bg-transparent p-0 font-serif text-[28px] leading-9 font-semibold wrap-anywhere text-ink-read outline-none placeholder:text-ink-faint md:text-[32px] md:leading-10"
      />
      <EditorContent editor={editor} className="grow" />
      <p className="mt-auto pt-4 text-xs text-ink-muted">{t.hint}</p>
    </div>
  );
}
