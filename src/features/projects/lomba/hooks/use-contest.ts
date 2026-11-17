"use client";

import { useMemo } from "react";
import { activeSubmissions } from "../../submission-model";
import type { SubmissionStore } from "../../storage/submission-store";
import type { Submission } from "../../submission-types";
import type { Project, ProjectFixture } from "../../types";
import { useProjects } from "../../use-projects";
import { useSubmissions } from "../../use-submissions";
import { contestStage } from "../contest-model";
import { mergeResults, storedResults } from "../results-store";
import { useContestOverrides } from "../stage-store";
import type { ContestResults, ContestStage } from "../types";

export type ContestData =
  | { status: "loading" }
  /** No such project, a draft, or not a contest: all "not found". */
  | { status: "gone" }
  | {
      status: "ready";
      project: Project;
      /** When the page opened. */
      now: number;
      stage: ContestStage;
      /** `null` when nothing is on record for this contest yet. */
      results: ContestResults | null;
      /** The reader's own work in this contest, when they sent one and it is a finalist. */
      mine: Submission | null;
      /** Whether the reader sent any work here, so the development panel can offer to make it a finalist. */
      hasWork: boolean;
    };

type Sources = { source?: ProjectFixture[]; store?: SubmissionStore; results?: ContestResults[] };

/**
 * Everything the results page needs, read once: the project, the stage (dates, then anything a
 * development panel pushed on), the results on record, and the reader's own work. A failed read of
 * the reader's submissions only leaves their own highlight out: the results are public.
 */
export function useContest(slug: string, sources: Sources = {}): ContestData {
  const { source, store, results: override } = sources;
  const stored = storedResults.use();
  const results = useMemo(() => override ?? mergeResults(stored), [override, stored]);
  const catalog = useProjects(source);
  const overrides = useContestOverrides();
  const submissions = useSubmissions(store);

  return useMemo<ContestData>(() => {
    if (catalog.status === "loading") return { status: "loading" };
    const project = catalog.projects.find((p) => p.slug === slug && p.publication === "terbit");
    if (!project || project.block.kind !== "lomba") return { status: "gone" };
    const override = overrides[slug];
    const work =
      submissions.status === "ready"
        ? (activeSubmissions(submissions.submissions, slug)[0] ?? null)
        : null;
    const mine = override?.mine ? work : null;
    return {
      status: "ready",
      project,
      now: catalog.now,
      stage: contestStage(project, catalog.now, override?.stage),
      results: results.find((r) => r.slug === slug) ?? null,
      mine,
      hasWork: work !== null,
    };
  }, [catalog, overrides, submissions, slug, results]);
}
