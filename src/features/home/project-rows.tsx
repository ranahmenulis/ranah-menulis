"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { ErrorBanner, RetryButton } from "@/components/ui/states";
import { StatusSubmission } from "@/components/ui/status-submission";
import { TextLink } from "@/components/ui/text-link";
import { cn } from "@/lib/cn";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { useMyProjects, type MyProjectsData } from "@/features/projects/hooks/use-my-projects";
import { ProjectCover } from "@/features/projects/components/project-cover";
import { RunningClassList } from "@/features/projects/kelas/components/running-classes";
import { useRunningClasses } from "@/features/projects/kelas/hooks/use-running-classes";
import type { AssignmentStore } from "@/features/projects/kelas/storage/assignment-store";
import type { MyProject } from "@/features/projects/my-projects";
import { paymentItems, revisionItems } from "@/features/projects/my-projects";
import { formatProjectDate, projectHref } from "@/features/projects/project-model";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { MY_PROJECTS_HREF, submissionHref } from "@/features/projects/submission-href";
import { revisionDueAt } from "@/features/projects/submission-status";
import { Section } from "./today-row";

type Item = {
  key: string;
  title: string;
  meta: string;
  action: { label: string; href: string };
};

const MORE = "max-md:hidden";

/**
 * "Perlu perhatian" (PLT-10): what waits for you. A revision an editor asked for comes from your
 * real submissions and links to its note; a payment that waits comes from your
 * registrations. Nothing is drawn when there is nothing.
 */
export function Attention({ my }: { my: MyProjectsData }) {
  const t = useT().home.attention;
  const locale = useLocale();
  const real: Item[] =
    my.status === "ready"
      ? revisionItems(my.rows).map(({ project, work }) => {
          const due = revisionDueAt(work);
          return {
            key: `revisi-${work.id}`,
            title: format(t.revisionTitle, { work: work.title }),
            meta: `${project.title}${due ? ` · ${format(t.revisionDue, { date: formatProjectDate(due, project.timeZone, locale) })}` : ""}`,
            action: { label: t.readNotes, href: submissionHref(work.slug, work.id) },
          };
        })
      : [];
  const paying: Item[] =
    my.status === "ready"
      ? paymentItems(my.rows, my.now, locale).map(({ project, href, remaining }) => ({
          key: `bayar-${project.slug}`,
          title: format(t.payTitle, { project: project.title }),
          meta: format(t.payMeta, { remaining }),
          action: { label: t.payNow, href },
        }))
      : [];
  const items = [...real, ...paying];
  if (!items.length) return null;

  return (
    <Section title={t.title}>
      <ul className="grid">
        {items.map((item, i) => (
          <li
            key={item.key}
            className={cn(
              "grid gap-1 border-t border-line py-2 first:border-t-0 first:pt-0",
              i > 0 && MORE,
            )}
          >
            <span className="min-w-0 text-sm">
              <b className="font-medium wrap-anywhere">{item.title}</b>
              <span className="mt-0.5 block text-xs wrap-anywhere text-ink-muted">{item.meta}</span>
            </span>
            <ButtonLink
              href={item.action.href}
              variant="text"
              size="sm"
              className="justify-self-start px-0 text-ink"
            >
              {item.action.label}
            </ButtonLink>
          </li>
        ))}
        {items.length > 1 && (
          <li className="md:hidden">
            <Button variant="text" size="sm" className="px-0 text-ink" disabled>
              {format(t.more, { count: String(items.length - 1) })}
            </Button>
          </li>
        )}
      </ul>
    </Section>
  );
}

/**
 * The work that matters most in a project: one needing a revision, else the newest that is still
 * in play, else the newest. A withdrawn work does not hide a live one.
 */
function featured(row: MyProject) {
  return (
    row.needsRevision[0] ?? row.works.find((w) => w.status !== "ditarik") ?? row.works[0] ?? null
  );
}

function ProjectLine({ row }: { row: MyProject }) {
  const t = useT().home;
  const work = featured(row);
  const due = work ? revisionDueAt(work) : null;
  const waiting = row.registration.status !== "terdaftar";
  return (
    <>
      <ProjectCover project={row.project} className="w-11 shrink-0" />
      <span className="grid min-w-0 justify-items-start gap-1.5 text-sm">
        <span className="min-w-0">
          <TextLink
            href={work ? submissionHref(work.slug, work.id) : projectHref(row.project.slug)}
            className="font-medium wrap-anywhere"
          >
            {row.project.title}
          </TextLink>
          <span className="block text-xs wrap-anywhere text-ink-muted">
            {work ? `“${work.title}”` : t.projects.noWork}
            {due !== null &&
              ` · ${format(t.attention.revisionDue, { date: formatProjectDate(due, row.project.timeZone) })}`}
          </span>
        </span>
        {work ? (
          <StatusSubmission status={work.status} outlineRevisi />
        ) : (
          <span className="text-xs text-ink-muted">
            {waiting ? t.projects.waitingPayment : t.projects.registered}
          </span>
        )}
      </span>
    </>
  );
}

/**
 * "Proyek saya" (PLT-10): up to two projects you joined, with the status of your work, and the way
 * to all of them. It loads and fails on its own (a retry here leaves the rest of Beranda alone) and
 * is not drawn at all when you joined nothing.
 */
export function MyProjectsRow({ my }: { my: MyProjectsData }) {
  const t = useT().home.projects;
  if (my.status === "error") {
    return (
      <Section title={t.title}>
        <ErrorBanner action={<RetryButton onClick={my.reload} />}>{t.loadError}</ErrorBanner>
      </Section>
    );
  }
  if (my.status !== "ready" || my.rows.length === 0) return null;
  return (
    <Section title={t.title}>
      <ul className="grid">
        {my.rows.slice(0, 2).map((row, i) => (
          <li
            key={row.project.slug}
            className={cn(
              "rm-cover-host flex items-start gap-3 border-t border-line py-3 first:border-t-0 first:pt-0",
              i > 0 && MORE,
            )}
          >
            <ProjectLine row={row} />
          </li>
        ))}
      </ul>
      <ButtonLink
        href={MY_PROJECTS_HREF}
        variant="text"
        size="sm"
        className="justify-self-start px-0 text-ink"
      >
        {t.seeAll}
      </ButtonLink>
    </Section>
  );
}

/**
 * "Kelas yang sedang berjalan" (KLS-05): classes you can continue, each with a Lanjutkan button.
 * Not drawn when there is none; a failed read says so with a retry.
 */
export function RunningClassesRow({ store }: { store?: AssignmentStore }) {
  const t = useT().home.projects;
  const running = useRunningClasses({ store });
  if (running.status === "error") {
    return (
      <Section title={t.runningTitle}>
        <ErrorBanner action={<RetryButton onClick={running.reload} />}>
          {t.runningError}
        </ErrorBanner>
      </Section>
    );
  }
  if (running.status !== "ready" || running.rows.length === 0) return null;
  return (
    <Section title={t.runningTitle}>
      <RunningClassList rows={running.rows} variant="rail" />
    </Section>
  );
}

/**
 * The project sections of the Beranda side column, from one read of the registrations and
 * submissions. They fail on their own: a retry here leaves everything else alone.
 */
export function ProjectRows({
  store,
  assignments,
}: {
  store?: SubmissionStore;
  /** Replaces the class hand-in store in tests. */
  assignments?: AssignmentStore;
}) {
  const my = useMyProjects(undefined, store);
  return (
    <>
      <Attention my={my} />
      <RunningClassesRow store={assignments} />
      <MyProjectsRow my={my} />
    </>
  );
}
