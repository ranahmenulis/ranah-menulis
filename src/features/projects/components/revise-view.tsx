"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/states";
import { StatusSubmission } from "@/components/ui/status-submission";
import { TextLink } from "@/components/ui/text-link";
import { useDocumentList } from "@/features/studio/hooks/use-document-list";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import { studioStore } from "@/features/studio/storage/store";
import { useViewer } from "@/lib/viewer";
import { formatNumber } from "../project-model";
import { sendRevision } from "../revise-flow";
import { submissionStore } from "../storage/store";
import type { SubmissionStore } from "../storage/submission-store";
import { MY_PROJECTS_HREF, submissionHref } from "../submission-href";
import { reviseBlock, reviseMessage } from "../submission-status";
import { sentAtText } from "../submission-text";
import type { Submission } from "../submission-types";
import type { ProjectFixture } from "../types";
import { useProjects } from "../use-projects";
import { useSubmissions } from "../use-submissions";
import { MyError, MyGuest, MyShell, MySkeleton } from "./my-states";
import { ReviseForm } from "./revise-form";

type Props = {
  slug: string;
  id: string;
  /** Replace the dummy catalog and the device stores in tests. */
  source?: ProjectFixture[];
  store?: SubmissionStore;
  documents?: DocumentStore;
};

function Done({ work, slug }: { work: Submission; slug: string }) {
  const latest = work.versions.at(-1);
  return (
    <MyShell back={{ href: submissionHref(slug, work.id), label: "Kembali ke karya" }}>
      <div className="grid justify-items-start gap-3">
        <h1 className="font-serif text-2xl leading-8 font-semibold">Revisimu terkirim.</h1>
        <p className="text-base wrap-anywhere">{work.title}</p>
        <StatusSubmission status={work.status} />
        <p className="text-sm text-ink-muted">
          Versi {latest?.version}: {formatNumber(latest?.wordCount ?? 0)} kata, dibekukan{" "}
          {sentAtText(latest?.frozenAt ?? work.submittedAt)}. Versi sebelumnya tetap tersimpan.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <ButtonLink href={submissionHref(slug, work.id)}>Lihat karya</ButtonLink>
        <TextLink href={MY_PROJECTS_HREF} className="text-sm text-ink-muted">
          Proyek saya
        </TextLink>
      </div>
    </MyShell>
  );
}

/**
 * Kirim revisi (PRD 10.5, step 7; AC-24): the form while the editor's request is open, else the
 * reason it is not (a deadline that passed, the rounds used up, nothing asked), else the
 * confirmation. The way back leads to the work, not to a list.
 */
export function ReviseView({
  slug,
  id,
  source,
  store = submissionStore,
  documents = studioStore,
}: Props) {
  const catalog = useProjects(source);
  const guest = useViewer() === "tamu";
  const submissions = useSubmissions(store);
  const list = useDocumentList(documents);
  const [sent, setSent] = useState<Submission | null>(null);

  const back = { href: submissionHref(slug, id), label: "Kembali ke karya" };
  if (guest) return <MyGuest back="saya" />;
  if (submissions.status === "error" || list.status === "error") {
    return (
      <MyError
        back={back}
        onRetry={() => {
          submissions.reload();
          list.reload();
        }}
      >
        Halaman revisi belum bisa dibuka. Data di perangkat ini tidak terbaca.
      </MyError>
    );
  }
  if (
    catalog.status === "loading" ||
    submissions.status === "loading" ||
    list.status === "loading"
  ) {
    return <MySkeleton label="Memuat halaman revisi" />;
  }

  if (sent) return <Done work={sent} slug={slug} />;
  const project = catalog.projects.find((p) => p.slug === slug && p.publication === "terbit");
  const work = submissions.submissions.find((s) => s.id === id && s.slug === slug);
  if (!project || !work) {
    return (
      <MyShell back="saya">
        <h1 className="heading-lg">Karya ini tidak ditemukan.</h1>
        <ButtonLink href={MY_PROJECTS_HREF} variant="secondary" className="justify-self-start">
          Lihat Proyek saya
        </ButtonLink>
      </MyShell>
    );
  }

  const block = reviseBlock(work, catalog.now);
  if (block) {
    return (
      <MyShell back={back}>
        <h1 className="heading-lg wrap-anywhere">{work.title}</h1>
        <Notice>{reviseMessage[block]}</Notice>
        <ButtonLink href={back.href} variant="secondary" className="justify-self-start">
          Lihat karya
        </ButtonLink>
      </MyShell>
    );
  }

  return (
    <MyShell back={back}>
      <ReviseForm
        project={project}
        work={work}
        all={submissions.submissions}
        docs={list.docs.filter((d) => !d.deletedAt).sort((a, b) => b.updatedAt - a.updatedAt)}
        now={catalog.now}
        onSend={async (docId, note) => {
          const result = await sendRevision({
            project,
            submission: work,
            docId,
            note,
            documents,
            store,
          });
          if (result.kind === "sent") setSent(result.submission);
          return result;
        }}
      />
    </MyShell>
  );
}
