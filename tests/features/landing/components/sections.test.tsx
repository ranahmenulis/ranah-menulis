import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// The closing section renders the waitlist form, whose server action is server-only.
vi.mock("@/features/landing/waitlist/actions", () => ({ joinWaitlist: vi.fn() }));
import { Ecosystem } from "@/features/landing/components/ecosystem";
import { Footer } from "@/features/landing/components/footer";
import { Publishing } from "@/features/landing/components/publishing";
import { SocialProof } from "@/features/landing/components/social-proof";
import { MARKERS } from "@/features/landing/components/studio-markers";
import { textStats } from "@/features/landing/components/studio-mockup";
import { Waitlist } from "@/features/landing/components/waitlist";
import { WritingExperience } from "@/features/landing/components/writing-experience";
import { landing } from "@/features/landing/copy/id";
import { SOCIAL_PROOF } from "@/features/landing/social-proof";
import { resetLoops } from "@/features/landing/motion/loop-registry";

afterEach(() => {
  cleanup();
  resetLoops();
});

describe("social proof", () => {
  it("states every number in one line and leads to the waitlist", () => {
    render(<SocialProof copy={landing.socialProof} />);
    const line = screen.getByText(SOCIAL_PROOF.books).closest("p")!;
    expect(line.textContent).toBe("1k+ penulis, 1k+ karya, 100 buku terbit, dan 10 program.");
    expect(screen.getByRole("link", { name: /Gabung bersama mereka/ }).getAttribute("href")).toBe(
      "#daftar",
    );
  });
});

describe("ecosystem", () => {
  it("names the five modules in the client's order, titles only", () => {
    render(<Ecosystem copy={landing.ecosystem} />);
    const names = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(names).toEqual([
      "Ranah Streak",
      "Ranah Project",
      "Ranah Studio",
      "Ranah Community",
      "Marketplace",
    ]);
  });

  it("marks Streak as part of Studio and Marketplace as coming later", () => {
    render(<Ecosystem copy={landing.ecosystem} />);
    const item = (name: string) => screen.getByRole("heading", { name }).closest("li")!;
    expect(within(item("Ranah Streak")).getByText("Bagian dari Studio")).toBeTruthy();
    expect(within(item("Marketplace")).getAllByText("Menyusul").length).toBeGreaterThan(0);
  });

  it("gives every module a described picture", () => {
    const { container } = render(<Ecosystem copy={landing.ecosystem} />);
    const frames = Array.from(container.querySelectorAll('figure[role="img"]'));
    const labels = frames.map((el) => el.getAttribute("aria-label"));
    expect(labels).toEqual(Object.values(landing.ecosystem.modules).map((m) => m.preview));
  });
});

describe("studio mockup markers", () => {
  it("point at the legend entries they show", () => {
    const name = (n: number) => landing.studio.features[n - 1].name;
    expect(name(MARKERS.format)).toBe("Text Formatter");
    expect(name(MARKERS.target)).toBe("Target Harian");
    expect(name(MARKERS.counter)).toBe("Word & Character Counter");
    expect(name(MARKERS.reading)).toBe("Reading Time");
  });

  it("pair every marked legend entry with its pin, matching the rules in globals.css", () => {
    const { container } = render(<WritingExperience copy={landing.studio} />);
    const entries = Array.from(container.querySelectorAll("li[data-marker-for]"));
    const marked = entries.map((li) => li.getAttribute("data-marker-for"));
    // globals.css ("Studio legend") names these four by hand.
    expect(marked).toEqual(["1", "3", "5", "6"]);
    for (const n of marked) expect(container.querySelector(`[data-marker="${n}"]`)).toBeTruthy();
    const statistics = screen.getByRole("heading", { name: "Statistik Menulis" }).closest("li")!;
    expect(statistics.hasAttribute("data-marker-for")).toBe(false);
  });
});

describe("studio mockup counts", () => {
  it("counts words, characters without line breaks, and at least one minute", () => {
    expect(textStats(["satu dua tiga", "empat lima"])).toEqual({
      words: 5,
      characters: 23,
      minutes: 1,
    });
  });

  it("rounds reading time up at 200 words a minute", () => {
    const words = Array.from({ length: 201 }, () => "kata").join(" ");
    expect(textStats([words]).minutes).toBe(2);
  });
});

describe("publishing", () => {
  it("lists the four Projects paths under the client's heading", () => {
    render(<Publishing copy={landing.publishing} />);
    expect(screen.getByRole("heading", { level: 3 }).textContent).toBe(
      "Berbagai Jalur Penerbitan Sesuai Tahap Perjalananmu",
    );
    const names = screen.getAllByRole("heading", { level: 4 }).map((h) => h.textContent);
    expect(names).toEqual(["Antologi", "Solo Book", "Kelas Menulis", "Lomba Menulis"]);
  });

  it("leads to the waitlist while the app is closed", () => {
    render(<Publishing copy={landing.publishing} />);
    const cta = screen.getByRole("link", { name: /Terbitkan Karyamu Sekarang/ });
    expect(cta.getAttribute("href")).toBe("#daftar");
  });
});

describe("writing experience", () => {
  it("shows the six feature tiles and marks templates as coming later", () => {
    render(<WritingExperience copy={landing.studio} />);
    const tiles = screen.getAllByRole("heading", { level: 3 });
    expect(tiles).toHaveLength(6);
    const template = screen.getByRole("heading", { name: "Template Menulis" }).closest("li")!;
    expect(within(template).getByText("Menyusul")).toBeTruthy();
    const counter = screen.getByRole("heading", { name: "Reading Time" }).closest("li")!;
    expect(within(counter).queryByText("Menyusul")).toBeNull();
  });
});

describe("closing section", () => {
  it("uses the opposite theme so it always stands apart from the page", () => {
    const { container } = render(<Waitlist waitlist={landing.waitlist} />);
    const section = container.querySelector("#daftar")!;
    expect(section.classList.contains("theme-invert")).toBe(true);
    expect(section.hasAttribute("data-theme")).toBe(false);
  });

  it("names the four pillars from the client's image", () => {
    render(<Waitlist waitlist={landing.waitlist} />);
    const pillars = within(screen.getByRole("list", { name: "Yang ada di RanahMenulis" }))
      .getAllByRole("listitem")
      .map((li) => li.lastElementChild?.textContent);
    expect(pillars).toEqual([
      "Ruang Menulis Fokus",
      "Komunitas Positif",
      "Peluang Terbit",
      "Pengembangan Diri",
    ]);
  });
});

describe("footer", () => {
  it("shows social accounts without inventing links", () => {
    render(<Footer copy={landing} />);
    const social = screen.getByRole("list", { name: "Media sosial" });
    expect(within(social).queryAllByRole("link")).toHaveLength(0);
    expect(within(social).getByRole("img", { name: "Instagram, Segera tersedia" })).toBeTruthy();
  });

  it("links every product and program to its section", () => {
    render(<Footer copy={landing} />);
    expect(screen.getByRole("link", { name: "Marketplace" }).getAttribute("href")).toBe(
      "#ekosistem",
    );
    expect(screen.getByRole("link", { name: "Lomba Menulis" }).getAttribute("href")).toBe(
      "#penerbitan",
    );
  });

  it("keeps pages that do not exist yet visible but not linked", () => {
    render(<Footer copy={landing} />);
    expect(screen.queryByRole("link", { name: "Pusat Bantuan" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Syarat & Ketentuan" })).toBeNull();
    expect(screen.getByText("Syarat & Ketentuan")).toBeTruthy();
  });
});
