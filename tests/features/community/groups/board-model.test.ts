import { beforeEach, describe, expect, it } from "vitest";
import {
  addDays,
  boardRows,
  challengeEnd,
  challengeState,
  circleTotal,
  daysLeft,
  forgetMember,
  freezeBoard,
  isDay,
  kindOf,
  periodOf,
  validateCircleStart,
} from "@/features/community/groups/board-model";
import type { WritingGroup } from "@/features/community/groups/group-model";
import { writingGroups } from "@/features/community/groups/group-store";

const member = (authorId: string, extra: object = {}) => ({
  authorId,
  membershipId: `m:${authorId}`,
  admin: false,
  ...extra,
});
const words = (authorId: string, day: string, count: number) => ({
  authorId,
  membershipId: `m:${authorId}`,
  day,
  words: count,
});

const circle = (extra: Partial<WritingGroup> = {}): WritingGroup => ({
  id: "c",
  name: "Lingkar",
  description: "",
  visibility: "publik",
  code: "X",
  members: [],
  invites: [],
  progress: [],
  hiddenPosts: [],
  ...extra,
});

describe("days", () => {
  it("knows real days only, and adds days across months and leap years", () => {
    expect(isDay("2026-02-28")).toBe(true);
    expect(isDay("2026-02-30")).toBe(false);
    expect(isDay("2026-2-3")).toBe(false);
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });

  it("ends a 45-day challenge on day 45, counting the first day", () => {
    expect(challengeEnd("2026-12-01")).toBe("2027-01-14");
  });
});

describe("kinds and periods", () => {
  it("treats a circle stored before kinds existed as permanent", () => {
    expect(kindOf(circle())).toBe("permanent");
    expect(challengeState(circle(), "2026-11-24")).toBeNull();
  });

  it("counts the calendar month for a permanent circle", () => {
    expect(periodOf(circle(), "2026-11-24")).toEqual({ from: "2026-11-01", to: "2026-11-30" });
    expect(periodOf(circle(), "2028-02-10")).toEqual({ from: "2028-02-01", to: "2028-02-29" });
  });

  it("counts the challenge dates, and says when it has not started or is over", () => {
    const challenge = circle({ kind: "challenge", startsOn: "2026-12-01", endsOn: "2027-01-14" });
    expect(periodOf(challenge, "2026-11-24")).toEqual({ from: "2026-12-01", to: "2027-01-14" });
    expect(challengeState(challenge, "2026-11-30")).toBe("upcoming");
    expect(challengeState(challenge, "2026-12-01")).toBe("running");
    expect(challengeState(challenge, "2027-01-14")).toBe("running");
    expect(challengeState(challenge, "2027-01-15")).toBe("finished");
    expect(daysLeft(challenge, "2027-01-14")).toBe(1);
    expect(daysLeft(challenge, "2026-12-01")).toBe(45);
    expect(daysLeft(challenge, "2027-01-15")).toBe(0);
  });
});

describe("boardRows", () => {
  it("never shows a member who did not opt in, and does not count their words", () => {
    const group = circle({
      members: [member("a", { board: true }), member("b"), member("c", { board: false })],
      words: [
        words("a", "2026-11-03", 100),
        words("b", "2026-11-03", 900),
        words("c", "2026-11-04", 50),
      ],
    });
    expect(boardRows(group, "2026-11-24")).toEqual([{ authorId: "a", words: 100, rank: 1 }]);
    expect(circleTotal(group, "2026-11-24")).toBe(100);
  });

  it("counts only words inside the period and from the member's opt-in day", () => {
    const group = circle({
      members: [member("a", { board: true, boardSince: "2026-11-10" })],
      words: [
        words("a", "2026-10-31", 500),
        words("a", "2026-11-09", 400),
        words("a", "2026-11-10", 120),
        words("a", "2026-11-20", 80),
        words("a", "2026-12-01", 999),
      ],
    });
    expect(boardRows(group, "2026-11-24")[0].words).toBe(200);
  });

  it("ignores words that belong to an earlier membership of the same person", () => {
    const group = circle({
      members: [member("a", { board: true })],
      words: [{ authorId: "a", membershipId: "old", day: "2026-11-03", words: 700 }],
    });
    expect(boardRows(group, "2026-11-24")[0].words).toBe(0);
  });

  it("ranks by words, shares a rank on a tie (1, 1, 3), and keeps ties in a steady order", () => {
    const group = circle({
      members: ["b", "a", "c", "d"].map((id) => member(id, { board: true })),
      words: [
        words("a", "2026-11-03", 300),
        words("b", "2026-11-03", 300),
        words("c", "2026-11-03", 100),
        words("d", "2026-11-03", 900),
      ],
    });
    expect(boardRows(group, "2026-11-24").map((r) => [r.authorId, r.rank])).toEqual([
      ["d", 1],
      ["a", 2],
      ["b", 2],
      ["c", 4],
    ]);
  });

  it("is empty when nobody has opted in", () => {
    expect(boardRows(circle({ members: [member("a")] }), "2026-11-24")).toEqual([]);
  });
});

