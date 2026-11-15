import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const setLocale = vi.fn();
vi.mock("@/lib/i18n/actions", () => ({ setLocale: (l: string) => setLocale(l) }));

import { LanguageMenu } from "@/components/ui/language-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { I18nProvider } from "@/lib/i18n/provider";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  setLocale.mockClear();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("lang");
  document.cookie = "theme=; max-age=0; path=/";
});

function stubSystem(dark: boolean) {
  vi.stubGlobal("matchMedia", () => ({
    matches: dark,
    addEventListener() {},
    removeEventListener() {},
  }));
}

describe("ThemeToggle", () => {
  it("starts from a light system and flips to dark, then back", () => {
    stubSystem(false);
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: /Terang.*Gelap/ }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    fireEvent.click(screen.getByRole("button", { name: /Gelap.*Terang/ }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("starts from a dark system and flips to light", () => {
    stubSystem(true);
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: /Gelap.*Terang/ }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});

describe("LanguageMenu", () => {
  it("marks the current language and saves the one chosen", () => {
    render(
      <I18nProvider locale="id" dictionary={dictionaries.id}>
        <LanguageMenu />
      </I18nProvider>,
    );
    expect(screen.getByRole("menuitem", { name: /Bahasa Indonesia/ }).textContent).toContain(
      "Aktif",
    );
    fireEvent.click(screen.getByRole("menuitem", { name: /English/ }));
    expect(setLocale).toHaveBeenCalledWith("en");
  });

  it("sets the document language and renders English labels", () => {
    render(
      <I18nProvider locale="en" dictionary={dictionaries.en}>
        <LanguageMenu />
      </I18nProvider>,
    );
    expect(document.documentElement.lang).toBe("en");
    expect(screen.getByRole("button", { name: "Language" })).toBeTruthy();
  });
});
