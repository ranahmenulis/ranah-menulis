import { cleanup, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MOTION_CLASS } from "@/features/landing/motion/motion-env";
import { useReveal } from "@/features/landing/motion/use-reveal";

let fire: ((visible: boolean) => void) | null = null;
const disconnect = vi.fn();

class StubObserver {
  constructor(private callback: IntersectionObserverCallback) {
    fire = (visible) =>
      this.callback(
        [{ isIntersecting: visible } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
  }
  observe() {}
  disconnect = disconnect;
}

function Probe() {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  return <div ref={ref} data-reveal="plate" data-testid="probe" />;
}

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove(MOTION_CLASS);
  vi.unstubAllGlobals();
  fire = null;
  disconnect.mockClear();
});

describe("useReveal", () => {
  it("shows at once without landing motion", () => {
    const { getByTestId } = render(<Probe />);
    expect(getByTestId("probe").hasAttribute("data-seen")).toBe(true);
  });

  it("shows at once without IntersectionObserver", () => {
    document.documentElement.classList.add(MOTION_CLASS);
    vi.stubGlobal("IntersectionObserver", undefined);
    const { getByTestId } = render(<Probe />);
    expect(getByTestId("probe").hasAttribute("data-seen")).toBe(true);
  });

  it("waits until the element is in view, then shows once and stops watching", () => {
    document.documentElement.classList.add(MOTION_CLASS);
    vi.stubGlobal("IntersectionObserver", StubObserver);
    const { getByTestId } = render(<Probe />);
    const probe = getByTestId("probe");
    expect(probe.hasAttribute("data-seen")).toBe(false);
    fire!(false);
    expect(probe.hasAttribute("data-seen")).toBe(false);
    fire!(true);
    expect(probe.hasAttribute("data-seen")).toBe(true);
    expect(disconnect).toHaveBeenCalled();
  });
});
