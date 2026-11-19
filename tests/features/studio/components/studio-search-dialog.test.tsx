import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { StudioSearchDialog } from "@/features/studio/components/studio-search-dialog";
import type { DocumentStore, StudioDocument } from "@/features/studio/storage/document-store";
import { installDialogShim } from "@/test/dialog-shim";

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

beforeAll(installDialogShim);
afterEach(() => {
  cleanup();
  push.mockReset();
  sessionStorage.clear();
});

const doc: StudioDocument = {
  id: "pagi",
  title: "Pagi di Kota",
  version: 1,
  updatedAt: 0,
  wordCount: 0,
  content: { type: "doc" },
};

function library() {
  return {
    listSummaries: vi.fn(async () => [doc]),
    listFolders: vi.fn(async () => [{ id: "f", name: "Pagi di Senja", createdAt: 0 }]),
    get: vi.fn(async () => doc as StudioDocument | null),
  } satisfies Pick<DocumentStore, "listSummaries" | "listFolders" | "get">;
}

function renderSearch(store = library(), beforeNavigate?: () => Promise<boolean>) {
  function Screen() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Cari
        </button>
        {open && (
          <StudioSearchDialog
            onClose={() => setOpen(false)}
            beforeNavigate={beforeNavigate}
            store={store}
          />
        )}
      </>
    );
  }
  render(<Screen />);
  const trigger = screen.getByRole("button", { name: "Cari" });
  trigger.focus();
  fireEvent.click(trigger);
  return { input: screen.getByRole("combobox"), trigger };
}

describe("StudioSearchDialog", () => {
  it("closes on the first Escape with a query and restores the opener", async () => {
    const { input, trigger } = renderSearch();
    input.focus();
    fireEvent.change(input, { target: { value: "pagi" } });
    await screen.findAllByRole("option");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("opens a folder by keyboard and removes the dialog before pushing the destination", async () => {
    const store = library();
    const { input } = renderSearch(store);
    let dialogClosedAtPush = false;
    push.mockImplementation(() => {
      dialogClosedAtPush = screen.queryByRole("dialog") === null;
    });
    fireEvent.change(input, { target: { value: "pagi" } });
    const options = await screen.findAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual([
      "Pagi di KotaDokumen",
      "Pagi di SenjaFolder",
    ]);
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(store.get).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-activedescendant")).toBe(options[1].id);
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(push).toHaveBeenCalledWith("/studio?folder=f"));
    expect(dialogClosedAtPush).toBe(true);
  });

  it("leaves the writer in place when saving the current editor fails", async () => {
    const store = library();
    const save = vi.fn(async () => false);
    const { input, trigger } = renderSearch(store, save);
    fireEvent.change(input, { target: { value: "kota" } });
    fireEvent.click(await screen.findByRole("option", { name: /Pagi di Kota/ }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(save).toHaveBeenCalledOnce();
    expect(store.get).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger);
  });

  it("rejects a stale result that was moved to Sampah before selection", async () => {
    const store = library();
    const { input } = renderSearch(store);
    fireEvent.change(input, { target: { value: "kota" } });
    const option = await screen.findByRole("option", { name: /Pagi di Kota/ });
    store.get.mockResolvedValue({ ...doc, deletedAt: 1 });
    store.listSummaries.mockResolvedValue([{ ...doc, deletedAt: 1 }]);
    fireEvent.click(option);
    expect((await screen.findByRole("alert")).textContent).toContain("sudah tidak tersedia");
    expect(await screen.findByText("Tidak ada dokumen atau folder yang cocok.")).toBeTruthy();
    expect(push).not.toHaveBeenCalled();
  });

  it("retries a failed library read and shows the results for the existing query", async () => {
    const store = library();
    store.listSummaries.mockRejectedValueOnce(new Error("blocked"));
    const { input } = renderSearch(store);
    fireEvent.change(input, { target: { value: "kota" } });
    fireEvent.click(await screen.findByRole("button", { name: "Coba lagi" }));
    expect(await screen.findByRole("option", { name: /Pagi di Kota/ })).toBeTruthy();
  });
});
