import { isActiveDocument } from "./document-archive";
import { blockTexts } from "./editor-stats";
import type { DocumentStore, DocumentSummary, StudioFolder } from "./storage/document-store";

export type StudioSearchResult = { kind: "document" | "folder"; id: string; name: string };

export function searchText(value: string) {
  return value.normalize("NFC").toLowerCase().trim().replace(/\s+/gu, " ");
}

const documentName = ({ title }: DocumentSummary) => title.trim() || "Tanpa judul";

export function studioSearchResults(
  docs: DocumentSummary[],
  folders: StudioFolder[],
  query: string,
): StudioSearchResult[] {
  const term = searchText(query);
  if (!term) return [];

  const items: StudioSearchResult[] = [
    ...docs.filter(isActiveDocument).map((doc) => ({
      kind: "document" as const,
      id: doc.id,
      name: documentName(doc),
    })),
    ...folders.map(({ id, name }) => ({ kind: "folder" as const, id, name })),
  ];
  return items
    .map((item) => ({ item, name: searchText(item.name) }))
    .filter(({ name }) => name.includes(term))
    .sort((a, b) => rank(a.name, term) - rank(b.name, term) || a.name.localeCompare(b.name, "id"))
    .map(({ item }) => item);
}

function rank(name: string, term: string) {
  if (name === term) return 0;
  return name.startsWith(term) ? 1 : 2;
}

export function studioFolderHref(id: string) {
  return `/studio?${new URLSearchParams({ folder: id })}`;
}

export async function currentSearchHref(
  store: Pick<DocumentStore, "get" | "listFolders">,
  result: StudioSearchResult,
) {
  if (result.kind === "folder") {
    return (await store.listFolders()).some(({ id }) => id === result.id)
      ? studioFolderHref(result.id)
      : null;
  }
  const doc = await store.get(result.id);
  return doc && isActiveDocument(doc) ? `/studio/${encodeURIComponent(doc.id)}` : null;
}

const BODY_BATCH_SIZE = 4;

/** The list keeps summaries. Only title misses need an IndexedDB read of the saved body. */
export async function scanDocumentMatches(
  store: Pick<DocumentStore, "get">,
  candidates: readonly DocumentSummary[],
  term: string,
  signal: AbortSignal,
): Promise<ReadonlySet<string>> {
  const matches = new Set<string>();
  const bodyIds: string[] = [];
  for (const doc of candidates) {
    if (searchText(documentName(doc)).includes(term)) matches.add(doc.id);
    else bodyIds.push(doc.id);
  }

  for (let start = 0; start < bodyIds.length; start += BODY_BATCH_SIZE) {
    signal.throwIfAborted();
    await Promise.all(
      bodyIds.slice(start, start + BODY_BATCH_SIZE).map(async (id) => {
        const doc = await store.get(id);
        if (signal.aborted || !doc || !isActiveDocument(doc)) return;
        const body = blockTexts(doc.content.content ?? []).join(" ");
        if (searchText(body).includes(term)) matches.add(id);
      }),
    );
    if (start + BODY_BATCH_SIZE < bodyIds.length) {
      // Give input, rendering, and cancellation a turn even when storage responds immediately.
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }
  signal.throwIfAborted();
  return matches;
}
