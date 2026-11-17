import { describe, expect, it } from "vitest";
import {
  addTarget,
  dueLabel,
  MAX_TARGETS,
  nearestTarget,
  parseTargetWords,
  removeTarget,
  sanitizeTargets,
  sortTargets,
  targetLine,
  targetStatus,
  targetSummary,
  type DocumentTarget,
} from "@/features/studio/document-targets";

const TODAY = "2026-11-18";
const t = (id: string, words: number, due: string | null = null): DocumentTarget => ({
  id,
  words,
  due,
});

describe("parseTargetWords", () => {
  it.each([
    ["1.000", 1000],
    [" 500 ", 500],
    ["500000", 500_000],
  ])("accepts %j", (input, expected) => expect(parseTargetWords(input)).toBe(expected));

  it.each(["", "0", "500001", "-5", "2,5", "abc"])("rejects %j", (input) =>
    expect(parseTargetWords(input)).toBeNull(),
  );
});

describe("addTarget", () => {
  it("adds a target with or without a due day", () => {
    const first = addTarget([], t("a", 1000), TODAY);
    expect(first).toEqual({ ok: true, list: [t("a", 1000)] });
    const second = addTarget([t("a", 1000)], t("b", 3000, "2026-12-20"), TODAY);
    expect(second.ok && second.list).toHaveLength(2);
  });

  it("accepts today as a due day but refuses the past and nonsense", () => {
    expect(addTarget([], t("a", 100, TODAY), TODAY).ok).toBe(true);
    expect(addTarget([], t("a", 100, "2026-11-17"), TODAY)).toEqual({ ok: false, reason: "due" });
    expect(addTarget([], t("a", 100, "2026-02-30"), TODAY)).toEqual({ ok: false, reason: "due" });
  });

  it("refuses an identical target and more than the limit", () => {
    expect(addTarget([t("a", 100)], t("b", 100), TODAY)).toEqual({
      ok: false,
      reason: "duplicate",
    });
    const full = Array.from({ length: MAX_TARGETS }, (_, i) => t(String(i), 100 + i));
    expect(addTarget(full, t("x", 9999), TODAY)).toEqual({ ok: false, reason: "limit" });
  });

  it("removes by id", () => {
    expect(removeTarget([t("a", 1), t("b", 2)], "a")).toEqual([t("b", 2)]);
  });
});

describe("status and wording", () => {
  it("is reached at or above the target, missed after the due day, otherwise running", () => {
    expect(targetStatus(t("a", 100, "2026-11-01"), 100, TODAY)).toBe("tercapai");
    expect(targetStatus(t("a", 100, "2026-11-17"), 99, TODAY)).toBe("terlewat");
    expect(targetStatus(t("a", 100, TODAY), 99, TODAY)).toBe("berjalan");
    expect(targetStatus(t("a", 100), 0, TODAY)).toBe("berjalan");
  });

  it("describes the due day in words", () => {
    expect(dueLabel("2026-11-18", TODAY)).toBe("tenggat hari ini");
    expect(dueLabel("2026-11-19", TODAY)).toBe("tenggat besok");
    expect(dueLabel("2026-11-23", TODAY)).toBe("5 hari lagi");
    expect(dueLabel("2026-11-15", TODAY)).toBe("terlewat 3 hari");
  });

  it("reads as progress, capped at the target", () => {
    expect(targetLine(t("a", 1000, "2026-11-23"), 320, TODAY)).toBe(
      "320 / 1.000 kata · 5 hari lagi",
    );
    expect(targetLine(t("a", 1000), 320, TODAY)).toBe("320 / 1.000 kata");
    expect(targetLine(t("a", 1000), 1500, TODAY)).toBe("1.000 / 1.000 kata · tercapai");
  });
});

describe("ordering and the nearest target", () => {
  it("sorts the soonest due day first, no deadline last", () => {
    const sorted = sortTargets([
      t("n", 50),
      t("late", 10, "2026-12-20"),
      t("soon", 10, "2026-11-20"),
    ]);
    expect(sorted.map((x) => x.id)).toEqual(["soon", "late", "n"]);
  });

  it("picks the nearest unreached target, preferring one still running over a missed one", () => {
    const list = [t("missed", 100, "2026-11-01"), t("run", 500, "2026-12-01"), t("done", 10)];
    expect(nearestTarget(list, 50, TODAY)?.id).toBe("run");
    expect(nearestTarget([t("missed", 100, "2026-11-01")], 50, TODAY)?.id).toBe("missed");
    expect(nearestTarget([t("done", 10)], 50, TODAY)).toBeNull();
    expect(nearestTarget([], 0, TODAY)).toBeNull();
  });

  it("summarises stored data safely", () => {
    expect(targetSummary(undefined, 0, TODAY)).toBeNull();
    expect(targetSummary("rusak", 0, TODAY)).toBeNull();
    expect(targetSummary([{ id: "a", words: 1000, due: "2026-11-23" }], 320, TODAY)).toBe(
      "320 / 1.000 kata · 5 hari lagi",
    );
  });
});

describe("sanitizeTargets", () => {
  it("drops anything that is not a valid target and trims to the limit", () => {
    const raw = [
      { id: "ok", words: 100, due: "2026-12-01" },
      { id: 5, words: 100 },
      { id: "zero", words: 0 },
      { id: "huge", words: 9_999_999 },
      { id: "baddue", words: 200, due: "besok" },
      null,
    ];
    expect(sanitizeTargets(raw)).toEqual([
      { id: "ok", words: 100, due: "2026-12-01" },
      { id: "baddue", words: 200, due: null },
    ]);
    expect(sanitizeTargets("x")).toEqual([]);
    expect(
      sanitizeTargets(Array.from({ length: 9 }, (_, i) => ({ id: String(i), words: 10 }))),
    ).toHaveLength(MAX_TARGETS);
  });
});
