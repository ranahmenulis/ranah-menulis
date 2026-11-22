import type { Notification } from "@/features/notifications/types";
import { liveRegistration } from "./payment-model";
import { projectHref } from "./project-model";
import type { Project, RegistrationMap } from "./types";

/**
 * "Ketentuan diperbarui" (PRJ-03): the Organizer changed the terms after the reader registered, so
 * the version the reader agreed to is no longer the project's. Derived from the two versions; the
 * registration keeps the version it agreed to.
 */
export function termsNotifications(
  projects: Project[],
  registrations: RegistrationMap,
  now: number,
): Notification[] {
  return projects.flatMap((project) => {
    const registration = liveRegistration(registrations[project.slug], now);
    if (!registration || project.publication !== "terbit") return [];
    if (project.termsUpdatedAt === undefined) return [];
    if (registration.termsVersion === project.terms.version) return [];
    return [
      {
        id: `ketentuan-${project.slug}-${project.terms.version}`,
        kind: "project" as const,
        actorId: null,
        others: 0,
        message: { key: "termsUpdated", params: { project: project.title } },
        href: projectHref(project.slug),
        agoMs: 0,
        at: project.termsUpdatedAt,
      },
    ];
  });
}
