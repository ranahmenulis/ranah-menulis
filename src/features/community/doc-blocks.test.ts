import { describe, expect, it } from "vitest";
import { blocksFromDocument, blocksToDocument } from "./doc-blocks";

const text = (t: string) => ({ type: "text", text: t });

describe("blocksFromDocument", () => {
  it("makes one block per top-level node and drops empty ones", () => {
    const blocks = blocksFromDocument({
      type: "doc",
      content: [
        { type: "heading", content: [text("Judul")] },
        {
          type: "paragraph",
          content: [text("Satu "), { type: "text", text: "tebal", marks: [{ type: "bold" }] }],
        },
        { type: "paragraph" },
        { type: "blockquote", content: [{ type: "paragraph", content: [text("Kutipan")] }] },
        {
          type: "bulletList",
          content: [
            { type: "listItem", content: [{ type: "paragraph", content: [text("Butir")] }] },
          ],
        },
      ],
    });
    expect(blocks).toEqual([
      { type: "heading", text: "Judul" },
      { type: "paragraph", text: "Satu tebal" },
      { type: "quote", text: "Kutipan" },
      { type: "paragraph", text: "Butir" },
    ]);
  });

  it("keeps a hard break as a line break, for poems", () => {
    const [block] = blocksFromDocument({
      type: "doc",
      content: [{ type: "paragraph", content: [text("a"), { type: "hardBreak" }, text("b")] }],
    });
    expect(block.text).toBe("a\nb");
  });
});

describe("blocksToDocument", () => {
  it("round-trips paragraphs, quotes, and line breaks", () => {
    const blocks = [
      { type: "paragraph" as const, text: "baris satu\nbaris dua" },
      { type: "quote" as const, text: "kutipan" },
    ];
    expect(blocksFromDocument(blocksToDocument(blocks))).toEqual(blocks);
  });

  it("gives the editor one empty paragraph when there is nothing yet", () => {
    expect(blocksToDocument([]).content).toEqual([{ type: "paragraph" }]);
  });
});
