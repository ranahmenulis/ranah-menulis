import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { BookDialog } from "@/features/studio/components/book/book-dialog";
import { installDialogShim } from "@/test/dialog-shim";

const storeImage = vi.fn<(...args: unknown[]) => Promise<unknown>>();
const discardImage = vi.fn<(...args: unknown[]) => Promise<void>>(async () => {});
vi.mock("@/lib/files/store-image", () => ({
  storeImage: (...args: unknown[]) => storeImage(...args),
  discardImage: (...args: unknown[]) => discardImage(...args),
}));
vi.mock("@/lib/files/use-stored-file-url", () => ({
  useStoredFileUrl: () => ({ status: "ready", url: "blob:cover" }),
}));
vi.mock("@/lib/files/store", () => ({ fileStore: () => ({}) }));

beforeAll(installDialogShim);
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const pickFile = () => new File(["x"], "sampul.png", { type: "image/png" });
const type = (field: HTMLElement, value: string) => fireEvent.change(field, { target: { value } });
const upload = (input: HTMLElement, file: File) =>
  fireEvent.change(input, { target: { files: [file] } });

describe("BookDialog", () => {
  it("offers the cover from the start and creates a book without one", async () => {
    const onSubmit = vi.fn(async () => {});
    render(<BookDialog folder={null} onSubmit={onSubmit} onClose={vi.fn()} />);
    expect(screen.getByText("Sampul (opsional)")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Pilih gambar sampul" })).toBeTruthy();

    type(screen.getByLabelText("Judul buku"), "  Pulang ke Pesisir ");
    fireEvent.click(screen.getByRole("button", { name: "Buat buku" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledWith({ name: "Pulang ke Pesisir", cover: null });
  });

  it("asks for a title", async () => {
    const onSubmit = vi.fn();
    render(<BookDialog folder={null} onSubmit={onSubmit} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Buat buku" }));
    expect((await screen.findByRole("alert")).textContent).toBe("Tulis judul buku.");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("requires a description once a cover is picked, then saves both", async () => {
    storeImage.mockResolvedValue({ ok: true, id: "file-1" });
    const onSubmit = vi.fn(async () => {});
    render(<BookDialog folder={null} onSubmit={onSubmit} onClose={vi.fn()} />);
    type(screen.getByLabelText("Judul buku"), "Novel");
    upload(screen.getByLabelText("Pilih gambar sampul"), pickFile());

    const alt = await screen.findByLabelText(/Deskripsi sampul/);
    fireEvent.click(screen.getByRole("button", { name: "Buat buku" }));
    expect((await screen.findByRole("alert")).textContent).toContain("deskripsi sampul");
    expect(onSubmit).not.toHaveBeenCalled();

    type(alt, "Perahu di senja");
    fireEvent.click(screen.getByRole("button", { name: "Buat buku" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Novel",
      cover: { fileId: "file-1", alt: "Perahu di senja" },
    });
  });

  it("frees an image that was picked but not kept when the dialog is cancelled", async () => {
    storeImage.mockResolvedValue({ ok: true, id: "file-2" });
    const onClose = vi.fn();
    render(<BookDialog folder={null} onSubmit={vi.fn()} onClose={onClose} />);
    upload(screen.getByLabelText("Pilih gambar sampul"), pickFile());
    await screen.findByLabelText(/Deskripsi sampul/);

    fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(discardImage).toHaveBeenCalledWith("file-2", expect.anything());
  });

  it("frees the old saved cover only after a save replaced it", async () => {
    storeImage.mockResolvedValue({ ok: true, id: "new" });
    const folder = {
      id: "f",
      name: "Novel",
      createdAt: 0,
      kind: "book" as const,
      cover: { fileId: "old", alt: "Lama" },
    };
    render(<BookDialog folder={folder} onSubmit={vi.fn(async () => {})} onClose={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Pengaturan buku" })).toBeTruthy();
    upload(screen.getByLabelText("Ganti sampul"), pickFile());
    const alt = await screen.findByLabelText(/Deskripsi sampul/);
    type(alt, "Baru");
    expect(discardImage).not.toHaveBeenCalledWith("old", expect.anything());

    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => expect(discardImage).toHaveBeenCalledWith("old", expect.anything()));
  });

  it("shows the picker's problem and keeps the dialog open", async () => {
    storeImage.mockResolvedValue({ ok: false, message: "x", problem: "type" });
    render(<BookDialog folder={null} onSubmit={vi.fn()} onClose={vi.fn()} />);
    upload(screen.getByLabelText("Pilih gambar sampul"), pickFile());
    expect(await screen.findByRole("alert")).toBeTruthy();
  });
});
