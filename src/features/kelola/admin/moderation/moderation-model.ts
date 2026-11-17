import { REPORT_REASON_LABEL } from "@/features/community/moderation/reasons";
import { applyDecision, type ContentState } from "@/features/community/moderation/removed";
import type {
  Decision,
  ModerationEntry,
  Report,
  ReportKind,
} from "@/features/community/moderation/report-store";
import type { Comment, Post, ReportReason } from "@/features/community/types";
import { ADMIN_HREF } from "../area-hrefs";

/**
 * The moderation queue (PLT-06). One case per reported content; reports on the same content are
 * merged, and the reporters are not part of a case at all, only how many and why. [usulan] A case is
 * new while a report is newer than the last decision on that content.
 */
export const MODERATION_HREF = `${ADMIN_HREF}/moderasi`;
export const caseKey = (kind: ReportKind, targetId: string) => `${kind}:${targetId}`;
export const caseHref = (kind: ReportKind, targetId: string) =>
  `${MODERATION_HREF}/${encodeURIComponent(caseKey(kind, targetId))}`;

export const reasonLabel = REPORT_REASON_LABEL;

export type CaseStatus = "baru" | "selesai";

export type CaseRow = {
  kind: ReportKind;
  targetId: string;
  reports: number;
  /** How many reports gave each reason; reporters are never kept here. */
  reasons: Partial<Record<ReportReason, number>>;
  topReason: ReportReason;
  /** The oldest report not yet decided on, or the oldest one when the case is closed. */
  since: number;
  status: CaseStatus;
  state: ContentState;
  last: ModerationEntry | null;
};

export function buildCases(
  reports: readonly Report[],
  entries: readonly ModerationEntry[],
): CaseRow[] {
  const groups = new Map<string, Report[]>();
  for (const r of reports) {
    const key = caseKey(r.kind, r.targetId);
    const group = groups.get(key);
    if (group) group.push(r);
    else groups.set(key, [r]);
  }
  // One pass over the decisions: the last one and the resulting state, per content.
  const last = new Map<string, ModerationEntry>();
  const states = new Map<string, ContentState>();
  for (const e of entries) {
    const key = caseKey(e.kind, e.targetId);
    last.set(key, e);
    states.set(key, applyDecision(states.get(key) ?? "tampil", e.decision));
  }
  const rows = [...groups.values()].map((list): CaseRow => {
    const { kind, targetId } = list[0];
    const key = caseKey(kind, targetId);
    const decided = last.get(key) ?? null;
    const open = list.filter((r) => decided === null || r.at > decided.at);
    const reasons: CaseRow["reasons"] = {};
    for (const r of list) reasons[r.reason] = (reasons[r.reason] ?? 0) + 1;
    const top = (Object.entries(reasons) as [ReportReason, number][]).sort(
      (a, b) => b[1] - a[1],
    )[0][0];
    return {
      kind,
      targetId,
      reports: list.length,
      reasons,
      topReason: top,
      since: Math.min(...(open.length > 0 ? open : list).map((r) => r.at)),
      status: open.length > 0 ? "baru" : "selesai",
      state: states.get(key) ?? "tampil",
      last: decided,
    };
  });
  // New cases first, the one waiting longest on top; closed ones by their latest decision.
  return rows.sort((a, b) =>
    a.status !== b.status
      ? a.status === "baru"
        ? -1
        : 1
      : a.status === "baru"
        ? a.since - b.since
        : (b.last?.at ?? 0) - (a.last?.at ?? 0),
  );
}

export type CaseFilter = "baru" | "selesai" | "semua";
export const CASE_FILTERS: readonly { id: CaseFilter; label: string }[] = [
  { id: "baru", label: "Baru" },
  { id: "selesai", label: "Selesai" },
  { id: "semua", label: "Semua" },
];

export const parseCaseFilter = (raw: string | null): CaseFilter =>
  CASE_FILTERS.some((f) => f.id === raw) ? (raw as CaseFilter) : "baru";

export const caseQuery = (filter: CaseFilter) => (filter === "baru" ? "" : `?status=${filter}`);

export const applyCaseFilter = (rows: readonly CaseRow[], filter: CaseFilter) =>
  filter === "semua" ? [...rows] : rows.filter((r) => r.status === filter);

export function countCases(rows: readonly CaseRow[]): Record<CaseFilter, number> {
  return {
    baru: rows.filter((r) => r.status === "baru").length,
    selesai: rows.filter((r) => r.status === "selesai").length,
    semua: rows.length,
  };
}

export const emptyText: Record<CaseFilter, string> = {
  baru: "Tidak ada laporan baru.",
  selesai: "Belum ada kasus yang selesai.",
  semua: "Belum ada laporan.",
};

/** What a moderator may do next. A deleted content is final; only the author can still be acted on. */
export function allowedDecisions(state: ContentState): Decision[] {
  if (state === "dihapus") return ["tangguhkan"];
  if (state === "disembunyikan") return ["pulihkan", "hapus", "tangguhkan"];
  return ["abaikan", "sembunyikan", "hapus", "tangguhkan"];
}

/** A note is written for everything except ignoring a report and restoring content. */
export const decisionNeedsReason = (decision: Decision) =>
  decision !== "abaikan" && decision !== "pulihkan";

export const decisionLabel: Record<Decision, string> = {
  abaikan: "Abaikan laporan",
  sembunyikan: "Sembunyikan",
  hapus: "Hapus",
  pulihkan: "Pulihkan",
  tangguhkan: "Tangguhkan penulis",
};

export const stateLabel: Record<ContentState, string> = {
  tampil: "Tampil",
  disembunyikan: "Disembunyikan",
  dihapus: "Dihapus",
};

/** The content a case is about, found among everything Community holds. */
export type CaseContent = {
  authorId: string;
  /** The post's title, or for a comment the title of the post it is under. */
  title: string;
  text: string;
  /** Where to read it in context; null when the content cannot be found. */
  href: string | null;
};

export function contentOf(
  kind: ReportKind,
  targetId: string,
  posts: readonly Post[],
  comments: readonly Comment[],
): CaseContent | null {
  if (kind === "post") {
    const post = posts.find((p) => p.id === targetId);
    if (!post) return null;
    return {
      authorId: post.authorId,
      title: post.title,
      text: post.blocks.map((b) => b.text).join("\n\n"),
      href: `/postingan/${post.id}`,
    };
  }
  const comment = comments.find((c) => c.id === targetId);
  if (!comment) return null;
  const post = posts.find((p) => p.id === comment.postId);
  return {
    authorId: comment.authorId,
    title: post?.title ?? "Tulisan tidak ditemukan",
    text: comment.text,
    href: post ? `/postingan/${post.id}` : null,
  };
}

export const excerpt = (text: string, limit = 120) =>
  text.length <= limit ? text : `${text.slice(0, limit).trimEnd()}…`;
