import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AccountMenu } from "@/features/app-shell/account-menu";
import { installDialogShim } from "@/test/dialog-shim";

installDialogShim();

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), usePathname: () => "/beranda" }));

afterEach(() => {
  cleanup();
  push.mockClear();
});

describe("AccountMenu", () => {
  it("offers own profile, Tersimpan, account settings, and reporting a problem from the avatar", () => {
    render(<AccountMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Menu akun" }));
    const items = screen.getAllByRole("menuitem").map((n) => n.textContent);
    expect(items).toEqual(["Profil saya", "Tersimpan", "Pengaturan akun", "Laporkan masalah"]);
  });

  it("adds Kelola for role holders only", () => {
    sessionStorage.setItem("rm-roles", "editor");
    render(<AccountMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Menu akun" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Kelola" }));
    expect(push).toHaveBeenCalledWith("/kelola");
    sessionStorage.removeItem("rm-roles");
  });

  it("opens the chosen destination", () => {
    render(<AccountMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Menu akun" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Tersimpan" }));
    expect(push).toHaveBeenCalledWith("/tersimpan");
  });

  it("opens the problem report form instead of leaving the page", () => {
    render(<AccountMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Menu akun" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Laporkan masalah" }));
    expect(screen.getByRole("dialog", { name: "Laporkan masalah" })).toBeTruthy();
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.queryByRole("dialog", { name: "Laporkan masalah" })).toBeNull();
  });
});
