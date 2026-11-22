"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { versionSizeText } from "../submission-text";
import { StatusSubmission } from "@/components/ui/status-submission";
import { TextLink } from "@/components/ui/text-link";
import { STUDIO_HREF } from "@/features/app-shell/nav";
import { fill } from "@/features/studio/copy/fill";
import { useLocale, useT } from "@/lib/i18n/provider";
import { projectHref } from "../project-model";
import { sentAtText } from "../submission-text";
import type { Submission } from "../submission-types";
import type { Project } from "../types";
import { SubmitShell } from "./submit-states";
import { MilestoneHero } from "./milestone-hero";

/** After sending: what was frozen, and where to go next. One filled button. */
export function SubmitDone({
  project,
  submission,
  canSendMore,
  onSendMore,
}: {
  project: Project;
  submission: Submission;
  canSendMore: boolean;
  onSendMore: () => void;
}) {
  const t = useT().projectsFlow;
  const locale = useLocale();
  const version = submission.versions[0];
  return (
    <SubmitShell slug={project.slug}>
      <MilestoneHero
        project={project}
        title={t.submit.done.title}
        celebrate
        actions={
          <>
            <ButtonLink href={projectHref(project.slug)}>{t.common.viewProject}</ButtonLink>
            {canSendMore && (
              <Button variant="secondary" onClick={onSendMore}>
                {t.submit.done.more}
              </Button>
            )}
            <TextLink href={STUDIO_HREF} className="text-sm text-ink-muted">
              {t.submit.done.studio}
            </TextLink>
          </>
        }
      >
        <p className="text-base wrap-anywhere">
          {submission.title} · {project.title}
        </p>
        <StatusSubmission status={submission.status} />
        <p className="text-sm text-ink-soft">
          {fill(t.submit.done.frozen, {
            what: version?.file ? t.submit.done.fileWhat : t.submit.done.docWhat,
            size: versionSizeText(version, locale),
            at: sentAtText(version?.frozenAt ?? submission.submittedAt, locale),
          })}
        </p>
      </MilestoneHero>
    </SubmitShell>
  );
}
