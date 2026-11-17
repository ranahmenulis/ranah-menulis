import { act, cleanup, configure, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { settlePayment } from "@/features/projects/registration-store";
import { PaymentView } from "@/features/projects/components/payment-view";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import type { ProjectFixture } from "@/features/projects/types";
import { registration } from "../helpers";

configure({ asyncUtilTimeout: 5000 });

const CERPEN = "lomba-cerpen-hujan-2026";
const KELAS = "kelas-cerpen-untuk-pemula";
const HOUR = 3_600_000;

function register(slug: string, over = {}) {
  const key = "ranah.registrations";
  const current = JSON.parse(localStorage.getItem(key) ?? "{}");
  current[slug] = registration(slug, over);
  localStorage.setItem(key, JSON.stringify(current));
}

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});
afterEach(cleanup);

async function open(slug: string, source: ProjectFixture[] = projectFixtures) {
  render(<PaymentView slug={slug} source={source} />);
  return screen.findByRole("heading", { level: 1 });
}

const back = () => screen.getByRole("link", { name: /Kembali ke proyek/ });

describe("PaymentView", () => {
  it("shows the amount, the hold and a QRIS sample clearly marked as one", async () => {
    register(CERPEN, { status: "menunggu-pembayaran" });
    expect((await open(CERPEN)).textContent).toBe("Selesaikan pembayaran.");
    expect(screen.getByText(/Rp\s?35\.000/)).toBeTruthy();
    expect(screen.getByRole("img", { name: /bukan kode asli/ })).toBeTruthy();
    expect(screen.getByText(/Kuotamu ditahan sampai/).textContent).toMatch(/sisa/);
    expect(back().getAttribute("href")).toBe(`/projects/${CERPEN}`);
  });

  it("turns into the paid screen when payment arrives, with the way to send work", async () => {
    register(CERPEN, { status: "menunggu-pembayaran" });
    await open(CERPEN);
    act(() => {
      settlePayment(CERPEN, Date.now());
    });
    expect(await screen.findByRole("heading", { name: "Pembayaran diterima." })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Kirim karya" })).toBeTruthy();
  });

  it("says the time ran out, and offers registering again while the project is open", async () => {
    register(CERPEN, { status: "menunggu-pembayaran", registeredAt: Date.now() - 25 * HOUR });
    expect((await open(CERPEN)).textContent).toBe("Waktu pembayaran habis.");
    expect(screen.getByRole("link", { name: "Daftar lagi" }).getAttribute("href")).toBe(
      `/projects/${CERPEN}/daftar`,
    );
  });

  it("explains instead of showing a payment for a free project, or one you did not join", async () => {
    register(KELAS, { status: "terdaftar" });
    await open(KELAS);
    expect(screen.getByText(/Proyek ini gratis|Pembayaran diterima/)).toBeTruthy();
    cleanup();
    localStorage.clear();
    await open(CERPEN);
    expect(screen.getByText(/belum mendaftar/)).toBeTruthy();
    expect(back()).toBeTruthy();
  });

  it("does not offer QRIS for a price only in ringgit", async () => {
    const source = projectFixtures.map((p) =>
      p.slug === CERPEN ? { ...p, fee: { myr: 1200 } } : p,
    );
    register(CERPEN, { status: "menunggu-pembayaran" });
    await open(CERPEN, source);
    expect(screen.getByText(/ringgit \(MYR\) menyusul/)).toBeTruthy();
    expect(screen.queryByRole("img", { name: /QRIS/ })).toBeNull();
  });

  it("is not found for an unknown project", async () => {
    render(<PaymentView slug="tidak-ada" />);
    expect(await screen.findByText("Proyek ini tidak ditemukan.")).toBeTruthy();
  });
});
