"use client";

import { useLocale, useT, format } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
import { isBook } from "../../book";
import type { StudioFolder } from "../../storage/document-store";
import { FolderCover } from "../book/folder-cover";
import { formatChanged } from "../../relative-time";
import { folderMeta } from "./document-text";
import { Row } from "./document-row";
import type { Pending } from "./pending";

/**
 * A folder in the list. A book shows its cover and its size in chapters and words instead of the
 * folder mark; either kind can be renamed, and a plain folder can become a book from its menu.
 */
export function FolderRow({
  index,
  folder,
  count,
  words,
  changedAt,
  now,
  onOpen,
  onPending,
}: {
  index: number;
  folder: StudioFolder;
  count: number;
  words: number;
  changedAt: number;
  now: number;
  onOpen: () => void;
  onPending: (pending: Pending) => void;
}) {
  const t = useT().studioDocuments;
  const book = useT().studioBook;
  const locale = useLocale();
  const { number } = useFormat();
  const asBook = isBook(folder);
  const meta = asBook
    ? format(count === 1 ? book.meta.chaptersOne : book.meta.chapters, {
        chapters: number(count),
        words: number(words),
        time: formatChanged(changedAt, now, locale),
      })
    : folderMeta(t, locale, count, changedAt, now);
  return (
    <Row
      index={index}
      kind="folder"
      mark={asBook ? <FolderCover folder={folder} width={34} className="mt-0.5" /> : undefined}
      title={folder.name}
      onOpen={onOpen}
      meta={meta}
      menuLabel={format(t.menu.folderLabel, { name: folder.name })}
      items={[
        {
          id: "rename",
          label: t.menu.rename,
          onSelect: () => onPending({ kind: "renameFolder", id: folder.id, name: folder.name }),
        },
        {
          id: "book",
          label: asBook ? book.settings : book.makeBook,
          onSelect: () => onPending({ kind: "bookSettings", folder }),
        },
      ]}
    />
  );
}
