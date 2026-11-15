"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useLayoutEffect, useRef } from "react";
import { countWords } from "../count-words";
import "./editor.css";
import { FormatBar } from "./format-bar";

type EditorCanvasProps = {
  initialTitle: string;
  initialContent: JSONContent;
  onTitleChange: (title: string) => void;
  onContentChange: (content: JSONContent, words: number) => void;
  /** A brand-new draft puts the caret in the title. */
  autoFocusTitle?: boolean;
};

/**
 * The writing surface: a title, then the body. Only the formats STD-01 allows are enabled:
 * bold, italic, heading, blockquote, bullet and numbered lists. Code, links, strikethrough, and
 * rules are switched off so nothing Word-like sneaks in.
 */
export function EditorCanvas({
  initialTitle,
  initialContent,
  onTitleChange,
  onContentChange,
  autoFocusTitle,
}: EditorCanvasProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    content: initialContent,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2] },
        code: false,
        codeBlock: false,
        strike: false,
        horizontalRule: false,
        link: false,
        underline: false,
      }),
      Placeholder.configure({ placeholder: "Mulai dari satu kalimat." }),
    ],
    editorProps: {
      attributes: { class: "studio-prose", "aria-label": "Isi tulisan" },
    },
    onUpdate: ({ editor: e }) =>
      onContentChange(e.getJSON(), countWords(e.getText({ blockSeparator: " " }))),
  });

  // A long title wraps, so the field grows with its content.
  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  });

  return (
    <article className="mx-auto w-full max-w-170">
      <textarea
        ref={titleRef}
        rows={1}
        autoFocus={autoFocusTitle}
        defaultValue={initialTitle}
        placeholder="Judul"
        aria-label="Judul"
        onChange={(e) => onTitleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            editor?.commands.focus("start");
          }
        }}
        className="mb-6 block w-full resize-none overflow-hidden border-0 bg-transparent p-0 read-title text-ink-read outline-none md:mb-8"
      />
      {editor && <FormatBar editor={editor} />}
      <EditorContent editor={editor} />
    </article>
  );
}
