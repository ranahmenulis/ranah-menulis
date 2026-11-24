import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NewWorkDialog } from "@/features/studio/components/documents/new-work-dialog";
import { installDialogShim } from "@/test/dialog-shim";

const h = vi.hoisted(() => ({
  push: vi.fn(),
  save: vi.fn(),
  classify: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: h.push, back: vi.fn() }) }));
vi.mock("@/features/studio/storage/store", () => ({
  studioStore: {
    save: (...args: unknown[]) => h.save(...args),
    updateClassification: (...args: unknown[]) => h.classify(...args),
  },
}));

beforeAll(installDialogShim);
afterEach(cleanup);
beforeEach(() => {
  h.push.mockReset();
  h.save.mockReset().mockResolvedValue({ ok: true });
  h.classify.mockReset().mockResolvedValue({ status: "saved" });
});

const open = (collectionId: string | null = null, onClose = vi.fn()) => {
  render(<NewWorkDialog collectionId={collectionId} onClose={onClose} />);
  return onClose;
};

describe("NewWorkDialog", () => {
  it("needs a title before it can create", () => {
    open();
    expect(
      (screen.getByRole("button", { name: "Buat naskah" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("creates the work with the optional type and opens its summary", async () => {
    const onClose = open("f");
    fireEvent.change(screen.getByLabelText(/Judul naskah/), { target: { value: " Arutala " } });
    fireEvent.change(screen.getByLabelText(/Jenis dokumen/), { target: { value: "novel" } });
    fireEvent.click(screen.getByRole("button", { name: "Buat naskah" }));
    await waitFor(() => expect(h.push).toHaveBeenCalledTimes(1));
    expect(h.save).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Arutala", wordCount: 0, folderId: "f" }),
      0,
    );
    expect(h.classify).toHaveBeenCalledWith(expect.any(String), {}, { kind: "novel" });
    expect(h.push.mock.calls[0][0]).toMatch(/^\/studio\/naskah\//);
    expect(onClose).toHaveBeenCalled();
  });

  it("leaves the type alone when none is chosen", async () => {
    open();
    fireEvent.change(screen.getByLabelText(/Judul naskah/), { target: { value: "Catatan" } });
    fireEvent.click(screen.getByRole("button", { name: "Buat naskah" }));
    await waitFor(() => expect(h.push).toHaveBeenCalled());
    expect(h.classify).not.toHaveBeenCalled();
  });

  it("says so and stays when saving fails", async () => {
    h.save.mockRejectedValue(new Error("x"));
    open();
    fireEvent.change(screen.getByLabelText(/Judul naskah/), { target: { value: "Catatan" } });
    fireEvent.click(screen.getByRole("button", { name: "Buat naskah" }));
    expect(await screen.findByText("Perubahan belum tersimpan. Coba lagi.")).toBeTruthy();
    expect(h.push).not.toHaveBeenCalled();
  });
});
