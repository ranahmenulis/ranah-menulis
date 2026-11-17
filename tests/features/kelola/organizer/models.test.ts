import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { OWNER_ID, manageAccess } from "@/features/kelola/organizer/organizer-access";
import { buildProject, nextTermsVersion, slugFor } from "@/features/kelola/organizer/project-build";
import { emptyInput, inputOf, type ProjectInput } from "@/features/kelola/organizer/project-input";
import {
  dayEnd,
  feeOf,
  parseCriteria,
  parseMilestones,
  parsePackages,
  parseRinggit,
  parseRupiah,
} from "@/features/kelola/organizer/project-lines";
import { allowedActions, organizerStatus } from "@/features/kelola/organizer/project-status";
import { reviewAccess } from "@/features/kelola/editor/assignments";
import { classAccess } from "@/features/kelola/mentor/mentor-access";
import { SEED_ASSIGNMENTS, isAssignedToSelf } from "@/features/kelola/staff-assignments";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import { resolveProjects } from "@/features/projects/project-model";
import { mergeCatalog } from "@/features/projects/use-catalog";
import { termsNotifications } from "@/features/projects/terms-notifications";
import { createLocalListStore } from "@/lib/local-list-store";
import type { ProjectFixture } from "@/features/projects/types";
import { registration } from "../../projects/helpers";

const NOW = Date.UTC(2026, 10, 17, 5);
const DAY = 86_400_000;
const day = (n: number) => new Date(NOW + n * DAY).toISOString().slice(0, 10);

const antologi = (patch: Partial<ProjectInput> = {}): ProjectInput => ({
  ...emptyInput("antologi"),
  title: "Antologi Hujan",
  summary: "Cerita tentang hujan.",
  about: "Paragraf satu.\n\nParagraf dua.",
  requirements: "Satu karya per penulis.",
  closesDate: day(20),
  minWords: "500",
  maxWords: "2000",
  theme: "Hujan",
  stages: "Pendaftaran\nSeleksi",
  ...patch,
});

const ctx = { now: NOW, taken: 0, slugs: [] as string[], ownerId: OWNER_ID };

function built(
  input: ProjectInput,
  extra: Partial<typeof ctx & { existing: ProjectFixture }> = {},
) {
  const result = buildProject(input, { ...ctx, ...extra });
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.project;
}

describe("line parsers", () => {
  it("reads milestones as the start of a day in the zone, and names the bad line", () => {
    const ok = parseMilestones("Seleksi | 2026-12-15", "WIB");
    expect(ok.bad).toBeNull();
    expect(ok.items[0].at).toBe(Date.UTC(2026, 11, 14, 17));
    expect(parseMilestones("Seleksi | 2026-13-40", "WIB").bad).toBe("Seleksi | 2026-13-40");
    expect(parseMilestones("tanpa tanggal", "WIB").bad).toBe("tanpa tanggal");
  });

  it("puts a deadline at the end of its day", () => {
    expect(dayEnd("2026-12-15", "WIB")).toBe(Date.UTC(2026, 11, 15, 16, 59, 59, 999));
    expect(dayEnd("", "WIB")).toBeNull();
  });

  it("reads rupiah as whole numbers and ringgit into sen", () => {
    expect(parseRupiah("75.000")).toBe(75_000);
    expect(parseRupiah("75,5")).toBeNull();
    expect(parseRinggit("25,5")).toBe(2550);
    expect(parseRinggit("25")).toBe(2500);
    expect(parseRinggit("abc")).toBeNull();
    expect(feeOf("", "")).toEqual({ fee: {}, bad: null });
    expect(feeOf("0", "")).toEqual({ fee: {}, bad: null });
    expect(feeOf("x", "")).toMatchObject({ bad: "idr" });
  });

  it("reads packages and criteria, and refuses lines it cannot", () => {
    expect(parsePackages("Standar | 1500000 | Layout; Sampul").items[0]).toEqual({
      name: "Standar",
      fee: { idr: 1_500_000 },
      includes: ["Layout", "Sampul"],
    });
    expect(parsePackages("Standar | murah | Layout").bad).toBe("Standar | murah | Layout");
    expect(parseCriteria("Orisinalitas | 60\nBahasa | 40").items).toHaveLength(2);
    expect(parseCriteria("Bahasa | 0").bad).toBe("Bahasa | 0");
  });
});

