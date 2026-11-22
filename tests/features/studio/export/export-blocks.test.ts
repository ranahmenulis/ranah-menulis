import type { JSONContent } from "@tiptap/react";
import { describe, expect, it } from "vitest";
import { exportBlocks, toPlainText } from "@/features/studio/export/export-blocks";

const p = (text: string): JSONContent => ({
  type: "paragraph",
  content: text ? [{ type: "text", text }] : [],
});

const doc: JSONContent = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Bab satu" }] },
    p("Kalimat pertama."),
    p(""),
    { type: "blockquote", content: [p("Kutipan"), p("kedua baris")] },
    {
      type: "bulletList",
      content: [
        { type: "listItem", content: [p("apel")] },
        { type: "listItem", content: [p("jeruk")] },
      ],
    },
    {
      type: "orderedList",
      attrs: { start: 3 },
      content: [
        { type: "listItem", content: [p("tiga")] },
        { type: "listItem", content: [p("empat")] },
      ],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "baris" },
        { type: "hardBreak" },
        { type: "text", text: "dua", marks: [{ type: "bold" }] },
      ],
    },
  ],
};

describe("exportBlocks", () => {
  it("flattens in reading order and drops empty paragraphs", () => {
    expect(exportBlocks(doc).map((b) => b.kind)).toEqual([
      "heading",
      "paragraph",
      "quote",
      "bullet",
      "bullet",
      "number",
      "number",
      "paragraph",
    ]);
  });

  it("numbers ordered lists from their start", () => {
    const numbers = exportBlocks(doc).filter((b) => b.kind === "number");
    expect(numbers).toMatchObject([{ index: 3 }, { index: 4 }]);
  });

  it("is empty for an empty document", () => {
    expect(exportBlocks({ type: "doc", content: [p("")] })).toEqual([]);
    expect(exportBlocks({ type: "doc" })).toEqual([]);
  });
});

describe("exportBlocks, alignment", () => {
  const aligned = (textAlign: string | null): JSONContent => ({
    type: "paragraph",
    attrs: { textAlign },
    content: [{ type: "text", text: "isi" }],
  });

  it("carries the alignment of paragraphs and headings, left by default", () => {
    const blocks = exportBlocks({
      type: "doc",
      content: [
        aligned("center"),
        aligned("justify"),
        aligned(null),
        aligned("diagonal"),
        {
          type: "heading",
          attrs: { level: 3, textAlign: "right" },
          content: [{ type: "text", text: "Judul" }],
        },
      ],
    });
    expect(
      blocks.map((b) => (b.kind === "paragraph" || b.kind === "heading" ? b.align : "")),
    ).toEqual(["center", "justify", "left", "left", "right"]);
    expect(blocks[4]).toMatchObject({ kind: "heading", level: 3 });
  });

  it("does not change the plain text export", () => {
    expect(toPlainText("", { type: "doc", content: [aligned("center")] })).toBe("isi\n");
  });
});

describe("toPlainText", () => {
  it("puts the title first and a blank line between blocks, without formatting marks", () => {
    expect(toPlainText("  Arutala ", doc)).toBe(
      [
        "Arutala",
        "Bab satu",
        "Kalimat pertama.",
        "> Kutipan\n> kedua baris",
        "- apel",
        "- jeruk",
        "3. tiga",
        "4. empat",
        "baris\ndua",
      ].join("\n\n") + "\n",
    );
  });

  it("leaves out the title line when there is no title", () => {
    expect(toPlainText("", { type: "doc", content: [p("Satu")] })).toBe("Satu\n");
  });
});
