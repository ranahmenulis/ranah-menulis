"use client";

import { useState, type FormEvent } from "react";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import type { FileStore } from "@/lib/files/file-store";
import { saveUpload } from "@/lib/files/save-upload";
import { fileStore } from "@/lib/files/store";
import { loadDraft, saveDraft } from "../submission-draft";
import {
  initialForm,
  validateSubmission,
  type Problem,
  type ProblemField,
  type SubmitForm,
} from "../submission-model";
import { TITLE_LIMIT, type Submission } from "../submission-types";
import type { SendResult } from "../submit-flow";
import type { Project } from "../types";

type Input = {
  project: Project;
  /** When the page opened; the real check happens again when the button is pressed. */
  now: number;
  docs: StudioDocument[];
  /** This reader's works still counting against this project. */
  sent: Submission[];
  documentId: string | null;
  files?: FileStore;
  onSend: (form: SubmitForm) => Promise<SendResult>;
};

/**
 * State of the send form: the fields (kept as a draft on this device), which messages show, and
 * sending. Once the participant pressed send every broken rule shows; before that only the word
 * check of the chosen document does. Nothing typed is ever cleared by a failure.
 */
export function useSubmitForm({ project, now, docs, sent, documentId, files, onSend }: Input) {
  const [form, setForm] = useState(() =>
    initialForm({ project, draft: loadDraft(project.slug), docs, documentId }),
  );
  const [attempted, setAttempted] = useState(false);
  /** Problems found when sending, from data read fresh at that moment. */
  const [late, setLate] = useState<Problem[]>([]);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  /** Why the last picked manuscript file was refused; shown beside the upload button. */
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const doc = docs.find((d) => d.id === form.docId) ?? null;
  const problems = validateSubmission({ project, form, doc, sent, now });

  const shown = late.length > 0 ? late : attempted ? problems : [];
  const live =
    (form.docId !== null || form.upload !== null) && !shown.some((p) => p.field === "doc")
      ? problems
      : [];
  const errorOf = (field: ProblemField) =>
    [...shown, ...(field === "doc" ? live : [])].find((p) => p.field === field)?.message;
  /** Rules that belong to no field: the deadline and the limit. */
  const general = shown.filter((p) => p.field === "closed" || p.field === "limit");

  function change(patch: Partial<SubmitForm>) {
    const next = { ...form, ...patch };
    setForm(next);
    setLate([]);
    setFailed(false);
    saveDraft(project.slug, next);
  }

  function pick(next: StudioDocument) {
    // The title follows the document until the participant writes their own.
    const current = form.title.trim();
    const follows = current === "" || current === doc?.title.trim().slice(0, TITLE_LIMIT);
    change({
      docId: next.id,
      upload: null,
      ...(follows ? { title: next.title.trim().slice(0, TITLE_LIMIT) } : {}),
    });
  }

  async function pickFile(file: File) {
    setUploading(true);
    setUploadError(null);
    const saved = await saveUpload(file, "manuscript", files ?? fileStore());
    setUploading(false);
    if (!saved.ok) return setUploadError(saved.message);
    const { id, name, type, size } = saved.file;
    const current = form.title.trim();
    const follows = current === "" || current === doc?.title.trim().slice(0, TITLE_LIMIT);
    // A file replaces the document and the title follows it, as it does for a document.
    change({
      docId: null,
      upload: { fileId: id, name, type, size },
      ...(follows ? { title: name.replace(/\.[^.]+$/, "").slice(0, TITLE_LIMIT) } : {}),
    });
  }

  function clearFile() {
    setUploadError(null);
    change({ upload: null });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setAttempted(true);
    if (problems.length > 0) return;
    setBusy(true);
    setFailed(false);
    const result = await onSend(form);
    setBusy(false);
    if (result.kind === "invalid") setLate(result.problems);
    if (result.kind === "failed") setFailed(true);
  }

  return {
    form,
    doc,
    change,
    pick,
    pickFile,
    clearFile,
    uploadError,
    uploading,
    submit,
    errorOf,
    general,
    /** The document named in the address is gone or in Sampah. */
    pickedGone: documentId !== null && !docs.some((d) => d.id === documentId),
    /** Whether any message is showing for the whole form. */
    blocked: shown.length > 0,
    busy,
    failed,
  };
}
