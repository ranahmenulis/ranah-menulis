import { describe, expect, it } from "vitest";
import { classAccess, manageableClasses } from "@/features/kelola/mentor/mentor-access";
import {
  applyMentorFilter,
  countMentorFilters,
  mentorFilterQuery,
  mentorRows,
  parseMentorFilter,
  parseTab,
  rosterRows,
} from "@/features/kelola/mentor/mentor-queue";
import { mentorStepsFor } from "@/features/kelola/mentor/mentor-review";
import { NOW, registration } from "../../projects/helpers";
import { CERPEN, PUISI, classOf, handedIn } from "../../projects/kelas/helpers";

describe("classAccess", () => {
  it("lets a Mentor manage only the classes assigned to them", () => {
    expect(classAccess(["mentor"], CERPEN)).toBe("ok");
    expect(classAccess(["mentor"], PUISI)).toBe("tidak-ditugaskan");
  });

  it("gives nothing to roles that are not Mentor or admin", () => {
    expect(classAccess(["editor", "juri", "organizer"], CERPEN)).toBe("tidak-ditugaskan");
    expect(classAccess([], CERPEN)).toBe("tidak-ditugaskan");
  });

  it("lets Administrator and Super Admin manage any class", () => {
    expect(classAccess(["administrator"], PUISI)).toBe("ok");
    expect(classAccess(["super-admin"], PUISI)).toBe("ok");
  });

  it("treats anything that is not a published class as not a class, for everyone", () => {
    expect(classAccess(["administrator"], "lomba-esai-literasi-remaja")).toBe("bukan-kelas");
    expect(classAccess(["administrator"], "tidak-ada")).toBe("bukan-kelas");
  });

  it("lists the classes a role may manage", () => {
    expect(manageableClasses(["mentor"]).map((p) => p.slug)).toEqual([CERPEN]);
    expect(
      manageableClasses(["administrator"])
        .map((p) => p.slug)
        .sort(),
    ).toEqual([CERPEN, PUISI]);
    expect(manageableClasses([])).toEqual([]);
  });
});

describe("hand-in queue", () => {
  const content = classOf(CERPEN);
  type S = "dikumpulkan" | "perlu-perbaikan" | "selesai";
  const work = (id: string, assignmentId: string, status: S, at: number, late = false) =>
    handedIn({ id, assignmentId, status, late, statusLog: [{ status, at, by: "peserta" }] });
  const all = [
    work("a", "tugas-1", "dikumpulkan", 300),
    work("b", "tugas-2", "dikumpulkan", 100, true),
    work("c", "tugas-3", "perlu-perbaikan", 200),
    work("d", "tugas-4", "selesai", 50),
    handedIn({ id: "e", slug: PUISI, assignmentId: "tugas-1" }),
    handedIn({ id: "f", assignmentId: "tidak-ada" }),
  ];
  const rows = mentorRows(content, all);

  it("lists only this class's hand-ins that answer a task of it", () => {
    expect(rows.map((r) => r.id).sort()).toEqual(["a", "b", "c", "d"]);
    expect(rows.find((r) => r.id === "b")?.late).toBe(true);
  });

  it("counts every filter", () => {
    expect(countMentorFilters(rows)).toEqual({
      "perlu-dinilai": 2,
      "menunggu-perbaikan": 1,
      selesai: 1,
      semua: 4,
    });
  });

  it("puts the longest waiting first, and the newest decision first when finished", () => {
    expect(applyMentorFilter(rows, "perlu-dinilai").map((r) => r.id)).toEqual(["b", "a"]);
    // "Semua" is oldest-waiting first too: d (50), b (100), c (200), a (300).
    expect(applyMentorFilter(rows, "semua").map((r) => r.id)).toEqual(["d", "b", "c", "a"]);
    expect(applyMentorFilter(rows, "selesai").map((r) => r.id)).toEqual(["d"]);
  });

  it("reads the tab and filter from the address with safe defaults", () => {
    expect(parseTab("tugas")).toBe("tugas");
    expect(parseTab("aneh")).toBe("pengumpulan");
    expect(parseMentorFilter("selesai")).toBe("selesai");
    expect(parseMentorFilter(null)).toBe("perlu-dinilai");
    expect(mentorFilterQuery("perlu-dinilai")).toBe("");
    expect(mentorFilterQuery("semua")).toBe("?status=semua");
  });
});

describe("mentor steps", () => {
  it("offers a repair (note required) and done (note optional) only on a waiting hand-in", () => {
    const labels = mentorStepsFor(handedIn({ status: "dikumpulkan" })).map((s) => [
      s.label,
      s.required,
    ]);
    expect(labels).toEqual([
      ["Minta perbaikan", true],
      ["Tandai selesai", false],
    ]);
    expect(mentorStepsFor(handedIn({ status: "perlu-perbaikan" }))).toEqual([]);
    expect(mentorStepsFor(handedIn({ status: "selesai" }))).toEqual([]);
  });
});

describe("roster", () => {
  const content = classOf(CERPEN, NOW);
  const joined = registration(CERPEN);

  it("is empty without an active registration on this device", () => {
    expect(rosterRows(content, [], undefined, NOW)).toEqual([]);
    expect(
      rosterRows(content, [], registration(CERPEN, { status: "menunggu-pembayaran" }), NOW),
    ).toEqual([]);
  });

  it("counts where each task stands for the participant", () => {
    const [row] = rosterRows(
      content,
      [
        handedIn({ id: "a", assignmentId: "tugas-1", status: "selesai" }),
        handedIn({ id: "b", assignmentId: "tugas-2", status: "perlu-perbaikan" }),
        handedIn({ id: "c", assignmentId: "tugas-3", status: "dikumpulkan" }),
      ],
      joined,
      NOW,
    );
    expect(row).toMatchObject({ selesai: 1, perbaikan: 1, menunggu: 1, total: 4 });
    expect(row.selesai + row.perbaikan + row.menunggu + row.terlambat + row.belum).toBe(4);
  });
});
