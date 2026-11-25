import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { DailyLog } from "../../daily-progress";
import { validateClassification } from "../../document-classification";
import { RETENTION_MS } from "../../versions";
import { writingTime } from "../../writing-time";
import { notifyDocumentListChanged } from "../document-events";
import type { ClassificationResult, DocumentStore, StudioDocument } from "../document-store";
import {
  SUMMARY_COLUMNS,
  documentFromRow,
  folderColumns,
  folderFromRow,
  isUuid,
  logFromJson,
  metaPatch,
  summaryFromRow,
  versionFromRow,
  type DocumentRow,
  type FolderRow,
  type VersionRow,
} from "./row-mapping";
import { needsPreviousText, planRemoteSave } from "./save-plan";

const PAGE = 500;

/** Throws the database error so callers see a failed save as a failure, never as "no data". */
function check<T>(res: { data: T; error: PostgrestError | null }): T {
  if (res.error) throw new Error(res.error.message, { cause: res.error });
  return res.data;
}

/**
 * The document store backed by Supabase. Same contract as the IndexedDB store: writes that must be
 * atomic (save, archive, classification) go through the `studio_*` database functions, which check
 * the owner and the version inside one transaction; plain reads rely on Row Level Security.
 * `timeZone` is the writing zone of the account, read at call time.
 */
