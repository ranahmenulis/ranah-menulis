import Link from "next/link";
import { StatusSubmission } from "@/components/ui/status-submission";
import { TextLink } from "@/components/ui/text-link";
import { categoryLabel, formatNumber, formatProjectDate, projectHref } from "../project-model";
import type { MyProject } from "../my-projects";
import { submissionHref } from "../submission-href";
import { kirimHref } from "../submission-model";
import { revisionDueAt } from "../submission-status";
import { sentAtText } from "../submission-text";
import type { Submission } from "../submission-types";
import type { Project } from "../types";

/** The line under a work: how many versions, how long, when it was sent, and what is due. */
function workMeta(work: Submission, project: Project): string {
  const last = work.versions.at(-1);
  const parts = [
    work.versions.length > 1 ? `Versi ${work.versions.length}` : null,
    `${formatNumber(last?.wordCount ?? 0)} kata`,
    `dikirim ${sentAtText(work.submittedAt)}`,
  ];
  const due = revisionDueAt(work);
  if (due !== null) parts.push(`tenggat revisi ${formatProjectDate(due, project.timeZone)}`);
  return parts.filter(Boolean).join(" · ");
}

/** What a registration with no work says, and the way on when there is one. */
function EmptyLine({ row }: { row: MyProject }) {
  const { project, registration } = row;
  if (!project.submission) {
    return (
      <p className="text-sm text-ink-muted">
        Tugas kelas dikumpulkan di halaman kelas, yang menyusul.
      </p>
    );
  }
  if (registration.status !== "terdaftar") {
    return <p className="text-sm text-ink-muted">Karya bisa dikirim setelah pembayaran selesai.</p>;
  }
  return (
    <p className="text-sm text-ink-muted">
      Belum ada karya terkirim.{" "}
      <TextLink href={kirimHref(project.slug)} className="text-ink underline">
        Kirim karya
      </TextLink>
    </p>
  );
}

/**
 * One project you joined, with its works (PRD 17.5). A project with no work shows the state of the
 * registration, not a submission status, so the two are never mixed up (DESIGN.md 7.4).
 */
export function MyProjectGroup({ row }: { row: MyProject }) {
  const { project, registration, works } = row;
  return (
    <section
      aria-labelledby={`saya-${project.slug}`}
      className="grid gap-3 border-b border-line py-5"
    >
      <div className="grid gap-1">
        <p className="text-xs text-ink-muted">
          {categoryLabel(project.category)} ·{" "}
          {registration.status === "terdaftar" ? "Terdaftar" : "Menunggu pembayaran"}
        </p>
        <h2 id={`saya-${project.slug}`} className="feed-title wrap-anywhere">
          <Link href={projectHref(project.slug)} className="text-ink no-underline hover:underline">
            {project.title}
          </Link>
        </h2>
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
                <p className="text-xs wrap-anywhere text-ink-muted">{workMeta(work, project)}</p>
              </div>
              <StatusSubmission status={work.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
