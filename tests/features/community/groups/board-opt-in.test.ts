import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ME_ID } from "@/features/kelola/identity";
import { setBoardOptIn, syncOwnWords } from "@/features/community/groups/board-actions";
import { mergeOwnWords, ownDays } from "@/features/community/groups/board-sync";
import { COASTAL_GROUP_ID, memberOf } from "@/features/community/groups/group-model";
import { writingGroups } from "@/features/community/groups/group-store";
import type { DailyLog } from "@/features/studio/daily-progress";

const log = (day: string, ...words: number[]): DailyLog => ({
  day,
  docs: Object.fromEntries(words.map((w, i) => [`d${i}`, { title: "t", words: w }])),
});
const circle = () => writingGroups.read().find((g) => g.id === COASTAL_GROUP_ID)!;
const me = () => memberOf(circle(), ME_ID)!;
const mine = () => (circle().words ?? []).filter((row) => row.authorId === ME_ID);

beforeEach(() => {
  sessionStorage.clear();
  writingGroups.reset();
});
afterEach(() => writingGroups.reset());

describe("ownDays", () => {
  it("sums the documents of a day, from the opt-in day, and skips empty days", () => {
    const days = ownDays(
      [log("2026-11-20", 300), log("2026-11-25", 100, 50), log("2026-11-26")],
      "2026-11-25",
    );
    expect(days).toEqual([{ day: "2026-11-25", words: 150 }]);
  });
});

describe("mergeOwnWords", () => {
  const other = { authorId: "x", membershipId: "m:x", day: "2026-11-25", words: 9 };
  it("replaces only this membership's rows", () => {
    const next = mergeOwnWords([other], "me", "m:me", [{ day: "2026-11-25", words: 5 }]);
    expect(next).toContainEqual(other);
    expect(next).toContainEqual({
      authorId: "me",
      membershipId: "m:me",
      day: "2026-11-25",
      words: 5,
    });
  });
  it("returns the same array when nothing changed", () => {
    const rows = [{ authorId: "me", membershipId: "m:me", day: "2026-11-25", words: 5 }];
    expect(mergeOwnWords(rows, "me", "m:me", [{ day: "2026-11-25", words: 5 }])).toBe(rows);
  });
});

describe("setBoardOptIn", () => {
  it("is off by default, turns on from today and off again", () => {
    expect(me().board).toBeUndefined();
    expect(setBoardOptIn(COASTAL_GROUP_ID, true, "2026-11-25").code).toBe("boardOn");
    expect(me()).toMatchObject({ board: true, boardSince: "2026-11-25" });
    expect(setBoardOptIn(COASTAL_GROUP_ID, false, "2026-11-26").code).toBe("boardOff");
    expect(me()).toMatchObject({ board: false });
    expect(me().boardSince).toBeUndefined();
  });

  it("keeps the first day when it is turned on twice", () => {
    setBoardOptIn(COASTAL_GROUP_ID, true, "2026-11-25");
    setBoardOptIn(COASTAL_GROUP_ID, true, "2026-11-30");
    expect(me().boardSince).toBe("2026-11-25");
  });

  it("refuses a missing circle, a non-member, and a bad day", () => {
    expect(setBoardOptIn("tidak-ada", true, "2026-11-25").code).toBe("unavailable");
    expect(setBoardOptIn("ruang-cerpen", true, "2026-11-25").code).toBe("blocked");
    expect(setBoardOptIn(COASTAL_GROUP_ID, true, "besok").ok).toBe(false);
  });
});

describe("syncOwnWords", () => {
  it("refuses until the member opted in", () => {
    expect(syncOwnWords(COASTAL_GROUP_ID, [log("2026-11-25", 100)]).ok).toBe(false);
    expect(mine()).toEqual([]);
  });

  it("writes own words from the opt-in day and nothing else", () => {
    setBoardOptIn(COASTAL_GROUP_ID, true, "2026-11-25");
    syncOwnWords(COASTAL_GROUP_ID, [log("2026-11-24", 900), log("2026-11-25", 120)]);
    expect(mine()).toEqual([
      { authorId: ME_ID, membershipId: me().membershipId, day: "2026-11-25", words: 120 },
    ]);
  });
});
