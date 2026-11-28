"use client";

import { useEffect, type RefObject } from "react";

/**
 * Close a floating panel on Escape or on a pointer press outside of `containerRef` (or of every
 * ref in it, for a panel rendered elsewhere in the document, e.g. a portalled sheet).
 * Escape is handled in the capture phase so it wins over editor key handlers.
 */
export function useDismiss(
  open: boolean,
  onDismiss: (reason: "escape" | "outside") => void,
  containerRef: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onDismiss("escape");
    }

    function onPointerDown(event: PointerEvent) {
      const containers = (Array.isArray(containerRef) ? containerRef : [containerRef])
        .map((ref) => ref.current)
        .filter((node): node is HTMLElement => node !== null);
      const target = event.target;
      if (
        containers.length > 0 &&
        target instanceof Node &&
        !containers.some((node) => node.contains(target))
      ) {
        onDismiss("outside");
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [open, onDismiss, containerRef]);
}
