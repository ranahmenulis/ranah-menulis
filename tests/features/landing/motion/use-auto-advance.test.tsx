import { cleanup, fireEvent, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MOTION_CLASS } from "@/features/landing/motion/motion-env";
import {
  AUTO_ADVANCE_MS,
  nextScrollLeft,
  useAutoAdvance,
} from "@/features/landing/motion/use-auto-advance";

let phone = true;
const onPhone = () => phone;

function Row() {
  const ref = useRef<HTMLDivElement>(null);
  useAutoAdvance(ref, onPhone);
  return (
    <div ref={ref} data-testid="row">
      <span />
      <span />
      <span />
    </div>
  );
}

function renderRow() {
  const result = render(<Row />);
  const row = result.getByTestId("row");
  Object.defineProperty(row, "clientWidth", { value: 300, configurable: true });
  Object.defineProperty(row, "scrollWidth", { value: 1200, configurable: true });
  // Cards 250 px apart from the row's edge; the row sits at x = 0.
  Array.from(row.children).forEach((card, i) => {
    card.getBoundingClientRect = () => ({ left: i * 250 - row.scrollLeft }) as DOMRect;
  });
  row.getBoundingClientRect = () => ({ left: 0 }) as DOMRect;
  const scrollTo = vi.fn();
  row.scrollTo = scrollTo as unknown as HTMLElement["scrollTo"];
  return { row, scrollTo };
}

beforeEach(() => {
  vi.useFakeTimers();
  // jsdom has no IntersectionObserver: the hook then treats the row as in view.
  vi.stubGlobal("IntersectionObserver", undefined);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.documentElement.classList.remove(MOTION_CLASS);
  phone = true;
});

describe("nextScrollLeft", () => {
  it("lands on the next card, and back to the start from the end", () => {
    const { row } = renderRow();
    expect(nextScrollLeft(row)).toBe(250);
    row.scrollLeft = 250;
    expect(nextScrollLeft(row)).toBe(500);
    row.scrollLeft = 900;
    expect(nextScrollLeft(row)).toBe(0);
  });
});

describe("useAutoAdvance", () => {
  it("does nothing without landing motion", () => {
    const { scrollTo } = renderRow();
    vi.advanceTimersByTime(AUTO_ADVANCE_MS * 3);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("moves on every interval on a phone", () => {
    document.documentElement.classList.add(MOTION_CLASS);
    const { scrollTo } = renderRow();
    vi.advanceTimersByTime(AUTO_ADVANCE_MS);
    expect(scrollTo).toHaveBeenCalledWith({ left: 250, behavior: "smooth" });
  });

  it("stays still outside the phone layout", () => {
    document.documentElement.classList.add(MOTION_CLASS);
    phone = false;
    const { scrollTo } = renderRow();
    vi.advanceTimersByTime(AUTO_ADVANCE_MS * 2);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("stops for good once the reader touches the row", () => {
    document.documentElement.classList.add(MOTION_CLASS);
    const { row, scrollTo } = renderRow();
    fireEvent.pointerDown(row);
    vi.advanceTimersByTime(AUTO_ADVANCE_MS * 3);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("stops when the row takes keyboard focus", () => {
    document.documentElement.classList.add(MOTION_CLASS);
    const { row, scrollTo } = renderRow();
    fireEvent.focusIn(row);
    vi.advanceTimersByTime(AUTO_ADVANCE_MS * 2);
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