describe("buildProject", () => {
  it("builds a draft with real dates, a slug from the title and the first terms version", () => {
    const project = built(antologi());
    expect(project).toMatchObject({
      slug: "antologi-antologi-hujan",
      publication: "draf",
      ownerId: OWNER_ID,
      submission: { minWords: 500, maxWords: 2000, maxWorks: 1 },
      terms: { version: "v1", special: [] },
      closesInMs: null,
    });
    expect(project.absolute?.closesAt).toBe(dayEnd(day(20), "WIB"));
    expect(project.about).toEqual(["Paragraf satu.", "Paragraf dua."]);
  });

  it("names every failing rule at once, none dropped", () => {
    const result = buildProject(
      antologi({ title: "", summary: "", closesDate: "", minWords: "9", maxWords: "3", theme: "" }),
      ctx,
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.errors).sort()).toEqual(
      ["block", "closesDate", "minWords", "summary", "title"].sort(),
    );
  });

  it("keeps the slug unique", () => {
    expect(slugFor(antologi(), ["antologi-antologi-hujan"])).toBe("antologi-antologi-hujan-2");
    expect(slugFor({ ...antologi(), title: "!!!" }, [])).toBe("antologi-proyek");
  });

  it("needs a start date for a class and weights adding up to 100 for a contest", () => {
    const kelas = {
      ...emptyInput("kelas"),
      ...antologi(),
      category: "kelas" as const,
      teacherName: "Dewi",
      teacherBio: "Penulis.",
      modules: "Dasar | 2",
    };
    const noStart = buildProject({ ...kelas, milestones: "Penutupan | 2026-12-01" }, ctx);
    expect(noStart.ok).toBe(false);
    expect(built({ ...kelas, milestones: `Kelas dimulai | ${day(10)}` }).submission).toBeNull();

    const lomba = { ...antologi(), category: "lomba" as const, prizes: "Juara 1" };
    const bad = buildProject({ ...lomba, criteria: "Bahasa | 50\nPlot | 30" }, ctx);
    expect(bad.ok === false && bad.errors.block).toBe(
      "Bobot kriteria harus berjumlah 100, sekarang 80.",
    );
  });

  it("makes Solo open all year: no deadline, no quota, no fee fields", () => {
    const solo = built({
      ...antologi(),
      category: "solo",
      closesDate: "",
      quota: "9",
      feeIdr: "5000",
      packages: "Standar | 1500000 | Layout",
    });
    expect(solo).toMatchObject({ quota: null, fee: {} });
    expect(solo.absolute?.closesAt).toBeNull();
  });

  it("refuses a quota below the seats already taken", () => {
    const existing = built(antologi({ quota: "10" }));
    const result = buildProject(antologi({ quota: "2" }), { ...ctx, taken: 5, existing });
    expect(result.ok === false && result.errors.quota).toMatch(/di bawah 5/);
  });

  it("starts a new terms version only when a published project's terms change", () => {
    const draft = built(antologi());
    const sameDraft = built(antologi({ special: "Hak terbit satu tahun." }), { existing: draft });
    expect(sameDraft.terms.version).toBe("v1");
    expect(sameDraft.termsUpdatedAt).toBeUndefined();

    const published = { ...draft, publication: "terbit" as const };
    const same = built(antologi(), { existing: published });
    expect(same.terms.version).toBe("v1");
    const changed = built(antologi({ special: "Hak terbit satu tahun." }), { existing: published });
    expect(changed.terms).toEqual({ version: "v2", special: ["Hak terbit satu tahun."] });
    expect(changed.termsUpdatedAt).toBe(NOW);
    expect(nextTermsVersion("2026-11-contoh")).toBe("2026-11-contoh-r2");
  });

  it("round-trips through the form text", () => {
    const project = built(antologi({ feeIdr: "75000", feeMyr: "25.50", quota: "40" }));
    const text = inputOf(project);
    expect(text).toMatchObject({ feeIdr: "75000", feeMyr: "25.50", quota: "40", theme: "Hujan" });
    expect(built(text, { existing: project }).fee).toEqual({ idr: 75_000, myr: 2550 });
  });
});

describe("catalog join", () => {
  it("resolves a written project with its real dates and appends it after the samples", () => {
    const project = built(antologi());
    const [resolved] = resolveProjects([project], NOW + 99 * DAY);
    expect(resolved.closesAt).toBe(project.absolute?.closesAt);
    const merged = mergeCatalog([project]);
    expect(merged.at(-1)?.slug).toBe(project.slug);
    expect(merged).toHaveLength(projectFixtures.length + 1);
    expect(mergeCatalog([])).toBe(projectFixtures);
    expect(mergeCatalog([{ ...project, slug: projectFixtures[0].slug }])).toBe(projectFixtures);
  });
});

