import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import { resetAccount } from "@/features/account/account-store";
import { ForgotForm } from "@/features/account/components/forgot-form";
import { ResetForm } from "@/features/account/components/reset-form";
import { VerifyView } from "@/features/account/components/verify-view";
import { rememberPendingEmail } from "@/features/account/pending-email";
import { SessionProvider } from "@/lib/auth/session-context";
import type { SessionInfo } from "@/lib/auth/session-info";

const nav = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  search: "",
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, replace: nav.replace, refresh: nav.refresh }),
  useSearchParams: () => new URLSearchParams(nav.search),
}));

const wrap = (ui: ReactNode) => render(<ToastProvider>{ui}</ToastProvider>);

/** The reset link signs the reader in for this one purpose, so the form needs a session. */
const SIGNED_IN: SessionInfo = { status: "user", userId: "u1", platformRoles: [] };
const wrapSignedIn = (ui: ReactNode) =>
  render(
    <SessionProvider value={SIGNED_IN}>
      <ToastProvider>{ui}</ToastProvider>
    </SessionProvider>,
  );

/** Press a button and let the sign-in system answer. */
async function press(name: string) {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name }));
  });
}

beforeEach(() => {
  nav.push.mockReset();
  nav.replace.mockReset();
  nav.search = "";
  localStorage.clear();
  sessionStorage.clear();
  rememberPendingEmail("");
});
afterEach(() => {
  cleanup();
  resetAccount();
  vi.useRealTimers();
});

describe("ForgotForm", () => {
  it("answers the same way whether or not the address exists", async () => {
    wrap(<ForgotForm />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "tidakada@contoh.id" } });
    await press("Kirim tautan");
    expect(screen.getByText(/Jika tidakada@contoh.id terdaftar/)).toBeTruthy();
  });

  it("checks the address before sending", () => {
    wrap(<ForgotForm />);
    fireEvent.click(screen.getByRole("button", { name: "Kirim tautan" }));
    expect(screen.getByText("Wajib diisi.")).toBeTruthy();
    expect(screen.queryByText("Cek emailmu")).toBeNull();
  });

  it("makes the reader wait before asking again, then allows it", async () => {
    vi.useFakeTimers();
    wrap(<ForgotForm />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@contoh.id" } });
    await press("Kirim tautan");
    const resend = () => screen.getByRole("button", { name: /Kirim ulang/ }) as HTMLButtonElement;
    expect(resend().disabled).toBe(true);
    expect(resend().textContent).toBe("Kirim ulang dalam 30 detik");
    act(() => {
      vi.advanceTimersByTime(31_000);
    });
    expect(resend().disabled).toBe(false);
    expect(resend().textContent).toBe("Kirim ulang");
  });

  it("leads back to sign-in, keeping the destination", async () => {
    nav.search = "lanjut=%2Fstudio";
    wrap(<ForgotForm />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@contoh.id" } });
    await press("Kirim tautan");
    expect(screen.getByRole("link", { name: "Kembali ke Masuk" }).getAttribute("href")).toBe(
      "/masuk?lanjut=%2Fstudio",
    );
  });
});

describe("ResetForm", () => {
  const set = (label: string, value: string) =>
    fireEvent.change(screen.getByLabelText(label), { target: { value } });

  it("needs a strong password typed twice", () => {
    wrapSignedIn(<ResetForm />);
    set("Kata sandi baru", "Rahasia123!");
    set("Ulangi kata sandi baru", "Rahasia124!");
    fireEvent.click(screen.getByRole("button", { name: "Simpan kata sandi" }));
    expect(screen.getByText("Kata sandi tidak sama.")).toBeTruthy();
    expect(screen.queryByText("Kata sandi diperbarui")).toBeNull();
  });

  it("confirms the change and leads to sign-in", async () => {
    wrapSignedIn(<ResetForm />);
    set("Kata sandi baru", "Rahasia123!");
    set("Ulangi kata sandi baru", "Rahasia123!");
    await press("Simpan kata sandi");
    expect(screen.getByText("Kata sandi diperbarui")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Masuk" }).getAttribute("href")).toBe("/masuk");
  });

  it("shows a link that opened no session as expired, with a way to ask again", () => {
    wrap(<ResetForm />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Tautan sudah kedaluwarsa");
    expect(screen.queryByLabelText("Kata sandi baru")).toBeNull();
  });

  it("shows an expired link as its own state with a way to ask again", () => {
    nav.search = "status=kedaluwarsa";
    wrapSignedIn(<ResetForm />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Tautan sudah kedaluwarsa");
    expect(screen.getByRole("link", { name: "Minta tautan baru" }).getAttribute("href")).toBe(
      "/lupa-sandi",
    );
    expect(screen.queryByLabelText("Kata sandi baru")).toBeNull();
  });
});

describe("VerifyView", () => {
  it("names the address the email went to, from the one just signed up with", () => {
    rememberPendingEmail("baru@contoh.id");
    wrap(<VerifyView />);
    expect(screen.getByText(/Kami mengirim tautan ke baru@contoh.id/)).toBeTruthy();
    expect(location.search).not.toContain("baru@contoh.id");
  });

  it("starts with the resend button waiting", () => {
    rememberPendingEmail("baru@contoh.id");
    wrap(<VerifyView />);
    const button = screen.getByRole("button", { name: /Kirim ulang/ }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.textContent).toMatch(/Kirim ulang dalam \d+ detik/);
  });

  it("offers no stand-in links for the email link", () => {
    wrap(<VerifyView />);
    expect(screen.queryByRole("link", { name: /Contoh/ })).toBeNull();
  });

  it("done state leads to the profile step", () => {
    nav.search = "status=berhasil";
    wrap(<VerifyView />);
    expect(screen.getByRole("link", { name: "Lengkapi profil" }).getAttribute("href")).toBe(
      "/mulai",
    );
  });

  it("expired state asks for a new email and returns to waiting", async () => {
    rememberPendingEmail("baru@contoh.id");
    nav.search = "status=kedaluwarsa";
    wrap(<VerifyView />);
    await press("Kirim email baru");
    expect(nav.replace).toHaveBeenCalledWith("/verifikasi");
  });

  it("restarts the resend wait after a new email is asked for from the expired state", async () => {
    vi.useFakeTimers();
    rememberPendingEmail("baru@contoh.id");
    nav.search = "status=kedaluwarsa";
    const view = wrap(<VerifyView />);
    // Let the wait that started on mount run out, as it would by the time the reader acts.
    act(() => {
      vi.advanceTimersByTime(31_000);
    });
    await press("Kirim email baru");
    nav.search = "";
    view.rerender(
      <ToastProvider>
        <VerifyView />
      </ToastProvider>,
    );
    const button = screen.getByRole("button", { name: /Kirim ulang/ }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.textContent).toBe("Kirim ulang dalam 30 detik");
  });
});
