import type { SubmitForm } from "./submission-model";

const KEY = "ranah.submissionDrafts";

/** What is kept of an unsent form: the fields, never the statement of originality. */
export type SubmitDraft = Omit<SubmitForm, "agreed">;

type DraftMap = Record<string, SubmitDraft>;

const TEXT_FIELDS = ["title", "genre", "note", "synopsis"] as const;

function isDraft(value: unknown): value is SubmitDraft {
  if (typeof value !== "object" || value === null) return false;
  const d = value as Record<string, unknown>;
  return (
    (d.docId === null || typeof d.docId === "string") &&
    TEXT_FIELDS.every((k) => typeof d[k] === "string")
  );
}

function readAll(): DraftMap {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, v]) => isDraft(v))) as DraftMap;
  } catch {
    return {};
  }
}

function writeAll(map: DraftMap) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // A draft is a convenience: when the device refuses, the form still works.
  }
}

/** The unsent form of a project (PRD 10.5: status Draf), or `null` when there is none. */
export function loadDraft(slug: string): SubmitDraft | null {
  return readAll()[slug] ?? null;
}

const isBlank = (form: SubmitDraft) =>
  form.docId === null && TEXT_FIELDS.every((key) => form[key].trim() === "");

/** Keeps the form as it is typed. A form with nothing in it removes the draft instead. */
export function saveDraft(slug: string, form: SubmitForm) {
  // Picked field by field so the statement of originality can never end up in a draft.
  const draft: SubmitDraft = {
    docId: form.docId,
    title: form.title,
    genre: form.genre,
    note: form.note,
    synopsis: form.synopsis,
  };
  const map = readAll();
  if (isBlank(draft)) delete map[slug];
  else map[slug] = draft;
  writeAll(map);
}

/** Called once the work is sent: the draft has become a submission. */
export function clearDraft(slug: string) {
  const map = readAll();
  if (!(slug in map)) return;
  delete map[slug];
  writeAll(map);
}
