import { describe, expect, it } from "vitest";
import { kelolaEditor as editorEn } from "@/features/kelola/editor/copy/en";
import { kelolaEditor as editorId } from "@/features/kelola/editor/copy/id";
import { queueFilterLabel } from "@/features/kelola/editor/queue-model";
import { stepsFor } from "@/features/kelola/editor/review-model";
import { kelolaShared as sharedEn } from "@/features/kelola/copy/shared-en";
import { kelolaShared as sharedId } from "@/features/kelola/copy/shared-id";
import { adminWork, editorWork } from "@/features/kelola/role-band";
import { reasonText } from "@/features/kelola/reason";
import { submission } from "../projects/helpers";

function keys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort().join(",");

function leaves(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value !== "object" || value === null) return [];
  return Object.values(value).flatMap(leaves);
}

describe("Kelola shared and Editor dictionaries", () => {
  it("English has the same keys and placeholders as Indonesian", () => {
    expect(keys(sharedEn)).toEqual(keys(sharedId));
    expect(keys(editorEn)).toEqual(keys(editorId));
    expect(leaves(sharedEn).map(placeholders)).toEqual(leaves(sharedId).map(placeholders));
    expect(leaves(editorEn).map(placeholders)).toEqual(leaves(editorId).map(placeholders));
  });
});

describe("pure helpers in English", () => {
  it("names the queue filters and the steps in English", () => {
    expect(queueFilterLabel("perlu-tindakan", "en")).toBe("Needs action");
    expect(queueFilterLabel("perlu-tindakan")).toBe("Perlu tindakan");
    const steps = stepsFor(submission({ status: "peninjauan" }), "en").map((s) => s.label);
    expect(steps).toEqual(["Request revision", "Accept", "Reject"]);
  });

  it("labels the band entry and the reason problem in the given language", () => {
    const counts = { "perlu-tindakan": 2, ditinjau: 0, "menunggu-revisi": 0, selesai: 0, semua: 2 };
    const work = editorWork(counts, "en");
    expect(work.status === "ready" && work.entry?.label).toBe("Review what needs action");
    const admin = adminWork([{ status: "baru" }], "en");
    expect(admin.status === "ready" && admin.entry?.label).toBe("Open moderation");
    expect(reasonText("terlalu-panjang", "en")).toBe("The reason can be up to 1,000 characters.");
    expect(reasonText("terlalu-panjang")).toBe("Alasan paling banyak 1.000 karakter.");
  });
});
