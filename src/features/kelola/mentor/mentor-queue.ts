import { DUMMY_USER } from "@/features/app-shell/nav";
import { assignmentRows } from "@/features/projects/kelas/class-model";
import type {
  AssignmentStatus,
  AssignmentSubmission,
  ClassContent,
} from "@/features/projects/kelas/types";
import type { Registration } from "@/features/projects/types";
import type { Locale } from "@/lib/i18n/config";
import type { MentorTab } from "./area-hrefs";
import { mentorCopy } from "./copy/mentor-copy";

export type MentorFilter = "perlu-dinilai" | "menunggu-perbaikan" | "selesai" | "semua";

export const DEFAULT_MENTOR_FILTER: MentorFilter = "perlu-dinilai";

const FILTER_IDS: MentorFilter[] = ["perlu-dinilai", "menunggu-perbaikan", "selesai", "semua"];

/** Indonesian labels; screens use `mentorFiltersOf` with the interface language. */
export const mentorFiltersOf = (locale: Locale = "id") =>
  FILTER_IDS.map((id) => ({ id, label: mentorCopy(locale).filters[id] }));

export const MENTOR_FILTERS: { id: MentorFilter; label: string }[] = mentorFiltersOf("id");

const GROUPS: Record<Exclude<MentorFilter, "semua">, readonly AssignmentStatus[]> = {
  "perlu-dinilai": ["dikumpulkan"],
  "menunggu-perbaikan": ["perlu-perbaikan"],
  selesai: ["selesai"],
};

const TAB_IDS: MentorTab[] = ["pengumpulan", "tugas", "peserta"];

export const tabsOf = (locale: Locale = "id") =>
  TAB_IDS.map((id) => ({ id, label: mentorCopy(locale).tabs[id] }));

export const TABS: { id: MentorTab; label: string }[] = tabsOf("id");

export const parseTab = (value: string | null | undefined): MentorTab =>
  TABS.find((t) => t.id === value)?.id ?? "pengumpulan";

export const parseMentorFilter = (value: string | null | undefined): MentorFilter =>
  MENTOR_FILTERS.find((f) => f.id === value)?.id ?? DEFAULT_MENTOR_FILTER;

/** The address part for the filter; the default leaves it clean. */
export const mentorFilterQuery = (filter: MentorFilter) =>
  filter === DEFAULT_MENTOR_FILTER ? "" : `?status=${filter}`;

export type MentorRow = {
  id: string;
  title: string;
  status: AssignmentStatus;
  late: boolean;
  /** Since when it has been in this status. */
  since: number;
  versions: number;
};

/** The hand-ins of this class, with the title of the task each one answers. */
export function mentorRows(
  content: ClassContent,
  submissions: readonly AssignmentSubmission[],
): MentorRow[] {
  return submissions.flatMap((work) => {
    const title = content.modules.find((m) => m.assignment.id === work.assignmentId)?.assignment
      .title;
    if (work.slug !== content.slug || title === undefined) return [];
    return [
      {
        id: work.id,
        title,
        status: work.status,
        late: work.late,
        since: work.statusLog.at(-1)?.at ?? work.submittedAt,
        versions: work.versions.length,
      },
    ];
  });
}

const inFilter = (row: MentorRow, filter: MentorFilter) =>
  filter === "semua" || GROUPS[filter].includes(row.status);

/** Longest waiting first; finished work the other way round. */
export function applyMentorFilter(rows: readonly MentorRow[], filter: MentorFilter): MentorRow[] {
  const direction = filter === "selesai" ? -1 : 1;
  return rows.filter((r) => inFilter(r, filter)).sort((a, b) => direction * (a.since - b.since));
}

export function countMentorFilters(rows: readonly MentorRow[]): Record<MentorFilter, number> {
  return Object.fromEntries(
    MENTOR_FILTERS.map((f) => [f.id, rows.filter((r) => inFilter(r, f.id)).length]),
  ) as Record<MentorFilter, number>;
}

export const mentorEmptyText: Record<MentorFilter, string> = mentorCopy("id").empty;

export const mentorEmptyTextOf = (filter: MentorFilter, locale: Locale = "id"): string =>
  mentorCopy(locale).empty[filter];

export type RosterRow = {
  name: string;
  /** Tasks marked Selesai. */
  selesai: number;
  perbaikan: number;
  menunggu: number;
  /** Past the deadline with nothing handed in. */
  terlambat: number;
  belum: number;
  total: number;
};

/**
 * The participants of the class this device knows: the registration made here. Other people's
 * registrations are not on this device, so the roster is honest about being one row. "Nilai
 * kelulusan" (PRD 17.6) is only these counts: the passing rule is Q-27, unanswered.
 */
export function rosterRows(
  content: ClassContent,
  submissions: readonly AssignmentSubmission[],
  registration: Registration | undefined,
  now: number,
): RosterRow[] {
  if (registration?.status !== "terdaftar") return [];
  const rows = assignmentRows(
    content,
    submissions.filter((s) => s.slug === content.slug),
    now,
  );
  const count = (...states: string[]) => rows.filter((r) => states.includes(r.state)).length;
  return [
    {
      name: DUMMY_USER.name,
      selesai: count("selesai"),
      perbaikan: count("perlu-perbaikan"),
      menunggu: count("dikumpulkan"),
      terlambat: count("terlambat"),
      belum: count("belum-dikumpulkan", "terkunci"),
      total: rows.length,
    },
  ];
}
