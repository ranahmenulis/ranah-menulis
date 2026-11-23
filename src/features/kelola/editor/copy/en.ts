import type { kelolaEditor as source } from "./id";

export const kelolaEditor: typeof source = {
  queue: {
    title: "Submission queue",
    description: "Works assigned to you for review.",
    loading: "Loading queue",
    loadError: "The queue could not be opened because the data on this device could not be read.",
    filterGroup: "Filter the queue",
    seeAll: "See all works",
    filters: {
      "perlu-tindakan": "Needs action",
      ditinjau: "In review",
      "menunggu-revisi": "Awaiting revision",
      selesai: "Done",
      semua: "All",
    },
    empty: {
      "perlu-tindakan": "No works are waiting for your action.",
      ditinjau: "You are not reviewing any work right now.",
      "menunggu-revisi": "No works are waiting for a participant's revision.",
      selesai: "You have not decided on any work yet.",
      semua: "No work has come in for you to review yet.",
    },
  },
  table: {
    work: "Work",
    status: "Status",
    words: "Words",
    waitingSince: "Waiting since",
    revisions: "Revisions",
    waitingSincePrefix: "Waiting since ",
    revisionsPrefix: "Revisions ",
    revisionsOf: "{n} of {max}",
  },
  review: {
    back: "Submission queue",
    backToQueue: "Back to the queue",
    loading: "Loading work",
    loadError: "The work could not be opened because the data on this device could not be read.",
    goneTitle: "This work was not found.",
    goneNotice: "This submission is not on this device. The address may be wrong.",
    blockedTitle: "Cannot be opened.",
    blocked: {
      "tidak-ditugaskan": "This work is not assigned to you.",
      "bukan-karya-editor":
        "This work is not reviewed through the Editor queue. Contests are scored by Judges, and class assignments are checked by Mentors.",
    },
    byLine: "by {name} · {genre} · {size} · sent {date}",
    info: {
      package: "Package",
      synopsis: "Synopsis",
      note: "Participant's note for the editor",
    },
    text: {
      title: "Manuscript",
      noFrozen: "This work has no frozen copy.",
      versionGroup: "Manuscript version",
      version: "Version {n}",
      latest: " (latest)",
      line: "Version {n} · {size} · frozen {date}",
    },
    hints: {
      draf: "This work has not been sent.",
      terkirim: "This work is waiting for you to start reviewing.",
      peninjauan: "This work is under review. Decide to accept, reject, or request a revision.",
      "perlu-revisi": "Waiting for the participant's revision.",
      "revisi-terkirim":
        "The participant has sent a revision and is waiting for you to review again.",
      diterima: "This work has been accepted.",
      ditolak: "This work has been rejected.",
      ditarik: "The participant withdrew this work, so it no longer needs review.",
    },
  },
  steps: {
    labels: {
      peninjauan: "Start review",
      "perlu-revisi": "Request revision",
      diterima: "Accept",
      ditolak: "Reject",
    },
    revisionLimit: "The revision round limit has been reached. Decide to Accept or Reject.",
    dialogs: {
      "perlu-revisi": {
        title: "Request revision",
        hint: "The participant gets seven days to send a revision. Write what needs to be fixed.",
      },
      diterima: {
        title: "Accept this work",
        hint: "This decision is final and the participant will be told. Write your reason.",
      },
      ditolak: {
        title: "Reject this work",
        hint: "This decision is final and the participant will be told. Write a reason they can read.",
      },
    },
  },
  decision: {
    title: "Next steps",
    saveFailed:
      "The decision was not saved because the data on this device could not be written. Try again in a moment.",
    rejected:
      "This work's status has changed, so that step cannot be taken. The view has been refreshed.",
    missing: "This work could not be found anymore.",
  },
};
