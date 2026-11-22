import { describe, expect, it } from "vitest";
import {
  newAssignmentSubmission,
  textToDoc,
  validateAssignment,
} from "@/features/projects/kelas/assignment-model";
import { TEXT_LIMIT } from "@/features/projects/kelas/assignment-model";
import { NOW, textOf } from "../helpers";

const doc = (words: number, over = {}) => ({
  id: "d1",
  title: "Kerangka",
  content: textOf(words),
  ...over,
});

describe("textToDoc", () => {
  it("makes a paragraph per blank line and keeps single line breaks inside one", () => {
    const out = textToDoc("Satu\nbaris dua\n\n\nParagraf dua  ");
    expect(out.content).toHaveLength(2);
    expect(out.content?.[0].content?.map((n) => n.type)).toEqual(["text", "hardBreak", "text"]);
    expect(out.content?.[1].content?.[0].text).toBe("Paragraf dua");
  });

  it("handles Windows line endings and empty text", () => {
    expect(textToDoc("a\r\n\r\nb").content).toHaveLength(2);
    expect(textToDoc("   ").content).toEqual([]);
  });
});

describe("validateAssignment", () => {
  const studio = (docId: string | null) => ({ source: "studio" as const, docId, text: "" });
  const typed = (text: string) => ({ source: "teks" as const, docId: null, text });

  it("accepts a document with text and typed text with words", () => {
    expect(validateAssignment({ form: studio("d1"), doc: doc(10) })).toEqual([]);
    expect(validateAssignment({ form: typed("Ada kata"), doc: null })).toEqual([]);
  });

  it.each([
    ["no document chosen", studio(null), null, "doc", "Pilih dokumen dari Studio."],
    ["a document that is gone", studio("d1"), null, "doc", "Dokumen ini tidak ada lagi di Studio."],
    ["an empty document", studio("d1"), doc(0), "doc", "Dokumen ini masih kosong."],
    [
      "a trashed document",
      studio("d1"),
      doc(5, { deletedAt: 1 }),
      "doc",
      "Dokumen ini tidak ada lagi di Studio.",
    ],
    ["empty typed text", typed("  \n "), null, "text", "Tulis tugasmu dulu."],
    [
      "typed text over the limit",
      typed("kata ".repeat(TEXT_LIMIT)),
      null,
      "text",
      "Tugasmu terlalu panjang untuk diketik di sini.",
    ],
  ] as const)("refuses %s", (_, form, d, field, message) => {
    expect(validateAssignment({ form, doc: d })).toMatchObject([{ field, message }]);
  });

  it("ignores a document when the source is typed text", () => {
    expect(validateAssignment({ form: typed("kata"), doc: doc(0) })).toEqual([]);
  });
});

describe("newAssignmentSubmission", () => {
  const version = { version: 1, content: textOf(3), wordCount: 3, hash: "h", frozenAt: NOW };
  const base = {
    id: "x",
    slug: "k",
    assignmentId: "tugas-1",
    version,
    dueAt: NOW + 1000,
    now: NOW,
  };

  it("is on time up to the deadline and late after it", () => {
    const form = { source: "teks" as const, docId: null, text: "a" };
    expect(newAssignmentSubmission({ ...base, form, doc: null }).late).toBe(false);
    expect(newAssignmentSubmission({ ...base, form, doc: null, now: NOW + 1001 }).late).toBe(true);
  });

  it("keeps the document for a Studio hand-in and none for typed text", () => {
    const studio = newAssignmentSubmission({
      ...base,
      form: { source: "studio", docId: "d1", text: "" },
      doc: doc(3),
    });
    expect([studio.docId, studio.docTitle]).toEqual(["d1", "Kerangka"]);
    const typed = newAssignmentSubmission({
      ...base,
      form: { source: "teks", docId: "d1", text: "a" },
      doc: null,
    });
    expect([typed.docId, typed.docTitle]).toEqual([null, "Diketik langsung"]);
    expect(typed.statusLog).toEqual([{ status: "dikumpulkan", at: NOW, by: "peserta" }]);
  });
});
