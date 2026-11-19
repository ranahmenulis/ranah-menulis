"use client";

import { Button } from "@/components/ui/button";
import type { MenuEntry } from "@/components/ui/menu";
import { EmptyState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { ButtonLink } from "@/components/ui/button";
import { listEntries, NO_DOCUMENT_FILTERS, trashed } from "../../documents";
import {
  DOCUMENT_KINDS,
  hasDocumentFilters,
  type DocumentFilters,
} from "../../document-classification";
import type { DocumentList } from "../../hooks/use-document-list";
import { formatChanged } from "../../relative-time";
import { targetSummary } from "../../document-targets";
import { dayKey } from "../../daily-progress";
import type { StudioDocument } from "../../storage/document-store";
import { Row } from "./document-row";
import type { Pending } from "./pending";

const number = new Intl.NumberFormat("id-ID");
const soon = { hint: "Segera", disabled: true, onSelect: () => {} } as const;
const NO_IDS: ReadonlySet<string> = new Set();

const meta = (doc: StudioDocument, verb: string, at: number, now: number) =>
  `${verb} ${formatChanged(at, now)} · ${number.format(doc.wordCount)} kata`;
/** Nearest open document target for the meta line; nothing before the list has loaded. */
const targetPart = (doc: StudioDocument, loadedAt: number) => {
  const line =
    loadedAt > 0 ? targetSummary(doc.targets, doc.wordCount, dayKey(new Date(loadedAt))) : null;
  return line ? ` · ${line}` : "";
};
const nameOf = (doc: StudioDocument) => doc.title || "Tanpa judul";

function ClassificationDetails({ doc, folder }: { doc: StudioDocument; folder?: string }) {
  if (!doc.kind && !doc.tags?.length && !folder) return null;
  return (
    <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs [overflow-wrap:anywhere] text-ink-muted">
      {folder && <span>Folder: {folder}</span>}
      {doc.kind && <span>{DOCUMENT_KINDS[doc.kind]}</span>}
      {doc.tags?.map((tag) => (
        <span key={tag} className="max-w-full rounded-full bg-subtle px-2 py-px">
          {tag}
        </span>
      ))}
    </p>
  );
}

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
  onArchiveAction,
  archiveBusy = false,
  sharedIds = NO_IDS,
  submittedIds = NO_IDS,
  filters = NO_DOCUMENT_FILTERS,
  onClearFilters,
}: ListProps & {
  /** Documents that have a published post copied from them. */
  sharedIds?: ReadonlySet<string>;
  /** Documents sent to a project. */
  submittedIds?: ReadonlySet<string>;
  folderId: string | null;
  folderName: string | null;
  onOpenFolder: (id: string) => void;
  filters?: DocumentFilters;
  onClearFilters?: () => void;
  onArchiveAction: (action: "archive" | "duplicate", id: string) => void;
  archiveBusy?: boolean;
}) {
  const toast = useToast();
  const now = list.loadedAt;
  const entries = listEntries(list.docs, list.folders, folderId, filters);
  const filtering = hasDocumentFilters(filters);
  const folderNames =
    filtering && folderId === null ? new Map(list.folders.map(({ id, name }) => [id, name])) : null;

  if (entries.length === 0) {
    if (filtering) {
      return (
        <EmptyState
          className="pt-14"
          action={
            <Button variant="secondary" onClick={onClearFilters}>
              Hapus penyaring
            </Button>
          }
        >
          Tidak ada dokumen yang cocok.
        </EmptyState>
      );
    }
    return (
      <EmptyState
        className="pt-14"
        action={
          <ButtonLink href="/studio/baru" variant="secondary" className="max-md:hidden">
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
    {
      id: "classification",
      label: "Jenis dan tag",
      onSelect: () => onPending({ kind: "classification", doc }),
    },
    { id: "move", label: "Pindah ke folder", onSelect: () => onPending({ kind: "move", doc }) },
    {
      id: "duplicate",
      label: "Duplikat",
      disabled: archiveBusy,
      onSelect: () => onArchiveAction("duplicate", doc.id),
    },
    {
      id: "send",
      label: "Kirim ke proyek",
      // Nothing to send while the document has no text, like Bagikan in the editor.
      disabled: doc.wordCount === 0,
      onSelect: () => onPending({ kind: "sendToProject", doc }),
    },
    { id: "export", label: "Ekspor", ...soon },
    {
      id: "archive",
      label: "Arsipkan",
      disabled: archiveBusy,
      onSelect: () => onArchiveAction("archive", doc.id),
    },
    { id: "sep", type: "separator" },
    {
      id: "trash",
      label: "Pindah ke sampah",
      hint: "Bisa dipulihkan",
      onSelect: async () => {
        try {
          if (!(await list.trash(doc.id))) {
            toast({ message: "Status dokumen sudah berubah.", tone: "error" });
            return;
          }
          toast({
            message: "Dokumen dipindah ke Sampah.",
            action: { label: "Urungkan", onSelect: () => list.restore(doc.id) },
          });
        } catch {
          toast({ message: "Dokumen belum bisa dipindah. Coba lagi.", tone: "error" });
        }
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
            meta={meta(entry.doc, "Diubah", entry.doc.updatedAt, now) + targetPart(entry.doc, now)}
            details={
              <ClassificationDetails
                doc={entry.doc}
                folder={folderNames?.get(entry.doc.folderId ?? "")}
              />
            }
            tags={[
              ...(sharedIds.has(entry.doc.id) ? ["Dibagikan"] : []),
              ...(submittedIds.has(entry.doc.id) ? ["Dikirim ke proyek"] : []),
            ]}
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
