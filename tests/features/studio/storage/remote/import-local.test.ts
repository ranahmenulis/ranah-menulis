import { describe, expect, it } from "vitest";
import type { DailyLog } from "@/features/studio/daily-progress";
import { mergeLogs } from "@/features/studio/storage/remote/import-local";

const day = (d: string, docs: DailyLog["docs"], activity?: DailyLog["activity"]): DailyLog => ({
  day: d,
  docs,
  ...(activity ? { activity } : {}),
});

describe("mergeLogs", () => {
  it("sends days the account does not have as they are", () => {
    const device = [day("2026-11-01", { a: { title: "A", words: 10 } })];
    expect(mergeLogs([], device)).toEqual(device);
  });

  it("adds device documents to a shared day and lets the account win on the same document", () => {
    const account = [day("2026-11-02", { a: { title: "A", words: 50 } })];
    const device = [
      day("2026-11-02", { a: { title: "A", words: 10 }, b: { title: "B", words: 5 } }),
    ];
    expect(mergeLogs(account, device)).toEqual([
      day("2026-11-02", { a: { title: "A", words: 50 }, b: { title: "B", words: 5 } }),
    ]);
  });

  it("keeps the account's activity, or the device's when the account has none", () => {
    const mine = { wordsReduced: 3, wordsAddedByHour: {} };
    const theirs = { wordsReduced: 9, wordsAddedByHour: { 9: 4 } };
    expect(mergeLogs([day("d", {}, mine)], [day("d", {}, theirs)])[0].activity).toEqual(mine);
    expect(mergeLogs([day("d", {})], [day("d", {}, theirs)])[0].activity).toEqual(theirs);
  });

  it("does not send days that only the account has", () => {
    expect(mergeLogs([day("2026-11-03", {})], [])).toEqual([]);
  });
});
