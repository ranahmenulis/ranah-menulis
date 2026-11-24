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
import { resetLoops } from "@/features/landing/motion/loop-registry";

afterEach(() => {
  cleanup();
  resetLoops();
});

describe("social proof", () => {
  it("states every number in one line, without a second call to action", () => {
    render(<SocialProof copy={landing.socialProof} />);
    const line = screen.getByText(SOCIAL_PROOF.books).closest("p")!;
    expect(line.textContent).toBe("1k+ penulis, 1k+ karya, 100 buku terbit, dan 10 program.");
    expect(screen.queryByRole("link")).toBeNull();
  });
});

describe("ecosystem", () => {
  it("names four modules in the client's order, titles only: Studio is the hero", () => {
    render(<Ecosystem copy={landing.ecosystem} />);
    const names = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(names).toEqual(["Ranah Streak", "Ranah Project", "Ranah Community", "Marketplace"]);
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
    const { streak, project, community, marketplace } = landing.ecosystem.modules;
    expect(labels).toEqual([streak, project, community, marketplace].map((m) => m.preview));
  });
});

describe("publishing", () => {
  it("lists the four Projects paths by name, in the client's order", () => {
    render(<Publishing copy={landing.publishing} />);
    const items = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(items).toEqual(["Antologi", "Solo Book", "Kelas Menulis", "Lomba Menulis"]);
    expect(screen.getByRole("img", { name: landing.publishing.covers })).toBeTruthy();
  });

  it("leads to the waitlist while the app is closed", () => {
    render(<Publishing copy={landing.publishing} />);
    const cta = screen.getByRole("link", { name: /Terbitkan Karyamu Sekarang/ });
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
