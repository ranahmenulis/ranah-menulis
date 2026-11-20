import { EmptyState } from "@/components/ui/states";
import { versionSizeText } from "@/features/projects/submission-text";
import { StatusSubmission } from "@/components/ui/status-submission";
import { formatProjectDateTime } from "@/features/projects/project-model";
import { paymentState } from "@/features/projects/payment-model";
import type { Submission } from "@/features/projects/submission-types";
import type { Project, Registration } from "@/features/projects/types";

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
  return (
    <section aria-labelledby="peserta-title" className="grid max-w-170 gap-4">
      <h2 id="peserta-title" className="heading-md">
        Peserta
      </h2>
      <p className="text-sm text-ink-muted">
        Hanya pendaftaran di perangkat ini yang terbaca. Daftar lengkap datang bersama server.
      </p>
      {!registration ? (
        <EmptyState>Belum ada pendaftar di perangkat ini.</EmptyState>
      ) : (
        <ul className="border-t border-line">
          <li className="grid gap-1 border-b border-line py-3">
            <span className="font-medium">Pendaftar di perangkat ini</span>
            <span className="text-sm text-ink-muted">
              {paymentState(registration, now) === "lunas" || registration.status === "terdaftar"
                ? "Terdaftar"
                : "Menunggu pembayaran"}{" "}
              · {formatProjectDateTime(registration.registeredAt, project.timeZone)}
              {registration.packageName ? ` · Paket ${registration.packageName}` : ""}
            </span>
            <span className="text-xs text-ink-muted">
              Menyetujui ketentuan {registration.termsVersion}
              {registration.termsVersion !== project.terms.version &&
                `, sekarang ${project.terms.version}`}
            </span>
          </li>
        </ul>
      )}
    </section>
  );
}

/** The work sent to the project, read-only. Reviewing happens in the Editor, Mentor and Judge areas. */
export function WorksTab({ project, works }: { project: Project; works: Submission[] }) {
  return (
    <section aria-labelledby="kiriman-title" className="grid max-w-170 gap-4">
      <h2 id="kiriman-title" className="heading-md">
        Kiriman
      </h2>
      {works.length === 0 ? (
        <EmptyState>Belum ada karya yang dikirim ke proyek ini.</EmptyState>
      ) : (
        <ul aria-label="Daftar kiriman" className="border-t border-line">
          {works.map((work) => (
            <li
              key={work.id}
              className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-line py-3"
            >
              <span className="grid min-w-0 gap-0.5">
                <span className="font-medium wrap-anywhere">{work.title}</span>
                <span className="text-xs text-ink-muted">
                  {formatProjectDateTime(work.submittedAt, project.timeZone)} ·{" "}
                  {versionSizeText(work.versions.at(-1))}
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
