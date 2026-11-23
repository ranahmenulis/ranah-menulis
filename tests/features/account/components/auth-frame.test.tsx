import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const pathname = vi.hoisted(() => ({ value: "/masuk" }));
vi.mock("next/navigation", () => ({
  usePathname: () => pathname.value,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import { ToastProvider } from "@/components/ui/toast";
import { resetAccount, saveAccount } from "@/features/account/account-store";
import { AuthFrame, AuthPage } from "@/features/account/components/auth-frame";
import { OnboardingView } from "@/features/account/components/onboarding-view";
import { SignInForm } from "@/features/account/components/sign-in-form";

afterEach(() => {
  cleanup();
  resetAccount();
  localStorage.clear();
});

const frame = (children: React.ReactNode) =>
  render(
    <ToastProvider>
      <AuthFrame>{children}</AuthFrame>
    </ToastProvider>,
  );

const paintingOf = (container: HTMLElement) =>
  [...container.querySelectorAll('img[src^="/auth/saleh"]')].map((img) => img.getAttribute("src"));

describe("AuthFrame", () => {
  it("puts the evening landscape beside sign in, with decorative pictures only", () => {
    pathname.value = "/masuk";
    const { container } = frame(<p>formulir</p>);
    expect(paintingOf(container)).toEqual([
      "/auth/saleh-forest-house.webp",
      "/auth/saleh-forest-house.webp",
    ]);
    container.querySelectorAll("img").forEach((img) => expect(img.getAttribute("alt")).toBe(""));
    // One engraving, beside the painting from lg only (none on a phone).
    const cutouts = container.querySelectorAll("[data-auth-cutout]");
    expect(cutouts).toHaveLength(1);
    expect(cutouts[0].getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByText("formulir")).toBeTruthy();
  });

  it("uses the forest while recovering an account, with the frame's own line", () => {
    pathname.value = "/lupa-sandi";
    const { container } = frame(<p>formulir</p>);
    expect(paintingOf(container)[0]).toBe("/auth/saleh-javanese-jungle.webp");
    expect(container.querySelector("[data-aside-default]")?.textContent).toContain(
      "Halaman yang hilang bisa ditulis lagi.",
    );
  });

  it("lets a screen put its own card over the painting (sign in: a labelled sample)", () => {
    pathname.value = "/masuk";
    const { container } = frame(<SignInForm />);
    const aside = container.querySelector("[data-aside]");
    expect(aside?.textContent).toContain("Contoh");
    expect(aside?.textContent).toContain("Hujan di Pelabuhan");
    // The card is decorative: the slot is out of the reading order.
    expect(aside?.parentElement?.getAttribute("aria-hidden")).toBe("true");
  });

  it("shows the profile as it is typed while onboarding", () => {
    pathname.value = "/mulai";
    saveAccount({ profile: { name: "", username: "", bio: "", genres: [], avatar: null } });
    const { container } = frame(<OnboardingView />);
    const aside = () => container.querySelector("[data-aside]")?.textContent ?? "";
    expect(aside()).toContain("Namamu");
    fireEvent.change(screen.getByLabelText("Nama"), { target: { value: "Sekar Ayu" } });
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "SekarAyu" } });
    expect(aside()).toContain("Sekar Ayu");
    expect(aside()).toContain("@sekarayu");
  });
});

describe("AuthPage", () => {
  it("keeps the title as the only heading, with the serif line in it, and celebrates only when asked", () => {
    const { container, rerender } = render(
      <AuthPage title="Selamat datang" accent="kembali.">
        <p>isi</p>
      </AuthPage>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Selamat datang kembali." })).toBeTruthy();
    expect(container.querySelector("[data-celebrate]")).toBeNull();
    rerender(
      <AuthPage title="Email terverifikasi" celebrate>
        <p>isi</p>
      </AuthPage>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Email terverifikasi" })).toBeTruthy();
    expect(container.querySelector("[data-celebrate]")?.getAttribute("aria-hidden")).toBe("true");
  });
});
