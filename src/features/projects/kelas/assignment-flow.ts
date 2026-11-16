import type { DocumentStore } from "@/features/studio/storage/document-store";
import { freezeVersion } from "../submission-freeze";
import type { SubmissionVersion } from "../submission-types";
import {
  contentOf,
  docTitleOf,
  newAssignmentSubmission,
  validateAssignment,
  type AssignmentDoc,
  type AssignmentForm,
  type AssignmentProblem,
} from "./assignment-model";
import { resubmitBlock, withResubmission } from "./assignment-status";
import { handInBlock } from "./class-model";
import { notifyAssignmentsChanged } from "./storage/assignment-events";
import type { AssignmentStore } from "./storage/assignment-store";
import type { AssignmentSubmission, ClassContent } from "./types";

export type HandInResult =
  | { kind: "sent"; submission: AssignmentSubmission }
  | { kind: "invalid"; problems: AssignmentProblem[] }
  | { kind: "failed" };

type Input = {
  content: ClassContent;
  assignmentId: string;
  form: AssignmentForm;
  documents: Pick<DocumentStore, "get">;
  store: AssignmentStore;
};

const invalid = (field: AssignmentProblem["field"], message: string): HandInResult => ({
  kind: "invalid",
  problems: [{ field, message }],
});

type Prepared =
  | { kind: "ready"; doc: AssignmentDoc | null; frozen: SubmissionVersion }
  | { kind: "invalid"; problems: AssignmentProblem[] };

/** Reads the document again, checks the rules, and freezes what is being handed in. */
async function prepare(
  form: AssignmentForm,
  documents: Pick<DocumentStore, "get">,
  now: number,
): Promise<Prepared> {
  const doc = form.source === "studio" && form.docId ? await documents.get(form.docId) : null;
  const problems = validateAssignment({ form, doc });
  const content = contentOf(form, doc);
  if (problems.length > 0 || !content) return { kind: "invalid", problems };
  return { kind: "ready", doc, frozen: freezeVersion(content, now) };
}

const NOT_STARTED = "Tugas dibuka saat kelas dimulai.";
const NOT_FOUND = "Tugas ini tidak ditemukan.";

/**
 * Hands in an assignment (KLS-03). Everything is read again at the moment of sending: the clock
 * and the document, which may have been edited or trashed since the page opened. A deadline that
 * has passed does not stop it: the hand-in is accepted and marked late [usulan, Q-27]. The text is
 * frozen from the document as it is now, or from what was typed.
 */
export async function handInAssignment(input: Input): Promise<HandInResult> {
  const { content, assignmentId, form, documents, store } = input;
  const now = Date.now();
  try {
    const block = handInBlock(content, assignmentId, now);
    if (block === "tidak-ada") return invalid("closed", NOT_FOUND);
    if (block === "belum-dimulai") return invalid("closed", NOT_STARTED);

    const prepared = await prepare(form, documents, now);
    if (prepared.kind === "invalid") return prepared;
    const { doc, frozen } = prepared;

    const assignment = content.modules.find((m) => m.assignment.id === assignmentId)!.assignment;
    const submission = newAssignmentSubmission({
      id: crypto.randomUUID(),
      slug: content.slug,
      assignmentId,
      form,
      doc,
      version: frozen,
      dueAt: assignment.dueAt,
      now,
    });
    const verdict = await store.add(submission);
    if (verdict === "duplicate") return invalid("closed", "Tugas ini sudah dikumpulkan.");
    notifyAssignmentsChanged();
    return { kind: "sent", submission };
  } catch {
    return { kind: "failed" };
  }
}

type ResubmitInput = Omit<Input, "assignmentId" | "content"> & { submissionId: string };

/**
 * Hands in again after the mentor asked for a repair. The row is read again inside the write, so a
 * second tab or a decision that came in meanwhile is respected. The new version must differ from
 * the last one, otherwise there is nothing new for the mentor to read.
 */
export async function resubmitAssignment(input: ResubmitInput): Promise<HandInResult> {
  const { form, documents, store, submissionId } = input;
  const now = Date.now();
  try {
    const current = (await store.list()).find((s) => s.id === submissionId);
    if (!current) return invalid("closed", NOT_FOUND);
    if (resubmitBlock(current)) {
      return invalid("closed", "Tugas ini tidak sedang diminta diperbaiki.");
    }
    const prepared = await prepare(form, documents, now);
    if (prepared.kind === "invalid") return prepared;
    const { doc, frozen } = prepared;
    let revised: AssignmentSubmission | null = null;
    let unchanged = false;
    const verdict = await store.update(current.id, (latest) => {
      // Checked against the row being written, not the one read above: another tab may have moved it.
      unchanged = latest.versions.at(-1)?.hash === frozen.hash;
      if (unchanged) return null;
      revised = withResubmission(latest, {
        version: frozen,
        source: form.source,
        docId: form.source === "studio" ? form.docId : null,
        docTitle: docTitleOf(form, doc),
        now,
      });
      return revised;
    });
    if (verdict === "missing") return invalid("closed", NOT_FOUND);
    if (unchanged) {
      const field = form.source === "teks" ? "text" : "doc";
      return invalid(field, "Tugasmu belum berubah sejak versi terakhir. Perbaiki dulu isinya.");
    }
    if (verdict !== "ok" || !revised) {
      return invalid("closed", "Tugas ini tidak bisa dikumpulkan lagi sekarang.");
    }
    notifyAssignmentsChanged();
    return { kind: "sent", submission: revised };
  } catch {
    return { kind: "failed" };
  }
}
