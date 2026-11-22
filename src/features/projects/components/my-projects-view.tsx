"use client";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorBanner, RetryButton } from "@/components/ui/states";
import { useT } from "@/lib/i18n/provider";
import { PROJECTS_HREF } from "@/features/app-shell/nav";
import { useMyProjects } from "../hooks/use-my-projects";
import { RunningClassList } from "../kelas/components/running-classes";
import { useRunningClasses } from "../kelas/hooks/use-running-classes";
import type { AssignmentStore } from "../kelas/storage/assignment-store";
import type { SubmissionStore } from "../storage/submission-store";
import type { ProjectFixture } from "../types";
import { MyProjectGroup } from "./my-project-group";
import { MyError, MyGuest, MyShell, MySkeleton } from "./my-states";

type Props = {
  /** Replace the dummy catalog and the device store in tests. */
  source?: ProjectFixture[];
  store?: SubmissionStore;
  /** Replaces the class hand-in store in tests. */
  assignments?: AssignmentStore;
};

/** KLS-05, above the projects: only drawn when a class is running. */
function RunningClassesSection({ store }: { store?: AssignmentStore }) {
  const t = useT().projectsFlow.my;
  const running = useRunningClasses({ store });
  if (running.status === "error") {
    return (
      <section aria-labelledby="kelas-berjalan" className="grid gap-3 border-b border-line py-5">
        <h2 id="kelas-berjalan" className="text-sm font-semibold">
          {t.runningHeading}
        </h2>
        <ErrorBanner action={<RetryButton onClick={running.reload} />}>
          {t.runningError}
        </ErrorBanner>
      </section>
    );
  }
  if (running.status !== "ready" || running.rows.length === 0) return null;
  return (
    <section aria-labelledby="kelas-berjalan" className="grid gap-3 border-b border-line py-5">
      <h2 id="kelas-berjalan" className="text-sm font-semibold">
        {t.runningHeading}
      </h2>
      <RunningClassList rows={running.rows} variant="page" />
    </section>
  );
}

/**
 * Proyek saya (PRJ-04, PRD 17.5): every registration with its works and their status, what needs
 * action first. Nothing here is edited; each work opens its own page. A guest has no data of their
 * own, a failed read is an error with a retry (never "nothing joined"), and an empty list points
 * to the catalog.
 */
export function MyProjectsView({ source, store, assignments }: Props) {
  const t = useT().projectsFlow.my;
  const data = useMyProjects(source, store);

  if (data.guest) return <MyGuest back="katalog" />;
  if (data.status === "error") {
    return (
      <MyError back="katalog" onRetry={data.reload}>
        {t.error}
      </MyError>
    );
  }
  if (data.status === "loading") return <MySkeleton label={t.loading} />;

  return (
    <MyShell back="katalog">
      <h1 className="heading-lg">{t.title}</h1>
      {data.rows.length === 0 ? (
        <EmptyState
          art="engravingRoom"
          action={
            <ButtonLink href={PROJECTS_HREF} variant="secondary">
              {t.viewProjects}
            </ButtonLink>
          }
        >
          {t.empty}
        </EmptyState>
      ) : (
        <div>
          <RunningClassesSection store={assignments} />
          {data.rows.map((row) => (
            <MyProjectGroup key={row.project.slug} row={row} />
          ))}
        </div>
      )}
    </MyShell>
  );
}
