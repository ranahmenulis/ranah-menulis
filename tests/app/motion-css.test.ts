import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/app/globals.css", "utf8");
const layout = readFileSync("src/app/layout.tsx", "utf8");

describe("scroll motion in globals.css", () => {
  it("only smooth-scrolls anchors when reduced motion is not requested", () => {
    const block = css.match(
      /@media \(prefers-reduced-motion: no-preference\) \{\s*html \{\s*scroll-behavior: smooth;/,
    );
    expect(block).not.toBeNull();
    // No unconditional smooth scrolling anywhere else.
    expect(css.match(/scroll-behavior: smooth/g)).toHaveLength(1);
  });

  it("lets Next.js keep route changes instant while anchors glide", () => {
    expect(layout).toContain('data-scroll-behavior="smooth"');
  });

  it("applies the edge fade only where scroll timelines exist", () => {
    const supports = css.indexOf("@supports (animation-timeline: scroll())");
    expect(supports).toBeGreaterThan(-1);
    expect(css.indexOf("animation-timeline: scroll(self inline)")).toBeGreaterThan(supports);
    expect(css.indexOf(".scroll-edge-fade")).toBeGreaterThan(supports);
  });
});
