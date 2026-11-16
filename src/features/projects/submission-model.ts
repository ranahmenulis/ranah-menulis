import type { JSONContent } from "@tiptap/react";
import { GENRES } from "@/features/community/types";
import { docStats } from "@/features/studio/editor-stats";
import { formatNumber, projectHref } from "./project-model";
import {
  BOOK_TYPES,
  NOTE_LIMIT,
  SYNOPSIS_LIMIT,
  TITLE_LIMIT,
  type Submission,
  type SubmissionVersion,
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
): { label: string; enabled: boolean } | null {
  if (block === null) return { label: "Kirim karya", enabled: true };
  if (block === "ditutup") return { label: "Pengiriman ditutup", enabled: false };
  if (block === "batas-tercapai") return { label: "Batas karya tercapai", enabled: false };
  return null;
}

/** What the participant fills in. The statement is never kept in a draft: it is made at sending. */
export type SubmitForm = {
  docId: string | null;
  title: string;
  genre: string;
  note: string;
  synopsis: string;
  agreed: boolean;
};

export const emptyForm: SubmitForm = {
  docId: null,
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
};

export type ProblemField =
  "doc" | "title" | "genre" | "note" | "synopsis" | "agreed" | "closed" | "limit";
export type Problem = { field: ProblemField; message: string };

export const wordsOf = (doc: SubmitDoc) => docStats(doc.content).words;

/**
 * The form when the screen opens: the saved draft, then the document named in the address on top
 * of it. A document that is gone or in Sampah is dropped, the title starts from the document's, and
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
  const usable = (id: string | null) => docs.find((d) => d.id === id && !d.deletedAt);
  const chosen = usable(documentId) ?? usable(form.docId);
  form.docId = chosen?.id ?? null;
  // A draft title belongs to the draft's document: a different one from the address brings its own.
  const switched = chosen !== undefined && chosen.id !== draft?.docId;
  if (chosen && (switched || form.title.trim() === "")) {
    form.title = chosen.title.trim().slice(0, TITLE_LIMIT);
  }
  if (!genreOptions(project).includes(form.genre)) form.genre = "";
  return form;
}

function docProblem(project: Project, form: SubmitForm, doc: SubmitDoc | null, sent: Submission[]) {
  const rules = project.submission;
  if (!rules || !form.docId) return form.docId === null ? "Pilih dokumen dari Studio." : null;
  if (!doc || doc.deletedAt) return "Dokumen ini tidak ada lagi di Studio.";
  const words = wordsOf(doc);
  if (words === 0) return "Dokumen ini masih kosong.";
  if (sent.some((s) => s.docId === doc.id)) return "Dokumen ini sudah dikirim ke proyek ini.";
  if (words < rules.minWords) {
    return `Naskahmu ${formatNumber(words)} kata, kurang dari batas minimal ${formatNumber(rules.minWords)} kata.`;
  }
  if (words > rules.maxWords) {
    return `Naskahmu ${formatNumber(words)} kata, melebihi batas ${formatNumber(rules.maxWords)} kata.`;
  }
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
  const add = (field: ProblemField, message: string | null | false) => {
    if (message) problems.push({ field, message });
  };
  if (!rules) return [{ field: "limit", message: "Proyek ini tidak menerima kiriman karya." }];

  add(
    "closed",
    project.closesAt !== null &&
      project.closesAt < now &&
      "Pengiriman ke proyek ini sudah ditutup.",
  );
  add(
    "limit",
    sent.length >= rules.maxWorks &&
      `Kamu sudah mengirim ${rules.maxWorks} karya, batas untuk proyek ini.`,
  );
  add("doc", docProblem(project, form, doc, sent));
  const title = form.title.trim();
  add("title", title === "" && "Isi judul karya.");
  add("title", title.length > TITLE_LIMIT && `Judul maksimal ${TITLE_LIMIT} karakter.`);
  add(
    "genre",
    !genreOptions(project).includes(form.genre) &&
      (isSolo(project) ? "Pilih jenis buku." : "Pilih genre."),
  );
  add("note", form.note.trim().length > NOTE_LIMIT && `Catatan maksimal ${NOTE_LIMIT} karakter.`);
  if (isSolo(project)) {
    const synopsis = form.synopsis.trim();
    add("synopsis", synopsis === "" && "Isi sinopsis.");
    add(
      "synopsis",
      synopsis.length > SYNOPSIS_LIMIT &&
        `Sinopsis maksimal ${formatNumber(SYNOPSIS_LIMIT)} karakter.`,
    );
  }
  add("agreed", !form.agreed && "Setujui pernyataan keaslian karya.");
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
  doc: SubmitDoc;
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
