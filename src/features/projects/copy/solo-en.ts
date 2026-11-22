import type { projectsSolo as source } from "./solo-id";

export const projectsSolo: typeof source = {
  loading: "Loading publishing dashboard",
  back: "Back to project",
  loadError:
    "The publishing dashboard could not be opened. The data on this device could not be read.",
  eyebrow: "Publishing dashboard",
  packageFact: "{name} package",
  workFact: "Manuscript: {title}",
  stagePosition: "Stage {index} of {total} · {label}",
  figure: {
    notSubmitted: "Manuscript not submitted",
    rejected: "Submission not accepted",
    revision: "Revision needed",
    reviewing: "Under review",
  },
  stage: {
    label: {
      pengajuan: "Submission",
      penyuntingan: "Editing",
      proofreading: "Proofreading",
      cover: "Cover design",
      layout: "Book layout",
      "persetujuan-final": "Final approval",
      produksi: "Production",
      selesai: "Done",
    },
    hint: {
      pengajuan: "The publishing team reviews whether your manuscript is suitable.",
      penyuntingan: "Your manuscript is being edited.",
      proofreading: "Your manuscript is checked for spelling and punctuation.",
      cover: "Your book's cover is being designed.",
      layout: "Your book's pages are being laid out.",
      "persetujuan-final": "Check the previews, then approve or ask for changes.",
      produksi: "Your book is being printed and prepared.",
      selesai: "The publishing of your book is complete.",
    },
    state: {
      selesai: "Done",
      berjalan: "In progress",
      menunggu: "Not started",
    },
    title: "Publishing stages",
  },
  phase: {
    sendManuscript: "Submit manuscript",
    notStarted: "Publishing begins once your manuscript is submitted and accepted.",
    viewSubmission: "View submission",
    rejected: "Your submission was not accepted.",
    revision: "The team asked for a revision of your manuscript.",
    teamNote: " Team note: {reason}",
    sendRevision: "Send revision",
    reviewing: "Your submission is under review. The next stage begins once it is accepted.",
  },
  approved: "You approved the final version on {date}. Production can no longer be changed.",
  blocked: {
    tamu: "Sign in to open the publishing dashboard.",
    "belum-terdaftar": "The publishing dashboard is only open to authors who have registered.",
    "menunggu-pembayaran":
      "The publishing dashboard opens once your payment is confirmed. Your registration is already recorded.",
    register: "Register",
    viewProject: "View project",
  },
  previews: {
    title: "Preview files",
    kind: { cover: "Cover", layout: "Book layout" },
    versionLine: "{kind} · version {n}",
    imageAlt: "{kind} version {n}",
    empty:
      "No files yet. Previews of the cover and the book layout appear here once the team prepares them.",
    sampleNote: "Sample: a file that is only a description cannot be downloaded yet.",
  },
  approval: {
    title: "Final approval",
    checkAbove: "Check the previews above. ",
    notReady:
      "The team has not uploaded all previews yet. You can decide once the cover and the book layout are ready to view. ",
    irreversible: "Once you approve, production begins and cannot be cancelled.",
    roundsLeft: " You can still ask for changes {left} more times.",
    roundsOut: " You have used all your change requests.",
    requested: "Changes requested {date}",
    approve: "Approve",
    requestChanges: "Request changes",
    cancel: "Cancel",
    confirmTitle: "Approve the final version?",
    confirmBody:
      "Once approved, your book goes into production. Changes can no longer be requested and the approval cannot be undone.",
    confirmAction: "Approve and start production",
    changesTitle: "Request changes",
    changesBody:
      "Write what needs to change. The team will fix it, then ask for your approval again.",
    send: "Send request",
    noteLabel: "Changes requested",
    noteRequired: "Write the changes you are asking for.",
    stale: "This book's stage has changed. Reload the page, then try again.",
    failed: "Could not save. Try again.",
  },
};
