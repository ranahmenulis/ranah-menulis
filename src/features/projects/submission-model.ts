import type { JSONContent } from "@tiptap/react";
import { GENRES } from "@/features/community/types";
import { docStats } from "@/features/studio/editor-stats";
import type { Locale } from "@/lib/i18n/config";
import { isActiveDocument } from "@/features/studio/document-archive";
import { flowCopy } from "./copy/flow";
import { projectHref } from "./project-model";
import { makeProblem, type Problem, type ProblemField } from "./submission-problem";
import {
  BOOK_TYPES,
  NOTE_LIMIT,
  SYNOPSIS_LIMIT,
  TITLE_LIMIT,
  type Submission,
  type SubmissionVersion,
  type VersionFile,
  uploadDocId,
} from "./submission-types";
import type { Project, Registration } from "./types";

export const kirimHref = (slug: string, documentId?: string) =>
  `${projectHref(slug)}/kirim${documentId ? `?dokumen=${encodeURIComponent(documentId)}` : ""}`;

const isSolo = (project: Project) => project.block.kind === "solo";

/** Solo asks for the kind of book; every other category asks for a genre. */
export function genreOptions(project: Project): readonly string[] {
  return isSolo(project) ? BOOK_TYPES : GENRES;
}

/** An anonymous contest hides who wrote a work from the judges (BR-PRJ-08). */
export const isAnonymousContest = (project: Project) =>
  project.block.kind === "lomba" && project.block.anonymous;

/** Submissions that still count against the limit: a withdrawn one frees its place. */
export function activeSubmissions(submissions: Submission[], slug: string): Submission[] {
  return submissions.filter((s) => s.slug === slug && s.status !== "ditarik");
}

/** Why a reader cannot send work to a project right now; `null` means they can (PRD 10.5, step 1). */
export type SubmitBlock =
  | "tidak-menerima"
  | "tamu"
  | "belum-terdaftar"
  | "menunggu-pembayaran"
  | "ditutup"
  | "batas-tercapai";

/**
 * Registered and active, before the deadline, under the limit. [usulan] The deadline is the same
 * one as registration (end of its day in the project's zone); after it only a revision an editor
 * asked for may be sent (6f-4). Solo has no deadline.
 */
export function submitBlock(input: {
  project: Project;
  guest: boolean;
  registration?: Registration;
  now: number;
  /** Submissions of this reader to this project that still count. */
  sent: number;
}): SubmitBlock | null {
  const { project, guest, registration, now, sent } = input;
  if (!project.submission) return "tidak-menerima";
  if (guest) return "tamu";
  if (!registration) return "belum-terdaftar";
  if (registration.status !== "terdaftar") return "menunggu-pembayaran";
  if (project.closesAt !== null && project.closesAt < now) return "ditutup";
  if (sent >= project.submission.maxWorks) return "batas-tercapai";
  return null;
}

/**
 * The project page's button once you are registered and active. `null` leaves the registration
 * wording ("Terdaftar", "Menunggu pembayaran") in place.
 */
export function submitAction(
  block: SubmitBlock | null,
  locale: Locale = "id",
): { label: string; enabled: boolean } | null {
  const text = flowCopy(locale);
  if (block === null) return { label: text.common.sendWork, enabled: true };
  if (block === "ditutup") return { label: text.action.submitClosed, enabled: false };
  if (block === "batas-tercapai") return { label: text.action.limitReached, enabled: false };
  return null;
}

/** What the participant fills in. The statement is never kept in a draft: it is made at sending. */
export type SubmitForm = {
  docId: string | null;
  /** Solo only (Q-13): an uploaded PDF or DOCX instead of a Studio document. Never both. */
  upload: VersionFile | null;
  title: string;
  genre: string;
  note: string;
  synopsis: string;
  agreed: boolean;
};

export const emptyForm: SubmitForm = {
  docId: null,
  upload: null,
  title: "",
  genre: "",
  note: "",
  synopsis: "",
  agreed: false,
};

/** The part of a Studio document that sending needs. */
export type SubmitDoc = {
  id: string;
  title: string;
  content: JSONContent;
  deletedAt?: number | null;
  archivedAt?: number | null;
};

export type { Problem, ProblemField };

export const wordsOf = (doc: SubmitDoc) => docStats(doc.content).words;

/**
 * The form when the screen opens: the saved draft, then the document named in the address on top
 * of it. An unavailable document is dropped, the title starts from the document's, and
 * a genre that the project does not offer is cleared.
 */
export function initialForm(input: {
  project: Project;
  draft: Omit<SubmitForm, "agreed"> | null;
  docs: SubmitDoc[];
  documentId: string | null;
}): SubmitForm {
  const { project, draft, docs, documentId } = input;
  const form: SubmitForm = { ...emptyForm, ...draft };
  const usable = (id: string | null) => docs.find((d) => d.id === id && isActiveDocument(d));
  const chosen = usable(documentId) ?? usable(form.docId);
  form.docId = chosen?.id ?? null;
  // An uploaded file is only for Solo, and a document picked from the address replaces it.
  if (!isSolo(project) || chosen) form.upload = null;
  // A draft title belongs to the draft's document: a different one from the address brings its own.
  const switched = chosen !== undefined && chosen.id !== draft?.docId;
  if (chosen && (switched || form.title.trim() === "")) {
    form.title = chosen.title.trim().slice(0, TITLE_LIMIT);
  }
  if (!genreOptions(project).includes(form.genre)) form.genre = "";
  return form;
}

