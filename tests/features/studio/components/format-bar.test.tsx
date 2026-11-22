import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Editor } from "@tiptap/react";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_LAYOUT } from "@/features/studio/document-layout";
import { FormatBar } from "@/features/studio/components/format-bar";

let editor: Editor;

beforeEach(() => {
  editor = new Editor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "<p>satu dua tiga</p>",
  });
  editor.commands.setTextSelection({ from: 1, to: 9 });
});

afterEach(() => {
  cleanup();
  editor.destroy();
});

const toolbar = () => screen.getByRole("toolbar", { name: "Format teks" });
const button = (name: string | RegExp) => screen.getByRole("button", { name }) as HTMLButtonElement;

describe("FormatBar", () => {
  it("is always rendered as a toolbar with font, size, style, alignment and the basic formats", () => {
    editor.commands.setTextSelection(1);
    render(<FormatBar editor={editor} />);
    expect(toolbar()).toBeTruthy();
    expect(screen.getAllByRole("combobox").map((b) => b.getAttribute("aria-label"))).toEqual([
      "Font",
      "Ukuran huruf",
      "Gaya paragraf",
    ]);
    expect(screen.getAllByRole("button").map((b) => b.getAttribute("aria-label"))).toEqual([
      "Rata kiri",
      "Rata tengah",
      "Rata kanan",
      "Rata kiri-kanan",
      "Tebal (Ctrl+B)",
      "Miring (Ctrl+I)",
      "Kutipan",
      "Daftar berpoin",
      "Daftar bernomor",
    ]);
  });

  it.each([
    ["Tebal (Ctrl+B)", () => editor.isActive("bold")],
    ["Miring (Ctrl+I)", () => editor.isActive("italic")],
    ["Kutipan", () => editor.isActive("blockquote")],
    ["Daftar berpoin", () => editor.isActive("bulletList")],
    ["Daftar bernomor", () => editor.isActive("orderedList")],
  ])("turns %s on and off in the editor", (label, isOn) => {
    render(<FormatBar editor={editor} />);
    expect(button(label).getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(button(label));
    expect(isOn()).toBe(true);
    expect(button(label).getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(button(label));
    expect(isOn()).toBe(false);
    expect(button(label).getAttribute("aria-pressed")).toBe("false");
  });

  it("sets the paragraph style from the select and reflects it", () => {
    render(<FormatBar editor={editor} />);
    const style = screen.getByRole("combobox", { name: "Gaya paragraf" }) as HTMLSelectElement;
    expect(style.value).toBe("p");
    fireEvent.change(style, { target: { value: "h2" } });
    expect(editor.isActive("heading", { level: 2 })).toBe(true);
    expect(style.value).toBe("h2");
    fireEvent.change(style, { target: { value: "h3" } });
    expect(editor.isActive("heading", { level: 3 })).toBe(true);
    fireEvent.change(style, { target: { value: "p" } });
    expect(editor.isActive("heading")).toBe(false);
  });

  it("aligns the paragraph and returns to left", () => {
    render(<FormatBar editor={editor} />);
    expect(button("Rata kiri").getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(button("Rata kiri-kanan"));
    expect(editor.getHTML()).toContain("text-align: justify");
    expect(button("Rata kiri-kanan").getAttribute("aria-pressed")).toBe("true");
    expect(button("Rata kiri").getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(button("Rata kiri"));
    expect(button("Rata kiri").getAttribute("aria-pressed")).toBe("true");
  });

  it("reports a changed font or size as a new layout without touching the text", () => {
    const onLayoutChange = vi.fn();
    render(<FormatBar editor={editor} onLayoutChange={onLayoutChange} />);
    const font = screen.getByRole("combobox", { name: "Font" }) as HTMLSelectElement;
    const size = screen.getByRole("combobox", { name: "Ukuran huruf" }) as HTMLSelectElement;
    expect(font.value).toBe("times");
    expect(size.value).toBe("12");
    fireEvent.change(font, { target: { value: "sans" } });
    expect(onLayoutChange).toHaveBeenLastCalledWith({ ...DEFAULT_LAYOUT, font: "sans" });
    fireEvent.change(size, { target: { value: "14" } });
    expect(onLayoutChange).toHaveBeenLastCalledWith({ ...DEFAULT_LAYOUT, sizePt: 14 });
    expect(editor.getText()).toBe("satu dua tiga");
  });

  it("shows the layout it is given", () => {
    render(<FormatBar editor={editor} layout={{ ...DEFAULT_LAYOUT, font: "serif", sizePt: 16 }} />);
    expect((screen.getByRole("combobox", { name: "Font" }) as HTMLSelectElement).value).toBe(
      "serif",
    );
    expect(
      (screen.getByRole("combobox", { name: "Ukuran huruf" }) as HTMLSelectElement).value,
    ).toBe("16");
  });

  it("reflects a format applied from the keyboard", () => {
    render(<FormatBar editor={editor} />);
    act(() => {
      editor.chain().toggleItalic().run();
    });
    expect(button("Miring (Ctrl+I)").getAttribute("aria-pressed")).toBe("true");
  });

  it("does not take focus from the editor when pressed", () => {
    render(<FormatBar editor={editor} />);
    // Cancelling mousedown is what keeps the caret and selection in the text.
    const notPrevented = fireEvent.mouseDown(button("Tebal (Ctrl+B)"));
    expect(notPrevented).toBe(false);
  });

  it("keeps the selection after applying a format", () => {
    render(<FormatBar editor={editor} />);
    fireEvent.click(button("Tebal (Ctrl+B)"));
    expect(editor.state.selection.from).toBe(1);
    expect(editor.state.selection.to).toBe(9);
  });

  describe("after select all (Ctrl+A)", () => {
    beforeEach(() => {
      editor.commands.setContent("<p>satu</p><p>dua</p><p>tiga</p>");
      editor.commands.selectAll();
    });

    it("turns a list on and then off again instead of wrapping the text twice", () => {
      render(<FormatBar editor={editor} />);
      const topLevel = () => editor.getJSON().content?.map((n) => n.type);

      fireEvent.click(button("Daftar bernomor"));
      expect(topLevel()?.[0]).toBe("orderedList");
      expect(button("Daftar bernomor").getAttribute("aria-pressed")).toBe("true");

      fireEvent.click(button("Daftar bernomor"));
      expect(topLevel()).not.toContain("orderedList");
      expect(editor.getText({ blockSeparator: " " }).trim()).toBe("satu dua tiga");
    });

    it("turns bold on and off for the whole text", () => {
      render(<FormatBar editor={editor} />);
      fireEvent.click(button("Tebal (Ctrl+B)"));
      expect(editor.getHTML()).toBe(
        "<p><strong>satu</strong></p><p><strong>dua</strong></p><p><strong>tiga</strong></p>",
      );
      fireEvent.click(button("Tebal (Ctrl+B)"));
      expect(editor.getHTML()).not.toContain("<strong>");
    });
  });
});
