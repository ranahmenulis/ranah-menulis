import { cleanup, configure, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import { installDialogShim } from "@/test/dialog-shim";
import { PAGE_SIZE } from "@/features/community/categories";
import { createMemoryPostStore } from "@/features/community/storage/memory-store";
import type { PostStore, StoredPost } from "@/features/community/storage/post-store";
import { DiscoverView } from "@/features/community/components/discover/discover-view";

const holder = vi.hoisted(() => ({ store: null as unknown as PostStore }));
vi.mock("@/features/community/storage/store", () => ({
  get postStore() {
    return holder.store;
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/jelajahi",
  useSearchParams: () => new URLSearchParams(),
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
  it("hides the category chips for now and lists every public post", async () => {
    renderView();
    await screen.findAllByRole("article");
    expect(screen.queryByRole("toolbar", { name: "Kategori" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Trending Today" })).toBeNull();
  });

  it("opens Tulisan, Event and Lingkar Menulis as three tabs of Community", async () => {
    renderView();
    await screen.findAllByRole("article");
    const tabs = within(screen.getByRole("navigation", { name: "Bagian Community" }));
    expect(tabs.getByRole("link", { name: "Tulisan" }).getAttribute("aria-current")).toBe("page");
    expect(tabs.getByRole("link", { name: "Event" }).getAttribute("href")).toBe("/event");
    expect(tabs.getByRole("link", { name: "Lingkar Menulis" }).getAttribute("href")).toBe("/grup");
  });

  it("leads with a hero: the title, new writing this week, and your own figures", async () => {
    renderView();
    await screen.findAllByRole("article");
    expect(screen.getByRole("heading", { level: 1, name: "Community" })).toBeTruthy();
    expect(screen.getByText("tulisan baru dalam 7 hari")).toBeTruthy();
    expect(screen.getByRole("link", { name: /^Tersimpan: \d+$/ }).getAttribute("href")).toBe(
      "/tersimpan",
    );
  });

  it("shows one page and loads the next only on request, then says it is the end", async () => {
    renderView();
    await screen.findAllByRole("article");
    expect(tiles()).toHaveLength(PAGE_SIZE);

    fireEvent.click(screen.getByRole("button", { name: "Muat lebih banyak" }));
    expect(tiles().length).toBeGreaterThan(PAGE_SIZE);
    expect(screen.queryByRole("button", { name: "Muat lebih banyak" })).toBeNull();
    expect(screen.getByText("Itu semua tulisan.")).toBeTruthy();
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
    const hrefs = within(first)
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("/postingan/baru-saja");
    expect(hrefs).toContain("/penulis/rinjaniputri"); // the author's name opens the profile
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
