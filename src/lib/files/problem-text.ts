import type { Locale } from "@/lib/i18n/config";
import { FILE_MAX_BYTES, IMAGE_INPUT_MAX_BYTES } from "./limits";
import type { UploadKind, UploadProblem } from "./validate-upload";

/** What can go wrong with an upload: the checks, plus the device refusing to keep the file. */
export type FileProblem = UploadProblem | "store";

const mb = (bytes: number) => `${Math.round(bytes / (1024 * 1024))} MB`;

type Text = {
  type: Record<UploadKind, string>;
  size: (max: string) => string;
  empty: string;
  unreadableImage: string;
  unreadableFile: string;
  store: string;
};

const TEXT: Record<Locale, Text> = {
  id: {
    type: {
      image: "Pilih gambar JPG, PNG, atau WebP.",
      manuscript: "Pilih berkas PDF atau DOCX.",
      preview: "Pilih gambar JPG, PNG, WebP, atau berkas PDF.",
    },
    size: (max) => `Berkas terlalu besar. Maksimal ${max}.`,
    empty: "Berkas ini kosong.",
    unreadableImage: "Gambar ini tidak bisa dibaca. Coba gambar lain.",
    unreadableFile: "Berkas ini tidak bisa dibaca. Coba berkas lain.",
    store: "Berkas belum bisa disimpan di perangkat ini. Coba lagi.",
  },
  en: {
    type: {
      image: "Choose a JPG, PNG, or WebP image.",
      manuscript: "Choose a PDF or DOCX file.",
      preview: "Choose a JPG, PNG, or WebP image, or a PDF file.",
    },
    size: (max) => `This file is too large. The limit is ${max}.`,
    empty: "This file is empty.",
    unreadableImage: "This image cannot be read. Try another image.",
    unreadableFile: "This file cannot be read. Try another file.",
    store: "The file could not be saved on this device. Try again.",
  },
};

/**
 * The sentence shown when a picked file is refused, in the interface language. Callers that run
 * outside React keep the `FileProblem` code in their result so the screen can pick the language.
 */
export function problemText(problem: FileProblem, kind: UploadKind, locale: Locale = "id"): string {
  const text = TEXT[locale];
  switch (problem) {
    case "type":
      return text.type[kind];
    case "size":
      return text.size(mb(kind === "image" ? IMAGE_INPUT_MAX_BYTES : FILE_MAX_BYTES));
    case "empty":
      return text.empty;
    case "store":
      return text.store;
    case "unreadable":
      return kind === "image" ? text.unreadableImage : text.unreadableFile;
  }
}
