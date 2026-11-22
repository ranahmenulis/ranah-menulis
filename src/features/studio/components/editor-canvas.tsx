"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, type Editor, type JSONContent } from "@tiptap/react";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { useAccount } from "@/features/account/account-store";
import { useHydrated } from "@/features/account/hooks/use-hydrated";
import { DEFAULT_LAYOUT, layoutVars, type DocumentLayout } from "../document-layout";
import { docStats, selectionStats, type EditorStats } from "../editor-stats";
import { useTypewriterScroll } from "../hooks/use-typewriter-scroll";
import { StudioTypography } from "../studio-typography";
import { EditorLoading } from "./editor-states";
import "./editor.css";

type EditorCanvasProps = {
  initialTitle: string;
  initialContent: JSONContent;
  onTitleChange: (title: string) => void;
  onContentChange: (content: JSONContent, words: number) => void;
  /** Counts for the whole text, reported when it is opened and after every edit. */
  onStatsChange?: (stats: EditorStats) => void;
  /** Counts for the selected text; `null` when nothing is selected. */
  onSelectionStatsChange?: (selection: EditorStats | null) => void;
  /** The Tiptap instance once it exists, and `null` when the canvas goes away. */
  onEditorChange?: (editor: Editor | null) => void;
  /** A brand-new draft puts the caret in the title. */
  autoFocusTitle?: boolean;
  /** Page layout of the document; the defaults apply while it is not given. */
  layout?: DocumentLayout;
};

const EDITOR_EXTENSIONS = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    code: false,
    codeBlock: false,
    strike: false,
    horizontalRule: false,
    link: false,
    underline: false,
  }),
  Placeholder.configure({ placeholder: "Mulai dari satu kalimat." }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  StudioTypography,
];

export function EditorCanvas(props: EditorCanvasProps) {
  const hydrated = useHydrated();
  return hydrated ? <HydratedEditorCanvas {...props} /> : <EditorLoading />;
}

/**
 * The writing surface: a title, then the body. Only the formats STD-01 allows are enabled:
 * bold, italic, heading, blockquote, bullet and numbered lists. Code, links, strikethrough, and
 * rules are switched off so nothing Word-like sneaks in.
 */
function HydratedEditorCanvas({
  initialTitle,
  initialContent,
  onTitleChange,
  onContentChange,
  onStatsChange,
  onSelectionStatsChange,
  onEditorChange,
  autoFocusTitle,
  layout = DEFAULT_LAYOUT,
}: EditorCanvasProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const pageRef = useRef<HTMLElement>(null);
  const { writing } = useAccount().prefs;
  const { curlyQuotes, substitutions } = writing;

  const editor = useEditor({
    immediatelyRender: false,
    content: initialContent,
    extensions: EDITOR_EXTENSIONS,
    editorProps: {
      attributes: { class: "studio-prose", "aria-label": "Isi tulisan" },
    },
    // A new editor starts with nothing selected; reporting it clears a selection left by the old one.
    onCreate: ({ editor: e }) => {
      onStatsChange?.(docStats(e.getJSON()));
      onSelectionStatsChange?.(null);
    },
    onUpdate: ({ editor: e }) => {
      const json = e.getJSON();
      const stats = docStats(json);
      // The same word count feeds the bar, the popover and the daily target (STD-04).
      onContentChange(json, stats.words);
      onStatsChange?.(stats);
      onSelectionStatsChange?.(selectionStats(e));
    },
    // A cursor move with nothing selected only reports `null`; the parent ignores repeats.
    onSelectionUpdate: ({ editor: e }) => onSelectionStatsChange?.(selectionStats(e)),
  });

  useTypewriterScroll(
    editor,
    pageRef,
    writing.mode === "typewriter" ? writing.typewriterPosition : null,
  );

  useLayoutEffect(() => {
    if (!editor) return;
    Object.assign(editor.storage.studioTypography, { curlyQuotes, substitutions });
  }, [editor, curlyQuotes, substitutions]);

  // The format bar lives outside the scrolling canvas, so the screen needs the editor instance.
  useEffect(() => {
    onEditorChange?.(editor);
    return () => onEditorChange?.(null);
  }, [editor, onEditorChange]);

  // A long title wraps, so the field grows with its content.
  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  });

  return (
    <article
      ref={pageRef}
      className="studio-editor-page mx-auto w-full"
      style={layoutVars(layout) as CSSProperties}
    >
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
        className="studio-title mb-6 block w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-ink-read outline-none md:mb-8"
      />
      <EditorContent editor={editor} />
    </article>
  );
}
