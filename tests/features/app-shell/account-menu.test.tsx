import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AccountMenu } from "@/features/app-shell/account-menu";

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

afterEach(() => {
  cleanup();
  push.mockClear();
});

describe("AccountMenu", () => {
  it("offers own profile, Tersimpan, and account settings from the avatar", () => {
    render(<AccountMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Menu akun" }));
    const items = screen.getAllByRole("menuitem").map((n) => n.textContent);
    expect(items).toEqual(["Profil saya", "Tersimpan", "Pengaturan akun"]);
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
});
