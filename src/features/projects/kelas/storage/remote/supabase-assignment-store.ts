import type { SupabaseClient } from "@supabase/supabase-js";
import type { SubmissionVersion } from "../../../submission-types";
import type {
  AssignmentChange,
  AssignmentSource,
  AssignmentStatus,
  AssignmentSubmission,
} from "../../types";
import { canAdd, type AssignmentStore } from "../assignment-store";

type AssignmentRow = {
  id: string;
  slug: string;
  assignment_id: string;
  user_id: string;
  source: AssignmentSource;
  doc_id: string | null;
  doc_title: string;
  status: AssignmentStatus;
  late: boolean;
  submitted_at: string;
  versions: SubmissionVersion[];
  status_log: AssignmentChange[];
};

function rowToAssignment(row: AssignmentRow): AssignmentSubmission {
  return {
    id: row.id,
    slug: row.slug,
    assignmentId: row.assignment_id,
    source: row.source,
    docId: row.doc_id,
    docTitle: row.doc_title ?? "",
    status: row.status,
    late: Boolean(row.late),
    submittedAt: Date.parse(row.submitted_at),
    versions: Array.isArray(row.versions) ? row.versions : [],
    statusLog: Array.isArray(row.status_log) ? row.status_log : [],
  };
}

function assignmentToRow(a: AssignmentSubmission, userId?: string) {
  return {
    id: a.id,
    slug: a.slug,
    assignment_id: a.assignmentId,
    ...(userId ? { user_id: userId } : {}),
    source: a.source,
    doc_id: a.docId,
    doc_title: a.docTitle,
    status: a.status,
    late: a.late,
    submitted_at: new Date(a.submittedAt).toISOString(),
    versions: a.versions,
    status_log: a.statusLog,
  };
}

export function createSupabaseAssignmentStore(
  client: SupabaseClient,
  userId: string,
): AssignmentStore {
  async function listAll(): Promise<AssignmentSubmission[]> {
    const { data, error } = await client
      .from("class_assignments")
      .select("*")
      .order("submitted_at", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message, { cause: error });
    return ((data ?? []) as AssignmentRow[]).map(rowToAssignment);
  }

  return {
    list: listAll,

    async add(submission) {
      const existing = await listAll();
      const verdict = canAdd(existing, submission);
      if (verdict !== "ok") return verdict;
      const { error } = await client
        .from("class_assignments")
        .insert(assignmentToRow(submission, userId));
      if (error) {
        if (error.code === "23505") return "duplicate";
        throw new Error(error.message, { cause: error });
      }
      return "ok";
    },

    async update(id, change) {
      const { data, error: readError } = await client
        .from("class_assignments")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (readError) throw new Error(readError.message, { cause: readError });
      if (!data) return "missing";
      const next = change(rowToAssignment(data as AssignmentRow));
      if (!next) return "rejected";
      const { error } = await client
        .from("class_assignments")
        .update(assignmentToRow(next))
        .eq("id", id);
      if (error) throw new Error(error.message, { cause: error });
      return "ok";
    },
  };
}

/** Picks Supabase when signed in and the device IndexedDB store otherwise, per call. */
export function createSwitchingAssignmentStore(
  device: () => AssignmentStore,
  account: () => Promise<AssignmentStore | null>,
): AssignmentStore {
  const active = async () => (await account()) ?? device();
  return {
    list: async () => (await active()).list(),
    add: async (submission) => (await active()).add(submission),
    update: async (id, change) => (await active()).update(id, change),
  };
}
