import type { Notification } from "@/features/notifications/types";
import { projectFixtures } from "../fixtures/all-projects";
import type { ProjectFixture } from "../types";
import { soloDashboardHref } from "./solo-model";
import { STAGE_LABEL } from "./stage-model";
import type { SoloProgress } from "./types";

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
        text:
          c.stage === "selesai"
            ? `Penerbitan bukumu di ${project.title} selesai.`
            : `Tahap ${STAGE_LABEL[c.stage].toLowerCase()} dimulai untuk bukumu di ${project.title}.`,
      }));
    const files = row.files.map((f) => ({
      id: `solo-${row.id}-${f.id}`,
      at: f.at,
      text: `Pratinjau ${f.kind === "cover" ? "sampul" : "isi buku"} versi ${f.version} siap dilihat di ${project.title}.`,
    }));
    return [...stages, ...files].map((n) => ({
      id: n.id,
      kind: "project" as const,
      actorId: null,
      others: 0,
      text: n.text,
      href,
      agoMs: 0,
      at: n.at,
    }));
  });
  return all.sort((a, b) => (b.at ?? 0) - (a.at ?? 0));
}
