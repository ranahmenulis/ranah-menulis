import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Notice, Skeleton } from "@/components/ui/states";
import { TextLink } from "@/components/ui/text-link";
import { formatProjectDate, moneyLabel, projectHref } from "../project-model";
import { registrationFee } from "../registration-model";
import type { Project, Registration } from "../types";

/** One column of 680 with the way back always on top (every full-width screen needs an exit). */
export function RegisterShell({ project, children }: { project: Project; children: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-170 gap-6">
      <TextLink
        href={projectHref(project.slug)}
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <span aria-hidden>←</span>
        Kembali ke proyek
      </TextLink>
      {children}
    </div>
  );
}

/** Shape of the page, shown only if loading takes more than 300ms (DESIGN.md 8). */
export function RegisterSkeleton() {
  return (
    <div
      role="status"
      aria-label="Memuat pendaftaran"
      className="mx-auto grid max-w-170 animate-[rm-appear_0s_300ms_forwards] gap-4 opacity-0"
    >
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-10 w-3/4" />
      {[0, 1].map((i) => (
        <div key={i} className="mt-4 grid gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}

/** Why the form is not offered: a guest, a full project, a closed one. The way back stays. */
export function RegisterBlocked({ project, children }: { project: Project; children: ReactNode }) {
  return (
    <RegisterShell project={project}>
      <h1 className="heading-lg wrap-anywhere">{project.title}</h1>
      <Notice>{children}</Notice>
      <ButtonLink
        href={projectHref(project.slug)}
        variant="secondary"
        className="justify-self-start"
      >
        Lihat proyek
      </ButtonLink>
    </RegisterShell>
  );
}

function statusTitle(registration: Registration, justNow: boolean): string {
  if (registration.status === "menunggu-pembayaran") return "Pendaftaranmu menunggu pembayaran.";
  return justNow ? "Kamu terdaftar." : "Kamu sudah terdaftar.";
}

/** Your registration: shown right after submitting, and whenever you come back to this page. */
export function RegisterStatus({
  project,
  registration,
  justNow,
}: {
  project: Project;
  registration: Registration;
  justNow: boolean;
}) {
  const confirmed = registration.status === "terdaftar";
  const fee = moneyLabel(registrationFee(project, registration.packageName));

  return (
    <RegisterShell project={project}>
      <div className="grid gap-3">
        <h1 className="font-serif text-2xl leading-8 font-semibold">
          {statusTitle(registration, justNow)}
        </h1>
        <p className="text-base wrap-anywhere">
          {project.title}
          {registration.packageName ? ` · Paket ${registration.packageName}` : ""}
        </p>
        <p className="text-sm text-ink-muted">
          Terdaftar pada {formatProjectDate(registration.registeredAt, project.timeZone)}. Ketentuan
          versi {registration.termsVersion} disetujui.
        </p>
        {!confirmed && (
          <p className="text-sm text-ink-muted">
            Biaya {fee}. Cara pembayaran belum tersedia; pendaftaranmu tercatat dan kuota belum
            terisi.
          </p>
        )}
      </div>
      <ButtonLink href={projectHref(project.slug)} className="justify-self-start">
        Lihat proyek
      </ButtonLink>
    </RegisterShell>
  );
}
