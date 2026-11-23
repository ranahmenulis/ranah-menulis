"use client";

import { BookOpen, FolderSimplePlus } from "@phosphor-icons/react/dist/ssr";
import { Button, ButtonLink } from "@/components/ui/button";
import { newDocumentHref } from "@/features/app-shell/nav";
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
        onClick={() => onPending({ kind: "newBook" })}
      >
        <BookOpen size={16} aria-hidden />
        {book.newBook}
      </Button>
      <ButtonLink href={newDocumentHref(folderId)} size="sm">
        {t.list.newDocument}
      </ButtonLink>
    </div>
  );
}
