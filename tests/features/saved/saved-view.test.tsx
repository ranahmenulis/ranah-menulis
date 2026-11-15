import { cleanup, configure, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import { installDialogShim } from "@/test/dialog-shim";
import { createMemoryPostStore } from "@/features/community/storage/memory-store";
import { mark, type PostStore } from "@/features/community/storage/post-store";
import { SavedView } from "@/features/saved/saved-view";

const holder = vi.hoisted(() => ({ store: null as unknown as PostStore }));
vi.mock("@/features/community/storage/store", () => ({
  get postStore() {
    return holder.store;
  },
}));

installDialogShim();
configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  sessionStorage.clear();
  holder.store = createMemoryPostStore();
});
afterEach(cleanup);

const renderView = () =>
  render(
    <ToastProvider>
      <SavedView />
    </ToastProvider>,
  );

describe("SavedView", () => {
  it("says there is nothing yet and points to Jelajahi", async () => {
    renderView();
    expect(await screen.findByText("Belum ada tulisan yang kamu simpan.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Buka Jelajahi" }).getAttribute("href")).toBe(
      "/jelajahi",
    );
  });

  it("tells the reader the list is private", async () => {
    renderView();
    await screen.findByText("Belum ada tulisan yang kamu simpan.");
    expect(screen.getByText("Hanya kamu yang bisa melihat daftar ini.")).toBeTruthy();
  });

  it("lists the saved posts, with their count", async () => {
    await holder.store.setMark(mark.saved("toples-kerupuk"), true);
    await holder.store.setMark(mark.saved("sepeda-bapak"), true);
    renderView();
    expect(await screen.findAllByRole("article")).toHaveLength(2);
    expect(screen.getByText(/2 tulisan/)).toBeTruthy();
    expect(screen.queryByText("Belum ada tulisan yang kamu simpan.")).toBeNull();
  });

  it("keeps a post on the page after it is taken off, so a slip can be undone", async () => {
    await holder.store.setMark(mark.saved("toples-kerupuk"), true);
    renderView();
    const article = (await screen.findAllByRole("article"))[0];
    const button = within(article).getByRole("button", { name: "Simpan" });
    expect(button.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(button);
    expect(await screen.findByText("Hanya kamu yang bisa melihat daftar ini.")).toBeTruthy();
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(
      within(screen.getByRole("article"))
        .getByRole("button", { name: "Simpan" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
    expect(screen.queryByText(/tulisan ·/)).toBeNull();

    fireEvent.click(within(screen.getByRole("article")).getByRole("button", { name: "Simpan" }));
    expect(
      within(screen.getByRole("article"))
        .getByRole("button", { name: "Simpan" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("shows a saved post that no longer exists as unavailable and lets it be removed", async () => {
    await holder.store.setMark(mark.saved("sudah-ditarik"), true);
    renderView();
    expect(await screen.findByText("Tulisan ini sudah tidak tersedia.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Hapus dari Tersimpan" }));
    expect(screen.queryByText("Tulisan ini sudah tidak tersedia.")).toBeNull();
    expect(await holder.store.listMarks()).toMatchObject({ [mark.saved("sudah-ditarik")]: false });
  });

  it("asks a signed-out reader to sign in", () => {
    sessionStorage.setItem("rm-viewer", "tamu");
    renderView();
    expect(screen.getByText("Masuk untuk melihat tulisan yang kamu simpan.")).toBeTruthy();
    expect(screen.queryByRole("article")).toBeNull();
  });
});
