import type { kelolaModeration as source } from "./moderation-id";

export const kelolaModeration: typeof source = {
  decisions: {
    abaikan: "Dismiss report",
    sembunyikan: "Hide",
    hapus: "Delete",
    pulihkan: "Restore",
    tangguhkan: "Suspend author",
  },
  hints: {
    abaikan: "The report is closed and the content stays visible.",
    sembunyikan: "The content disappears from all lists and can be restored. Recorded in the log.",
    hapus: "The content is deleted and cannot be restored. Recorded in the log.",
    pulihkan: "The content is visible again. Recorded in the log.",
    tangguhkan:
      "The author's account is suspended and their roles stop applying. Recorded in the log.",
  },
  states: {
    tampil: "Visible",
    disembunyikan: "Hidden",
    dihapus: "Deleted",
  },
  filters: { baru: "New", selesai: "Done", semua: "All" },
  empty: {
    baru: "No new reports.",
    selesai: "No cases are done yet.",
    semua: "No reports yet.",
  },
  postMissing: "Post not found",
  queue: {
    title: "Moderation",
    intro:
      "Reports on posts and comments. Duplicate reports on the same content are merged, and reporters are not shown.",
    loading: "Loading reports",
    loadError: "The reports could not be opened because the data on this device could not be read.",
    filterLabel: "Filter reports",
    viewAll: "View all reports",
    listLabel: "Cases",
    post: "Post",
    comment: "Comment",
    contentMissing: "Content not found",
    summary: "{reports} reports · {reason} · {when}",
  },
  case: {
    back: "Moderation queue",
    gone: "This report was not found.",
    postTitle: "Post reported",
    commentTitle: "Comment reported",
    statusNew: "New report",
    statusDone: "Done",
    summary: "{state} · {status} · {reports} reports",
    last: "Last decision: {decision}, {when}",
    lastWithReason: "Last decision: {decision}, {when} · {reason}",
    decisionTitle: "Decision",
    contentTitle: "Content",
    under: "Under “{title}”",
    openInContext: "Open in context",
    contentGone: "This content can no longer be found.",
    reasonsTitle: "Report reasons",
    reasonCount: "{count} reports",
    reporterNote: "Reporters are not shown and are not told.",
  },
};
