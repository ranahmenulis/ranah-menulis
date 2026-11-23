"use client";

import { useMemo } from "react";
import { useLocale } from "@/lib/i18n/provider";
import { useCommunity } from "@/features/community/hooks/use-community";
import { useModeration, useReports } from "@/features/community/moderation/report-store";
import { postStore } from "@/features/community/storage/store";
import type { PostStore } from "@/features/community/storage/post-store";
import { buildCases, caseKey, contentOf, type CaseContent, type CaseRow } from "./moderation-model";

export type CaseListState =
  | { status: "loading" }
  | { status: "error"; reload: () => void }
  | {
      status: "ready";
      rows: CaseRow[];
      contentOf: (row: Pick<CaseRow, "kind" | "targetId">) => CaseContent | null;
    };

/** The cases with the content they are about. Hidden and deleted content stays readable here. */
export function useCaseList(store: PostStore = postStore): CaseListState {
  const locale = useLocale();
  const data = useCommunity(store, { includeRemoved: true });
  const reports = useReports();
  const entries = useModeration();
  const rows = useMemo(() => buildCases(reports, entries), [reports, entries]);
  return useMemo((): CaseListState => {
    if (data.status === "loading") return { status: "loading" };
    if (data.status === "error") return { status: "error", reload: data.reload };
    return {
      status: "ready",
      rows,
      contentOf: (row) => contentOf(row.kind, row.targetId, data.posts, data.comments, locale),
    };
  }, [data.status, data.posts, data.comments, data.reload, rows, locale]);
}

export type CaseState =
  | { status: "loading" }
  | { status: "error"; reload: () => void }
  | { status: "gone" }
  | { status: "ready"; row: CaseRow; content: CaseContent | null };

/** One case by its key ("post:<id>" or "comment:<id>"). */
export function useCase(key: string, store: PostStore = postStore): CaseState {
  const list = useCaseList(store);
  return useMemo((): CaseState => {
    if (list.status !== "ready") return list;
    const row = list.rows.find((r) => caseKey(r.kind, r.targetId) === key);
    return row ? { status: "ready", row, content: list.contentOf(row) } : { status: "gone" };
  }, [list, key]);
}
