import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CoverStack } from "@/features/landing/components/cover-stack";
import { landing } from "@/features/landing/copy/id";
import { MOTION_CLASS } from "@/features/landing/motion/motion-env";

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove(MOTION_CLASS);
});

describe("cover stack", () => {
  it("stands still and shown without landing motion", () => {
    const { container } = render(<CoverStack titles={landing.publishing.coverTitles} />);
    const stack = container.querySelector<HTMLElement>(".lp-covers")!;
    expect(stack.style.getPropertyValue("--cp")).toBe("");
    expect(stack.hasAttribute("data-seen")).toBe(true);
  });

  it("puts the middle cover deepest and last", () => {
    const { container } = render(<CoverStack titles={landing.publishing.coverTitles} />);
    const covers = Array.from(container.querySelectorAll<HTMLElement>(".lp-cover"));
    expect(covers).toHaveLength(3);
    expect(covers[1].dataset.depth).toBe("2");
    expect(covers.map((c) => c.style.getPropertyValue("--i"))).toEqual(["0", "2", "1"]);
    expect(covers[1].textContent).toContain(landing.publishing.coverTitles[1]);
  });

  it("writes its depth offset with landing motion", () => {
    document.documentElement.classList.add(MOTION_CLASS);
    const { container } = render(<CoverStack titles={landing.publishing.coverTitles} />);
    expect(
      container.querySelector<HTMLElement>(".lp-covers")!.style.getPropertyValue("--cp"),
    ).not.toBe("");
  });
});
