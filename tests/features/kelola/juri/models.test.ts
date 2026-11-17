import { beforeEach, describe, expect, it } from "vitest";
import { closeJudging, reopenJudging, saveJuryScore } from "@/features/kelola/juri/judge-actions";
import { judgeAccess, judgeableContests } from "@/features/kelola/juri/judge-access";
import {
  aggregateScore,
  applyJudgeFilter,
  countJudgeFilters,
  isClosed,
  judgeRows,
  judgeableWorks,
  judgingStatus,
  parseJudgeFilter,
  validateScores,
  weightedScore,
} from "@/features/kelola/juri/judge-model";
import {
  JUDGE_ID,
  judgingLog,
  juryScores,
  type JuryScore,
} from "@/features/kelola/juri/score-store";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import { submission } from "../../projects/helpers";

const SLUG = "lomba-cerpen-hujan-2026";
const NOW = 1_000_000;
const CRITERIA = [
  { name: "Orisinalitas", weight: 50 },
  { name: "Bahasa", weight: 50 },
];
const target = { slug: SLUG, submissionId: "a", criteria: CRITERIA };
const full = { Orisinalitas: "8", Bahasa: "6" };

beforeEach(() => {
  localStorage.clear();
  juryScores.reset();
  judgingLog.reset();
});

describe("judgeAccess", () => {
  it("lets a Judge open only the contests assigned to them", () => {
    expect(judgeAccess(["juri"], SLUG)).toBe("ok");
    expect(judgeAccess(["juri"], "lomba-puisi-pendek-nusantara")).toBe("tidak-ditugaskan");
    expect(judgeAccess(["editor", "mentor", "organizer"], SLUG)).toBe("tidak-ditugaskan");
    expect(judgeAccess(["juri"], SLUG, projectFixtures, [])).toBe("tidak-ditugaskan");
  });

  it("gives an Administrator every contest, and nothing that is not a contest", () => {
    expect(judgeAccess(["administrator"], "lomba-puisi-pendek-nusantara")).toBe("ok");
    expect(judgeAccess(["administrator"], "kelas-cerpen-untuk-pemula")).toBe("bukan-lomba");
    expect(judgeAccess(["administrator"], "tidak-ada")).toBe("bukan-lomba");
  });

  it("ends when the project is archived", () => {
    const archived = projectFixtures.map((p) =>
      p.slug === SLUG ? { ...p, publication: "arsip" as const } : p,
    );
    expect(judgeAccess(["juri"], SLUG, archived)).toBe("bukan-lomba");
    expect(judgeableContests(["juri"]).map((p) => p.slug)).toEqual([SLUG]);
  });
});

describe("scores", () => {
  it("names every criterion that is not a whole number from 1 to 10", () => {
    const { errors, scores } = validateScores(
      CRITERIA,
      { Orisinalitas: "11", Bahasa: "abc" },
      "x".repeat(1001),
    );
    expect(Object.keys(errors).sort()).toEqual(["Bahasa", "Orisinalitas", "note"]);
    expect(scores).toEqual({});
    expect(
      validateScores(CRITERIA, { Orisinalitas: "0", Bahasa: "7,5" }, "").errors,
    ).toHaveProperty("Orisinalitas");
    expect(validateScores(CRITERIA, full, "").errors).toEqual({});
  });

  it("weighs the criteria, and has no score for a half-scored work", () => {
    expect(weightedScore(CRITERIA, { Orisinalitas: 8, Bahasa: 6 })).toBe(7);
    expect(
      weightedScore(
        [
          { name: "A", weight: 70 },
          { name: "B", weight: 30 },
        ],
        { A: 10, B: 1 },
      ),
    ).toBe(7.3);
    expect(weightedScore(CRITERIA, { Orisinalitas: 8 })).toBeNull();
  });

  it("averages the Judges who scored, ignoring unfinished ones", () => {
    const mk = (scores: JuryScore["scores"]): JuryScore => ({
      submissionId: "a",
      slug: SLUG,
      judgeId: "j",
      scores,
      note: "",
      at: 1,
    });
    expect(aggregateScore(CRITERIA, [])).toBeNull();
    expect(
      aggregateScore(CRITERIA, [
        mk({ Orisinalitas: 10, Bahasa: 8 }),
        mk({ Orisinalitas: 6, Bahasa: 6 }),
        mk({ Orisinalitas: 3 }),
      ]),
    ).toBe(7.5);
  });
});

