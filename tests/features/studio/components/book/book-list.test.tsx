import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import { LiveList } from "@/features/studio/components/documents/document-lists";
import type { DocumentList } from "@/features/studio/hooks/use-document-list";
import type { StudioDocument, StudioFolder } from "@/features/studio/storage/document-store";
import { installDialogShim } from "@/test/dialog-shim";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), back: vi.fn() }) }));
vi.mock("@/lib/files/use-stored-file-url", () => ({
  useStoredFileUrl: () => ({ status: "missing", url: null }),
}));

beforeAll(installDialogShim);
afterEach(cleanup);

const doc = (id: string, title: string, createdAt: number): StudioDocument => ({
  id,
  title,
  content: { type: "doc", content: [] },
  wordCount: 100,
  version: 1,
  updatedAt: 1000,
  createdAt,
  folderId: "b",
});
const folder: StudioFolder = { id: "b", name: "Pulang", createdAt: 0, kind: "book" };

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

function renderList(list: DocumentList, folderId: string | null, handlers = {}) {
  render(
    <ToastProvider>
      <LiveList
        list={list}
        folderId={folderId}
        folderName={folderId ? "Pulang" : null}
        onOpenFolder={vi.fn()}
        onArchiveAction={vi.fn()}
        onPending={vi.fn()}
        {...handlers}
      />
    </ToastProvider>,
  );
}

describe("a book in the Dokumen list", () => {
  it("shows chapters and words on the folder row", () => {
    renderList(listOf([folder], [doc("a", "Satu", 1), doc("c", "Dua", 2)]), null);
    expect(screen.getByText(/2 bab · 200 kata/)).toBeTruthy();
  });

  it("lists chapters numbered in their saved order, with the move buttons", () => {
    const book = { ...folder, chapterOrder: ["c", "a"] };
    renderList(listOf([book], [doc("a", "Satu", 1), doc("c", "Dua", 2)]), "b");
    const rows = screen.getAllByRole("listitem");
    expect(within(rows[0]).getByText("Dua")).toBeTruthy();
    expect(rows[0].textContent).toContain("Bab 1");
    expect(rows[1].textContent).toContain("Bab 2");
    expect(
      within(rows[0]).getByRole("button", { name: "Naikkan Dua" }).hasAttribute("disabled"),
    ).toBe(true);
    expect(
      within(rows[1]).getByRole("button", { name: "Turunkan Satu" }).hasAttribute("disabled"),
    ).toBe(true);
  });

  it("reports the new order when a chapter moves", () => {
    const onReorder = vi.fn();
    const book = { ...folder, chapterOrder: ["a", "c"] };
    renderList(listOf([book], [doc("a", "Satu", 1), doc("c", "Dua", 2)]), "b", { onReorder });
    fireEvent.click(screen.getByRole("button", { name: "Turunkan Satu" }));
    expect(onReorder).toHaveBeenCalledWith(["c", "a"], { id: "a", step: 1 });
  });

  it("has no chapter controls in a plain folder", () => {
    const plain = { ...folder, kind: undefined };
    renderList(listOf([plain], [doc("a", "Satu", 1), doc("c", "Dua", 2)]), "b");
    expect(screen.queryByRole("button", { name: /Naikkan|Turunkan/ })).toBeNull();
    expect(screen.queryByText(/Bab 1/)).toBeNull();
  });

  it("explains how to start an empty book", () => {
    renderList(listOf([folder], []), "b");
    expect(screen.getByText(/Belum ada bab/)).toBeTruthy();
  });
});
