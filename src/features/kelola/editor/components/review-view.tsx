"use client";

import { versionSizeText } from "@/features/projects/submission-text";
import { useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ErrorBanner, Notice, RetryButton, Skeleton } from "@/components/ui/states";
import { StatusSubmission } from "@/components/ui/status-submission";
import { TextLink } from "@/components/ui/text-link";
import { DUMMY_USER } from "@/features/app-shell/nav";
import { StatusHistory } from "@/features/projects/components/submission-history";
import { useCatalog } from "@/features/projects/use-catalog";
import { useStaffAssignments } from "../../staff-assignments";
import { categoryLabel, projectHref } from "@/features/projects/project-model";
import { notifySubmissionsChanged } from "@/features/projects/storage/submission-events";
import { submissionStore } from "@/features/projects/storage/store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { sentAtText } from "@/features/projects/submission-text";
import type { Submission } from "@/features/projects/submission-types";
import { useSubmissions } from "@/features/projects/use-submissions";
import { useEffectiveRoles } from "@/features/kelola/use-effective-roles";
import { FileVersion } from "@/features/projects/components/file-version";
import { FrozenText } from "../../components/frozen-text";
import { EDITOR_HREF } from "../area-hrefs";
import { blockedMessage, resolveReview, reviewerHint } from "../review-model";
import { DecisionPanel } from "./decision-panel";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-170 gap-6">
      <TextLink
        href={EDITOR_HREF}
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <span aria-hidden>←</span>
        Antrean submission
      </TextLink>
      {children}
    </div>
  );
}

function Information({ work }: { work: Submission }) {
  const rows = [
    ["Paket", work.packageName],
    ["Sinopsis", work.synopsis],
    ["Catatan peserta untuk editor", work.note],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  if (rows.length === 0) return null;
  return (
    <dl className="grid gap-3 border-t border-line pt-6 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-0.5">
          <dt className="text-xs text-ink-muted">{label}</dt>
          <dd className="wrap-anywhere whitespace-pre-line">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Text({ work }: { work: Submission }) {
  const [picked, setPicked] = useState<number | null>(null);
  const latest = work.versions.length;
  const number = picked ?? latest;
  const version = work.versions.find((v) => v.version === number) ?? work.versions.at(-1);
  if (!version) return <Notice>Karya ini tidak punya salinan beku.</Notice>;
  return (
    <section aria-labelledby="naskah-title" className="grid gap-4 border-t border-line pt-6">
      <h2 id="naskah-title" className="heading-md">
        Naskah
      </h2>
      {latest > 1 && (
        <div role="group" aria-label="Versi naskah" className="flex flex-wrap gap-2">
          {work.versions.map((v) => (
            <Chip
              key={v.version}
              pressed={v.version === version.version}
              onClick={() => setPicked(v.version)}
            >
              Versi {v.version}
              {v.version === latest ? " (terbaru)" : ""}
            </Chip>
          ))}
        </div>
      )}
      <p className="text-xs text-ink-muted">
        Versi {version.version} · {versionSizeText(version)} · dibekukan{" "}
        {sentAtText(version.frozenAt)}
      </p>
      {version.file ? (
        <FileVersion file={version.file} />
      ) : (
        <FrozenText content={version.content} />
      )}
    </section>
  );
}

function Body({ work, store }: { work: Submission; store: SubmissionStore }) {
  const project = useCatalog().find((p) => p.slug === work.slug);
  const title = useRef<HTMLHeadingElement>(null);
  const size = versionSizeText(work.versions.at(-1));
  return (
    <Shell>
      <header className="grid gap-2">
        {project && (
          <p className="text-xs text-ink-muted">
            {categoryLabel(project.category)} ·{" "}
            <TextLink href={projectHref(project.slug)} className="text-ink-muted underline">
              {project.title}
            </TextLink>
          </p>
        )}
        <h1 ref={title} tabIndex={-1} className="heading-lg wrap-anywhere outline-none">
          {work.title}
        </h1>
        <p className="text-sm wrap-anywhere text-ink-muted">
          oleh {DUMMY_USER.name} · {work.genre} · {size} · dikirim {sentAtText(work.submittedAt)}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
          <StatusSubmission status={work.status} />
          <p className="text-sm">{reviewerHint[work.status]}</p>
        </div>
      </header>
      <DecisionPanel
        work={work}
        store={store}
        onDone={() => requestAnimationFrame(() => title.current?.focus())}
        onRejected={notifySubmissionsChanged}
      />
      <Information work={work} />
      <Text work={work} />
      <StatusHistory work={work} />
    </Shell>
  );
}

/**
 * One submission for the Editor (PRJ-04 step 6 to 8): the frozen text, the status and its history,
 * and the steps the status allows. Refuses work that is not assigned to the viewer with a way back
 * to the queue. Hiding the entry is not access control; Row Level Security is.
 */
export function ReviewView({
  id,
  store = submissionStore,
}: {
  id: string;
  store?: SubmissionStore;
}) {
  const submissions = useSubmissions(store);
  const roles = useEffectiveRoles();
  const catalog = useCatalog();
  const assigned = useStaffAssignments();

  if (submissions.status === "error") {
    return (
      <Shell>
        <ErrorBanner action={<RetryButton onClick={submissions.reload} />}>
          Karya belum bisa dibuka karena data di perangkat ini tidak terbaca.
        </ErrorBanner>
      </Shell>
    );
  }
  if (submissions.status === "loading") {
    return (
      <div role="status" aria-label="Memuat karya" className="mx-auto grid max-w-170 gap-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  const target = resolveReview(submissions.submissions, id, roles, catalog, assigned);
  if (target.status === "gone") {
    return (
      <Shell>
        <h1 className="heading-lg">Karya ini tidak ditemukan.</h1>
        <Notice>Kiriman ini tidak ada di perangkat ini. Alamatnya mungkin salah.</Notice>
        <ButtonLink href={EDITOR_HREF} variant="secondary" className="justify-self-start">
          Kembali ke antrean
        </ButtonLink>
      </Shell>
    );
  }
  if (target.status === "blocked") {
    return (
      <Shell>
        <h1 className="heading-lg">Tidak bisa dibuka.</h1>
        <Notice>{blockedMessage[target.reason]}</Notice>
        <ButtonLink href={EDITOR_HREF} variant="secondary" className="justify-self-start">
          Kembali ke antrean
        </ButtonLink>
      </Shell>
    );
  }
  return <Body work={target.work} store={store} />;
}
