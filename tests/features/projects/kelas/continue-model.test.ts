import { describe, expect, it } from "vitest";
import { assignmentRows } from "@/features/projects/kelas/class-model";
import {
  continueTarget,
  materialHref,
  runningClasses,
} from "@/features/projects/kelas/continue-model";
import { classFixtures } from "@/features/projects/kelas/fixtures/all";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import { resolveProjects } from "@/features/projects/project-model";
import { classOf, CERPEN, handedIn, PUISI } from "./helpers";
import { NOW, registration } from "../helpers";

const none = new Set<string>();
const MATERIALS = ["cerpen-1a", "cerpen-1b", "cerpen-2a", "cerpen-3a", "cerpen-3b", "cerpen-4a"];

function target(done: string[] = [], submissions = [handedIn({ status: "selesai" })]) {
  const content = classOf(CERPEN);
  return continueTarget(content, new Set(done), assignmentRows(content, submissions, NOW));
}

describe("where Lanjutkan leads", () => {
  it("starts at the first material of the first module", () => {
    expect(target([], [])).toEqual({
      kind: "materi",
      title: "Satu ide, satu pertanyaan",
      href: materialHref(CERPEN, "cerpen-1a"),
    });
  });

  it("moves to the next unmarked material, then to the assignment of that module", () => {
    expect(target(["cerpen-1a"], []).title).toBe("Kerangka tiga babak");
    const afterMaterials = target(["cerpen-1a", "cerpen-1b"], []);
    expect(afterMaterials).toMatchObject({
      kind: "tugas",
      title: "Kerangka cerpenmu",
      href: `/projects/${CERPEN}/tugas/tugas-1`,
    });
  });

  it("skips an assignment that is handed in or finished and goes on to the next module", () => {
    const waiting = handedIn({ status: "dikumpulkan" });
    expect(target(["cerpen-1a", "cerpen-1b"], [waiting]).title).toBe("Apa yang diinginkan tokohmu");
  });

  it("sends a revision request back to its assignment", () => {
    const back = handedIn({ status: "perlu-perbaikan" });
    expect(target(["cerpen-1a", "cerpen-1b"], [back])).toMatchObject({
      kind: "tugas",
      title: "Kerangka cerpenmu",
    });
  });

  it("falls back to the dashboard when only the mentor's decisions are left", () => {
    const all = ["tugas-1", "tugas-2", "tugas-3", "tugas-4"].map((assignmentId, i) =>
      handedIn({ id: `a${i}`, assignmentId, status: "dikumpulkan" }),
    );
    expect(target(MATERIALS, all)).toEqual({
      kind: "dasbor",
      title: "",
      href: `/projects/${CERPEN}/dasbor`,
    });
  });
});

describe("running classes", () => {
  const projects = resolveProjects(projectFixtures, NOW);
  const base = {
    projects,
    classes: classFixtures,
    tasks: [],
    submissions: [],
    marks: {},
    now: NOW,
  };
  const joined = (slug: string, over = {}) => ({ [slug]: registration(slug, over) });

  it("lists a started class you joined, with progress and the next step", () => {
    const rows = runningClasses({ ...base, registrations: joined(CERPEN) });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.project.slug).toBe(CERPEN);
    expect(rows[0]?.progress.percent).toBe(0);
    expect(rows[0]?.next.kind).toBe("materi");
  });

  it("leaves out a class that has not started", () => {
    expect(runningClasses({ ...base, registrations: joined(PUISI) })).toEqual([]);
  });

  it("leaves out a class you have not joined, and one still waiting for payment", () => {
    expect(runningClasses({ ...base, registrations: {} })).toEqual([]);
    const waiting = joined(CERPEN, { status: "menunggu-pembayaran" });
    expect(runningClasses({ ...base, registrations: waiting })).toEqual([]);
  });

  it("leaves out a class that is finished", () => {
    const submissions = ["tugas-1", "tugas-2", "tugas-3", "tugas-4"].map((assignmentId, i) =>
      handedIn({ id: `a${i}`, assignmentId, status: "selesai" }),
    );
    const finished = runningClasses({
      ...base,
      registrations: joined(CERPEN),
      submissions,
      marks: { [CERPEN]: MATERIALS },
    });
    expect(finished).toEqual([]);
  });

  it("ignores marks of materials that no longer exist", () => {
    const rows = runningClasses({
      ...base,
      registrations: joined(CERPEN),
      marks: { [CERPEN]: ["gone-1"], other: [...none] },
    });
    expect(rows[0]?.progress.done).toBe(0);
  });
});
