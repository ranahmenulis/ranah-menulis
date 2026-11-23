"use client";

import { ButtonLink } from "@/components/ui/button";
import { cardClass } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { fill } from "@/features/studio/copy/fill";
import { useLocale, useT } from "@/lib/i18n/provider";
import { formatProjectDateTime, moneyLabel, projectHref } from "../project-model";
import { idrLabel, paymentDueAt, remainingLabel } from "../payment-model";
import { registerHref, registrationFee } from "../registration-model";
import { kirimHref } from "../submission-model";
import type { Project, Registration } from "../types";
import { RegisterShell } from "./register-states";
import { MilestoneHero } from "./milestone-hero";
import { ProjectStrip } from "./project-strip";

/** Placeholder for the QRIS code: the real one comes with the payment service [konfirmasi Q-19]. */
function QrisSample({ amount }: { amount: number }) {
  const t = useT().projectsFlow.payment.waiting;
  const locale = useLocale();
  return (
    <figure className={cn(cardClass, "grid justify-items-center gap-3")}>
      <div
        role="img"
        aria-label={t.qrisAlt}
        className="grid size-48 place-items-center rounded-xl border-2 border-dashed border-accent/40 bg-accent-subtle/50 p-4 text-center text-sm text-ink-muted"
      >
        {t.qrisSample}
      </div>
      <figcaption className="text-center text-sm text-ink-muted">
        {t.amount} <span className="font-semibold text-ink">{idrLabel(amount, locale)}</span>
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
  const t = useT().projectsFlow;
  const locale = useLocale();
  const due = paymentDueAt(registration);
  return (
    <RegisterShell project={project}>
      <ProjectStrip project={project} />
      <div className="grid gap-3">
        <h1 className="font-serif text-2xl leading-8 font-semibold">{t.payment.waiting.title}</h1>
        {registration.packageName && (
          <p className="text-base wrap-anywhere">
            {fill(t.payment.waiting.package, { name: registration.packageName })}
          </p>
        )}
        <p className="text-sm text-ink-muted">
          {fill(t.payment.waiting.hold, {
            until: formatProjectDateTime(due, project.timeZone, locale),
            remaining: remainingLabel(due, now, locale),
          })}
        </p>
      </div>
      <QrisSample amount={amount} />
      <p className="text-sm text-ink-muted">{t.payment.waiting.auto}</p>
      <ButtonLink href={projectHref(project.slug)} className="justify-self-start">
        {t.common.viewProject}
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
  const t = useT().projectsFlow;
  const locale = useLocale();
  return (
    <RegisterShell project={project}>
      <MilestoneHero
        project={project}
        title={t.payment.done.title}
        celebrate
        actions={
          project.submission ? (
            <>
              <ButtonLink href={kirimHref(project.slug)}>{t.common.sendWork}</ButtonLink>
              <ButtonLink href={projectHref(project.slug)} variant="secondary">
                {t.common.viewProject}
              </ButtonLink>
            </>
          ) : (
            <ButtonLink href={projectHref(project.slug)}>{t.common.viewProject}</ButtonLink>
          )
        }
      >
        <p className="text-base wrap-anywhere">{project.title}</p>
        <p className="text-sm text-ink-soft">
          {fill(t.payment.done.body, {
            fee: moneyLabel(registrationFee(project, registration.packageName), locale),
          })}
        </p>
      </MilestoneHero>
    </RegisterShell>
  );
}

/** The hold ran out: the seat went back, and the way to try again is shown when it is still open. */
export function PayExpired({ project, canRetry }: { project: Project; canRetry: boolean }) {
  const t = useT().projectsFlow;
  return (
    <RegisterShell project={project}>
      <ProjectStrip project={project} />
      <h1 className="font-serif text-2xl leading-8 font-semibold">{t.payment.expired.title}</h1>
      <p className="text-sm wrap-anywhere text-ink-muted">
        {fill(t.payment.expired.body, { title: project.title })}
        {canRetry ? t.payment.expired.retry : ""}
      </p>
      {canRetry ? (
        <ButtonLink href={registerHref(project.slug)} className="justify-self-start">
          {t.payment.expired.again}
        </ButtonLink>
      ) : (
        <ButtonLink href={projectHref(project.slug)} className="justify-self-start">
          {t.common.viewProject}
        </ButtonLink>
      )}
    </RegisterShell>
  );
}
