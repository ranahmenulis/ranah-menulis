import { cleanup, configure, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ProjectDetail } from "@/features/projects/components/project-detail";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import type { ProjectFixture } from "@/features/projects/types";

configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});
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

  it("sends Daftar to the registration page", async () => {
    await open("lomba-cerpen-hujan-2026");
    const link = within(aside()).getByRole("link", { name: "Daftar" });
    expect(link.getAttribute("href")).toBe("/projects/lomba-cerpen-hujan-2026/daftar");
  });

  it("shows your own registration instead of Daftar, and fills a seat for a confirmed one", async () => {
    const slug = "kelas-menulis-puisi-dasar";
    localStorage.setItem(
      "ranah.registrations",
      JSON.stringify({
        [slug]: {
          slug,
          registeredAt: Date.now(),
          agreedAt: Date.now(),
          termsVersion: "2026-11-contoh",
          status: "terdaftar",
        },
      }),
    );
    await open(slug);
    const facts = within(aside());
    expect((facts.getByRole("button", { name: "Terdaftar" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect(facts.queryByRole("link", { name: "Daftar" })).toBeNull();
    expect(facts.getByText("Sisa 5 dari 30 kuota")).toBeTruthy();
    expect(facts.getByText(/^Terdaftar pada /)).toBeTruthy();
    expect(facts.getByRole("link", { name: "Lihat pendaftaran" }).getAttribute("href")).toBe(
      `/projects/${slug}/daftar`,
    );
  });

  it("shows a payment that is still waiting, without filling a seat", async () => {
    const slug = "kelas-menulis-puisi-dasar";
    localStorage.setItem(
      "ranah.registrations",
      JSON.stringify({
        [slug]: {
          slug,
          registeredAt: Date.now(),
          agreedAt: Date.now(),
          termsVersion: "2026-11-contoh",
          status: "menunggu-pembayaran",
        },
      }),
    );
    await open(slug);
    expect(within(aside()).getByRole("button", { name: "Menunggu pembayaran" })).toBeTruthy();
    expect(within(aside()).getByText("Sisa 6 dari 30 kuota")).toBeTruthy();
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
