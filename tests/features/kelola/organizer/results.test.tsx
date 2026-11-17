import { act, cleanup, configure, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
  useRouter: () => ({ push: vi.fn() }),
}));

import { judgingLog, juryScores } from "@/features/kelola/juri/score-store";
import { ContestStagePanel } from "@/features/kelola/organizer/components/contest-stage-panel";
import { saveContestResults } from "@/features/kelola/organizer/results-actions";
import {
  buildResults,
  inputOf,
  rankRows,
  resultsLock,
  validateResults,
} from "@/features/kelola/organizer/results-model";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import { ResultsView } from "@/features/projects/lomba/components/results-view";
import { mergeResults, storedResults } from "@/features/projects/lomba/results-store";
import { advanceContest } from "@/features/projects/lomba/stage-store";
import { resolveProjects } from "@/features/projects/project-model";
import { createMemorySubmissionStore } from "@/features/projects/storage/memory-submission-store";
import { installDialogShim } from "@/test/dialog-shim";
import { submission } from "../../projects/helpers";

configure({ asyncUtilTimeout: 5000 });
installDialogShim();

const SLUG = "lomba-cerpen-hujan-2026"; // four criteria, three prizes
const CRITERIA = [
  { name: "Orisinalitas", weight: 50 },
  { name: "Bahasa", weight: 50 },
];
const NOW = Date.now();
const [project] = resolveProjects(
  projectFixtures.filter((p) => p.slug === SLUG),
  NOW,
);

const w = (id: string, order: number) =>
  submission({ id, slug: SLUG, title: `Judul ${id}`, genre: "Cerpen", submittedAt: order });
const works = [w("a", 1), w("b", 2), w("c", 3)];
const score = (submissionId: string, o: number, b: number) => ({
  submissionId,
  slug: SLUG,
  judgeId: "j",
  scores: { Orisinalitas: o, Bahasa: b },
  note: "",
  at: 1,
});

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  juryScores.reset();
  judgingLog.reset();
  storedResults.reset();
  sessionStorage.setItem("rm-roles", "organizer");
});
afterEach(cleanup);

describe("ranking", () => {
  it("orders by score and puts unscored work last in the order it was sent", () => {
    const rows = rankRows(works, [score("b", 9, 9), score("c", 5, 5)], CRITERIA, SLUG);
    expect(rows.map((r) => [r.label, r.score])).toEqual([
      ["Karya 2", 9],
      ["Karya 3", 5],
      ["Karya 1", null],
    ]);
    expect(rows[0].judges).toBe(1);
  });
});

describe("what may still change", () => {
  it("opens after judging closes, fixes the finalists once announced, then locks", () => {
    expect(resultsLock("dinilai", "dibuka")).toBe("belum-ditutup");
    expect(resultsLock("terbuka", "ditutup")).toBe("terbuka");
    expect(resultsLock("dinilai", "ditutup")).toBe("terbuka");
    expect(resultsLock("finalis", "ditutup")).toBe("finalis-tetap");
    expect(resultsLock("finalis", "dibuka")).toBe("belum-ditutup");
    expect(resultsLock("pemenang", "ditutup")).toBe("terkunci");
    expect(resultsLock("pemenang", "dibuka")).toBe("terkunci");
  });
});

describe("validating and building", () => {
  const rows = rankRows(works, [score("a", 9, 9), score("b", 7, 7)], CRITERIA, SLUG);
  const input = (finalists: string[], ranks: Record<string, string> = {}) => ({
    finalists: Object.fromEntries(rows.map((r) => [r.id, finalists.includes(r.id)])),
    ranks: Object.fromEntries(rows.map((r) => [r.id, ranks[r.id] ?? ""])),
    notes: Object.fromEntries(rows.map((r) => [r.id, ""])),
  });

  it("needs a finalist, and only finalists win", () => {
    expect(validateResults(input([]), rows, 3)).toHaveProperty("finalists");
    expect(validateResults(input(["a"], { b: "1" }), rows, 3)).toHaveProperty("rank-b");
  });

  it("keeps a rank within the number of prizes", () => {
    expect(validateResults(input(["a"], { a: "4" }), rows, 3)).toHaveProperty("rank-a");
    expect(validateResults(input(["a"], { a: "0" }), rows, 3)).toHaveProperty("rank-a");
    expect(validateResults(input(["a"], { a: "x" }), rows, 3)).toHaveProperty("rank-a");
    expect(validateResults(input(["a", "b"], { a: "1", b: "1" }), rows, 3)).toEqual({});
  });

  it("builds finalists from real works and winners in rank order, ties kept", () => {
    const built = buildResults(SLUG, rows, input(["a", "b"], { a: "2", b: "1" }));
    expect(built.finalists.map((f) => f.id)).toEqual(["a", "b"]);
    expect(built.winners.map((x) => [x.entryId, x.rank])).toEqual([
      ["b", 1],
      ["a", 2],
    ]);
    expect(inputOf(built, rows).ranks).toMatchObject({ a: "2", b: "1" });
  });
});

