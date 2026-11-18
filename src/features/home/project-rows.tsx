"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { ErrorBanner, RetryButton } from "@/components/ui/states";
import { StatusSubmission } from "@/components/ui/status-submission";
import { TextLink } from "@/components/ui/text-link";
import { cn } from "@/lib/cn";
import { useMyProjects, type MyProjectsData } from "@/features/projects/hooks/use-my-projects";
import type { MyProject } from "@/features/projects/my-projects";
import { paymentItems, revisionItems } from "@/features/projects/my-projects";
import { formatProjectDate, projectHref } from "@/features/projects/project-model";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { MY_PROJECTS_HREF, submissionHref } from "@/features/projects/submission-href";
import { revisionDueAt } from "@/features/projects/submission-status";
import { Row } from "./today-row";

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
  const real: Item[] =
    my.status === "ready"
      ? revisionItems(my.rows).map(({ project, work }) => {
          const due = revisionDueAt(work);
          return {
            key: `revisi-${work.id}`,
            title: `Editor meminta revisi untuk “${work.title}”`,
            meta: `${project.title}${due ? ` · tenggat revisi ${formatProjectDate(due, project.timeZone)}` : ""}`,
            action: { label: "Baca catatan editor", href: submissionHref(work.slug, work.id) },
          };
        })
      : [];
  const paying: Item[] =
    my.status === "ready"
      ? paymentItems(my.rows, my.now).map(({ project, href, remaining }) => ({
          key: `bayar-${project.slug}`,
          title: `Pembayaran ${project.title} menunggu`,
          meta: `Kuotamu ditahan, ${remaining}`,
          action: { label: "Bayar sekarang", href },
        }))
      : [];
  const items = [...real, ...paying];
  if (!items.length) return null;

  return (
    <Row label="Perlu perhatian">
      <ul className="col-span-2 grid gap-4 md:col-span-2">
        {items.map((item, i) => (
          <li
            key={item.key}
            className={cn("flex items-start justify-between gap-4", i > 0 && MORE)}
          >
            <span className="min-w-0 text-sm">
              <b className="font-medium wrap-anywhere">{item.title}</b>
              <span className="mt-0.5 block text-xs wrap-anywhere text-ink-muted">{item.meta}</span>
            </span>
            <ButtonLink
              href={item.action.href}
              variant="text"
              size="sm"
              className="shrink-0 text-ink"
            >
              {item.action.label}
            </ButtonLink>
          </li>
        ))}
        {items.length > 1 && (
          <li className="md:hidden">
            <Button variant="text" size="sm" className="px-0 text-ink" disabled>
              Lihat {items.length - 1} lainnya
            </Button>
          </li>
        )}
      </ul>
    </Row>
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
  const work = featured(row);
  const due = work ? revisionDueAt(work) : null;
  const waiting = row.registration.status !== "terdaftar";
  return (
    <>
      {work ? (
        <StatusSubmission status={work.status} outlineRevisi />
      ) : (
        <span className="inline-flex h-6 items-center text-xs text-ink-muted">
          {waiting ? "Menunggu pembayaran" : "Terdaftar"}
        </span>
      )}
      <span className="min-w-0 text-sm">
        <TextLink
          href={work ? submissionHref(work.slug, work.id) : projectHref(row.project.slug)}
          className="font-medium wrap-anywhere"
        >
          {row.project.title}
        </TextLink>
        <span className="block text-xs wrap-anywhere text-ink-muted">
          {work ? `“${work.title}”` : "Belum ada karya terkirim"}
          {due !== null && ` · tenggat revisi ${formatProjectDate(due, row.project.timeZone)}`}
        </span>
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
  if (my.status === "error") {
    return (
      <Row label="Proyek saya">
        <ErrorBanner className="col-span-full" action={<RetryButton onClick={my.reload} />}>
          Proyek saya gagal dimuat. Bagian lain di Beranda tetap bisa dipakai.
        </ErrorBanner>
      </Row>
    );
  }
  if (my.status !== "ready" || my.rows.length === 0) return null;
  return (
    <Row label="Proyek saya">
      <ul className="grid gap-3 max-md:col-span-2">
        {my.rows.slice(0, 2).map((row, i) => (
          <li key={row.project.slug} className={cn("flex items-start gap-3", i > 0 && MORE)}>
            <ProjectLine row={row} />
          </li>
        ))}
      </ul>
      <ButtonLink
        href={MY_PROJECTS_HREF}
        variant="text"
        size="sm"
        className="px-0 text-ink max-md:col-span-2 max-md:justify-self-start"
      >
        Lihat semua
      </ButtonLink>
    </Row>
  );
}

/**
 * Both project rows of "Hari ini", from one read of the registrations and submissions. They fail
 * together, but only this part of Beranda: a retry here leaves everything else alone.
 */
export function ProjectRows({ store }: { store?: SubmissionStore }) {
  const my = useMyProjects(undefined, store);
  return (
    <>
      <Attention my={my} />
      <MyProjectsRow my={my} />
    </>
  );
}
