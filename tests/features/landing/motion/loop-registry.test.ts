import { afterEach, describe, expect, it, vi } from "vitest";
import {
  activeLoop,
  forgetLoop,
  reportRatio,
  resetLoops,
  subscribeLoops,
} from "@/features/landing/motion/loop-registry";

afterEach(() => resetLoops());

describe("loop registry", () => {
  it("has no active loop until one is mostly in view", () => {
    reportRatio("menulis", 0.4);
    expect(activeLoop()).toBeNull();
  });

  it("activates the loop most in view", () => {
    reportRatio("menulis", 0.7);
    reportRatio("target", 0.95);
    expect(activeLoop()).toBe("target");
  });

  it("hands over when the active loop is forgotten", () => {
    reportRatio("menulis", 0.7);
    reportRatio("target", 0.95);
    forgetLoop("target");
    expect(activeLoop()).toBe("menulis");
  });

  it("notifies subscribers on every report", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeLoops(listener);
    reportRatio("menulis", 1);
    unsubscribe();
    reportRatio("menulis", 0);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