export function createSupabaseStore(client: SupabaseClient, timeZone: () => string): DocumentStore {
  const docs = () => client.from("studio_documents");
  const folders = () => client.from("studio_folders");

  async function pages<T>(
    read: (
      from: number,
      to: number,
    ) => PromiseLike<{ data: T[] | null; error: PostgrestError | null }>,
  ) {
    const all: T[] = [];
    for (let from = 0; ; from += PAGE) {
      const rows = check(await read(from, from + PAGE - 1)) ?? [];
      all.push(...rows);
      if (rows.length < PAGE) return all;
    }
  }

  async function fullDocument(id: string): Promise<StudioDocument | null> {
    if (!isUuid(id)) return null;
    const row = check(await docs().select("*").eq("id", id).maybeSingle());
    return row ? documentFromRow(row as DocumentRow) : null;
  }

  async function rpcDocument(name: string, args: Record<string, unknown>) {
    const row = check(await client.rpc(name, args)) as DocumentRow | null;
    return row ? documentFromRow(row) : null;
  }

  return {
    get: fullDocument,

    async save(input, baseVersion, options) {
      const now = Date.now();
      const { day, hour } = writingTime(now, timeZone());
      const [slim, logRow, latestRow] = await Promise.all([
        docs().select("word_count,version").eq("id", input.id).maybeSingle(),
        client.from("studio_daily_log").select("docs").eq("day", day).maybeSingle(),
        client
          .from("studio_versions")
          .select("id,doc_id,saved_at,title,word_count,reason")
          .eq("doc_id", input.id)
          .order("saved_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      const stored = check(slim) as { word_count: number; version: number } | null;
      const matches = stored !== null && stored.version === baseVersion;

      // A save that will be refused as a conflict plans nothing; the function decides.
      let previous: StudioDocument | null = null;
      if (matches) {
        previous = needsPreviousText(stored.word_count, input.wordCount)
          ? await fullDocument(input.id)
          : {
              id: input.id,
              title: "",
              content: { type: "doc" },
              wordCount: stored.word_count,
              version: stored.version,
              updatedAt: 0,
            };
      }
      const latest = check(latestRow) as Omit<VersionRow, "content"> | null;
      const plan =
        matches || stored === null
          ? planRemoteSave({
              previous,
              input,
              todayLog: {
                day,
                docs: (check(logRow) as { docs: DailyLog["docs"] } | null)?.docs ?? {},
              },
              options,
              hour,
              now,
              latest: latest ? versionFromRow({ ...latest, content: { type: "doc" } }) : null,
            })
          : { docWords: null, activity: null, versions: [] };

      const res = check(
        await client.rpc("studio_save_document", {
          p_id: input.id,
          p_title: input.title,
          p_content: input.content,
          p_word_count: input.wordCount,
          p_base_version: baseVersion,
          p_targets: input.targets ?? null,
          p_layout: input.layout ?? null,
          p_folder_id: input.folderId ?? null,
          p_day: day,
          p_doc_words: plan.docWords,
          p_activity: plan.activity,
          p_versions: plan.versions,
        }),
      ) as
        | { ok: true; doc: DocumentRow; progress: Parameters<typeof logFromJson>[0] | null }
        | { ok: false; conflict: DocumentRow };

      if (!res.ok) return { ok: false, conflict: documentFromRow(res.conflict) };
      notifyDocumentListChanged();
      return {
        ok: true,
        doc: documentFromRow(res.doc),
        progress: res.progress ? logFromJson(res.progress) : { day, docs: {} },
      };
    },

    async today() {
      const { day } = writingTime(Date.now(), timeZone());
      const row = check(
        await client
          .from("studio_daily_log")
          .select("day,docs,activity")
          .eq("day", day)
          .maybeSingle(),
      );
      return row ? logFromJson(row) : { day, docs: {} };
    },

    async duplicate(source, title) {
      const copy = await rpcDocument("studio_insert_copy", {
        p_id: crypto.randomUUID(),
        p_title: title,
        p_content: source.content,
        p_word_count: source.wordCount,
        p_folder_id: source.folderId ?? null,
        p_kind: source.kind ?? null,
        p_tags: source.tags ?? null,
        p_synopsis: source.synopsis ?? null,
        p_targets: source.targets ?? null,
        p_layout: source.layout ?? null,
        p_cover: source.cover ?? null,
      });
      notifyDocumentListChanged();
      if (!copy) throw new Error("copy was not created");
      return copy;
    },

    async duplicateActive(id) {
      if (!isUuid(id)) return null;
      const source = check(await docs().select("title").eq("id", id).maybeSingle()) as {
        title: string;
      } | null;
      if (!source) return null;
      const copy = await rpcDocument("studio_duplicate_active", {
        p_source: id,
        p_new_id: crypto.randomUUID(),
        p_title: `${source.title.trim() || "Tanpa judul"} (salinan)`,
      });
      if (copy) notifyDocumentListChanged();
      return copy;
    },

    async setArchived(id, archived) {
      if (!isUuid(id)) return null;
      const doc = await rpcDocument("studio_set_archived", { p_id: id, p_archived: archived });
      if (doc) notifyDocumentListChanged();
      return doc;
    },

    async list() {
      const rows = await pages<DocumentRow>((from, to) =>
        docs().select("*").order("id").range(from, to),
      );
      return rows.map(documentFromRow);
    },

    async listSummaries(signal) {
      const rows = await pages<DocumentRow>((from, to) => {
        signal?.throwIfAborted();
        const query = docs().select(SUMMARY_COLUMNS).order("id").range(from, to);
        return signal ? query.abortSignal(signal) : query;
      });
      return rows.map(summaryFromRow);
    },

    async listFolders() {
      const rows = await pages<FolderRow>((from, to) =>
        folders().select("*").order("id").range(from, to),
      );
      return rows.map(folderFromRow);
    },

    async history() {
      const rows = await pages<Parameters<typeof logFromJson>[0]>((from, to) =>
        client.from("studio_daily_log").select("day,docs,activity").order("day").range(from, to),
      );
      return rows.map(logFromJson);
    },

    async updateMeta(id, patch) {
      if (!isUuid(id)) return null;
      const doc = await rpcDocument("studio_update_meta", { p_id: id, p_patch: metaPatch(patch) });
      if (doc) notifyDocumentListChanged();
      return doc;
    },

    async updateClassification(id, expected, changes): Promise<ClassificationResult> {
      if (!isUuid(id)) return { status: "unavailable" };
      const valid = validateClassification(changes);
      if (!valid) return { status: "invalid" };
      const res = check(
        await client.rpc("studio_update_classification", {
          p_id: id,
          p_expected_kind: expected.kind ?? null,
          p_expected_tags: expected.tags ?? null,
          p_kind: valid.kind ?? null,
          p_tags: valid.tags,
        }),
      ) as { status: "saved" | "conflict" | "unavailable" | "invalid"; doc?: DocumentRow };
      if (res.status === "saved" || res.status === "conflict") {
        if (res.status === "saved") notifyDocumentListChanged();
        return { status: res.status, doc: documentFromRow(res.doc as DocumentRow) };
      }
      return { status: res.status };
    },

    async deletePermanently(id) {
      if (!isUuid(id)) return;
      // The policy only lets a document in Sampah be deleted, so a stale dialog cannot remove a
      // document that was restored elsewhere; its versions go with it.
      const removed = check(await docs().delete().eq("id", id).select("id"));
      if (removed?.length) notifyDocumentListChanged();
    },

    async importHistory(logs) {
      if (logs.length === 0) return;
      check(await client.rpc("studio_import_history", { p_logs: logs }));
    },

    async createFolder(name, init) {
      const row = check(
        await folders()
          .insert(folderColumns({ ...init, name }))
          .select("*")
          .single(),
      );
      notifyDocumentListChanged();
      return folderFromRow(row as FolderRow);
    },

    async renameFolder(id, name) {
      if (!isUuid(id)) return;
      const rows = check(await folders().update({ name }).eq("id", id).select("id"));
      if (rows?.length) notifyDocumentListChanged();
    },

    async updateFolder(id, patch) {
      if (!isUuid(id)) return null;
      const columns = folderColumns(patch);
      const query =
        Object.keys(columns).length === 0
          ? folders().select("*").eq("id", id)
          : folders().update(columns).eq("id", id).select("*");
      const row = check(await query.maybeSingle());
      if (!row) return null;
      if (Object.keys(columns).length > 0) notifyDocumentListChanged();
      return folderFromRow(row as FolderRow);
    },

    async listVersions(docId) {
      if (!isUuid(docId)) return [];
      const since = new Date(Date.now() - RETENTION_MS).toISOString();
      const rows = check(
        await client
          .from("studio_versions")
          .select("*")
          .eq("doc_id", docId)
          .gte("saved_at", since)
          .order("saved_at", { ascending: false }),
      ) as VersionRow[];
      return rows.map(versionFromRow);
    },

    async addVersion(version) {
      check(await client.rpc("studio_add_version", { p_version: version }));
    },
  };
}
