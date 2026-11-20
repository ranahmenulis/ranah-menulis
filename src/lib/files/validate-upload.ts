import { FILE_MAX_BYTES, IMAGE_INPUT_MAX_BYTES } from "./limits";
import { sniffType, type SniffedType } from "./sniff";

/** What a picker accepts: images only, manuscripts (DOCX or PDF), or a preview (image or PDF). */
export type UploadKind = "image" | "manuscript" | "preview";

export type UploadProblem = "type" | "size" | "empty" | "unreadable";

const ALLOWED: Record<UploadKind, readonly SniffedType[]> = {
  image: ["image/jpeg", "image/png", "image/webp"],
  manuscript: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  preview: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
};

/** `accept` attribute of the file input for each kind. */
export const ACCEPT: Record<UploadKind, string> = {
  image: "image/jpeg,image/png,image/webp",
  manuscript: ".pdf,.docx,application/pdf",
  preview: "image/jpeg,image/png,image/webp,application/pdf",
};

export type UploadCheck = { ok: true; type: SniffedType } | { ok: false; problem: UploadProblem };

/** Checks size and real type (first bytes) before anything is stored. */
export async function validateUpload(file: File, kind: UploadKind): Promise<UploadCheck> {
  if (file.size === 0) return { ok: false, problem: "empty" };
  const max = kind === "image" ? IMAGE_INPUT_MAX_BYTES : FILE_MAX_BYTES;
  if (file.size > max) return { ok: false, problem: "size" };
  try {
    // A DOCX needs the whole file to find word/document.xml; the other types need 12 bytes.
    const needsAll = kind !== "image" && /\.docx$/i.test(file.name);
    const buffer = await (needsAll ? file : file.slice(0, 16)).arrayBuffer();
    const type = sniffType(new Uint8Array(buffer));
    if (!type || !ALLOWED[kind].includes(type)) return { ok: false, problem: "type" };
    return { ok: true, type };
  } catch {
    return { ok: false, problem: "unreadable" };
  }
}
