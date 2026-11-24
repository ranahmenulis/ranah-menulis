import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// The closing section renders the waitlist form, whose server action is server-only.
vi.mock("@/features/landing/waitlist/actions", () => ({ joinWaitlist: vi.fn() }));
import { Ecosystem } from "@/features/landing/components/ecosystem";
import { Footer } from "@/features/landing/components/footer";
import { Publishing } from "@/features/landing/components/publishing";
import { SocialProof } from "@/features/landing/components/social-proof";
import { Waitlist } from "@/features/landing/components/waitlist";
import { landing } from "@/features/landing/copy/id";
import { SOCIAL_PROOF } from "@/features/landing/social-proof";

afterEach(cleanup);

describe("social proof", () => {
  it("states every number in one line, without a second call to action", () => {
    render(<SocialProof copy={landing.socialProof} />);
    const line = screen.getByText(SOCIAL_PROOF.books).closest("p")!;
    expect(line.textContent).toBe("1k+ penulis, 1k+ karya, 100 buku terbit, dan 10 program.");
    expect(screen.queryByRole("link")).toBeNull();
  });
});

describe("ecosystem", () => {
  // The module's own text column; the app screens beside it carry headings and links of their own.
  const moduleHeadings = () =>
    screen.getAllByRole("heading", { level: 3 }).filter((h) => !h.closest('figure[role="img"]'));
  const item = (name: string) =>
    moduleHeadings()
      .find((h) => h.textContent === name)!
      .closest("li")!.firstElementChild as HTMLElement;

  it("names five modules in the order a writer meets them, Studio first", () => {
    render(<Ecosystem copy={landing.ecosystem} />);
    const names = moduleHeadings().map((h) => h.textContent);
    expect(names).toEqual([
      "Ranah Studio",
      "Ranah Streak",
      "Ranah Project",
      "Ranah Community",
      "Marketplace",
    ]);
  });

  it("gives every module one benefit, and a way in only where the landing has one", () => {
    render(<Ecosystem copy={landing.ecosystem} />);
    const m = landing.ecosystem.modules;
    for (const mod of Object.values(m)) {
      expect(within(item(mod.name)).getByText(mod.benefit)).toBeTruthy();
    }
    const link = (name: string) => within(item(name)).queryByRole("link");
    expect(
      within(item("Ranah Studio"))
        .getByRole("link", { name: /Jelajahi Studio/ })
        .getAttribute("href"),
    ).toBe("#studio");
    expect(
      within(item("Ranah Project"))
        .getByRole("link", { name: /Lihat jalur penerbitan/ })
        .getAttribute("href"),
    ).toBe("#penerbitan");
    expect(link("Ranah Streak")).toBeNull();
    expect(link("Ranah Community")).toBeNull();
    expect(link("Marketplace")).toBeNull();
  });

  it("shows the app's own screens, inert, each with a description", () => {
    const { container } = render(<Ecosystem copy={landing.ecosystem} />);
    const { studio, streak, project, community } = landing.ecosystem.modules;
    const frames = Array.from(container.querySelectorAll('figure[role="img"]'));
    expect(frames.map((el) => el.getAttribute("aria-label"))).toEqual(
      [studio, streak, project, community].map((m) => m.preview),
    );
    for (const frame of frames) expect(frame.querySelector("[inert]")).toBeTruthy();
    // The real components: the Naskah table, the Streak hero, Proyek saya, and feed posts.
    expect(frames[0].querySelector("table")).toBeTruthy();
    expect(frames[1].textContent).toContain("hari berturut-turut");
    expect(frames[2].textContent).toContain("Toples Kerupuk");
    expect(frames[2].textContent).toContain("Diterima");
    expect(frames[3].querySelectorAll("article")).toHaveLength(2);
  });

  it("marks Streak as part of Studio and shows Marketplace only as planned categories", () => {
    render(<Ecosystem copy={landing.ecosystem} />);
    expect(within(item("Ranah Streak")).getByText("Bagian dari Studio")).toBeTruthy();
    const market = item("Marketplace").parentElement!;
    expect(within(market).getByText("Menyusul")).toBeTruthy();
    expect(market.querySelector('figure[role="img"]')).toBeNull();
    expect(within(market).getAllByRole("listitem")).toHaveLength(4);
  });
});

describe("publishing", () => {
  it("lists the four Projects paths with one line each, in the client's order", () => {
    render(<Publishing copy={landing.publishing} />);
    const items = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(items).toEqual(landing.publishing.paths.map(({ name, benefit }) => `${name}${benefit}`));
    expect(items[0]).toBe("AntologiTulis bersama penulis lain dalam satu buku bertema.");
    expect(screen.getByRole("img", { name: landing.publishing.covers })).toBeTruthy();
  });

  it("leads to the waitlist while the app is closed", () => {
    render(<Publishing copy={landing.publishing} />);
    const cta = screen.getByRole("link", { name: /Lihat Peluang Menerbitkan Karya/ });
    expect(cta.getAttribute("href")).toBe("#daftar");
  });
});

describe("closing section", () => {
  it("always uses the dark tokens, in both themes", () => {
    const { container } = render(<Waitlist waitlist={landing.waitlist} />);
    const section = container.querySelector("#daftar")!;
    expect(section.classList.contains("theme-dark")).toBe(true);
    expect(section.classList.contains("theme-invert")).toBe(false);
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
