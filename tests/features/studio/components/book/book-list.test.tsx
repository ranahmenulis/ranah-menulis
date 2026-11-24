import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import { WorksList } from "@/features/studio/components/works/works-list";
import type { DocumentList } from "@/features/studio/hooks/use-document-list";
import type { StudioDocument, StudioFolder } from "@/features/studio/storage/document-store";
import { installDialogShim } from "@/test/dialog-shim";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), back: vi.fn() }) }));
vi.mock("@/lib/files/use-stored-file-url", () => ({
  useStoredFileUrl: () => ({ status: "missing", url: null }),
}));

beforeAll(installDialogShim);
afterEach(cleanup);

const doc = (id: string, title: string, createdAt: number, folderId = "b"): StudioDocument => ({
  id,
  title,
  content: { type: "doc", content: [] },
  wordCount: 100,
  version: 1,
  updatedAt: 1000,
  createdAt,
  folderId,
});
const book: StudioFolder = { id: "b", name: "Pulang", createdAt: 0, kind: "book" };

function listOf(folders: StudioFolder[], docs: StudioDocument[]): DocumentList {
  return {
    status: "ready",
    loadedAt: 5000,
    docs,
    folders,
    reload: vi.fn(),
    rename: vi.fn(),
    updateClassification: vi.fn(),
    duplicateActive: vi.fn(),
    setArchived: vi.fn(),
    moveTo: vi.fn(),
    trash: vi.fn(),
    restore: vi.fn(),
    deleteForever: vi.fn(),
    createFolder: vi.fn(),
    renameFolder: vi.fn(),
    updateFolder: vi.fn(),
  };
}

function renderList(list: DocumentList, folderId: string | null = null, onPending = vi.fn()) {
  render(
    <ToastProvider>
      <WorksList
        list={list}
        folderId={folderId}
        folderName={folderId ? "Rak" : null}
        onOpenFolder={vi.fn()}
        onArchiveAction={vi.fn()}
        onPending={onPending}
      />
    </ToastProvider>,
  );
  return onPending;
}

const rowOf = (title: string) => screen.getByRole("link", { name: title }).closest("tr")!;

describe("a book in the Naskah table", () => {
  it("is one row with its chapters and words, linking to its own page", () => {
    renderList(listOf([book], [doc("a", "Satu", 1), doc("c", "Dua", 2)]));
    const row = within(rowOf("Pulang"));
    expect(row.getByText(/2 bab · 200 kata/)).toBeTruthy();
    expect(row.getByRole("link", { name: "Pulang" }).getAttribute("href")).toBe("/studio/naskah/b");
  });

  it("does not list its chapters as works", () => {
    renderList(listOf([book], [doc("a", "Satu", 1), doc("c", "Dua", 2)]));
    expect(screen.queryByText("Satu")).toBeNull();
    expect(screen.queryByText("Dua")).toBeNull();
  });

  it("offers settings and sending to a project from its menu", () => {
    const onPending = renderList(listOf([book], [doc("a", "Satu", 1)]));
    expect(screen.getByRole("button", { name: "Menu folder Pulang" })).toBeTruthy();
    expect(onPending).not.toHaveBeenCalled();
  });
});

describe("a plain folder in the Naskah table", () => {
  const shelf: StudioFolder = { id: "f", name: "Rak", createdAt: 0 };

  it("counts the works inside, a book as one", () => {
    const filed = { ...book, collectionId: "f" };
    renderList(listOf([shelf, filed], [doc("a", "Satu", 1), doc("x", "Lepas", 3, "f")]));
    expect(
      within(screen.getByRole("button", { name: "Rak" }).closest("tr")!).getByText(
        /2 naskah · diubah/,
      ),
    ).toBeTruthy();
  });

  it("lists the books and documents filed in it once it is open", () => {
    const filed = { ...book, collectionId: "f" };
    renderList(listOf([shelf, filed], [doc("a", "Satu", 1), doc("x", "Lepas", 3, "f")]), "f");
    expect(screen.getByRole("link", { name: "Pulang" })).toBeTruthy();
    expect(screen.getByText("Lepas")).toBeTruthy();
    expect(screen.queryByText("Rak")).toBeNull();
  });
});
