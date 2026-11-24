"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { newDocumentHref } from "@/features/app-shell/nav";
import { useT } from "@/lib/i18n/provider";

/** What the open level of the Dokumen tab says when it has nothing to list. */
export function ListEmpty({
  folderId,
  folderName,
  searching,
  filtering,
  onClearSearch,
  onClearFilters,
}: {
  folderId: string | null;
  folderName: string | null;
  searching: boolean;
  filtering: boolean;
  onClearSearch?: () => void;
  onClearFilters?: () => void;
}) {
  const t = useT().studioDocuments;
  if (searching) {
    return (
      <EmptyState
        className="pt-14"
        action={
          <Button variant="secondary" onClick={onClearSearch}>
            {t.empty.clearSearch}
          </Button>
        }
      >
        <span role="status">{t.empty.noSearchMatch}</span>
      </EmptyState>
    );
  }
  if (filtering) {
    return (
      <EmptyState
        className="pt-14"
        action={
          <Button variant="secondary" onClick={onClearFilters}>
            {t.empty.clearFilters}
          </Button>
        }
      >
        {t.empty.noFilterMatch}
      </EmptyState>
    );
  }
  return (
    <EmptyState
      className="pt-14"
      art={folderName ? undefined : "womanWriting"}
      layout="side"
      action={
        <ButtonLink href={newDocumentHref(folderId)} variant="secondary" className="max-md:hidden">
          {t.empty.start}
        </ButtonLink>
      }
    >
      {folderName ? t.empty.folderEmpty : t.empty.none}
    </EmptyState>
  );
}
