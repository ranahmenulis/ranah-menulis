import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import { parseAccount, resetAccount, saveAccount } from "@/features/account/account-store";
import { OnboardingView } from "@/features/account/components/onboarding-view";

const nav = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn(), search: "" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, refresh: nav.refresh }),
  useSearchParams: () => new URLSearchParams(nav.search),
}));

const wrap = (ui: ReactNode) => render(<ToastProvider>{ui}</ToastProvider>);
const saved = () => parseAccount(localStorage.getItem("ranah.account"));

beforeEach(() => {
  nav.push.mockReset();
  nav.search = "";
  localStorage.clear();
  // What sign-up leaves behind: an account with an empty profile.
  saveAccount({
    email: "baru@contoh.id",
    profile: { name: "", username: "", bio: "", genres: [], avatar: null },
  });
});
afterEach(() => {
  cleanup();
  resetAccount();
});

const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
/** Press the button and let the save finish. */
const submit = () =>
  act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Mulai menulis" }));
  });

describe("OnboardingView", () => {
  it("needs a name and a username, and focuses the first one missing", async () => {
    wrap(<OnboardingView />);
    await submit();
    expect(screen.getAllByText("Wajib diisi.")).toHaveLength(2);
    expect(document.activeElement).toBe(screen.getByLabelText("Nama"));
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("refuses a username that is taken or badly formed, as soon as the field is left", () => {
    wrap(<OnboardingView />);
    type("Username", "hafizrahman");
    fireEvent.blur(screen.getByLabelText("Username"));
    expect(screen.getByText("Username ini sudah dipakai.")).toBeTruthy();
    type("Username", "Pakai Spasi");
    expect(screen.getByText("Hanya huruf kecil, angka, dan garis bawah.")).toBeTruthy();
  });

  it("says a free username is available", () => {
    wrap(<OnboardingView />);
    type("Username", "namabaru");
    fireEvent.blur(screen.getByLabelText("Username"));
    expect(screen.getByText("Username ini tersedia.")).toBeTruthy();
  });

  it("counts the bio and warns past 160 characters", () => {
    wrap(<OnboardingView />);
    type("Bio (opsional)", "a".repeat(161));
    fireEvent.blur(screen.getByLabelText("Bio (opsional)"));
    expect(screen.getByText("Bio maksimal 160 karakter.")).toBeTruthy();
  });

  it("saves the profile and moves on to the destination", async () => {
    nav.search = "lanjut=%2Fprojects";
    wrap(<OnboardingView />);
    type("Nama", "  Laras Ayu ");
    type("Username", "@Laras_Ayu");
    fireEvent.click(screen.getByRole("button", { name: "Puisi" }));
    fireEvent.click(screen.getByRole("button", { name: "Cerpen" }));
    fireEvent.click(screen.getByRole("radio", { name: "Malaysia" }));
    await submit();
    expect(nav.push).toHaveBeenCalledWith("/projects");
    const { profile } = saved();
    expect(profile.name).toBe("Laras Ayu");
    expect(profile.username).toBe("laras_ayu");
    expect(profile.genres).toEqual(["Cerpen", "Puisi"]);
    expect(profile.country).toBe("MY");
  });

  it("goes to the home screen when no destination was given", async () => {
    wrap(<OnboardingView />);
    type("Nama", "Laras");
    type("Username", "laras_ayu");
    await submit();
    expect(nav.push).toHaveBeenCalledWith("/beranda");
  });

  it("refuses a photo that is the wrong type or too large, and keeps the form", () => {
    wrap(<OnboardingView />);
    const input = screen.getByLabelText("Foto profil", { selector: "input" }) as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [new File(["x"], "a.gif", { type: "image/gif" })] },
    });
    expect(screen.getByRole("alert").textContent).toBe("Pilih foto JPG, PNG, atau WebP.");
    const big = new File(["x"], "b.png", { type: "image/png" });
    Object.defineProperty(big, "size", { value: 3 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [big] } });
    expect(screen.getByRole("alert").textContent).toBe("Foto maksimal 2 MB.");
  });
});
