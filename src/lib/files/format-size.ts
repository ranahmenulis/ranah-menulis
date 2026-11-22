import type { Locale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/i18n/format";

/** "840 KB" or "2,3 MB" (Indonesian) / "2.3 MB" (English). */
export function formatFileSize(bytes: number, locale: Locale = "id"): string {
  if (bytes < 1000 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${formatNumber(Math.round((bytes / (1024 * 1024)) * 10) / 10, locale)} MB`;
}

const KIND_LABELS: Record<Locale, { image: string; other: string }> = {
  id: { image: "Gambar", other: "Berkas" },
  en: { image: "Image", other: "File" },
};

/** "PDF", "DOCX", "Gambar" / "Image" or "Berkas" / "File" for the types the file store accepts. */
export function fileKindLabel(type: string, locale: Locale = "id"): string {
  if (type === "application/pdf") return "PDF";
  if (type.startsWith("image/")) return KIND_LABELS[locale].image;
  if (type.includes("wordprocessingml")) return "DOCX";
  return KIND_LABELS[locale].other;
}
