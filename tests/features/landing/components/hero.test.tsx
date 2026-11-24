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
    expect(title.textContent).toBe("Dari Penulis Pemula, Menjadi Penulis yang Berkarya.");
    expect(title.querySelectorAll(":scope > span")).toHaveLength(3);
    expect(title.children[1].className).toContain("lp-hero-serif");
  });

  it("has one pill, one filled button and one text link", () => {
    renderHero();
    const pill = screen.getByText(/Writer Development Platform/);
    expect(pill.textContent).toContain("Indonesia · Malaysia");
    expect(
      screen.getByRole("link", { name: "Mulai Perjalanan Menulis" }).getAttribute("href"),
    ).toBe("#daftar");
    expect(screen.getByRole("link", { name: "Jelajahi RanahMenulis" }).getAttribute("href")).toBe(
      "#ekosistem",
    );
  });

  it("stands the picture at rest without landing motion", () => {
    const { container } = renderHero();
    const band = container.querySelector<HTMLElement>(".lp-band")!;
    expect(band.style.getPropertyValue("--par")).toBe("");
    expect(band.style.getPropertyValue("--lift")).toBe("");
    expect(screen.getByRole("img", { name: landing.studio.mockup })).toBeTruthy();
  });

  it("shows Studio once, as the app's own editor that cannot be used", () => {
    renderHero();
    const stage = screen.getByRole("region", { name: "Ranah Studio" });
    expect(stage.id).toBe("studio");
    const editor = screen.getByRole("img", { name: landing.studio.mockup });
    // The real editor bar and format bar, with the sample manuscript, inert as a whole.
    expect(editor.querySelector("[inert]")).toBeTruthy();
    expect(editor.querySelector('[role="toolbar"]')?.getAttribute("aria-label")).toBe(
      "Format teks",
    );
    expect(editor.textContent).toContain(landing.doc.title);
    expect(editor.textContent).toContain("320 / 500");
    expect(within(stage).getByText(landing.studio.caption)).toBeTruthy();
  });

  it("names the six Studio features with the app's own labels", () => {
    renderHero();
    const features = screen.getByRole("list", { name: landing.studio.featuresLabel });
    const items = within(features)
      .getAllByRole("listitem")
      .map((li) => li.textContent);
    expect(items).toEqual([
      "Format teks",
      "Penghitung tulisan",
      "Waktu baca",
      "Kata hari ini",
      "Timer sprint",
      "Statistik",
    ]);
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
