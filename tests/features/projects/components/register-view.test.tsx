import { cleanup, configure, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterView } from "@/features/projects/components/register-view";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import type { ProjectFixture } from "@/features/projects/types";

configure({ asyncUtilTimeout: 5000 });

const KEY = "ranah.registrations";

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const DAY = 24 * 60 * 60 * 1000;

async function open(slug: string, source: ProjectFixture[] = projectFixtures) {
  render(<RegisterView slug={slug} source={source} />);
  return screen.findByRole("heading", { level: 1 });
}

const stored = () => JSON.parse(localStorage.getItem(KEY) ?? "{}");
const agree = () => fireEvent.click(screen.getByRole("checkbox", { name: /menyetujui ketentuan/ }));
const submit = () => screen.getByRole("button", { name: "Daftar" }) as HTMLButtonElement;
const backLink = () => screen.getByRole("link", { name: /Kembali ke proyek/ });

describe("RegisterView, the form", () => {
  it("names the project and always offers a way back to it", async () => {
    expect((await open("kelas-cerpen-untuk-pemula")).textContent).toBe(
      "Daftar: Kelas Cerpen untuk Pemula",
    );
    expect(backLink().getAttribute("href")).toBe("/projects/kelas-cerpen-untuk-pemula");
  });

  it("keeps Daftar off until the terms are accepted, and says why", async () => {
    await open("kelas-cerpen-untuk-pemula");
    expect(submit().disabled).toBe(true);
    expect(screen.getByText("Setujui ketentuan untuk mendaftar.")).toBeTruthy();
    agree();
    expect(submit().disabled).toBe(false);
    agree();
    expect(submit().disabled).toBe(true);
  });

  it("shows the shared terms, the version, and says so when there are no special terms", async () => {
    await open("kelas-cerpen-untuk-pemula");
    expect(screen.getByText(/Hak cipta karyamu tetap padamu/)).toBeTruthy();
    expect(screen.getByText("Proyek ini tidak punya ketentuan khusus.")).toBeTruthy();
    expect(screen.getByText("Versi ketentuan 2026-11-contoh")).toBeTruthy();
  });

  it("lists the special terms of a project that has some", async () => {
    await open("lomba-cerpen-hujan-2026");
    expect(screen.getByText(/penilaian dilakukan anonim/)).toBeTruthy();
    expect(screen.queryByText("Proyek ini tidak punya ketentuan khusus.")).toBeNull();
  });
});

describe("RegisterView, registering", () => {
  it("registers a free project at once and records the terms version", async () => {
    await open("kelas-cerpen-untuk-pemula");
    agree();
    fireEvent.click(submit());
    expect((await screen.findByRole("heading", { level: 1 })).textContent).toBe("Kamu terdaftar.");
    const saved = stored()["kelas-cerpen-untuk-pemula"];
    expect(saved).toMatchObject({ status: "terdaftar", termsVersion: "2026-11-contoh" });
    expect(saved.agreedAt).toBeGreaterThan(0);
    expect(backLink().getAttribute("href")).toBe("/projects/kelas-cerpen-untuk-pemula");
  });

  it("holds a paid project at waiting for payment and says what it costs", async () => {
    await open("lomba-cerpen-hujan-2026");
    expect(
      screen.getByText(
        "Biaya dibayar lewat QRIS setelah mendaftar; kuotamu ditahan 24 jam [usulan].",
      ),
    ).toBeTruthy();
    agree();
    fireEvent.click(submit());
    expect((await screen.findByRole("heading", { level: 1 })).textContent).toBe(
      "Pendaftaranmu menunggu pembayaran.",
    );
    expect(screen.getByText(/Biaya Rp35.000 · RM12\./)).toBeTruthy();
    expect(stored()["lomba-cerpen-hujan-2026"].status).toBe("menunggu-pembayaran");
  });

  it("asks Solo for a package first, and charges the chosen one", async () => {
    await open("solo-penerbitan-buku-sendiri");
    agree();
    expect(submit().disabled).toBe(true);
    expect(screen.getByText("Pilih paket dan setujui ketentuan untuk mendaftar.")).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: /Terbit Lengkap/ }));
    expect(submit().disabled).toBe(false);
    expect(screen.getAllByText("Rp3.500.000 · RM1.200").length).toBeGreaterThan(0);

    fireEvent.click(submit());
    await screen.findByText("Pendaftaranmu menunggu pembayaran.");
    expect(screen.getByText(/Paket Terbit Lengkap/)).toBeTruthy();
    expect(stored()["solo-penerbitan-buku-sendiri"].packageName).toBe("Terbit Lengkap");
  });

  it("checks the deadline again at the moment of submitting", async () => {
    await open("kelas-cerpen-untuk-pemula");
    agree();
    // The page was opened while registration was open; by the time Daftar is pressed it is not.
    const real = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(real + 10 * DAY);
    fireEvent.click(submit());
    expect(await screen.findByText("Pendaftaran proyek ini sudah ditutup.")).toBeTruthy();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("shows your registration, not the form, when you come back later", async () => {
    await open("kelas-cerpen-untuk-pemula");
    agree();
    fireEvent.click(submit());
    await screen.findByText("Kamu terdaftar.");
    cleanup();
    expect((await open("kelas-cerpen-untuk-pemula")).textContent).toBe("Kamu sudah terdaftar.");
    expect(screen.queryByRole("checkbox")).toBeNull();
  });
});

describe("RegisterView, when you cannot register", () => {
  it("tells guests to sign in, with a way back", async () => {
    sessionStorage.setItem("rm-viewer", "tamu");
    await open("kelas-cerpen-untuk-pemula");
    expect(screen.getByText("Masuk untuk mendaftar ke proyek ini.")).toBeTruthy();
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(backLink()).toBeTruthy();
  });

  it("explains a full project and a closed one reached by address", async () => {
    await open("lomba-puisi-pendek-nusantara");
    expect(screen.getByText("Kuota proyek ini sudah penuh.")).toBeTruthy();
    cleanup();
    await open("antologi-pulang-ke-pesisir");
    expect(screen.getByText("Pendaftaran proyek ini sudah ditutup.")).toBeTruthy();
    expect(backLink()).toBeTruthy();
  });

  it("treats an unknown address and a draft as not found", async () => {
    render(<RegisterView slug="tidak-ada" />);
    expect(await screen.findByText("Proyek ini tidak ditemukan.")).toBeTruthy();
    cleanup();
    render(<RegisterView slug="antologi-puisi-tengah-malam" />);
    expect(await screen.findByText("Proyek ini tidak ditemukan.")).toBeTruthy();
  });

  it("copes with a long title and a very long package name", async () => {
    const odd: ProjectFixture = {
      ...projectFixtures.find((p) => p.slug === "solo-penerbitan-buku-sendiri")!,
      slug: "odd",
      title: "Judul ".repeat(60).trim(),
      closesInMs: 30 * DAY,
      block: {
        kind: "solo",
        packages: [{ name: "Paket".repeat(40), fee: { idr: 12_500_000 }, includes: [] }],
      },
    };
    expect((await open("odd", [odd])).className).toContain("wrap-anywhere");
    expect(screen.getAllByText("Paket".repeat(40)).length).toBeGreaterThan(0);
  });
});
