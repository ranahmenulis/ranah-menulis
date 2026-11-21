"use client";

import { useMemo } from "react";
import type { PostStore } from "@/features/community/storage/post-store";
import type { AssignmentStore } from "@/features/projects/kelas/storage/assignment-store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { useCaseList } from "./admin/moderation/use-moderation-data";
import { useAdminUsers } from "./admin/use-admin-data";
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
  peopleDots,
  type BandWork,
} from "./role-band";

export function useEditorBand(store?: SubmissionStore): BandWork {
  const { submissions, counts } = useEditorQueue(store);
  const status = submissions.status;
  return useMemo((): BandWork => {
    if (status === "loading") return { status: "loading" };
    if (status === "error") return { status: "error" };
    return editorWork(counts);
  }, [status, counts]);
}

export function useJudgeBand(store?: SubmissionStore): BandWork {
  const data = useJudgeContests({ store });
  return useMemo(() => bandFrom(data, (d) => judgeWork(d.items)), [data]);
}

export function useMentorBand(store?: AssignmentStore): BandWork {
  const data = useMentorClasses({ store });
  return useMemo(() => bandFrom(data, (d) => mentorWork(d.items)), [data]);
}

export function useOrganizerBand(store?: SubmissionStore): BandWork {
  const data = useOrganizerList({ store });
  return useMemo(() => bandFrom(data, (d) => organizerWork(countByList(d.rows).aktif)), [data]);
}

export function useAdminBand(store?: PostStore): {
  work: BandWork;
  people: ("full" | "ring")[];
} {
  const cases = useCaseList(store);
  const users = useAdminUsers();
  const work = useMemo(() => bandFrom(cases, (d) => adminWork(d.rows)), [cases]);
  const people = useMemo(() => peopleDots(users), [users]);
  return { work, people };
}
