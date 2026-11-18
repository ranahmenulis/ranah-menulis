import { describe, expect, it } from "vitest";
import type { AuditEntry } from "@/features/kelola/audit/audit-log";
import { ME_ID } from "@/features/kelola/identity";
import { SEED_ASSIGNMENTS } from "@/features/kelola/staff-assignments";
import {
  editorNotifications,
  juryNotifications,
  mentorNotifications,
  type JurySources,
} from "@/features/notifications/staff-notifications";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import { classesFor } from "@/features/projects/kelas/class-source";
import type { AssignmentSubmission } from "@/features/projects/kelas/types";
import { resolveProjects } from "@/features/projects/project-model";
import { NOW, submission } from "../projects/helpers";

const EDITOR_PROJECT = "antologi-surat-yang-tidak-pernah-terkirim";
const CLASS = "kelas-cerpen-untuk-pemula";
const CONTEST = "lomba-cerpen-hujan-2026";
const audience = { catalog: projectFixtures, assigned: SEED_ASSIGNMENTS, audit: [] };
const work = submission({ slug: EDITOR_PROJECT });

describe("staff notifications", () => {
  it("only shows pending editor work to the assigned editor, even with an admin role", () => {
    const sources = { ...audience, roles: ["editor", "administrator"] as const };
    expect(editorNotifications([work], sources)[0]).toMatchObject({
      href: "/kelola/editor/s1",
      at: NOW,
      actorId: null,
    });
    expect(editorNotifications([work], { ...sources, roles: ["administrator"] })).toEqual([]);
    expect(editorNotifications([work], { ...sources, assigned: [] })).toEqual([]);
    for (const status of ["peninjauan", "ditarik", "diterima", "perlu-revisi"] as const) {
      expect(editorNotifications([{ ...work, status }], sources)).toEqual([]);
    }
    expect(
      editorNotifications([work], {
        ...sources,
        catalog: sources.catalog.map((project) =>
          project.slug === work.slug ? { ...project, publication: "arsip" } : project,
        ),
      }),
    ).toEqual([]);
  });

  it("distinguishes a revision from a new assignment of pending work", () => {
    const revision = submission({
      ...work,
      status: "revisi-terkirim",
      statusLog: [...work.statusLog, { status: "revisi-terkirim", by: "peserta", at: NOW + 20 }],
    });
    const sources = { ...audience, roles: ["editor"] as const };
    const assign: AuditEntry = {
      action: "staff.assign",
      at: NOW + 30,
      actorId: "nur-aisyah",
      id: "assignment-2",
      role: "editor",
      targetId: "editor-kamu",
      slug: EDITOR_PROJECT,
    };
    const [sent] = editorNotifications([revision], sources);
    const [assigned] = editorNotifications([revision], { ...sources, audit: [assign] });
    expect(sent.text).toMatch(/^Revisi/);
    expect(assigned.text).toContain("ditugaskan kepadamu");
    expect(assigned.at).toBe(assign.at);
    expect(assigned.id).not.toBe(sent.id);
    expect(editorNotifications([revision], { ...sources, audit: [assign] })[0].id).toBe(
      assigned.id,
    );
  });

  it("links each pending hand-in to feedback for the right mentor and uses a new id after resubmission", () => {
    const classes = classesFor(projectFixtures);
    const task = classes.find((item) => item.slug === CLASS)!.modules[0].assignment;
    const handIn: AssignmentSubmission = {
      id: "hand-in",
      slug: CLASS,
      assignmentId: task.id,
      source: "teks",
      docId: null,
      docTitle: "Private Studio title",
      status: "dikumpulkan",
      late: false,
      submittedAt: NOW,
      versions: work.versions,
      statusLog: [{ status: "dikumpulkan", by: "peserta", at: NOW }],
    };
    const sources = { ...audience, classes, tasks: [], roles: ["mentor"] as const };
    const [first] = mentorNotifications([handIn], sources);
    expect(first.href).toBe(`/kelola/mentor/${CLASS}/pengumpulan/hand-in`);
    expect(first.text).toContain(task.title);
    expect(first.text).not.toContain(handIn.docTitle);
    expect(mentorNotifications([handIn], { ...sources, assigned: [] })).toEqual([]);
    expect(mentorNotifications([{ ...handIn, status: "selesai" }], sources)).toEqual([]);
    const [retry] = mentorNotifications(
      [
        {
          ...handIn,
          statusLog: [...handIn.statusLog, { status: "dikumpulkan", by: "peserta", at: NOW + 20 }],
        },
      ],
      sources,
    );
    expect(retry.id).not.toBe(first.id);
  });

  it("never reveals the anonymous title and stops at a judge's score, closure, or withdrawal", () => {
    const entry = submission({ slug: CONTEST, title: "Full Name in the Title" });
    const sources: JurySources = {
      ...audience,
      roles: ["juri"],
      projects: resolveProjects(projectFixtures, NOW),
      now: NOW,
      log: [],
      scores: [],
      overrides: {},
    };
    expect(juryNotifications([entry], sources)).toEqual([]);
    const open: JurySources = {
      ...sources,
      overrides: { [CONTEST]: { stage: "dinilai", times: {} } },
    };
    const [item] = juryNotifications([entry], open);
    expect(item).toMatchObject({
      text: "Karya 1 di Lomba Cerpen Hujan 2026 siap dinilai.",
      actorId: null,
      href: `/kelola/juri/${CONTEST}/karya/s1`,
    });
    expect(JSON.stringify(item)).not.toContain(entry.title);
    expect(juryNotifications([entry], { ...open, assigned: [] })).toEqual([]);
    expect(juryNotifications([{ ...entry, status: "ditarik" }], open)).toEqual([]);
    expect(
      juryNotifications([entry], { ...open, log: [{ slug: CONTEST, state: "ditutup", at: NOW }] }),
    ).toEqual([]);
    expect(
      juryNotifications([entry], {
        ...open,
        scores: [
          {
            slug: CONTEST,
            submissionId: entry.id,
            judgeId: ME_ID,
            scores: {},
            note: "",
            at: NOW,
          },
        ],
      }),
    ).toEqual([]);
  });
});
