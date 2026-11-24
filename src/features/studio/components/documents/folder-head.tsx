"use client";

import type { RefObject } from "react";
import { useT } from "@/lib/i18n/provider";
import type { StudioFolder } from "../../storage/document-store";

/** "All works / Folder": the way back out of an open folder, and its name (focus lands here). */
export function FolderHead({
  folder,
  headingRef,
  onBack,
}: {
  folder: StudioFolder;
  headingRef: RefObject<HTMLSpanElement | null>;
  onBack: () => void;
}) {
  const t = useT().studioDocuments;
  return (
    <p className="mt-4 text-sm [overflow-wrap:anywhere]">
      <button
        type="button"
        className="cursor-pointer text-ink-muted hover:text-ink"
        onClick={onBack}
      >
        {t.list.allDocuments}
      </button>
      <span className="text-ink-muted"> / </span>
      <span ref={headingRef} tabIndex={-1} className="font-medium">
        {folder.name}
      </span>
    </p>
  );
}
