"use client";

import { useState } from "react";
import { useDocumentList } from "@/features/studio/hooks/use-document-list";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import { studioStore } from "@/features/studio/storage/store";
import { useViewer } from "@/lib/viewer";
import { useRegistrations } from "../registration-store";
import { submissionStore } from "../storage/store";
import type { SubmissionStore } from "../storage/submission-store";
import {
  activeSubmissions,
  canSendAnother,
  submitBlock,
  type SubmitForm,
} from "../submission-model";
import type { Submission } from "../submission-types";
import { sendSubmission, type SendResult } from "../submit-flow";
import type { ProjectFixture } from "../types";
import { useProjects } from "../use-projects";
import { useSubmissions } from "../use-submissions";
import { ProjectGone } from "./projects-states";
import { SentWorks } from "./sent-works";
import { SubmitDone } from "./submit-done";
import { SubmitFormScreen } from "./submit-form";
import { SubmitBlocked, SubmitError, SubmitShell, SubmitSkeleton } from "./submit-states";

type Props = {
  slug: string;
  /** `?dokumen=<id>`: the Studio document chosen before arriving (Editor, document list). */
  documentId?: string | null;
  /** Replace the dummy catalog and the device stores in tests. */
  source?: ProjectFixture[];
  store?: SubmissionStore;
  documents?: DocumentStore;
};

/**
 * Kirim karya (PRJ-04 steps 1 to 5, PRD 17.5). Which screen you get depends on who you are and on
 * the project: why you cannot send (guest, unregistered, waiting for payment, closed, at the limit,
 * a category that collects assignments instead), else the form, then the confirmation. A draft or
 * unknown address is "not found" like on the detail page.
 */
export function SubmitView({
  slug,
  documentId = null,
  source,
  store = submissionStore,
  documents = studioStore,
}: Props) {
  const data = useProjects(source);
  const guest = useViewer() === "tamu";
  const registrations = useRegistrations();
  const submissions = useSubmissions(store);
  const list = useDocumentList(documents);
  const [justSent, setJustSent] = useState<Submission | null>(null);
  /** Bumped to start the form over after "Kirim karya lain". */
  const [round, setRound] = useState(0);

  if (data.status === "loading") return <SubmitSkeleton />;
  const project = data.projects.find((p) => p.slug === slug && p.publication === "terbit");
  if (!project) return <ProjectGone />;
  if (submissions.status === "error" || list.status === "error") {
    return (
      <SubmitError
        slug={slug}
        onRetry={() => {
          submissions.reload();
          list.reload();
        }}
      />
    );
  }
  if (submissions.status === "loading" || list.status === "loading") return <SubmitSkeleton />;

  const registration = guest ? undefined : registrations[slug];
  const mine = activeSubmissions(submissions.submissions, slug);
  const block = submitBlock({ project, guest, registration, now: data.now, sent: mine.length });

  if (justSent) {
    return (
      <SubmitDone
        project={project}
        submission={justSent}
        canSendMore={canSendAnother(project, mine, justSent)}
        onSendMore={() => {
          setJustSent(null);
          setRound((n) => n + 1);
        }}
      />
    );
  }
  if (block !== null) {
    return (
      <SubmitBlocked project={project} block={block}>
        <SentWorks works={mine} />
      </SubmitBlocked>
    );
  }
  // `block` is null only for a registered reader; this narrows the type for the closure below.
  if (!registration) return null;

  const send = async (form: SubmitForm): Promise<SendResult> => {
    const result = await sendSubmission({ project, registration, form, documents, store });
    if (result.kind === "sent") setJustSent(result.submission);
    return result;
  };

  return (
    <SubmitShell slug={slug}>
      <SubmitFormScreen
        key={round}
        project={project}
        now={data.now}
        docs={list.docs.filter((d) => !d.deletedAt).sort((a, b) => b.updatedAt - a.updatedAt)}
        sent={mine}
        documentId={round === 0 ? documentId : null}
        onSend={send}
      />
      <SentWorks works={mine} />
    </SubmitShell>
  );
}
