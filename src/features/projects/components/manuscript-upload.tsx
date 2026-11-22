"use client";

import { FileText, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { fill } from "@/features/studio/copy/fill";
import { useLocale, useT } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import { FilePickButton } from "@/components/ui/file-pick-button";
import { fileKindLabel, formatFileSize } from "@/lib/files/format-size";
import { FILE_MAX_BYTES } from "@/lib/files/limits";
import type { VersionFile } from "../submission-types";

type Props = {
  upload: VersionFile | null;
  uploading: boolean;
  error: string | null;
  onPick: (file: File) => void;
  onClear: () => void;
};

/**
 * Solo only (Q-13): send an uploaded PDF or DOCX instead of a Studio document. The file is only
 * stored; its text is not read, so the word range is not checked and the team reads it as it is.
 */
export function ManuscriptUpload({ upload, uploading, error, onPick, onClear }: Props) {
  const t = useT().projectsFlow.submit.upload;
  const locale = useLocale();
  return (
    <div className="grid gap-3 border-t border-line pt-4">
      <p className="text-sm font-medium">{t.or}</p>
      {upload ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="flex min-w-0 items-center gap-2 text-sm">
            <FileText size={20} aria-hidden className="shrink-0" />
            <span className="min-w-0 wrap-anywhere">{upload.name}</span>
            <span className="shrink-0 text-ink-muted">
              {fileKindLabel(upload.type, locale)} · {formatFileSize(upload.size, locale)}
            </span>
          </p>
          <div className="flex gap-2">
            <FilePickButton kind="manuscript" label={t.replaceLabel} onPick={onPick}>
              {t.replace}
            </FilePickButton>
            <Button variant="text" size="sm" onClick={onClear}>
              {t.remove}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <FilePickButton
            kind="manuscript"
            label={t.uploadLabel}
            onPick={onPick}
            disabled={uploading}
          >
            {uploading ? t.saving : t.button}
          </FilePickButton>
          <p className="text-xs text-ink-muted">
            {fill(t.limit, { mb: String(Math.round(FILE_MAX_BYTES / (1024 * 1024))) })}
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="flex items-start gap-1.5 text-sm text-danger">
          <WarningCircle size={20} className="shrink-0" aria-hidden />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
