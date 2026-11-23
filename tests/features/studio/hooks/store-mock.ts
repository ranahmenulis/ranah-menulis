import { act } from "@testing-library/react";
import { vi } from "vitest";
import { emptyLog } from "@/features/studio/daily-progress";
import type {
  DocumentStore,
  SaveResult,
  StudioDocument,
} from "@/features/studio/storage/document-store";

export const content = { type: "doc", content: [{ type: "paragraph" }] };

export function stored(over: Partial<StudioDocument> = {}): StudioDocument {
  return {
    id: "doc-1",
    title: "Surat",
    content,
    wordCount: 10,
    version: 2,
    updatedAt: 1000,
    ...over,
  };
}

export function makeStore(over: Partial<DocumentStore> = {}) {
  const save = vi.fn<DocumentStore["save"]>(async (input, base): Promise<SaveResult> => ({
    ok: true,
    doc: { ...input, version: base + 1, updatedAt: Date.now() },
    progress: emptyLog(),
  }));
  const store: DocumentStore = {
    get: vi.fn(async () => stored()),
    save,
    today: vi.fn(async () => emptyLog()),
    duplicate: vi.fn(async (source, title) => ({ ...source, id: "copy", title, version: 1 })),
    duplicateActive: vi.fn(async () => null),
    setArchived: vi.fn(async () => null),
    list: vi.fn(async () => []),
    listSummaries: vi.fn(async () => []),
    listFolders: vi.fn(async () => []),
    history: vi.fn(async () => []),
    updateMeta: vi.fn(async () => null),
    updateClassification: vi.fn(async () => ({ status: "unavailable" as const })),
    deletePermanently: vi.fn(async () => {}),
    importHistory: vi.fn(async () => {}),
    createFolder: vi.fn(async (name) => ({ id: "f", name, createdAt: 0 })),
    renameFolder: vi.fn(async () => {}),
    updateFolder: vi.fn(async () => null),
    listVersions: vi.fn(async () => []),
    addVersion: vi.fn(async () => {}),
    ...over,
  };
  return { store, save };
}

/** Let pending promises settle, then move the fake clock. */
export async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}
