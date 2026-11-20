import { FILE_MAX_BYTES, IMAGE_INPUT_MAX_BYTES } from "./limits";
import type { UploadKind, UploadProblem } from "./validate-upload";

const mb = (bytes: number) => `${Math.round(bytes / (1024 * 1024))} MB`;

const TYPE: Record<UploadKind, string> = {
  image: "Pilih gambar JPG, PNG, atau WebP.",
  manuscript: "Pilih berkas PDF atau DOCX.",
  preview: "Pilih gambar JPG, PNG, WebP, atau berkas PDF.",
};

/** The sentence shown when a picked file is refused. Indonesian only (like the rest of Projects). */
export function problemText(problem: UploadProblem, kind: UploadKind): string {
  switch (problem) {
    case "type":
      return TYPE[kind];
    case "size":
      return `Berkas terlalu besar. Maksimal ${mb(kind === "image" ? IMAGE_INPUT_MAX_BYTES : FILE_MAX_BYTES)}.`;
    case "empty":
      return "Berkas ini kosong.";
    case "unreadable":
      return kind === "image"
        ? "Gambar ini tidak bisa dibaca. Coba gambar lain."
        : "Berkas ini tidak bisa dibaca. Coba berkas lain.";
  }
}