describe("a finished challenge", () => {
  const group = circle({
    kind: "challenge",
    startsOn: "2026-12-01",
    endsOn: "2027-01-14",
    members: [member("a", { board: true }), member("b", { board: true })],
    words: [words("a", "2026-12-05", 10), words("b", "2026-12-06", 30)],
  });

  it("freezes the ranking with names, and keeps it readable after someone leaves", () => {
    const frozen = freezeBoard(group, (id) => id.toUpperCase());
    expect(frozen).toEqual([
      { authorId: "b", name: "B", words: 30, rank: 1 },
      { authorId: "a", name: "A", words: 10, rank: 2 },
    ]);
    expect(forgetMember(frozen, "b", "Anggota yang keluar")).toEqual([
      { authorId: null, name: "Anggota yang keluar", words: 30, rank: 1 },
      { authorId: "a", name: "A", words: 10, rank: 2 },
    ]);
  });
});

describe("validateCircleStart", () => {
  it("asks nothing of a permanent circle", () => {
    expect(validateCircleStart("permanent", "", "2026-11-24")).toBeNull();
  });

  it("needs a real start day, today or later, for a challenge", () => {
    expect(validateCircleStart("challenge", " ", "2026-11-24")).toBe("startRequired");
    expect(validateCircleStart("challenge", "2026-02-30", "2026-11-24")).toBe("startInvalid");
    expect(validateCircleStart("challenge", "2026-11-23", "2026-11-24")).toBe("startInPast");
    expect(validateCircleStart("challenge", "2026-11-24", "2026-11-24")).toBeNull();
  });
});

describe("stored circles", () => {
  beforeEach(() => writingGroups.reset());

  it("still reads a circle saved before the leaderboard existed", () => {
    const old = { ...circle(), id: "lama" };
    localStorage.setItem("ranah.writingGroups", JSON.stringify([old]));
    expect(writingGroups.read().map((g) => g.id)).toEqual(["lama"]);
  });

  it("reads the leaderboard fields when they are well formed", () => {
    const next = circle({
      id: "baru",
      kind: "challenge",
      startsOn: "2026-12-01",
      endsOn: "2027-01-14",
      members: [member("a", { board: true, boardSince: "2026-12-01" })],
      words: [words("a", "2026-12-02", 5)],
      requests: [{ authorId: "b", at: 1 }],
      finalBoard: [{ authorId: null, name: "x", words: 1, rank: 1 }],
    });
    localStorage.setItem("ranah.writingGroups", JSON.stringify([next]));
    expect(writingGroups.read()).toHaveLength(1);
  });

  it("drops a circle with a malformed leaderboard field instead of breaking the page", () => {
    const bad = [
      { ...circle({ id: "x1" }), kind: "tahunan" },
      { ...circle({ id: "x2" }), startsOn: "kemarin" },
      {
        ...circle({ id: "x3" }),
        words: [{ authorId: "a", membershipId: "m", day: "2026-11-01", words: -3 }],
      },
      { ...circle({ id: "x4" }), members: [{ ...member("a"), board: "ya" }] },
    ];
    localStorage.setItem("ranah.writingGroups", JSON.stringify([...bad, circle({ id: "ok" })]));
    expect(writingGroups.read().map((g) => g.id)).toEqual(["ok"]);
  });
});
