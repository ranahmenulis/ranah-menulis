"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { archived } from "../../documents";
import type { DocumentList } from "../../hooks/use-document-list";
import { formatChanged } from "../../relative-time";
import { Row } from "./document-row";

const number = new Intl.NumberFormat("id-ID");

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
  const archive = archived(list.docs);
  if (archive.length === 0) {
    return (
      <EmptyState
        className="pt-14"
        action={
          <Button variant="secondary" onClick={onShowAll}>
            Lihat semua dokumen
          </Button>
        }
      >
        Arsip kosong.
      </EmptyState>
    );
  }
  const folders = new Map(list.folders.map(({ id, name }) => [id, name]));
  return (
    <ul>
      {archive.map((doc) => {
        const title = doc.title || "Tanpa judul";
        const folder = doc.folderId ? folders.get(doc.folderId) : undefined;
        const time = formatChanged(doc.archivedAt ?? doc.updatedAt, list.loadedAt);
        const meta = [`Diarsipkan ${time}`, `${number.format(doc.wordCount)} kata`, folder];
        return (
          <Row
            key={doc.id}
            kind="document"
            title={title}
            meta={meta.filter(Boolean).join(" · ")}
            menuLabel={`Menu dokumen ${title}`}
            extra={
              <Button
                aria-label={`Pulihkan ${title}`}
                variant="text"
                size="sm"
                disabled={busy}
                onClick={() => onRestore(doc.id)}
              >
                Pulihkan
              </Button>
            }
          />
        );
      })}
    </ul>
  );
}
