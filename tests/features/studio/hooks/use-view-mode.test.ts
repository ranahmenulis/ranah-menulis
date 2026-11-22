import { act, renderHook } from "@testing-library/react";
import type { Editor } from "@tiptap/react";
import { describe, expect, it } from "vitest";
import { useViewMode } from "@/features/studio/hooks/use-view-mode";

const editor = { getHTML: () => "<p>isi</p>" } as unknown as Editor;

describe("useViewMode", () => {
  it("starts in Writing Mode", () => {
    const { result } = renderHook(() => useViewMode(editor, false));
    expect(result.current.mode).toBe("write");
    expect(result.current.showPreview).toBe(false);
  });

  it("takes the text from the editor when the preview opens", () => {
    const { result } = renderHook(() => useViewMode(editor, false));
    act(() => result.current.change("preview"));
    expect(result.current.mode).toBe("preview");
    expect(result.current.html).toBe("<p>isi</p>");
    expect(result.current.showPreview).toBe(true);
    act(() => result.current.change("write"));
    expect(result.current.showPreview).toBe(false);
  });

  it("never shows the preview in focus mode, and resumes it afterwards", () => {
    const { result, rerender } = renderHook(({ focus }) => useViewMode(editor, focus), {
      initialProps: { focus: false },
    });
    act(() => result.current.change("preview"));
    rerender({ focus: true });
    expect(result.current.showPreview).toBe(false);
    rerender({ focus: false });
    expect(result.current.showPreview).toBe(true);
  });

  it("still switches mode when the editor is not there yet", () => {
    const { result } = renderHook(() => useViewMode(null, false));
    act(() => result.current.change("preview"));
    expect(result.current.mode).toBe("preview");
    expect(result.current.html).toBe("");
  });
});
