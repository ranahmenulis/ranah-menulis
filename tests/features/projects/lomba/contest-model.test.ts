import { describe, expect, it } from "vitest";
import {
  announcementDates,
  contestStage,
  finalistLabel,
  finalistRows,
  namesRevealed,
  prizeFor,
  rankedWinners,
  stageByDate,
} from "@/features/projects/lomba/contest-model";
import { contestResults } from "@/features/projects/lomba/fixtures";
import { stageSentence } from "@/features/projects/lomba/results-text";
import { lombaFixtures } from "@/features/projects/fixtures/lomba";
import { NOW, project } from "../helpers";

const DAY = 86_400_000;
const open = project("lomba-cerpen-hujan-2026"); // closes in 9 days, finalists in 14, winners in 21
const finished = project("lomba-cerita-mini-pesisir-2026");
const noFinalists = project("lomba-esai-literasi-remaja"); // only a winners date

describe("contest fixtures", () => {
  it("have results for every Lomba, whose winners are among their finalists", () => {
    for (const fixture of lombaFixtures) {
      const results = contestResults.find((r) => r.slug === fixture.slug);
      expect(results, fixture.slug).toBeDefined();
      for (const w of results!.winners) {
        expect(results!.finalists.some((f) => f.id === w.entryId)).toBe(true);
      }
    }
  });
});

describe("stageByDate", () => {
  it("is open for work until the deadline", () => {
    expect(stageByDate(open, NOW)).toBe("terbuka");
  });

  it("is judging after the deadline, until finalists are announced", () => {
    expect(stageByDate(open, open.closesAt! + 1)).toBe("dinilai");
  });

  it("moves on at each announcement", () => {
    const { finalists, winners } = announcementDates(open);
    expect(stageByDate(open, finalists!)).toBe("finalis");
    expect(stageByDate(open, winners! - 1)).toBe("finalis");
    expect(stageByDate(open, winners!)).toBe("pemenang");
  });

  it("goes straight from judging to winners when there is no finalist date", () => {
    const { winners } = announcementDates(noFinalists);
    expect(stageByDate(noFinalists, noFinalists.closesAt! + 1)).toBe("dinilai");
    expect(stageByDate(noFinalists, winners!)).toBe("pemenang");
  });

  it("is open when a project has no deadline", () => {
    expect(stageByDate({ ...open, closesAt: null }, NOW + 900 * DAY)).toBe("terbuka");
  });

  it("has already announced the winners of a finished contest", () => {
    expect(stageByDate(finished, NOW)).toBe("pemenang");
  });
});

describe("contestStage", () => {
  it("lets a panel move a contest on but never back", () => {
    expect(contestStage(open, NOW, "finalis")).toBe("finalis");
    expect(contestStage(open, NOW, "terbuka")).toBe("terbuka");
    expect(contestStage(finished, NOW, "dinilai")).toBe("pemenang");
    expect(contestStage(open, NOW)).toBe("terbuka");
  });
});

describe("namesRevealed", () => {
  it("keeps an anonymous contest's names back until the winners", () => {
    expect(namesRevealed(true, "finalis")).toBe(false);
    expect(namesRevealed(true, "pemenang")).toBe(true);
  });

  it("shows names from the finalists on in any other contest", () => {
    expect(namesRevealed(false, "dinilai")).toBe(false);
    expect(namesRevealed(false, "finalis")).toBe(true);
  });

  it("calls an unnamed finalist by its place in the list", () => {
    expect(finalistLabel(0)).toBe("Finalis 1");
  });
});

describe("rankedWinners", () => {
  const results = contestResults.find((r) => r.slug === "lomba-cerita-mini-pesisir-2026")!;

  it("lists first place down and marks a tie", () => {
    const rows = rankedWinners(results);
    expect(rows.map((r) => [r.rank, r.entry.id, r.tie])).toEqual([
      [1, "f1", false],
      [2, "f2", true],
      [2, "f3", true],
    ]);
  });

  it("orders tied winners by number, so f10 follows f2", () => {
    const many = {
      slug: "x",
      finalists: ["f10", "f2"].map((id) => ({ id, title: id, genre: "Cerpen", authorId: "a" })),
      winners: ["f10", "f2"].map((entryId) => ({ entryId, rank: 1, jurorNote: "" })),
    };
    expect(rankedWinners(many).map((r) => r.entry.id)).toEqual(["f2", "f10"]);
  });

  it("drops a winner whose entry is gone", () => {
    const broken = { ...results, winners: [{ entryId: "nope", rank: 1, jurorNote: "" }] };
    expect(rankedWinners(broken)).toEqual([]);
  });
});

describe("prizeFor", () => {
  it("gives the amount without the place's label, and null past the list", () => {
    expect(prizeFor(open, 1)).toBe("Rp2.000.000");
    expect(prizeFor(open, 4)).toBeNull();
    // Only a "Juara N:" label is stripped; other text with a colon stays whole.
    const custom = {
      ...open,
      block: { ...open.block, prizes: ["Hadiah buku: 3 judul"] },
    } as typeof open;
    expect(prizeFor(custom, 1)).toBe("Hadiah buku: 3 judul");
    expect(prizeFor(project("solo-penerbitan-buku-sendiri"), 1)).toBeNull();
  });
});

describe("finalistRows", () => {
  it("adds the reader's own work last and tells it apart", () => {
    const rows = finalistRows(contestResults[1], {
      title: "Karyaku",
      genre: "Cerpen",
      authorId: "a",
    });
    expect(rows.at(-1)).toMatchObject({ mine: true, entry: { id: "mine", title: "Karyaku" } });
    expect(rows.filter((r) => r.mine)).toHaveLength(1);
  });

  it("is empty when nothing is on record", () => {
    expect(finalistRows(null, null)).toEqual([]);
  });
});

describe("stageSentence", () => {
  it("always says where the contest stands and what comes next", () => {
    expect(stageSentence(open, "terbuka")).toMatch(/masih dibuka sampai .*Pemenang diumumkan/);
    expect(stageSentence(open, "dinilai")).toMatch(/sedang dinilai juri\. Finalis diumumkan/);
    expect(stageSentence(open, "finalis")).toMatch(/Finalis sudah diumumkan\. Pemenang diumumkan/);
    expect(stageSentence(finished, "pemenang")).toMatch(/Pemenang sudah diumumkan pada/);
  });

  it("names the winners' date when judging has no finalist date", () => {
    expect(stageSentence(noFinalists, "dinilai")).toMatch(/Pemenang diumumkan/);
  });
});
