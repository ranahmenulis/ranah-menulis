"use client";

import { FileText } from "@phosphor-icons/react/dist/ssr";
import { useLocale, useT } from "@/lib/i18n/provider";
import { DownloadFileButton } from "@/components/ui/download-file-button";
import { fileKindLabel, formatFileSize } from "@/lib/files/format-size";
import type { FileStore } from "@/lib/files/file-store";
import type { VersionFile } from "../submission-types";

/**
 * An uploaded manuscript where a frozen document would be shown. The team reads it by downloading;
 * the platform does not open or index PDF and DOCX text.
 */
export function FileVersion({ file, store }: { file: VersionFile; store?: FileStore }) {
  const t = useT().projectsFlow.submit.fileVersion;
  const locale = useLocale();
  return (
    <div className="grid gap-3 border border-line p-4">
      <p className="flex min-w-0 items-start gap-2 text-sm">
        <FileText size={20} aria-hidden className="mt-0.5 shrink-0" />
        <span className="min-w-0 wrap-anywhere">
          <b className="font-medium">{file.name}</b>
          <span className="text-ink-muted">
            {" "}
            · {fileKindLabel(file.type, locale)} · {formatFileSize(file.size, locale)}
          </span>
        </span>
      </p>
      <p className="text-xs text-ink-muted">{t.note}</p>
      <div>
        <DownloadFileButton fileId={file.fileId} name={file.name} store={store} />
      </div>
    </div>
  );
}
