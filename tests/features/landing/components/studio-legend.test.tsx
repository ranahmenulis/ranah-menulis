import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScrollDrift } from "@/features/landing/components/scroll-drift";
import { StudioLegend } from "@/features/landing/components/studio-legend";
import { landing } from "@/features/landing/copy/id";
import { MOTION_CLASS } from "@/features/landing/motion/motion-env";

let phone = true;

const position = () => document.querySelector("[data-legend-at]")?.textContent;

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    matches: phone,
    addEventListener() {},
    removeEventListener() {},
  }));
});

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove(MOTION_CLASS);
  vi.unstubAllGlobals();
});

describe("studio legend", () => {
  it("lists the six features and the swipe line on a phone", () => {
    render(<StudioLegend copy={landing.studio} />);
    const list = screen.getByRole("list", { name: "Fitur Ranah Studio" });
    expect(list.querySelectorAll("li")).toHaveLength(6);
    expect(position()).toBe("01");
    expect(screen.getByText(/\/ 06/)).toBeTruthy();
    expect(screen.getByText("Geser →")).toBeTruthy();
    // A sideways scroller must be reachable by keyboard.
    expect(list.getAttribute("tabindex")).toBe("0");
  });

  it("is not a tab stop where it does not scroll", () => {
    phone = false;
    render(<StudioLegend copy={landing.studio} />);
    expect(screen.getByRole("list", { name: "Fitur Ranah Studio" }).hasAttribute("tabindex")).toBe(
      false,
    );
    phone = true;
  });

  it("follows the scroll position and reads 06 / 06 at the end", () => {
    render(<StudioLegend copy={landing.studio} />);
    const list = screen.getByRole("list", { name: "Fitur Ranah Studio" });
    Object.defineProperty(list, "clientWidth", { value: 300, configurable: true });
    Object.defineProperty(list, "scrollWidth", { value: 1200, configurable: true });
    // Cards 216 px apart; the row's edge sits at x = 0.
    Array.from(list.children).forEach((card, i) => {
      card.getBoundingClientRect = () => ({ left: i * 216 - list.scrollLeft }) as DOMRect;
    });
    list.getBoundingClientRect = () => ({ left: 0 }) as DOMRect;

    list.scrollLeft = 430; // near the third card
    act(() => void list.dispatchEvent(new Event("scroll")));
    expect(position()).toBe("03");
    // The number it left stays for the roll out.
    expect(document.querySelector(".lp-roll-out")?.textContent).toBe("01");

    list.scrollLeft = 900;
    act(() => void list.dispatchEvent(new Event("scroll")));
    expect(position()).toBe("06");
  });
});

describe("scroll drift", () => {
  it("leaves its plate at rest without landing motion", () => {
    const { container } = render(
      <ScrollDrift range={40} zoom={1.06}>
        <span />
      </ScrollDrift>,
    );
    expect(container.querySelector<HTMLElement>(".lp-drift")!.style.getPropertyValue("--dy")).toBe(
      "",
    );
  });

  it("sets its drift variables with landing motion", () => {
    document.documentElement.classList.add(MOTION_CLASS);
    const { container } = render(
      <ScrollDrift range={40} zoom={1.06}>
        <span />
      </ScrollDrift>,
    );
    const el = container.querySelector<HTMLElement>(".lp-drift")!;
    expect(el.style.getPropertyValue("--dy")).not.toBe("");
    expect(el.style.getPropertyValue("--ds")).toBe("1.060");
  });
});
