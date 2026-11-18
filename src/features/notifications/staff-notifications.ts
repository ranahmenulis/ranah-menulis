import type { AuditEntry } from "@/features/kelola/audit/audit-log";
import { reviewHref } from "@/features/kelola/editor/area-hrefs";
import { reviewAccess } from "@/features/kelola/editor/assignments";
import { isSelf } from "@/features/kelola/identity";
import { workHref } from "@/features/kelola/juri/area-hrefs";
import { judgeAccess } from "@/features/kelola/juri/judge-access";
import { judgeableWorks, judgingStatus } from "@/features/kelola/juri/judge-model";
import type { JudgingEntry, JuryScore } from "@/features/kelola/juri/score-store";
import { handInHref } from "@/features/kelola/mentor/area-hrefs";
import { classAccess } from "@/features/kelola/mentor/mentor-access";
import type { StaffAssignment, StaffRole } from "@/features/kelola/staff-assignments";
import type { MentorTask } from "@/features/projects/kelas/mentor-tasks";
import type { AssignmentSubmission, ClassFixture } from "@/features/projects/kelas/types";
import { contestStage } from "@/features/projects/lomba/contest-model";
import type { ContestOverrides } from "@/features/projects/lomba/types";
import type { Submission } from "@/features/projects/submission-types";
import type { Project, ProjectFixture } from "@/features/projects/types";
import type { ManagerRole } from "@/lib/roles";
import type { Notification } from "./types";

export type StaffAudience = {
  roles: readonly ManagerRole[];
  catalog: readonly ProjectFixture[];
  assigned: readonly StaffAssignment[];
};

type StaffSources = StaffAudience & { audit: readonly AuditEntry[] };

const areaAccess = { editor: reviewAccess, mentor: classAccess, juri: judgeAccess };

/** Admin access to an area does not subscribe the account to work assigned to other people. */
export function isStaffRecipient(role: StaffRole, slug: string, audience: StaffAudience) {
  const { roles, catalog, assigned } = audience;
  return (
    roles.includes(role) &&
    catalog.some((p) => p.slug === slug && p.publication === "terbit") &&
    areaAccess[role]([role], slug, catalog, assigned) === "ok"
  );
}

function assignmentStart(audit: readonly AuditEntry[], role: StaffRole, slug: string) {
  return audit.findLast(
    (entry) =>
      entry.action === "staff.assign" &&
      entry.role === role &&
      entry.slug === slug &&
      entry.targetId !== undefined &&
      isSelf(entry.targetId),
  );
}

function staffNotice(
  kind: StaffRole,
  slug: string,
  id: string,
  href: string,
  text: string,
  at: number,
): Notification {
  return {
    id,
    kind: "project",
    actorId: null,
    others: 0,
    text,
    href,
    agoMs: 0,
    at,
    target: { kind, slug },
  };
}

function editorNotice(work: Submission, projectTitle: string, assigned: AuditEntry | undefined) {
  const revision =
    work.status === "revisi-terkirim"
      ? work.statusLog.findLast((change) => change.status === "revisi-terkirim")
      : undefined;
  const assignedAt = assigned?.at ?? 0;
  const sentDuringAssignment = revision && revision.at >= assignedAt;
  const id = sentDuringAssignment
    ? `staff-revision:${work.id}:${revision.at}:${work.versions.at(-1)?.version ?? 0}`
    : `staff-editor:${work.id}:${assigned?.id ?? "initial"}`;
  const text = sentDuringAssignment
    ? `Revisi “${work.title}” untuk ${projectTitle} sudah dikirim.`
    : `Kiriman “${work.title}” di ${projectTitle} ditugaskan kepadamu.`;
  return staffNotice(
    "editor",
    work.slug,
    id,
    reviewHref(work.id),
    text,
    Math.max(assignedAt, revision?.at ?? work.submittedAt),
  );
}

/** [usulan] Staff notifications are the pending work in each assigned queue. */
export function editorNotifications(works: readonly Submission[], sources: StaffSources) {
  return works.flatMap((work) => {
    const { slug, status } = work;
    if (status !== "terkirim" && status !== "revisi-terkirim") return [];
    if (!isStaffRecipient("editor", slug, sources)) return [];
    const project = sources.catalog.find((p) => p.slug === slug);
    if (!project) return [];
    return [editorNotice(work, project.title, assignmentStart(sources.audit, "editor", slug))];
  });
}

type MentorSources = StaffAudience & {
  classes: readonly ClassFixture[];
  tasks: readonly MentorTask[];
};

export function mentorNotifications(
  works: readonly AssignmentSubmission[],
  sources: MentorSources,
) {
  return works.flatMap((work) => {
    const { slug, assignmentId } = work;
    if (work.status !== "dikumpulkan" || !isStaffRecipient("mentor", slug, sources)) return [];
    const project = sources.catalog.find((p) => p.slug === slug);
    const title =
      sources.classes
        .find((c) => c.slug === slug)
        ?.modules.find((m) => m.assignment.id === assignmentId)?.assignment.title ??
      sources.tasks.find((task) => task.slug === slug && task.id === assignmentId)?.title;
    if (!project || !title) return [];

    const at =
      work.statusLog.findLast((change) => change.status === "dikumpulkan")?.at ?? work.submittedAt;
    const id = `staff-mentor:${work.id}:${at}:${work.versions.at(-1)?.version ?? 0}`;
    return [
      staffNotice(
        "mentor",
        slug,
        id,
        handInHref(slug, work.id),
        `Tugas “${title}” di ${project.title} sudah dikumpulkan.`,
        at,
      ),
    ];
  });
}

export type JurySources = StaffSources & {
  projects: readonly Project[];
  overrides: ContestOverrides;
  log: readonly JudgingEntry[];
  scores: readonly JuryScore[];
  now: number;
};

export function juryNotifications(works: readonly Submission[], sources: JurySources) {
  return sources.projects.flatMap((project) => {
    const { slug, closesAt, block, title } = project;
    if (block.kind !== "lomba" || !isStaffRecipient("juri", slug, sources)) return [];
    const stage = contestStage(project, sources.now, sources.overrides[slug]?.stage);
    if (judgingStatus(stage, sources.log, slug) !== "dibuka") return [];

    const assigned = assignmentStart(sources.audit, "juri", slug);
    const opening = closesAt !== null && closesAt < sources.now ? closesAt + 1 : 0;
    const scored = new Set(
      sources.scores
        .filter((score) => score.slug === slug && isSelf(score.judgeId))
        .map((score) => score.submissionId),
    );
    return judgeableWorks(works, slug).flatMap((work, index) => {
      if (scored.has(work.id)) return [];
      const label = block.anonymous ? `Karya ${index + 1}` : `“${work.title}”`;
      return [
        staffNotice(
          "juri",
          slug,
          `staff-jury:${work.id}:${assigned?.id ?? "initial"}`,
          workHref(slug, work.id),
          `${label} di ${title} siap dinilai.`,
          Math.max(assigned?.at ?? 0, opening, work.submittedAt),
        ),
      ];
    });
  });
}
