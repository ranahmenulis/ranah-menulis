import { cleanup, configure, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NotificationList } from "@/features/notifications/notification-list";
import { NotificationsView } from "@/features/notifications/notifications-view";

// Several jsdom files run at once; the time label appears after mount and can be slow under load.
configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
afterEach(cleanup);

const rows = () => within(screen.getByRole("list")).getAllByRole("listitem");
const readIds = () => JSON.parse(localStorage.getItem("ranah.notificationsRead") ?? "[]");

describe("NotificationsView", () => {
  it("lists every notification with how many are unread", async () => {
    render(<NotificationsView />);
    expect(rows()).toHaveLength(6);
    expect(screen.getByText("3 belum dibaca.")).toBeTruthy();
    expect(await screen.findByText("25 menit lalu")).toBeTruthy();
  });

  it("marks unread lines for screen readers, and only those", () => {
    render(<NotificationsView />);
    expect(
      screen.getAllByText("Belum dibaca.", { selector: ".sr-only", exact: false }),
    ).toHaveLength(3);
  });

  it("filters by tab", () => {
    render(<NotificationsView />);
    fireEvent.click(screen.getByRole("tab", { name: "Komentar" }));
    expect(rows()).toHaveLength(3);
    fireEvent.click(screen.getByRole("tab", { name: "Proyek" }));
    expect(rows()).toHaveLength(1);
    fireEvent.click(screen.getByRole("tab", { name: "Semua" }));
    expect(rows()).toHaveLength(6);
  });

  it("links a line to its post and still marks it read", () => {
    render(<NotificationsView />);
    const link = screen.getByRole("link", { name: /membalas komentarmu di “Hujan Pertama/ });
    expect(link.getAttribute("href")).toBe("/postingan/hujan-pertama-bulan-november");
    link.addEventListener("click", (e) => e.preventDefault()); // jsdom cannot navigate
    fireEvent.click(link);
    expect(readIds()).toContain("n-balasan-maya");
  });

  it("marks everything read at once and disables the button after", () => {
    render(<NotificationsView />);
    const all = screen.getByRole("button", { name: "Tandai semua dibaca" });
    fireEvent.click(all);
    expect(screen.getByText("Semua sudah dibaca.")).toBeTruthy();
    expect((all as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByText("Belum dibaca.", { selector: ".sr-only", exact: false })).toBeNull();
  });

  it("starts from what this device already read", () => {
    localStorage.setItem("ranah.notificationsRead", JSON.stringify(["n-balasan-nur"]));
    render(<NotificationsView />);
    expect(screen.getByText("2 belum dibaca.")).toBeTruthy();
  });

  it("asks a signed-out reader to sign in instead of listing anything", () => {
    sessionStorage.setItem("rm-viewer", "tamu");
    render(<NotificationsView />);
    expect(screen.getByText("Masuk untuk melihat notifikasimu.")).toBeTruthy();
    expect(screen.queryByRole("list")).toBeNull();
  });
});

describe("NotificationList", () => {
  it("says so in one sentence and offers a way out when there is nothing", () => {
    render(<NotificationList items={[]} now={0} onOpen={() => {}} />);
    expect(screen.getByText("Belum ada notifikasi di sini.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Ke Beranda" }).getAttribute("href")).toBe("/beranda");
  });
});
