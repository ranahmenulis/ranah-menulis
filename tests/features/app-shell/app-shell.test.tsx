import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { installDialogShim } from "@/test/dialog-shim";

const pathname = vi.hoisted(() => ({ value: "/studio" }));
vi.mock("next/navigation", () => ({
  usePathname: () => pathname.value,
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

import { AppShell } from "@/features/app-shell/app-shell";

beforeAll(installDialogShim);
afterEach(() => {
  cleanup();
  sessionStorage.clear();
});

function renderAt(path: string) {
  pathname.value = path;
  return render(
    <AppShell>
      <p>isi halaman</p>
    </AppShell>,
  );
}

const current = () =>
  screen
    .getAllByRole("link")
    .filter((a) => a.getAttribute("aria-current") === "page")
    .map((a) => a.textContent);

describe("AppShell", () => {
  it.each(["/studio", "/studio/streak", "/studio/statistik"])(
    "opens Studio search with the shortcut on %s",
    async (path) => {
      renderAt(path);
      expect(screen.getByRole("button", { name: "Cari di Studio" })).toBeTruthy();
      fireEvent.keyDown(window, { key: "k", ctrlKey: true });
      expect(await screen.findByRole("dialog", { name: "Cari di Studio" })).toBeTruthy();
    },
  );

  it("does not register Studio search on Beranda or in the guest frame", () => {
    renderAt("/beranda");
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(screen.queryByRole("dialog", { name: "Cari di Studio" })).toBeNull();
    cleanup();
    sessionStorage.setItem("rm-viewer", "tamu");
    renderAt("/studio");
    expect(screen.queryByRole("button", { name: "Cari di Studio" })).toBeNull();
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(screen.queryByRole("dialog", { name: "Cari di Studio" })).toBeNull();
  });

  it("renders the page inside a main landmark", () => {
    renderAt("/beranda");
    expect(within(screen.getByRole("main")).getByText("isi halaman")).toBeTruthy();
  });

  it("marks only Studio as current on the document list, in every navigation", () => {
    renderAt("/studio");
    expect(new Set(current())).toEqual(new Set(["Studio"]));
  });

  it("marks Streak on the Streak tab: sub-item in the sidebar, own tab on phones, Studio on the rail", () => {
    renderAt("/studio/streak");
    const [sidebar, rail, bottom] = screen.getAllByRole("navigation", { hidden: true });
    const currentIn = (nav: HTMLElement) =>
      within(nav)
        .getAllByRole("link", { hidden: true })
        .filter((a) => a.getAttribute("aria-current") === "page")
        .map((a) => a.textContent);

    expect(currentIn(sidebar)).toEqual(["Streak"]);
    expect(currentIn(rail)).toEqual(["Studio"]); // the rail has no Streak entry
    expect(currentIn(bottom)).toEqual(["Streak"]);
  });

  it("shows the round write button on Beranda and the list, but not on Streak", () => {
    renderAt("/beranda");
    expect(screen.queryByRole("link", { name: "Tulis dokumen baru" })).not.toBeNull();
    cleanup();
    renderAt("/studio/streak");
    expect(screen.queryByRole("link", { name: "Tulis dokumen baru" })).toBeNull();
  });

  it("links Projects to its catalog and marks it current there", () => {
    renderAt("/beranda");
    const projects = screen.getAllByText("Projects");
    expect(projects.every((el) => el.closest("a")?.getAttribute("href") === "/projects")).toBe(
      true,
    );
    cleanup();
    renderAt("/projects/lomba-cerpen-hujan-2026");
    expect(new Set(current().filter(Boolean))).toEqual(new Set(["Projects"]));
  });

  it("marks Jelajahi as current on its page", () => {
    renderAt("/jelajahi");
    // The phone search icon (no text) is also current: it is how phones reach Jelajahi.
    expect(new Set(current().filter(Boolean))).toEqual(new Set(["Jelajahi"]));
  });

  it("drops the phone bottom bar on a post page, where the post brings its own action bar", () => {
    renderAt("/postingan/toples-kerupuk");
    expect(screen.getAllByRole("navigation", { hidden: true })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Kembali", hidden: true })).toHaveLength(1);
  });

  it("announces unread notifications on the bell, which opens Notifikasi", () => {
    localStorage.clear();
    renderAt("/beranda");
    const bell = screen.getByRole("link", { name: "Notifikasi, 3 belum dibaca" });
    expect(bell.getAttribute("href")).toBe("/notifikasi");
    expect(bell.getAttribute("aria-current")).toBeNull();
  });

  it("drops the unread count from the bell once everything is read", () => {
    localStorage.setItem(
      "ranah.notificationsRead",
      JSON.stringify(["n-balasan-nur", "n-balasan-maya", "n-apresiasi", "n-revisi"]),
    );
    renderAt("/beranda");
    expect(screen.getByRole("link", { name: "Notifikasi" })).toBeTruthy();
    localStorage.clear();
  });

  it("marks the bell as current on Notifikasi and Tersimpan as current in the navigation", () => {
    localStorage.clear();
    renderAt("/notifikasi");
    expect(
      screen.getByRole("link", { name: "Notifikasi, 3 belum dibaca" }).getAttribute("aria-current"),
    ).toBe("page");
    cleanup();

    renderAt("/tersimpan");
    expect(new Set(current().filter(Boolean))).toEqual(new Set(["Tersimpan"]));
  });

  it("adds Kelola, and the phone menu, only for someone who holds a management role", () => {
    renderAt("/beranda");
    expect(screen.queryByText("Kelola")).toBeNull();
    expect(screen.queryByRole("button", { name: "Buka menu kelola" })).toBeNull();
    cleanup();

    sessionStorage.setItem("rm-roles", "editor");
    renderAt("/kelola");
    const kelola = screen.getAllByText("Kelola").map((el) => el.closest("a"));
    expect(kelola.filter(Boolean).every((a) => a?.getAttribute("href") === "/kelola")).toBe(true);
    expect(screen.getByRole("button", { name: "Buka menu kelola" })).toBeTruthy();
  });
});
