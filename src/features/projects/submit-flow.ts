import type { DocumentStore } from "@/features/studio/storage/document-store";
import type { FileStore } from "@/lib/files/file-store";
import { fileStore } from "@/lib/files/store";
import { readStoredBytes } from "@/lib/files/save-upload";
import { freezeFile, freezeVersion } from "./submission-freeze";
import {
  activeSubmissions,
  newSubmission,
  validateSubmission,
  type Problem,
  type SubmitForm,
} from "./submission-model";
import { blockMessage } from "./submission-text";
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
  documents: Pick<DocumentStore, "get">;
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
        problems: [{ field: "limit", message: blockMessage("menunggu-pembayaran", null) }],
      };
    }
    const sent = activeSubmissions(await store.list(), project.slug);
    const doc = form.docId && !form.upload ? await documents.get(form.docId) : null;
    const problems = validateSubmission({ project, form, doc, sent, now });
    if (problems.length > 0 || !project.submission) return { kind: "invalid", problems };

    // The manuscript is frozen here: a Studio document as it is now, or the bytes of the file.
    let source: { id: string; title: string };
    let version;
    if (form.upload) {
      const bytes = await readStoredBytes(files, form.upload.fileId);
      if (!bytes) {
        const message = "Berkas yang kamu unggah tidak ditemukan lagi. Unggah ulang berkasnya.";
        return { kind: "invalid", problems: [{ field: "doc", message }] };
      }
      source = { id: uploadDocId(form.upload.fileId), title: form.upload.name };
      version = freezeFile(form.upload, bytes, now);
    } else if (doc) {
      source = doc;
      version = freezeVersion(doc.content, now);
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
      const message = "Dokumen ini sudah dikirim ke proyek ini.";
      return { kind: "invalid", problems: [{ field: "doc", message }] };
    }
    if (verdict === "limit") {
      return {
        kind: "invalid",
        problems: [{ field: "limit", message: blockMessage("batas-tercapai", project.submission) }],
      };
    }
    clearDraft(project.slug);
    notifySubmissionsChanged();
    return { kind: "sent", submission };
  } catch {
    return { kind: "failed" };
  }
}
