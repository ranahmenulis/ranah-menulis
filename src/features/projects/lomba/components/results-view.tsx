"use client";

import { useRef } from "react";
import { Podium } from "@/components/illustrations/podium-art";
import { heroArtClass, heroCardClass } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { Notice } from "@/components/ui/states";
import { format, useLocale, useT } from "@/lib/i18n/provider";
import { ME_ID } from "@/features/community/fixtures/authors";
import { MyShell, MySkeleton } from "../../components/my-states";
import { ProjectGone } from "../../components/projects-states";
import { projectHref } from "../../project-model";
import type { SubmissionStore } from "../../storage/submission-store";
import type { ProjectFixture } from "../../types";
import { stageRank } from "../contest-model";
import { useContest } from "../hooks/use-contest";
import { stageSentence } from "../results-text";
import type { ContestResults } from "../types";
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
  const c = useT().projectsContest;
  const locale = useLocale();
  const data = useContest(slug, { source, results, store });
  const titleRef = useRef<HTMLHeadingElement>(null);

  if (data.status === "loading") return <MySkeleton label={c.loading} />;
  if (data.status === "gone") return <ProjectGone />;

  const { project, stage, mine } = data;
  const own =
    mine && stageRank(stage) >= stageRank("finalis")
      ? { title: mine.title, genre: mine.genre, authorId: ME_ID }
      : null;

  return (
    <MyShell back={{ href: projectHref(slug), label: c.back }}>
      <header className={cn(heroCardClass, "grid justify-items-start gap-3 md:min-h-56")}>
        <Podium
          className={cn(heroArtClass, "max-md:h-[42%] max-md:max-w-[40%] max-md:opacity-50")}
        />
        <p className="rounded-full bg-accent-subtle px-2.5 py-1 text-xs font-semibold text-accent-ink">
          {c.kicker}
        </p>
        <h1
          ref={titleRef}
          tabIndex={-1}
          className="font-serif text-[26px] leading-8 font-semibold text-balance wrap-anywhere outline-none md:max-w-[62%] md:text-[32px] md:leading-10"
        >
          {project.title}
        </h1>
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-accent-ink">
          <span aria-hidden className="size-2 rounded-full bg-accent" />
          {c.stageLabel[stage]}
        </p>
        <p className="text-sm text-ink-soft md:max-w-[62%]">
          {stageSentence(project, stage, locale)}
        </p>
      </header>
      {own && <Notice>{format(c.ownFinalist, { title: own.title })}</Notice>}
      <ResultsLists project={project} stage={stage} results={data.results} mine={own} />
      <ResultsSchedule project={project} stage={stage} />
      <ResultsCriteria project={project} />
    </MyShell>
  );
}
