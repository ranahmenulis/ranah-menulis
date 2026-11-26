import type { SupabaseClient } from "@supabase/supabase-js";
import type { PreviewFile, SoloChange, SoloProgress } from "../../types";
import type { SoloStore } from "../solo-store";

type SoloRow = {
  submission_id: string;
  slug: string;
  log: SoloChange[];
  files: PreviewFile[];
};

function rowToSolo(row: SoloRow): SoloProgress {
  return {
    id: row.submission_id,
    slug: row.slug,
    log: Array.isArray(row.log) ? row.log : [],
    files: Array.isArray(row.files) ? row.files : [],
  };
}

export function createSupabaseSoloStore(client: SupabaseClient): SoloStore {
  return {
    async list() {
      const { data, error } = await client.from("solo_progress").select("*").limit(200);
      if (error) throw new Error(error.message, { cause: error });
      return ((data ?? []) as SoloRow[]).map(rowToSolo);
    },

    async add(row) {
      const { error } = await client.from("solo_progress").insert({
        submission_id: row.id,
        slug: row.slug,
        log: row.log,
        files: row.files,
      });
      if (error) {
        if (error.code === "23505") return "duplicate";
        throw new Error(error.message, { cause: error });
      }
      return "ok";
    },

    async update(id, change) {
      const { data, error: readError } = await client
        .from("solo_progress")
        .select("*")
        .eq("submission_id", id)
        .maybeSingle();
      if (readError) throw new Error(readError.message, { cause: readError });
      if (!data) return "missing";
      const next = change(rowToSolo(data as SoloRow));
      if (!next) return "rejected";
      const { error } = await client
        .from("solo_progress")
        .update({ log: next.log, files: next.files })
        .eq("submission_id", id);
      if (error) throw new Error(error.message, { cause: error });
      return "ok";
    },
  };
}

/** Picks Supabase when signed in and the device IndexedDB store otherwise, per call. */
export function createSwitchingSoloStore(
  device: () => SoloStore,
  account: () => Promise<SoloStore | null>,
): SoloStore {
  const active = async () => (await account()) ?? device();
  return {
    list: async () => (await active()).list(),
    add: async (row) => (await active()).add(row),
    update: async (id, change) => (await active()).update(id, change),
  };
}
