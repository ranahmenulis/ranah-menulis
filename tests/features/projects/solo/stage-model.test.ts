import { describe, expect, it } from "vitest";
import {
  approvalBlock,
  changeRounds,
  changeTarget,
  currentStage,
  MAX_CHANGE_ROUNDS,
  packageStages,
  timeline,
  withAdvance,
  withApproval,
  withChangeRequest,
  withFile,
} from "@/features/projects/solo/stage-model";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import { BASE, BASIC, FULL, walked, withPreviews } from "./helpers";

const solo = projectFixtures.find((p) => p.slug === BASE.slug)!;
const packages = solo.block.kind === "solo" ? solo.block.packages : [];

describe("packageStages", () => {
  it("builds each fixture package from what it includes, never more", () => {
    expect(packageStages(packages[0].includes)).toEqual(BASIC);
    expect(packageStages(packages[1].includes)).toEqual([
      "pengajuan",
      "penyuntingan",
      "proofreading",
      "cover",
      "layout",
      "selesai",
    ]);
    expect(packageStages(packages[2].includes)).toEqual(FULL);
  });

  it("keeps only the submission and the end for an unknown package", () => {
    expect(packageStages(["Sesuatu yang lain"])).toEqual(["pengajuan", "selesai"]);
  });
});

describe("advancing", () => {
  it("starts at the first stage after the submission and moves one stage at a time", () => {
    expect(currentStage(FULL, null)).toBe("penyuntingan");
    const one = withAdvance(FULL, null, BASE, 10)!;
    expect(currentStage(FULL, one)).toBe("proofreading");
    expect(one.log[0]).toMatchObject({ kind: "lanjut", by: "organizer", at: 10 });
  });

  it("refuses to leave the final approval and to go past the end", () => {
    expect(withAdvance(FULL, walked(FULL, "persetujuan-final"), BASE, 1)).toBeNull();
    expect(withAdvance(FULL, walked(FULL, "selesai"), BASE, 1)).toBeNull();
  });

  it("finishes a package with no final approval after its last stage", () => {
    const done = withAdvance(BASIC, walked(BASIC, "proofreading"), BASE, 1)!;
    expect(currentStage(BASIC, done)).toBe("selesai");
  });
});

describe("the final approval", () => {
  const atFinal = withPreviews(walked(FULL, "persetujuan-final"));

  it("waits for the previews the package promises before anyone can decide", () => {
    const bare = walked(FULL, "persetujuan-final");
    expect(approvalBlock(FULL, bare)).toBe("tanpa-pratinjau");
    expect(withApproval(FULL, bare, BASE, 1)).toBeNull();
    expect(withChangeRequest(FULL, bare, BASE, 1, "ubah")).toBeNull();
    expect(approvalBlock(FULL, withPreviews(bare))).toBeNull();
  });

  it("lets the author approve only at that stage, and production starts", () => {
    expect(withApproval(FULL, walked(FULL, "layout"), BASE, 1)).toBeNull();
    const approved = withApproval(FULL, atFinal, BASE, 5)!;
    expect(currentStage(FULL, approved)).toBe("produksi");
    expect(approved.log.at(-1)).toMatchObject({ kind: "setuju", by: "penulis" });
    // No way back: neither another approval nor a change request.
    expect(withApproval(FULL, approved, BASE, 6)).toBeNull();
    expect(withChangeRequest(FULL, approved, BASE, 6, "ubah")).toBeNull();
  });

  it("sends the book back to the layout with the note, and counts the round", () => {
    const back = withChangeRequest(FULL, atFinal, BASE, 5, "  Margin terlalu sempit  ")!;
    expect(currentStage(FULL, back)).toBe("layout");
    expect(back.log.at(-1)?.note).toBe("Margin terlalu sempit");
    expect(changeRounds(back)).toBe(1);
  });

  it("needs a note", () => {
    expect(withChangeRequest(FULL, atFinal, BASE, 5, "   ")).toBeNull();
  });

  it("allows two rounds of changes and then only approving", () => {
    let row = atFinal;
    for (let i = 0; i < MAX_CHANGE_ROUNDS; i++) {
      row = withChangeRequest(FULL, row, BASE, 10 + i, "ubah")!;
      row = withAdvance(FULL, row, BASE, 20 + i)!; // layout -> final approval
      expect(currentStage(FULL, row)).toBe("persetujuan-final");
    }
    expect(approvalBlock(FULL, row, true)).toBe("putaran-habis");
    expect(withChangeRequest(FULL, row, BASE, 99, "lagi")).toBeNull();
    expect(approvalBlock(FULL, row)).toBeNull();
    expect(withApproval(FULL, row, BASE, 100)).not.toBeNull();
  });

  it("goes back to the cover when the package has no layout", () => {
    expect(changeTarget(["pengajuan", "cover", "persetujuan-final", "produksi", "selesai"])).toBe(
      "cover",
    );
    expect(changeTarget(BASIC)).toBeNull();
  });
});

describe("preview files and the timeline", () => {
  it("counts versions per kind", () => {
    let row = withFile(null, BASE, "cover", 1);
    row = withFile(row, BASE, "layout", 2);
    row = withFile(row, BASE, "cover", 3);
    expect(row.files.map((f) => `${f.kind}${f.version}`)).toEqual(["cover1", "layout1", "cover2"]);
  });

  const sent = { submittedAt: 100, acceptedAt: 200 };

  it("shows only the submission before acceptance, everything else waiting", () => {
    const rows = timeline(FULL, null, { ...sent, accepted: false, acceptedAt: null });
    expect(rows[0]).toMatchObject({ state: "berjalan", at: 100 });
    expect(rows.slice(1).every((r) => r.state === "menunggu" && r.at === null)).toBe(true);
  });

  it("marks stages done, running and waiting with their dates", () => {
    const rows = timeline(FULL, walked(FULL, "cover"), { ...sent, accepted: true });
    expect(rows.map((r) => r.state)).toEqual([
      "selesai",
      "selesai",
      "selesai",
      "berjalan",
      "menunggu",
      "menunggu",
      "menunggu",
      "menunggu",
    ]);
    expect(rows[1].at).toBe(200);
    expect(rows[2].at).toBe(1000);
    expect(rows[3].at).toBe(1001);
    expect(rows[4].at).toBeNull();
  });

  it("dates the first stage from the acceptance, and finishes every stage at the end", () => {
    expect(timeline(FULL, null, { ...sent, accepted: true })[1]).toMatchObject({
      state: "berjalan",
      at: 200,
    });
    const end = timeline(BASIC, walked(BASIC, "selesai"), { ...sent, accepted: true });
    expect(end.every((r) => r.state === "selesai")).toBe(true);
  });
});
