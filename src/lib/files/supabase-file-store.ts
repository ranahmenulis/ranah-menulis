import type { SupabaseClient } from "@supabase/supabase-js";
import type { FileStore, StoredFile } from "./file-store";

const SAFE_FILE_ID = /^[a-zA-Z0-9._-]{1,120}$/;

function assertSafeFileId(id: string): boolean {
  return SAFE_FILE_ID.test(id) && !id.includes("..");
}

/**
 * A `FileStore` backed by a private Supabase Storage bucket, with each user's files kept in a
 * folder named after their id (`<ownerId>/<fileId>`). Downloaded blobs are cached in memory for
 * the session so repeated renders of the same image do not re-fetch it.
 */
export function createSupabaseFileStore(
  client: SupabaseClient,
  bucket: string,
  ownerId: string,
): FileStore {
  const cache = new Map<string, StoredFile>();
  const pathOf = (id: string) => `${ownerId}/${id}`;

  return {
    async put(file) {
      if (!assertSafeFileId(file.id)) throw new Error("Invalid file id");
      const { error } = await client.storage.from(bucket).upload(pathOf(file.id), file.blob, {
        contentType: file.type,
        upsert: true,
      });
      if (error) throw new Error(error.message, { cause: error });
      cache.set(file.id, file);
    },

    async get(id) {
      if (!id || !assertSafeFileId(id)) return null;
      const cached = cache.get(id);
      if (cached) return cached;
      const { data, error } = await client.storage.from(bucket).download(pathOf(id));
      if (error || !data) return null;
      const stored: StoredFile = {
        id,
        name: id,
        type: data.type,
        size: data.size,
        blob: data,
        createdAt: 0,
      };
      cache.set(id, stored);
      return stored;
    },

    async delete(id) {
      if (!id || !assertSafeFileId(id)) return;
      cache.delete(id);
      const { error } = await client.storage.from(bucket).remove([pathOf(id)]);
      if (error) throw new Error(error.message, { cause: error });
    },
  };
}
