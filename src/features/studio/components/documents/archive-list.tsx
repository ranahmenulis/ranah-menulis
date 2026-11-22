"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { archived } from "../../documents";
import type { DocumentList } from "../../hooks/use-document-list";
import { formatChanged } from "../../relative-time";
import { Row } from "./document-row";
import { wordsLabel } from "./document-text";

export function ArchiveList({
  list,
  busy,
  onRestore,
  onShowAll,
}: {
  list: DocumentList;
  busy: boolean;
  onRestore: (id: string) => void;
  onShowAll: () => void;
}) {
  const t = useT().studioDocuments;
  const locale = useLocale();
  const archive = archived(list.docs);
  if (archive.length === 0) {
    return (
      <EmptyState
        className="pt-14"
        action={
          <Button variant="secondary" onClick={onShowAll}>
            {t.archive.showAll}
          </Button>
        }
      >
        {t.archive.empty}
      </EmptyState>
    );
  }
  const folders = new Map(list.folders.map(({ id, name }) => [id, name]));
  return (
    <ul>
      {archive.map((doc, index) => {
        const title = doc.title || t.untitled;
        const folder = doc.folderId ? folders.get(doc.folderId) : undefined;
        const time = formatChanged(doc.archivedAt ?? doc.updatedAt, list.loadedAt, locale);
        const meta = [
          format(t.meta.archived, { time }),
          wordsLabel(t, doc.wordCount, locale),
          folder,
        ];
        return (
          <Row
            key={doc.id}
            index={index}
            kind="document"
            page={doc}
            faded
            title={title}
            meta={meta.filter(Boolean).join(" · ")}
            menuLabel={format(t.menu.documentLabel, { name: title })}
            extra={
              <Button
                aria-label={format(t.archive.restoreLabel, { title })}
                variant="text"
                size="sm"
                disabled={busy}
                onClick={() => onRestore(doc.id)}
              >
                {t.archive.restore}
              </Button>
            }
          />
        );
      })}
    </ul>
  );
}
