import { beforeEach, describe, expect, it } from "vitest";
import { judgingLog } from "@/features/kelola/juri/score-store";
import { auditLog } from "@/features/kelola/audit/audit-log";
import { saveContestResults } from "@/features/kelola/organizer/results-actions";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import { storedResults } from "@/features/projects/lomba/results-store";
import { advanceContest } from "@/features/projects/lomba/stage-store";
import { resolveProjects } from "@/features/projects/project-model";
import { submission } from "../../projects/helpers";

const SLUG = "lomba-cerpen-hujan-2026";
const NOW = Date.now();
const [project] = resolveProjects(
  projectFixtures.filter((p) => p.slug === SLUG),
  NOW,
);
const rows = ["a", "b"].map((id, i) => ({
  id,
  label: `Karya ${i + 1}`,
  title: `Judul ${id}`,
  genre: "Cerpen",
  score: 9 - i,
  judges: 1,
}));
const form = (ranks: Record<string, string>) => ({
  finalists: { a: true, b: true },
  ranks: { a: ranks.a ?? "", b: ranks.b ?? "" },
  notes: { a: "", b: "" },
});

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  judgingLog.reset();
  storedResults.reset();
  auditLog.reset();
  void submission;
  judgingLog.write([{ slug: SLUG, state: "ditutup", at: 1 }]);
  advanceContest(SLUG, "dinilai");
  saveContestResults(project, rows, form({ a: "1" }), NOW);
  advanceContest(SLUG, "pemenang");
});

describe("correcting winners after the announcement", () => {
  it("refuses without a reason to amend, as before", () => {
    expect(saveContestResults(project, rows, form({ b: "1" }), NOW)).toMatchObject({
      ok: false,
      reason: "terkunci",
    });
  });

  it("refuses everyone but a platform admin", () => {
    sessionStorage.setItem("rm-roles", "organizer");
    expect(
      saveContestResults(project, rows, form({ b: "1" }), NOW, { reason: "Salah hitung" }),
    ).toMatchObject({ ok: false, reason: "bukan-admin" });
    expect(storedResults.read()[0].winners[0].entryId).toBe("a");
  });

  it("needs a reason from an Administrator", () => {
    sessionStorage.setItem("rm-roles", "administrator");
    expect(
      saveContestResults(project, rows, form({ b: "1" }), NOW, { reason: "  " }),
    ).toMatchObject({ ok: false, reason: "alasan" });
    expect(auditLog.read()).toEqual([]);
  });

  it("lets an Administrator change the winners, keeps the finalists, and logs it", () => {
    sessionStorage.setItem("rm-roles", "administrator");
    const result = saveContestResults(project, rows, form({ b: "1" }), NOW, {
      reason: "Salah hitung",
    });
    expect(result.ok).toBe(true);
    const saved = storedResults.read()[0];
    expect(saved.winners.map((w) => w.entryId)).toEqual(["b"]);
    expect(saved.finalists.map((f) => f.id)).toEqual(["a", "b"]);
    expect(auditLog.read()).toMatchObject([
      { action: "contest.results.amend", slug: SLUG, reason: "Salah hitung" },
    ]);
  });

  it("refuses a change that changes nothing, and logs nothing", () => {
    sessionStorage.setItem("rm-roles", "administrator");
    expect(
      saveContestResults(project, rows, form({ a: "1" }), NOW, { reason: "Cek" }),
    ).toMatchObject({
      ok: false,
      reason: "tidak-berubah",
    });
    expect(auditLog.read()).toEqual([]);
  });

  it("refuses when the Organizer recorded no results to correct", () => {
    sessionStorage.setItem("rm-roles", "administrator");
    storedResults.reset();
    expect(
      saveContestResults(project, rows, form({ b: "1" }), NOW, { reason: "Cek" }),
    ).toMatchObject({
      ok: false,
      reason: "terkunci",
    });
    expect(auditLog.read()).toEqual([]);
  });
});
