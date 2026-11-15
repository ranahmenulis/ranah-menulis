import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { shouldDismissSheet, useSheetDrag } from "@/lib/use-sheet-drag";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("shouldDismissSheet", () => {
  it("closes past 30% of the height, or on a quick flick, but never on a tap-sized move", () => {
    expect(shouldDismissSheet(130, 0.1, 400)).toBe(true);
    expect(shouldDismissSheet(60, 0.1, 400)).toBe(false);
    expect(shouldDismissSheet(60, 0.9, 400)).toBe(true);
    expect(shouldDismissSheet(4, 2, 400)).toBe(false);
    expect(shouldDismissSheet(-80, 2, 400)).toBe(false);
  });
});

function Sheet({ enabled = true, onDismiss }: { enabled?: boolean; onDismiss: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { handlers } = useSheetDrag(ref, enabled, onDismiss);
  return (
    <div ref={ref} data-testid="sheet">
      <div data-testid="handle" {...handlers} />
    </div>
  );
}

const touch = { pointerType: "touch", pointerId: 1 };

/** Drag the handle from y=0 to `to`, taking `ms` milliseconds, then let go. */
async function drag(to: number, ms: number, release = true) {
  const handle = screen.getByTestId("handle");
  fireEvent.pointerDown(handle, { ...touch, clientY: 0 });
  await act(() => vi.advanceTimersByTimeAsync(ms / 2));
  fireEvent.pointerMove(handle, { ...touch, clientY: to / 2 });
  await act(() => vi.advanceTimersByTimeAsync(ms / 2));
  fireEvent.pointerMove(handle, { ...touch, clientY: to });
  if (release) fireEvent.pointerUp(handle, { ...touch, clientY: to });
}

beforeEach(() => {
  vi.useFakeTimers();
});

function renderSheet(props: { enabled?: boolean } = {}) {
  const onDismiss = vi.fn();
  render(<Sheet onDismiss={onDismiss} {...props} />);
  Object.defineProperty(screen.getByTestId("sheet"), "offsetHeight", { value: 400 });
  return { onDismiss, sheet: screen.getByTestId("sheet") };
}

describe("useSheetDrag", () => {
  it("follows the finger one to one while dragging, with no transition", async () => {
    const { sheet } = renderSheet();
    await drag(90, 600, false);
    expect(sheet.style.translate).toMatch(/^0(px)? 90px$/);
    expect(sheet.style.transition).toBe("none");
  });

  it("closes the sheet when it is dragged far enough, sliding it the rest of the way out", async () => {
    const { sheet, onDismiss } = renderSheet();
    await drag(200, 800);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(sheet.style.translate).toMatch(/^0(px)? 100%$/);
  });

  it("closes on a quick flick even over a short distance", async () => {
    const { onDismiss } = renderSheet();
    await drag(60, 40);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("springs back to rest when let go too early", async () => {
    const { sheet, onDismiss } = renderSheet();
    await drag(60, 800);
    expect(onDismiss).not.toHaveBeenCalled();
    expect(sheet.style.translate).toBe("");
    expect(sheet.style.transition).toBe("");
  });

  it("springs back when the gesture is cancelled", async () => {
    const { sheet, onDismiss } = renderSheet();
    await drag(250, 800, false);
    fireEvent.pointerCancel(screen.getByTestId("handle"), { ...touch, clientY: 250 });
    expect(onDismiss).not.toHaveBeenCalled();
    expect(sheet.style.translate).toBe("");
  });

  it("resists being pulled upward", async () => {
    const { sheet } = renderSheet();
    await drag(-100, 600, false);
    expect(sheet.style.translate).toMatch(/^0(px)? -15px$/);
  });

  it("ignores the mouse and does nothing when disabled", async () => {
    const { sheet, onDismiss } = renderSheet({ enabled: false });
    await drag(300, 800);
    expect(sheet.style.translate).toBe("");

    const handle = screen.getByTestId("handle");
    fireEvent.pointerDown(handle, { pointerType: "mouse", pointerId: 2, clientY: 0 });
    fireEvent.pointerMove(handle, { pointerType: "mouse", pointerId: 2, clientY: 300 });
    fireEvent.pointerUp(handle, { pointerType: "mouse", pointerId: 2, clientY: 300 });
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("hands the sheet back when its parent refuses to close it, so it is never left off screen", async () => {
    const { sheet, onDismiss } = renderSheet();
    sheet.setAttribute("open", ""); // still open after onDismiss: the parent said no
    await drag(250, 800);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(sheet.style.translate).toMatch(/^0(px)? 100%$/);

    await act(() => vi.advanceTimersByTimeAsync(100));

    expect(sheet.style.translate).toBe("");
  });
});
