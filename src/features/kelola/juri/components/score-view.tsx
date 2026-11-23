"use client";

import { ButtonLink } from "@/components/ui/button";
import { ErrorBanner, Notice, RetryButton, Skeleton } from "@/components/ui/states";
import { fill } from "@/features/studio/copy/fill";
import { useFormat } from "@/lib/i18n/use-format";
import { useT } from "@/lib/i18n/provider";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { BackShell } from "../../components/back-shell";
import { FrozenText } from "../../components/frozen-text";
import { contestHref } from "../area-hrefs";
import { useJudgeWork } from "../use-judge-data";
import { ScoreForm } from "./score-form";
import { FileText } from "@phosphor-icons/react/dist/ssr";
import { cardClass } from "@/components/ui/card";
import { SectionIcon } from "@/components/ui/section-card";
import { cn } from "@/lib/cn";

/**
 * One work to score (LMB-01): the frozen text of its latest version and the form. In an anonymous
 * contest nothing here names the author, and the participant's own note to the editor is not shown
 * because it could (BR-PRJ-08, AC-27). Refuses a contest not assigned to the viewer with a way back.
 */
export function ScoreView({
  slug,
  id,
  store,
}: {
  slug: string;
  id: string;
  store?: SubmissionStore;
}) {
  const t = useT().kelolaJuri;
  const c = t.score;
  const fmt = useFormat();
  const data = useJudgeWork(slug, id, { store });
  const back = { href: contestHref(slug), label: c.back };

  if (data.status === "error") {
    return (
      <BackShell back={back}>
        <ErrorBanner action={<RetryButton onClick={data.reload} />}>
          {t.works.loadError}
        </ErrorBanner>
      </BackShell>
    );
  }
  if (data.status === "loading") {
    return (
      <div role="status" aria-label={t.works.loading} className="mx-auto grid max-w-170 gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  if (data.status === "gone" || data.status === "blocked") {
    return (
      <BackShell back={back}>
        <h1 className="heading-lg">{data.status === "gone" ? c.goneTitle : c.blockedTitle}</h1>
        <Notice>{data.status === "gone" ? c.goneNotice : c.blockedNotice}</Notice>
        <ButtonLink href={contestHref(slug)} variant="secondary" className="justify-self-start">
          {c.backToWorks}
        </ButtonLink>
      </BackShell>
    );
  }

  const { work, label, project, anonymous, criteria, judging, mine } = data;
  const version = work.versions.at(-1);
  return (
    <BackShell back={back}>
      <header className="grid gap-2">
        <p className="text-xs wrap-anywhere text-ink-muted">{project.title}</p>
        <h1 tabIndex={-1} className="heading-lg wrap-anywhere outline-none">
          {label} · {work.title}
        </h1>
        <p className="text-sm text-ink-muted">
          {fill(c.meta, {
            genre: work.genre,
            words: fmt.number(version?.wordCount ?? 0),
            anonymous: anonymous ? c.anonymousMeta : "",
          })}
        </p>
      </header>
      <section aria-labelledby="naskah-title" className={cn(cardClass, "grid min-w-0 gap-4")}>
        <h2 id="naskah-title" className="flex items-center gap-2.5 heading-md">
          <SectionIcon icon={FileText} />
          {c.manuscript}
        </h2>
        {version ? <FrozenText content={version.content} /> : <Notice>{c.noFrozen}</Notice>}
      </section>
      <ScoreForm
        key={`${work.id}-${judging}`}
        slug={slug}
        submissionId={work.id}
        criteria={criteria}
        judging={judging}
        mine={mine}
      />
    </BackShell>
  );
}
