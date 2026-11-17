"use client";

import { ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/states";
import { TextLink } from "@/components/ui/text-link";
import { MyError, MyShell, MySkeleton } from "../../components/my-states";
import { ProjectGone } from "../../components/projects-states";
import { formatProjectDate } from "../../project-model";
import type { SubmissionStore } from "../../storage/submission-store";
import { reviseHref, submissionHref } from "../../submission-href";
import { kirimHref } from "../../submission-model";
import { latestFeedback } from "../../submission-status";
import type { Submission } from "../../submission-types";
import type { ProjectFixture, TimeZoneName } from "../../types";
import type { SoloProgress } from "../types";
import { useSolo, type SoloData } from "../hooks/use-solo";
import { acceptedAt } from "../solo-model";
import { currentStage, timeline } from "../stage-model";
import { soloStore } from "../storage/store";
import type { SoloStore } from "../storage/solo-store";
import { FinalApproval } from "./final-approval";
import { PreviewFiles } from "./preview-files";
import { backToProject, SoloBlocked } from "./solo-states";
import { StageTimeline } from "./stage-timeline";

type Props = {
  slug: string;
  /** Replace the dummy catalog and the device stores in tests. */
  source?: ProjectFixture[];
  submissions?: SubmissionStore;
  store?: SoloStore;
};

const TITLE_ID = "solo-judul";

/**
 * The buttons that were pressed are gone once a decision is saved, so focus goes to the title. It
 * waits a frame because the closing dialog hands focus back to its (now missing) opener first.
 */
const focusTitle = () =>
  requestAnimationFrame(() => setTimeout(() => document.getElementById(TITLE_ID)?.focus(), 0));

function PhaseNotice({ slug, work }: { slug: string; work: Submission | undefined }) {
  if (!work) {
    return (
      <Notice
        action={
          <ButtonLink href={kirimHref(slug)} size="sm">
            Kirim naskah
          </ButtonLink>
        }
      >
        Tahap penerbitan dimulai setelah naskahmu diajukan dan diterima.
      </Notice>
    );
  }
  const reason = latestFeedback(work);
  const link = (
    <TextLink href={submissionHref(slug, work.id)} className="text-ink underline">
      Lihat pengajuan
    </TextLink>
  );
  if (work.status === "ditolak") {
    return (
      <Notice action={link}>
        Pengajuanmu tidak lolos.{reason ? ` Catatan tim: ${reason}` : ""}
      </Notice>
    );
  }
  if (work.status === "perlu-revisi") {
    return (
      <Notice
        action={
          <TextLink href={reviseHref(slug, work.id)} className="text-ink underline">
            Kirim revisi
          </TextLink>
        }
      >
        Tim meminta revisi naskahmu.{reason ? ` Catatan tim: ${reason}` : ""}
      </Notice>
    );
  }
  return (
    <Notice action={link}>
      Pengajuanmu sedang ditinjau. Tahap berikutnya dimulai setelah diterima.
    </Notice>
  );
}

/**
 * The Solo dashboard (SOL-02, PRD 17.5, AC-29): the stages of the package you chose with their
 * dates, the preview files, and the final approval. Until the submission is accepted it shows the
 * submission stage and why nothing else moves. [usulan, Q-24]
 */
export function SoloDashboard({ slug, source, submissions, store = soloStore }: Props) {
  const data = useSolo(slug, { source, submissions, store });

  if (data.status === "loading") return <MySkeleton label="Memuat dasbor penerbitan" />;
  if (data.status === "gone") return <ProjectGone />;
  if (data.status === "error") {
    return (
      <MyError back={backToProject(slug)} onRetry={data.reload}>
        Dasbor penerbitan belum bisa dibuka. Data di perangkat ini tidak terbaca.
      </MyError>
    );
  }
  if (data.status === "blocked") return <SoloBlocked project={data.project} block={data.block} />;

  return <SoloReady data={data} slug={slug} store={store} />;
}

type Ready = Extract<SoloData, { status: "ready" }>;

function SoloHeader({
  title,
  packageName,
  work,
}: {
  title: string;
  packageName?: string;
  work?: Submission;
}) {
  return (
    <header className="grid gap-2">
      <p className="text-xs text-ink-muted">Dasbor penerbitan</p>
      <h1 id={TITLE_ID} tabIndex={-1} className="heading-lg wrap-anywhere outline-none">
        {title}
      </h1>
      {packageName && <p className="text-sm wrap-anywhere text-ink-muted">Paket {packageName}</p>}
      {work && <p className="text-sm wrap-anywhere text-ink-muted">Naskah: {work.title}</p>}
    </header>
  );
}

function ApprovedNotice({ progress, zone }: { progress: SoloProgress | null; zone: TimeZoneName }) {
  const approved = progress?.log.findLast((c) => c.kind === "setuju");
  if (!approved) return null;
  return (
    <Notice>
      Kamu menyetujui versi final pada {formatProjectDate(approved.at, zone)}. Produksi tidak bisa
      diubah lagi.
    </Notice>
  );
}

function rowsOf(data: Ready, accepted: boolean) {
  const { work, registration, stages, progress } = data;
  return timeline(stages, progress, {
    accepted,
    submittedAt: work?.submittedAt ?? registration.registeredAt,
    acceptedAt: work ? acceptedAt(work) : null,
  });
}

function SoloReady({ data, slug, store }: { data: Ready; slug: string; store: SoloStore }) {
  const { project, registration, work, phase, stages, progress } = data;
  const zone = project.timeZone;
  // Only an accepted submission has stages that run; the target is what the actions work on.
  const target = phase === "diterima" && work ? { id: work.id, slug, stages } : null;
  const rows = rowsOf(data, target !== null);
  const showPreviews = target && (stages.includes("cover") || stages.includes("layout"));
  const approving = target && currentStage(stages, progress) === "persetujuan-final";

  return (
    <MyShell back={backToProject(slug)}>
      <SoloHeader title={project.title} packageName={registration.packageName} work={work} />
      {!target && <PhaseNotice slug={slug} work={work} />}
      <ApprovedNotice progress={progress} zone={zone} />
      {phase !== "ditolak" && <StageTimeline rows={rows} zone={zone} />}
      {showPreviews && <PreviewFiles files={progress?.files ?? []} zone={zone} />}
      {approving && (
        <FinalApproval
          target={target}
          progress={progress}
          store={store}
          zone={zone}
          onDecided={focusTitle}
        />
      )}
    </MyShell>
  );
}
