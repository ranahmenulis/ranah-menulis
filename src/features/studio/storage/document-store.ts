import type { JSONContent } from "@tiptap/react";
import type { DocumentLayout } from "../document-layout";
import type { DocumentTarget } from "../document-targets";
import type { DocumentVersion } from "../versions";
import { isActiveDocument } from "../document-archive";
import { applyWordDelta, recordWritingActivity, type DailyLog } from "../daily-progress";
import {
  sameClassification,
  validateClassification,
  type DocumentClassification,
} from "../document-classification";

export type StudioDocument = DocumentClassification & {
  id: string;
  title: string;
  content: JSONContent;
  wordCount: number;
  /** Increases by one on every accepted save. Used to detect two writers (BR-STD-04). */
  version: number;
  updatedAt: number;
  /** When the document was first stored. Absent on documents saved before chapters were ordered. */
  createdAt?: number;
  /** Folder the document is filed in; absent or null means the top level. */
  folderId?: string | null;
  /** Set when moved to Sampah. The document keeps its content and can be restored. */
  deletedAt?: number | null;
  /** Set while outside the active writing list. Absent on documents saved before Archive. */
  archivedAt?: number | null;
  /** Word targets of this document (STK-08). Absent on documents saved before they existed. */
  targets?: DocumentTarget[];
  /** Page layout; absent until the writer changes it, then the defaults apply. */
  layout?: DocumentLayout;
};

/** A book cover picked by the writer: a file in the file store and its description. */
export type FolderCover = { fileId: string; alt: string };

/**
 * A folder. A folder with `kind: "book"` is a manuscript: its documents are chapters, in the order
 * of `chapterOrder`, and it may have a cover. Every extra field is optional, so folders stored
 * before books existed need no migration.
 */
export type StudioFolder = {
  id: string;
  name: string;
  createdAt: number;
  kind?: "book";
  cover?: FolderCover;
  chapterOrder?: string[];
};

export type FolderInit = Partial<Pick<StudioFolder, "kind" | "cover" | "chapterOrder">>;
/** `cover: null` removes the cover. */
export type FolderPatch = Partial<Pick<StudioFolder, "name" | "kind" | "chapterOrder">> & {
  cover?: FolderCover | null;
};

/** Pure folder rule shared by every store. */
export function applyFolderPatch(folder: StudioFolder, patch: FolderPatch): StudioFolder {
  const { cover, ...rest } = patch;
  const next = { ...folder, ...rest };
  if (cover === null) delete next.cover;
  else if (cover) next.cover = cover;
  return next;
}
export type DocumentSummary = Omit<StudioDocument, "content">;

export function summarizeDocument(doc: StudioDocument): DocumentSummary {
  const {
    id,
    title,
    wordCount,
    version,
    updatedAt,
    createdAt,
    folderId,
    deletedAt,
    archivedAt,
    targets,
    kind,
    tags,
  } = doc;
  return {
    id,
    title,
    wordCount,
    version,
    updatedAt,
    createdAt,
    folderId,
    deletedAt,
    archivedAt,
    targets,
    kind,
    tags,
  };
}

/** Fields that change without touching the text: renaming, filing, trashing. */
export type DocumentMeta = Partial<Pick<StudioDocument, "title" | "folderId" | "deletedAt">>;

export type SaveInput = {
  id: string;
  title: string;
  content: JSONContent;
  wordCount: number;
  /** Targets travel with the text, like the title, so setting one never causes a version clash. */
  targets?: DocumentTarget[];
  /** The layout travels the same way; left out while the writer has not changed it. */
  layout?: DocumentLayout;
  /** Only used when the document is created (filed in this folder); ignored on later saves. */
  folderId?: string | null;
};

export type SaveResult =
  { ok: true; doc: StudioDocument; progress: DailyLog } | { ok: false; conflict: StudioDocument };

export type SaveOptions = {
  /** Use the restored word count as the baseline, or null to skip conflict resolution. */
  activityBaseWords?: number | null;
};

export type ClassificationResult =
  { status: "saved" | "conflict"; doc: StudioDocument } | { status: "unavailable" | "invalid" };

/**
 * Where documents live. Today: this device (IndexedDB). The same interface is what the Supabase
 * implementation will satisfy in step 3c, with `version` checked inside the database function.
 */
