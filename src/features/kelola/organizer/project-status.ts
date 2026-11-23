import type { Project } from "@/features/projects/types";
import { kelolaOrganizer } from "./copy/id";

/** What the Organizer sees (PRD 17.6): draft, published, closed, archived. Derived, not stored. */
export type OrganizerStatus = "draf" | "terbit" | "ditutup" | "arsip";

/** Indonesian labels; screens read the dictionary of the current language instead. */
export const statusLabel: Record<OrganizerStatus, string> = kelolaOrganizer.status;

export function organizerStatus(
  project: Pick<Project, "publication" | "closesAt">,
  now: number,
): OrganizerStatus {
  if (project.publication === "arsip") return "arsip";
  if (project.publication === "draf") return "draf";
  return project.closesAt !== null && project.closesAt < now ? "ditutup" : "terbit";
}

export type StatusAction = "terbitkan" | "tutup" | "arsipkan" | "hapus";

/**
 * What may be done from this status. A project with participants is archived, never deleted
 * (BR-PRJ-07). Only a draft can be published; closing only makes sense while it is open.
 */
export function allowedActions(status: OrganizerStatus, registrants: number): StatusAction[] {
  switch (status) {
    case "draf":
      return registrants === 0 ? ["terbitkan", "hapus", "arsipkan"] : ["terbitkan", "arsipkan"];
    case "terbit":
      return ["tutup", "arsipkan"];
    case "ditutup":
      return ["arsipkan"];
    case "arsip":
      return [];
  }
}

/** Indonesian texts; screens read the dictionary of the current language instead. */
export const actionText: Record<StatusAction, { label: string; title: string; body: string }> =
  kelolaOrganizer.actions.text;
