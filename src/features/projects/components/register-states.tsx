"use client";

import type { ComponentProps, ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Notice, Skeleton } from "@/components/ui/states";
import { TextLink } from "@/components/ui/text-link";
import { fill } from "@/features/studio/copy/fill";
import { useLocale, useT } from "@/lib/i18n/provider";
import { SignInButton } from "@/features/account/components/auth-buttons";
import { payHref } from "../payment-model";
import { formatProjectDate, moneyLabel, projectHref } from "../project-model";
import { registrationFee } from "../registration-model";
import { kirimHref } from "../submission-model";
import { CancelRegistration } from "./cancel-registration";
import type { Project, Registration } from "../types";
import { MilestoneHero } from "./milestone-hero";
import { ProjectStrip } from "./project-strip";

/** One column of 680 with the way back always on top (every full-width screen needs an exit). */
export function RegisterShell({ project, children }: { project: Project; children: ReactNode }) {
  const t = useT().projectsFlow.common;
  return (
    <div className="mx-auto grid max-w-170 gap-6">
      <TextLink
        href={projectHref(project.slug)}
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <span aria-hidden>←</span>
        {t.backToProject}
      </TextLink>
      {children}
    </div>
  );
}

/** Shape of the page, shown only if loading takes more than 300ms (DESIGN.md 8). */
export function RegisterSkeleton() {
  const t = useT().projectsFlow.register;
  return (
    <div
      role="status"
      aria-label={t.loading}
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
export function RegisterBlocked({
  project,
  children,
  signIn = false,
}: {
  project: Project;
  children: ReactNode;
  /** A guest can fix this by signing in, so the way to do that comes first. */
  signIn?: boolean;
}) {
  const t = useT().projectsFlow.common;
  return (
    <RegisterShell project={project}>
      <ProjectStrip project={project} titleAs="h1" />
      <Notice>{children}</Notice>
      {signIn && <SignInButton className="justify-self-start">{t.signIn}</SignInButton>}
      <ButtonLink
        href={projectHref(project.slug)}
        variant="secondary"
        className="justify-self-start"
      >
        {t.viewProject}
      </ButtonLink>
    </RegisterShell>
  );
}

function statusTitle(
  registration: Registration,
  justNow: boolean,
  t: ReturnType<typeof useT>["projectsFlow"]["register"]["status"],
): string {
  if (registration.status === "menunggu-pembayaran") return t.waiting;
  return justNow ? t.justNow : t.already;
}

/** Your registration: shown right after submitting, and whenever you come back to this page. */
export function RegisterStatus({
  project,
  registration,
  justNow,
  onCancelled,
  stores,
}: {
  project: Project;
  registration: Registration;
  justNow: boolean;
  onCancelled?: () => void;
  /** Replace the device's stores in tests. */
  stores?: Pick<ComponentProps<typeof CancelRegistration>, "submissions" | "assignments">;
}) {
  const t = useT().projectsFlow.register.status;
  const locale = useLocale();
  const confirmed = registration.status === "terdaftar";
  const fee = moneyLabel(registrationFee(project, registration.packageName), locale);

  return (
    <RegisterShell project={project}>
      <MilestoneHero
        project={project}
        title={statusTitle(registration, justNow, t)}
        celebrate={justNow && confirmed}
        actions={<RegisterActions project={project} confirmed={confirmed} />}
      >
        <p className="text-base wrap-anywhere">
          {project.title}
          {registration.packageName ? fill(t.package, { name: registration.packageName }) : ""}
        </p>
        <p className="text-sm text-ink-soft">
          {fill(t.registeredOn, {
            date: formatProjectDate(registration.registeredAt, project.timeZone, locale),
            version: String(registration.termsVersion),
          })}
        </p>
        {!confirmed && <p className="text-sm text-ink-soft">{fill(t.feeHold, { fee })}</p>}
      </MilestoneHero>
      <CancelRegistration
        project={project}
        registration={registration}
        onCancelled={onCancelled}
        {...stores}
      />
    </RegisterShell>
  );
}

function RegisterActions({ project, confirmed }: { project: Project; confirmed: boolean }) {
  const t = useT().projectsFlow.common;
  return (
    <>
      {confirmed && project.submission ? (
        <>
          <ButtonLink href={kirimHref(project.slug)}>{t.sendWork}</ButtonLink>
          <ButtonLink href={projectHref(project.slug)} variant="secondary">
            {t.viewProject}
          </ButtonLink>
        </>
      ) : confirmed ? (
        <ButtonLink href={projectHref(project.slug)}>{t.viewProject}</ButtonLink>
      ) : (
        <>
          <ButtonLink href={payHref(project.slug)}>{t.payNow}</ButtonLink>
          <ButtonLink href={projectHref(project.slug)} variant="secondary">
            {t.viewProject}
          </ButtonLink>
        </>
      )}
    </>
  );
}
