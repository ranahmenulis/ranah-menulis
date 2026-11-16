import type { JSONContent } from "@tiptap/react";
import { docStats } from "@/features/studio/editor-stats";
import type { SubmissionVersion } from "../submission-types";
import type { AssignmentSource, AssignmentSubmission } from "./types";

/** [usulan] Typed text is capped so a paste cannot fill the device. */
export const TEXT_LIMIT = 30_000;

/** What the participant fills in when handing in. */
export type AssignmentForm = {
  source: AssignmentSource;
  docId: string | null;
  text: string;
};

export const emptyAssignmentForm: AssignmentForm = { source: "studio", docId: null, text: "" };

/** The part of a Studio document that handing in needs. */
export type AssignmentDoc = {
  id: string;
  title: string;
  content: JSONContent;
  deletedAt?: number | null;
};

export type AssignmentProblem = { field: "doc" | "text" | "closed"; message: string };

/** Typed text becomes paragraphs: a blank line starts a new one, a single line break stays inside. */
export function textToDoc(text: string): JSONContent {
  const paragraphs = text
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return {
    type: "doc",
    content: paragraphs.map((p) => ({
      type: "paragraph",
      content: p
        .split("\n")
        .flatMap((line, i) => [
          ...(i > 0 ? [{ type: "hardBreak" }] : []),
          ...(line ? [{ type: "text", text: line }] : []),
        ]),
    })),
  };
}

export const wordsInDoc = (doc: AssignmentDoc) => docStats(doc.content).words;

/** One message per rule that stops the hand-in. Nothing the participant typed is ever cleared. */
export function validateAssignment(input: {
  form: AssignmentForm;
  doc: AssignmentDoc | null;
}): AssignmentProblem[] {
  const { form, doc } = input;
  if (form.source === "teks") {
    const text = form.text.trim();
    if (text === "") return [{ field: "text", message: "Tulis tugasmu dulu." }];
    if (docStats(textToDoc(text)).words === 0) {
      return [{ field: "text", message: "Tugasmu belum berisi kata." }];
    }
    if (text.length > TEXT_LIMIT) {
      return [{ field: "text", message: "Tugasmu terlalu panjang untuk diketik di sini." }];
    }
    return [];
  }
  if (form.docId === null) return [{ field: "doc", message: "Pilih dokumen dari Studio." }];
  if (!doc || doc.deletedAt) {
    return [{ field: "doc", message: "Dokumen ini tidak ada lagi di Studio." }];
  }
  if (wordsInDoc(doc) === 0) return [{ field: "doc", message: "Dokumen ini masih kosong." }];
  return [];
}

/** What is frozen for this form: the document as it is now, or the typed text. */
export function contentOf(form: AssignmentForm, doc: AssignmentDoc | null): JSONContent | null {
  if (form.source === "teks") return textToDoc(form.text);
  return doc?.content ?? null;
}

export function docTitleOf(form: AssignmentForm, doc: AssignmentDoc | null): string {
  return form.source === "teks" ? "Diketik langsung" : doc?.title.trim() || "Tanpa judul";
}

/** The record for a handed-in assignment: status Dikumpulkan, with the change logged. */
export function newAssignmentSubmission(input: {
  id: string;
  slug: string;
  assignmentId: string;
  form: AssignmentForm;
  doc: AssignmentDoc | null;
  version: SubmissionVersion;
  dueAt: number;
  now: number;
}): AssignmentSubmission {
  const { id, slug, assignmentId, form, doc, version, dueAt, now } = input;
  return {
    id,
    slug,
    assignmentId,
    source: form.source,
    docId: form.source === "studio" ? form.docId : null,
    docTitle: docTitleOf(form, doc),
    status: "dikumpulkan",
    late: now > dueAt,
    submittedAt: now,
    versions: [version],
    statusLog: [{ status: "dikumpulkan", at: now, by: "peserta" }],
  };
}
