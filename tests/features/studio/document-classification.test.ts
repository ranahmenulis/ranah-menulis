import { describe, expect, it } from "vitest";
import {
  addDocumentTag,
  parseKind,
  parseTag,
  validateClassification,
} from "@/features/studio/document-classification";

describe("document classification", () => {
  it("allows old documents without a kind or tags and rejects unknown kinds", () => {
    expect(validateClassification({})).toEqual({ kind: undefined, tags: [] });
    expect(parseKind("cerpen")).toBe("cerpen");
    expect(parseKind("toString")).toBeNull();
    expect(parseKind("rencana")).toBeNull();
  });

  it("normalizes Unicode and outside whitespace while keeping the display case", () => {
    expect(addDocumentTag([], "  Cafe\u0301 & Hujan  ")).toEqual({
      ok: true,
      tags: ["Café & Hujan"],
    });
    expect(parseTag(" Café & HUJAN ")).toBe("café & hujan");
    expect(addDocumentTag(["Café"], " CAFE\u0301 ")).toHaveProperty("error");
  });

  it("validates blank input, the fifth tag, and the 24-character boundary", () => {
    const four = ["satu", "dua", "tiga", "empat"];
    const five = [...four, "lima"];
    const unicode = "日".repeat(24);

    expect(addDocumentTag([], "  ")).toHaveProperty("error");
    expect(addDocumentTag([], unicode)).toEqual({ ok: true, tags: [unicode] });
    expect(addDocumentTag([], `${unicode}本`)).toHaveProperty("error");
    expect(parseTag(`${unicode}本`)).toBeNull();
    expect(addDocumentTag(four, "lima")).toEqual({ ok: true, tags: five });
    expect(addDocumentTag(five, "enam")).toHaveProperty("error");
    expect(validateClassification({ tags: [...five, "enam"] })).toBeNull();
  });
});
