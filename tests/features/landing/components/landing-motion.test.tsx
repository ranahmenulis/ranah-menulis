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

/** Records the observer so a test can report the title as in or out of view. */
class ViewObserver {
  static last: ViewObserver | null = null;
  disconnected = false;
  constructor(private readonly callback: IntersectionObserverCallback) {
    ViewObserver.last = this;
  }
  observe() {}
  disconnect() {
    this.disconnected = true;
  }
  report(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

function renderClosingTitle() {
  const { container } = render(
    <section data-enter>
      <EnterTitle as="h2" trigger="view" id="wait-h" text="Mulai menulis" className="display" />
    </section>,
  );
  return container.querySelector("section")!;
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
    const whole = landing.hero.titleLines.join(" ");
    render(<EnterTitle id="hero-h" lines={landing.hero.titleLines} className="display" />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(whole);
  });

  it("leaves the closing title standing without waiting for it to be seen", () => {
    const section = renderClosingTitle();
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Mulai menulis");
    // Without lp-motion the CSS never hides it, and no observer is started.
    expect(section.hasAttribute("data-entered")).toBe(false);
    expect(document.documentElement.hasAttribute("data-lp-ready")).toBe(true);
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

  it("brings the closing title in once, when it comes into view", () => {
    document.documentElement.classList.add(MOTION_CLASS);
    vi.stubGlobal("IntersectionObserver", ViewObserver);
    const section = renderClosingTitle();
    const observer = ViewObserver.last!;
    observer.report(false);
    expect(section.hasAttribute("data-entered")).toBe(false);
    observer.report(true);
    expect(section.hasAttribute("data-entered")).toBe(true);
    expect(observer.disconnected).toBe(true);
  });

  it("shows the closing title at once when there is no IntersectionObserver", () => {
    document.documentElement.classList.add(MOTION_CLASS);
    vi.stubGlobal("IntersectionObserver", undefined);
    const section = renderClosingTitle();
    expect(section.hasAttribute("data-entered")).toBe(true);
  });
});
