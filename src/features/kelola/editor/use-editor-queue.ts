"use client";

import { useMemo } from "react";
import { submissionStore } from "@/features/projects/storage/store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { useCatalog } from "@/features/projects/use-catalog";
import { useSubmissions } from "@/features/projects/use-submissions";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { useStaffAssignments } from "../staff-assignments";
import { countByFilter, queueRows } from "./queue-model";

/** The Editor's queue rows and counts per filter, shared by the queue and the /kelola overview. */
export function useEditorQueue(store: SubmissionStore = submissionStore) {
  const submissions = useSubmissions(store);
  const roles = useEffectiveRoles();
  const catalog = useCatalog();
  const assigned = useStaffAssignments();
  const all = useMemo(
    () => queueRows(submissions.submissions, roles, catalog, assigned),
    [submissions.submissions, roles, catalog, assigned],
  );
  const counts = useMemo(() => countByFilter(all), [all]);
  return { submissions, all, counts };
}
