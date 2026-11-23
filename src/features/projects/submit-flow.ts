import type { FileStore } from "@/lib/files/file-store";
import { fileStore } from "@/lib/files/store";
import { readStoredBytes } from "@/lib/files/save-upload";
import { freezeFile, freezeStudioSource } from "./submission-freeze";
import { readSubmitSource, type SourceReader } from "./submit-source";
import {
  activeSubmissions,
  newSubmission,
  validateSubmission,
  type SubmitForm,
} from "./submission-model";
import { makeProblem, type Problem } from "./submission-problem";
import { clearDraft } from "./submission-draft";
import type { SubmissionStore } from "./storage/submission-store";
import { uploadDocId, type Submission } from "./submission-types";
import type { Project, Registration } from "./types";
import { notifySubmissionsChanged } from "./storage/submission-events";

export type SendResult =
  | { kind: "sent"; submission: Submission }
  | { kind: "invalid"; problems: Problem[] }
  | { kind: "failed" };

type SendInput = {
  project: Project;
  registration: Registration;
  form: SubmitForm;
  documents: SourceReader;
  store: SubmissionStore;
  /** Where an uploaded manuscript is kept (Solo). */
  files?: FileStore;
};

/**
 * Sends a work (PRD 10.5, steps 4 and 5). Everything is read again here, at the moment of sending:
 * the clock, the document, and what was already sent. The screen may have been open past the
 * deadline, and the document may have been edited or trashed meanwhile. The frozen copy is taken
 * from the document as it is now. Failing a rule never touches what the participant typed.
 */
export async function sendSubmission(input: SendInput): Promise<SendResult> {
  const { project, registration, form, documents, store } = input;
  const files = input.files ?? fileStore();
  const now = Date.now();
  try {
    if (registration.status !== "terdaftar") {
      return {
        kind: "invalid",
        problems: [makeProblem("limit", "waitingPayment")],
      };
    }
    const sent = activeSubmissions(await store.list(), project.slug);
    const read = await readSubmitSource(documents, form.upload ? null : form.docId);
    const doc = read.doc;
    const problems = validateSubmission({ project, form, doc, sent, now });
    if (problems.length > 0 || !project.submission) return { kind: "invalid", problems };

    // The manuscript is frozen here: a Studio document as it is now, or the bytes of the file.
    let source: { id: string; title: string };
    let version;
    if (form.upload) {
      const bytes = await readStoredBytes(files, form.upload.fileId);
      if (!bytes) {
        return { kind: "invalid", problems: [makeProblem("doc", "fileMissing")] };
      }
      source = { id: uploadDocId(form.upload.fileId), title: form.upload.name };
      version = freezeFile(form.upload, bytes, now);
    } else if (doc) {
      source = doc;
      version = freezeStudioSource(doc, read.chapters, now);
    } else {
      return { kind: "invalid", problems };
    }

    const submission = newSubmission({
      id: crypto.randomUUID(),
      project,
      registration,
      form,
      doc: source,
      version,
      now,
    });
    const verdict = await store.add(submission, project.submission.maxWorks);
    if (verdict === "duplicate") {
      return { kind: "invalid", problems: [makeProblem("doc", "docSent")] };
    }
    if (verdict === "limit") {
      return {
        kind: "invalid",
        problems: [makeProblem("limit", "limit", { n: project.submission.maxWorks })],
      };
    }
    clearDraft(project.slug);
    notifySubmissionsChanged();
    return { kind: "sent", submission };
  } catch {
    return { kind: "failed" };
  }
}
