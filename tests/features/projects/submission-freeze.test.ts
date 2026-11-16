import { describe, expect, it } from "vitest";
import { canonicalJson, freezeVersion } from "@/features/projects/submission-freeze";
import { NOW, textOf } from "./helpers";

describe("canonicalJson", () => {
  it("gives the same text for the same content however the keys are ordered", () => {
    expect(canonicalJson({ b: 1, a: { d: [1, { z: 1, y: 2 }], c: null } })).toBe(
      canonicalJson({ a: { c: null, d: [1, { y: 2, z: 1 }] }, b: 1 }),
    );
  });

  it("ignores undefined keys and keeps array order", () => {
    expect(canonicalJson({ a: undefined, b: 1 })).toBe('{"b":1}');
    expect(canonicalJson([2, 1])).not.toBe(canonicalJson([1, 2]));
  });
});

describe("freezeVersion", () => {
  it("copies the content, counts its words, and stamps hash and time", () => {
    const content = textOf(12);
    const version = freezeVersion(content, NOW);
    expect(version).toMatchObject({ version: 1, wordCount: 12, frozenAt: NOW });
    expect(version.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(version.content).toEqual(content);
  });

  it("does not change when the document is edited afterwards (BR-STD-03)", () => {
    const content = textOf(5);
    const version = freezeVersion(content, NOW);
    const before = JSON.stringify(version.content);
    (content.content![0].content![0] as { text: string }).text = "diedit sesudahnya";
    content.content!.push({ type: "paragraph" });
    expect(JSON.stringify(version.content)).toBe(before);
    expect(version.wordCount).toBe(5);
  });

  it("gives equal hashes for equal text and different ones for different text", () => {
    expect(freezeVersion(textOf(4), NOW).hash).toBe(freezeVersion(textOf(4), NOW + 5).hash);
    expect(freezeVersion(textOf(4), NOW).hash).not.toBe(freezeVersion(textOf(5), NOW).hash);
  });
});
