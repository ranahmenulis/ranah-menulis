import { describe, expect, it } from "vitest";
import {
  daysLeftLabel,
  feeLabel,
  filterProjects,
  formatMoney,
  moneyLabel,
  parseFilters,
  projectState,
  quotaLeft,
  resolveProjects,
  toQuery,
  DEFAULT_FILTERS,
} from "@/features/projects/project-model";
import type { Project, ProjectFixture } from "@/features/projects/types";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 16, 5, 0, 0);

function fixture(over: Partial<ProjectFixture> = {}): ProjectFixture {
  return {
    slug: "contoh",
    category: "lomba",
    publication: "terbit",
    title: "Lomba contoh",
    summary: "Ringkasan.",
    about: ["Paragraf."],
    requirements: ["Maksimal 1.000 kata."],
    submission: { minWords: 1, maxWords: 1000, maxWorks: 1 },
    organizer: "Tim RanahMenulis",
    timeZone: "WIB",
    fee: {},
    quota: null,
    closesInMs: 20 * DAY,
    milestones: [],
    terms: { version: "1", special: [] },
    block: { kind: "lomba", criteria: [], prizes: [], anonymous: false },
    ...over,
  };
}

function resolved(over: Partial<ProjectFixture> = {}): Project {
  return resolveProjects([fixture(over)], NOW)[0];
}

describe("resolveProjects", () => {
  it("turns offsets into absolute times relative to now", () => {
    const p = resolved({
      closesInMs: 3 * DAY,
      milestones: [{ label: "Pengumuman", inMs: 10 * DAY }],
    });
    // Deadline = the end of that calendar day in the project's zone (WIB, UTC+7).
    expect(p.closesAt).toBe(Date.UTC(2026, 10, 19, 16, 59, 59, 999));
    expect(p.milestones).toEqual([{ label: "Pengumuman", at: NOW + 10 * DAY }]);
  });

  it("keeps a project without a deadline open-ended", () => {
    expect(resolved({ closesInMs: null }).closesAt).toBeNull();
  });
});

describe("projectState", () => {
  it("is open well before the deadline", () => {
    expect(projectState(resolved({ closesInMs: 20 * DAY }), NOW)).toBe("buka");
  });

  it("is closing soon within seven days, including the last day", () => {
    expect(projectState(resolved({ closesInMs: 7 * DAY }), NOW)).toBe("segera-tutup");
    expect(projectState(resolved({ closesInMs: 0 }), NOW)).toBe("segera-tutup");
    expect(projectState(resolved({ closesInMs: 8 * DAY }), NOW)).toBe("buka");
  });

  it("stays open through the whole deadline day, then closes", () => {
    const p = resolved({ closesInMs: 0 });
    // 23:00 WIB on the deadline day is still open; 00:00 WIB the next day is closed.
    expect(projectState(p, Date.UTC(2026, 10, 16, 16, 0, 0))).toBe("segera-tutup");
    expect(projectState(p, Date.UTC(2026, 10, 16, 17, 0, 0))).toBe("ditutup");
  });

  it("is closed once the deadline has passed, even when the quota is also full", () => {
    const p = resolved({ closesInMs: -DAY, quota: { total: 10, taken: 10 } });
    expect(projectState(p, NOW)).toBe("ditutup");
  });

  it("is full when no seat is left before the deadline", () => {
    const p = resolved({ closesInMs: 5 * DAY, quota: { total: 10, taken: 10 } });
    expect(projectState(p, NOW)).toBe("kuota-penuh");
  });

  it("stays open all year without a deadline or quota", () => {
    expect(projectState(resolved({ closesInMs: null }), NOW)).toBe("buka");
  });
});

describe("quotaLeft", () => {
  it("is null without a quota and never below zero", () => {
    expect(quotaLeft(resolved({ quota: null }))).toBeNull();
    expect(quotaLeft(resolved({ quota: { total: 40, taken: 31 } }))).toBe(9);
    expect(quotaLeft(resolved({ quota: { total: 5, taken: 9 } }))).toBe(0);
  });
});

