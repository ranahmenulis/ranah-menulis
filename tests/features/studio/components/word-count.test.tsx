import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WordCount } from "@/features/studio/components/word-count";

afterEach(cleanup);

const stats = { words: 1234, characters: 7000, paragraphs: 12 };

const trigger = () => screen.getByRole("button", { name: /kata$/ });
const open = () => fireEvent.click(trigger());
const dialog = () => screen.getByRole("dialog", { name: "Penghitung tulisan" });

describe("WordCount", () => {
  it("shows the document word count and keeps the details closed", () => {
    render(<WordCount words={1234} stats={stats} selection={null} />);
    expect(trigger().textContent).toBe("1.234 kata");
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("lists words, characters, paragraphs and reading time when opened", () => {
    render(<WordCount words={1234} stats={stats} selection={null} />);
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
    render(<WordCount words={1234} stats={stats} selection={selection} />);
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
    render(
      <WordCount words={0} stats={{ words: 0, characters: 0, paragraphs: 0 }} selection={null} />,
    );
    expect(trigger().textContent).toBe("0 kata");
    open();
    expect(within(dialog()).getByRole("row", { name: /^Waktu baca/ }).textContent).toBe(
      "Waktu baca—",
    );
  });

  it("rounds reading time up and never reads below one minute", () => {
    render(<WordCount words={201} stats={stats} selection={null} />);
    open();
    expect(within(dialog()).getByRole("row", { name: /^Waktu baca/ }).textContent).toBe(
      "Waktu baca2 mnt",
    );
  });

  it("shows dashes for characters and paragraphs until the editor has counted them", () => {
    render(<WordCount words={50} stats={null} selection={null} />);
    open();
    expect(within(dialog()).getByRole("row", { name: /^Karakter/ }).textContent).toBe("Karakter—");
    expect(within(dialog()).getByRole("row", { name: /^Paragraf/ }).textContent).toBe("Paragraf—");
  });

  it("closes on Escape", () => {
    render(<WordCount words={1} stats={stats} selection={null} />);
    open();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
