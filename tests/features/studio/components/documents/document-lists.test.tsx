import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import { LiveList } from "@/features/studio/components/documents/document-lists";
import { PendingDialogs } from "@/features/studio/components/documents/pending-dialogs";
import type { DocumentList } from "@/features/studio/hooks/use-document-list";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import { installDialogShim } from "@/test/dialog-shim";

beforeAll(installDialogShim);
afterEach(cleanup);

const doc = (id: string, title: string): StudioDocument => ({
  id,
  title,
  content: { type: "doc", content: [] },
  wordCount: 120,
  version: 1,
  updatedAt: 1000,
});

function listOf(docs: StudioDocument[]): DocumentList {
  return {
    status: "ready",
    loadedAt: 5000,
    docs,
    folders: [],
    reload: vi.fn(),
    rename: vi.fn(),
    moveTo: vi.fn(),
    trash: vi.fn(),
    restore: vi.fn(),
    deleteForever: vi.fn(),
    createFolder: vi.fn(),
    renameFolder: vi.fn(),
  };
}

function renderList(sharedIds: ReadonlySet<string>, onPending = vi.fn()) {
  const list = listOf([doc("a", "Yang Ditunggu Nenek"), doc("b", "Catatan Pasar")]);
  render(
    <ToastProvider>
      <LiveList
        list={list}
        folderId={null}
        folderName={null}
        onOpenFolder={() => {}}
        onPending={onPending}
        sharedIds={sharedIds}
      />
    </ToastProvider>,
  );
  return { onPending, list };
}

const rowOf = (title: string) => screen.getByText(title).closest("li")!;

describe("Dokumen list, Dibagikan tag", () => {
  it("marks only the documents that have a published post", () => {
    renderList(new Set(["a"]));

    expect(within(rowOf("Yang Ditunggu Nenek")).getByText("Dibagikan")).toBeTruthy();
    expect(within(rowOf("Catatan Pasar")).queryByText("Dibagikan")).toBeNull();
  });

  it("shows no tag when nothing was shared", () => {
    renderList(new Set());
    expect(screen.queryByText("Dibagikan")).toBeNull();
  });

  it("keeps a very long title and the tag from breaking the row", () => {
    const long = "Judul yang sangat panjang ".repeat(12).trim();
    const list = listOf([doc("a", long)]);
    render(
      <ToastProvider>
        <LiveList
          list={list}
          folderId={null}
          folderName={null}
          onOpenFolder={() => {}}
          onPending={() => {}}
          sharedIds={new Set(["a"])}
        />
      </ToastProvider>,
    );
    expect(screen.getByText("Dibagikan")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2 }).className).toContain("overflow-wrap:anywhere");
  });
});

describe("Dokumen list, Kirim ke proyek", () => {
  it("is live in the document menu and opens the dialog for that document", () => {
    const { onPending } = renderList(new Set());
    fireEvent.click(screen.getByRole("button", { name: "Menu dokumen Yang Ditunggu Nenek" }));
    fireEvent.click(screen.getAllByRole("menuitem", { name: /Kirim ke proyek/ })[0]);

    expect(onPending).toHaveBeenCalledWith({
      kind: "sendToProject",
      doc: expect.objectContaining({ id: "a" }),
    });
  });

  it("shows the 'no project yet' dialog for a pending send, and closing clears it", () => {
    const onClose = vi.fn();
    render(
      <PendingDialogs
        pending={{ kind: "sendToProject", doc: doc("a", "Yang Ditunggu Nenek") }}
        list={listOf([])}
        onClose={onClose}
      />,
    );
    expect(screen.getByText(/Belum ada proyek yang menerima karya/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(onClose).toHaveBeenCalled();
  });
});