describe("status and permissions", () => {
  it("derives the four states", () => {
    expect(organizerStatus({ publication: "draf", closesAt: null }, NOW)).toBe("draf");
    expect(organizerStatus({ publication: "arsip", closesAt: NOW - 1 }, NOW)).toBe("arsip");
    expect(organizerStatus({ publication: "terbit", closesAt: NOW - 1 }, NOW)).toBe("ditutup");
    expect(organizerStatus({ publication: "terbit", closesAt: null }, NOW)).toBe("terbit");
  });

  it("deletes only a draft with nobody registered (BR-PRJ-07)", () => {
    expect(allowedActions("draf", 0)).toContain("hapus");
    expect(allowedActions("draf", 1)).not.toContain("hapus");
    expect(allowedActions("terbit", 0)).toEqual(["tutup", "arsipkan"]);
    expect(allowedActions("arsip", 0)).toEqual([]);
  });

  it("lets an Organizer manage only their own projects (AC-26)", () => {
    expect(manageAccess(["organizer"], { ownerId: OWNER_ID })).toBe("ok");
    expect(manageAccess(["organizer"], {})).toBe("ok");
    expect(manageAccess(["organizer"], { ownerId: "organizer-lain" })).toBe("bukan-milikmu");
    expect(manageAccess(["editor"], {})).toBe("bukan-milikmu");
    expect(manageAccess(["administrator"], { ownerId: "organizer-lain" })).toBe("ok");
    expect(manageAccess(["organizer"], undefined)).toBe("tidak-ada");
  });
});

describe("assignments drive access", () => {
  const slug = "antologi-pulang-ke-pesisir";
  it("follows the list it is given, not a fixed one", () => {
    expect(reviewAccess(["editor"], slug)).toBe("ok");
    expect(reviewAccess(["editor"], slug, projectFixtures, [])).toBe("tidak-ditugaskan");
    const other = [{ slug, role: "editor" as const, staffId: "editor-rani" }];
    expect(reviewAccess(["editor"], slug, projectFixtures, other)).toBe("tidak-ditugaskan");
    expect(isAssignedToSelf(SEED_ASSIGNMENTS, slug, "editor")).toBe(true);
    expect(classAccess(["mentor"], "kelas-cerpen-untuk-pemula", projectFixtures, [])).toBe(
      "tidak-ditugaskan",
    );
  });

  it("ends an Editor's access when the project is archived, but not an Administrator's", () => {
    const archived = projectFixtures.map((p) =>
      p.slug === slug ? { ...p, publication: "arsip" as const } : p,
    );
    expect(reviewAccess(["editor"], slug, archived)).toBe("tidak-ditugaskan");
    expect(reviewAccess(["administrator"], slug, archived)).toBe("ok");
  });
});

describe("terms notifications", () => {
  it("tells a registered reader when the terms changed after they agreed", () => {
    const base = built(antologi());
    const project = {
      ...resolveProjects([{ ...base, publication: "terbit" }], NOW)[0],
      terms: { version: "v2", special: [] },
      termsUpdatedAt: NOW,
    };
    const map = { [project.slug]: registration(project.slug, { termsVersion: "v1" }) };
    expect(termsNotifications([project], map, NOW)).toHaveLength(1);
    expect(termsNotifications([project], {}, NOW)).toEqual([]);
    expect(
      termsNotifications(
        [project],
        {
          [project.slug]: registration(project.slug, { termsVersion: "v2" }),
        },
        NOW,
      ),
    ).toEqual([]);
    expect(termsNotifications([{ ...project, termsUpdatedAt: undefined }], map, NOW)).toEqual([]);
  });
});

describe("local list store", () => {
  const isNum = (v: unknown): v is number => typeof v === "number";
  const store = createLocalListStore("test.list", isNum, [1]);
  beforeEach(() => store.reset());
  afterEach(() => store.reset());

  it("starts from the initial list, then the saved list wins even when empty", () => {
    expect(store.read()).toEqual([1]);
    store.write([2, 3]);
    expect(store.read()).toEqual([2, 3]);
    store.write([]);
    expect(store.read()).toEqual([]);
  });

  it("keeps one identity per stored value and drops malformed items", () => {
    localStorage.setItem("test.list", JSON.stringify([5, "x", null, 6]));
    const first = store.read();
    expect(first).toEqual([5, 6]);
    expect(store.read()).toBe(first);
    localStorage.setItem("test.list", "bukan json");
    expect(store.read()).toEqual([]);
  });
});
