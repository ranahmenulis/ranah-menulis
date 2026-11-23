import { compressImage } from "@/lib/files/compress-image";
import type { FileStore, StoredFile } from "@/lib/files/file-store";
import { problemText, type FileProblem } from "@/lib/files/problem-text";
import { validateUpload } from "@/lib/files/validate-upload";

export type StoreImageResult =
  { ok: true; id: string } | { ok: false; message: string; problem: FileProblem };

/**
 * Checks a picked image (real type, size), shrinks it to WebP (this also drops the camera's
 * location data), and keeps it in the file store. Returns the new file's id for the project.
 */
export async function storeImage(
  file: File,
  store: FileStore,
  now = Date.now(),
): Promise<StoreImageResult> {
  const check = await validateUpload(file, "image");
  if (!check.ok) {
    return { ok: false, message: problemText(check.problem, "image"), problem: check.problem };
  }
  try {
    const { blob } = await compressImage(file);
    const record: StoredFile = {
      id: crypto.randomUUID(),
      name: file.name.trim().slice(0, 120) || "image",
      type: blob.type,
      size: blob.size,
      blob,
      createdAt: now,
    };
    await store.put(record);
    return { ok: true, id: record.id };
  } catch {
    return { ok: false, message: problemText("unreadable", "image"), problem: "unreadable" };
  }
}

/** Frees a poster file nothing points to any more. A failure only leaves the file behind. */
export async function discardImage(id: string, store: FileStore): Promise<void> {
  if (!id) return;
  try {
    await store.delete(id);
  } catch {
    // Not worth interrupting the Organizer for a leftover image.
  }
}
