import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TopBar } from "@/features/landing/components/top-bar";

afterEach(cleanup);

describe("landing top bar", () => {
  it("has one call to action, leading to the waitlist", () => {
    render(<TopBar />);
    const cta = screen.getByRole("link", { name: "Mulai Menulis" });
    expect(cta.getAttribute("href")).toBe("#daftar");
  });

  it("offers a plain sign-in link that does not compete with the call to action", () => {
    render(<TopBar />);
    expect(screen.getByRole("link", { name: "Masuk" }).getAttribute("href")).toBe("/masuk");
  });

  it("puts sections, theme, and language in the one narrow-screen menu", () => {
    render(<TopBar />);
    const menu = screen.getByRole("menu", { name: "Menu halaman", hidden: true });
    const items = within(menu)
      .getAllByRole("menuitem", { hidden: true })
      .map((item) => item.textContent);
    expect(items).toEqual([
      "Masuk",
      "Ekosistem",
      "Studio",
      "Penerbitan",
      "Tanya jawab",
      expect.stringContaining("Terang"),
      expect.stringContaining("Gelap"),
      expect.stringContaining("Bahasa Indonesia"),
      expect.stringContaining("English"),
    ]);
  });

  it("keeps no separate preferences button beside the menu", () => {
    render(<TopBar />);
    expect(screen.queryByRole("button", { name: "Tampilan dan bahasa" })).toBeNull();
  });
});
