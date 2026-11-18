"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuditLog } from "@/features/kelola/audit/audit-log";
import { useJudgingLog, useJuryScores } from "@/features/kelola/juri/score-store";
import { useStaffAssignments } from "@/features/kelola/staff-assignments";
import type { MentorTask } from "@/features/projects/kelas/mentor-tasks";
import type { AssignmentSubmission, ClassFixture } from "@/features/projects/kelas/types";
import type { ContestOverrides } from "@/features/projects/lomba/types";
import type { Submission } from "@/features/projects/submission-types";
import type { ProjectsData } from "@/features/projects/use-projects";
import type { ManagerRole } from "@/lib/roles";
import {
  editorNotifications,
  isStaffRecipient,
  juryNotifications,
  mentorNotifications,
} from "./staff-notifications";
import type { ProjectFixture } from "@/features/projects/types";

const NO_SUBMISSIONS: readonly Submission[] = [];
const NO_HAND_INS: readonly AssignmentSubmission[] = [];
const MAX_TIMEOUT = 2_147_483_647;

function nextClosingTime(projects: ProjectsData, slugs: ReadonlySet<string>, now: number) {
  if (projects.status !== "ready") return Infinity;
  return projects.projects.reduce(
    (next, project) =>
      slugs.has(project.slug) && project.closesAt !== null && project.closesAt >= now
        ? Math.min(next, project.closesAt + 1)
        : next,
    Infinity,
  );
}

/** Keep resolved fixture dates fixed and wake up when an assigned contest starts judging. */
function useJudgingClock(projects: ProjectsData, slugs: ReadonlySet<string>) {
  const [time, setTime] = useState(0);
  const now = Math.max(time, projects.status === "ready" ? projects.now : 0);
  const next = nextClosingTime(projects, slugs, now);
  useEffect(() => {
    if (!Number.isFinite(next)) return;
    const tick = () => setTime(Date.now());
    const delay = Math.min(MAX_TIMEOUT, Math.max(0, next - Date.now()));
    const timer = window.setTimeout(tick, delay);
    window.addEventListener("focus", tick);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", tick);
    };
  }, [next, now]);
  return now;
}

export function useStaffNotifications({
  roles,
  catalog,
  projects,
  submissions = NO_SUBMISSIONS,
  handIns = NO_HAND_INS,
  classes,
  tasks,
  overrides,
}: {
  roles: readonly ManagerRole[];
  catalog: readonly ProjectFixture[];
  projects: ProjectsData;
  submissions?: readonly Submission[];
  handIns?: readonly AssignmentSubmission[];
  classes: readonly ClassFixture[];
  tasks: readonly MentorTask[];
  overrides: ContestOverrides;
}) {
  const assigned = useStaffAssignments();
  const audit = useAuditLog();
  const scores = useJuryScores();
  const log = useJudgingLog();
  const audience = useMemo(() => ({ roles, catalog, assigned }), [roles, catalog, assigned]);
  const jurySlugs = useMemo(
    () =>
      new Set(
        catalog
          .filter((project) => isStaffRecipient("juri", project.slug, audience))
          .map((project) => project.slug),
      ),
    [audience, catalog],
  );
  const now = useJudgingClock(projects, jurySlugs);

  return useMemo(
    () => [
      ...editorNotifications(submissions, { ...audience, audit }),
      ...mentorNotifications(handIns, { ...audience, classes, tasks }),
      ...(projects.status === "ready"
        ? juryNotifications(submissions, {
            ...audience,
            audit,
            projects: projects.projects,
            scores,
            log,
            overrides,
            now,
          })
        : []),
    ],
    [audience, audit, classes, handIns, log, now, overrides, projects, scores, submissions, tasks],
  );
}
