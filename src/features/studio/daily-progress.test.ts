import { describe, expect, it } from "vitest";
import { applyWordDelta, dayKey, emptyLog, topDocuments, totalWords } from "./daily-progress";

const doc = { id: "a", title: "Surat untuk Kakek" };

describe("applyWordDelta", () => {
  it("adds words written today", () => {
    const log = applyWordDelta(emptyLog(), doc, 0, 120);
    expect(totalWords(log)).toBe(120);
  });

  it("keeps adding across saves of the same document", () => {
    let log = applyWordDelta(emptyLog(), doc, 0, 120);
    log = applyWordDelta(log, doc, 120, 150);
    expect(totalWords(log)).toBe(150);
  });

  it("reduces words written today when they are deleted", () => {
    let log = applyWordDelta(emptyLog(), doc, 0, 120);
    log = applyWordDelta(log, doc, 120, 100);
    expect(totalWords(log)).toBe(100);
  });

  it("never goes below zero and does not count deleting older text", () => {
    const log = applyWordDelta(emptyLog(), doc, 300, 200);
    expect(totalWords(log)).toBe(0);
    expect(log.docs).toEqual({});
  });

  it("clamps at zero for a document that had words today", () => {
    let log = applyWordDelta(emptyLog(), doc, 0, 40);
    log = applyWordDelta(log, doc, 340, 100);
    expect(log.docs.a.words).toBe(0);
  });

  it("does not mutate the previous log", () => {
    const before = emptyLog();
    applyWordDelta(before, doc, 0, 10);
    expect(before.docs).toEqual({});
  });
});

describe("topDocuments", () => {
  it("returns the largest documents first, limited and without zeros", () => {
    let log = emptyLog();
    log = applyWordDelta(log, { id: "a", title: "A" }, 0, 10);
    log = applyWordDelta(log, { id: "b", title: "B" }, 0, 300);
    log = applyWordDelta(log, { id: "c", title: "C" }, 0, 50);
    log = applyWordDelta(log, { id: "d", title: "D" }, 0, 80);
    expect(topDocuments(log).map((d) => d.id)).toEqual(["b", "d", "c"]);
  });
});

describe("dayKey", () => {
  it("formats the local calendar day", () => {
    expect(dayKey(new Date(2026, 10, 5, 23, 59))).toBe("2026-11-05");
  });
});
