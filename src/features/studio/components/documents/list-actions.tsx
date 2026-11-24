"use client";

import { BookOpen, FolderSimplePlus } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";
import type { Pending } from "./pending";

/** New folder, new book and new document, for the open level of the Dokumen tab (md and up). */
export function ListActions({
  folderId,
  onPending,
}: {
  folderId: string | null;
  onPending: (pending: Pending) => void;
}) {
  const t = useT().studioDocuments;
  const book = useT().studioBook;
  return (
    <div className="flex items-center gap-2 max-md:hidden">
      <Button
        variant="text"
        size="sm"
        className="text-ink"
        onClick={() => onPending({ kind: "newFolder" })}
      >
        <FolderSimplePlus size={16} aria-hidden />
        {t.list.newFolder}
      </Button>
      <Button
        variant="text"
        size="sm"
        className="text-ink"
        onClick={() => onPending({ kind: "newBook", collectionId: folderId })}
      >
        <BookOpen size={16} aria-hidden />
        {book.newBook}
      </Button>
      <Button size="sm" onClick={() => onPending({ kind: "newWork", collectionId: folderId })}>
        {t.list.newDocument}
      </Button>
    </div>
  );
}
