import type { ModerationEntry, ReportKind } from "./report-store";

/** How a moderator left a piece of content: visible, hidden (can be restored) or deleted (final). */
export type ContentState = "tampil" | "disembunyikan" | "dihapus";

/**
 * The state from the decisions: the last one that is about visibility counts. Suspending the author
 * closes a case but leaves the content as it was.
 */
export function contentState(
  entries: readonly ModerationEntry[],
  kind: ReportKind,
  targetId: string,
): ContentState {
  let state: ContentState = "tampil";
  for (const e of entries) {
    if (e.kind !== kind || e.targetId !== targetId || e.decision === "tangguhkan") continue;
    if (state === "dihapus") break;
    state =
      e.decision === "sembunyikan"
        ? "disembunyikan"
        : e.decision === "hapus"
          ? "dihapus"
          : "tampil";
  }
  return state;
}

/** Ids a moderator took down, so a screen can drop them with a set lookup. */
export function removedIds(entries: readonly ModerationEntry[]) {
  const posts = new Set<string>();
  const comments = new Set<string>();
  for (const e of entries) {
    const set = e.kind === "post" ? posts : comments;
    if (contentState(entries, e.kind, e.targetId) === "tampil") set.delete(e.targetId);
    else set.add(e.targetId);
  }
  return { posts, comments };
}
