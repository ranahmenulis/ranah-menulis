import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Hero } from "@/features/landing/components/hero";
import { landing } from "@/features/landing/copy/id";
import { MOTION_CLASS } from "@/features/landing/motion/motion-env";

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove(MOTION_CLASS);
});

function renderHero() {
  return render(<Hero copy={landing.hero} studio={landing.studio} />);
}

describe("hero", () => {
  it("reads as one sentence in three lines", () => {
    renderHero();
    const title = screen.getByRole("heading", { level: 1 });
    expect(title.textContent).toBe("Ruang Digital Untuk Setiap Ceritamu. Mulai Bersama Kami.");
    expect(title.querySelectorAll(":scope > span")).toHaveLength(3);
    expect(title.children[1].className).toContain("lp-hero-serif");
  });

  it("has one pill, one filled button and one text link", () => {
    renderHero();
    const pill = screen.getByText(/Digital Writing Ecosystem/);
    expect(pill.textContent).toContain("Indonesia · Malaysia");
    expect(screen.getByRole("link", { name: "Gabung daftar tunggu" }).getAttribute("href")).toBe(
      "#daftar",
    );
    expect(screen.getByRole("link", { name: "Jelajahi Ekosistem" }).getAttribute("href")).toBe(
      "#ekosistem",
    );
  });

  it("stands the picture at rest without landing motion", () => {
    const { container } = renderHero();
    const band = container.querySelector<HTMLElement>(".lp-band")!;
    expect(band.style.getPropertyValue("--par")).toBe("");
    expect(band.style.getPropertyValue("--lift")).toBe("");
    // The engraving is decorative: the editor figure carries the description.
    expect(band.querySelector("img[alt='']")).toBeTruthy();
    expect(screen.getByRole("img", { name: landing.studio.mockup })).toBeTruthy();
  });

  it("shows Studio once, with the six feature names and templates marked as coming later", () => {
    renderHero();
    const stage = screen.getByRole("region", { name: "Ranah Studio" });
    expect(stage.id).toBe("studio");
    const features = within(stage).getByRole("list", { name: landing.studio.featuresLabel });
    const items = within(features).getAllByRole("listitem");
    expect(items).toHaveLength(6);
    expect(items[3].textContent).toBe("Template MenulisMenyusul");
    expect(items[5].textContent).toBe("Reading Time");
  });

  it("drifts the picture when landing motion is on", () => {
    document.documentElement.classList.add(MOTION_CLASS);
    const { container } = renderHero();
    const band = container.querySelector<HTMLElement>(".lp-band")!;
    // jsdom has no layout: the band's top is 0 and the viewport 768, so it is fully risen.
    expect(band.style.getPropertyValue("--par")).toBe("-60.0px");
    expect(band.style.getPropertyValue("--lift")).toBe("-36.0px");
  });
});
