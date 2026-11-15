"use client";

import { useCallback, useRef, type PointerEvent, type RefObject } from "react";

/** Past this share of the sheet's height, letting go closes it. */
const DISMISS_DISTANCE = 0.3;
/** Pixels per millisecond: a quick flick closes the sheet even when it moved only a little. */
const DISMISS_VELOCITY = 0.5;
/** A tap on the handle moves a few pixels; below this it is not a drag. */
const MIN_DRAG = 12;
/** Pulling a sheet upward past its resting place meets resistance. */
const UP_RESISTANCE = 0.15;

/** Whether letting go at `offset` px (moving at `velocity` px/ms) should close a sheet `height` px tall. */
export function shouldDismissSheet(offset: number, velocity: number, height: number): boolean {
  if (offset < MIN_DRAG) return false;
  return offset > height * DISMISS_DISTANCE || velocity > DISMISS_VELOCITY;
}

/** The sheet is moved by hand while dragged; "" hands each property back to the stylesheet. */
function place(el: HTMLElement, translate: string, transition: string) {
  el.style.translate = translate;
  el.style.transition = transition;
}

type Drag = { startY: number; lastY: number; lastT: number; velocity: number; moved: boolean };

const DESKTOP = "(min-width: 48rem)";

/**
 * Drag-to-dismiss for a bottom sheet (touch and pen only). The sheet follows the finger 1:1 with no
 * transition, then either closes or springs back through the CSS transition it already has. The
 * handlers belong on a handle (grabber and title), not on the scrolling body, so scrolling is not
 * hijacked. The handle needs `touch-action: none`.
 */
export function useSheetDrag(
  sheet: RefObject<HTMLElement | null>,
  enabled: boolean,
  onDismiss: () => void,
) {
  const drag = useRef<Drag | null>(null);

  /** Hands the sheet back to its CSS: used on snap-back and before the sheet opens again. */
  const reset = useCallback(() => {
    const el = sheet.current;
    if (!el) return;
    place(el, "", "");
  }, [sheet]);

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (!enabled || e.pointerType === "mouse" || window.matchMedia?.(DESKTOP).matches) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = {
      startY: e.clientY,
      lastY: e.clientY,
      lastT: e.timeStamp,
      velocity: 0,
      moved: false,
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    const el = sheet.current;
    if (!d || !el) return;
    const dy = e.clientY - d.startY;
    const dt = Math.max(e.timeStamp - d.lastT, 1);
    d.velocity = (e.clientY - d.lastY) / dt;
    d.lastY = e.clientY;
    d.lastT = e.timeStamp;
    if (!d.moved && Math.abs(dy) < MIN_DRAG / 2) return;
    d.moved = true;
    place(el, `0 ${dy > 0 ? dy : dy * UP_RESISTANCE}px`, "none");
  };

  const finish = (e: PointerEvent<HTMLElement>, cancelled: boolean) => {
    const d = drag.current;
    const el = sheet.current;
    drag.current = null;
    if (!d || !el || !d.moved) return;
    const offset = e.clientY - d.startY;
    if (cancelled || !shouldDismissSheet(offset, d.velocity, el.offsetHeight)) return reset();
    // Slide on out from where the finger let go; `reset` runs when the sheet opens next.
    place(el, "0 100%", "");
    onDismiss();
    // A parent that refuses to close (it is busy) must not leave an invisible sheet holding the page.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (el.hasAttribute("open")) reset();
      }),
    );
  };

  return {
    reset,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (e: PointerEvent<HTMLElement>) => finish(e, false),
      onPointerCancel: (e: PointerEvent<HTMLElement>) => finish(e, true),
    },
  };
}
