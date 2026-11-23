import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
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
  sessionStorage.clear();
});
afterEach(() => {
  cleanup();
  resetAccount();
});

/** Focus moves on the next animation frame; let it run. */
async function frame() {
  await act(() => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined))));
}

function enterEmail(email: string) {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.click(screen.getByRole("button", { name: "Lanjutkan" }));
}

function finish(password: string, agree = true) {
  fireEvent.change(screen.getByLabelText("Kata sandi"), { target: { value: password } });
  const box = screen.getByRole("checkbox") as HTMLInputElement;
  if (box.checked !== agree) fireEvent.click(box);
  fireEvent.click(screen.getByRole("button", { name: "Daftar" }));
}

describe("SignUpForm", () => {
  it("starts with Google or an email, step 1 of 2, without asking for a password yet", () => {
    render(<SignUpForm />);
    expect(screen.getByText("Langkah 1 dari 2")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Daftar dengan Google" })).toBeTruthy();
    expect(screen.queryByLabelText("Kata sandi")).toBeNull();
  });

  it("checks the email before moving on", () => {
    render(<SignUpForm />);
    enterEmail("bukan-email");
    expect(screen.getByText(/Tulis email dengan benar/)).toBeTruthy();
    expect(screen.queryByLabelText("Kata sandi")).toBeNull();
    expect(document.activeElement).toBe(screen.getByLabelText("Email"));
  });

  it("says the email is registered at the first step and offers to sign in with it", () => {
    nav.search = "lanjut=%2Fstudio";
    render(<SignUpForm />);
    enterEmail("terdaftar@contoh.id");
    expect(screen.getByText(/Email ini sudah terdaftar/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Masuk dengan email ini" }).getAttribute("href")).toBe(
      "/masuk?lanjut=%2Fstudio",
    );
    expect(screen.queryByLabelText("Kata sandi")).toBeNull();
    // Typing another address takes the message away.
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "lain@contoh.id" } });
    expect(screen.queryByText(/Email ini sudah terdaftar/)).toBeNull();
  });

  it("moves to the password step, names the email, and puts focus on the password", async () => {
    render(<SignUpForm />);
    enterEmail("baru@contoh.id");
    await frame();
    expect(screen.getByText("Langkah 2 dari 2")).toBeTruthy();
    expect(screen.getByText("Buat kata sandi untuk baru@contoh.id.")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText("Kata sandi"));
  });

  it("ticks the password rules while typing", () => {
    render(<SignUpForm />);
    enterEmail("baru@contoh.id");
    const rule = (name: string) => screen.getByText(name).closest("[data-met]");
    expect(rule("8 karakter")).toBeNull();
    fireEvent.change(screen.getByLabelText("Kata sandi"), { target: { value: "abc" } });
    expect(rule("Ada huruf")).toBeTruthy();
    expect(rule("Ada angka")).toBeNull();
    fireEvent.change(screen.getByLabelText("Kata sandi"), { target: { value: "rahasia123" } });
    expect(rule("8 karakter")).toBeTruthy();
    expect(rule("Ada angka")).toBeTruthy();
  });

  it("rejects a weak password and a missing agreement, together", () => {
    render(<SignUpForm />);
    enterEmail("baru@contoh.id");
    finish("pendek", false);
    expect(screen.getByText("Kata sandi minimal 8 karakter.")).toBeTruthy();
    expect(screen.getByText("Setujui ketentuan untuk melanjutkan.")).toBeTruthy();
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("asks for a letter and a number", () => {
    render(<SignUpForm />);
    enterEmail("baru@contoh.id");
    finish("sembilanhuruf");
    expect(screen.getByText("Pakai minimal satu huruf dan satu angka.")).toBeTruthy();
  });

  it("goes back to change the email, keeping what was typed", async () => {
    render(<SignUpForm />);
    enterEmail("baru@contoh.id");
    fireEvent.click(screen.getByRole("button", { name: "Ubah email" }));
    await frame();
    const email = screen.getByLabelText("Email") as HTMLInputElement;
    expect(email.value).toBe("baru@contoh.id");
    expect(document.activeElement).toBe(email);
  });

  it("starts an empty account and goes to email verification", () => {
    render(<SignUpForm />);
    enterEmail("  baru@contoh.id ");
    finish("rahasia123");
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
    enterEmail("baru@contoh.id");
    finish("rahasia123");
    expect(nav.push).toHaveBeenCalledWith("/verifikasi?lanjut=%2Fprojects");
  });

  it("signs up with Google straight to the profile, keeping the destination", () => {
    nav.search = "lanjut=%2Fprojects";
    render(<SignUpForm />);
    fireEvent.click(screen.getByRole("button", { name: "Daftar dengan Google" }));
    expect(nav.push).toHaveBeenCalledWith("/mulai?lanjut=%2Fprojects");
    const account = parseAccount(localStorage.getItem("ranah.account"));
    expect(account.profile.name).toBe("");
  });

  it("offers no role: signing up is always for an ordinary account", () => {
    render(<SignUpForm />);
    enterEmail("baru@contoh.id");
    expect(screen.queryByText(/admin|editor|juri|peran/i)).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
  });
});
