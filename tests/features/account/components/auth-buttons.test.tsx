import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SignInButton, SignUpButton } from "@/features/account/components/auth-buttons";

const nav = vi.hoisted(() => ({ pathname: "/projects/lomba-cerpen-hujan-2026" as string | null }));
const query = vi.hoisted(() => ({ value: "" }));
vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useSearchParams: () => new URLSearchParams(query.value),
}));

afterEach(() => {
  cleanup();
  query.value = "";
});

describe("SignInButton and SignUpButton", () => {
  it("lead to the account screens and remember the current page", () => {
    render(
      <>
        <SignInButton>Masuk</SignInButton>
        <SignUpButton>Daftar</SignUpButton>
      </>,
    );
    expect(screen.getByRole("link", { name: "Masuk" }).getAttribute("href")).toBe(
      "/masuk?lanjut=%2Fprojects%2Flomba-cerpen-hujan-2026",
    );
    expect(screen.getByRole("link", { name: "Daftar" }).getAttribute("href")).toBe(
      "/daftar?lanjut=%2Fprojects%2Flomba-cerpen-hujan-2026",
    );
  });

  it("keep the query, so a filtered list or a chosen document comes back as it was", () => {
    nav.pathname = "/projects";
    query.value = "kategori=lomba&status=buka";
    render(<SignInButton>Masuk</SignInButton>);
    expect(screen.getByRole("link", { name: "Masuk" }).getAttribute("href")).toBe(
      "/masuk?lanjut=%2Fprojects%3Fkategori%3Dlomba%26status%3Dbuka",
    );
  });

  it("do not send the reader back to an account screen", () => {
    nav.pathname = "/masuk";
    render(<SignInButton>Masuk</SignInButton>);
    expect(screen.getByRole("link", { name: "Masuk" }).getAttribute("href")).toBe("/masuk");
  });
});
