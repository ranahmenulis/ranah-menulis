import { describe, expect, it } from "vitest";
import type { DailyLog } from "@/features/studio/daily-progress";
import {
  commitSave,
  type SaveInput,
  type StudioDocument,
} from "@/features/studio/storage/document-store";
import { needsPreviousText, planRemoteSave } from "@/features/studio/storage/remote/save-plan";
import type { DocumentVersion } from "@/features/studio/versions";

const NOW = 1_800_000_000_000;
const content = { type: "doc" };
const stored = (words: number, version = 2): StudioDocument => ({
  id: "d",
  title: "t",
  content,
  wordCount: words,
  version,
  updatedAt: NOW - 3_600_000,
});
const input = (words: number): SaveInput => ({ id: "d", title: "t", content, wordCount: words });
const log = (words?: number): DailyLog => ({
  day: "2026-11-25",
  docs: words === undefined ? {} : { d: { title: "t", words } },
});

describe("planRemoteSave matches the local save rules", () => {
  // For every scenario the numbers handed to the database must equal what commitSave would write.
  const scenarios: [string, StudioDocument | null, number, DailyLog, number | null | undefined][] =
    [
      ["a new document", null, 40, log(), undefined],
      ["adding words", stored(100), 130, log(100), undefined],
      ["deleting words written today", stored(100), 70, log(100), undefined],
      ["deleting words from an earlier day", stored(100), 70, log(), undefined],
      ["no change", stored(100), 100, log(100), undefined],
      ["a restored baseline", stored(100), 130, log(100), 90],
      ["no activity baseline", stored(100), 130, log(100), null],
    ];

  it.each(scenarios)("%s", (_name, previous, words, todayLog, baseline) => {
    const options = baseline === undefined ? undefined : { activityBaseWords: baseline };
    const local = commitSave(previous, input(words), previous?.version ?? 0, todayLog, NOW, {
      ...options,
      hour: 9,
    });
    if (!local.ok) throw new Error("unexpected conflict");
    const plan = planRemoteSave({
      previous,
      input: input(words),
      todayLog,
      options,
      hour: 9,
      now: NOW,
      latest: null,
    });

    const entry = local.progress.docs.d;
    expect(plan.docWords).toBe(entry ? entry.words : null);

    const activity = local.progress.activity;
    if (!plan.activity) {
      expect(activity).toBeUndefined();
    } else {
      expect(activity?.wordsReduced ?? 0).toBe(plan.activity.reduced ?? 0);
      expect(activity?.wordsAddedByHour[9] ?? 0).toBe(plan.activity.added ?? 0);
    }
  });
});

describe("planRemoteSave snapshots", () => {
  it("keeps a periodic snapshot when none exists, and none right after another", () => {
    const first = planRemoteSave({
      previous: stored(10),
      input: input(12),
      todayLog: log(),
      hour: 9,
      now: NOW,
      latest: null,
    });
    expect(first.versions.map((v) => v.reason)).toEqual(["berkala"]);
    expect(first.versions[0].id).toBe("d:v3");

    const latest: DocumentVersion = {
      id: "d:v2",
      docId: "d",
      savedAt: NOW - 60_000,
      title: "other",
      content,
      wordCount: 1,
      reason: "berkala",
    };
    const again = planRemoteSave({
      previous: stored(10),
      input: input(12),
      todayLog: log(),
      hour: 9,
      now: NOW,
      latest,
    });
    expect(again.versions).toEqual([]);
  });

  it("keeps the previous text before a large deletion", () => {
    expect(needsPreviousText(1000, 100)).toBe(true);
    expect(needsPreviousText(1000, 950)).toBe(false);
    const plan = planRemoteSave({
      previous: { ...stored(1000), content: { type: "doc", content: [] } },
      input: input(100),
      todayLog: log(),
      hour: 9,
      now: NOW,
      latest: null,
    });
    expect(plan.versions.map((v) => v.reason)).toContain("pelindung");
  });
});
