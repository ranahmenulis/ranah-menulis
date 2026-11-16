import { cleanup, configure, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectsView } from "@/features/projects/components/projects-view";
import type { ProjectFixture } from "@/features/projects/types";
import { lombaFixtures } from "@/features/projects/fixtures/lomba";

// Outside Next there is no router, so the address is read straight from the window.
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

configure({ asyncUtilTimeout: 5000 });

const at = (query: string) => window.history.replaceState(null, "", `/projects${query}`);

beforeEach(() => {
  window.history.replaceState(null, "", "/projects");
  localStorage.clear();
});
afterEach(cleanup);

const DAY = 24 * 60 * 60 * 1000;

function project(over: Partial<ProjectFixture>): ProjectFixture {
  return { ...lombaFixtures[0], ...over };
}

const source = [
  project({ slug: "a", title: "Lomba A", category: "lomba", closesInMs: 20 * DAY, fee: {} }),
  project({ slug: "b", title: "Lomba B", category: "lomba", closesInMs: -2 * DAY, fee: {} }),
  project({
    slug: "c",
    title: "Kelas C",
    category: "kelas",
    closesInMs: 2 * DAY,
    fee: { idr: 100_000 },
  }),
];

const titles = () => screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);

describe("ProjectsView", () => {
  it("lists every published project under the page heading", async () => {
    render(<ProjectsView source={source} />);
    expect((await screen.findByRole("heading", { level: 1 })).textContent).toBe("Projects");
    expect(titles()).toEqual(["Lomba A", "Lomba B", "Kelas C"]);
    expect(screen.getByRole("status").textContent).toBe("3 proyek");
  });

  it("opens each project from its title", async () => {
    render(<ProjectsView source={source} />);
    const link = await screen.findByRole("link", { name: "Kelas C" });
    expect(link.getAttribute("href")).toBe("/projects/c");
  });

  it("filters by category and keeps the choice in the address", async () => {
    render(<ProjectsView source={source} />);
    const bar = await screen.findByRole("toolbar", { name: "Kategori" });
    fireEvent.click(within(bar).getByRole("button", { name: "Kelas Menulis" }));
    expect(titles()).toEqual(["Kelas C"]);
    expect(window.location.search).toBe("?kategori=kelas");
    fireEvent.click(within(bar).getByRole("button", { name: "Semua" }));
    expect(window.location.search).toBe("");
  });

  it("filters by status and fee, and says how many match", async () => {
    render(<ProjectsView source={source} />);
    const status = await screen.findByRole("group", { name: "Status" });
    fireEvent.click(within(status).getByRole("button", { name: "Segera tutup" }));
    expect(titles()).toEqual(["Kelas C"]);
    fireEvent.click(within(status).getByRole("button", { name: "Ditutup" }));
    expect(titles()).toEqual(["Lomba B"]);

    const fee = screen.getByRole("group", { name: "Biaya" });
    fireEvent.click(within(fee).getByRole("button", { name: "Berbayar" }));
    expect(screen.getByRole("status").textContent).toBe("Tidak ada proyek");
  });

  it("clears the filters from the empty result", async () => {
    at("?status=ditutup&biaya=berbayar");
    render(<ProjectsView source={source} />);
    expect(
      await screen.findByText("Tidak ada proyek yang cocok dengan penyaring ini."),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Hapus penyaring" }));
    expect(titles()).toHaveLength(3);
  });

  it("explains an empty category and offers the whole catalog", async () => {
    at("?kategori=solo");
    render(<ProjectsView source={source} />);
    expect(await screen.findByText("Belum ada proyek Solo yang dibuka.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Lihat semua Projects" }));
    expect(titles()).toHaveLength(3);
  });

  it("never lists a draft", async () => {
    render(
      <ProjectsView
        source={[...source, project({ slug: "d", title: "Draf D", publication: "draf" })]}
      />,
    );
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByText("Draf D")).toBeNull();
  });

  it("says when there is nothing at all", async () => {
    render(<ProjectsView source={[]} />);
    expect(await screen.findByText("Belum ada proyek yang dibuka.")).toBeTruthy();
  });

  it("starts from the filters in the address", async () => {
    at("?kategori=lomba");
    render(<ProjectsView source={source} />);
    await screen.findByRole("heading", { level: 1 });
    expect(titles()).toEqual(["Lomba A", "Lomba B"]);
    const bar = screen.getByRole("toolbar", { name: "Kategori" });
    expect(within(bar).getByRole("button", { name: "Lomba" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
  });

  it("keeps a very long title and a huge quota inside the row", async () => {
    const long = "Antologi ".repeat(30) + "Sangat".repeat(30);
    render(
      <ProjectsView
        source={[project({ slug: "x", title: long, quota: { total: 1_000_000, taken: 12 } })]}
      />,
    );
    const heading = (await screen.findAllByRole("heading", { level: 2 }))[0];
    expect(heading.className).toContain("wrap-anywhere");
    expect(screen.getByText("Sisa 999.988 dari 1.000.000 kuota")).toBeTruthy();
  });

  it("follows the address when it changes under it, instead of keeping a stale choice", async () => {
    const view = render(<ProjectsView source={source} />);
    const bar = await screen.findByRole("toolbar", { name: "Kategori" });
    fireEvent.click(within(bar).getByRole("button", { name: "Lomba" }));
    expect(titles()).toEqual(["Lomba A", "Lomba B"]);

    // Back on the catalog through its plain link: the address has no filter any more.
    at("");
    view.rerender(<ProjectsView source={source} />);
    expect(titles()).toEqual(["Lomba A", "Lomba B", "Kelas C"]);
    expect(
      within(screen.getByRole("toolbar", { name: "Kategori" }))
        .getByRole("button", { name: "Semua" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("shows one seat less for a project you registered for", async () => {
    localStorage.setItem(
      "ranah.registrations",
      JSON.stringify({
        q: {
          slug: "q",
          registeredAt: 1,
          agreedAt: 1,
          termsVersion: "1",
          status: "terdaftar",
        },
      }),
    );
    render(
      <ProjectsView
        source={[project({ slug: "q", title: "Lomba Q", quota: { total: 10, taken: 4 } })]}
      />,
    );
    expect(await screen.findByText("Sisa 5 dari 10 kuota")).toBeTruthy();
  });
});
