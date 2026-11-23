import type { Locale } from "@/lib/i18n/config";
import type { Area } from "./access";
import { sharedCopy, sharedId } from "./copy/shared-copy";
import { ADMIN_HREF } from "./admin/area-hrefs";
import type { CaseRow } from "./admin/moderation/moderation-model";
import { EDITOR_HREF } from "./editor/area-hrefs";
import { queueQuery, type QueueFilter } from "./editor/queue-model";
import { contestHref } from "./juri/area-hrefs";
import type { JudgingStatus } from "./juri/judge-model";
import { classHref } from "./mentor/area-hrefs";
import { MANAGE_EVENTS_HREF } from "./organizer/events/event-access";

/**
 * The dark band that opens every management area (DESIGN.md 7.8): who you are here, one number of
 * work that rolls in, and the way into that work. Pure: the screens pass the numbers they already
 * load. Decides nothing about access.
 */
export type BandEntry = { label: string; href: string };

export type BandWork =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; count: number; entry: BandEntry | null };

export type BandCopy = {
  /** The role, small above the title ("Editor"). */
  role: string;
  /** What the number counts, after it ("karya perlu tindakan"). */
  unit: string;
};

/** Indonesian copy; screens read `kelolaShared.band.roles` in the interface language. */
export const BAND_COPY: Record<Area, BandCopy> = sharedId.band.roles;

/** Turns a screen's data into band work: loading and error pass through, ready is counted. */
export function bandFrom<D extends { status: string }>(
  data: D,
  count: (ready: Extract<D, { status: "ready" }>) => BandWork,
): BandWork {
  if (data.status === "ready") return count(data as Extract<D, { status: "ready" }>);
  return { status: data.status === "loading" ? "loading" : "error" };
}

const entries = (locale: Locale) => sharedCopy(locale).band.entries;

const ready = (count: number, entry: BandEntry | null): BandWork => ({
  status: "ready",
  count,
  entry: count > 0 ? entry : null,
});

export function editorWork(counts: Record<QueueFilter, number>, locale: Locale = "id"): BandWork {
  return ready(counts["perlu-tindakan"], {
    label: entries(locale).editor,
    href: `${EDITOR_HREF}${queueQuery("perlu-tindakan")}`,
  });
}

type ContestWork = {
  project: { slug: string };
  total: number;
  scored: number;
  judging: JudgingStatus;
};

/** Only works in a contest whose judging is open can be scored now, so only those are counted. */
export function judgeWork(items: readonly ContestWork[], locale: Locale = "id"): BandWork {
  const open = items.filter((i) => i.judging === "dibuka" && i.total > i.scored);
  const count = open.reduce((sum, i) => sum + (i.total - i.scored), 0);
  const first = open[0];
  return ready(
    count,
    first ? { label: entries(locale).juri, href: contestHref(first.project.slug) } : null,
  );
}

type ClassWork = { project: { slug: string }; toGrade: number };

export function mentorWork(items: readonly ClassWork[], locale: Locale = "id"): BandWork {
  const count = items.reduce((sum, i) => sum + i.toGrade, 0);
  const first = items.find((i) => i.toGrade > 0);
  return ready(
    count,
    first ? { label: entries(locale).mentor, href: classHref(first.project.slug) } : null,
  );
}

/** The Organizer's list sits right under the band, so the way in is the other half of the work. */
export function organizerWork(active: number, locale: Locale = "id"): BandWork {
  return {
    status: "ready",
    count: active,
    entry: { label: entries(locale).organizer, href: MANAGE_EVENTS_HREF },
  };
}

export function adminWork(
  cases: readonly Pick<CaseRow, "status">[],
  locale: Locale = "id",
): BandWork {
  const count = cases.filter((c) => c.status === "baru").length;
  return ready(count, { label: entries(locale).admin, href: `${ADMIN_HREF}/moderasi` });
}

/** People drawn in the Admin mark: one dot each, the suspended ones as rings. */
export const MARK_PEOPLE_MAX = 36;

export function peopleDots(people: readonly { suspended: boolean }[]): ("full" | "ring")[] {
  return people.slice(0, MARK_PEOPLE_MAX).map((p) => (p.suspended ? "ring" : "full"));
}
