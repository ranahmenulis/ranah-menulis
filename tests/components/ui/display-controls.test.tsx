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
  setLocale.mockClear();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("lang");
  document.cookie = "theme=; max-age=0; path=/";
});

describe("ThemeToggle", () => {
  it("cycles the theme and describes the next mode in its name", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /Ikuti sistem.*Terang/ });
    fireEvent.click(button);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    fireEvent.click(screen.getByRole("button", { name: /Terang.*Gelap/ }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    fireEvent.click(screen.getByRole("button", { name: /Gelap.*Ikuti sistem/ }));
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
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
