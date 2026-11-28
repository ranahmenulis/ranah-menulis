import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NewWritingDialog } from "@/features/studio/components/documents/new-writing-dialog";
import { installDialogShim } from "@/test/dialog-shim";

const h = vi.hoisted(() => ({ push: vi.fn(), createFolder: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: h.push, back: vi.fn() }) }));
vi.mock("@/features/studio/storage/store", () => ({
  studioStore: { createFolder: (...args: unknown[]) => h.createFolder(...args) },
}));
vi.mock("@/features/studio/storage/cover-store", () => ({ coverFileStore: {} }));
vi.mock("@/lib/files/use-stored-file-url", () => ({
  useStoredFileUrl: () => ({ status: "missing", url: null }),
}));

beforeAll(installDialogShim);
afterEach(cleanup);
beforeEach(() => {
  h.push.mockReset();
  h.createFolder.mockReset().mockResolvedValue({ id: "buku-1", name: "Pulang", createdAt: 0 });
});

const open = (collectionId: string | null = null, onClose = vi.fn()) => {
  render(<NewWritingDialog collectionId={collectionId} onClose={onClose} />);
  return onClose;
};

describe("NewWritingDialog", () => {
  it("offers a note and a book", () => {
    open();
    expect(screen.getByRole("heading", { name: "Mau menulis apa?" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Catatan/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Buku/ })).toBeTruthy();
  });

  it("opens a note straight in the editor, in the open folder", () => {
    const onClose = open("rak");
    fireEvent.click(screen.getByRole("button", { name: /Catatan/ }));
    expect(onClose).toHaveBeenCalled();
    expect(h.push).toHaveBeenCalledWith("/studio/baru?folder=rak");
  });

  it("asks for a book's title, creates it, then opens its chapters", async () => {
    const onClose = open("rak");
    fireEvent.click(screen.getByRole("button", { name: /Buku/ }));
    fireEvent.change(screen.getByLabelText(/Judul buku/), { target: { value: " Pulang " } });
    fireEvent.click(screen.getByRole("button", { name: "Buat buku" }));
    await waitFor(() => expect(h.push).toHaveBeenCalledWith("/studio/naskah/buku-1/isi"));
    expect(h.createFolder).toHaveBeenCalledWith("Pulang", { kind: "book", collectionId: "rak" });
    expect(onClose).toHaveBeenCalled();
  });

  it("asks a new book for its type and synopsis up front", async () => {
    open();
    fireEvent.click(screen.getByRole("button", { name: /Buku/ }));
    fireEvent.change(screen.getByLabelText(/Judul buku/), { target: { value: "Pulang" } });
    fireEvent.change(screen.getByLabelText(/Jenis buku/), { target: { value: "novel" } });
    fireEvent.change(screen.getByLabelText(/Sinopsis/), {
      target: { value: " Seorang anak pulang ke kampung. " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Buat buku" }));
    await waitFor(() =>
      expect(h.createFolder).toHaveBeenCalledWith("Pulang", {
        kind: "book",
        genre: "novel",
        synopsis: "Seorang anak pulang ke kampung.",
      }),
    );
  });

  it("keeps the book form open when creating fails", async () => {
    h.createFolder.mockRejectedValueOnce(new Error("offline"));
    const onClose = open();
    fireEvent.click(screen.getByRole("button", { name: /Buku/ }));
    fireEvent.change(screen.getByLabelText(/Judul buku/), { target: { value: "Pulang" } });
    fireEvent.click(screen.getByRole("button", { name: "Buat buku" }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
    expect(h.push).not.toHaveBeenCalled();
  });
});
