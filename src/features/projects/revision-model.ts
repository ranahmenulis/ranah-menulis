import {
  activeSubmissions,
  validateSubmission,
  type Problem,
  type SubmitDoc,
} from "./submission-model";
import type { Submission, VersionFile } from "./submission-types";
import type { Project } from "./types";

/**
 * Every rule that stops a revision, one message each. It is the first-sending validation with the
 * title, genre and synopsis taken from the work, and without the project deadline, which a
 * revision outlives (only the revision deadline counts, checked by `reviseBlock`). `all` is every
 * submission on this device; the work itself does not count against itself.
 */
export function revisionProblems(input: {
  project: Project;
  work: Submission;
  docId: string | null;
  /** An uploaded file chosen as the revision (Solo), instead of a document. */
  upload?: VersionFile | null;
  note: string;
  doc: SubmitDoc | null;
  all: Submission[];
  now: number;
}): Problem[] {
  const { project, work, docId, upload = null, note, doc, all, now } = input;
  return validateSubmission({
    project: { ...project, closesAt: null },
    form: {
      docId,
      upload,
      title: work.title,
      genre: work.genre,
      note,
      synopsis: work.synopsis ?? "",
      agreed: true,
    },
    doc,
    sent: activeSubmissions(all, project.slug).filter((s) => s.id !== work.id),
    now,
  });
}
