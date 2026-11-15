import { describe, expect, it } from "vitest";
import { diffParagraphs, paragraphsOf } from "@/features/studio/diff-paragraphs";

describe("diffParagraphs", () => {
  it("finds no differences in identical versions", () => {
    const { onlyA, onlyB } = diffParagraphs(["satu", "dua"], ["satu", "dua"]);
    expect(onlyA.size + onlyB.size).toBe(0);
  });

  it("marks only the paragraph that changed on each side", () => {
    const a = ["satu", "dua", "tiga versi A"];
    const b = ["satu", "dua", "tiga versi B"];
    const { onlyA, onlyB } = diffParagraphs(a, b);
    expect([...onlyA]).toEqual([2]);
    expect([...onlyB]).toEqual([2]);
  });

  it("marks an inserted paragraph on one side only", () => {
    const { onlyA, onlyB } = diffParagraphs(["satu", "dua"], ["satu", "sisipan", "dua"]);
    expect(onlyA.size).toBe(0);
    expect([...onlyB]).toEqual([1]);
  });

  it("handles an empty side", () => {
    const { onlyA, onlyB } = diffParagraphs([], ["satu"]);
    expect(onlyA.size).toBe(0);
    expect([...onlyB]).toEqual([0]);
  });
});

describe("paragraphsOf", () => {
  it("returns the text of each top-level block and skips empty ones", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Hujan " },
            { type: "text", text: "turun." },
          ],
        },
        { type: "paragraph" },
        {
          type: "blockquote",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Kutipan" }] }],
        },
      ],
    };
    expect(paragraphsOf(doc)).toEqual(["Hujan turun.", "Kutipan"]);
  });
});