describe("saving results", () => {
  const rows = rankRows(works, [score("a", 9, 9)], CRITERIA, SLUG);
  const form = {
    finalists: { a: true, b: false, c: false },
    ranks: { a: "1", b: "", c: "" },
    notes: { a: "Kuat", b: "", c: "" },
  };

  it("refuses before judging is closed, and keeps nothing", () => {
    const result = saveContestResults(project, rows, form, NOW);
    expect(result).toMatchObject({ ok: false, reason: "belum-ditutup" });
    expect(storedResults.read()).toEqual([]);
  });

  it("saves after judging is closed", () => {
    judgingLog.write([{ slug: SLUG, state: "ditutup", at: 1 }]);
    advanceContest(SLUG, "dinilai");
    const result = saveContestResults(project, rows, form, NOW);
    expect(result.ok).toBe(true);
    expect(storedResults.read()[0].winners).toEqual([{ entryId: "a", rank: 1, jurorNote: "Kuat" }]);
  });

  it("keeps the announced finalists and takes only the winners once finalists are out", () => {
    judgingLog.write([{ slug: SLUG, state: "ditutup", at: 1 }]);
    advanceContest(SLUG, "dinilai");
    saveContestResults(project, rows, form, NOW);
    advanceContest(SLUG, "finalis");
    const changed = {
      ...form,
      finalists: { a: false, b: true, c: true },
      ranks: { a: "", b: "", c: "" },
    };
    const result = saveContestResults(project, rows, changed, NOW);
    expect(result.ok).toBe(true);
    const saved = storedResults.read()[0];
    expect(saved.finalists.map((f) => f.id)).toEqual(["a"]);
    expect(saved.winners).toEqual([]);
  });

  it("refuses once the winners were announced", () => {
    judgingLog.write([{ slug: SLUG, state: "ditutup", at: 1 }]);
    advanceContest(SLUG, "pemenang");
    expect(saveContestResults(project, rows, form, NOW)).toMatchObject({
      ok: false,
      reason: "terkunci",
    });
  });
});

describe("the results editor", () => {
  const closeAndOpen = () => {
    judgingLog.write([{ slug: SLUG, state: "ditutup", at: 1 }]);
    juryScores.write([score("a", 9, 9), score("b", 7, 7)]);
    advanceContest(SLUG, "dinilai");
  };

  it("says results wait for judging to close, with no way to save", async () => {
    render(<ContestStagePanel project={project} now={NOW} works={works} />);
    expect(
      await screen.findByText("Hasil bisa ditetapkan setelah penilaian ditutup."),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Simpan hasil" })).toBeNull();
  });

  it("is empty when no work was sent", async () => {
    closeAndOpen();
    render(<ContestStagePanel project={project} now={NOW} works={[]} />);
    expect(await screen.findByText(/Belum ada karya yang dikirim ke lomba ini/)).toBeTruthy();
  });

  it("names a missing finalist, then saves finalists and a winner and says it is not public yet", async () => {
    closeAndOpen();
    render(<ContestStagePanel project={project} now={NOW} works={works} />);
    fireEvent.click(await screen.findByRole("button", { name: "Simpan hasil" }));
    expect(screen.getByText("Pilih minimal satu finalis.")).toBeTruthy();

    const list = screen.getByRole("list", { name: "Peringkat karya" });
    const first = within(list).getAllByRole("listitem")[0];
    expect(within(first).getByText(/Karya 1 · Judul a/)).toBeTruthy();
    fireEvent.click(within(first).getByRole("checkbox", { name: "Finalis" }));
    fireEvent.change(within(first).getByLabelText(/^Peringkat/), { target: { value: "1" } });
    fireEvent.change(within(first).getByLabelText(/^Catatan juri/), { target: { value: "Kuat" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan hasil" }));
    expect(await screen.findByText(/Hasil disimpan: 1 finalis, 1 pemenang/)).toBeTruthy();
    expect(storedResults.read()[0].winners[0]).toMatchObject({ entryId: "a", rank: 1 });
  });

  it("names a rank beyond the prizes and keeps what was typed", async () => {
    closeAndOpen();
    render(<ContestStagePanel project={project} now={NOW} works={works} />);
    const first = within(await screen.findByRole("list", { name: "Peringkat karya" })).getAllByRole(
      "listitem",
    )[0];
    fireEvent.click(within(first).getByRole("checkbox", { name: "Finalis" }));
    fireEvent.change(within(first).getByLabelText(/^Peringkat/), { target: { value: "9" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan hasil" }));
    expect(screen.getByText(/Isi peringkat 1 sampai 3/)).toBeTruthy();
    expect((within(first).getByLabelText(/^Peringkat/) as HTMLInputElement).value).toBe("9");
  });
});

describe("the public results page", () => {
  it("shows what the Organizer saved once the finalists are announced, and not before", async () => {
    storedResults.write([
      {
        slug: SLUG,
        finalists: [{ id: "a", title: "Judul a", genre: "Cerpen", authorId: "laras" }],
        winners: [],
      },
    ]);
    render(<ResultsView slug={SLUG} store={createMemorySubmissionStore()} />);
    expect(await screen.findByText(/Finalis belum diumumkan/)).toBeTruthy();
    expect(screen.queryByText("Judul a")).toBeNull();
    await act(async () => advanceContest(SLUG, "finalis"));
    expect(await screen.findByText("Judul a")).toBeTruthy();
  });

  it("lets stored results win over the sample ones for the same contest", () => {
    const mine = { slug: "lomba-cerita-mini-pesisir-2026", finalists: [], winners: [] };
    const merged = mergeResults([mine]);
    expect(merged.filter((r) => r.slug === mine.slug)).toEqual([mine]);
    expect(merged.some((r) => r.slug === SLUG)).toBe(true);
  });
});
