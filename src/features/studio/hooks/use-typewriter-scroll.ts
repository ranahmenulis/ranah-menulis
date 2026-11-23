import type { Editor } from "@tiptap/react";
import { useLayoutEffect, type RefObject } from "react";
import type { WritingPreferences } from "@/features/account/writing-preferences";

type Position = WritingPreferences["typewriterPosition"];

const LINE_POSITION: Record<Position, number> = { high: 0.2, middle: 0.5, low: 0.8 };
const BEFORE = "--studio-typewriter-before";
const AFTER = "--studio-typewriter-after";

function scrollToWritingLine(
  editor: Editor,
  page: HTMLElement,
  port: HTMLElement,
  position: Position,
) {
  const viewport = window.visualViewport;
  const viewportTop = viewport?.offsetTop ?? 0;
  const bounds = port.getBoundingClientRect();
  const top = Math.max(bounds.top, viewportTop);
  const bottom = Math.min(bounds.bottom, viewportTop + (viewport?.height ?? window.innerHeight));
  if (bottom <= top) return;

  const target = top + (bottom - top) * LINE_POSITION[position];
  const previousBefore = Number.parseFloat(page.style.getPropertyValue(BEFORE)) || 0;
  const bodyStart = editor.view.dom.getBoundingClientRect().top + port.scrollTop - previousBefore;
  // Give the first and last lines room to reach the target, including above a virtual keyboard.
  page.style.setProperty(BEFORE, `${Math.max(0, Math.ceil(target - bodyStart))}px`);
  page.style.setProperty(AFTER, `${Math.ceil(bounds.bottom - target)}px`);

  const caret = editor.view.coordsAtPos(editor.state.selection.head);
  const distance = (caret.top + caret.bottom) / 2 - target;
  if (Math.abs(distance) < 2) return;
  // Keep up with typing without accumulating scroll animations, including under reduced motion.
  port.scrollBy({ top: distance, behavior: "instant" });
}

export function useTypewriterScroll(
  editor: Editor | null,
  pageRef: RefObject<HTMLElement | null>,
  position: Position | null,
) {
  useLayoutEffect(() => {
    const page = pageRef.current;
    // The scrolling area is the editor stage (<main>); the page sits in a wrapper inside it that
    // hides while the Page Preview is open, so its direct parent never scrolls.
    const port = page?.closest("main") ?? page?.parentElement;
    if (!editor || !page || !port || !position) return;
    const viewport = window.visualViewport;
    let frame = 0;

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (editor.isDestroyed || !editor.view.hasFocus() || !editor.state.selection.empty) {
          return;
        }
        scrollToWritingLine(editor, page, port, position);
      });
    };

    const resize = new ResizeObserver(schedule);
    resize.observe(port);
    viewport?.addEventListener("resize", schedule);
    viewport?.addEventListener("scroll", schedule);
    editor.on("update", schedule);
    editor.on("selectionUpdate", schedule);
    editor.on("focus", schedule);
    schedule();

    return () => {
      window.cancelAnimationFrame(frame);
      resize.disconnect();
      viewport?.removeEventListener("resize", schedule);
      viewport?.removeEventListener("scroll", schedule);
      editor.off("update", schedule);
      editor.off("selectionUpdate", schedule);
      editor.off("focus", schedule);
      page.style.removeProperty(BEFORE);
      page.style.removeProperty(AFTER);
    };
  }, [editor, pageRef, position]);
}
