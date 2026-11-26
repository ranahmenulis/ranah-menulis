"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "@/lib/i18n/provider";
import { fill } from "@/features/studio/copy/fill";
import { contestStage } from "@/features/projects/lomba/contest-model";
import { useContestOverrides } from "@/features/projects/lomba/stage-store";
import { onSubmissionsChanged } from "@/features/projects/storage/submission-events";
import { submissionStore } from "@/features/projects/storage/store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import type { Submission } from "@/features/projects/submission-types";
import type { ContestStage } from "@/features/projects/lomba/types";
import type { Project } from "@/features/projects/types";
import { useProjects } from "@/features/projects/use-projects";
import type { SubmissionsData } from "@/features/projects/use-submissions";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { useStaffAssignments } from "../staff-assignments";
import { juriCopy } from "./copy/juri-copy";
import { judgeAccess, type JudgeAccess } from "./judge-access";
import {
  judgeRows,
  judgeableWorks,
  judgingStatus,
  type Criterion,
  type JudgeRow,
  type JudgingStatus,
} from "./judge-model";
import { isSelf } from "../identity";
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

/** Reads judgeable contest submissions via `listForJudge` when available (anonymous RPC on Supabase). */
function useJudgeSubmissions(
  slugs: readonly string[],
  store: SubmissionStore = submissionStore,
): SubmissionsData {
  const slugKey = slugs.join("\0");
  const [state, setState] = useState<Pick<SubmissionsData, "status" | "submissions">>({
    status: "loading",
    submissions: [],
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let latestRead = 0;
    const load = () => {
      const read = ++latestRead;
      const listPromise = store.listForJudge
        ? slugKey === ""
          ? Promise.resolve([])
          : Promise.all(slugKey.split("\0").map((s) => store.listForJudge!(s))).then((g) =>
              g.flat(),
            )
        : store.list();
      listPromise.then(
        (list) => {
          if (cancelled || read !== latestRead) return;
          setState({
            status: "ready",
            submissions: [...list].sort((a, b) => b.submittedAt - a.submittedAt),
          });
        },
        () => {
          if (!cancelled && read === latestRead) setState((prev) => ({ ...prev, status: "error" }));
        },
      );
    };
    load();
    const stop = onSubmissionsChanged(load);
    return () => {
      cancelled = true;
      stop();
    };
  }, [store, slugKey, attempt]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, status: "loading" }));
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, reload };
}

/** Everything the three Judge screens read, once. */
function useJudging(sources: Sources, slugs: readonly string[]) {
  const catalog = useProjects();
  const submissions = useJudgeSubmissions(slugs, sources.store);
  const roles = useEffectiveRoles();
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
  const catalog = useProjects();
  const roles = useEffectiveRoles();
  const assigned = useStaffAssignments();
  const contestSlugs = useMemo(
    () =>
      catalog.status === "ready"
        ? catalog.projects
            .filter((p) => judgeAccess(roles, p.slug, catalog.projects, assigned) === "ok")
            .map((p) => p.slug)
        : [],
    [catalog, roles, assigned],
  );
  const submissions = useJudgeSubmissions(contestSlugs, sources.store);
  const scores = useJuryScores();
  const log = useJudgingLog();
  const overrides = useContestOverrides();
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
            scores.some((s) => s.submissionId === w.id && isSelf(s.judgeId)),
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
  const { catalog, submissions, roles, assigned, scores, log, overrides } = useJudging(sources, [
    slug,
  ]);
  const locale = useLocale();
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
      rows: judgeRows(judgeableWorks(submissions.submissions, slug), scores, JUDGE_ID, locale),
    };
  }, [catalog, submissions, roles, assigned, scores, log, overrides, slug, locale]);
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
  const submissions = useJudgeSubmissions([slug], sources.store);
  const locale = useLocale();
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
      label: fill(juriCopy(locale).workLabel, { n: String(index + 1) }),
      mine: rows[index].mine,
    };
  }, [contest, submissions, slug, id, locale]);
}
