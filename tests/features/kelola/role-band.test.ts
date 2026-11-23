import { describe, expect, it } from "vitest";
import {
  BAND_COPY,
  adminWork,
  bandFrom,
  editorWork,
  judgeWork,
  mentorWork,
  organizerWork,
} from "@/features/kelola/role-band";

const counts = (n: number) => ({
  "perlu-tindakan": n,
  ditinjau: 4,
  "menunggu-revisi": 2,
  selesai: 9,
  semua: 20,
});

describe("role bands", () => {
  it("names every area's role and what its number counts", () => {
    expect(Object.keys(BAND_COPY).sort()).toEqual([
      "admin",
      "editor",
      "juri",
      "mentor",
      "organizer",
    ]);
    expect(BAND_COPY.editor.unit).toBe("karya perlu tindakan");
  });

  it("counts the Editor's work that needs action and leads to that filter", () => {
    expect(editorWork(counts(3))).toEqual({
      status: "ready",
      count: 3,
      entry: { label: "Tinjau yang perlu tindakan", href: "/kelola/editor" },
    });
  });

  it("drops the way in when there is no work", () => {
    expect(editorWork(counts(0))).toEqual({ status: "ready", count: 0, entry: null });
    expect(adminWork([{ status: "selesai" }])).toMatchObject({ count: 0, entry: null });
  });

  it("counts only the works a judge can score now, and opens the first such contest", () => {
    const work = judgeWork([
      { project: { slug: "belum" }, total: 5, scored: 0, judging: "belum-dibuka" },
      { project: { slug: "tutup" }, total: 4, scored: 1, judging: "ditutup" },
      { project: { slug: "selesai" }, total: 2, scored: 2, judging: "dibuka" },
      { project: { slug: "lomba-a" }, total: 6, scored: 2, judging: "dibuka" },
      { project: { slug: "lomba-b" }, total: 3, scored: 0, judging: "dibuka" },
    ]);
    expect(work).toEqual({
      status: "ready",
      count: 7,
      entry: { label: "Lanjut menilai", href: "/kelola/juri/lomba-a" },
    });
  });

  it("sums the Mentor's hand-ins and opens the first class that has some", () => {
    expect(
      mentorWork([
        { project: { slug: "kosong" }, toGrade: 0 },
        { project: { slug: "kelas-a" }, toGrade: 2 },
        { project: { slug: "kelas-b" }, toGrade: 1 },
      ]),
    ).toEqual({
      status: "ready",
      count: 3,
      entry: { label: "Nilai pengumpulan", href: "/kelola/mentor/kelas-a" },
    });
  });

  it("keeps the way to events for the Organizer, even with no active project", () => {
    expect(organizerWork(0)).toEqual({
      status: "ready",
      count: 0,
      entry: { label: "Kelola Event", href: "/kelola/organizer/event" },
    });
  });

  it("counts the moderation cases still new", () => {
    expect(
      adminWork([{ status: "baru" }, { status: "selesai" }, { status: "baru" }]),
    ).toMatchObject({ count: 2, entry: { href: "/kelola/admin/moderasi" } });
  });

  it("passes loading and error through and counts only ready data", () => {
    const count = (d: { status: "ready"; n: number }) => organizerWork(d.n);
    type Data =
      | { status: "loading" }
      | { status: "error"; reload: () => void }
      | { status: "ready"; n: number };
    expect(bandFrom<Data>({ status: "loading" }, count)).toEqual({ status: "loading" });
    expect(bandFrom<Data>({ status: "error", reload: () => {} }, count)).toEqual({
      status: "error",
    });
    expect(bandFrom<Data>({ status: "ready", n: 2 }, count)).toMatchObject({ count: 2 });
  });
});
