"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useT } from "@/lib/i18n/provider";
import { ButtonLink } from "@/components/ui/button";
import { ErrorBanner, Notice, RetryButton, Skeleton } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import type { AssignmentStore } from "@/features/projects/kelas/storage/assignment-store";
import { formatProjectDate } from "@/features/projects/project-model";
import { MENTOR_HREF, classHref } from "../area-hrefs";
import { blockedClassMessageOf } from "../mentor-text";
import { parseTab, tabsOf } from "../mentor-queue";
import { useMentorClass } from "../use-mentor-data";
import { BackShell } from "../../components/back-shell";
import { RosterTab } from "./roster-tab";
import { SubmissionsTab } from "./submissions-tab";
import { TasksTab } from "./tasks-tab";

/** One class for the Mentor: hand-ins, tasks and participants as three tabs kept in the address. */
export function MentorClassView({ slug, store }: { slug: string; store?: AssignmentStore }) {
  const t = useT().kelolaMentor;
  const locale = useLocale();
  const BACK = { href: MENTOR_HREF, label: t.back };
  const data = useMentorClass(slug, { store });
  const params = useSearchParams();
  const tab = parseTab(params?.get("tab"));

  if (data.status === "error") {
    return (
      <BackShell back={BACK}>
        <ErrorBanner action={<RetryButton onClick={data.reload} />}>
          {t.classView.loadError}
        </ErrorBanner>
      </BackShell>
    );
  }
  if (data.status === "loading") {
    return (
      <div role="status" aria-label={t.classView.loading} className="mx-auto grid max-w-260 gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  }
  if (data.status === "gone" || data.status === "blocked") {
    return (
      <BackShell back={BACK}>
        <h1 className="heading-lg">
          {data.status === "gone" ? t.classView.goneTitle : t.classView.blockedTitle}
        </h1>
        <Notice>
          {data.status === "gone"
            ? t.classView.goneNote
            : blockedClassMessageOf(data.reason, locale)}
        </Notice>
        <ButtonLink href={MENTOR_HREF} variant="secondary" className="justify-self-start">
          {t.backToList}
        </ButtonLink>
      </BackShell>
    );
  }

  const { project, content, now, submissions, tasks, registration } = data;
  const started = now >= content.startsAt;
  return (
    <BackShell back={BACK} wide>
      <header className="grid gap-1">
        <h1 className="heading-lg wrap-anywhere">{project.title}</h1>
        <p className="text-sm text-ink-muted">
          {started ? t.classView.runningSince : t.classView.startsOn}{" "}
          {formatProjectDate(content.startsAt, project.timeZone, locale)}
        </p>
      </header>
      <Tabs
        variant="pill"
        label={t.classView.tabsLabel}
        value={tab}
        items={tabsOf(locale).map((t) => ({ ...t, href: classHref(slug, t.id) }))}
      />
      {tab === "pengumpulan" && (
        <SubmissionsTab
          content={content}
          submissions={submissions}
          statusParam={params?.get("status") ?? null}
          tab={tab}
        />
      )}
      {tab === "tugas" && (
        <TasksTab
          slug={slug}
          zone={project.timeZone}
          content={content}
          tasks={tasks}
          submissions={submissions}
          store={store}
        />
      )}
      {tab === "peserta" && (
        <RosterTab
          project={project}
          content={content}
          submissions={submissions}
          registration={registration}
          now={now}
        />
      )}
    </BackShell>
  );
}
