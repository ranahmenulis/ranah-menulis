import { describe, expect, it } from "vitest";
import {
  assignmentRows,
  classProgress,
  dashboardBlock,
  handInBlock,
  nextSession,
  resolveClass,
  sessionOver,
} from "@/features/projects/kelas/class-model";
import { classFixtures } from "@/features/projects/kelas/fixtures/all";
import { NOW, project, registration } from "../helpers";
import { CERPEN, classOf, DAY, handedIn, PUISI } from "./helpers";

describe("class fixtures", () => {
  it("cover exactly the Kelas projects, with the curriculum of the project page", () => {
    for (const fixture of classFixtures) {
      const p = project(fixture.slug);
      expect(p.block.kind).toBe("kelas");
      if (p.block.kind !== "kelas") continue;
      expect(fixture.modules.map((m) => m.title)).toEqual(p.block.modules.map((m) => m.title));
      expect(fixture.sessions).toHaveLength(p.block.modules.reduce((n, m) => n + m.meetings, 0));
    }
  });

  it("use unique material and assignment ids inside each class", () => {
    for (const fixture of classFixtures) {
      const materials = fixture.modules.flatMap((m) => m.materials.map((x) => x.id));
      const assignments = fixture.modules.map((m) => m.assignment.id);
      expect(new Set(materials).size).toBe(materials.length);
      expect(new Set(assignments).size).toBe(assignments.length);
    }
  });
});

describe("resolveClass", () => {
  it("starts at the first moment of the start day in the project's zone", () => {
    const content = classOf(CERPEN);
    // Cerpen started two days before 16 Nov 12.00 WIB, so on 14 Nov, which began at 13 Nov 17.00 UTC.
    expect(content.startsAt).toBe(Date.UTC(2026, 10, 13, 17));
  });

  it("puts a meeting at its clock time and keeps them in order", () => {
    const [first, second] = classOf(CERPEN).sessions;
    expect(first.at).toBe(Date.UTC(2026, 10, 14, 12)); // 19.00 WIB
    expect(second.at - first.at).toBe(7 * DAY);
  });

  it("ends an assignment's day at its deadline", () => {
    const { assignment } = classOf(CERPEN).modules[0];
    // Day 1 is 15 Nov in WIB: its last millisecond is 15 Nov 16.59.59.999 UTC.
    expect(assignment.dueAt).toBe(Date.UTC(2026, 10, 15, 16, 59, 59, 999));
  });

  it("gives no class to a project without a start date", () => {
    const p = { ...project(CERPEN), milestones: [] };
    expect(resolveClass(classFixtures[0], p)).toBeNull();
  });
});

describe("nextSession", () => {
  const content = classOf(CERPEN);

  it("is the first meeting that has not ended", () => {
    expect(nextSession(content, NOW)?.id).toBe("p2");
  });

  it("still names a meeting while it is going on", () => {
    const first = content.sessions[0];
    expect(nextSession(content, first.at + 30 * 60 * 1000)?.id).toBe("p1");
  });

  it("is null after the last meeting", () => {
    expect(nextSession(content, NOW + 60 * DAY)).toBeNull();
  });
});

describe("sessionOver", () => {
  const [first] = classOf(CERPEN).sessions;

  it("is over only once the meeting time has run out", () => {
    expect(sessionOver(first, first.at - 1)).toBe(false);
    expect(sessionOver(first, first.at + first.minutes * 60_000 - 1)).toBe(false);
    expect(sessionOver(first, first.at + first.minutes * 60_000)).toBe(true);
  });
});

describe("dashboardBlock", () => {
  const kelas = project(CERPEN);

  it("opens only for a registered reader of a class", () => {
    expect(
      dashboardBlock({ project: kelas, guest: false, registration: registration(CERPEN) }),
    ).toBe(null);
  });

  it.each([
    ["guest", { guest: true, registration: registration(CERPEN) }, "tamu"],
    ["unregistered", { guest: false }, "belum-terdaftar"],
    [
      "waiting for payment",
      { guest: false, registration: registration(CERPEN, { status: "menunggu-pembayaran" }) },
      "menunggu-pembayaran",
    ],
  ] as const)("is closed to %s", (_, extra, block) => {
    expect(dashboardBlock({ project: kelas, ...extra })).toBe(block);
  });

  it("is not a class dashboard for another category", () => {
    const solo = project("solo-penerbitan-buku-sendiri");
    expect(
      dashboardBlock({ project: solo, guest: false, registration: registration(solo.slug) }),
    ).toBe("bukan-kelas");
  });
});

describe("assignmentRows", () => {
  it("is locked everywhere before the class starts", () => {
    const rows = assignmentRows(classOf(PUISI), [], NOW);
    expect(rows.map((r) => r.state)).toEqual(Array(4).fill("terkunci"));
  });

  it("tells open, past deadline and handed in apart once it runs", () => {
    const content = classOf(CERPEN);
    const rows = assignmentRows(
      content,
      [handedIn({ assignmentId: "tugas-2", status: "selesai" })],
      NOW,
    );
    expect(rows.map((r) => r.state)).toEqual([
      "terlambat",
      "selesai",
      "belum-dikumpulkan",
      "belum-dikumpulkan",
    ]);
  });

  it("ignores a hand-in of another class", () => {
    const rows = assignmentRows(classOf(CERPEN), [handedIn({ slug: PUISI })], NOW);
    expect(rows[0].submission).toBeNull();
  });
});

describe("classProgress", () => {
  const content = classOf(CERPEN);
  // Cerpen has 6 materials and 4 assignments.

  it("is zero with nothing done", () => {
    expect(classProgress(content, new Set(), [])).toEqual({ done: 0, total: 10, percent: 0 });
  });

  it("counts marked materials and assignments the mentor finished", () => {
    const done = classProgress(content, new Set(["cerpen-1a", "cerpen-1b"]), [
      handedIn({ status: "selesai" }),
      handedIn({ id: "a2", assignmentId: "tugas-2" }),
    ]);
    expect(done).toEqual({ done: 3, total: 10, percent: 30 });
  });

  it("does not count marks for materials that are gone, or reaches 100", () => {
    const all = new Set(content.modules.flatMap((m) => m.materials.map((x) => x.id)));
    const finished = content.modules.map((m, i) =>
      handedIn({ id: `a${i}`, assignmentId: m.assignment.id, status: "selesai" }),
    );
    expect(classProgress(content, new Set([...all, "old"]), finished).percent).toBe(100);
  });

  it("is zero, not NaN, for a class with no content", () => {
    expect(classProgress({ ...content, modules: [] }, new Set(), [])).toEqual({
      done: 0,
      total: 0,
      percent: 0,
    });
  });
});

describe("handInBlock", () => {
  it("allows a hand-in after the deadline, since late work is accepted", () => {
    expect(handInBlock(classOf(CERPEN), "tugas-1", NOW)).toBeNull();
  });

  it("is closed before the class starts, and for an unknown assignment", () => {
    expect(handInBlock(classOf(PUISI), "tugas-1", NOW)).toBe("belum-dimulai");
    expect(handInBlock(classOf(CERPEN), "nope", NOW)).toBe("tidak-ada");
  });
});
