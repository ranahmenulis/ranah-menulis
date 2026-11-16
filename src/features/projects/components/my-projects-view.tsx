"use client";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { PROJECTS_HREF } from "@/features/app-shell/nav";
import { useMyProjects } from "../hooks/use-my-projects";
import type { SubmissionStore } from "../storage/submission-store";
import type { ProjectFixture } from "../types";
import { MyProjectGroup } from "./my-project-group";
import { MyError, MyGuest, MyShell, MySkeleton } from "./my-states";

type Props = {
  /** Replace the dummy catalog and the device store in tests. */
  source?: ProjectFixture[];
  store?: SubmissionStore;
};

/**
 * Proyek saya (PRJ-04, PRD 17.5): every registration with its works and their status, what needs
 * action first. Nothing here is edited; each work opens its own page. A guest has no data of their
 * own, a failed read is an error with a retry (never "nothing joined"), and an empty list points
 * to the catalog.
 */
export function MyProjectsView({ source, store }: Props) {
  const data = useMyProjects(source, store);

  if (data.guest) return <MyGuest back="katalog" />;
  if (data.status === "error") {
    return (
      <MyError back="katalog" onRetry={data.reload}>
        Proyek dan kirimanmu belum bisa dibuka. Data di perangkat ini tidak terbaca.
      </MyError>
    );
  }
  if (data.status === "loading") return <MySkeleton label="Memuat Proyek saya" />;

  return (
    <MyShell back="katalog">
      <h1 className="heading-lg">Proyek saya</h1>
      {data.rows.length === 0 ? (
        <EmptyState
          action={
            <ButtonLink href={PROJECTS_HREF} variant="secondary">
              Lihat Projects
            </ButtonLink>
          }
        >
          Kamu belum mengikuti proyek.
        </EmptyState>
      ) : (
        <div>
          {data.rows.map((row) => (
            <MyProjectGroup key={row.project.slug} row={row} />
          ))}
        </div>
      )}
    </MyShell>
  );
}
