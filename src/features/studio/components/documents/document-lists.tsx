"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { trashed } from "../../documents";
import type { DocumentList } from "../../hooks/use-document-list";
import { Row } from "./document-row";
import { documentMeta } from "./document-text";
import type { Pending } from "./pending";

/** Sampah: restore with one tap; permanent delete always asks first. */
export function TrashList({
  list,
  onPending,
}: {
  list: DocumentList;
  onPending: (pending: Pending) => void;
}) {
  const t = useT().studioDocuments;
  const locale = useLocale();
  const trash = trashed(list.docs);
  if (trash.length === 0) return <EmptyState className="pt-14">{t.trash.empty}</EmptyState>;
  const nameOf = (title: string) => title || t.untitled;
  return (
    <>
      <ul>
        {trash.map((doc, index) => (
          <Row
            key={doc.id}
            index={index}
            kind="document"
            page={doc}
            faded
            title={nameOf(doc.title)}
            meta={documentMeta(
              t,
              locale,
              "trashed",
              doc.wordCount,
              doc.deletedAt ?? doc.updatedAt,
              list.loadedAt,
            )}
            menuLabel={format(t.menu.documentLabel, { name: nameOf(doc.title) })}
            extra={
              <Button
                variant="text"
                size="sm"
                className="text-ink"
                onClick={() => list.restore(doc.id)}
              >
                {t.trash.restore}
              </Button>
            }
            items={[
              {
                id: "delete",
                label: t.trash.deleteForever,
                danger: true,
                onSelect: () => onPending({ kind: "delete", doc }),
              },
            ]}
          />
        ))}
      </ul>
      <p className="mt-4 text-xs text-ink-muted">{t.trash.note}</p>
    </>
  );
}
