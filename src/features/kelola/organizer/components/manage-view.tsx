"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { ErrorBanner, Notice, RetryButton, Skeleton } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import type { SoloStore } from "@/features/projects/solo/storage/solo-store";
import type { SubmissionStore } from "@/features/projects/storage/submission-store";
import { useT } from "@/lib/i18n/provider";
import { BackShell } from "../../components/back-shell";
import type { Project } from "@/features/projects/types";
import {
  MANAGE_TABS,
  ORGANIZER_HREF,
  manageHref,
  parseManageTab,
  type ManageTab,
} from "../area-hrefs";
import { allowedActions } from "../project-status";
import { useOrganizerProject } from "../use-organizer-data";
import { takesPayment } from "../payment-rows";
import { ParticipantsTab, WorksTab } from "./people-tabs";
import { PaymentsTab } from "./payments-tab";
import { ProjectForm } from "./project-form";
import { StaffTab } from "./staff-tab";
import { StageTab, hasStages } from "./stage-tab";
import { StatusActions } from "./status-actions";
import { TestimonialsTab } from "./testimonials-tab";

/** The tabs that depend on the project: payments only when it costs money, stages only for Solo and Lomba. */
function shown(tab: ManageTab, project: Project): boolean {
  if (tab === "pembayaran") return takesPayment(project);
  if (tab === "tahap") return hasStages(project);
  if (tab === "testimoni") return project.category === "kelas";
  return true;
}

/** One project for its Organizer: the project itself, who is assigned, who joined, what was sent. */
export function ManageView({
  slug,
  store,
  soloStore,
}: {
  slug: string;
  store?: SubmissionStore;
  soloStore?: SoloStore;
}) {
  const t = useT().kelolaOrganizer;
  const back = { href: ORGANIZER_HREF, label: t.back };
  const data = useOrganizerProject(slug, { store });
  const tab = parseManageTab(useSearchParams()?.get("tab"));

  if (data.status === "error") {
    return (
      <BackShell back={back}>
        <ErrorBanner action={<RetryButton onClick={data.reload} />}>
          {t.manage.loadError}
        </ErrorBanner>
      </BackShell>
    );
  }
  if (data.status === "loading") {
    return (
      <div role="status" aria-label={t.manage.loading} className="mx-auto grid max-w-170 gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  }
  if (data.status === "gone" || data.status === "blocked") {
    return (
      <BackShell back={back}>
        <h1 className="heading-lg">
          {data.status === "gone" ? t.manage.goneTitle : t.manage.blockedTitle}
        </h1>
        <Notice>{data.status === "gone" ? t.manage.goneNotice : t.manage.blockedNotice}</Notice>
        <ButtonLink href={ORGANIZER_HREF} variant="secondary" className="justify-self-start">
          {t.manage.backToList}
        </ButtonLink>
      </BackShell>
    );
  }

  const { project } = data.row;
  const { row } = data;
  return (
    <BackShell back={back}>
      <header className="grid gap-1">
        <h1 className="heading-lg wrap-anywhere">{project.title}</h1>
        <p className="text-sm text-ink-muted">{t.status[row.status]}</p>
      </header>
      <Tabs
        variant="pill"
        label={t.manage.tabsLabel}
        value={tab}
        items={MANAGE_TABS.filter((tabItem) => shown(tabItem.id, project)).map((tabItem) => ({
          ...tabItem,
          label: t.manage.tabs[tabItem.id],
          href: manageHref(slug, tabItem.id),
        }))}
      />
      <TabBody tab={tab} slug={slug} data={data} soloStore={soloStore} />
    </BackShell>
  );
}

type ReadyData = Extract<ReturnType<typeof useOrganizerProject>, { status: "ready" }>;

/** The body of the chosen tab. */
function TabBody({
  tab,
  slug,
  data,
  soloStore,
}: {
  tab: ManageTab;
  slug: string;
  data: ReadyData;
  soloStore?: SoloStore;
}) {
  const router = useRouter();
  const t = useT().kelolaOrganizer;
  const { row, works, registration, rawRegistration, fixture, now } = data;
  const { project } = row;
  return (
    <>
      {tab === "proyek" &&
        (fixture ? (
          <div className="grid gap-6">
            <StatusActions
              slug={slug}
              actions={allowedActions(row.status, row.registrants)}
              onDeleted={() => router.push(ORGANIZER_HREF)}
            />
            {row.status === "arsip" ? (
              <Notice>{t.manage.archivedNotice}</Notice>
            ) : (
              <ProjectForm fixture={fixture} registrants={row.registrants} />
            )}
          </div>
        ) : (
          <Notice>{t.manage.sampleNotice}</Notice>
        ))}
      {tab === "penugasan" && (
        <StaffTab slug={slug} category={project.category} archived={row.status === "arsip"} />
      )}
      {tab === "peserta" && (
        <ParticipantsTab project={project} registration={registration} now={now} />
      )}
      {tab === "pembayaran" && (
        <PaymentsTab project={project} registration={rawRegistration} now={now} />
      )}
      {tab === "tahap" && (
        <StageTab
          project={project}
          works={works}
          registration={rawRegistration}
          now={now}
          soloStore={soloStore}
        />
      )}
      {tab === "kiriman" && <WorksTab project={project} works={works} />}
      {tab === "testimoni" && project.category === "kelas" && <TestimonialsTab project={project} />}
    </>
  );
}