describe("judging state", () => {
  it("opens when the contest stops taking work and is closed by the log", () => {
    expect(judgingStatus("terbuka", [], SLUG)).toBe("belum-dibuka");
    expect(judgingStatus("dinilai", [], SLUG)).toBe("dibuka");
    expect(judgingStatus("pemenang", [], SLUG)).toBe("dibuka");
    const closed = [{ slug: SLUG, state: "ditutup" as const, at: 1 }];
    expect(judgingStatus("dinilai", closed, SLUG)).toBe("ditutup");
    expect(isClosed([...closed, { slug: SLUG, state: "dibuka", at: 2, note: "x" }], SLUG)).toBe(
      false,
    );
    expect(isClosed(closed, "lain")).toBe(false);
  });
});

describe("saving scores", () => {
  it("saves, and saving again replaces the Judge's earlier scores for that work", () => {
    expect(saveJuryScore(target, full, " bagus ", NOW).ok).toBe(true);
    expect(saveJuryScore(target, { Orisinalitas: "9", Bahasa: "9" }, "", NOW + 1).ok).toBe(true);
    const saved = juryScores.read();
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ judgeId: JUDGE_ID, scores: { Orisinalitas: 9, Bahasa: 9 } });
  });

  it("refuses an invalid form and keeps the earlier scores", () => {
    saveJuryScore(target, full, "", NOW);
    const result = saveJuryScore(target, { Orisinalitas: "99", Bahasa: "" }, "", NOW + 1);
    expect(result).toMatchObject({ ok: false, reason: "salah" });
    expect(juryScores.read()[0].scores.Orisinalitas).toBe(8);
  });

  it("refuses to change a score after judging was closed, even from an older form (AC-28)", () => {
    saveJuryScore(target, full, "", NOW);
    expect(closeJudging(SLUG, "dinilai", NOW)).toBe("ok");
    const result = saveJuryScore(target, { Orisinalitas: "1", Bahasa: "1" }, "", NOW + 1);
    expect(result).toMatchObject({ ok: false, reason: "ditutup" });
    expect(juryScores.read()[0].scores.Orisinalitas).toBe(8);
  });
});

describe("closing and reopening", () => {
  it("closes only once the contest stopped taking work, and only once", () => {
    expect(closeJudging(SLUG, "terbuka", NOW)).toBe("belum-waktunya");
    expect(closeJudging(SLUG, "dinilai", NOW)).toBe("ok");
    expect(closeJudging(SLUG, "dinilai", NOW)).toBe("sudah-berubah");
  });

  it("reopens only with a note, and keeps both entries in the log", () => {
    expect(reopenJudging(SLUG, "perlu dibuka", NOW)).toBe("sudah-berubah");
    closeJudging(SLUG, "dinilai", NOW);
    expect(reopenJudging(SLUG, "   ", NOW + 1)).toBe("catatan");
    expect(reopenJudging(SLUG, " satu karya terlewat ", NOW + 2)).toBe("ok");
    expect(judgingLog.read().map((e) => e.state)).toEqual(["ditutup", "dibuka"]);
    expect(judgingLog.read()[1].note).toBe("satu karya terlewat");
  });
});

describe("the list a Judge sees", () => {
  const works = [
    submission({ id: "b", submittedAt: 2000 }),
    submission({ id: "a", submittedAt: 1000 }),
    submission({ id: "d", status: "draf" }),
    submission({ id: "w", status: "ditarik" }),
    submission({ id: "x", slug: "lain" }),
  ].map((w) => ({ ...w, slug: w.slug === "lain" ? "lain" : SLUG }));

  it("takes sent work only, oldest first, labelled by order and without any author", () => {
    const list = judgeableWorks(works, SLUG);
    expect(list.map((w) => w.id)).toEqual(["a", "b"]);
    const rows = judgeRows(list, [], JUDGE_ID);
    expect(rows.map((r) => r.label)).toEqual(["Karya 1", "Karya 2"]);
    expect(Object.keys(rows[0]).sort()).toEqual(
      ["genre", "id", "label", "mine", "title", "words"].sort(),
    );
  });

  it("filters by what the viewer scored", () => {
    saveJuryScore({ ...target, submissionId: "a" }, full, "", NOW);
    const rows = judgeRows(judgeableWorks(works, SLUG), juryScores.read(), JUDGE_ID);
    expect(countJudgeFilters(rows)).toEqual({ belum: 1, sudah: 1, semua: 2 });
    expect(applyJudgeFilter(rows, "belum").map((r) => r.id)).toEqual(["b"]);
    expect(applyJudgeFilter(rows, "sudah").map((r) => r.id)).toEqual(["a"]);
    expect(parseJudgeFilter("apa")).toBe("belum");
  });
});
