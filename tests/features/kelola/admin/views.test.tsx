import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
  useRouter: () => ({ push: vi.fn() }),
}));

import { UserView } from "@/features/kelola/admin/components/user-view";
import { UsersView } from "@/features/kelola/admin/components/users-view";
import { roleGrants, suspensions } from "@/features/kelola/admin/role-store";
import { auditLog } from "@/features/kelola/audit/audit-log";
import { staffAssignments } from "@/features/kelola/staff-assignments";
import { installDialogShim } from "@/test/dialog-shim";

installDialogShim();

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  roleGrants.reset();
  suspensions.reset();
  auditLog.reset();
  staffAssignments.reset();
  window.history.replaceState(null, "", "/kelola/admin");
});
afterEach(cleanup);

describe("users list", () => {
  it("lists the people with their roles and narrows by name and by role", () => {
    render(<UsersView />);
    const list = screen.getByRole("list", { name: "Pengguna" });
    expect(within(list).getAllByRole("listitem").length).toBeGreaterThan(8);
    expect(within(list).getByText(/Super Admin/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Cari pengguna"), { target: { value: "hafiz" } });
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    expect(window.location.search).toBe("?q=hafiz");
    fireEvent.change(screen.getByLabelText("Cari pengguna"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Juri" }));
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    expect(window.location.search).toBe("?peran=juri");
  });

  it("says when nobody matches", () => {
    render(<UsersView />);
    fireEvent.change(screen.getByLabelText("Cari pengguna"), { target: { value: "zzz" } });
    expect(screen.getByText("Tidak ada pengguna yang cocok.")).toBeTruthy();
  });
});

describe("one person", () => {
  it("says so for an unknown person, with a way out", () => {
    render(<UserView id="tidak-ada" />);
    expect(screen.getByText("Pengguna ini tidak ditemukan.")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Semua pengguna/ }).getAttribute("href")).toBe(
      "/kelola/admin",
    );
  });

  it("gives a role through the dialog and says so in the status line", async () => {
    sessionStorage.setItem("rm-roles", "administrator");
    render(<UserView id="laras" />);
    fireEvent.click(screen.getByRole("button", { name: "Beri role Editor" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Beri role" }));
    expect(await screen.findByText("Laras kini Editor.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cabut role Editor" })).toBeTruthy();
    expect(roleGrants.read().some((g) => g.userId === "laras")).toBe(true);
    expect(screen.getByText(/memberi role Editor kepada Laras/)).toBeTruthy();
  });

  it("keeps the dialog open when a required reason is empty", async () => {
    sessionStorage.setItem("rm-roles", "administrator");
    render(<UserView id="hafiz-rahman" />);
    fireEvent.click(screen.getByRole("button", { name: "Cabut role Editor" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cabut role" }));
    expect(within(dialog).getByText("Tulis alasannya. Alasan tercatat di log.")).toBeTruthy();
    expect(roleGrants.read().some((g) => g.userId === "hafiz-rahman")).toBe(true);
  });

  it("offers the Administrator tier to a Super Admin only", () => {
    sessionStorage.setItem("rm-roles", "administrator");
    const { unmount } = render(<UserView id="laras" />);
    expect(screen.queryByRole("button", { name: "Beri role Administrator" })).toBeNull();
    expect(screen.getAllByText("Hanya Super Admin").length).toBeGreaterThan(0);
    unmount();
    sessionStorage.setItem("rm-roles", "super-admin");
    render(<UserView id="laras" />);
    expect(screen.getByRole("button", { name: "Beri role Administrator" })).toBeTruthy();
  });

  it("shows the last Super Admin as untouchable", () => {
    sessionStorage.setItem("rm-roles", "super-admin");
    render(<UserView id="nur-aisyah" />);
    expect(screen.queryByRole("button", { name: "Cabut role Super Admin" })).toBeNull();
    expect(screen.getAllByText("Super Admin terakhir").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Tangguhkan akun" })).toBeNull();
  });

  it("suspends and restores an account", async () => {
    sessionStorage.setItem("rm-roles", "administrator");
    render(<UserView id="dimas-pratama" />);
    fireEvent.click(screen.getByRole("button", { name: "Tangguhkan akun" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Alasan"), { target: { value: "Uji" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Tangguhkan" }));
    expect(await screen.findByText("Akun Dimas Pratama ditangguhkan.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Pulihkan akun" })).toBeTruthy();
  });
});
