import type { JSONContent } from "@tiptap/react";
import { docStats } from "@/features/studio/editor-stats";
import type { Locale } from "@/lib/i18n/config";
import {
  RESTORE_ARCHIVED_MESSAGE,
  restoreArchivedMessage,
} from "@/features/studio/document-archive";
import type { SubmissionVersion } from "../submission-types";
import { classCopy } from "./class-copy";
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
  archivedAt?: number | null;
};

/** Codes map to `projectsClass.problem` (and the Studio archive sentence); `message` is Indonesian. */
export type AssignmentProblemCode =
  | "textRequired"
  | "textNoWords"
  | "textTooLong"
  | "docRequired"
  | "docGone"
  | "docArchived"
  | "docEmpty"
  | "notStarted"
  | "notFound"
  | "duplicate"
  | "notRepair"
  | "unchanged"
  | "cannotNow";

export type AssignmentProblem = {
  field: "doc" | "text" | "closed";
  code: AssignmentProblemCode;
  message: string;
};

const MESSAGES = classCopy("id").problem;

/** The sentence for a problem in the interface language. */
export function problemText(problem: AssignmentProblem, locale: Locale = "id"): string {
  if (problem.code === "docArchived") return restoreArchivedMessage(locale);
  return classCopy(locale).problem[problem.code];
}

/** Builds a problem; the Indonesian sentence stays as the fallback text. */
export function problemOf(
  field: AssignmentProblem["field"],
  code: AssignmentProblemCode,
): AssignmentProblem {
  const message = code === "docArchived" ? RESTORE_ARCHIVED_MESSAGE : MESSAGES[code];
  return { field, code, message };
}

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
    if (text === "") return [problemOf("text", "textRequired")];
    if (docStats(textToDoc(text)).words === 0) {
      return [problemOf("text", "textNoWords")];
    }
    if (text.length > TEXT_LIMIT) {
      return [problemOf("text", "textTooLong")];
    }
    return [];
  }
  if (form.docId === null) return [problemOf("doc", "docRequired")];
  if (!doc || doc.deletedAt) {
    return [problemOf("doc", "docGone")];
  }
  if (doc.archivedAt != null) return [problemOf("doc", "docArchived")];
  if (wordsInDoc(doc) === 0) return [problemOf("doc", "docEmpty")];
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
