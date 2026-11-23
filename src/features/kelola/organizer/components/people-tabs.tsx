"use client";

import { EmptyState } from "@/components/ui/states";
import { format, useT } from "@/lib/i18n/provider";
import { useFormat } from "@/lib/i18n/use-format";
import { versionSizeText } from "@/features/projects/submission-text";
import { StatusSubmission } from "@/components/ui/status-submission";
import { formatProjectDateTime } from "@/features/projects/project-model";
import { paymentState } from "@/features/projects/payment-model";
import type { Submission } from "@/features/projects/submission-types";
import type { Project, Registration } from "@/features/projects/types";
import { listCardClass } from "../../components/list-card";

/**
 * Who registered. Registrations exist only on this device for now, so the list is honest: at most
 * the one made here, never invented people.
 */
export function ParticipantsTab({
  project,
  registration,
  now,
}: {
  project: Project;
  registration: Registration | undefined;
  now: number;
}) {
  const t = useT().kelolaOrganizer.people;
  const f = useFormat();
  return (
    <section aria-labelledby="peserta-title" className="grid max-w-170 gap-4">
      <h2 id="peserta-title" className="heading-md">
        {t.participantsTitle}
      </h2>
      <p className="text-sm text-ink-muted">{t.participantsNote}</p>
      {!registration ? (
        <EmptyState>{t.participantsEmpty}</EmptyState>
      ) : (
        <ul className={listCardClass}>
          <li className="grid gap-1 border-b border-line py-3">
            <span className="font-medium">{t.registrant}</span>
            <span className="text-sm text-ink-muted">
              {paymentState(registration, now) === "lunas" || registration.status === "terdaftar"
                ? t.registered
                : t.waiting}{" "}
              · {formatProjectDateTime(registration.registeredAt, project.timeZone, f.locale)}
              {registration.packageName
                ? ` · ${format(t.package, { name: registration.packageName })}`
                : ""}
            </span>
            <span className="text-xs text-ink-muted">
              {format(t.terms, { version: registration.termsVersion })}
              {registration.termsVersion !== project.terms.version &&
                format(t.termsNow, { version: project.terms.version })}
            </span>
          </li>
        </ul>
      )}
    </section>
  );
}

/** The work sent to the project, read-only. Reviewing happens in the Editor, Mentor and Judge areas. */
export function WorksTab({ project, works }: { project: Project; works: Submission[] }) {
  const t = useT().kelolaOrganizer.people;
  const f = useFormat();
  return (
    <section aria-labelledby="kiriman-title" className="grid max-w-170 gap-4">
      <h2 id="kiriman-title" className="heading-md">
        {t.worksTitle}
      </h2>
      {works.length === 0 ? (
        <EmptyState>{t.worksEmpty}</EmptyState>
      ) : (
        <ul aria-label={t.worksList} className={listCardClass}>
          {works.map((work) => (
            <li
              key={work.id}
              className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-line py-3"
            >
              <span className="grid min-w-0 gap-0.5">
                <span className="font-medium wrap-anywhere">{work.title}</span>
                <span className="text-xs text-ink-muted">
                  {formatProjectDateTime(work.submittedAt, project.timeZone, f.locale)} ·{" "}
                  {versionSizeText(work.versions.at(-1), f.locale)}
                </span>
              </span>
              <StatusSubmission status={work.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
