import { Editor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { afterEach, describe, expect, it } from "vitest";
import {
  docStats,
  sameStats,
  selectionStats,
  statsOfNodes,
  type EditorStats,
} from "@/features/studio/editor-stats";
import { countWords } from "@/lib/text-stats";

const p = (text?: string): JSONContent =>
  text === undefined
    ? { type: "paragraph" }
    : { type: "paragraph", content: [{ type: "text", text }] };
const doc = (...content: JSONContent[]): JSONContent => ({ type: "doc", content });

describe("docStats", () => {
  it("is all zeros for an empty document", () => {
    expect(docStats(doc())).toEqual({ words: 0, characters: 0, paragraphs: 0 });
    expect(docStats(doc(p()))).toEqual({ words: 0, characters: 0, paragraphs: 0 });
  });

  it("counts the AC-08 shape: words across paragraphs, characters with spaces, paragraphs", () => {
    expect(docStats(doc(p("satu dua tiga"), p("empat lima")))).toEqual({
      words: 5,
      characters: 23,
      paragraphs: 2,
    });
  });

  it("does not count empty or whitespace-only blocks as paragraphs", () => {
    expect(docStats(doc(p("satu"), p(), p("   "), p("dua"))).paragraphs).toBe(2);
  });

  it("counts a heading, each list item, and a quote's paragraph as one paragraph each", () => {
    const content = doc(
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Bab satu" }] },
      {
        type: "bulletList",
        content: [
          { type: "listItem", content: [p("butir a")] },
          { type: "listItem", content: [p("butir b")] },
        ],
      },
      { type: "blockquote", content: [p("kutipan pendek")] },
    );
    expect(docStats(content)).toEqual({ words: 8, characters: 8 + 7 + 7 + 14, paragraphs: 4 });
  });

  it("counts nested lists", () => {
    const content = doc({
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            p("luar"),
            { type: "bulletList", content: [{ type: "listItem", content: [p("dalam")] }] },
          ],
        },
      ],
    });
    expect(docStats(content).paragraphs).toBe(2);
  });

  it("separates words at a line break and leaves it out of the characters", () => {
    const content = doc({
      type: "paragraph",
      content: [
        { type: "text", text: "satu" },
        { type: "hardBreak" },
        { type: "text", text: "dua" },
      ],
    });
    expect(docStats(content)).toEqual({ words: 2, characters: 7, paragraphs: 1 });
  });

  it("handles a million words without dropping any", () => {
    const text = Array.from({ length: 1_000_000 }, () => "a").join(" ");
    expect(docStats(doc(p(text))).words).toBe(1_000_000);
  });
});

describe("statsOfNodes", () => {
  it("returns zeros for no nodes", () => {
    expect(statsOfNodes([])).toEqual({ words: 0, characters: 0, paragraphs: 0 });
  });
});

describe("sameStats", () => {
  const a: EditorStats = { words: 1, characters: 2, paragraphs: 3 };

  it("compares by value and treats null as its own value", () => {
    expect(sameStats(a, { ...a })).toBe(true);
    expect(sameStats(a, { ...a, words: 2 })).toBe(false);
    expect(sameStats(null, null)).toBe(true);
    expect(sameStats(a, null)).toBe(false);
  });
});

describe("with a real editor", () => {
  let editor: Editor;
  const open = (content: JSONContent) => {
    editor = new Editor({ extensions: [StarterKit], content });
    return editor;
  };
  afterEach(() => editor?.destroy());

  it("matches the word count the Streak records, whatever the block types", () => {
    const content = doc(
      p("Hujan pertama"),
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Bab dua" }] },
      { type: "blockquote", content: [p("kata-kata mutiara")] },
      { type: "orderedList", content: [{ type: "listItem", content: [p("satu butir")] }] },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "baris" },
          { type: "hardBreak" },
          { type: "text", text: "baru" },
        ],
      },
    );
    const e = open(content);
    expect(docStats(e.getJSON()).words).toBe(countWords(e.getText({ blockSeparator: " " })));
  });

  it("reports no selection stats while the cursor is collapsed", () => {
    const e = open(doc(p("satu dua tiga")));
    expect(selectionStats(e)).toBeNull();
  });

  it("counts only the selected text", () => {
    const e = open(doc(p("satu dua tiga")));
    // Positions: 1 is the start of the paragraph's text; "satu dua" spans 1 to 9.
    e.commands.setTextSelection({ from: 1, to: 9 });
    expect(selectionStats(e)).toEqual({ words: 2, characters: 8, paragraphs: 1 });
  });

  it("counts a selection that crosses paragraphs", () => {
    const e = open(doc(p("satu dua"), p("tiga empat")));
    e.commands.selectAll();
    expect(selectionStats(e)).toEqual({ words: 4, characters: 8 + 10, paragraphs: 2 });
  });
});
