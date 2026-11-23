"use client";

import { Notice } from "@/components/ui/states";
import { useT } from "@/lib/i18n/provider";
import type { SoloStore } from "@/features/projects/solo/storage/solo-store";
import type { Submission } from "@/features/projects/submission-types";
import type { Project, Registration } from "@/features/projects/types";
import { ContestStagePanel } from "./contest-stage-panel";
import { SoloStageList } from "./solo-stage-list";

/** Only Solo (the production of a book) and Lomba (judging and announcements) have stages. */
export const hasStages = (project: Project): boolean =>
  project.category === "solo" || project.category === "lomba";

/** The stages of the project, run by its Organizer (PRD 17.6: "update tahap produksi"). */
export function StageTab({
  project,
  works,
  registration,
  now,
  soloStore,
}: {
  project: Project;
  works: Submission[];
  registration: Registration | undefined;
  now: number;
  soloStore?: SoloStore;
}) {
  const t = useT().kelolaOrganizer;
  if (project.category === "lomba")
    return <ContestStagePanel project={project} now={now} works={works} />;
  if (project.category !== "solo") {
    return <Notice>{t.stage.none}</Notice>;
  }
  return (
    <section aria-labelledby="tahap-title" className="grid max-w-170 gap-4">
      <h2 id="tahap-title" className="heading-md">
        {t.stage.title}
      </h2>
      <SoloStageList
        project={project}
        works={works}
        registration={registration}
        store={soloStore}
      />
    </section>
  );
}
