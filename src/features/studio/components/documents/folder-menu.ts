import type { MenuEntry } from "@/components/ui/menu";
import type { studioBook } from "../../copy/book-id";
import { isBook } from "../../book";
import type { StudioFolder } from "../../storage/document-store";
import type { DocumentCopy } from "./document-text";
import type { Pending } from "./pending";

/**
 * The ⋯ menu of a folder row. A book (a work with chapters) can be renamed, set up again and sent
 * to a project; a plain folder can be renamed or turned into a book.
 */
export function folderMenu({
  folder,
  t,
  book,
  words,
  onPending,
}: {
  folder: StudioFolder;
  t: DocumentCopy;
  book: typeof studioBook;
  words: number;
  onPending: (pending: Pending) => void;
}): MenuEntry[] {
  const asBook = isBook(folder);
  return [
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
    ...(asBook
      ? [
          {
            id: "classification",
            label: t.menu.classification,
            onSelect: () => onPending({ kind: "classifyBook" as const, folder }),
          },
          {
            id: "send",
            label: book.send,
            // Nothing to send until a chapter has text, like Kirim ke proyek on a document.
            disabled: words === 0,
            onSelect: () => onPending({ kind: "sendBook" as const, folder }),
          },
        ]
      : []),
  ];
}
