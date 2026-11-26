import type { SupabaseClient } from "@supabase/supabase-js";
import type { SubmissionStatus } from "@/components/ui/status-submission";
import type { StatusChange, Submission, SubmissionVersion } from "../../submission-types";
import { canAdd, type SubmissionStore } from "../submission-store";

type SubmissionRow = {
  id: string;
  slug: string;
  author_id: string;
  title: string;
  genre: string;
  note: string;
  synopsis: string | null;
  package_name: string | null;
  originality_agreed_at: string;
  doc_id: string;
  doc_title: string;
  status: SubmissionStatus;
  status_log: StatusChange[];
  versions: SubmissionVersion[];
  submitted_at: string;
};

function rowToSubmission(row: SubmissionRow): Submission {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    genre: row.genre,
    note: row.note ?? "",
    ...(row.synopsis ? { synopsis: row.synopsis } : {}),
    ...(row.package_name ? { packageName: row.package_name } : {}),
    originalityAgreedAt: Date.parse(row.originality_agreed_at),
    docId: row.doc_id,
    docTitle: row.doc_title ?? "",
    status: row.status,
    statusLog: Array.isArray(row.status_log) ? row.status_log : [],
    versions: Array.isArray(row.versions) ? row.versions : [],
    submittedAt: Date.parse(row.submitted_at),
  };
}

function submissionToRow(s: Submission, authorId?: string) {
  return {
    id: s.id,
    slug: s.slug,
    ...(authorId ? { author_id: authorId } : {}),
    title: s.title,
    genre: s.genre,
    note: s.note,
    synopsis: s.synopsis ?? null,
    package_name: s.packageName ?? null,
    originality_agreed_at: new Date(s.originalityAgreedAt).toISOString(),
    doc_id: s.docId,
    doc_title: s.docTitle,
    status: s.status,
    status_log: s.statusLog,
    versions: s.versions,
    submitted_at: new Date(s.submittedAt).toISOString(),
  };
}

export function createSupabaseSubmissionStore(
  client: SupabaseClient,
  userId: string,
): SubmissionStore {
  async function listAll(): Promise<Submission[]> {
    const { data, error } = await client
      .from("project_submissions")
      .select("*")
      .order("submitted_at", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message, { cause: error });
    return ((data ?? []) as SubmissionRow[]).map(rowToSubmission);
  }

  return {
    list: listAll,

    async add(submission, maxWorks) {
      const existing = await listAll();
      const verdict = canAdd(existing, submission, maxWorks);
      if (verdict !== "ok") return verdict;
      const { error } = await client
        .from("project_submissions")
        .insert(submissionToRow(submission, userId));
      if (error) throw new Error(error.message, { cause: error });
      return "ok";
    },

    async update(id, change) {
      const all = await listAll();
      const current = all.find((s) => s.id === id);
      if (!current) return "missing";
      const next = change(current, all);
      if (!next) return "rejected";
      const { error } = await client
        .from("project_submissions")
        .update(submissionToRow(next))
        .eq("id", id);
      if (error) throw new Error(error.message, { cause: error });
      return "ok";
    },
  };
}

/** Picks Supabase when signed in and the device IndexedDB store otherwise, per call. */
export function createSwitchingSubmissionStore(
  device: () => SubmissionStore,
  account: () => Promise<SubmissionStore | null>,
): SubmissionStore {
  const active = async () => (await account()) ?? device();
  return {
    list: async () => (await active()).list(),
    add: async (submission, maxWorks) => (await active()).add(submission, maxWorks),
    update: async (id, change) => (await active()).update(id, change),
  };
}
