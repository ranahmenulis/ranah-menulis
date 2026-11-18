"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { editorPicks } from "@/features/community/curation/picks-store";
import { writingGroups } from "@/features/community/groups/group-store";
import { useGroupReader } from "@/features/community/groups/group-viewer";
import { useModeration, useReports } from "@/features/community/moderation/report-store";
import type { PostStore } from "@/features/community/storage/post-store";
import type { ManagerRole } from "@/lib/roles";
import {
  activeHides,
  hiddenNotifications,
  pickNotification,
  readNotificationPost,
  reportNotifications,
  visibleFixtureNotifications,
} from "./community-notifications";
import type { Notification } from "./types";

/** Read actual Community objects only when a curation or hide event needs them. */
export function useCommunityNotifications(store: PostStore, roles: readonly ManagerRole[]) {
  const reader = useGroupReader();
  const groups = writingGroups.use();
  const entries = useModeration();
  const reports = useReports();
  const allPicks = editorPicks.use();
  const [attempt, setAttempt] = useState(0);
  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const request = useMemo(() => {
    const picks = allPicks.filter((pick) => pick.at > 0);
    const hasHides = activeHides(entries).length > 0;
    return reader && (picks.length > 0 || hasHides)
      ? { store, entries, picks, hasHides, attempt }
      : null;
  }, [store, entries, allPicks, reader, attempt]);
  const [result, setResult] = useState<{
    request: NonNullable<typeof request>;
    items: Notification[];
    failed: boolean;
  } | null>(null);

  useEffect(() => {
    if (!request) return;
    let disposed = false;
    const jobs = request.picks.map(async (pick) =>
      pickNotification(
        pick,
        await readNotificationPost(request.store, pick.postId),
        request.entries,
      ),
    );
    if (request.hasHides) jobs.push(hiddenNotifications(request.store, request.entries));
    void Promise.allSettled(jobs).then((settled) => {
      if (disposed) return;
      setResult({
        request,
        items: settled.flatMap((item) => (item.status === "fulfilled" ? item.value : [])),
        failed: settled.some((item) => item.status === "rejected"),
      });
    });
    return () => {
      disposed = true;
    };
  }, [request]);

  useEffect(() => {
    if (!request) return;
    window.addEventListener("focus", reload);
    return () => window.removeEventListener("focus", reload);
  }, [request, reload]);

  const current = result?.request === request ? result : null;
  const items = useMemo(
    () => [
      ...visibleFixtureNotifications(groups, reader, entries),
      ...reportNotifications(reports, entries, roles),
      ...(current?.items ?? []),
    ],
    [current, entries, groups, reader, reports, roles],
  );
  const status = request && !current ? "loading" : current?.failed ? "error" : "ready";
  return { items, status, reload } as const;
}