type Found = Pick<Problem, "code" | "values"> | null;

function docProblem(
  project: Project,
  form: SubmitForm,
  doc: SubmitDoc | null,
  sent: Submission[],
): Found {
  const rules = project.submission;
  if (!rules || !form.docId) {
    if (form.docId !== null) return null;
    return { code: isSolo(project) ? "pickDocSolo" : "pickDoc" };
  }
  if (!doc || doc.deletedAt) return { code: "docGone" };
  if (doc.archivedAt != null) return { code: "docArchived" };
  const words = wordsOf(doc);
  if (words === 0) return { code: "docEmpty" };
  if (sent.some((s) => s.docId === doc.id)) return { code: "docSent" };
  if (words < rules.minWords) return { code: "tooShort", values: { words, min: rules.minWords } };
  if (words > rules.maxWords) return { code: "tooLong", values: { words, max: rules.maxWords } };
  return null;
}

function uploadProblem(project: Project, upload: VersionFile, sent: Submission[]): Found {
  if (!isSolo(project)) return { code: "soloUploadOnly" };
  if (sent.some((s) => s.docId === uploadDocId(upload.fileId))) return { code: "fileSent" };
  return null;
}

/**
 * Every rule that stops this form from being sent, one message each (PRD 10.5, step 4). Nothing
 * here removes what was typed. `sent` is this reader's active submissions to this project.
 */
export function validateSubmission(input: {
  project: Project;
  form: SubmitForm;
  doc: SubmitDoc | null;
  sent: Submission[];
  now: number;
}): Problem[] {
  const { project, form, doc, sent, now } = input;
  const rules = project.submission;
  const problems: Problem[] = [];
  const add = (field: ProblemField, found: Found | false) => {
    if (found) problems.push(makeProblem(field, found.code, found.values));
  };
  if (!rules) return [makeProblem("limit", "noSubmission")];

  add("closed", project.closesAt !== null && project.closesAt < now && { code: "closed" });
  add("limit", sent.length >= rules.maxWorks && { code: "limit", values: { n: rules.maxWorks } });
  add(
    "doc",
    form.upload ? uploadProblem(project, form.upload, sent) : docProblem(project, form, doc, sent),
  );
  const title = form.title.trim();
  add("title", title === "" && { code: "titleRequired" });
  add("title", title.length > TITLE_LIMIT && { code: "titleLong", values: { n: TITLE_LIMIT } });
  add(
    "genre",
    !genreOptions(project).includes(form.genre) && {
      code: isSolo(project) ? "chooseBookType" : "chooseGenre",
    },
  );
  add(
    "note",
    form.note.trim().length > NOTE_LIMIT && { code: "noteLong", values: { n: NOTE_LIMIT } },
  );
  if (isSolo(project)) {
    const synopsis = form.synopsis.trim();
    add("synopsis", synopsis === "" && { code: "synopsisRequired" });
    add(
      "synopsis",
      synopsis.length > SYNOPSIS_LIMIT && { code: "synopsisLong", values: { n: SYNOPSIS_LIMIT } },
    );
  }
  add("agreed", !form.agreed && { code: "agreeRequired" });
  return problems;
}

/**
 * Whether the form can start over after a work was just sent. The list reloads a moment after
 * sending, so the new work is counted here even when it is not in `mine` yet.
 */
export function canSendAnother(
  project: Project,
  mine: Submission[],
  justSent: Submission,
): boolean {
  const counted = mine.some((s) => s.id === justSent.id) ? mine.length : mine.length + 1;
  return counted < (project.submission?.maxWorks ?? 0);
}

/** The record for a sent work: status Terkirim, with the change logged (BR-PRJ-05). */
export function newSubmission(input: {
  id: string;
  project: Project;
  registration: Registration;
  form: SubmitForm;
  /** The Studio document, or the uploaded file as `{ id: uploadDocId(...), title: file name }`. */
  doc: Pick<SubmitDoc, "id" | "title">;
  version: SubmissionVersion;
  now: number;
}): Submission {
  const { id, project, registration, form, doc, version, now } = input;
  const solo = isSolo(project);
  return {
    id,
    slug: project.slug,
    title: form.title.trim(),
    genre: form.genre,
    note: form.note.trim(),
    synopsis: solo ? form.synopsis.trim() : undefined,
    packageName: solo ? registration.packageName : undefined,
    originalityAgreedAt: now,
    docId: doc.id,
    docTitle: doc.title.trim() || "Tanpa judul",
    status: "terkirim",
    statusLog: [{ status: "terkirim", at: now, by: "sistem" }],
    versions: [version],
    submittedAt: now,
  };
}
