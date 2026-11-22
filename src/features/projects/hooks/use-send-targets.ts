"use client";

import { useLocale } from "@/lib/i18n/provider";
import { useViewer } from "@/lib/viewer";
import { sendTargets, type SendTarget } from "../send-targets";
import { liveRegistrations } from "../payment-model";
import { useRegistrations } from "../registration-store";
import type { SubmissionStore } from "../storage/submission-store";
import { useProjects } from "../use-projects";
import { useSubmissions } from "../use-submissions";

export type SendTargets = {
  status: "loading" | "ready" | "error";
  targets: SendTarget[];
  reload: () => void;
};

/** What "Kirim ke proyek" offers for one document (PRD 17.2). Read when the dialog opens. */
export function useSendTargets(docId: string | null, store?: SubmissionStore): SendTargets {
  const locale = useLocale();
  const data = useProjects();
  const guest = useViewer() === "tamu";
  const registrations = useRegistrations();
  const submissions = useSubmissions(store);

  const { reload } = submissions;
  if (submissions.status === "error") return { status: "error", targets: [], reload };
  if (data.status === "loading" || submissions.status === "loading") {
    return { status: "loading", targets: [], reload };
  }
  const targets = sendTargets({
    projects: data.projects,
    registrations: liveRegistrations(registrations, data.now),
    submissions: submissions.submissions,
    docId,
    now: data.now,
    guest,
    locale,
  });
  return { status: "ready", targets, reload };
}
