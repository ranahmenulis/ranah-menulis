import { Button, ButtonLink } from "@/components/ui/button";
import { versionSizeText } from "../submission-text";
import { StatusSubmission } from "@/components/ui/status-submission";
import { TextLink } from "@/components/ui/text-link";
import { STUDIO_HREF } from "@/features/app-shell/nav";
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
  const version = submission.versions[0];
  return (
    <SubmitShell slug={project.slug}>
      <MilestoneHero
        project={project}
        title="Karyamu terkirim."
        celebrate
        actions={
          <>
            <ButtonLink href={projectHref(project.slug)}>Lihat proyek</ButtonLink>
            {canSendMore && (
              <Button variant="secondary" onClick={onSendMore}>
                Kirim karya lain
              </Button>
            )}
            <TextLink href={STUDIO_HREF} className="text-sm text-ink-muted">
              Kembali ke Studio
            </TextLink>
          </>
        }
      >
        <p className="text-base wrap-anywhere">
          {submission.title} · {project.title}
        </p>
        <StatusSubmission status={submission.status} />
        <p className="text-sm text-ink-soft">
          Yang terkirim adalah salinan beku {version?.file ? "berkasmu" : "dokumenmu"}:{" "}
          {versionSizeText(version)}, dibekukan{" "}
          {sentAtText(version?.frozenAt ?? submission.submittedAt)}. Mengedit dokumen di Studio
          tidak mengubahnya.
        </p>
      </MilestoneHero>
    </SubmitShell>
  );
}
