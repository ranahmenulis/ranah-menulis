import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FormatBar } from "@/features/studio/components/format-bar";

let editor: Editor;

beforeEach(() => {
  editor = new Editor({
    extensions: [StarterKit.configure({ heading: { levels: [2] } })],
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
  it("is always rendered as a toolbar with the six STD-01 formats, even with nothing selected", () => {
    editor.commands.setTextSelection(1);
    render(<FormatBar editor={editor} />);
    expect(toolbar()).toBeTruthy();
    expect(screen.getAllByRole("button").map((b) => b.getAttribute("aria-label"))).toEqual([
      "Tebal (Ctrl+B)",
      "Miring (Ctrl+I)",
      "Judul",
      "Kutipan",
      "Daftar berpoin",
      "Daftar bernomor",
    ]);
  });

  it.each([
    ["Tebal (Ctrl+B)", () => editor.isActive("bold")],
    ["Miring (Ctrl+I)", () => editor.isActive("italic")],
    ["Judul", () => editor.isActive("heading", { level: 2 })],
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
