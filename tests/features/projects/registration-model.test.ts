import { describe, expect, it } from "vitest";
import {
  applyRegistrations,
  canRegister,
  newRegistration,
  registerAction,
  registrationFee,
} from "@/features/projects/registration-model";
import { resolveProjects } from "@/features/projects/project-model";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import type { Project, Registration } from "@/features/projects/types";

const NOW = Date.UTC(2026, 10, 16, 5, 0, 0);
const projects = resolveProjects(projectFixtures, NOW);
const get = (slug: string): Project => projects.find((p) => p.slug === slug) as Project;

const reg = (over: Partial<Registration> = {}): Registration => ({
  slug: "kelas-cerpen-untuk-pemula",
  registeredAt: NOW,
  agreedAt: NOW,
  termsVersion: "1",
  status: "terdaftar",
  ...over,
});

describe("registrationFee", () => {
  it("uses the project fee, and the chosen package for Solo", () => {
    expect(registrationFee(get("lomba-cerpen-hujan-2026"))).toEqual({ idr: 35_000, myr: 1200 });
    const solo = get("solo-penerbitan-buku-sendiri");
    expect(registrationFee(solo, "Terbit Lengkap")).toEqual({ idr: 3_500_000, myr: 120_000 });
  });

  it("falls back to the starting price when no package is chosen yet", () => {
    expect(registrationFee(get("solo-penerbitan-buku-sendiri")).idr).toBe(1_500_000);
  });
});

describe("newRegistration", () => {
  it("registers a free project right away", () => {
    const r = newRegistration(get("kelas-cerpen-untuk-pemula"), NOW);
    expect(r).toMatchObject({ slug: "kelas-cerpen-untuk-pemula", status: "terdaftar" });
    expect(r.registeredAt).toBe(NOW);
    expect(r.agreedAt).toBe(NOW);
  });

  it("keeps a paid project waiting for payment", () => {
    expect(newRegistration(get("lomba-cerpen-hujan-2026"), NOW).status).toBe("menunggu-pembayaran");
  });

  it("records the terms version that was shown and the package for Solo", () => {
    const project = get("solo-penerbitan-buku-sendiri");
    const r = newRegistration(project, NOW, "Naskah Siap Terbit");
    expect(r.termsVersion).toBe(project.terms.version);
    expect(r.packageName).toBe("Naskah Siap Terbit");
    expect(newRegistration(get("lomba-cerpen-hujan-2026"), NOW).packageName).toBeUndefined();
  });
});

describe("canRegister", () => {
  const solo = get("solo-penerbitan-buku-sendiri");

  it("needs the terms accepted", () => {
    expect(canRegister(get("lomba-cerpen-hujan-2026"), { agreed: false })).toBe(false);
    expect(canRegister(get("lomba-cerpen-hujan-2026"), { agreed: true })).toBe(true);
  });

  it("needs a package that exists for Solo, and ignores one elsewhere", () => {
    expect(canRegister(solo, { agreed: true })).toBe(false);
    expect(canRegister(solo, { agreed: true, packageName: "Tidak ada" })).toBe(false);
    expect(canRegister(solo, { agreed: true, packageName: "Terbit Lengkap" })).toBe(true);
  });
});

describe("registerAction", () => {
  const call = (state: Parameters<typeof registerAction>[0], guest: boolean, r?: Registration) =>
    registerAction(state, guest, r, NOW);

  it("offers Daftar while the project is open", () => {
    expect(call("buka", false)).toEqual({ label: "Daftar", enabled: true });
    expect(call("segera-tutup", false)).toEqual({ label: "Daftar", enabled: true });
  });

  it("names why it cannot be used", () => {
    expect(call("kuota-penuh", false)).toEqual({ label: "Kuota penuh", enabled: false });
    expect(call("ditutup", false)).toEqual({ label: "Pendaftaran ditutup", enabled: false });
    expect(call("buka", true)).toEqual({ label: "Masuk untuk mendaftar", enabled: false });
    expect(call("kuota-penuh", true).label).toBe("Kuota penuh");
  });

  it("shows your own registration, even after the project closed or filled up", () => {
    expect(call("ditutup", false, reg())).toEqual({ label: "Terdaftar", enabled: false });
    // Waiting for payment leads to the payment page, even when the project filled up meanwhile.
    expect(call("kuota-penuh", false, reg({ status: "menunggu-pembayaran" }))).toEqual({
      label: "Bayar sekarang",
      enabled: true,
    });
  });

  it("offers Daftar again once the payment hold ran out", () => {
    const old = reg({ status: "menunggu-pembayaran", registeredAt: NOW - 25 * 3_600_000 });
    expect(call("buka", false, old)).toEqual({ label: "Daftar", enabled: true });
    expect(call("kuota-penuh", false, old).label).toBe("Kuota penuh");
  });

  it("ignores a registration stored on this device when signed out", () => {
    expect(call("buka", true, reg()).label).toBe("Masuk untuk mendaftar");
  });
});

describe("applyRegistrations", () => {
  const slug = "kelas-menulis-puisi-dasar";

  it("fills one seat for a confirmed registration", () => {
    const before = get(slug).quota?.taken as number;
    const after = applyRegistrations(projects, { [slug]: reg({ slug }) }, NOW).find(
      (p) => p.slug === slug,
    );
    expect(after?.quota?.taken).toBe(before + 1);
  });

  it("holds a seat while payment is pending", () => {
    const before = get(slug).quota?.taken as number;
    const after = applyRegistrations(
      projects,
      { [slug]: reg({ slug, status: "menunggu-pembayaran" }) },
      NOW,
    ).find((p) => p.slug === slug);
    expect(after?.quota?.taken).toBe(before + 1);
  });

  it("gives the seat back once the hold ran out", () => {
    const before = get(slug).quota?.taken;
    const expired = reg({
      slug,
      status: "menunggu-pembayaran",
      registeredAt: NOW - 25 * 3_600_000,
    });
    const after = applyRegistrations(projects, { [slug]: expired }, NOW).find(
      (p) => p.slug === slug,
    );
    expect(after?.quota?.taken).toBe(before);
  });

  it("leaves projects without a quota, and the input list, untouched", () => {
    const solo = "solo-penerbitan-buku-sendiri";
    const result = applyRegistrations(projects, { [solo]: reg({ slug: solo }) }, NOW);
    expect(result.find((p) => p.slug === solo)?.quota).toBeNull();
    expect(applyRegistrations(projects, {}, NOW)).toBe(projects);
    expect(get(slug).quota?.taken).toBe(24);
  });

  it("never shows more seats taken than there are", () => {
    const full = resolveProjects(
      [{ ...projectFixtures[0], slug: "x", quota: { total: 5, taken: 5 } }],
      NOW,
    );
    expect(applyRegistrations(full, { x: reg({ slug: "x" }) }, NOW)[0].quota).toEqual({
      total: 5,
      taken: 5,
    });
  });

  it("can fill the last seat, which makes the project full", () => {
    const full = resolveProjects(
      [{ ...projectFixtures[0], slug: "x", quota: { total: 5, taken: 4 } }],
      NOW,
    );
    const after = applyRegistrations(full, { x: reg({ slug: "x" }) }, NOW);
    expect(after[0].quota).toEqual({ total: 5, taken: 5 });
  });
});
