"use client";

import { useMemo } from "react";
import { useViewer } from "@/lib/viewer";
import { liveRegistration } from "../../payment-model";
import { useRegistrations } from "../../registration-store";
import type { SubmissionStore } from "../../storage/submission-store";
import { activeSubmissions } from "../../submission-model";
import type { Submission } from "../../submission-types";
import type { Project, ProjectFixture, Registration } from "../../types";
import { useProjects } from "../../use-projects";
import { useSubmissions } from "../../use-submissions";
import { soloBlock, soloPhase, stagesFor, type ShownBlock, type SoloPhase } from "../solo-model";
import type { SoloStore } from "../storage/solo-store";
import type { SoloProgress, SoloStage } from "../types";
import { useSoloRows } from "./use-solo-rows";

export type SoloData =
  | { status: "loading" }
  | { status: "error"; reload: () => void }
  /** No such project, a draft, or not a Solo project: all "not found". */
  | { status: "gone" }
  | { status: "blocked"; project: Project; block: ShownBlock }
  | {
      status: "ready";
      project: Project;
      registration: Registration;
      work: Submission | undefined;
      phase: SoloPhase;
      stages: SoloStage[];
      progress: SoloProgress | null;
    };

type Sources = { source?: ProjectFixture[]; submissions?: SubmissionStore; store?: SoloStore };

/**
 * Everything the Solo dashboard needs, read once for the page: the project, who the reader is, the
 * submission and the stage history. Loading, error, blocked and ready are separate, so a failed
 * read is never shown as "nothing submitted yet".
 */
export function useSolo(slug: string, sources: Sources = {}): SoloData {
  const catalog = useProjects(sources.source);
  const guest = useViewer() === "tamu";
  const registrations = useRegistrations();
  const works = useSubmissions(sources.submissions);
  const rows = useSoloRows(sources.store);

  return useMemo<SoloData>(() => {
    const reads = [works, rows];
    const failed = reads.find((r) => r.status === "error");
    if (failed) return { status: "error", reload: failed.reload };
    if (catalog.status === "loading" || reads.some((r) => r.status === "loading")) {
      return { status: "loading" };
    }
    const project = catalog.projects.find((p) => p.slug === slug && p.publication === "terbit");
    if (!project) return { status: "gone" };
    const registration = guest ? undefined : liveRegistration(registrations[slug], catalog.now);
    const block = soloBlock({ project, guest, registration });
    if (block === "bukan-solo") return { status: "gone" };
    if (block !== null || !registration) {
      return { status: "blocked", project, block: block ?? "belum-terdaftar" };
    }
    const work = activeSubmissions(works.submissions, slug)[0];
    return {
      status: "ready",
      project,
      registration,
      work,
      phase: soloPhase(work),
      stages: stagesFor(project, work?.packageName ?? registration.packageName),
      progress: work ? (rows.rows.find((r) => r.id === work.id) ?? null) : null,
    };
  }, [catalog, guest, registrations, works, rows, slug]);
}
