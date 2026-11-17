import type { ModerationEntry, ReportKind } from "./report-store";

/** How a moderator left a piece of content: visible, hidden (can be restored) or deleted (final). */
export type ContentState = "tampil" | "disembunyikan" | "dihapus";

/** The state after one more decision. Suspending the author leaves the content as it was. */
export function applyDecision(state: ContentState, decision: ModerationEntry["decision"]) {
  if (state === "dihapus" || decision === "tangguhkan") return state;
  if (decision === "sembunyikan") return "disembunyikan";
  return decision === "hapus" ? "dihapus" : "tampil";
}

export function lastDecision(
  entries: readonly ModerationEntry[],
  kind: ReportKind,
  targetId: string,
): ModerationEntry | null {
  return entries.findLast((e) => e.kind === kind && e.targetId === targetId) ?? null;
}

/**
 * The state from the decisions: the last one that is about visibility counts, and a deleted
 * content stays deleted.
 */
export function contentState(
  entries: readonly ModerationEntry[],
  kind: ReportKind,
  targetId: string,
): ContentState {
  let state: ContentState = "tampil";
  for (const e of entries) {
    if (e.kind === kind && e.targetId === targetId) state = applyDecision(state, e.decision);
  }
  return state;
}

/** Ids a moderator took down, in one pass over the decisions. */
export function removedIds(entries: readonly ModerationEntry[]) {
  const posts = new Map<string, ContentState>();
  const comments = new Map<string, ContentState>();
  for (const e of entries) {
    const states = e.kind === "post" ? posts : comments;
    states.set(e.targetId, applyDecision(states.get(e.targetId) ?? "tampil", e.decision));
  }
  const taken = (states: Map<string, ContentState>) =>
    new Set([...states].filter(([, state]) => state !== "tampil").map(([id]) => id));
  return { posts: taken(posts), comments: taken(comments) };
}
