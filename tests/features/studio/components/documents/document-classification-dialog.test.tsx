import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { DocumentClassificationDialog } from "@/features/studio/components/documents/document-classification-dialog";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import { installDialogShim } from "@/test/dialog-shim";
import type { ComponentProps } from "react";

beforeAll(installDialogShim);
afterEach(cleanup);

const doc: StudioDocument = {
  id: "a",
  title: "Di Ujung Pekan",
  content: { type: "doc" },
  wordCount: 10,
  version: 1,
  updatedAt: 0,
};

function setup(initial = doc) {
  const save = vi.fn<ComponentProps<typeof DocumentClassificationDialog>["onSave"]>();
  const saved = vi.fn();
  render(
    <DocumentClassificationDialog doc={initial} onSave={save} onSaved={saved} onClose={vi.fn()} />,
  );
  return {
    save,
    saved,
    kind: screen.getByRole<HTMLSelectElement>("combobox", { name: /Jenis dokumen/ }),
    tag: screen.getByRole<HTMLInputElement>("textbox", { name: /Tag baru/ }),
    submit: () => fireEvent.click(screen.getByRole("button", { name: "Simpan" })),
  };
}

describe("DocumentClassificationDialog", () => {
  it("adds a typed tag on save and keeps the label's casing", async () => {
    const { save, saved, kind, tag, submit } = setup();
    const next: StudioDocument = { ...doc, kind: "cerpen", tags: ["Hujan"] };
    save.mockResolvedValue({ status: "saved", doc: next });

    fireEvent.change(kind, { target: { value: "cerpen" } });
    fireEvent.change(tag, { target: { value: "  Hujan  " } });
    submit();

    await waitFor(() => expect(saved).toHaveBeenCalledWith(next));
    expect(save).toHaveBeenCalledWith(doc, { kind: "cerpen", tags: ["Hujan"] });
  });

  it("rejects duplicate tags and allows removing the existing tag and kind", async () => {
    const { save, saved, kind, tag, submit } = setup({ ...doc, kind: "cerpen", tags: ["Hujan"] });
    save.mockResolvedValue({ status: "saved", doc });

    fireEvent.change(tag, { target: { value: "hujan" } });
    fireEvent.keyDown(tag, { key: "Enter" });
    expect(screen.getByText("Tag ini sudah ada di dokumen.")).toBeTruthy();
    expect(save).not.toHaveBeenCalled();

    fireEvent.change(tag, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Lepas tag Hujan" }));
    expect(document.activeElement).toBe(tag);
    fireEvent.change(kind, { target: { value: "" } });
    submit();

    await waitFor(() => expect(saved).toHaveBeenCalled());
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ kind: "cerpen" }), {
      kind: undefined,
      tags: [],
    });
  });

  it("keeps the typed tag available after a write error", async () => {
    const { save, saved, tag, submit } = setup();
    save
      .mockRejectedValueOnce(new Error("Quota exceeded"))
      .mockResolvedValueOnce({ status: "saved", doc });
    fireEvent.change(tag, { target: { value: "Hujan" } });
    submit();

    expect((await screen.findByRole("alert")).textContent).toContain("gagal disimpan");
    expect(tag.value).toBe("Hujan");
    expect(saved).not.toHaveBeenCalled();

    submit();
    await waitFor(() => expect(saved).toHaveBeenCalled());
    expect(save).toHaveBeenLastCalledWith(doc, { kind: undefined, tags: ["Hujan"] });
  });

  it("blocks another save until the writer explicitly reloads concurrent classification changes", async () => {
    const { save, kind, tag, submit } = setup();
    const latest: StudioDocument = { ...doc, kind: "puisi", tags: ["Pantai"] };
    save.mockResolvedValueOnce({ status: "conflict", doc: latest });
    fireEvent.change(tag, { target: { value: "Hujan" } });
    submit();

    expect((await screen.findByRole("alert")).textContent).toContain("berubah di tab lain");
    expect(tag.value).toBe("Hujan");
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Simpan" }).disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Muat data terbaru" }));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(kind.value).toBe("puisi");
    expect(screen.getByRole("button", { name: "Lepas tag Pantai" })).toBeTruthy();
    expect(tag.value).toBe("");
  });
});
