import { afterEach, describe, expect, it, vi } from "vitest";
import { MOTION_CLASS } from "@/features/landing/motion/motion-env";
import {
  coverDrift,
  heroDrift,
  heroProgress,
  passage,
  plateDrift,
  registerDrift,
} from "@/features/landing/motion/scroll-drift";

afterEach(() => {
  document.documentElement.classList.remove(MOTION_CLASS);
  vi.unstubAllGlobals();
});

describe("passage", () => {
  it("runs from 0 as an element enters at the bottom to 1 as it leaves at the top", () => {
    expect(passage(800, 400, 800)).toBe(0);
    expect(passage(-400, 400, 800)).toBe(1);
    expect(passage(200, 400, 800)).toBeCloseTo(0.5, 5);
  });

  it("stays inside 0 and 1 far from the screen", () => {
    expect(passage(5000, 400, 800)).toBe(0);
    expect(passage(-5000, 400, 800)).toBe(1);
  });
});

describe("heroDrift", () => {
  it("rests at progress 0 and settles at 1", () => {
    expect(heroProgress(800, 800)).toBe(0);
    expect(heroProgress(0, 800)).toBe(1);
    expect(heroDrift(0)).toEqual({ "--par": "0.0px", "--sc": "1.100", "--lift": "0.0px" });
    expect(heroDrift(1)).toEqual({ "--par": "-60.0px", "--sc": "1.020", "--lift": "-36.0px" });
  });
});

describe("plateDrift", () => {
  it("moves against the page around the middle of the passage", () => {
    expect(plateDrift(0, { range: 40, zoom: 1.06 })).toEqual({ "--dy": "20.0px", "--ds": "1.060" });
    expect(plateDrift(1, { range: 40, zoom: 1.06 })["--dy"]).toBe("-20.0px");
    expect(plateDrift(0.5, { range: 40, zoom: 1.06 })["--dy"]).toBe("0.0px");
  });

  it("interpolates a zoom range along the passage", () => {
    expect(plateDrift(0, { range: 40, zoom: [1.14, 1.06] })["--ds"]).toBe("1.140");
    expect(plateDrift(1, { range: 40, zoom: [1.14, 1.06] })["--ds"]).toBe("1.060");
  });
});

describe("coverDrift", () => {
  it("is centred on the middle of the passage", () => {
    expect(coverDrift(0)).toEqual({ "--cp": "-0.500" });
    expect(coverDrift(0.5)).toEqual({ "--cp": "0.000" });
    expect(coverDrift(1)).toEqual({ "--cp": "0.500" });
  });
});

describe("registerDrift", () => {
  it("does nothing without landing motion (no script, reduced motion)", () => {
    const update = vi.fn();
    const stop = registerDrift(update);
    expect(update).not.toHaveBeenCalled();
    stop();
  });

  it("updates once at once, then once per frame while scrolling, and stops when unregistered", () => {
    document.documentElement.classList.add(MOTION_CLASS);
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => frames.push(cb));
    const update = vi.fn();
    const stop = registerDrift(update);
    expect(update).toHaveBeenCalledTimes(1);

    // Many scroll events in one frame still cost one update.
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("scroll"));
    expect(frames).toHaveLength(1);
    frames.shift()!(0);
    expect(update).toHaveBeenCalledTimes(2);

    stop();
    window.dispatchEvent(new Event("scroll"));
    expect(frames).toHaveLength(0);
  });
});
