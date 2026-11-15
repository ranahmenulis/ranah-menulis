"use client";

import { Button } from "@/components/ui/button";
import type { MenuEntry } from "@/components/ui/menu";
import { EmptyState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { ButtonLink } from "@/components/ui/button";
import { listEntries, trashed } from "../../documents";
import type { DocumentList } from "../../hooks/use-document-list";
import { formatChanged } from "../../relative-time";
import type { StudioDocument } from "../../storage/document-store";
import { Row } from "./document-row";
import type { Pending } from "./pending";

const number = new Intl.NumberFormat("id-ID");
const soon = { hint: "Segera", disabled: true, onSelect: () => {} } as const;
const NO_IDS: ReadonlySet<string> = new Set();

const meta = (doc: StudioDocument, verb: string, at: number, now: number) =>
  `${verb} ${formatChanged(at, now)} · ${number.format(doc.wordCount)} kata`;
const nameOf = (doc: StudioDocument) => doc.title || "Tanpa judul";

type ListProps = {
  list: DocumentList;
  onPending: (pending: Pending) => void;
};

/** Folders and documents of one level (all documents, or the open folder). */
export function LiveList({
  list,
  folderId,
  folderName,
  onOpenFolder,
  onPending,
  sharedIds = NO_IDS,
}: ListProps & {
  /** Documents that have a published post copied from them. */
  sharedIds?: ReadonlySet<string>;
  folderId: string | null;
  folderName: string | null;
  onOpenFolder: (id: string) => void;
}) {
  const toast = useToast();
  const now = list.loadedAt;
  const entries = listEntries(list.docs, list.folders, folderId);

  if (entries.length === 0) {
    return (
      <EmptyState
        className="pt-14"
        action={
          <ButtonLink href="/studio/baru" className="max-md:hidden">
            Mulai menulis
          </ButtonLink>
        }
      >
        {folderName ? "Folder ini masih kosong." : "Belum ada tulisan di sini."}
      </EmptyState>
    );
  }

  const docMenu = (doc: StudioDocument): MenuEntry[] => [
    { id: "rename", label: "Ganti nama", onSelect: () => onPending({ kind: "rename", doc }) },
    { id: "move", label: "Pindah ke folder", onSelect: () => onPending({ kind: "move", doc }) },
    {
      id: "send",
      label: "Kirim ke proyek",
      onSelect: () => onPending({ kind: "sendToProject", doc }),
    },
    { id: "export", label: "Ekspor", ...soon },
    { id: "sep", type: "separator" },
    {
      id: "trash",
      label: "Pindah ke sampah",
      hint: "Bisa dipulihkan",
      onSelect: async () => {
        await list.trash(doc.id);
        toast({
          message: "Dokumen dipindah ke Sampah.",
          action: { label: "Urungkan", onSelect: () => list.restore(doc.id) },
        });
      },
    },
  ];

  return (
    <ul>
      {entries.map((entry) =>
        entry.kind === "folder" ? (
          <Row
            key={entry.folder.id}
            kind="folder"
            title={entry.folder.name}
            onOpen={() => onOpenFolder(entry.folder.id)}
            meta={`${entry.count} dokumen · diubah ${formatChanged(entry.changedAt, now)}`}
            menuLabel={`Menu folder ${entry.folder.name}`}
            items={[
              {
                id: "rename",
                label: "Ganti nama",
                onSelect: () =>
                  onPending({ kind: "renameFolder", id: entry.folder.id, name: entry.folder.name }),
              },
            ]}
          />
        ) : (
          <Row
            key={entry.doc.id}
            kind="document"
            title={nameOf(entry.doc)}
            href={`/studio/${entry.doc.id}`}
            meta={meta(entry.doc, "Diubah", entry.doc.updatedAt, now)}
            tag={sharedIds.has(entry.doc.id) ? "Dibagikan" : undefined}
            menuLabel={`Menu dokumen ${nameOf(entry.doc)}`}
            items={docMenu(entry.doc)}
          />
        ),
      )}
    </ul>
  );
}

/** Sampah: restore with one tap; permanent delete always asks first. */
export function TrashList({ list, onPending }: ListProps) {
  const trash = trashed(list.docs);
  if (trash.length === 0) return <EmptyState className="pt-14">Sampah kosong.</EmptyState>;
  return (
    <>
      <ul>
        {trash.map((doc) => (
          <Row
            key={doc.id}
            kind="document"
            title={nameOf(doc)}
            meta={meta(doc, "Dipindahkan", doc.deletedAt ?? doc.updatedAt, list.loadedAt)}
            menuLabel={`Menu dokumen ${nameOf(doc)}`}
            extra={
              <Button
                variant="text"
                size="sm"
                className="text-ink"
                onClick={() => list.restore(doc.id)}
              >
                Pulihkan
              </Button>
            }
            items={[
              {
                id: "delete",
                label: "Hapus permanen",
                danger: true,
                onSelect: () => onPending({ kind: "delete", doc }),
              },
            ]}
          />
        ))}
      </ul>
      <p className="mt-4 text-xs text-ink-muted">
        Dokumen di Sampah bisa dipulihkan. Hapus permanen ada di menu ⋯ dan selalu meminta
        konfirmasi.
      </p>
    </>
  );
}
