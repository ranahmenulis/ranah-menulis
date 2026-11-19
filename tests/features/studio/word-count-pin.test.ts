// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { SprintState } from "@/features/studio/sprint";
import { wordCountDisplay } from "@/features/studio/word-count-pin";

const idle = { phase: "idle" } as const;
const running: SprintState = { phase: "running", startedAt: 0, minutes: 25, startWords: 200 };
const done: SprintState = { phase: "done", minutes: 25, elapsedMs: 5000, words: 57, stopped: true };
const target = { words: 1000, missed: false, summary: "320 / 1.000 kata · 5 hari lagi" };

describe("wordCountDisplay", () => {
  it("uses the document count and selection by default, and the total alone when pinned", () => {
    expect(wordCountDisplay(null, 0, undefined, idle, null).label).toBe("0 kata");
    expect(wordCountDisplay(null, 1234, 0, idle, null).label).toBe("0 dari 1.234 kata");
    expect(wordCountDisplay(null, 1234, 12, idle, null).label).toBe("12 dari 1.234 kata");
    expect(wordCountDisplay("document", 1234, 12, running, target).label).toBe("1.234 kata");
  });

  it("shows the live sprint gain, clamped at zero, and the frozen result after it ends", () => {
    expect(wordCountDisplay("sprint", 320, undefined, running, target)).toEqual({
      label: "+120 kata",
      accessibleLabel: "Sprint: +120 kata",
    });
    expect(wordCountDisplay("sprint", 100, undefined, running, null).label).toBe("+0 kata");
    expect(wordCountDisplay("sprint", 400, undefined, done, null).label).toBe("+57 kata");
  });

  it("keeps the target short and identifies missed targets in the bar", () => {
    expect(wordCountDisplay("target", 320, 12, running, target)).toEqual({
      label: "320 / 1.000",
      accessibleLabel: "Target dokumen: 320 / 1.000",
    });
    const missed = { ...target, missed: true, summary: "320 / 1.000 kata · terlewat 2 hari" };
    expect(wordCountDisplay("target", 320, undefined, idle, missed)).toEqual({
      label: "320 / 1.000",
      qualifier: "terlewat",
      accessibleLabel: "Target dokumen: 320 / 1.000 · terlewat",
    });
  });

  it("explains why the usual count appears without a sprint or displayable target", () => {
    expect(wordCountDisplay("sprint", 320, 12, idle, target)).toEqual({
      label: "12 dari 320 kata",
      fallbackNote: "Belum ada sprint di halaman ini. Mulai sprint untuk melihat jumlah katanya.",
    });
    expect(wordCountDisplay("target", 320, undefined, done, null)).toEqual({
      label: "320 kata",
      fallbackNote: "Belum ada target dokumen yang perlu ditampilkan.",
    });
  });
});
