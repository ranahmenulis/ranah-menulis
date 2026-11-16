"use client";

import { useMemo } from "react";
import type { SubmissionStore } from "../storage/submission-store";
import { useSubmissions } from "../use-submissions";

const NONE: ReadonlySet<string> = new Set();

/**
 * Ids of Studio documents that were sent to a project (PRD 17.2, "sudah dikirim ke proyek"). A
 * withdrawn work no longer counts. The tag is a hint, so a failed read just shows none.
 */
export function useSubmittedDocumentIds(store?: SubmissionStore): ReadonlySet<string> {
  const { status, submissions } = useSubmissions(store);
  return useMemo(() => {
    if (status !== "ready") return NONE;
    return new Set(submissions.filter((s) => s.status !== "ditarik").map((s) => s.docId));
  }, [status, submissions]);
}
