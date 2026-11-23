import { cleanup, configure, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import { installDialogShim } from "@/test/dialog-shim";
import { createMemoryPostStore } from "@/features/community/storage/memory-store";
import type { PostStore } from "@/features/community/storage/post-store";
import { WorksEmpty } from "@/features/profile/components/profile-tabs-content";
import { ProfileView } from "@/features/profile/components/profile-view";

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

const renderProfile = (handle: string) =>
  render(
    <ToastProvider>
      <ProfileView handle={handle} />
    </ToastProvider>,
  );

describe("ProfileView, another author", () => {
  it("shows the name as the page heading with the username under it", async () => {
    renderProfile("hafizrahman");
    expect((await screen.findByRole("heading", { level: 1 })).textContent).toBe("Hafiz Rahman");
    expect(screen.getByText("@hafizrahman")).toBeTruthy();
  });

  it("lists only Publik posts on Karya, not the group post", async () => {
    renderProfile("hafizrahman");
    const items = await screen.findAllByRole("article");
    expect(items).toHaveLength(1);
    expect(screen.queryByText("Garam dan Pelabuhan")).toBeNull();
  });

  it("counts followers with the reader included, and updates when following is toggled", async () => {
    renderProfile("hafizrahman");
    const button = await screen.findByRole("button", { name: "Mengikuti" });
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("413")).toBeTruthy();

    fireEvent.click(button);
    expect(await screen.findByRole("button", { name: "Ikuti" })).toBeTruthy();
    expect(screen.getByText("412")).toBeTruthy();
  });

  it("shows where from, and a streak only for authors who share it", async () => {
    renderProfile("ainasofea");
    expect(await screen.findByText("Kuala Lumpur, Malaysia")).toBeTruthy();
    expect(screen.getByText("Streak 45 hari")).toBeTruthy();
    cleanup();

    renderProfile("nuraisyah");
    await screen.findByText("Indonesia");
    expect(screen.queryByText(/^Streak/)).toBeNull();
  });

  it("switches between Karya, Tentang, and Proyek", async () => {
    renderProfile("hafizrahman");
    await screen.findAllByRole("article");

    fireEvent.click(screen.getByRole("tab", { name: "Tentang" }));
    expect(screen.getByText("Nama pengguna")).toBeTruthy();
    expect(screen.queryByRole("article")).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "Proyek" }));
    expect(screen.getByText("Belum ada proyek yang ditampilkan.")).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: "Karya" }));
    expect(screen.getAllByRole("article")).toHaveLength(1);
  });

  it("asks a signed-out reader to sign in before following", async () => {
    sessionStorage.setItem("rm-viewer", "tamu");
    renderProfile("hafizrahman");
    fireEvent.click(await screen.findByRole("button", { name: "Mengikuti" }));
    expect(await screen.findByText("Masuk untuk mengikuti Hafiz Rahman")).toBeTruthy();
  });
});

describe("ProfileView, your own", () => {
  it("has no Ikuti, links to editing in Settings, and links to Tersimpan for phones", async () => {
    renderProfile("rinjaniputri");
    await screen.findByRole("heading", { level: 1, name: "Rinjani Putri" });
    expect(screen.queryByRole("button", { name: /Ikuti|Mengikuti/ })).toBeNull();
    expect(screen.getByRole("link", { name: "Ubah profil" }).getAttribute("href")).toBe(
      "/pengaturan",
    );
    const hero = screen.getByRole("heading", { level: 1 }).closest("header") as HTMLElement;
    expect(within(hero).getByRole("link", { name: "Tersimpan" }).getAttribute("href")).toBe(
      "/tersimpan",
    );
  });

  it("counts who you follow from your own choices", async () => {
    renderProfile("rinjaniputri");
    const hero = (await screen.findByRole("heading", { level: 1 })).closest(
      "header",
    ) as HTMLElement;
    const following = within(hero).getByText("mengikuti").parentElement as HTMLElement;
    expect(within(following).getByText("4")).toBeTruthy();
  });

  it("lists your own Publik post on Karya", async () => {
    renderProfile("rinjaniputri");
    const items = await screen.findAllByRole("article");
    expect(items).toHaveLength(1);
    expect(
      within(items[0]).getByRole("link", { name: "Hujan Pertama Bulan November" }),
    ).toBeTruthy();
  });

  it("says nothing is public yet, and offers to write, when you have no Publik post", () => {
    render(<WorksEmpty own />);
    expect(screen.getByText("Kamu belum membagikan tulisan secara publik.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Tulis postingan" }).getAttribute("href")).toBe(
      "/tulis",
    );
  });

  it("tells you what the public profile shows", async () => {
    renderProfile("rinjaniputri");
    await screen.findByRole("heading", { level: 1 });
    fireEvent.click(screen.getByRole("tab", { name: "Tentang" }));
    expect(screen.getByText(/hanya tulisanmu yang berstatus Publik/)).toBeTruthy();
  });
});

describe("ProfileView, states", () => {
  it("finds a profile whatever the case of the username in the address", async () => {
    renderProfile("HafizRahman");
    expect((await screen.findByRole("heading", { level: 1 })).textContent).toBe("Hafiz Rahman");
  });

  it("says the author is not found for an unknown username", () => {
    renderProfile("tidak-ada");
    expect(screen.getByText("Penulis ini tidak ditemukan.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Kembali ke Beranda" }).getAttribute("href")).toBe(
      "/beranda",
    );
  });

  it("shows a retryable error when the posts cannot be read", async () => {
    holder.store = {
      ...createMemoryPostStore(),
      listPosts: () => Promise.reject(new Error("storage unavailable")),
    };
    renderProfile("hafizrahman");
    expect(await screen.findByText(/Profil ini gagal dimuat/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Coba lagi" })).toBeTruthy();
  });

  it("says so plainly, without a button, when another author has nothing public", () => {
    render(<WorksEmpty own={false} />);
    expect(screen.getByText("Belum ada tulisan publik di sini.")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
