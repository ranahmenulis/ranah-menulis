"use client";

import { useRef } from "react";
import { Notice } from "@/components/ui/states";
import { ME_ID } from "@/features/community/fixtures/authors";
import { MyShell, MySkeleton } from "../../components/my-states";
import { ProjectGone } from "../../components/projects-states";
import { categoryLabel, projectHref } from "../../project-model";
import type { SubmissionStore } from "../../storage/submission-store";
import type { ProjectFixture } from "../../types";
import { stageRank, stageLabel } from "../contest-model";
import { useContest } from "../hooks/use-contest";
import { stageSentence } from "../results-text";
import type { ContestResults } from "../types";
import { DevOrganizerPanel } from "./dev-organizer-panel";
import { ResultsLists } from "./results-lists";
import { ResultsCriteria, ResultsSchedule } from "./results-sections";

type Props = {
  slug: string;
  /** Replace the dummy catalog, the results and the device store in tests. */
  source?: ProjectFixture[];
  results?: ContestResults[];
  store?: SubmissionStore;
};

/**
 * Halaman hasil lomba (LMB-02, PRD 17.5): public, so a guest sees it too. Where the contest stands
 * and when the next announcement is, the criteria, then the finalists and winners once announced.
 * An unknown address, a draft and a project that is not a contest are all "not found".
 */
export function ResultsView({ slug, source, results, store }: Props) {
  const data = useContest(slug, { source, results, store });
  const titleRef = useRef<HTMLHeadingElement>(null);

  if (data.status === "loading") return <MySkeleton label="Memuat hasil lomba" />;
  if (data.status === "gone") return <ProjectGone />;

  const { project, stage, mine, hasWork } = data;
  const own =
    mine && stageRank(stage) >= stageRank("finalis")
      ? { title: mine.title, genre: mine.genre, authorId: ME_ID }
      : null;

  return (
    <MyShell back={{ href: projectHref(slug), label: "Kembali ke proyek" }}>
      <header className="grid gap-2">
        <p className="text-xs text-ink-muted">
          Hasil {categoryLabel(project.category).toLowerCase()}
        </p>
        <h1 ref={titleRef} tabIndex={-1} className="heading-lg wrap-anywhere outline-none">
          {project.title}
        </h1>
        <p className="text-sm font-medium">{stageLabel[stage]}</p>
        <p className="text-sm text-ink-muted">{stageSentence(project, stage)}</p>
      </header>
      {own && <Notice>Karyamu “{own.title}” masuk finalis.</Notice>}
      <ResultsLists project={project} stage={stage} results={data.results} mine={own} />
      <ResultsSchedule project={project} stage={stage} />
      <ResultsCriteria project={project} />
      <DevOrganizerPanel
        slug={slug}
        stage={stage}
        hasWork={hasWork}
        isFinalist={mine !== null}
        onDone={() => titleRef.current?.focus()}
      />
    </MyShell>
  );
}
