import type { Notification, NotificationMessage } from "@/features/notifications/types";
import { projectFixtures } from "../fixtures/all-projects";
import type { ProjectFixture } from "../types";
import { soloDashboardHref } from "./solo-model";
import { STAGE_LABEL } from "./stage-model";
import type { SoloProgress, SoloStage } from "./types";

/** Lowercase English stage names for the English sentence. */
const STAGE_EN: Record<SoloStage, string> = {
  pengajuan: "submission",
  penyuntingan: "editing",
  proofreading: "proofreading",
  cover: "cover design",
  layout: "interior layout",
  "persetujuan-final": "final approval",
  produksi: "production",
  selesai: "completed",
};

/**
 * Notifications from the Solo progress on this device (PRD 20, "Tahap produksi buku berubah"): the
 * team moving the book on, and a new preview file. What the author did (approving, asking for
 * changes) is not announced back to them.
 */
export function soloNotifications(
  rows: SoloProgress[],
  catalog: ProjectFixture[] = projectFixtures,
): Notification[] {
  const all = rows.flatMap((row) => {
    const project = catalog.find((p) => p.slug === row.slug);
    if (!project) return [];
    const href = soloDashboardHref(row.slug);
    const stages = row.log
      .filter((c) => c.by === "organizer")
      .map((c) => ({
        id: `solo-${row.id}-${c.stage}-${c.at}`,
        at: c.at,
        message:
          c.stage === "selesai"
            ? { key: "soloDone", params: { project: project.title } }
            : {
                key: "soloStage",
                params: {
                  project: project.title,
                  stage: STAGE_LABEL[c.stage].toLowerCase(),
                  stageEn: STAGE_EN[c.stage],
                },
              },
      }));
    const files = row.files.map((f) => ({
      id: `solo-${row.id}-${f.id}`,
      at: f.at,
      message: {
        key: "soloPreview",
        params: {
          project: project.title,
          version: String(f.version),
          kind: f.kind === "cover" ? "sampul" : "isi buku",
          kindEn: f.kind === "cover" ? "cover" : "book interior",
        },
      },
    }));
    return [...stages, ...files].map((n) => ({
      id: n.id,
      kind: "project" as const,
      actorId: null,
      others: 0,
      message: n.message as NotificationMessage,
      href,
      agoMs: 0,
      at: n.at,
    }));
  });
  return all.sort((a, b) => (b.at ?? 0) - (a.at ?? 0));
}
