"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Notice } from "@/components/ui/states";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import {
  announcementDates,
  contestStage,
  stageRank,
} from "@/features/projects/lomba/contest-model";
import { advanceContest, useContestOverrides } from "@/features/projects/lomba/stage-store";
import type { ContestStage } from "@/features/projects/lomba/types";
import { formatProjectDate } from "@/features/projects/project-model";
import { JudgingControls } from "./judging-controls";
import { ResultsEditor } from "./results-editor";
import type { Submission } from "@/features/projects/submission-types";
import type { Project } from "@/features/projects/types";
import { FlagCheckered } from "@phosphor-icons/react/dist/ssr";
import { cardClass } from "@/components/ui/card";
import { SectionIcon } from "@/components/ui/section-card";
import { cn } from "@/lib/cn";

const STEPS: { stage: Exclude<ContestStage, "terbuka"> }[] = [
  { stage: "dinilai" },
  { stage: "finalis" },
  { stage: "pemenang" },
];

/**
 * The stages of a contest (LMB-02). An announcement is never taken back (PRD 17.5), so the only
 * move is forward and the dialog says so. The result is said beside the button, because the button
 * for that step is gone afterwards. Who the finalists and winners are comes from the Juri (6g-4).
 */
export function ContestStagePanel({
  project,
  now,
  works = [],
}: {
  project: Project;
  now: number;
  /** The non-draft works of the project, for the results below. */
  works?: Submission[];
}) {
  const t = useT().kelolaOrganizerTabs;
  const stageLabel = useT().projectsContest.stageLabel;
  const locale = useLocale();
  const overrides = useContestOverrides();
  const stage = contestStage(project, now, overrides[project.slug]?.stage);
  const next = STEPS.filter((s) => stageRank(s.stage) > stageRank(stage));
  const [asking, setAsking] = useState<(typeof STEPS)[number] | null>(null);
  const [said, setSaid] = useState("");
  const line = useRef<HTMLParagraphElement>(null);
  const dates = announcementDates(project);

  function confirm(step: (typeof STEPS)[number]) {
    advanceContest(project.slug, step.stage);
    setAsking(null);
    setSaid(format(t.contest.done, { label: t.contest.steps[step.stage].label }));
    requestAnimationFrame(() => line.current?.focus());
  }

  return (
    <section aria-labelledby="tahap-title" className="grid max-w-170 gap-4">
      <div className={cn(cardClass, "grid gap-4")}>
        <h2 id="tahap-title" className="flex items-center gap-2.5 heading-md">
          <SectionIcon icon={FlagCheckered} />
          {t.contest.title}
        </h2>
        <p className="text-sm">
          {t.contest.now} <b className="font-medium">{stageLabel[stage]}</b>
        </p>
        <p className="text-xs text-ink-muted">
          {format(t.contest.schedule, {
            finalists:
              dates.finalists === null
                ? t.contest.noDate
                : formatProjectDate(dates.finalists, project.timeZone, locale),
            winners:
              dates.winners === null
                ? t.contest.noDate
                : formatProjectDate(dates.winners, project.timeZone, locale),
          })}
        </p>
        <p ref={line} tabIndex={-1} role="status" className="min-h-5 text-sm outline-none">
          {said}
        </p>
        {next.length === 0 ? (
          <Notice>{t.contest.ended}</Notice>
        ) : (
          <div className="flex flex-wrap gap-2">
            {next.map((step, i) => (
              <Button
                key={step.stage}
                variant={i === 0 ? "secondary" : "text"}
                onClick={() => setAsking(step)}
              >
                {t.contest.steps[step.stage].label}
              </Button>
            ))}
          </div>
        )}
      </div>
      <JudgingControls slug={project.slug} stage={stage} />
      <ResultsEditor project={project} stage={stage} works={works} />
      {asking && (
        <Dialog
          open
          onClose={() => setAsking(null)}
          role="alertdialog"
          title={`${t.contest.steps[asking.stage].label}?`}
          description={`${t.contest.steps[asking.stage].body} ${t.contest.irreversible}`}
          actions={
            <>
              <Button variant="secondary" onClick={() => setAsking(null)}>
                {t.common.cancel}
              </Button>
              <Button onClick={() => confirm(asking)}>{t.contest.steps[asking.stage].label}</Button>
            </>
          }
        />
      )}
    </section>
  );
}
