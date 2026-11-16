import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseAccount, resetAccount } from "@/features/account/account-store";
import { SignUpForm } from "@/features/account/components/sign-up-form";

const nav = vi.hoisted(() => ({ push: vi.fn(), search: "" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  useSearchParams: () => new URLSearchParams(nav.search),
}));

beforeEach(() => {
  nav.push.mockReset();
  nav.search = "";
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  resetAccount();
});

function fill(email: string, password: string, agree = true) {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Kata sandi"), { target: { value: password } });
  const box = screen.getByRole("checkbox") as HTMLInputElement;
  if (box.checked !== agree) fireEvent.click(box);
  fireEvent.click(screen.getByRole("button", { name: "Daftar" }));
}

describe("SignUpForm", () => {
  it("shows the password rule before anything is typed", () => {
    render(<SignUpForm />);
    expect(screen.getByText("Minimal 8 karakter, dengan huruf dan angka.")).toBeTruthy();
  });

  it("rejects a weak password and a missing agreement, together", () => {
    render(<SignUpForm />);
    fill("baru@contoh.id", "pendek", false);
    expect(screen.getByText("Kata sandi minimal 8 karakter.")).toBeTruthy();
    expect(screen.getByText("Setujui ketentuan untuk melanjutkan.")).toBeTruthy();
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("asks for a letter and a number", () => {
    render(<SignUpForm />);
    fill("baru@contoh.id", "sembilanhuruf");
    expect(screen.getByText("Pakai minimal satu huruf dan satu angka.")).toBeTruthy();
  });

  it("says the email is registered and offers to sign in with it", () => {
    nav.search = "lanjut=%2Fstudio";
    render(<SignUpForm />);
    fill("terdaftar@contoh.id", "rahasia123");
    expect(screen.getByText(/Email ini sudah terdaftar/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Masuk dengan email ini" }).getAttribute("href")).toBe(
      "/masuk?lanjut=%2Fstudio",
    );
    expect(nav.push).not.toHaveBeenCalled();
    // Typing another address takes the message away.
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "lain@contoh.id" } });
    expect(screen.queryByText(/Email ini sudah terdaftar/)).toBeNull();
  });

  it("starts an empty account and goes to email verification", () => {
    render(<SignUpForm />);
    fill("  baru@contoh.id ", "rahasia123");
    expect(nav.push).toHaveBeenCalledWith("/verifikasi");
    const account = parseAccount(localStorage.getItem("ranah.account"));
    expect(account.email).toBe("baru@contoh.id");
    expect(account.profile.name).toBe("");
    expect(account.profile.username).toBe("");
    expect(account.profile.genres).toEqual([]);
    expect(Number.isNaN(Date.parse(account.memberSince))).toBe(false);
  });

  it("keeps the destination through verification", () => {
    nav.search = "lanjut=%2Fprojects";
    render(<SignUpForm />);
    fill("baru@contoh.id", "rahasia123");
    expect(nav.push).toHaveBeenCalledWith("/verifikasi?lanjut=%2Fprojects");
  });

  it("offers no role: signing up is always for an ordinary account", () => {
    render(<SignUpForm />);
    expect(screen.queryByText(/admin|editor|juri|peran/i)).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
  });
});
