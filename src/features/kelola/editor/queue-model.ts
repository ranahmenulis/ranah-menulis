import type { SubmissionStatus } from "@/components/ui/status-submission";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import { categoryLabel } from "@/features/projects/project-model";
import { revisionsSent } from "@/features/projects/submission-status";
import type { Submission } from "@/features/projects/submission-types";
import type { ProjectFixture } from "@/features/projects/types";
import type { ManagerRole } from "@/lib/roles";
import { reviewAccess } from "./assignments";

export type QueueFilter = "perlu-tindakan" | "ditinjau" | "menunggu-revisi" | "selesai" | "semua";

export const DEFAULT_QUEUE_FILTER: QueueFilter = "perlu-tindakan";

export const QUEUE_FILTERS: { id: QueueFilter; label: string }[] = [
  { id: "perlu-tindakan", label: "Perlu tindakan" },
  { id: "ditinjau", label: "Sedang ditinjau" },
  { id: "menunggu-revisi", label: "Menunggu revisi" },
  { id: "selesai", label: "Selesai" },
  { id: "semua", label: "Semua" },
];

/** Which statuses each filter holds. "Semua" is open-ended so no work can drop out of sight. */
const GROUPS: Record<Exclude<QueueFilter, "semua">, readonly SubmissionStatus[]> = {
  "perlu-tindakan": ["terkirim", "revisi-terkirim"],
  ditinjau: ["peninjauan"],
  "menunggu-revisi": ["perlu-revisi"],
  selesai: ["diterima", "ditolak"],
};

export type QueueRow = {
  id: string;
  title: string;
  projectTitle: string;
  category: string;
  genre: string;
  words: number;
  status: SubmissionStatus;
  /** Since when it has been in this status. */
  since: number;
  /** Revisions the participant has sent so far. */
  revisions: number;
};

const isFilter = (value: string | null | undefined): value is QueueFilter =>
  QUEUE_FILTERS.some((f) => f.id === value);

export const parseQueueFilter = (value: string | null | undefined): QueueFilter =>
  isFilter(value) ? value : DEFAULT_QUEUE_FILTER;

/** The address part for a filter; the default leaves the address clean. */
export const queueQuery = (filter: QueueFilter) =>
  filter === DEFAULT_QUEUE_FILTER ? "" : `?status=${filter}`;

/** The work these roles may review, as rows. A draft is never sent, so it never appears. */
export function queueRows(
  submissions: readonly Submission[],
  roles: readonly ManagerRole[],
  catalog: readonly ProjectFixture[] = projectFixtures,
): QueueRow[] {
  return submissions.flatMap((work) => {
    if (work.status === "draf" || reviewAccess(roles, work.slug, catalog) !== "ok") return [];
    const project = catalog.find((p) => p.slug === work.slug);
    if (!project) return [];
    return [
      {
        id: work.id,
        title: work.title,
        projectTitle: project.title,
        category: categoryLabel(project.category),
        genre: work.genre,
        words: work.versions.at(-1)?.wordCount ?? 0,
        status: work.status,
        since: work.statusLog.at(-1)?.at ?? work.submittedAt,
        revisions: revisionsSent(work),
      },
    ];
  });
}

const inFilter = (row: QueueRow, filter: QueueFilter) =>
  filter === "semua" || GROUPS[filter].includes(row.status);

/** Longest waiting first; finished work the other way round, newest decision first. */
export function applyFilter(rows: readonly QueueRow[], filter: QueueFilter): QueueRow[] {
  const direction = filter === "selesai" ? -1 : 1;
  return rows.filter((r) => inFilter(r, filter)).sort((a, b) => direction * (a.since - b.since));
}

export function countByFilter(rows: readonly QueueRow[]): Record<QueueFilter, number> {
  return Object.fromEntries(
    QUEUE_FILTERS.map((f) => [f.id, rows.filter((r) => inFilter(r, f.id)).length]),
  ) as Record<QueueFilter, number>;
}

export const emptyText: Record<QueueFilter, string> = {
  "perlu-tindakan": "Tidak ada karya yang menunggu tindakanmu.",
  ditinjau: "Tidak ada karya yang sedang kamu tinjau.",
  "menunggu-revisi": "Tidak ada karya yang menunggu revisi peserta.",
  selesai: "Belum ada karya yang selesai kamu putuskan.",
  semua: "Belum ada karya yang masuk untuk kamu tinjau.",
};
