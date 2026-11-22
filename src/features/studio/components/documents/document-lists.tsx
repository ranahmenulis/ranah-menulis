"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { ButtonLink } from "@/components/ui/button";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { listEntries, NO_DOCUMENT_FILTERS, trashed } from "../../documents";
import { hasDocumentFilters, type DocumentFilters } from "../../document-classification";
import type { DocumentList } from "../../hooks/use-document-list";
import { targetSummary } from "../../document-targets";
import { useAccount } from "@/features/account/account-store";
import { writingTime } from "../../writing-time";
import type { DocumentSummary } from "../../storage/document-store";
import { Row } from "./document-row";
import { documentMenu } from "./document-menu";
import { documentMeta, folderMeta, type DocumentCopy } from "./document-text";
import type { Pending } from "./pending";

const NO_IDS: ReadonlySet<string> = new Set();

const nameOf = (doc: DocumentSummary, t: DocumentCopy) => doc.title || t.untitled;

function ClassificationDetails({ doc, folder }: { doc: DocumentSummary; folder?: string }) {
  const t = useT().studioDocuments;
  if (!doc.kind && !doc.tags?.length && !folder) return null;
  return (
    <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs [overflow-wrap:anywhere] text-ink-muted">
      {folder && <span>{format(t.meta.folderPrefix, { name: folder })}</span>}
      {doc.kind && <span>{t.kinds[doc.kind]}</span>}
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
  searchMatches = null,
  onClearFilters,
  onClearSearch,
}: ListProps & {
  /** Documents that have a published post copied from them. */
  sharedIds?: ReadonlySet<string>;
  /** Documents sent to a project. */
  submittedIds?: ReadonlySet<string>;
  folderId: string | null;
  folderName: string | null;
  onOpenFolder: (id: string) => void;
  filters?: DocumentFilters;
  searchMatches?: ReadonlySet<string> | null;
  onClearFilters?: () => void;
  onClearSearch?: () => void;
  onArchiveAction: (action: "archive" | "duplicate", id: string) => void;
  archiveBusy?: boolean;
}) {
  const toast = useToast();
  const t = useT().studioDocuments;
  const locale = useLocale();
  const now = list.loadedAt;
  const { timeZone } = useAccount().profile;
  const today = now > 0 ? writingTime(now, timeZone).day : "";
  const entries = listEntries(list.docs, list.folders, folderId, filters, searchMatches);
  const filtering = hasDocumentFilters(filters) || searchMatches !== null;
  const folderNames =
    filtering && folderId === null ? new Map(list.folders.map(({ id, name }) => [id, name])) : null;
  /** Nearest open document target for the meta line; nothing before the list has loaded. */
  const targetPart = (doc: DocumentSummary) => {
    const line = today ? targetSummary(doc.targets, doc.wordCount, today, locale) : null;
    return line ? ` · ${line}` : "";
  };

  if (entries.length === 0) {
    if (searchMatches !== null) {
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
          <ButtonLink href="/studio/baru" variant="secondary" className="max-md:hidden">
            {t.empty.start}
          </ButtonLink>
        }
      >
        {folderName ? t.empty.folderEmpty : t.empty.none}
      </EmptyState>
    );
  }

  return (
    <ul>
      {entries.map((entry, index) =>
        entry.kind === "folder" ? (
          <Row
            key={entry.folder.id}
            index={index}
            kind="folder"
            title={entry.folder.name}
            onOpen={() => onOpenFolder(entry.folder.id)}
            meta={folderMeta(t, locale, entry.count, entry.changedAt, now)}
            menuLabel={format(t.menu.folderLabel, { name: entry.folder.name })}
            items={[
              {
                id: "rename",
                label: t.menu.rename,
                onSelect: () =>
                  onPending({ kind: "renameFolder", id: entry.folder.id, name: entry.folder.name }),
              },
            ]}
          />
        ) : (
          <Row
            key={entry.doc.id}
            index={index}
            kind="document"
            page={entry.doc}
            title={nameOf(entry.doc, t)}
            href={`/studio/${entry.doc.id}`}
            meta={
              documentMeta(t, locale, "changed", entry.doc.wordCount, entry.doc.updatedAt, now) +
              targetPart(entry.doc)
            }
            details={
              <ClassificationDetails
                doc={entry.doc}
                folder={folderNames?.get(entry.doc.folderId ?? "")}
              />
            }
            tags={[
              ...(sharedIds.has(entry.doc.id) ? [t.rowTags.shared] : []),
              ...(submittedIds.has(entry.doc.id) ? [t.rowTags.sent] : []),
            ]}
            menuLabel={format(t.menu.documentLabel, { name: nameOf(entry.doc, t) })}
            items={documentMenu({
              doc: entry.doc,
              t,
              list,
              toast,
              archiveBusy,
              onPending,
              onArchiveAction,
            })}
          />
        ),
      )}
    </ul>
  );
}

/** Sampah: restore with one tap; permanent delete always asks first. */
export function TrashList({ list, onPending }: ListProps) {
  const t = useT().studioDocuments;
  const locale = useLocale();
  const trash = trashed(list.docs);
  if (trash.length === 0) return <EmptyState className="pt-14">{t.trash.empty}</EmptyState>;
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
            title={nameOf(doc, t)}
            meta={documentMeta(
              t,
              locale,
              "trashed",
              doc.wordCount,
              doc.deletedAt ?? doc.updatedAt,
              list.loadedAt,
            )}
            menuLabel={format(t.menu.documentLabel, { name: nameOf(doc, t) })}
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
