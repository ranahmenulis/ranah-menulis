import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroVideo, heroVideoPaths } from "@/features/landing/components/hero-video";
import { MOTION_CLASS } from "@/features/landing/motion/motion-env";

const LABEL = "Video tanpa suara";

let intersecting = true;

class StubObserver {
  constructor(private callback: IntersectionObserverCallback) {}
  observe() {
    this.callback(
      [{ isIntersecting: intersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
  disconnect() {}
}

function stubWide(wide: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query === "(min-width: 48rem)" ? wide : false,
    addEventListener() {},
    removeEventListener() {},
  }));
}

function withMotion({ wide = true, inView = true } = {}) {
  document.documentElement.classList.add(MOTION_CLASS);
  intersecting = inView;
  vi.stubGlobal("IntersectionObserver", StubObserver);
  stubWide(wide);
}

let play: ReturnType<typeof vi.spyOn>;
let pause: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove(MOTION_CLASS);
  document.documentElement.removeAttribute("data-theme");
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("heroVideoPaths", () => {
  it("picks the cut by width and theme", () => {
    expect(heroVideoPaths("en", "light", true)).toEqual({
      video: "/landing/hero/en/16x10-light.mp4",
      poster: "/landing/hero/en/16x10-light.webp",
    });
    expect(heroVideoPaths("en", "dark", false).video).toBe("/landing/hero/en/4x5-dark.mp4");
  });

  it("serves the English cut to Indonesian visitors until an Indonesian one exists", () => {
    expect(heroVideoPaths("id", "light", true).video).toBe("/landing/hero/en/16x10-light.mp4");
  });
});

describe("hero video without motion (no script, reduced motion)", () => {
  it("shows the light and dark posters as one labelled image, with no video or control", () => {
    const { container } = render(<HeroVideo label={LABEL} />);
    expect(screen.getByRole("img", { name: LABEL })).toBeTruthy();
    expect(container.querySelector("picture.logo-on-light")).toBeTruthy();
    expect(container.querySelector("picture.logo-on-dark")).toBeTruthy();
    expect(container.querySelector("video")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("hero video with motion", () => {
  it("plays the wide cut for the theme on screen", () => {
    withMotion();
    const { container } = render(<HeroVideo label={LABEL} />);
    const video = container.querySelector("video")!;
    expect(video.getAttribute("src")).toBe("/landing/hero/en/16x10-light.mp4");
    expect(video.muted).toBe(true);
    expect(play).toHaveBeenCalled();
  });

  it("uses the dark cut when the page is dark", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    withMotion();
    const { container } = render(<HeroVideo label={LABEL} />);
    expect(container.querySelector("video")!.getAttribute("src")).toBe(
      "/landing/hero/en/16x10-dark.mp4",
    );
  });

  it("uses the 4:5 cut below md", () => {
    withMotion({ wide: false });
    const { container } = render(<HeroVideo label={LABEL} />);
    expect(container.querySelector("video")!.getAttribute("src")).toBe(
      "/landing/hero/en/4x5-light.mp4",
    );
  });

  it("does not play while the hero is out of view", () => {
    withMotion({ inView: false });
    render(<HeroVideo label={LABEL} />);
    expect(play).not.toHaveBeenCalled();
  });

  it("offers a pause control that stops the video and toggles its label", () => {
    withMotion();
    render(<HeroVideo label={LABEL} />);
    fireEvent.click(screen.getByRole("button", { name: "Jeda animasi" }));
    expect(pause).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Putar animasi" })).toBeTruthy();
  });
});
