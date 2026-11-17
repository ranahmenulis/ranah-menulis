/** A file name from a document title: no characters a file system refuses, never empty. */
export function exportFileName(title: string, extension: "txt" | "pdf"): string {
  const base = title
    .trim()
    .replace(/[\/:*?"<>|\u0000-\u001f]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^\.+|\.+$/g, "")
    .trim()
    .slice(0, 80)
    .trim();
  return `${base || "Tanpa judul"}.${extension}`;
}

/** Hands a file to the browser as a download. Nothing leaves the device. */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  // Revoke later: some browsers start the download after the click returns.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
