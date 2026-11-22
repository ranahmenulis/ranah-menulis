"use client";

import { useState, type FormEvent } from "react";
import { useLocale } from "@/lib/i18n/provider";
import { problemText, type FileProblem } from "@/lib/files/problem-text";
import { saveUpload } from "@/lib/files/save-upload";
import { fileStore } from "@/lib/files/store";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import { revisionProblems } from "../revision-model";
import type { ReviseResult } from "../revise-flow";
import { localizeProblem, type Problem } from "../submission-problem";
import type { Submission, VersionFile } from "../submission-types";
import type { Project } from "../types";

type Input = {
  project: Project;
  work: Submission;
  all: Submission[];
  docs: StudioDocument[];
  now: number;
  onSend: (docId: string | null, note: string, upload: VersionFile | null) => Promise<ReviseResult>;
};

/**
 * State of the revision form. The document already sent is chosen at first (when it still
 * exists). Once the participant pressed send every broken rule shows; before that only the word
 * check of the chosen document does. Nothing typed is ever cleared by a failure.
 */
export function useReviseForm({ project, work, all, docs, now, onSend }: Input) {
  const locale = useLocale();
  const [docId, setDocId] = useState<string | null>(() =>
    docs.some((d) => d.id === work.docId) ? work.docId : null,
  );
  /** A file chosen as the revision; starts as the file already sent (sending it again is refused). */
  const [upload, setUpload] = useState<VersionFile | null>(
    () => work.versions.at(-1)?.file ?? null,
  );
  const [uploadProblem, setUploadProblem] = useState<FileProblem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState("");
  const [attempted, setAttempted] = useState(false);
  /** Problems found when sending, from data read fresh at that moment. */
  const [late, setLate] = useState<Problem[]>([]);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const doc = docs.find((d) => d.id === docId) ?? null;
  const problems = revisionProblems({ project, work, docId, upload, note, doc, all, now });
  const shown = (late.length > 0 ? late : attempted ? problems : []).map((p) =>
    localizeProblem(p, locale),
  );
  // Once a document is chosen its own problem (too short, too long) shows without waiting.
  const live =
    (docId !== null || upload !== null) && !shown.some((p) => p.field === "doc")
      ? problems.map((p) => localizeProblem(p, locale))
      : [];

  const messageOf = (field: Problem["field"]) =>
    [...shown, ...(field === "doc" ? live : [])].find((p) => p.field === field)?.message;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setAttempted(true);
    if (problems.length > 0) return;
    setBusy(true);
    setFailed(false);
    const result = await onSend(docId, note, upload);
    setBusy(false);
    if (result.kind === "invalid") setLate(result.problems);
    if (result.kind === "failed") setFailed(true);
  }

  return {
    docId,
    doc,
    note,
    upload,
    uploading,
    uploadError: uploadProblem ? problemText(uploadProblem, "manuscript", locale) : null,
    pickDoc: (next: StudioDocument) => {
      setDocId(next.id);
      setUpload(null);
      setLate([]);
    },
    pickFile: async (file: File) => {
      setUploading(true);
      setUploadProblem(null);
      const saved = await saveUpload(file, "manuscript", fileStore());
      setUploading(false);
      if (!saved.ok) return setUploadProblem(saved.problem);
      const { id, name, type, size } = saved.file;
      setUpload({ fileId: id, name, type, size });
      setDocId(null);
      setLate([]);
    },
    clearFile: () => {
      setUpload(null);
      setUploadProblem(null);
      setLate([]);
    },
    changeNote: (value: string) => {
      setNote(value);
      setLate([]);
    },
    docError: messageOf("doc"),
    noteError: messageOf("note"),
    /** Rules that belong to no field: the revision deadline, a work that is gone. */
    general: shown.filter((p) => p.field === "closed" || p.field === "limit"),
    blocked: shown.length > 0,
    busy,
    failed,
    submit,
  };
}
