import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import { dayKey } from "@/features/studio/daily-progress";
import { addDays } from "@/features/studio/streak";
import { LiveList } from "@/features/studio/components/documents/document-lists";
import { PendingDialogs } from "@/features/studio/components/documents/pending-dialogs";
import type { DocumentList } from "@/features/studio/hooks/use-document-list";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import { installDialogShim } from "@/test/dialog-shim";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), back: vi.fn() }) }));

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
    updateClassification: vi.fn(),
    duplicateActive: vi.fn(),
    setArchived: vi.fn(),
    moveTo: vi.fn(),
    trash: vi.fn(),
    restore: vi.fn(),
    deleteForever: vi.fn(),
    createFolder: vi.fn(),
    renameFolder: vi.fn(),
  };
}

function renderList(
  sharedIds: ReadonlySet<string>,
  onPending = vi.fn(),
  submittedIds: ReadonlySet<string> = new Set(),
) {
  const list = listOf([doc("a", "Yang Ditunggu Nenek"), doc("b", "Catatan Pasar")]);
  render(
    <ToastProvider>
      <LiveList
        list={list}
        folderId={null}
        folderName={null}
        onOpenFolder={() => {}}
        onPending={onPending}
        onArchiveAction={vi.fn()}
        sharedIds={sharedIds}
        submittedIds={submittedIds}
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
          onArchiveAction={vi.fn()}
          onPending={() => {}}
          sharedIds={new Set(["a"])}
        />
      </ToastProvider>,
    );
    expect(screen.getByText("Dibagikan")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2 }).className).toContain("overflow-wrap:anywhere");
  });
});

describe("Dokumen list, Dikirim ke proyek tag", () => {
  it("marks only the documents that were sent, and can carry both tags at once", () => {
    renderList(new Set(["a"]), vi.fn(), new Set(["a", "b"]));

    const first = within(rowOf("Yang Ditunggu Nenek"));
    expect(first.getByText("Dibagikan")).toBeTruthy();
    expect(first.getByText("Dikirim ke proyek")).toBeTruthy();
    const second = within(rowOf("Catatan Pasar"));
    expect(second.getByText("Dikirim ke proyek")).toBeTruthy();
    expect(second.queryByText("Dibagikan")).toBeNull();
  });

  it("shows no tag when nothing was sent", () => {
    renderList(new Set());
    expect(screen.queryByText("Dikirim ke proyek")).toBeNull();
  });
});

describe("Dokumen list, Kirim ke proyek", () => {
  it("is off for a document with no text yet", () => {
    const empty = { ...doc("e", "Masih Kosong"), wordCount: 0 };
    render(
      <ToastProvider>
        <LiveList
          list={listOf([empty])}
          folderId={null}
          folderName={null}
          onOpenFolder={() => {}}
          onArchiveAction={vi.fn()}
          onPending={() => {}}
        />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Menu dokumen Masih Kosong" }));
    const item = screen.getAllByRole("menuitem", { name: /Kirim ke proyek/ })[0];
    expect((item as HTMLButtonElement).disabled).toBe(true);
  });

  it("is live in the document menu and opens the dialog for that document", () => {
    const { onPending } = renderList(new Set());
    fireEvent.click(screen.getByRole("button", { name: "Menu dokumen Yang Ditunggu Nenek" }));
    fireEvent.click(screen.getAllByRole("menuitem", { name: /Kirim ke proyek/ })[0]);

    expect(onPending).toHaveBeenCalledWith({
      kind: "sendToProject",
      doc: expect.objectContaining({ id: "a" }),
    });
  });

  it("shows the project picker for a pending send, and closing clears it", async () => {
    const onClose = vi.fn();
    render(
      <PendingDialogs
        pending={{ kind: "sendToProject", doc: doc("a", "Yang Ditunggu Nenek") }}
        list={listOf([])}
        onClose={onClose}
      />,
    );
    expect(screen.getByRole("dialog", { name: "Kirim ke proyek" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("LiveList: document targets", () => {
  it("adds the nearest open target to a document's meta line", () => {
    const due = addDays(dayKey(new Date(5000)), 5);
    const withTarget: StudioDocument = {
      ...doc("a", "Yang Ditunggu Nenek"),
      targets: [{ id: "t1", words: 1000, due }],
    };
    render(
      <ToastProvider>
        <LiveList
          list={listOf([withTarget, doc("b", "Catatan Pasar")])}
          folderId={null}
          folderName={null}
          onOpenFolder={() => {}}
          onArchiveAction={vi.fn()}
          onPending={vi.fn()}
        />
      </ToastProvider>,
    );

    expect(screen.getByText(/120 \/ 1\.000 kata · 5 hari lagi/)).toBeTruthy();
    expect(screen.getAllByText(/Diubah/)).toHaveLength(2);
  });
});
