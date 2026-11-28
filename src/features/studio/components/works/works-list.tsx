"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { useAccount } from "@/features/account/account-store";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
import { hasDocumentFilters, type DocumentFilters } from "../../document-classification";
import { targetSummary } from "../../document-targets";
import type { DocumentList } from "../../hooks/use-document-list";
import { formatChanged } from "../../relative-time";
import type { DocumentSummary } from "../../storage/document-store";
import { writingTime } from "../../writing-time";
import {
  DEFAULT_WORK_SORT,
  buildWorks,
  chapterHref,
  collectionsOf,
  listWorks,
  nextSort,
  workHref,
  type Work,
} from "../../works";
import { FolderCover } from "../book/folder-cover";
import { FolderSimple } from "@phosphor-icons/react/dist/ssr";
import { DocumentMark } from "../documents/document-mark";
import { documentMenu } from "../documents/document-menu";
import { documentMeta } from "../documents/document-text";
import { folderMenu } from "../documents/folder-menu";
import { ListEmpty } from "../documents/list-empty";
import type { Pending } from "../documents/pending";
import { WorksTable, type TableRow } from "./works-table";

const NO_IDS: ReadonlySet<string> = new Set();
const NO_FILTERS: DocumentFilters = { kind: null, tag: null };

type Props = {
  list: DocumentList;
  /** The open plain folder, or null at the top level. */
  folderId: string | null;
  folderName: string | null;
  onOpenFolder: (id: string) => void;
  onPending: (pending: Pending) => void;
  onArchiveAction: (action: "archive" | "duplicate", id: string) => void;
  archiveBusy?: boolean;
  /** Documents that have a published post copied from them. */
  sharedIds?: ReadonlySet<string>;
  /** Documents sent to a project. */
  submittedIds?: ReadonlySet<string>;
  filters?: DocumentFilters;
  /** Ids of the works a search matched (see `workMatches`); null while not searching. */
  searchMatches?: ReadonlySet<string> | null;
  onClearFilters?: () => void;
  onClearSearch?: () => void;
};

/** The Naskah table of one level: the open folder's works, or folders and works at the top. */
export function WorksList({
  list,
  folderId,
  folderName,
  onOpenFolder,
  onPending,
  onArchiveAction,
  archiveBusy = false,
  sharedIds = NO_IDS,
  submittedIds = NO_IDS,
  filters = NO_FILTERS,
  searchMatches = null,
  onClearFilters,
  onClearSearch,
}: Props) {
  const toast = useToast();
  const router = useRouter();
  const t = useT().studioDocuments;
  const book = useT().studioBook;
  const locale = useLocale();
  const { number } = useFormat();
  const { timeZone } = useAccount().profile;
  const [sort, setSort] = useState(DEFAULT_WORK_SORT);
  const now = list.loadedAt;
  const today = now > 0 ? writingTime(now, timeZone).day : "";
  const filtering = hasDocumentFilters(filters) || searchMatches !== null;

  const works = useMemo(() => buildWorks(list.docs, list.folders), [list.docs, list.folders]);
  const shown = listWorks(works, folderId, filters, searchMatches, sort);
  const docsById = new Map(list.docs.map((doc) => [doc.id, doc]));
  const foldersById = new Map(list.folders.map((folder) => [folder.id, folder]));
  const untitled = (title: string) => title || t.untitled;

  const workRow = (work: Work): TableRow | null => {
    const common = {
      key: `${work.type}:${work.id}`,
      type: work.type,
      title: untitled(work.title),
      href: work.type === "book" ? workHref(work) : chapterHref(work.id),
      words: work.words,
      genre: work.genre,
      tags: work.tags,
      updatedAt: work.updatedAt,
      createdAt: work.createdAt,
    };
    if (work.type === "book") {
      const folder = foldersById.get(work.id);
      if (!folder) return null;
      const meta = format(work.chapters === 1 ? book.meta.chaptersOne : book.meta.chapters, {
        chapters: number(work.chapters),
        words: number(work.words),
        time: formatChanged(work.updatedAt, now, locale),
      });
      return {
        ...common,
        mark: <FolderCover folder={folder} width={32} />,
        meta,
        sub: format(work.chapters === 1 ? t.table.chaptersOne : t.table.chapters, {
          count: number(work.chapters),
        }),
        badges: [],
        menuLabel: format(t.menu.folderLabel, { name: folder.name }),
        menu: folderMenu({ folder, t, book, words: work.words, onPending }),
      };
    }
    const doc: DocumentSummary | undefined = docsById.get(work.id);
    if (!doc) return null;
    const target = today ? targetSummary(doc.targets, doc.wordCount, today, locale) : null;
    return {
      ...common,
      mark: <DocumentMark page={doc} />,
      meta:
        documentMeta(t, locale, "changed", doc.wordCount, doc.updatedAt, now) +
        (target ? ` · ${target}` : ""),
      sub: target ?? "",
      badges: [
        ...(sharedIds.has(doc.id) ? [t.rowTags.shared] : []),
        ...(submittedIds.has(doc.id) ? [t.rowTags.sent] : []),
      ],
      menuLabel: format(t.menu.documentLabel, { name: untitled(doc.title) }),
      menu: documentMenu({
        doc,
        t,
        list,
        toast,
        archiveBusy,
        onPending,
        onArchiveAction,
        onDetails: () => router.push(workHref(work)),
      }),
    };
  };

  const folderRows: TableRow[] =
    folderId === null && !filtering
      ? [...collectionsOf(list.folders)]
          .sort((a, b) => a.name.localeCompare(b.name, "id"))
          .map((folder) => {
            const inside = works.filter((work) => work.collectionId === folder.id);
            const count = inside.length;
            return {
              key: `folder:${folder.id}`,
              type: "folder" as const,
              title: folder.name,
              onOpen: () => onOpenFolder(folder.id),
              mark: (
                <span className="grid aspect-square w-8 place-items-center rounded-lg bg-subtle text-ink-muted">
                  <FolderSimple size={18} aria-hidden />
                </span>
              ),
              meta: format(count === 1 ? t.meta.folderOne : t.meta.folder, {
                count: number(count),
                time: formatChanged(
                  Math.max(folder.createdAt, ...inside.map((work) => work.updatedAt)),
                  now,
                  locale,
                ),
              }),
              sub: format(count === 1 ? t.table.itemsOne : t.table.items, {
                count: number(count),
              }),
              words: inside.reduce((sum, work) => sum + work.words, 0),
              genre: null,
              tags: [],
              badges: [],
              updatedAt: Math.max(folder.createdAt, ...inside.map((work) => work.updatedAt)),
              createdAt: folder.createdAt,
              menuLabel: format(t.menu.folderLabel, { name: folder.name }),
              menu: folderMenu({
                folder,
                t,
                book,
                words: inside.reduce((sum, work) => sum + work.words, 0),
                onPending,
              }),
            };
          })
      : [];
  const rows = [...folderRows, ...shown.flatMap((work) => workRow(work) ?? [])];

  if (rows.length === 0) {
    return (
      <ListEmpty
        folderId={folderId}
        folderName={folderName}
        searching={searchMatches !== null}
        filtering={filtering}
        onClearSearch={onClearSearch}
        onClearFilters={onClearFilters}
      />
    );
  }
  return (
    <WorksTable rows={rows} sort={sort} onSort={(key) => setSort(nextSort(sort, key))} now={now} />
  );
}
