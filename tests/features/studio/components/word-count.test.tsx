import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { parseAccount, resetAccount, saveAccount } from "@/features/account/account-store";
import { WordCount } from "@/features/studio/components/word-count";

afterEach(() => {
  cleanup();
  resetAccount();
});

const stats = { words: 1234, characters: 7000, paragraphs: 12 };
const target = { words: 1000, missed: false, summary: "320 / 1.000 kata · 5 hari lagi" };
const props = {
  words: 1234,
  stats,
  selection: null,
  sprint: { phase: "idle" },
  target: null,
} as const;
const renderCounter = (overrides: Partial<ComponentProps<typeof WordCount>> = {}) =>
  render(<WordCount {...props} {...overrides} />);

const trigger = () => screen.getByRole("button", { name: /kata$/ });
const open = () => fireEvent.click(trigger());
const dialog = () => screen.getByRole("dialog", { name: "Penghitung tulisan" });
const option = (name: string) => within(dialog()).getByRole("button", { name });

describe("WordCount", () => {
  it("shows the document word count and keeps the details closed", () => {
    renderCounter();
    expect(trigger().textContent).toBe("1.234 kata");
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("lists words, characters, paragraphs and reading time when opened", () => {
    renderCounter();
    open();
    const rows = within(dialog()).getAllByRole("row");
    expect(rows.map((row) => row.textContent)).toEqual([
      "Kata1.234",
      "Karakter7.000",
      "Paragraf12",
      "Waktu baca7 mnt",
    ]);
    expect(within(dialog()).queryByRole("columnheader")).toBeNull();
  });

  it("reads 'N dari M kata' and adds a selection column while text is selected", () => {
    const selection = { words: 12, characters: 60, paragraphs: 1 };
    renderCounter({ selection });
    expect(trigger().textContent).toBe("12 dari 1.234 kata");
    open();
    expect(
      within(dialog())
        .getAllByRole("columnheader")
        .map((h) => h.textContent),
    ).toEqual(["Pilihan", "Dokumen"]);
    const words = within(dialog()).getByRole("row", { name: /^Kata/ });
    expect(
      within(words)
        .getAllByRole("cell")
        .map((c) => c.textContent),
    ).toEqual(["12", "1.234"]);
  });

  it("shows a dash instead of a reading time when there are no words", () => {
    renderCounter({ words: 0, stats: { words: 0, characters: 0, paragraphs: 0 } });
    expect(trigger().textContent).toBe("0 kata");
    open();
    expect(within(dialog()).getByRole("row", { name: /^Waktu baca/ }).textContent).toBe(
      "Waktu baca—",
    );
  });

  it("rounds reading time up and never reads below one minute", () => {
    renderCounter({ words: 201 });
    open();
    expect(within(dialog()).getByRole("row", { name: /^Waktu baca/ }).textContent).toBe(
      "Waktu baca2 mnt",
    );
  });

  it("shows dashes for characters and paragraphs until the editor has counted them", () => {
    renderCounter({ words: 50, stats: null });
    open();
    expect(within(dialog()).getByRole("row", { name: /^Karakter/ }).textContent).toBe("Karakter—");
    expect(within(dialog()).getByRole("row", { name: /^Paragraf/ }).textContent).toBe("Paragraf—");
  });

  it("closes on Escape", () => {
    renderCounter({ words: 1 });
    open();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows the nearest document target under the table, and nothing without one", () => {
    const { unmount } = renderCounter({ words: 320, target });
    open();
    expect(
      within(dialog()).getByText("Target dokumen · 320 / 1.000 kata · 5 hari lagi"),
    ).toBeTruthy();
    unmount();

    renderCounter({ words: 320 });
    open();
    expect(within(dialog()).queryByText(/Target dokumen · /)).toBeNull();
  });

  it("renders no provisional counter on the server and waits for the pinned target to resolve", () => {
    saveAccount({ prefs: { writing: { wordCountPin: "target" } } });
    expect(renderToString(<WordCount {...props} target={target} />)).not.toContain("<button");
    const { rerender } = renderCounter({ words: 320, target: undefined });
    expect(screen.queryByRole("button")).toBeNull();
    rerender(<WordCount {...props} words={320} target={target} />);
    expect(screen.getByRole("button", { name: "Target dokumen: 320 / 1.000" }).textContent).toBe(
      "320 / 1.000",
    );
  });

  it("remembers the one chosen pin and explains the fallback after a remount", () => {
    const { unmount } = renderCounter({ words: 320, target });
    open();
    fireEvent.click(option("Target dokumen"));
    expect(option("Target dokumen").getAttribute("aria-pressed")).toBe("true");
    expect(option("Dokumen").getAttribute("aria-pressed")).toBe("false");
    unmount();

    renderCounter({ words: 12 });
    open();
    expect(option("Target dokumen").getAttribute("aria-pressed")).toBe("true");
    expect(within(dialog()).getByText(/Belum ada target dokumen/)).toBeTruthy();
    fireEvent.click(option("Lepas sematan"));
    expect(within(dialog()).queryByText(/Belum ada target dokumen/)).toBeNull();
    expect(
      parseAccount(localStorage.getItem("ranah.account")).prefs.writing.wordCountPin,
    ).toBeNull();
  });

  it("keeps a refused choice for this tab and restores focus after a successful retry", () => {
    renderCounter();
    open();
    const block = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    try {
      fireEvent.click(option("Sprint"));
      expect(option("Sprint").getAttribute("aria-pressed")).toBe("true");
      expect(within(dialog()).getByRole("alert").textContent).toMatch(/hanya berlaku di tab ini/);
    } finally {
      block.mockRestore();
    }

    fireEvent.click(option("Coba lagi"));
    expect(within(dialog()).queryByRole("alert")).toBeNull();
    expect(document.activeElement).toBe(option("Sprint"));
    expect(parseAccount(localStorage.getItem("ranah.account")).prefs.writing.wordCountPin).toBe(
      "sprint",
    );
  });
});
