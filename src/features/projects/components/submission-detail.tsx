"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type Ref } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { ErrorBanner, Notice } from "@/components/ui/states";
import { StatusSubmission } from "@/components/ui/status-submission";
import { useViewer } from "@/lib/viewer";
import { categoryLabel, formatNumber, projectHref } from "../project-model";
import { submissionStore } from "../storage/store";
import type { SubmissionStore } from "../storage/submission-store";
import { withdrawSubmission, type ActionResult } from "../submission-actions";
import { MY_PROJECTS_HREF } from "../submission-href";
import { canWithdraw, statusHint } from "../submission-status";
import { sentAtText } from "../submission-text";
import type { Submission } from "../submission-types";
import type { Project, ProjectFixture } from "../types";
import { useProjects } from "../use-projects";
import { useSubmissions } from "../use-submissions";
import { Section } from "./category-blocks";
import { DevReviewPanel } from "./dev-review-panel";
import { MyError, MyGuest, MyShell, MySkeleton } from "./my-states";
import { DecisionNote, RevisionRequest } from "./revision-request";
import { StatusHistory, VersionHistory } from "./submission-history";
import { WithdrawDialog } from "./withdraw-dialog";

type Props = {
  slug: string;
  id: string;
  /** Replace the dummy catalog and the device store in tests. */
  source?: ProjectFixture[];
  store?: SubmissionStore;
};

const MESSAGE: Partial<Record<ActionResult, string>> = {
  rejected: "Status karya ini sudah berubah, jadi tidak bisa ditarik lagi.",
  missing: "Karya ini tidak ditemukan lagi.",
};

function Information({ work }: { work: Submission }) {
  if (!work.note && !work.synopsis && !work.packageName) return null;
  const rows = [
    ["Paket", work.packageName],
    ["Sinopsis", work.synopsis],
    ["Catatan untuk editor", work.note],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  return (
    <Section title="Informasi karya">
      <dl className="grid gap-3 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-0.5">
            <dt className="text-xs text-ink-muted">{label}</dt>
            <dd className="wrap-anywhere whitespace-pre-line">{value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

function Header({
  project,
  work,
  titleRef,
}: {
  project: Project;
  work: Submission;
  titleRef: Ref<HTMLHeadingElement>;
}) {
  const latest = work.versions.at(-1);
  return (
    <header className="grid gap-2">
      <p className="text-xs text-ink-muted">
        {categoryLabel(project.category)} ·{" "}
        <Link href={projectHref(project.slug)} className="text-ink-muted underline">
          {project.title}
        </Link>
      </p>
      <h1 ref={titleRef} tabIndex={-1} className="heading-lg wrap-anywhere outline-none">
        {work.title}
      </h1>
      <p className="text-sm text-ink-muted">
        {work.genre} · {formatNumber(latest?.wordCount ?? 0)} kata · dikirim{" "}
        {sentAtText(work.submittedAt)}
      </p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
        <StatusSubmission status={work.status} />
        <p className="text-sm">{statusHint[work.status]}</p>
      </div>
    </header>
  );
}

function Body({
  project,
  work,
  now,
  store,
}: {
  project: Project;
  work: Submission;
  now: number;
  store: SubmissionStore;
}) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const withdrew = useRef(false);

  // The button that opened the dialog disappears once the work shows as withdrawn, so focus would
  // fall to the page. It moves to the title as soon as the new status is on screen.
  useEffect(() => {
    if (withdrew.current && work.status === "ditarik") {
      withdrew.current = false;
      titleRef.current?.focus();
    }
  }, [work.status]);

  async function withdraw() {
    setBusy(true);
    // Set before writing: the new status can reach the screen before this call returns.
    withdrew.current = true;
    const verdict = await withdrawSubmission(store, work.id);
    if (verdict !== "ok") withdrew.current = false;
    setBusy(false);
    setAsking(false);
    setResult(verdict);
  }

  const message = result ? MESSAGE[result] : undefined;
  return (
    <MyShell back="saya">
      <Header project={project} work={work} titleRef={titleRef} />

      {work.status === "perlu-revisi" ? (
        <RevisionRequest project={project} work={work} now={now} />
      ) : (
        <DecisionNote work={work} />
      )}

      <Information work={work} />
      <StatusHistory work={work} />
      <VersionHistory work={work} />

      {result === "failed" && (
        <ErrorBanner>
          Karya belum ditarik karena data di perangkat ini tidak bisa ditulis. Coba lagi sebentar
          lagi.
        </ErrorBanner>
      )}
      {message && <Notice>{message}</Notice>}
      {canWithdraw(work) && (
        <div>
          <Button variant="danger-text" onClick={() => setAsking(true)}>
            Tarik karya
          </Button>
        </div>
      )}
      <DevReviewPanel work={work} store={store} />
      <WithdrawDialog
        open={asking}
        title={work.title}
        projectTitle={project.title}
        busy={busy}
        onConfirm={() => void withdraw()}
        onClose={() => setAsking(false)}
      />
    </MyShell>
  );
}

function NotFound() {
  return (
    <MyShell back="saya">
      <h1 className="heading-lg">Karya ini tidak ditemukan.</h1>
      <Notice>
        Kiriman ini tidak ada di perangkat ini. Alamatnya mungkin salah, atau datanya sudah dihapus.
      </Notice>
      <ButtonLink href={MY_PROJECTS_HREF} variant="secondary" className="justify-self-start">
        Lihat Proyek saya
      </ButtonLink>
    </MyShell>
  );
}

/**
 * Detail submission (PRD 17.5): the status and what it means, the editor's note, the history of
 * status and of versions, and the actions the status allows: Kirim revisi (the one filled button)
 * when the editor asked for it, Tarik karya before a decision. The way out is "Proyek saya".
 */
export function SubmissionDetail({ slug, id, source, store = submissionStore }: Props) {
  const catalog = useProjects(source);
  const guest = useViewer() === "tamu";
  const submissions = useSubmissions(store);

  if (guest) return <MyGuest back="saya" />;
  if (submissions.status === "error") {
    return (
      <MyError back="saya" onRetry={submissions.reload}>
        Karya ini belum bisa dibuka. Data di perangkat ini tidak terbaca.
      </MyError>
    );
  }
  if (catalog.status === "loading" || submissions.status === "loading") {
    return <MySkeleton label="Memuat kiriman" />;
  }
  const project = catalog.projects.find((p) => p.slug === slug && p.publication === "terbit");
  const work = submissions.submissions.find((s) => s.id === id && s.slug === slug);
  if (!project || !work) return <NotFound />;
  return <Body project={project} work={work} now={catalog.now} store={store} />;
}
