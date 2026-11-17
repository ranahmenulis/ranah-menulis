import type { JSONContent } from "@tiptap/react";
import type { StudioDocument } from "./storage/document-store";

/**
 * Version history of one document (STD-12, client decision 17 November 2026: kept for 3 days).
 * A version is a full copy of the title and text at a moment. Pure rules; the store persists them.
 *
 * [usulan] A periodic snapshot at most every 10 minutes, a protective snapshot of the text before
 * a large deletion, a snapshot before a restore, and at most 100 versions per document.
 */
export type VersionReason = "berkala" | "pelindung" | "pemulihan";

export type DocumentVersion = {
  /** `<docId>:v<document version>`: the same state saved twice is one version. */
  id: string;
  docId: string;
  /** When this text was saved. */
  savedAt: number;
  title: string;
  content: JSONContent;
  wordCount: number;
  reason: VersionReason;
};

export const SNAPSHOT_INTERVAL_MS = 10 * 60_000;
export const RETENTION_MS = 3 * 24 * 60 * 60_000;
export const MAX_VERSIONS = 100;
/** A save that removes at least this many words and this share of the text is "large". */
export const PROTECT_MIN_WORDS = 100;
export const PROTECT_MIN_SHARE = 0.3;

export const versionId = (docId: string, documentVersion: number) => `${docId}:v${documentVersion}`;

export function versionOf(doc: StudioDocument, reason: VersionReason, savedAt?: number) {
  return {
    id: versionId(doc.id, doc.version),
    docId: doc.id,
    savedAt: savedAt ?? doc.updatedAt,
    title: doc.title,
    content: doc.content,
    wordCount: doc.wordCount,
    reason,
  } satisfies DocumentVersion;
}

const sameState = (a: DocumentVersion, doc: StudioDocument) =>
  a.title === doc.title &&
  a.wordCount === doc.wordCount &&
  JSON.stringify(a.content) === JSON.stringify(doc.content);

/** True for a save that deletes a lot of the text that was there. */
export function isLargeDeletion(previousWords: number, nextWords: number): boolean {
  const removed = previousWords - nextWords;
  return removed >= PROTECT_MIN_WORDS && removed >= previousWords * PROTECT_MIN_SHARE;
}

/**
 * Versions to add after a successful save. `previous` is the document before the save (null for the
 * first save), `saved` the document after it, `existing` the versions already kept for it.
 */
export function planSnapshots(
  previous: StudioDocument | null,
  saved: StudioDocument,
  existing: DocumentVersion[],
  now: number,
): DocumentVersion[] {
  const plan: DocumentVersion[] = [];
  const has = (id: string) => existing.some((v) => v.id === id);

  if (previous && isLargeDeletion(previous.wordCount, saved.wordCount)) {
    const id = versionId(previous.id, previous.version);
    if (!has(id)) plan.push(versionOf(previous, "pelindung"));
  }

  const latest = existing.reduce<DocumentVersion | null>(
    (acc, v) => (!acc || v.savedAt > acc.savedAt ? v : acc),
    null,
  );
  const due = !latest || now - latest.savedAt >= SNAPSHOT_INTERVAL_MS;
  if (due && !(latest && sameState(latest, saved))) plan.push(versionOf(saved, "berkala", now));
  return plan;
}

/** Ids to delete: older than the retention period, then the oldest beyond the cap. */
export function versionsToPrune(versions: DocumentVersion[], now: number): string[] {
  const fresh = versions.filter((v) => now - v.savedAt <= RETENTION_MS);
  const expired = versions.filter((v) => now - v.savedAt > RETENTION_MS).map((v) => v.id);
  const overflow = [...fresh]
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(MAX_VERSIONS)
    .map((v) => v.id);
  return [...expired, ...overflow];
}

/** What the writer sees: newest first, expired versions left out. */
export function visibleVersions(versions: DocumentVersion[], now: number): DocumentVersion[] {
  return versions
    .filter((v) => now - v.savedAt <= RETENTION_MS)
    .sort((a, b) => b.savedAt - a.savedAt);
}

export const REASON_LABEL: Record<VersionReason, string> = {
  berkala: "Otomatis",
  pelindung: "Sebelum banyak teks terhapus",
  pemulihan: "Sebelum pemulihan",
};

/** "+12 kata", "−40 kata" or "sama dengan sekarang", relative to the words in the editor now. */
export function deltaLabel(versionWords: number, currentWords: number): string {
  const diff = versionWords - currentWords;
  if (diff === 0) return "sama dengan sekarang";
  const n = new Intl.NumberFormat("id-ID").format(Math.abs(diff));
  return `${diff > 0 ? "+" : "−"}${n} kata dari sekarang`;
}
