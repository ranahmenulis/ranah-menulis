"use client";

import { useMemo } from "react";
import { useViewer } from "@/lib/viewer";
import { myProjects, type MyProject } from "../my-projects";
import { useRegistrations } from "../registration-store";
import type { SubmissionStore } from "../storage/submission-store";
import type { Submission } from "../submission-types";
import type { ProjectFixture } from "../types";
import { useProjects } from "../use-projects";
import { useSubmissions } from "../use-submissions";

export type MyProjectsData = {
  status: "loading" | "ready" | "error";
  guest: boolean;
  /** When the page opened, for deadlines. 0 while loading. */
  now: number;
  rows: MyProject[];
  /** Every stored submission, for screens that look one up by id. */
  submissions: Submission[];
  reload: () => void;
};

/**
 * Registrations and submissions of this reader joined to the catalog. A guest has neither: both
 * live on this device and belong to the signed-in reader. Loading, error and ready are separate
 * so a failed read is never shown as "nothing joined yet".
 */
export function useMyProjects(source?: ProjectFixture[], store?: SubmissionStore): MyProjectsData {
  const catalog = useProjects(source);
  const guest = useViewer() === "tamu";
  const registrations = useRegistrations();
  const submissions = useSubmissions(store);

  const rows = useMemo(
    () =>
      catalog.status === "ready" && submissions.status === "ready" && !guest
        ? myProjects(catalog.projects, registrations, submissions.submissions)
        : [],
    [catalog, submissions.status, submissions.submissions, registrations, guest],
  );

  const status =
    submissions.status === "error"
      ? "error"
      : catalog.status === "loading" || submissions.status === "loading"
        ? "loading"
        : "ready";

  return {
    status,
    guest,
    now: catalog.status === "ready" ? catalog.now : 0,
    rows,
    submissions: submissions.submissions,
    reload: submissions.reload,
  };
}
