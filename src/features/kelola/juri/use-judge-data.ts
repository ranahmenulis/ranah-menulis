"use client";

import { useMemo } from "react";
import { contestStage } from "@/features/projects/lomba/contest-model";
import { useContestOverrides } from "@/features/projects/lomba/stage-store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import type { Submission } from "@/features/projects/submission-types";
import type { ContestStage } from "@/features/projects/lomba/types";
import type { Project } from "@/features/projects/types";
import { useProjects } from "@/features/projects/use-projects";
import { useSubmissions } from "@/features/projects/use-submissions";
import { useRoles } from "@/lib/viewer";
import { useStaffAssignments } from "../staff-assignments";
import { judgeAccess, type JudgeAccess } from "./judge-access";
import {
  judgeRows,
  judgeableWorks,
  judgingStatus,
  type Criterion,
  type JudgeRow,
  type JudgingStatus,
} from "./judge-model";
import { JUDGE_ID, useJudgingLog, useJuryScores, type JuryScore } from "./score-store";

type Sources = { store?: SubmissionStore };

type Failure = { status: "error"; reload: () => void } | { status: "loading" };

export type ContestSummary = {
  project: Project;
  total: number;
  scored: number;
  judging: JudgingStatus;
};

export type JudgeContestsData = Failure | { status: "ready"; items: ContestSummary[] };

const criteriaOf = (project: Project): Criterion[] =>
  project.block.kind === "lomba" ? project.block.criteria : [];
const anonymousOf = (project: Project): boolean =>
  project.block.kind === "lomba" && project.block.anonymous;

/** Everything the three Judge screens read, once. */
function useJudging(sources: Sources) {
  const catalog = useProjects();
  const submissions = useSubmissions(sources.store);
  const roles = useRoles();
  const assigned = useStaffAssignments();
  const scores = useJuryScores();
  const log = useJudgingLog();
  const overrides = useContestOverrides();
  return { catalog, submissions, roles, assigned, scores, log, overrides };
}

function stageOf(project: Project, now: number, override: ContestStage | undefined) {
  return contestStage(project, now, override);
}

/** The contests this viewer may judge, with how far along they are. */
export function useJudgeContests(sources: Sources = {}): JudgeContestsData {
  const { catalog, submissions, roles, assigned, scores, log, overrides } = useJudging(sources);
  return useMemo<JudgeContestsData>(() => {
    if (submissions.status === "error") return { status: "error", reload: submissions.reload };
    if (catalog.status === "loading" || submissions.status === "loading") {
      return { status: "loading" };
    }
    const items = catalog.projects.flatMap((project) => {
      if (judgeAccess(roles, project.slug, catalog.projects, assigned) !== "ok") return [];
      const works = judgeableWorks(submissions.submissions, project.slug);
      const stage = stageOf(project, catalog.now, overrides[project.slug]?.stage);
      return [
        {
          project,
          total: works.length,
          scored: works.filter((w) =>
            scores.some((s) => s.submissionId === w.id && s.judgeId === JUDGE_ID),
          ).length,
          judging: judgingStatus(stage, log, project.slug),
        },
      ];
    });
    return { status: "ready", items };
  }, [catalog, submissions, roles, assigned, scores, log, overrides]);
}

type Blocked = { status: "blocked"; project: Project; reason: Exclude<JudgeAccess, "ok"> };

export type JudgeContestData =
  | Failure
  | { status: "gone" }
  | Blocked
  | {
      status: "ready";
      project: Project;
      criteria: Criterion[];
      anonymous: boolean;
      judging: JudgingStatus;
      rows: JudgeRow[];
    };

/** One contest the viewer may judge: its works as rows, without any author. */
export function useJudgeContest(slug: string, sources: Sources = {}): JudgeContestData {
  const { catalog, submissions, roles, assigned, scores, log, overrides } = useJudging(sources);
  return useMemo<JudgeContestData>(() => {
    if (submissions.status === "error") return { status: "error", reload: submissions.reload };
    if (catalog.status === "loading" || submissions.status === "loading") {
      return { status: "loading" };
    }
    const project = catalog.projects.find((p) => p.slug === slug && p.publication === "terbit");
    if (!project || project.category !== "lomba") return { status: "gone" };
    const access = judgeAccess(roles, slug, catalog.projects, assigned);
    if (access !== "ok") return { status: "blocked", project, reason: access };
    const stage = stageOf(project, catalog.now, overrides[slug]?.stage);
    return {
      status: "ready",
      project,
      criteria: criteriaOf(project),
      anonymous: anonymousOf(project),
      judging: judgingStatus(stage, log, slug),
      rows: judgeRows(judgeableWorks(submissions.submissions, slug), scores, JUDGE_ID),
    };
  }, [catalog, submissions, roles, assigned, scores, log, overrides, slug]);
}

export type JudgeWorkData =
  | Failure
  | { status: "gone" }
  | Blocked
  | {
      status: "ready";
      project: Project;
      criteria: Criterion[];
      anonymous: boolean;
      judging: JudgingStatus;
      work: Submission;
      label: string;
      mine: JuryScore | undefined;
    };

/** One work to score. Another contest's id, a draft or a withdrawn work is "gone". */
export function useJudgeWork(slug: string, id: string, sources: Sources = {}): JudgeWorkData {
  const contest = useJudgeContest(slug, sources);
  const { submissions } = useJudging(sources);
  return useMemo<JudgeWorkData>(() => {
    if (contest.status !== "ready") return contest;
    if (submissions.status !== "ready") return { status: "loading" };
    const works = judgeableWorks(submissions.submissions, slug);
    const index = works.findIndex((w) => w.id === id);
    if (index < 0) return { status: "gone" };
    const { rows, ...rest } = contest;
    return {
      ...rest,
      work: works[index],
      label: `Karya ${index + 1}`,
      mine: rows[index].mine,
    };
  }, [contest, submissions, slug, id]);
}
