"use client";

import type { RefObject } from "react";
import { useT } from "@/lib/i18n/provider";
import { BookHeader } from "../book/book-header";
import type { DocumentSummary, StudioFolder } from "../../storage/document-store";

/** "All documents / Folder": the way back out of an open folder, and its name (focus lands here). */
export function FolderHead({
  folder,
  docs,
  showBook,
  headingRef,
  onBack,
  onSettings,
}: {
  folder: StudioFolder;
  docs: DocumentSummary[];
  /** The book's cover and size wait until the list has loaded. */
  showBook: boolean;
  headingRef: RefObject<HTMLSpanElement | null>;
  onBack: () => void;
  onSettings: () => void;
}) {
  const t = useT().studioDocuments;
  return (
    <>
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
      {showBook && <BookHeader folder={folder} docs={docs} onSettings={onSettings} />}
    </>
  );
}
