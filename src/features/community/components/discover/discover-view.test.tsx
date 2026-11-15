import { cleanup, configure, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import { installDialogShim } from "@/test/dialog-shim";
import { PAGE_SIZE } from "../../categories";
import { createMemoryPostStore } from "../../storage/memory-store";
import type { PostStore, StoredPost } from "../../storage/post-store";
import { DiscoverView } from "./discover-view";

const holder = vi.hoisted(() => ({ store: null as unknown as PostStore }));
vi.mock("../../storage/store", () => ({
  get postStore() {
    return holder.store;
  },
}));

installDialogShim();
// Several jsdom files run at once; the editor and stores can be slow to settle under load.
configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  sessionStorage.clear();
  holder.store = createMemoryPostStore();
});
afterEach(cleanup);

const tiles = () => screen.getAllByRole("article");
const renderView = () =>
  render(
    <ToastProvider>
      <DiscoverView />
    </ToastProvider>,
  );

describe("DiscoverView", () => {
  it("opens on Semua with that chip pressed and the other categories after it", async () => {
    renderView();
    await screen.findAllByRole("article");
    const chips = within(screen.getByRole("toolbar", { name: "Kategori" })).getAllByRole("button");
    expect(chips[0].textContent).toBe("Semua");
    expect(chips[0].getAttribute("aria-pressed")).toBe("true");
    expect(chips.filter((c) => c.getAttribute("aria-pressed") === "true")).toHaveLength(1);
    expect(chips.map((c) => c.textContent)).toContain("Trending Today");
  });

  it("shows one page and loads the next only on request, then says it is the end", async () => {
    renderView();
    await screen.findAllByRole("article");
    expect(tiles()).toHaveLength(PAGE_SIZE);

    fireEvent.click(screen.getByRole("button", { name: "Muat lebih banyak" }));
    expect(tiles().length).toBeGreaterThan(PAGE_SIZE);
    expect(screen.queryByRole("button", { name: "Muat lebih banyak" })).toBeNull();
    expect(screen.getByText("Itu semua tulisan di kategori ini.")).toBeTruthy();
  });

  it("switches category and starts from the first page of it", async () => {
    renderView();
    await screen.findAllByRole("article");
    fireEvent.click(screen.getByRole("button", { name: "Malaysia Writers" }));
    expect(screen.getByText(/negara di profilnya Malaysia/)).toBeTruthy();
    for (const tile of tiles()) {
      expect(
        within(tile).getByText(/Kuala Lumpur|Pulau Pinang|Johor Bahru|Kota Bharu/),
      ).toBeTruthy();
    }
  });

  it("never shows a group post", async () => {
    renderView();
    await screen.findAllByRole("article");
    fireEvent.click(screen.getByRole("button", { name: "Muat lebih banyak" }));
    expect(screen.queryByText("Garam dan Pelabuhan")).toBeNull();
  });

  it("puts a post published here first and links the tile to its page", async () => {
    const mine: StoredPost = {
      id: "baru-saja",
      status: "published",
      title: "Lampu Tempel",
      kind: "prolog",
      genre: "Cerpen",
      blocks: [{ type: "paragraph", text: "Listrik baru masuk ke kampung kami." }],
      sourceTitle: null,
      sourceDocId: null,
      visibility: "publik",
      updatedAt: Date.now(),
      publishedAt: Date.now(),
    };
    await holder.store.putPost(mine);
    renderView();
    await screen.findAllByRole("article");
    const first = tiles()[0];
    expect(within(first).getByRole("link").getAttribute("href")).toBe("/postingan/baru-saja");
  });

  it("saves a post from its tile and remembers it", async () => {
    renderView();
    await screen.findAllByRole("article");
    fireEvent.click(within(tiles()[0]).getByRole("button", { name: "Simpan" }));
    expect(
      await within(tiles()[0]).findByRole("button", { name: "Hapus dari Tersimpan" }),
    ).toBeTruthy();
    const marks = await holder.store.listMarks();
    expect(Object.keys(marks).some((k) => k.startsWith("sv:") && marks[k])).toBe(true);
  });

  it("asks a signed-out reader to sign in instead of saving", async () => {
    sessionStorage.setItem("rm-viewer", "tamu");
    renderView();
    await screen.findAllByRole("article");
    expect(screen.queryByRole("link", { name: /Tulis postingan/ })).toBeNull();
    fireEvent.click(within(tiles()[0]).getByRole("button", { name: "Simpan" }));
    await screen.findByRole("dialog", { name: "Masuk untuk menyimpan tulisan" });
    expect(await holder.store.listMarks()).toEqual({});
  });
});
