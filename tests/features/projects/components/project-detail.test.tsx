import { cleanup, configure, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ProjectDetail } from "@/features/projects/components/project-detail";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import type { ProjectFixture } from "@/features/projects/types";

configure({ asyncUtilTimeout: 5000 });

beforeEach(() => sessionStorage.clear());
afterEach(cleanup);

const DAY = 24 * 60 * 60 * 1000;
const find = (slug: string) => projectFixtures.find((p) => p.slug === slug) as ProjectFixture;

async function open(slug: string, source: ProjectFixture[] = projectFixtures) {
  render(<ProjectDetail slug={slug} source={source} />);
  return screen.findByRole("heading", { level: 1 });
}

const aside = () => screen.getByRole("complementary", { name: "Pendaftaran" });

describe("ProjectDetail", () => {
  it("leads with the title and a visible way back to the catalog", async () => {
    expect((await open("lomba-cerpen-hujan-2026")).textContent).toBe("Lomba Cerpen Hujan 2026");
    expect(screen.getByRole("link", { name: "Semua Projects" }).getAttribute("href")).toBe(
      "/projects",
    );
  });

  it("shows the fee per currency, the quota, and the deadline with its zone", async () => {
    await open("antologi-surat-yang-tidak-pernah-terkirim");
    const facts = within(aside());
    expect(facts.getByText("Rp75.000")).toBeTruthy();
    expect(facts.getByText("RM25")).toBeTruthy();
    expect(facts.getByText("Sisa 9 dari 40 kuota")).toBeTruthy();
    expect(facts.getByText(/^Tutup .* WIB$/)).toBeTruthy();
    expect(facts.getByText("21 hari lagi")).toBeTruthy();
  });

  it("offers a disabled Daftar while registration does not exist yet", async () => {
    await open("lomba-cerpen-hujan-2026");
    const button = within(aside()).getByRole("button", { name: "Daftar" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("names a full project and a closed one instead of offering Daftar", async () => {
    await open("lomba-puisi-pendek-nusantara");
    expect(within(aside()).getByRole("button", { name: "Kuota penuh" })).toBeTruthy();
    expect(within(aside()).getByText(/MYT$/)).toBeTruthy();
    cleanup();
    await open("antologi-pulang-ke-pesisir");
    expect(within(aside()).getByRole("button", { name: "Pendaftaran ditutup" })).toBeTruthy();
    expect(within(aside()).getByText(/^Ditutup /)).toBeTruthy();
  });

  it("asks guests to sign in", async () => {
    sessionStorage.setItem("rm-viewer", "tamu");
    await open("lomba-cerpen-hujan-2026");
    expect(within(aside()).getByRole("button", { name: "Masuk untuk mendaftar" })).toBeTruthy();
  });

  it("shows the Lomba criteria and prizes, and says judging is anonymous", async () => {
    await open("lomba-cerpen-hujan-2026");
    expect(screen.getByRole("heading", { name: "Kriteria dan hadiah" })).toBeTruthy();
    expect(screen.getByText("Orisinalitas")).toBeTruthy();
    expect(screen.getByText(/Penilaian anonim/)).toBeTruthy();
  });

  it("shows Solo packages with a starting price and no quota", async () => {
    await open("solo-penerbitan-buku-sendiri");
    expect(screen.getByRole("heading", { name: "Paket layanan" })).toBeTruthy();
    expect(screen.getByText("Terbit Lengkap")).toBeTruthy();
    expect(within(aside()).getByText("Mulai dari")).toBeTruthy();
    expect(within(aside()).getByText("Rp1.500.000")).toBeTruthy();
    expect(within(aside()).getByText("Tanpa kuota")).toBeTruthy();
    expect(within(aside()).getByText("Dibuka sepanjang tahun")).toBeTruthy();
  });

  it("shows the teacher and curriculum for Kelas, and the stages for Antologi", async () => {
    await open("kelas-menulis-puisi-dasar");
    expect(screen.getByText("Nadira Kusuma")).toBeTruthy();
    expect(screen.getAllByText("2 pertemuan")).toHaveLength(4);
    cleanup();
    await open("antologi-surat-yang-tidak-pernah-terkirim");
    expect(screen.getByRole("heading", { name: "Alur seleksi dan produksi" })).toBeTruthy();
  });

  it("states the copyright rule from the PRD without inventing terms", async () => {
    await open("lomba-cerpen-hujan-2026");
    expect(screen.getByText(/Hak cipta karyamu tetap padamu/)).toBeTruthy();
  });

  it("treats an unknown address and a draft as not found, with a way back", async () => {
    render(<ProjectDetail slug="tidak-ada" />);
    expect(await screen.findByText("Proyek ini tidak ditemukan.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Lihat semua Projects" })).toBeTruthy();
    cleanup();
    render(<ProjectDetail slug="antologi-puisi-tengah-malam" />);
    expect(await screen.findByText("Proyek ini tidak ditemukan.")).toBeTruthy();
  });

  it("copes with a long title and no milestones", async () => {
    const long = "Judul ".repeat(60);
    const odd: ProjectFixture = {
      ...find("lomba-cerpen-hujan-2026"),
      slug: "odd",
      title: long.trim(),
      closesInMs: 30 * DAY,
      milestones: [],
      quota: { total: 5, taken: 9 },
    };
    expect((await open("odd", [odd])).className).toContain("wrap-anywhere");
    expect(within(aside()).getAllByText("Kuota penuh")).toHaveLength(2);
  });
});
