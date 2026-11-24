import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CoverStack } from "@/features/landing/components/cover-stack";
import { MOTION_CLASS } from "@/features/landing/motion/motion-env";

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove(MOTION_CLASS);
});

describe("cover stack", () => {
  it("stands still and shown without landing motion", () => {
    const { container } = render(<CoverStack />);
    const stack = container.querySelector<HTMLElement>(".lp-covers")!;
    expect(stack.style.getPropertyValue("--cp")).toBe("");
    expect(stack.hasAttribute("data-seen")).toBe(true);
  });

  it("shows one Projects catalog cover per path, the right column deeper", () => {
    const { container } = render(<CoverStack />);
    const covers = Array.from(container.querySelectorAll<HTMLElement>(".lp-cover"));
    expect(covers.map((c) => c.querySelector("[data-cover]")?.getAttribute("data-cover"))).toEqual([
      "antologi",
      "solo",
      "kelas",
      "lomba",
    ]);
    expect(covers.map((c) => c.dataset.depth ?? "")).toEqual(["", "2", "", "2"]);
    expect(covers[0].textContent).toContain("Surat yang Tidak Pernah Terkirim");
  });

  it("writes its depth offset with landing motion", () => {
    document.documentElement.classList.add(MOTION_CLASS);
    const { container } = render(<CoverStack />);
    expect(
      container.querySelector<HTMLElement>(".lp-covers")!.style.getPropertyValue("--cp"),
    ).not.toBe("");
  });
});
