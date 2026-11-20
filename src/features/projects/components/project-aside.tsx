import type { ComponentProps, ReactNode } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
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
  return (
    <>
      {registration && (
        <>
          <p className="text-xs text-ink-muted">{registrationNote(project, registration)}</p>
          <TextLink href={registerHref(project.slug)} className="text-xs text-ink-muted">
            Lihat pendaftaran
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

function registrationNote(project: Project, registration: Registration): string {
  const pack = registration.packageName ? ` Paket ${registration.packageName}.` : "";
  return registration.status === "terdaftar"
    ? `Terdaftar pada ${formatProjectDate(registration.registeredAt, project.timeZone)}.${pack}`
    : `Menunggu pembayaran; kuotamu ditahan.${pack}`;
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
  const action = projectAction({ project, state, guest, registration, now, sentCount });
  const lines = feeLines(project);
  const quota = project.quota;
  const open = state === "buka" || state === "segera-tutup";

  return (
    <aside aria-label="Pendaftaran" className="grid content-start gap-5 border border-line p-5">
      <dl className="grid gap-4">
        <Fact label={project.block.kind === "solo" ? "Biaya paket" : "Biaya"}>
          {lines.length === 0 ? (
            "Gratis"
          ) : (
            <span className="grid">
              {project.block.kind === "solo" && <span className="text-ink-muted">Mulai dari</span>}
              {lines.map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </span>
          )}
        </Fact>
        <Fact label="Kuota">
          {quota ? (
            <span className="grid gap-2">
              <span>{quotaText(project)}</span>
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
            "Tanpa kuota"
          )}
        </Fact>
        <Fact label="Pendaftaran">
          <span className="grid">
            <span>{deadlineText(project, state)}</span>
            {open && project.closesAt !== null && (
              <span className="text-ink-muted">
                {daysLeftLabel(project.closesAt, now, project.timeZone)}
              </span>
            )}
          </span>
        </Fact>
        {action.sentLine && <Fact label="Karya terkirim">{action.sentLine}</Fact>}
      </dl>
      <div className="grid gap-2">
        <ActionButton action={action} signIn={guest && open} />
        {project.block.kind === "lomba" && (
          <TextLink href={resultsHref(project.slug)} className="w-fit text-sm text-ink-muted">
            Lihat hasil lomba
          </TextLink>
        )}
        {!guest && (
          <OwnRegistration project={project} registration={registration} stores={stores} />
        )}
      </div>
    </aside>
  );
}
