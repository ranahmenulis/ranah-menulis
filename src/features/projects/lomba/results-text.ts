import type { Locale } from "@/lib/i18n/config";
import { fill } from "@/features/studio/copy/fill";
import { contestCopy } from "../copy/contest-copy";
import { formatProjectDate } from "../project-model";
import type { Project } from "../types";
import { announcementDates } from "./contest-model";
import type { ContestStage } from "./types";

/**
 * One or two sentences that say where the contest stands and what comes next, with the date. A
 * contest that has not announced anything still says when, so the page is never an empty promise.
 */
export function stageSentence(
  project: Project,
  stage: ContestStage,
  locale: Locale = "id",
): string {
  const c = contestCopy(locale).sentence;
  const zone = project.timeZone;
  const { finalists, winners } = announcementDates(project);
  const date = (at: number) => formatProjectDate(at, zone, locale);
  const next = (label: string, at: number | null) =>
    at === null ? "" : fill(c.next, { label, date: date(at) });
  const nextWinners = next(c.winnersWord, winners);

  switch (stage) {
    case "terbuka":
      return fill(c.open, {
        until: project.closesAt === null ? "" : fill(c.until, { date: date(project.closesAt) }),
        next: nextWinners,
      });
    case "dinilai":
      return fill(c.judging, {
        next: finalists !== null ? next(c.finalistsWord, finalists) : nextWinners,
      });
    case "finalis":
      return fill(c.finalists, { next: nextWinners });
    case "pemenang":
      return fill(c.winners, {
        on: winners === null ? "" : fill(c.on, { date: date(winners) }),
      });
  }
}
