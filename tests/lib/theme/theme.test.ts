import { afterEach, describe, expect, it } from "vitest";
import { applyTheme, nextTheme, readTheme, saveTheme, themeScript } from "@/lib/theme/theme";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
  document.cookie = "theme=; max-age=0; path=/";
});

describe("theme", () => {
  it("cycles system → light → dark → system", () => {
    expect(nextTheme("system")).toBe("light");
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("system");
  });

  it("reads a stored theme and ignores unknown values", () => {
    expect(readTheme("a=1; theme=dark; b=2")).toBe("dark");
    expect(readTheme("theme=purple")).toBe("system");
    expect(readTheme("")).toBe("system");
  });

  it("sets data-theme for light and dark and removes it for system", () => {
    applyTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    applyTheme("system");
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });

  it("saves the choice in a cookie and applies it", () => {
    saveTheme("light");
    expect(document.cookie).toContain("theme=light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("the head script applies a stored theme before paint", () => {
    document.cookie = "theme=dark; path=/";
    new Function(themeScript)();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
