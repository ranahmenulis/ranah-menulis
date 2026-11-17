import { describe, expect, it } from "vitest";
import { reviewAccess } from "@/features/kelola/editor/assignments";
import {
  applyFilter,
  countByFilter,
  parseQueueFilter,
  queueQuery,
  queueRows,
} from "@/features/kelola/editor/queue-model";
import { resolveReview, stepsFor } from "@/features/kelola/editor/review-model";
import { validateReason } from "@/features/kelola/reason";
import type { Submission } from "@/features/projects/submission-types";
import { submission } from "../../projects/helpers";

const ASSIGNED = "antologi-surat-yang-tidak-pernah-terkirim";
const OTHER = "antologi-puisi-tengah-malam";
const LOMBA = "lomba-esai-literasi-remaja";

function work(over: Partial<Submission> = {}) {
  return submission({ slug: ASSIGNED, ...over });
}

describe("reviewAccess", () => {
  it("lets an Editor review only the projects assigned to them", () => {
    expect(reviewAccess(["editor"], ASSIGNED)).toBe("ok");
    expect(reviewAccess(["editor"], OTHER)).toBe("tidak-ditugaskan");
  });

  it("gives no review rights to roles without Editor or admin", () => {
    expect(reviewAccess(["juri", "mentor", "organizer"], ASSIGNED)).toBe("tidak-ditugaskan");
    expect(reviewAccess([], ASSIGNED)).toBe("tidak-ditugaskan");
  });

  it("lets Administrator and Super Admin review any Antologi or Solo project", () => {
    expect(reviewAccess(["administrator"], OTHER)).toBe("ok");
    expect(reviewAccess(["super-admin"], OTHER)).toBe("ok");
  });

  it("keeps Lomba, Kelas and unknown projects out of the Editor queue for everyone", () => {
    expect(reviewAccess(["administrator"], LOMBA)).toBe("bukan-karya-editor");
    expect(reviewAccess(["editor"], "kelas-cerpen-untuk-pemula")).toBe("bukan-karya-editor");
    expect(reviewAccess(["administrator"], "tidak-ada")).toBe("bukan-karya-editor");
  });
});

describe("queue", () => {
  const log = (status: Submission["status"], at: number) => ({ status, at, by: "sistem" as const });
  const all = [
    work({ id: "a", status: "terkirim", statusLog: [log("terkirim", 300)] }),
    work({ id: "b", status: "revisi-terkirim", statusLog: [log("revisi-terkirim", 100)] }),
    work({ id: "c", status: "peninjauan", statusLog: [log("peninjauan", 200)] }),
    work({ id: "d", status: "diterima", statusLog: [log("diterima", 50)] }),
    work({ id: "e", status: "ditolak", statusLog: [log("ditolak", 80)] }),
    work({ id: "f", status: "ditarik", statusLog: [log("ditarik", 10)] }),
    work({ id: "g", slug: OTHER, status: "terkirim" }),
    work({ id: "h", slug: LOMBA, status: "terkirim" }),
    work({ id: "i", status: "draf" }),
  ];
  const rows = queueRows(all, ["editor"]);

  it("lists only reviewable work and never a draft", () => {
    expect(rows.map((r) => r.id).sort()).toEqual(["a", "b", "c", "d", "e", "f"]);
  });

  it("counts each filter, with Semua holding every row including withdrawn work", () => {
    expect(countByFilter(rows)).toEqual({
      "perlu-tindakan": 2,
      ditinjau: 1,
      "menunggu-revisi": 0,
      selesai: 2,
      semua: 6,
    });
  });

  it("puts the longest waiting first, and the newest decision first when finished", () => {
    expect(applyFilter(rows, "perlu-tindakan").map((r) => r.id)).toEqual(["b", "a"]);
    expect(applyFilter(rows, "selesai").map((r) => r.id)).toEqual(["e", "d"]);
  });

  it("shows an Administrator the work of every Antologi and Solo project", () => {
    expect(queueRows(all, ["administrator"]).map((r) => r.id)).toContain("g");
  });

  it("reads the filter from the address, with a safe default", () => {
    expect(parseQueueFilter("selesai")).toBe("selesai");
    expect(parseQueueFilter("aneh")).toBe("perlu-tindakan");
    expect(parseQueueFilter(null)).toBe("perlu-tindakan");
    expect(queueQuery("perlu-tindakan")).toBe("");
    expect(queueQuery("semua")).toBe("?status=semua");
  });
});

describe("review steps", () => {
  const labels = (s: Submission) => stepsFor(s).map((x) => x.label);

  it("follows the transition table, nothing else", () => {
    expect(labels(work({ status: "terkirim" }))).toEqual(["Mulai tinjau"]);
    expect(labels(work({ status: "revisi-terkirim" }))).toEqual(["Mulai tinjau"]);
    expect(labels(work({ status: "peninjauan" }))).toEqual(["Minta revisi", "Terima", "Tolak"]);
    for (const status of ["perlu-revisi", "diterima", "ditolak", "ditarik"] as const) {
      expect(labels(work({ status }))).toEqual([]);
    }
  });

  it("asks for a reason on every decision but starting the review", () => {
    expect(stepsFor(work({ status: "terkirim" }))[0].needsReason).toBe(false);
    expect(stepsFor(work({ status: "peninjauan" })).every((s) => s.needsReason)).toBe(true);
  });

  it("blocks another round of revision after the limit, with the reason shown", () => {
    const rounds = ["revisi-terkirim", "revisi-terkirim"] as const;
    const spent = work({
      status: "peninjauan",
      statusLog: rounds.map((status, i) => ({ status, at: i, by: "peserta" as const })),
    });
    const revise = stepsFor(spent).find((s) => s.decision === "perlu-revisi");
    expect(revise?.blocked).toMatch(/Batas putaran/);
    expect(stepsFor(spent).find((s) => s.decision === "diterima")?.blocked).toBeUndefined();
  });

  it("rejects an empty or too long reason", () => {
    expect(validateReason("   ")).toBe("kosong");
    expect(validateReason("x".repeat(1001))).toBe("terlalu-panjang");
    expect(validateReason("Sudah baik.")).toBeNull();
  });
});

describe("resolveReview", () => {
  const list = [
    work({ id: "a" }),
    work({ id: "b", slug: OTHER }),
    work({ id: "c", status: "draf" }),
  ];

  it("opens assigned work, and says why it cannot open the rest", () => {
    expect(resolveReview(list, "a", ["editor"]).status).toBe("ready");
    expect(resolveReview(list, "b", ["editor"])).toEqual({
      status: "blocked",
      reason: "tidak-ditugaskan",
    });
    expect(resolveReview(list, "nope", ["editor"]).status).toBe("gone");
    expect(resolveReview(list, "c", ["editor"]).status).toBe("gone");
  });
});
