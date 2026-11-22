import type { FileStore } from "@/lib/files/file-store";
import { readStoredBytes } from "@/lib/files/save-upload";
import { fileStore } from "@/lib/files/store";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import { notifySubmissionsChanged } from "./storage/submission-events";
import type { SubmissionStore } from "./storage/submission-store";
import { freezeFile, freezeVersion } from "./submission-freeze";
import { revisionProblems } from "./revision-model";
import { activeSubmissions } from "./submission-model";
import { makeProblem, type Problem, type ProblemCode } from "./submission-problem";
import { reviseBlock, withRevision, type ReviseBlock } from "./submission-status";
import {
  uploadDocId,
  type Submission,
  type SubmissionVersion,
  type VersionFile,
} from "./submission-types";
import type { Project } from "./types";

export type ReviseResult =
  | { kind: "sent"; submission: Submission }
  | { kind: "invalid"; problems: Problem[] }
  | { kind: "failed" };

type Input = {
  project: Project;
  submission: Submission;
  docId: string | null;
  /** An uploaded file as the revision (Solo), instead of a document. */
  upload?: VersionFile | null;
  note: string;
  documents: Pick<DocumentStore, "get">;
  store: SubmissionStore;
  files?: FileStore;
};

type Frozen =
  | { ok: true; source: { id: string; title: string }; frozen: SubmissionVersion }
  | { ok: false; code: ProblemCode };

/**
 * The manuscript of a revision as frozen now (the uploaded file's bytes, or the document), or why
 * it cannot be sent: the file is gone, or it is the same as the latest version.
 */
async function freezeSource(
  doc: Awaited<ReturnType<Pick<DocumentStore, "get">["get"]>>,
  upload: VersionFile | null,
  files: FileStore,
  now: number,
  latestHash: string | undefined,
): Promise<Frozen> {
  let source: { id: string; title: string };
  let frozen: SubmissionVersion;
  if (upload) {
    const bytes = await readStoredBytes(files, upload.fileId);
    if (!bytes) {
      return { ok: false, code: "fileMissing" };
    }
    source = { id: uploadDocId(upload.fileId), title: upload.name };
    frozen = freezeFile(upload, bytes, now);
  } else if (doc) {
    source = { id: doc.id, title: doc.title };
    frozen = freezeVersion(doc.content, now);
  } else {
    return { ok: false, code: "docGone" };
  }
  if (frozen.hash !== latestHash) return { ok: true, source, frozen };
  return { ok: false, code: upload ? "fileSame" : "docSame" };
}

/** The answer when `update` said no: the reason found inside it, or a general one. */
const refused = (refusal: Problem | null): ReviseResult => ({
  kind: "invalid",
  problems: [refusal ?? makeProblem("closed", "revisionRefused")],
});

const invalid = (field: Problem["field"], code: ProblemCode): ReviseResult => ({
  kind: "invalid",
  problems: [makeProblem(field, code)],
});

const BLOCK_CODE: Record<ReviseBlock, ProblemCode> = {
  "bukan-perlu-revisi": "reviseNotRequested",
  "putaran-habis": "reviseRounds",
  "tenggat-lewat": "reviseOverdue",
};

/**
 * Sends a revision (PRD 10.5, step 7). Read again at the moment of sending: the submission itself,
 * the clock and the document. The project's own deadline does not apply (only a revision an editor
 * asked for may come after it); the revision deadline does. The new version is frozen from the
 * document as it is now and the old versions stay.
 */
export async function sendRevision(input: Input): Promise<ReviseResult> {
  const { project, submission, docId, upload = null, note, documents, store } = input;
  const files = input.files ?? fileStore();
  const now = Date.now();
  try {
    const all = await store.list();
    const current = all.find((s) => s.id === submission.id);
    if (!current) return invalid("limit", "workMissing");
    const block = reviseBlock(current, now);
    if (block) return invalid("closed", BLOCK_CODE[block]);

    const doc = docId && !upload ? await documents.get(docId) : null;
    const problems = revisionProblems({
      project,
      work: current,
      docId,
      upload,
      note,
      doc,
      all,
      now,
    });
    if (problems.length > 0) return { kind: "invalid", problems };

    const result = await freezeSource(doc, upload, files, now, current.versions.at(-1)?.hash);
    if (!result.ok) return invalid("doc", result.code);
    const { source, frozen } = result;
    // Why the change was refused, since `update` itself only says "rejected".
    let refusal: Problem | null = null;
    let revised: Submission | null = null;
    const verdict = await store.update(current.id, (latest, everyone) => {
      const duplicate = activeSubmissions(everyone, project.slug).some(
        (s) => s.id !== latest.id && s.docId === source.id,
      );
      if (duplicate) {
        refusal = makeProblem("doc", "docSent");
        return null;
      }
      const stop = reviseBlock(latest, now);
      if (stop) {
        refusal = makeProblem("closed", BLOCK_CODE[stop]);
        return null;
      }
      revised = withRevision(latest, {
        content: frozen.content,
        wordCount: frozen.wordCount,
        hash: frozen.hash,
        docId: source.id,
        docTitle: source.title.trim() || "Tanpa judul",
        file: upload ?? undefined,
        note: note.trim(),
        now,
      });
      return revised;
    });
    if (verdict === "missing") return invalid("limit", "workMissing");
    if (verdict !== "ok" || !revised) return refused(refusal);
    notifySubmissionsChanged();
    return { kind: "sent", submission: revised };
  } catch {
    return { kind: "failed" };
  }
}
