import {
  bookSource,
  bookSources,
  folderIdOfBook,
  isBookDocId,
  type BookChapter,
} from "@/features/studio/book-source";
import { isActiveDocument } from "@/features/studio/document-archive";
import type {
  DocumentStore,
  StudioDocument,
  StudioFolder,
} from "@/features/studio/storage/document-store";

/** What reading the work to send needs from the Studio; a book also needs the full list. */
export type SourceReader = Pick<DocumentStore, "get"> &
  Partial<Pick<DocumentStore, "list" | "listFolders">>;

export type SubmitSource = { doc: StudioDocument | null; chapters?: BookChapter[] };

const NOTHING: SubmitSource = { doc: null };

/**
 * The work named by `docId`, read now: a Studio document, or a whole book (`book:<folder id>`)
 * merged from its chapters as they are at this moment. `doc` is null when no id was given, it is
 * gone, or a book has nothing written or its folder is no longer a book.
 */
export async function readSubmitSource(
  documents: SourceReader,
  docId: string | null,
): Promise<SubmitSource> {
  if (!docId) return NOTHING;
  if (!isBookDocId(docId)) return { doc: await documents.get(docId) };
  if (!documents.list || !documents.listFolders) return NOTHING;
  const [folders, docs] = await Promise.all([documents.listFolders(), documents.list()]);
  const folder = folders.find((f) => f.id === folderIdOfBook(docId));
  return (folder && bookSource(folder, docs)) || NOTHING;
}

/**
 * The works a project's picker offers: the Studio's active documents, newest change first, and for
 * Solo also each book that has text (a whole book is one manuscript there; the other categories
 * count work by piece, so they never see books).
 */
export function submitDocs(
  project: { block: { kind: string } },
  docs: StudioDocument[],
  folders: StudioFolder[],
): StudioDocument[] {
  const active = docs.filter(isActiveDocument).sort((a, b) => b.updatedAt - a.updatedAt);
  if (project.block.kind !== "solo") return active;
  return [...bookSources(folders, docs).map(({ doc }) => doc), ...active];
}
