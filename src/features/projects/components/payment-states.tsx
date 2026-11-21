import { ButtonLink } from "@/components/ui/button";
import { formatProjectDateTime, moneyLabel, projectHref } from "../project-model";
import { idrLabel, paymentDueAt, remainingLabel } from "../payment-model";
import { registerHref, registrationFee } from "../registration-model";
import { kirimHref } from "../submission-model";
import type { Project, Registration } from "../types";
import { RegisterShell } from "./register-states";
import { MilestoneHero } from "./milestone-hero";

/** Placeholder for the QRIS code: the real one comes with the payment service [konfirmasi Q-19]. */
function QrisSample({ amount }: { amount: number }) {
  return (
    <figure className="grid justify-items-center gap-3 border border-line p-6">
      <div
        role="img"
        aria-label="Contoh tampilan kode QRIS, bukan kode asli"
        className="grid size-48 place-items-center border border-dashed border-line-strong p-4 text-center text-sm text-ink-muted"
      >
        Contoh, bukan kode QRIS asli
      </div>
      <figcaption className="text-center text-sm text-ink-muted">
        Jumlah yang dibayar <span className="font-semibold text-ink">{idrLabel(amount)}</span>
      </figcaption>
    </figure>
  );
}

/** The registration waits for payment: how much, until when, and what happens next. */
export function PayWaiting({
  project,
  registration,
  amount,
  now,
}: {
  project: Project;
  registration: Registration;
  amount: number;
  now: number;
}) {
  const due = paymentDueAt(registration);
  return (
    <RegisterShell project={project}>
      <div className="grid gap-3">
        <h1 className="font-serif text-2xl leading-8 font-semibold">Selesaikan pembayaran.</h1>
        <p className="text-base wrap-anywhere">
          {project.title}
          {registration.packageName ? ` · Paket ${registration.packageName}` : ""}
        </p>
        <p className="text-sm text-ink-muted">
          Kuotamu ditahan sampai {formatProjectDateTime(due, project.timeZone)} (
          {remainingLabel(due, now)}). Setelah itu pendaftaran ini berakhir dan kursinya dibuka
          lagi.
        </p>
      </div>
      <QrisSample amount={amount} />
      <p className="text-sm text-ink-muted">
        Pembayaran dikonfirmasi otomatis begitu masuk; halaman ini berubah sendiri.
      </p>
      <ButtonLink href={projectHref(project.slug)} className="justify-self-start">
        Lihat proyek
      </ButtonLink>
    </RegisterShell>
  );
}

/** Paid: the way on depends on whether the project takes work. */
export function PayDone({
  project,
  registration,
}: {
  project: Project;
  registration: Registration;
}) {
  return (
    <RegisterShell project={project}>
      <MilestoneHero
        project={project}
        title="Pembayaran diterima."
        celebrate
        actions={
          project.submission ? (
            <>
              <ButtonLink href={kirimHref(project.slug)}>Kirim karya</ButtonLink>
              <ButtonLink href={projectHref(project.slug)} variant="secondary">
                Lihat proyek
              </ButtonLink>
            </>
          ) : (
            <ButtonLink href={projectHref(project.slug)}>Lihat proyek</ButtonLink>
          )
        }
      >
        <p className="text-base wrap-anywhere">{project.title}</p>
        <p className="text-sm text-ink-soft">
          Kamu sudah terdaftar. Biaya{" "}
          {moneyLabel(registrationFee(project, registration.packageName))}.
        </p>
      </MilestoneHero>
    </RegisterShell>
  );
}

/** The hold ran out: the seat went back, and the way to try again is shown when it is still open. */
export function PayExpired({ project, canRetry }: { project: Project; canRetry: boolean }) {
  return (
    <RegisterShell project={project}>
      <h1 className="font-serif text-2xl leading-8 font-semibold">Waktu pembayaran habis.</h1>
      <p className="text-sm wrap-anywhere text-ink-muted">
        Pendaftaran {project.title} berakhir karena pembayaran belum masuk, dan kuotanya dibuka
        lagi.
        {canRetry ? " Kamu bisa mendaftar lagi selama masih ada kuota." : ""}
      </p>
      {canRetry ? (
        <ButtonLink href={registerHref(project.slug)} className="justify-self-start">
          Daftar lagi
        </ButtonLink>
      ) : (
        <ButtonLink href={projectHref(project.slug)} className="justify-self-start">
          Lihat proyek
        </ButtonLink>
      )}
    </RegisterShell>
  );
}
