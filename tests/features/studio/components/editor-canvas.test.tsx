import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import type { Editor } from "@tiptap/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resetAccount, saveAccount } from "@/features/account/account-store";
import { EditorCanvas } from "@/features/studio/components/editor-canvas";

const initialContent = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: 'Teks lama "asli" ...' }] }],
};

function canvasProps() {
  return {
    initialTitle: "Judul uji",
    initialContent,
    onContentChange: vi.fn(),
    onTitleChange: vi.fn(),
    onEditorChange: vi.fn<(editor: Editor | null) => void>(),
  };
}

async function openEditor() {
  const props = canvasProps();
  const { container } = render(
    <main>
      <EditorCanvas {...props} />
    </main>,
  );
  const editor = await waitFor(() => {
    const instance = props.onEditorChange.mock.lastCall?.[0];
    expect(instance).toBeTruthy();
    return instance!;
  });
  return { editor, props, container };
}

function typeText(editor: Editor, text: string) {
  act(() => {
    const { view, state } = editor;
    const { from, to } = state.selection;
    if (
      !view.someProp("handleTextInput", (handle) => handle(view, from, to, text, () => state.tr))
    ) {
      view.dispatch(state.tr.insertText(text, from, to));
    }
  });
}

afterEach(() => {
  cleanup();
  resetAccount();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Studio editor writing preferences", () => {
  it("renders the loading state on the server and mounts with the saved text size", async () => {
    saveAccount({ prefs: { writing: { textSize: "large" } } });
    const html = renderToString(<EditorCanvas {...canvasProps()} />);
    expect(html).toContain("Membuka dokumen");
    expect(html).not.toContain("Judul uji");
    expect(html).not.toContain("data-studio-text-size");
    const { container } = await openEditor();
    expect(container.querySelector("article")?.dataset.studioTextSize).toBe("large");
  });

  it("updates input rules without recreating the editor, moving the caret, or rewriting text", async () => {
    const { editor, props } = await openEditor();
    act(() => editor.commands.setTextSelection(editor.state.doc.content.size - 1));
    typeText(editor, " --");
    const before = editor.getText();
    const position = editor.state.selection.from;
    const surface = editor.view.dom;

    act(() => saveAccount({ prefs: { writing: { textSize: "large", substitutions: true } } }));
    expect(props.onEditorChange.mock.lastCall?.[0]).toBe(editor);
    expect(editor.view.dom).toBe(surface);
    expect(surface.classList.contains("studio-prose")).toBe(true);
    expect(editor.state.selection.from).toBe(position);
    expect(editor.getText()).toBe(before);

    typeText(editor, " -");
    typeText(editor, "-");
    expect(editor.getText()).toBe(`${before} —`);
    fireEvent.keyDown(surface, { key: "Backspace" });
    expect(editor.getText()).toBe(`${before} --`);

    typeText(editor, " ..");
    typeText(editor, ".");
    expect(editor.getText()).toBe(`${before} -- …`);
    fireEvent.keyDown(surface, { key: "Backspace" });
    expect(editor.getText()).toBe(`${before} -- ...`);

    act(() => saveAccount({ prefs: { writing: { substitutions: false } } }));
    typeText(editor, " -");
    typeText(editor, "-");
    expect(editor.getText()).toBe(`${before} -- ... --`);
  });

  it("uses opening and closing quotes without enabling the other substitutions", async () => {
    saveAccount({ prefs: { writing: { curlyQuotes: true } } });
    const { editor } = await openEditor();
    act(() => editor.commands.setTextSelection(editor.state.doc.content.size - 1));
    for (const text of [" ", '"', "kata", '"', " ", "'", "teks", "'", " ada", "'", " -", "-"]) {
      typeText(editor, text);
    }
    expect(editor.getText()).toBe('Teks lama "asli" ... “kata” ‘teks’ ada’ --');
  });

  it("keeps existing punctuation when pressing Enter with the rules enabled", async () => {
    saveAccount({ prefs: { writing: { curlyQuotes: true, substitutions: true } } });
    const { editor } = await openEditor();
    act(() => editor.commands.setTextSelection(editor.state.doc.content.size - 1));
    fireEvent.keyDown(editor.view.dom, { key: "Enter" });
    expect(editor.state.doc.firstChild?.textContent).toBe('Teks lama "asli" ...');
  });

  it("positions the writing line inside the visible viewport and stops in Standard mode", async () => {
    const viewport = Object.assign(new EventTarget(), { offsetTop: 0, height: 520 });
    vi.stubGlobal("visualViewport", viewport);
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
    const { editor, container } = await openEditor();
    const port = container.querySelector("main")!;
    const page = container.querySelector("article")!;
    const scroll = vi.fn();
    port.scrollBy = scroll;
    vi.spyOn(port, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 64, 375, 676));
    vi.spyOn(editor.view, "hasFocus").mockReturnValue(true);
    vi.spyOn(editor.view, "coordsAtPos").mockReturnValue({
      top: 500,
      bottom: 520,
      left: 0,
      right: 0,
    });

    act(() => saveAccount({ prefs: { writing: { mode: "typewriter" } } }));
    await waitFor(() => expect(scroll).toHaveBeenLastCalledWith({ top: 218, behavior: "instant" }));
    viewport.height = 400;
    viewport.offsetTop = 30;
    viewport.dispatchEvent(new Event("resize"));
    await waitFor(() => expect(scroll).toHaveBeenLastCalledWith({ top: 263, behavior: "instant" }));
    expect(page.style.getPropertyValue("--studio-typewriter-after")).toBe("493px");

    act(() => saveAccount({ prefs: { writing: { mode: "standard" } } }));
    expect(page.style.getPropertyValue("--studio-typewriter-after")).toBe("");
  });
});
