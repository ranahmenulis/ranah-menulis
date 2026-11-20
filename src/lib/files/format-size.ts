/** "840 KB" or "2,3 MB" (Indonesian decimal comma). */
export function formatFileSize(bytes: number): string {
  if (bytes < 1000 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(Math.round((bytes / (1024 * 1024)) * 10) / 10).toLocaleString("id-ID")} MB`;
}

/** "PDF", "DOCX" or "Gambar" for the types the file store accepts. */
export function fileKindLabel(type: string): string {
  if (type === "application/pdf") return "PDF";
  if (type.startsWith("image/")) return "Gambar";
  if (type.includes("wordprocessingml")) return "DOCX";
  return "Berkas";
}