export interface DocumentStore {
  get(id: string): Promise<StudioDocument | null>;
  /** Fails with a conflict when `baseVersion` is not the stored version. Never overwrites silently. */
  save(input: SaveInput, baseVersion: number, options?: SaveOptions): Promise<SaveResult>;
  today(): Promise<DailyLog>;
  /** Copy a version into a new document (conflict resolution "keep both"). */
  duplicate(source: StudioDocument, title: string): Promise<StudioDocument>;
  /** Read and copy the current active source as a new document, without targets or history. */
  duplicateActive(id: string): Promise<StudioDocument | null>;
  /** Change archive state only if the document is in the expected list. */
  setArchived(id: string, archived: boolean): Promise<StudioDocument | null>;
  /** Every document, including those in Archive and Sampah. */
  list(): Promise<StudioDocument[]>;
  /** Scan metadata without collecting document bodies. */
  listSummaries(signal?: AbortSignal): Promise<DocumentSummary[]>;
  listFolders(): Promise<StudioFolder[]>;
  /** Daily writing records, oldest first. Streak and statistics are derived from these logs. */
  history(): Promise<DailyLog[]>;
  /** Rename, move, trash, or restore. Counts as a change: the version increases. */
  updateMeta(id: string, patch: DocumentMeta): Promise<StudioDocument | null>;
  /** Change only classification if it still matches the dialog's starting values. */
  updateClassification(
    id: string,
    expected: DocumentClassification,
    changes: DocumentClassification,
  ): Promise<ClassificationResult>;
  deletePermanently(id: string): Promise<void>;
  /** Bulk-load daily logs (sample data in development, later the offline queue). */
  importHistory(logs: DailyLog[]): Promise<void>;
  createFolder(name: string, init?: FolderInit): Promise<StudioFolder>;
  renameFolder(id: string, name: string): Promise<void>;
  /** Change a folder's book settings; null when the folder is gone. */
  updateFolder(id: string, patch: FolderPatch): Promise<StudioFolder | null>;
  /** Kept versions of one document, newest first. Versions older than 3 days are not returned. */
  listVersions(docId: string): Promise<DocumentVersion[]>;
  /** Keeps one more version (a restore keeps the current text first). Idempotent per id. */
  addVersion(version: DocumentVersion): Promise<void>;
}

/** Pure meta rule shared by every store. */
export function applyMeta(doc: StudioDocument, patch: DocumentMeta, now: number): StudioDocument {
  return { ...doc, ...patch, version: doc.version + 1, updatedAt: now };
}

export function applyClassification(
  doc: StudioDocument | null,
  expected: DocumentClassification,
  changes: DocumentClassification,
): ClassificationResult {
  if (!doc || !isActiveDocument(doc)) return { status: "unavailable" };
  if (!sameClassification(doc, expected)) return { status: "conflict", doc };
  const classification = validateClassification(changes);
  if (!classification) return { status: "invalid" };
  // The editor's version and modification time describe writing, not classification.
  return { status: "saved", doc: { ...doc, ...classification } };
}

/** Pure save rule shared by every store; the storage adapter only has to make it atomic. */
export function commitSave(
  existing: StudioDocument | null,
  input: SaveInput,
  baseVersion: number,
  log: DailyLog,
  now: number,
  activity?: SaveOptions & { hour: number },
): SaveResult {
  if (existing && existing.version !== baseVersion) return { ok: false, conflict: existing };

  const { folderId, ...fields } = input;
  const doc: StudioDocument = {
    ...existing, // preserves folder, classification, and archive/trash state across saves
    ...fields,
    ...(!existing && folderId ? { folderId } : {}),
    ...(!existing ? { createdAt: now } : {}),
    version: (existing?.version ?? 0) + 1,
    updatedAt: now,
  };
  const previousWords = existing?.wordCount ?? 0;
  const progress = applyWordDelta(log, input, previousWords, input.wordCount);
  const baseline = activity?.activityBaseWords;
  const measured =
    activity && baseline !== null && baseline !== input.wordCount
      ? recordWritingActivity(
          progress,
          input.wordCount - (baseline ?? previousWords),
          activity.hour,
        )
      : progress;
  return { ok: true, doc, progress: measured };
}
