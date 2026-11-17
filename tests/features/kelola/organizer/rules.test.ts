import { beforeEach, describe, expect, it } from "vitest";
import { applyAction, saveProject } from "@/features/kelola/organizer/organizer-actions";
import { OWNER_ID } from "@/features/kelola/organizer/organizer-access";
import { buildProject } from "@/features/kelola/organizer/project-build";
import { emptyInput, inputOf, type ProjectInput } from "@/features/kelola/organizer/project-input";
import { staffAssignments } from "@/features/kelola/staff-assignments";
import { resolveProjects } from "@/features/projects/project-model";
import { isStoredProject, storedProjects } from "@/features/projects/stored-projects";
import { termsNotifications } from "@/features/projects/terms-notifications";
import { createLocalListStore } from "@/lib/local-list-store";
import { registration } from "../../projects/helpers";

const NOW = Date.now();
const day = (n: number) => new Date(NOW + n * 86_400_000).toISOString().slice(0, 10);

const input = (patch: Partial<ProjectInput> = {}): ProjectInput => ({
  ...emptyInput("antologi"),
  title: "Antologi Hujan",
  summary: "Cerita.",
  about: "Isi.",
  requirements: "Syarat.",
  closesDate: day(20),
  minWords: "500",
  maxWords: "2000",
  theme: "Hujan",
  stages: "Satu",
  ...patch,
});

beforeEach(() => {
  localStorage.clear();
  storedProjects.reset();
  staffAssignments.reset();
});

function created(patch: Partial<ProjectInput> = {}) {
  const result = saveProject(input(patch), null, NOW);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.project.slug;
}

describe("closing registration", () => {
  it("stays closed when the form is saved without touching the date", () => {
    const slug = created();
    applyAction(slug, "terbitkan", NOW);
    applyAction(slug, "tutup", NOW);
    const [closed] = storedProjects.read();
    expect(resolveProjects([closed], NOW + 1000)[0].closesAt).toBeLessThan(NOW + 1000);
    expect(saveProject(inputOf(closed), slug, NOW + 1000).ok).toBe(true);
    expect(resolveProjects([...storedProjects.read()], NOW + 2000)[0].closesAt).toBe(
      closed.absolute?.closesAt,
    );
  });

  it("moves the deadline when the Organizer picks another day", () => {
    const slug = created();
    expect(saveProject(inputOf(storedProjects.read()[0]), slug, NOW).ok).toBe(true);
    saveProject({ ...inputOf(storedProjects.read()[0]), closesDate: day(30) }, slug, NOW);
    expect(storedProjects.read()[0].absolute?.closesAt).toBeGreaterThan(NOW + 29 * 86_400_000);
  });
});

describe("rules enforced where the data is written", () => {
  it("refuses changes to an archived project", () => {
    const slug = created();
    applyAction(slug, "arsipkan", NOW);
    const result = saveProject(input({ title: "Baru" }), slug, NOW);
    expect(result.ok).toBe(false);
    expect(storedProjects.read()[0].title).toBe("Antologi Hujan");
  });

  it("refuses a new category, and zone or fee changes once someone registered", () => {
    const slug = created({ feeIdr: "1000" });
    const category = saveProject(input({ category: "lomba" }), slug, NOW);
    expect(category.ok === false && category.errors.category).toBeTruthy();
    localStorage.setItem("ranah.registrations", JSON.stringify({ [slug]: registration(slug) }));
    const fee = saveProject(input({ feeIdr: "2000" }), slug, NOW);
    expect(fee.ok === false && fee.errors.feeIdr).toBeTruthy();
    const zone = saveProject(input({ feeIdr: "1000", zone: "MYT" }), slug, NOW);
    expect(zone.ok === false && zone.errors.zone).toBeTruthy();
    expect(saveProject(input({ feeIdr: "1000", summary: "Ringkasan baru." }), slug, NOW).ok).toBe(
      true,
    );
  });

  it("takes the assignments of a deleted draft with it", () => {
    const slug = created();
    staffAssignments.write([{ slug, role: "editor", staffId: "editor-rani" }]);
    expect(applyAction(slug, "hapus", NOW)).toBe("ok");
    expect(staffAssignments.read()).toEqual([]);
  });

  it("keeps the tidak-ada and sudah-berubah answers", () => {
    expect(applyAction("tidak-ada", "hapus", NOW)).toBe("tidak-ada");
    const slug = created();
    expect(applyAction(slug, "tutup", NOW)).toBe("sudah-berubah");
    applyAction(slug, "arsipkan", NOW);
    expect(applyAction(slug, "terbitkan", NOW)).toBe("sudah-berubah");
  });
});

describe("stored project guard", () => {
  it("accepts what was built and rejects an entry missing what screens read", () => {
    const built = buildProject(input(), { now: NOW, taken: 0, slugs: [], ownerId: OWNER_ID });
    if (!built.ok) throw new Error("unexpected");
    expect(isStoredProject(built.project)).toBe(true);
    const partial: Partial<typeof built.project> = { ...built.project };
    delete partial.about;
    expect(isStoredProject(partial)).toBe(false);
    expect(isStoredProject({ ...built.project, terms: { version: "v1" } })).toBe(false);
    expect(isStoredProject({ ...built.project, block: { kind: "solo", packages: [] } })).toBe(
      false,
    );
  });
});

describe("terms notification scope", () => {
  it("is quiet for an archived project or an expired payment hold", () => {
    const built = buildProject(input(), { now: NOW, taken: 0, slugs: [], ownerId: OWNER_ID });
    if (!built.ok) throw new Error("unexpected");
    const open = { ...built.project, publication: "terbit" as const, termsUpdatedAt: NOW };
    const project = {
      ...resolveProjects([{ ...open, terms: { version: "v2", special: [] } }], NOW)[0],
    };
    const map = { [project.slug]: registration(project.slug, { termsVersion: "v1" }) };
    expect(termsNotifications([project], map, NOW)).toHaveLength(1);
    expect(termsNotifications([{ ...project, publication: "arsip" }], map, NOW)).toEqual([]);
    const waiting = {
      [project.slug]: {
        ...map[project.slug],
        status: "menunggu-pembayaran" as const,
        registeredAt: NOW - 2 * 86_400_000,
      },
    };
    expect(termsNotifications([project], waiting, NOW)).toEqual([]);
  });
});

describe("local list store write failure", () => {
  it("shows what was saved even when storage refuses and holds an older value", () => {
    const store = createLocalListStore("test.fail", (v): v is number => typeof v === "number");
    store.reset();
    store.write([1]);
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error("quota");
    };
    try {
      store.write([1, 2]);
      expect(store.read()).toEqual([1, 2]);
    } finally {
      Storage.prototype.setItem = original;
      store.reset();
    }
  });
});
