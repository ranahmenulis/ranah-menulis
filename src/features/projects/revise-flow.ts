import type { DocumentStore } from "@/features/studio/storage/document-store";
import { notifySubmissionsChanged } from "./storage/submission-events";
import type { SubmissionStore } from "./storage/submission-store";
import { freezeVersion } from "./submission-freeze";
import { revisionProblems } from "./revision-model";
import { activeSubmissions, type Problem } from "./submission-model";
import { reviseBlock, reviseMessage, withRevision } from "./submission-status";
import type { Submission } from "./submission-types";
import type { Project } from "./types";

export type ReviseResult =
  | { kind: "sent"; submission: Submission }
  | { kind: "invalid"; problems: Problem[] }
  | { kind: "failed" };

type Input = {
  project: Project;
  submission: Submission;
  docId: string | null;
  note: string;
  documents: Pick<DocumentStore, "get">;
  store: SubmissionStore;
};

const invalid = (field: Problem["field"], message: string): ReviseResult => ({
  kind: "invalid",
  problems: [{ field, message }],
});

/**
 * Sends a revision (PRD 10.5, step 7). Read again at the moment of sending: the submission itself,
 * the clock and the document. The project's own deadline does not apply (only a revision an editor
 * asked for may come after it); the revision deadline does. The new version is frozen from the
 * document as it is now and the old versions stay.
 */
export async function sendRevision(input: Input): Promise<ReviseResult> {
  const { project, submission, docId, note, documents, store } = input;
  const now = Date.now();
  try {
    const all = await store.list();
    const current = all.find((s) => s.id === submission.id);
    if (!current) return invalid("limit", "Kiriman ini tidak ditemukan.");
    const block = reviseBlock(current, now);
    if (block) return invalid("closed", reviseMessage[block]);

    const doc = docId ? await documents.get(docId) : null;
    const problems = revisionProblems({ project, work: current, docId, note, doc, all, now });
    if (problems.length > 0 || !doc) return { kind: "invalid", problems };

    const frozen = freezeVersion(doc.content, now);
    if (current.versions.at(-1)?.hash === frozen.hash) {
      return invalid(
        "doc",
        "Dokumen ini belum berubah sejak versi terakhir. Edit dulu di Studio, atau pilih dokumen lain.",
      );
    }
    // Why the change was refused, since `update` itself only says "rejected".
    let refusal: Problem | null = null;
    let revised: Submission | null = null;
    const verdict = await store.update(current.id, (latest, everyone) => {
      const taken = activeSubmissions(everyone, project.slug).some(
        (s) => s.id !== latest.id && s.docId === doc.id,
      );
      if (taken) {
        refusal = { field: "doc", message: "Dokumen ini sudah dikirim ke proyek ini." };
        return null;
      }
      const stop = reviseBlock(latest, now);
      if (stop) {
        refusal = { field: "closed", message: reviseMessage[stop] };
        return null;
      }
      revised = withRevision(latest, {
        content: frozen.content,
        wordCount: frozen.wordCount,
        hash: frozen.hash,
        docId: doc.id,
        docTitle: doc.title.trim() || "Tanpa judul",
        note: note.trim(),
        now,
      });
      return revised;
    });
    if (verdict === "missing") return invalid("limit", "Kiriman ini tidak ditemukan.");
    if (verdict !== "ok" || !revised) {
      return {
        kind: "invalid",
        problems: [refusal ?? { field: "closed", message: "Revisi tidak bisa dikirim sekarang." }],
      };
    }
    notifySubmissionsChanged();
    return { kind: "sent", submission: revised };
  } catch {
    return { kind: "failed" };
  }
}
