import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  THEME_COLORS,
  applyTheme,
  nextTheme,
  readTheme,
  saveTheme,
  themeScript,
} from "@/lib/theme/theme";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
  document.cookie = "theme=; max-age=0; path=/";
  document.head.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.remove());
});

describe("theme", () => {
  it("flips between light and dark", () => {
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("light");
  });

  it("reads a stored theme and ignores unknown values", () => {
    expect(readTheme("a=1; theme=dark; b=2")).toBe("dark");
    expect(readTheme("theme=purple")).toBeNull();
    expect(readTheme("theme=system")).toBeNull();
    expect(readTheme("")).toBeNull();
  });

  it("sets data-theme", () => {
    applyTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    applyTheme("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("the head script leaves the page to the system when nothing is saved", () => {
    new Function(themeScript)();
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

describe("theme-color", () => {
  const colors = () =>
    [...document.querySelectorAll('meta[name="theme-color"]')].map((m) =>
      m.getAttribute("content"),
    );

  afterEach(() => vi.unstubAllGlobals());

  function stubSystem(dark: boolean) {
    const listeners: Array<() => void> = [];
    const query = {
      matches: dark,
      addEventListener: (_: string, fn: () => void) => listeners.push(fn),
    };
    vi.stubGlobal("matchMedia", () => query);
    return {
      change(next: boolean) {
        query.matches = next;
        listeners.forEach((fn) => fn());
      },
    };
  }

  it("a chosen theme sets one meta and updates it instead of adding another", () => {
    applyTheme("dark");
    expect(colors()).toEqual([THEME_COLORS.dark]);
    applyTheme("light");
    expect(colors()).toEqual([THEME_COLORS.light]);
  });

  it("the head script uses the saved theme", () => {
    stubSystem(false);
    document.cookie = "theme=dark; path=/";
    new Function(themeScript)();
    expect(colors()).toEqual([THEME_COLORS.dark]);
  });

  it("without a saved theme the head script follows the system, also when it changes", () => {
    const system = stubSystem(true);
    new Function(themeScript)();
    expect(colors()).toEqual([THEME_COLORS.dark]);
    system.change(false);
    expect(colors()).toEqual([THEME_COLORS.light]);
  });

  it("a saved theme keeps winning when the system changes", () => {
    const system = stubSystem(false);
    new Function(themeScript)();
    applyTheme("dark");
    system.change(false);
    expect(colors()).toEqual([THEME_COLORS.dark]);
  });

  it("matches the --canvas token of each theme in globals.css", () => {
    const css = readFileSync(path.resolve(__dirname, "../../../src/app/globals.css"), "utf8");
    // The app band (DESIGN.md 4.5) lifts its own surface on dark pages; it is a band, not the
    // page, so its rules are left out here. The landing has no token set of its own any more.
    const appCss = css
      .split(/(?<=\})/)
      .filter((rule) => !rule.includes(".app-band"))
      .join("");
    const canvases = [...appCss.matchAll(/--canvas:\s*(#[0-9a-f]{6})/gi)].map((m) => m[1]);
    expect(new Set(canvases)).toEqual(new Set(Object.values(THEME_COLORS)));
  });
});

describe("saveTheme reveal", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    Reflect.deleteProperty(document, "startViewTransition");
  });

  function stubTransition() {
    const animate = vi.fn();
    document.documentElement.animate = animate as never;
    const start = vi.fn((update: () => void) => {
      update();
      return { ready: Promise.resolve() };
    });
    Object.defineProperty(document, "startViewTransition", { value: start, configurable: true });
    return { start, animate };
  }

  it("applies the theme inside a view transition and grows a circle from the origin", async () => {
    const { start, animate } = stubTransition();
    saveTheme("dark", { x: 100, y: 20 });
    expect(start).toHaveBeenCalledOnce();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    await Promise.resolve();
    await Promise.resolve();
    const [frames, options] = animate.mock.calls[0];
    expect(frames.clipPath[0]).toBe("circle(0px at 100px 20px)");
    expect(options.pseudoElement).toBe("::view-transition-new(root)");
  });

  it("switches at once without an origin", () => {
    const { start } = stubTransition();
    saveTheme("light");
    expect(start).not.toHaveBeenCalled();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("switches at once with reduced motion", () => {
    const { start } = stubTransition();
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    saveTheme("dark", { x: 1, y: 1 });
    expect(start).not.toHaveBeenCalled();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
