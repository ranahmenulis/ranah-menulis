import Link from "next/link";
import { fill } from "@/features/studio/copy/fill";
import { useLocale, useT } from "@/lib/i18n/provider";
import { StatusSubmission } from "@/components/ui/status-submission";
import { TextLink } from "@/components/ui/text-link";
import { payHref } from "../payment-model";
import { categoryLabel, formatProjectDate, projectHref } from "../project-model";
import { dashboardHref } from "../kelas/class-model";
import { soloDashboardHref } from "../solo/solo-model";
import { resultsHref } from "../lomba/contest-model";
import type { MyProject } from "../my-projects";
import { submissionHref } from "../submission-href";
import { kirimHref } from "../submission-model";
import { revisionDueAt } from "../submission-status";
import { sentAtText, versionSizeText } from "../submission-text";
import type { Submission } from "../submission-types";
import type { Locale } from "@/lib/i18n/config";
import type { Project } from "../types";
import { ProjectCover } from "./project-cover";

/** The line under a work: how many versions, how long, when it was sent, and what is due. */
function workMeta(
  work: Submission,
  project: Project,
  t: ReturnType<typeof useT>["projectsFlow"]["my"]["group"],
  locale: Locale,
  timeZone?: string,
): string {
  const last = work.versions.at(-1);
  const parts = [
    work.versions.length > 1 ? fill(t.version, { n: String(work.versions.length) }) : null,
    versionSizeText(last, locale),
    fill(t.sentAt, { at: sentAtText(work.submittedAt, locale, timeZone) }),
  ];
  const due = revisionDueAt(work);
  if (due !== null) {
    parts.push(fill(t.revisionDue, { date: formatProjectDate(due, project.timeZone, locale) }));
  }
  return parts.filter(Boolean).join(" · ");
}

/** What a registration with no work says, and the way on when there is one. */
function EmptyLine({ row }: { row: MyProject }) {
  const t = useT().projectsFlow;
  const g = t.my.group;
  const { project, registration } = row;
  if (!project.submission) {
    if (registration.status !== "terdaftar") {
      return (
        <p className="text-sm text-ink-muted">
          {g.classPayFirst}{" "}
          <TextLink href={payHref(project.slug)} className="text-ink underline">
            {t.common.payNow}
          </TextLink>
        </p>
      );
    }
    return (
      <p className="text-sm text-ink-muted">
        {g.classTasks}{" "}
        <TextLink href={dashboardHref(project.slug)} className="text-ink underline">
          {g.openClass}
        </TextLink>
      </p>
    );
  }
  if (registration.status !== "terdaftar") {
    return (
      <p className="text-sm text-ink-muted">
        {g.sendAfterPay}{" "}
        <TextLink href={payHref(project.slug)} className="text-ink underline">
          {t.common.payNow}
        </TextLink>
      </p>
    );
  }
  return (
    <p className="text-sm text-ink-muted">
      {g.noWorks}{" "}
      <TextLink href={kirimHref(project.slug)} className="text-ink underline">
        {t.common.sendWork}
      </TextLink>
    </p>
  );
}

/**
 * One project you joined, with its works (PRD 17.5). A project with no work shows the state of the
 * registration, not a submission status, so the two are never mixed up (DESIGN.md 7.4).
 */
export function MyProjectGroup({ row, timeZone }: { row: MyProject; timeZone?: string }) {
  const g = useT().projectsFlow.my.group;
  const locale = useLocale();
  const { project, registration, works } = row;
  return (
    <section
      aria-labelledby={`saya-${project.slug}`}
      className="rm-cover-host grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 rounded-2xl border border-line bg-surface p-4 shadow-card sm:grid-cols-[4.5rem_minmax(0,1fr)] md:p-5"
    >
      <ProjectCover project={project} className="row-span-2 self-start" />
      <div className="grid min-w-0 gap-1">
        <p className="text-xs text-ink-muted">
          {categoryLabel(project.category, locale)} ·{" "}
          {registration.status === "terdaftar" ? g.registered : g.waiting}
        </p>
        <h2 id={`saya-${project.slug}`} className="feed-title wrap-anywhere">
          <Link href={projectHref(project.slug)} className="text-ink no-underline hover:underline">
            {project.title}
          </Link>
        </h2>
        {project.block.kind === "solo" &&
          works.length > 0 &&
          registration.status === "terdaftar" && (
            <TextLink
              href={soloDashboardHref(project.slug)}
              className="w-fit text-xs text-ink-muted"
            >
              {g.soloDashboard}
            </TextLink>
          )}
        {project.block.kind === "lomba" && (
          <TextLink href={resultsHref(project.slug)} className="w-fit text-xs text-ink-muted">
            {g.results}
          </TextLink>
        )}
      </div>
      {works.length === 0 ? (
        <EmptyLine row={row} />
      ) : (
        <ul className="grid gap-3">
          {works.map((work) => (
            <li
              key={work.id}
              className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1.5"
            >
              <div className="grid min-w-0 gap-0.5">
                <TextLink
                  href={submissionHref(project.slug, work.id)}
                  className="text-base font-medium wrap-anywhere"
                >
                  {work.title}
                </TextLink>
                <p className="text-xs wrap-anywhere text-ink-muted">
                  {workMeta(work, project, g, locale, timeZone)}
                </p>
              </div>
              <StatusSubmission status={work.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
