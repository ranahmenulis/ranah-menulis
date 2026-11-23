"use client";

import { useMemo } from "react";
import { useLocale } from "@/lib/i18n/provider";
import type { PostStore } from "@/features/community/storage/post-store";
import type { AssignmentStore } from "@/features/projects/kelas/storage/assignment-store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { useCaseList } from "./admin/moderation/use-moderation-data";
import { useEditorQueue } from "./editor/use-editor-queue";
import { useJudgeContests } from "./juri/use-judge-data";
import { useMentorClasses } from "./mentor/use-mentor-data";
import { countByList } from "./organizer/list-model";
import { useOrganizerList } from "./organizer/use-organizer-data";
import {
  adminWork,
  bandFrom,
  editorWork,
  judgeWork,
  mentorWork,
  organizerWork,
  type BandWork,
} from "./role-band";

export function useEditorBand(store?: SubmissionStore): BandWork {
  const { submissions, counts } = useEditorQueue(store);
  const locale = useLocale();
  const status = submissions.status;
  return useMemo((): BandWork => {
    if (status === "loading") return { status: "loading" };
    if (status === "error") return { status: "error" };
    return editorWork(counts, locale);
  }, [status, counts, locale]);
}

export function useJudgeBand(store?: SubmissionStore): BandWork {
  const data = useJudgeContests({ store });
  const locale = useLocale();
  return useMemo(() => bandFrom(data, (d) => judgeWork(d.items, locale)), [data, locale]);
}

export function useMentorBand(store?: AssignmentStore): BandWork {
  const data = useMentorClasses({ store });
  const locale = useLocale();
  return useMemo(() => bandFrom(data, (d) => mentorWork(d.items, locale)), [data, locale]);
}

export function useOrganizerBand(store?: SubmissionStore): BandWork {
  const data = useOrganizerList({ store });
  const locale = useLocale();
  return useMemo(
    () => bandFrom(data, (d) => organizerWork(countByList(d.rows).aktif, locale)),
    [data, locale],
  );
}

export function useAdminBand(store?: PostStore): BandWork {
  const cases = useCaseList(store);
  const locale = useLocale();
  return useMemo(() => bandFrom(cases, (d) => adminWork(d.rows, locale)), [cases, locale]);
}
