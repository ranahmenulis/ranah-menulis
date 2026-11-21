import { describe, expect, it } from "vitest";
import { soloFigure } from "@/features/projects/solo/solo-model";
import { stagePosition } from "@/features/projects/solo/stage-model";
import type { Submission } from "@/features/projects/submission-types";
import { BASIC, FULL, walked } from "./helpers";

const work = (status: Submission["status"]) => ({ status, title: "Naskah" }) as Submission;

describe("stagePosition", () => {
  it("counts the submission, so the first stage after acceptance is the second", () => {
    expect(stagePosition(FULL, null)).toEqual({ index: 2, total: 8, stage: "penyuntingan" });
  });

  it("follows the log to the running stage, up to the last one", () => {
    expect(stagePosition(FULL, walked(FULL, "layout"))).toMatchObject({ index: 5, total: 8 });
    expect(stagePosition(BASIC, walked(BASIC, "selesai"))).toEqual({
      index: 4,
      total: 4,
      stage: "selesai",
    });
  });
});

describe("soloFigure", () => {
  it("says where the submission is before it is accepted", () => {
    expect(soloFigure(undefined, FULL, null)).toEqual({
      kind: "status",
      label: "Naskah belum diajukan",
    });
    expect(soloFigure(work("terkirim"), FULL, null).kind).toBe("status");
    expect(soloFigure(work("perlu-revisi"), FULL, null)).toMatchObject({ label: "Perlu revisi" });
    expect(soloFigure(work("ditolak"), FULL, null)).toMatchObject({
      label: "Pengajuan tidak lolos",
    });
  });

  it("names the running stage once the submission is accepted", () => {
    expect(soloFigure(work("diterima"), FULL, walked(FULL, "cover"))).toEqual({
      kind: "stage",
      index: 4,
      total: 8,
      label: "Desain cover",
    });
  });
});
