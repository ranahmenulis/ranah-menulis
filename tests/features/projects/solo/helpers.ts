import type { SoloProgress, SoloStage } from "@/features/projects/solo/types";

export const SOLO = "solo-penerbitan-buku-sendiri";
export const ID = "s1";
export const BASE = { id: ID, slug: SOLO };

export const FULL: SoloStage[] = [
  "pengajuan",
  "penyuntingan",
  "proofreading",
  "cover",
  "layout",
  "persetujuan-final",
  "produksi",
  "selesai",
];
export const BASIC: SoloStage[] = ["pengajuan", "penyuntingan", "proofreading", "selesai"];

/**
 * A row whose log walks through `stages` up to and including `to`. The first stage after the
 * submission starts at acceptance, so it has no entry of its own (like a real row).
 */
export function walked(stages: SoloStage[], to: SoloStage): SoloProgress {
  const upTo = stages.slice(2, stages.indexOf(to) + 1);
  return {
    ...BASE,
    files: [],
    log: upTo.map((stage, i) => ({
      kind: "lanjut" as const,
      stage,
      at: 1000 + i,
      by: "organizer" as const,
    })),
  };
}

/** A row with a cover and a layout preview, which the final approval needs. */
export const withPreviews = (row: SoloProgress): SoloProgress => ({
  ...row,
  files: [
    { id: "c1", kind: "cover", name: "Sampul buku", version: 1, at: 2000, sizeKb: 840 },
    { id: "l1", kind: "layout", name: "Isi buku", version: 1, at: 2001, sizeKb: 2300 },
  ],
});
