import type { FileStore, StoredFile } from "./file-store";
import { problemText, type FileProblem } from "./problem-text";
import { validateUpload, type UploadKind } from "./validate-upload";

export type SaveUploadResult =
  | { ok: true; file: Pick<StoredFile, "id" | "name" | "type" | "size"> }
  | { ok: false; message: string; problem: FileProblem };

/**
 * Checks a picked file (real type, size) and keeps it in the file store. The stored type is the one
 * found in the bytes, never the one the browser or the file name claims.
 */
export async function saveUpload(
  file: File,
  kind: UploadKind,
  store: FileStore,
  now = Date.now(),
): Promise<SaveUploadResult> {
  const check = await validateUpload(file, kind);
  if (!check.ok)
    return { ok: false, message: problemText(check.problem, kind), problem: check.problem };
  try {
    const record: StoredFile = {
      id: crypto.randomUUID(),
      name: file.name.trim().slice(0, 120) || "berkas",
      type: check.type,
      size: file.size,
      blob: new Blob([await file.arrayBuffer()], { type: check.type }),
      createdAt: now,
    };
    await store.put(record);
    return {
      ok: true,
      file: { id: record.id, name: record.name, type: record.type, size: record.size },
    };
  } catch {
    return { ok: false, message: problemText("store", kind), problem: "store" };
  }
}

/** The bytes of a stored file, or null when it is gone. */
export async function readStoredBytes(store: FileStore, id: string): Promise<Uint8Array | null> {
  const stored = await store.get(id);
  return stored ? new Uint8Array(await stored.blob.arrayBuffer()) : null;
}
