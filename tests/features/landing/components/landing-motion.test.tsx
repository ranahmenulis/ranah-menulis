import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { landing } from "@/features/landing/copy/id";
import { EnterTitle } from "@/features/landing/components/enter-title";
import { Faq } from "@/features/landing/components/faq";
import { LoopFrame } from "@/features/landing/components/previews/loop-frame";
import { MOTION_CLASS } from "@/features/landing/motion/motion-env";
import { resetLoops } from "@/features/landing/motion/loop-registry";

afterEach(() => {
  cleanup();
  resetLoops();
  document.documentElement.classList.remove(MOTION_CLASS);
  document.documentElement.removeAttribute("data-lp-ready");
  vi.unstubAllGlobals();
});

class StubObserver {
  observe() {}
  disconnect() {}
}

describe("landing without motion (no script, reduced motion)", () => {
  it("renders no pause control on a preview", () => {
    render(
      <LoopFrame id="menulis" label="Cuplikan">
        <p>isi</p>
      </LoopFrame>,
    );
    expect(screen.getByRole("img", { name: "Cuplikan" })).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("keeps the hero title whole for assistive tech", () => {
    render(<EnterTitle id="hero-h" text={landing.hero.title} className="display" />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(landing.hero.title);
  });

  it("shows every FAQ answer open, without an accordion", () => {
    const { container } = render(<Faq title={landing.faqTitle} items={landing.faq} />);
    expect(container.querySelector("details")).toBeNull();
    for (const item of landing.faq) expect(screen.getByText(item.answer)).toBeTruthy();
  });
});

describe("landing with motion", () => {
  it("offers a pause control that toggles its label", () => {
    document.documentElement.classList.add(MOTION_CLASS);
    vi.stubGlobal("IntersectionObserver", StubObserver);
    render(
      <LoopFrame id="menulis" label="Cuplikan">
        <p>isi</p>
      </LoopFrame>,
    );
    const pause = screen.getByRole("button", { name: "Jeda animasi" });
    fireEvent.click(pause);
    expect(screen.getByRole("button", { name: "Putar animasi" })).toBeTruthy();
    expect(document.documentElement.hasAttribute("data-lp-ready")).toBe(true);
  });
});
