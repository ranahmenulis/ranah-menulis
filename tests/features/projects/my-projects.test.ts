import { describe, expect, it } from "vitest";
import { myProjects, revisionItems } from "@/features/projects/my-projects";
import type { Submission } from "@/features/projects/submission-types";
import type { RegistrationMap } from "@/features/projects/types";
import { NOW, project, registration, submission } from "./helpers";

const DAY = 86_400_000;
const CERPEN = "lomba-cerpen-hujan-2026";
const ESAI = "lomba-esai-literasi-remaja";
const KELAS = "kelas-cerpen-untuk-pemula";
const projects = [project(CERPEN), project(ESAI), project(KELAS)];

const joined = (...slugs: string[]): RegistrationMap =>
  Object.fromEntries(slugs.map((slug) => [slug, registration(slug)]));

function needsRevision(over: Partial<Submission> = {}) {
  return submission({
    status: "perlu-revisi",
    statusLog: [
      { status: "terkirim", at: NOW - 5 * DAY, by: "sistem" },
      { status: "perlu-revisi", at: NOW - DAY, by: "editor", dueAt: NOW + 6 * DAY },
    ],
    ...over,
  });
}

describe("myProjects", () => {
  it("lists only the projects joined, each with its works newest first", () => {
    const older = submission({ id: "a", slug: CERPEN, submittedAt: NOW - 2 * DAY });
    const newer = submission({ id: "b", slug: CERPEN, submittedAt: NOW - DAY });
    const rows = myProjects(projects, joined(CERPEN), [older, newer]);
    expect(rows.map((r) => r.project.slug)).toEqual([CERPEN]);
    expect(rows[0].works.map((w) => w.id)).toEqual(["b", "a"]);
  });

  it("keeps a registration with no work, so a class or a project not sent to yet shows up", () => {
    const rows = myProjects(projects, joined(KELAS, ESAI), []);
    expect(rows.map((r) => r.works.length)).toEqual([0, 0]);
  });

  it("keeps a withdrawn work in the history, but does not count it as needing action", () => {
    const withdrawn = submission({ id: "w", slug: CERPEN, status: "ditarik" });
    const [row] = myProjects(projects, joined(CERPEN), [withdrawn]);
    expect(row.works).toHaveLength(1);
    expect(row.needsRevision).toEqual([]);
  });

  it("puts what needs a revision first, then the most recent activity", () => {
    const quiet = submission({ id: "q", slug: ESAI, submittedAt: NOW });
    const asked = needsRevision({ id: "r", slug: CERPEN, submittedAt: NOW - 5 * DAY });
    const rows = myProjects(projects, { ...joined(CERPEN, ESAI, KELAS) }, [quiet, asked]);
    expect(rows.map((r) => r.project.slug)).toEqual([CERPEN, ESAI, KELAS]);
  });

  it("counts a change of status as activity", () => {
    const early = registration(CERPEN, { registeredAt: NOW - 9 * DAY });
    const late = registration(ESAI, { registeredAt: NOW - 8 * DAY });
    const decided = submission({
      id: "d",
      slug: CERPEN,
      status: "diterima",
      statusLog: [
        { status: "terkirim", at: NOW - 7 * DAY, by: "sistem" },
        { status: "diterima", at: NOW - DAY, by: "editor" },
      ],
    });
    const rows = myProjects(projects, { [CERPEN]: early, [ESAI]: late }, [decided]);
    expect(rows.map((r) => r.project.slug)).toEqual([CERPEN, ESAI]);
  });

  it("leaves out a project that is a draft or no longer exists", () => {
    const draft = { ...project(ESAI), publication: "draf" as const };
    const rows = myProjects([draft, projects[0]], joined(ESAI, CERPEN, "tidak-ada"), []);
    expect(rows.map((r) => r.project.slug)).toEqual([CERPEN]);
  });
});

describe("revisionItems", () => {
  it("lists the works to revise, the earliest deadline first", () => {
    const soon = needsRevision({ id: "soon", slug: CERPEN });
    const later = needsRevision({
      id: "later",
      slug: ESAI,
      statusLog: [{ status: "perlu-revisi", at: NOW, by: "editor", dueAt: NOW + 20 * DAY }],
    });
    const rows = myProjects(projects, joined(CERPEN, ESAI), [later, soon]);
    expect(revisionItems(rows).map((i) => i.work.id)).toEqual(["soon", "later"]);
  });

  it("is empty when nothing waits for a revision", () => {
    const rows = myProjects(projects, joined(CERPEN), [submission({ slug: CERPEN })]);
    expect(revisionItems(rows)).toEqual([]);
  });
});