describe("money", () => {
  it("formats rupiah with dots and ringgit from sen with a decimal comma", () => {
    expect(formatMoney(12_500_000, "idr")).toBe("Rp12.500.000");
    expect(formatMoney(0, "idr")).toBe("Rp0");
    expect(formatMoney(2500, "myr")).toBe("RM25");
    expect(formatMoney(2550, "myr")).toBe("RM25,50");
  });

  it("lists each currency separately and says Gratis when none is set", () => {
    expect(feeLabel(resolved({ fee: {} }))).toBe("Gratis");
    expect(feeLabel(resolved({ fee: { idr: 75_000 } }))).toBe("Rp75.000");
    expect(feeLabel(resolved({ fee: { idr: 75_000, myr: 2500 } }))).toBe("Rp75.000 · RM25");
  });

  it("does not call a service free because one package costs nothing", () => {
    const solo = resolved({
      category: "solo",
      block: {
        kind: "solo",
        packages: [
          { name: "Dasar", fee: { idr: 0 }, includes: [] },
          { name: "Premium", fee: { idr: 5_000_000 }, includes: [] },
        ],
      },
    });
    expect(feeLabel(solo)).toBe("Mulai dari Rp5.000.000");
    expect(moneyLabel({ idr: 0 })).toBe("Gratis");
    expect(moneyLabel({ idr: 1000, myr: 50 })).toBe("Rp1.000 · RM0,50");
  });

  it("shows the cheapest package for Solo as a starting price", () => {
    const solo = resolved({
      category: "solo",
      block: {
        kind: "solo",
        packages: [
          { name: "Lengkap", fee: { idr: 4_000_000, myr: 130_000 }, includes: [] },
          { name: "Naskah", fee: { idr: 1_500_000, myr: 50_000 }, includes: [] },
        ],
      },
    });
    expect(feeLabel(solo)).toBe("Mulai dari Rp1.500.000 · RM500");
  });
});

describe("daysLeftLabel", () => {
  it("counts whole days and names the last day", () => {
    const end = (days: number) => resolved({ closesInMs: days * DAY }).closesAt as number;
    expect(daysLeftLabel(end(0), NOW, "WIB")).toBe("Hari ini hari terakhir");
    expect(daysLeftLabel(end(1), NOW, "WIB")).toBe("1 hari lagi");
    expect(daysLeftLabel(end(12), NOW, "WIB")).toBe("12 hari lagi");
  });
});

describe("filterProjects", () => {
  const list = resolveProjects(
    [
      fixture({ slug: "a", category: "antologi", fee: { idr: 1 } }),
      fixture({ slug: "b", category: "lomba", fee: {}, closesInMs: 2 * DAY }),
      fixture({ slug: "c", category: "lomba", closesInMs: -3 * DAY }),
      fixture({ slug: "d", category: "kelas", quota: { total: 3, taken: 3 } }),
      fixture({ slug: "e", category: "lomba", publication: "draf" }),
    ],
    NOW,
  );
  const slugs = (f: Partial<typeof DEFAULT_FILTERS>) =>
    filterProjects(list, { ...DEFAULT_FILTERS, ...f }, NOW).map((p) => p.slug);

  it("never lists drafts", () => {
    expect(slugs({})).toEqual(["a", "b", "c", "d"]);
  });

  it("filters by category", () => {
    expect(slugs({ category: "lomba" })).toEqual(["b", "c"]);
  });

  it("treats Buka as still open, Segera tutup as a subset, Ditutup as closed or full", () => {
    expect(slugs({ state: "buka" })).toEqual(["a", "b"]);
    expect(slugs({ state: "segera-tutup" })).toEqual(["b"]);
    expect(slugs({ state: "ditutup" })).toEqual(["c", "d"]);
  });

  it("filters by free or paid", () => {
    expect(slugs({ fee: "gratis" })).toEqual(["b", "c", "d"]);
    expect(slugs({ fee: "berbayar" })).toEqual(["a"]);
  });

  it("combines filters", () => {
    expect(slugs({ category: "lomba", state: "ditutup" })).toEqual(["c"]);
  });
});

describe("filters in the address", () => {
  it("falls back to defaults for anything unknown", () => {
    expect(parseFilters({ kategori: "puisi", status: ["x"], biaya: undefined })).toEqual(
      DEFAULT_FILTERS,
    );
  });

  it("reads known values", () => {
    expect(parseFilters({ kategori: "kelas", status: "buka", biaya: "gratis" })).toEqual({
      category: "kelas",
      state: "buka",
      fee: "gratis",
    });
  });

  it("writes only what differs from the defaults", () => {
    expect(toQuery(DEFAULT_FILTERS)).toBe("");
    expect(toQuery({ ...DEFAULT_FILTERS, category: "solo", fee: "berbayar" })).toBe(
      "?kategori=solo&biaya=berbayar",
    );
  });
});
