import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetAccount } from "@/features/account/account-store";
import { readPendingEmail } from "@/features/account/pending-email";
import { SignInForm } from "@/features/account/components/sign-in-form";

const nav = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn(), search: "" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, refresh: nav.refresh }),
  useSearchParams: () => new URLSearchParams(nav.search),
}));

beforeEach(() => {
  nav.push.mockReset();
  nav.search = "";
  sessionStorage.clear();
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  resetAccount();
});

/** Press a button and let the (simulated) sign-in system answer. */
async function press(name: string) {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name }));
  });
}

async function signIn(email: string, password = "Rahasia123!") {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Kata sandi"), { target: { value: password } });
  await press("Masuk");
}

describe("SignInForm", () => {
  it("asks for both fields, puts focus on the first mistake, and goes nowhere", () => {
    render(<SignInForm />);
    fireEvent.click(screen.getByRole("button", { name: "Masuk" }));
    expect(screen.getAllByText("Wajib diisi.")).toHaveLength(2);
    expect(document.activeElement).toBe(screen.getByLabelText("Email"));
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("explains a badly formed email in the field", async () => {
    render(<SignInForm />);
    await signIn("bukan-email");
    expect(screen.getByText(/Tulis email dengan benar/)).toBeTruthy();
    expect(screen.getByLabelText("Email").getAttribute("aria-invalid")).toBe("true");
  });

  it("moves on to the home screen after a valid sign-in", async () => {
    render(<SignInForm />);
    await signIn("rinjani@contoh.id");
    expect(nav.push).toHaveBeenCalledWith("/beranda");
  });

  it("returns to where the reader was going", async () => {
    nav.search = "lanjut=%2Fprojects%2Flomba-cerpen-hujan-2026";
    render(<SignInForm />);
    await signIn("rinjani@contoh.id");
    expect(nav.push).toHaveBeenCalledWith("/projects/lomba-cerpen-hujan-2026");
  });

  it("ignores a destination outside the app", async () => {
    nav.search = "lanjut=https%3A%2F%2Fjahat.example";
    render(<SignInForm />);
    await signIn("rinjani@contoh.id");
    expect(nav.push).toHaveBeenCalledWith("/beranda");
  });

  it("says the email or password is wrong without saying which", async () => {
    render(<SignInForm />);
    await signIn("salah@contoh.id");
    expect(screen.getByRole("alert").textContent).toMatch(/Email atau kata sandi salah/);
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("locks the form after five wrong attempts", async () => {
    render(<SignInForm />);
    for (let i = 0; i < 5; i++) await signIn("salah@contoh.id");
    expect(screen.getByRole("alert").textContent).toMatch(/Coba lagi dalam 30 detik/);
    expect((screen.getByRole("button", { name: "Masuk" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it("offers a new verification email when the address is not verified", async () => {
    render(<SignInForm />);
    await signIn("belum@contoh.id");
    await press("Kirim ulang email");
    expect(nav.push).toHaveBeenCalledWith("/verifikasi");
    expect(readPendingEmail()).toBe("belum@contoh.id");
  });

  it("shows the password only when asked", () => {
    render(<SignInForm />);
    const input = screen.getByLabelText("Kata sandi") as HTMLInputElement;
    expect(input.type).toBe("password");
    fireEvent.click(screen.getByRole("button", { name: "Tampilkan kata sandi" }));
    expect(input.type).toBe("text");
    expect(screen.getByRole("button", { name: "Sembunyikan kata sandi" })).toBeTruthy();
  });

  it("links to Lupa sandi and to Daftar, carrying the destination", () => {
    nav.search = "lanjut=%2Fstudio";
    render(<SignInForm />);
    expect(screen.getByRole("link", { name: "Lupa kata sandi?" }).getAttribute("href")).toBe(
      "/lupa-sandi",
    );
    expect(screen.getByRole("link", { name: "Daftar" }).getAttribute("href")).toBe(
      "/daftar?lanjut=%2Fstudio",
    );
  });

  it("clears the lock when the wait is over", async () => {
    vi.useFakeTimers();
    try {
      render(<SignInForm />);
      for (let i = 0; i < 5; i++) await signIn("salah@contoh.id");
      act(() => {
        vi.advanceTimersByTime(31_000);
      });
      expect((screen.getByRole("button", { name: "Masuk" }) as HTMLButtonElement).disabled).toBe(
        false,
      );
    } finally {
      vi.useRealTimers();
    }
  });
  it("signs in with Google through the same bypass, back to the destination", async () => {
    nav.search = "lanjut=%2Fstudio";
    render(<SignInForm />);
    await press("Masuk dengan Google");
    expect(nav.push).toHaveBeenCalledWith("/studio");
  });
});
