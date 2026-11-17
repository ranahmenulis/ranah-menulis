import { describe, expect, it } from "vitest";
import type { StudioDocument } from "@/features/studio/storage/document-store";
import {
  deltaLabel,
  isLargeDeletion,
  MAX_VERSIONS,
  planSnapshots,
  RETENTION_MS,
  SNAPSHOT_INTERVAL_MS,
  versionId,
  versionsToPrune,
  visibleVersions,
  type DocumentVersion,
} from "@/features/studio/versions";

const NOW = 10_000_000_000;
const content = (text: string) => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text }] }],
});

function doc(over: Partial<StudioDocument> = {}): StudioDocument {
  return {
    id: "d1",
    title: "Surat",
    content: content("isi"),
    wordCount: 300,
    version: 1,
    updatedAt: NOW,
    ...over,
  };
}

function kept(over: Partial<DocumentVersion> = {}): DocumentVersion {
  return {
    id: "d1:v1",
    docId: "d1",
    savedAt: NOW - 5 * 60_000,
    title: "Surat",
    content: content("lama"),
    wordCount: 280,
    reason: "berkala",
    ...over,
  };
}

describe("isLargeDeletion", () => {
  it("needs both enough words and a big enough share", () => {
    expect(isLargeDeletion(300, 150)).toBe(true); // 150 words, 50%
    expect(isLargeDeletion(300, 220)).toBe(false); // 80 words
    expect(isLargeDeletion(1000, 850)).toBe(false); // 150 words but only 15%
    expect(isLargeDeletion(300, 400)).toBe(false); // growth
  });
});

describe("planSnapshots", () => {
  it("keeps the very first save as a version", () => {
    const saved = doc();
    const plan = planSnapshots(null, saved, [], NOW);
    expect(plan).toHaveLength(1);
    expect(plan[0]).toMatchObject({ id: versionId("d1", 1), reason: "berkala", savedAt: NOW });
  });

  it("waits ten minutes between periodic snapshots", () => {
    const saved = doc({ version: 2, content: content("baru") });
    expect(planSnapshots(doc(), saved, [kept()], NOW)).toEqual([]);
    const old = kept({ savedAt: NOW - SNAPSHOT_INTERVAL_MS });
    expect(planSnapshots(doc(), saved, [old], NOW)).toHaveLength(1);
  });

  it("does not repeat a snapshot of identical text", () => {
    const same = doc({ version: 2 });
    const old = kept({
      savedAt: NOW - SNAPSHOT_INTERVAL_MS,
      content: same.content,
      wordCount: same.wordCount,
    });
    expect(planSnapshots(doc(), same, [old], NOW)).toEqual([]);
  });

  it("keeps the text from before a large deletion, even within the ten minutes", () => {
    const before = doc({ version: 4, wordCount: 600, content: content("banyak sekali") });
    const after = doc({ version: 5, wordCount: 100, content: content("sedikit") });
    const plan = planSnapshots(before, after, [kept({ savedAt: NOW - 60_000 })], NOW);
    expect(plan).toHaveLength(1);
    expect(plan[0]).toMatchObject({
      id: versionId("d1", 4),
      reason: "pelindung",
      wordCount: 600,
      savedAt: before.updatedAt,
    });
  });

  it("does not keep the same protected state twice", () => {
    const before = doc({ version: 4, wordCount: 600 });
    const after = doc({ version: 5, wordCount: 100 });
    const already = kept({ id: versionId("d1", 4), savedAt: NOW - 60_000 });
    expect(planSnapshots(before, after, [already], NOW)).toEqual([]);
  });
});

describe("pruning and visibility", () => {
  it("drops versions older than three days", () => {
    const old = kept({ id: "old", savedAt: NOW - RETENTION_MS - 1 });
    const fresh = kept({ id: "fresh", savedAt: NOW - RETENTION_MS + 1000 });
    expect(versionsToPrune([old, fresh], NOW)).toEqual(["old"]);
    expect(visibleVersions([old, fresh], NOW).map((v) => v.id)).toEqual(["fresh"]);
  });

  it("keeps the newest hundred and drops the oldest beyond that", () => {
    const many = Array.from({ length: MAX_VERSIONS + 3 }, (_, i) =>
      kept({ id: `v${i}`, savedAt: NOW - i * 60_000 }),
    );
    const pruned = versionsToPrune(many, NOW);
    expect(pruned).toHaveLength(3);
    expect(pruned).toEqual(["v100", "v101", "v102"]);
  });

  it("lists newest first", () => {
    const a = kept({ id: "a", savedAt: NOW - 3000 });
    const b = kept({ id: "b", savedAt: NOW - 1000 });
    expect(visibleVersions([a, b], NOW).map((v) => v.id)).toEqual(["b", "a"]);
  });
});

describe("deltaLabel", () => {
  it("says how far a version is from the text now", () => {
    expect(deltaLabel(500, 300)).toBe("+200 kata dari sekarang");
    expect(deltaLabel(100, 1300)).toBe("−1.200 kata dari sekarang");
    expect(deltaLabel(300, 300)).toBe("sama dengan sekarang");
  });
});
