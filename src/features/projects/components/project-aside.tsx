"use client";

import type { ComponentProps, ReactNode } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
import type { Locale } from "@/lib/i18n/config";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { SignInButton } from "@/features/account/components/auth-buttons";
import { daysLeftLabel, feeLines, formatProjectDate } from "../project-model";
import { deadlineText, quotaText } from "../project-text";
import { projectAction, type ProjectAction } from "../project-action";
import { resultsHref } from "../lomba/contest-model";
import { CancelRegistration } from "./cancel-registration";
import { registerHref } from "../registration-model";
import type { Project, ProjectState, Registration } from "../types";

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="text-sm wrap-anywhere">{children}</dd>
    </div>
  );
}

/** The one button: a link when it can be used, "Masuk" for a guest on an open project, else off. */
function ActionButton({ action, signIn }: { action: ProjectAction; signIn: boolean }) {
  if (action.enabled) {
    return (
      <ButtonLink href={action.href} className="w-full">
        {action.label}
      </ButtonLink>
    );
  }
  if (signIn) return <SignInButton className="w-full">{action.label}</SignInButton>;
  return (
    <Button disabled className="w-full">
      {action.label}
    </Button>
  );
}

function OwnRegistration({
  project,
  registration,
  stores,
}: {
  project: Project;
  registration?: Registration;
  stores?: Props["stores"];
}) {
  const t = useT().projectsCatalog.aside;
  const locale = useLocale();
  return (
    <>
      {registration && (
        <>
          <p className="text-xs text-ink-muted">
            {registrationNote(project, registration, t, locale)}
          </p>
          <TextLink href={registerHref(project.slug)} className="text-xs text-ink-muted">
            {t.viewRegistration}
          </TextLink>
        </>
      )}
      <CancelRegistration project={project} registration={registration} showNotice {...stores} />
    </>
  );
}

type Props = {
  project: Project;
  state: ProjectState;
  now: number;
  guest: boolean;
  /** Your own registration, when signed in and you have one. */
  registration?: Registration;
  /** Works this reader sent here that still count against the limit. */
  sentCount?: number | null;
  /** Replace the device's stores in tests. */
  stores?: Pick<ComponentProps<typeof CancelRegistration>, "submissions" | "assignments">;
};

function registrationNote(
  project: Project,
  registration: Registration,
  t: ReturnType<typeof useT>["projectsCatalog"]["aside"],
  locale: Locale,
): string {
  const pack = registration.packageName
    ? format(t.packageNote, { name: registration.packageName })
    : "";
  const date = formatProjectDate(registration.registeredAt, project.timeZone, locale);
  return registration.status === "terdaftar"
    ? `${format(t.registeredOn, { date })}${pack}`
    : `${t.awaitingPayment}${pack}`;
}

/**
 * Right column of the project page (DESIGN.md 6.7): fee, quota, deadline, and the one action for
 * the state: Daftar leads to the registration page; everything else is a disabled button that
 * says why (your own registration, full, closed, guest). Below lg the column moves above the
 * document so the action stays reachable.
 */
export function ProjectAside({
  project,
  state,
  now,
  guest,
  registration,
  sentCount = 0,
  stores,
}: Props) {
  const t = useT().projectsCatalog;
  const locale = useLocale();
  const action = projectAction({ project, state, guest, registration, now, sentCount, locale });
  const lines = feeLines(project, locale);
  const quota = project.quota;
  const open = state === "buka" || state === "segera-tutup";

  return (
    <aside aria-label={t.aside.label} className="grid content-start gap-5 border border-line p-5">
      <dl className="grid gap-4">
        <Fact label={project.block.kind === "solo" ? t.aside.feePackage : t.aside.fee}>
          {lines.length === 0 ? (
            t.fee.free
          ) : (
            <span className="grid">
              {project.block.kind === "solo" && (
                <span className="text-ink-muted">{t.fee.startingFrom}</span>
              )}
              {lines.map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </span>
          )}
        </Fact>
        <Fact label={t.quota.label}>
          {quota ? (
            <span className="grid gap-2">
              <span>{quotaText(project, locale)}</span>
              <span aria-hidden className="block h-1 bg-line">
                <span
                  className="block h-1 bg-ink"
                  style={{
                    width: `${quota.total > 0 ? Math.min(100, (quota.taken / quota.total) * 100) : 100}%`,
                  }}
                />
              </span>
            </span>
          ) : (
            t.quota.none
          )}
        </Fact>
        <Fact label={t.aside.label}>
          <span className="grid">
            <span>{deadlineText(project, state, locale)}</span>
            {open && project.closesAt !== null && (
              <span className="text-ink-muted">
                {daysLeftLabel(project.closesAt, now, project.timeZone, locale)}
              </span>
            )}
          </span>
        </Fact>
        {action.sentLine && <Fact label={t.aside.sent}>{action.sentLine}</Fact>}
      </dl>
      <div className="grid gap-2">
        <ActionButton action={action} signIn={guest && open} />
        {project.block.kind === "lomba" && (
          <TextLink href={resultsHref(project.slug)} className="w-fit text-sm text-ink-muted">
            {t.aside.results}
          </TextLink>
        )}
        {!guest && (
          <OwnRegistration project={project} registration={registration} stores={stores} />
        )}
      </div>
    </aside>
  );
}
