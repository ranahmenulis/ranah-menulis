import type { Notification } from "@/features/notifications/types";
import type { Project, RegistrationMap } from "../types";
import { announcementDates, contestStage, resultsHref, stageRank } from "./contest-model";
import type { ContestOverrides } from "./types";

type Input = {
  projects: Project[];
  registrations: RegistrationMap;
  overrides: ContestOverrides;
  /** When the page opened. */
  now: number;
  /** Title of the reader's own work per contest slug, when a panel made it a finalist. */
  ownWorks?: Record<string, string>;
};

const STAGES: ("finalis" | "pemenang")[] = ["finalis", "pemenang"];

/** When an announcement happened: its date if that has passed, else when a panel pushed it. */
function announcedAt(project: Project, stage: "finalis" | "pemenang", input: Input): number {
  const dates = announcementDates(project);
  const date = stage === "finalis" ? dates.finalists : dates.winners;
  if (date !== null && date <= input.now) return date;
  return input.overrides[project.slug]?.times[stage] ?? input.now;
}

/** Whether this announcement exists for the contest: it has the date, or a panel pushed it there. */
function announced(project: Project, stage: "finalis" | "pemenang", input: Input): boolean {
  const dates = announcementDates(project);
  const date = stage === "finalis" ? dates.finalists : dates.winners;
  const pushed = input.overrides[project.slug]?.stage;
  return (
    (date !== null && date <= input.now) ||
    (pushed !== undefined && stageRank(pushed) >= stageRank(stage))
  );
}

/**
 * Notifications about contests the reader joined (LMB-02, PRD 20): the finalists and the winners
 * are announced. Derived from the stage, so it needs no events of its own; each announcement has
 * one stable id and is read once. Only a confirmed registration counts as having joined, and a step
 * a contest does not have (no finalist date) is not announced.
 */
export function contestNotifications(input: Input): Notification[] {
  const { projects, registrations, overrides, now, ownWorks = {} } = input;
  const out: Notification[] = [];
  for (const project of projects) {
    if (project.block.kind !== "lomba" || registrations[project.slug]?.status !== "terdaftar")
      continue;
    const current = contestStage(project, now, overrides[project.slug]?.stage);
    for (const stage of STAGES) {
      if (stageRank(current) < stageRank(stage) || !announced(project, stage, input)) continue;
      const own = stage === "finalis" ? ownWorks[project.slug] : undefined;
      const text = own
        ? `Karyamu “${own}” masuk finalis di ${project.title}.`
        : stage === "finalis"
          ? `Finalis ${project.title} sudah diumumkan.`
          : `Pemenang ${project.title} sudah diumumkan.`;
      out.push({
        id: `lomba-${project.slug}-${stage}`,
        kind: "project",
        actorId: null,
        others: 0,
        text,
        href: resultsHref(project.slug),
        agoMs: 0,
        at: announcedAt(project, stage, input),
      });
    }
  }
  return out.sort((a, b) => (b.at ?? 0) - (a.at ?? 0));
}
