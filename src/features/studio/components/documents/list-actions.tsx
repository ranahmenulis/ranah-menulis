"use client";

import { FolderSimplePlus } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";
import type { Pending } from "./pending";

/**
 * New folder and "Naskah baru" for the open level of the Naskah tab (md and up). "Naskah baru" asks
 * for a note or a book (NewWritingDialog), like the write button on a phone.
 */
export function ListActions({
  folderId,
  onPending,
}: {
  folderId: string | null;
  onPending: (pending: Pending) => void;
}) {
  const t = useT().studioDocuments;
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
      <Button size="sm" onClick={() => onPending({ kind: "newWork", collectionId: folderId })}>
        {t.list.newDocument}
      </Button>
    </div>
  );
}
