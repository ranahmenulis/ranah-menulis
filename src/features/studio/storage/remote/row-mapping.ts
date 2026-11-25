import type { JSONContent } from "@tiptap/react";
import type { DailyLog } from "../../daily-progress";
import type { DocumentTarget } from "../../document-targets";
import type { DocumentLayout } from "../../document-layout";
import type { DocumentKind } from "../../document-classification";
import type { DocumentVersion, VersionReason } from "../../versions";
import type {
  DocumentMeta,
  DocumentSummary,
  FolderCover,
  FolderPatch,
  StudioDocument,
  StudioFolder,
} from "../document-store";

/** Rows as PostgREST and `to_jsonb(row)` return them: snake_case, timestamps as ISO text. */
export type DocumentRow = {
  id: string;
  folder_id: string | null;
  title: string;
  content?: JSONContent;
  word_count: number;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  archived_at: string | null;
  kind: DocumentKind | null;
  tags: string[] | null;
  synopsis: string | null;
  cover: FolderCover | null;
  targets: DocumentTarget[] | null;
  layout?: DocumentLayout | null;
};

export type FolderRow = {
  id: string;
  name: string;
  kind: "book" | null;
  cover: FolderCover | null;
  chapter_order: string[] | null;
  genre: DocumentKind | null;
  tags: string[] | null;
  synopsis: string | null;
  collection_id: string | null;
  targets: DocumentTarget[] | null;
  created_at: string;
};

export type VersionRow = {
  id: string;
  doc_id: string;
  saved_at: string;
  title: string;
  content: JSONContent;
  word_count: number;
  reason: VersionReason;
};

/** Columns of a document without its body, for lists and search. */
export const SUMMARY_COLUMNS =
  "id,folder_id,title,word_count,version,created_at,updated_at,deleted_at,archived_at,kind,tags,synopsis,cover,targets";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: string) => UUID.test(value);

const ms = (iso: string) => Date.parse(iso);
const msOrNull = (iso: string | null) => (iso === null ? null : Date.parse(iso));

/**
 * Optional fields are absent (not null) in the app, because screens compare them with `===`
 * (`sameClassification`), so a database null becomes `undefined`. The three location fields
 * (`folderId`, `deletedAt`, `archivedAt`) keep their explicit null.
 */
function optionalFields(row: DocumentRow | FolderRow) {
  return {
    ...(row.tags ? { tags: row.tags } : {}),
    ...(row.synopsis ? { synopsis: row.synopsis } : {}),
    ...(row.cover ? { cover: row.cover } : {}),
    ...(row.targets ? { targets: row.targets } : {}),
  };
}

export function summaryFromRow(row: DocumentRow): DocumentSummary {
  return {
    id: row.id,
    title: row.title,
    wordCount: row.word_count,
    version: row.version,
    updatedAt: ms(row.updated_at),
    createdAt: ms(row.created_at),
    folderId: row.folder_id,
    deletedAt: msOrNull(row.deleted_at),
    archivedAt: msOrNull(row.archived_at),
    ...(row.kind ? { kind: row.kind } : {}),
    ...optionalFields(row),
  };
}

export function documentFromRow(row: DocumentRow): StudioDocument {
  return {
    ...summaryFromRow(row),
    content: row.content ?? { type: "doc" },
    ...(row.layout ? { layout: row.layout } : {}),
  };
}

export function folderFromRow(row: FolderRow): StudioFolder {
  return {
    id: row.id,
    name: row.name,
    createdAt: ms(row.created_at),
    ...(row.kind ? { kind: row.kind } : {}),
    ...(row.chapter_order ? { chapterOrder: row.chapter_order } : {}),
    ...(row.genre ? { genre: row.genre } : {}),
    ...(row.collection_id ? { collectionId: row.collection_id } : {}),
    ...optionalFields(row),
  };
}

export function versionFromRow(row: VersionRow): DocumentVersion {
  return {
    id: row.id,
    docId: row.doc_id,
    savedAt: ms(row.saved_at),
    title: row.title,
    content: row.content,
    wordCount: row.word_count,
    reason: row.reason,
  };
}

/** The `studio_update_meta` patch: only the keys the caller set, in the app's own spelling. */
export function metaPatch(patch: DocumentMeta): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(patch)) if (value !== undefined) out[key] = value;
  return out;
}

type FolderColumns = Partial<Omit<FolderRow, "id" | "created_at">>;

/** Folder fields the writer may set, as table columns. `cover: null` clears the cover. */
export function folderColumns(fields: FolderPatch): FolderColumns {
  const out: FolderColumns = {};
  if (fields.name !== undefined) out.name = fields.name;
  if (fields.kind !== undefined) out.kind = fields.kind;
  if (fields.cover !== undefined) out.cover = fields.cover;
  if (fields.chapterOrder !== undefined) out.chapter_order = fields.chapterOrder;
  if (fields.genre !== undefined) out.genre = fields.genre;
  if (fields.tags !== undefined) out.tags = fields.tags;
  if (fields.synopsis !== undefined) out.synopsis = fields.synopsis;
  if (fields.collectionId !== undefined) out.collection_id = fields.collectionId;
  if (fields.targets !== undefined) out.targets = fields.targets;
  return out;
}

/** A folder from this device as an insert row that keeps its id and creation time. */
export function importableFolder(folder: StudioFolder) {
  return {
    id: folder.id,
    created_at: new Date(folder.createdAt).toISOString(),
    ...folderColumns({ ...folder, cover: folder.cover ?? undefined }),
  };
}

/** The server's log JSON (`{day, docs, activity}`) as the app's `DailyLog`. */
export function logFromJson(json: {
  day: string;
  docs: DailyLog["docs"];
  activity?: DailyLog["activity"] | null;
}): DailyLog {
  return {
    day: json.day,
    docs: json.docs ?? {},
    ...(json.activity ? { activity: json.activity } : {}),
  };
}
