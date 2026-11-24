import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import { WorkPage } from "@/features/studio/components/work/work-page";
import type { DocumentSummary, StudioFolder } from "@/features/studio/storage/document-store";
import { installDialogShim } from "@/test/dialog-shim";

const h = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  docs: [] as unknown[],
  folders: [] as unknown[],
  updateMeta: vi.fn(),
  updateFolder: vi.fn(),
  createFolder: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: h.push, replace: h.replace, back: vi.fn() }),
  usePathname: () => "/studio/naskah/x",
}));
vi.mock("@/lib/files/use-stored-file-url", () => ({
  useStoredFileUrl: () => ({ status: "missing", url: null }),
}));
vi.mock("@/features/studio/storage/store", () => ({
  studioStore: {
    listSummaries: async () => h.docs,
    listFolders: async () => h.folders,
    get: async (id: string) => ({
      id,
      content: {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "Ombak pagi datang." }] }],
      },
    }),
    updateMeta: (...args: unknown[]) => h.updateMeta(...args),
    updateFolder: (...args: unknown[]) => h.updateFolder(...args),
    createFolder: (...args: unknown[]) => h.createFolder(...args),
  },
}));

beforeAll(installDialogShim);
afterEach(cleanup);

const doc = (id: string, title: string, over: Partial<DocumentSummary> = {}): DocumentSummary => ({
  id,
  title,
  wordCount: 120,
  version: 1,
  updatedAt: 1000,
  createdAt: 500,
  ...over,
});
const book: StudioFolder = { id: "b", name: "Pulang", createdAt: 0, kind: "book" };

beforeEach(() => {
  h.push.mockReset();
  h.replace.mockReset();
  h.updateMeta.mockReset().mockResolvedValue({ id: "a" });
  h.updateFolder.mockReset().mockResolvedValue(book);
  h.createFolder.mockReset().mockResolvedValue({ ...book, id: "new" });
  h.docs = [];
  h.folders = [];
});

function show(id: string, tab: "ringkasan" | "isi") {
  render(
    <ToastProvider>
      <WorkPage id={id} tab={tab} />
    </ToastProvider>,
  );
}

describe("the Ringkasan tab", () => {
  it("shows the title, the details and the tabs of a loose document", async () => {
    h.docs = [doc("a", "Sajak Pagi", { kind: "puisi", tags: ["laut"] })];
    show("a", "ringkasan");
    expect(await screen.findByRole("heading", { level: 1, name: "Sajak Pagi" })).toBeTruthy();
    // The last-worked-on row reads the opening words of the chapter.
    expect(await screen.findByText("Ombak pagi datang.")).toBeTruthy();
    expect(screen.getByText("Puisi")).toBeTruthy();
    expect(screen.getByText("#laut")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Ringkasan" }).getAttribute("href")).toBe(
      "/studio/naskah/a",
    );
    expect(screen.getByRole("link", { name: "Isi" }).getAttribute("href")).toBe(
      "/studio/naskah/a/isi",
    );
    expect(screen.getByRole("link", { name: "Lanjutkan menulis" }).getAttribute("href")).toBe(
      "/studio/a?dari=a",
    );
  });

  it("saves the synopsis of a document when the field loses focus", async () => {
    h.docs = [doc("a", "Sajak Pagi")];
    show("a", "ringkasan");
    const field = await screen.findByLabelText("Sinopsis");
    fireEvent.change(field, { target: { value: "  Tentang laut.  " } });
    fireEvent.blur(field);
    await waitFor(() =>
      expect(h.updateMeta).toHaveBeenCalledWith("a", { synopsis: "Tentang laut." }),
    );
    expect(await screen.findByText("Sinopsis tersimpan.")).toBeTruthy();
  });

  it("saves the synopsis of a book on its folder, and says when it fails", async () => {
    h.docs = [doc("c", "Satu", { folderId: "b" })];
    h.folders = [book];
    h.updateFolder.mockRejectedValue(new Error("x"));
    show("b", "ringkasan");
    const field = await screen.findByLabelText("Sinopsis");
    fireEvent.change(field, { target: { value: "Sebuah kisah." } });
    fireEvent.blur(field);
    await waitFor(() =>
      expect(h.updateFolder).toHaveBeenCalledWith("b", { synopsis: "Sebuah kisah." }),
    );
    expect(await screen.findByText("Sinopsis belum tersimpan. Coba lagi.")).toBeTruthy();
  });

  it("does not save an unchanged synopsis", async () => {
    h.docs = [doc("a", "Sajak Pagi", { synopsis: "Sama." })];
    show("a", "ringkasan");
    const field = await screen.findByLabelText("Sinopsis");
    fireEvent.blur(field);
    expect(h.updateMeta).not.toHaveBeenCalled();
  });
});

