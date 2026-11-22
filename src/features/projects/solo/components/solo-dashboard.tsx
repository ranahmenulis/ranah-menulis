"use client";

import { ButtonLink } from "@/components/ui/button";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { Notice } from "@/components/ui/states";
import { TextLink } from "@/components/ui/text-link";
import { CountUp } from "@/components/ui/count-up";
import { BandFigure, DashboardBand } from "../../components/dashboard-band";
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
import { acceptedAt, soloFigure } from "../solo-model";
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
  const c = useT().projectsSolo.phase;
  if (!work) {
    return (
      <Notice
        action={
          <ButtonLink href={kirimHref(slug)} size="sm">
            {c.sendManuscript}
          </ButtonLink>
        }
      >
        {c.notStarted}
      </Notice>
    );
  }
  const reason = latestFeedback(work);
  const note = reason ? format(c.teamNote, { reason }) : "";
  const link = (
    <TextLink href={submissionHref(slug, work.id)} className="text-ink underline">
      {c.viewSubmission}
    </TextLink>
  );
  if (work.status === "ditolak") {
    return (
      <Notice action={link}>
        {c.rejected}
        {note}
      </Notice>
    );
  }
  if (work.status === "perlu-revisi") {
    return (
      <Notice
        action={
          <TextLink href={reviseHref(slug, work.id)} className="text-ink underline">
            {c.sendRevision}
          </TextLink>
        }
      >
        {c.revision}
        {note}
      </Notice>
    );
  }
  return <Notice action={link}>{c.reviewing}</Notice>;
}

/**
 * The Solo dashboard (SOL-02, PRD 17.5, AC-29): the stages of the package you chose with their
 * dates, the preview files, and the final approval. Until the submission is accepted it shows the
 * submission stage and why nothing else moves. [usulan, Q-24]
 */
export function SoloDashboard({ slug, source, submissions, store = soloStore }: Props) {
  const c = useT().projectsSolo;
  const data = useSolo(slug, { source, submissions, store });

  if (data.status === "loading") return <MySkeleton label={c.loading} />;
  if (data.status === "gone") return <ProjectGone />;
  if (data.status === "error") {
    return (
      <MyError back={backToProject(slug, c.back)} onRetry={data.reload}>
        {c.loadError}
      </MyError>
    );
  }
  if (data.status === "blocked") return <SoloBlocked project={data.project} block={data.block} />;

  return <SoloReady data={data} slug={slug} store={store} />;
}

type Ready = Extract<SoloData, { status: "ready" }>;

function SoloBand({ data }: { data: Ready }) {
  const { project, registration, work, stages, progress } = data;
  const c = useT().projectsSolo;
  const locale = useLocale();
  const figure = soloFigure(work, stages, progress, locale);
  const facts = [
    registration.packageName && format(c.packageFact, { name: registration.packageName }),
    work && format(c.workFact, { title: work.title }),
  ].filter(Boolean);
  return (
    <DashboardBand project={project} eyebrow={c.eyebrow} titleId={TITLE_ID}>
      {figure.kind === "stage" ? (
        <BandFigure
          figure={
            <>
              <CountUp value={figure.index} />
              <span className="text-ink-soft">/{figure.total}</span>
            </>
          }
          caption={format(c.stagePosition, {
            index: String(figure.index),
            total: String(figure.total),
            label: figure.label,
          })}
        />
      ) : (
        <BandFigure words figure={figure.label} />
      )}
      {facts.map((fact) => (
        <p key={fact as string} className="text-sm wrap-anywhere text-ink-soft">
          {fact}
        </p>
      ))}
    </DashboardBand>
  );
}

function ApprovedNotice({ progress, zone }: { progress: SoloProgress | null; zone: TimeZoneName }) {
  const c = useT().projectsSolo;
  const locale = useLocale();
  const approved = progress?.log.findLast((c) => c.kind === "setuju");
  if (!approved) return null;
  return (
    <Notice>{format(c.approved, { date: formatProjectDate(approved.at, zone, locale) })}</Notice>
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
  const c = useT().projectsSolo;
  const { project, work, phase, stages, progress } = data;
  const zone = project.timeZone;
  // Only an accepted submission has stages that run; the target is what the actions work on.
  const target = phase === "diterima" && work ? { id: work.id, slug, stages } : null;
  const rows = rowsOf(data, target !== null);
  const showPreviews = target && (stages.includes("cover") || stages.includes("layout"));
  const approving = target && currentStage(stages, progress) === "persetujuan-final";

  return (
    <MyShell back={backToProject(slug, c.back)}>
      <SoloBand data={data} />
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