describe("the Ringkasan tab, cover and targets", () => {
  it("offers to add a cover and opens the cover dialog", async () => {
    h.docs = [doc("a", "Sajak Pagi")];
    show("a", "ringkasan");
    fireEvent.click(await screen.findByRole("button", { name: "Tambah sampul" }));
    expect(screen.getByRole("dialog", { name: "Sampul naskah" })).toBeTruthy();
  });

  it("invites a target when there is none, and shows progress once there is", async () => {
    h.docs = [doc("a", "Sajak Pagi", { targets: [{ id: "t", words: 1000 }] })];
    show("a", "ringkasan");
    expect(await screen.findByText(/120 \/ 1\.000 kata/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Atur target" })).toBeTruthy();
    cleanup();
    h.docs = [doc("b", "Catatan")];
    show("b", "ringkasan");
    expect(await screen.findByText("Belum ada target untuk naskah ini.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Tambah target" })).toBeTruthy();
  });

  it("moves a work into a plain folder from its folder chip", async () => {
    h.docs = [doc("a", "Sajak Pagi")];
    h.folders = [{ id: "f", name: "Rak", createdAt: 0 }, book];
    show("a", "ringkasan");
    fireEvent.click(await screen.findByRole("button", { name: "Masukkan ke folder" }));
    const dialog = screen.getByRole("dialog");
    // Only plain folders are offered: a book is a work, not a place to file one.
    expect(dialog.textContent).toContain("Rak");
    expect(dialog.textContent).not.toContain("Pulang");
  });
});

describe("finding the work", () => {
  it("sends a chapter's address to its book", async () => {
    h.docs = [doc("c", "Satu", { folderId: "b" })];
    h.folders = [book];
    show("c", "isi");
    await waitFor(() => expect(h.replace).toHaveBeenCalledWith("/studio/naskah/b/isi"));
  });

  it("says so, with a way back, when nothing matches", async () => {
    show("hilang", "ringkasan");
    expect(await screen.findByText(/Naskah ini tidak ditemukan/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Ke daftar naskah" }).getAttribute("href")).toBe(
      "/studio",
    );
  });
});

describe("the Isi tab", () => {
  it("lists a book's chapters in the saved order, each opening its editor", async () => {
    h.docs = [
      doc("a", "Satu", { folderId: "b", createdAt: 1 }),
      doc("c", "Dua", { folderId: "b", createdAt: 2 }),
    ];
    h.folders = [{ ...book, chapterOrder: ["c", "a"] }];
    show("b", "isi");
    const links = await screen.findAllByRole("link", { name: /^(Satu|Dua)$/ });
    expect(links.map((link) => link.textContent)).toEqual(["Dua", "Satu"]);
    expect(links[0].getAttribute("href")).toBe("/studio/c?dari=b");
    expect(screen.getByText(/Bab 1/)).toBeTruthy();
  });

  it("adds a chapter to a book by opening a new document filed in it", async () => {
    h.docs = [doc("a", "Satu", { folderId: "b" })];
    h.folders = [book];
    show("b", "isi");
    fireEvent.click(await screen.findByRole("button", { name: "Tambah bab" }));
    await waitFor(() => expect(h.push).toHaveBeenCalledWith("/studio/baru?folder=b&dari=b"));
    expect(h.createFolder).not.toHaveBeenCalled();
  });

  it("turns a loose document into a book before adding its second chapter", async () => {
    h.docs = [doc("a", "Sajak Pagi", { kind: "puisi" })];
    show("a", "isi");
    expect(await screen.findByText(/baru satu tulisan/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Tambah bab" }));
    await waitFor(() => expect(h.push).toHaveBeenCalledWith("/studio/baru?folder=new&dari=new"));
    expect(h.createFolder).toHaveBeenCalledWith(
      "Sajak Pagi",
      expect.objectContaining({ kind: "book", chapterOrder: ["a"], genre: "puisi" }),
    );
    expect(h.updateMeta).toHaveBeenCalledWith("a", { folderId: "new" });
  });

  it("reports a failure to add a chapter and stays on the page", async () => {
    h.docs = [doc("a", "Sajak Pagi")];
    h.createFolder.mockRejectedValue(new Error("x"));
    show("a", "isi");
    fireEvent.click(await screen.findByRole("button", { name: "Tambah bab" }));
    expect(await screen.findByText("Bab belum bisa ditambah. Coba lagi.")).toBeTruthy();
    expect(h.push).not.toHaveBeenCalled();
  });
});
