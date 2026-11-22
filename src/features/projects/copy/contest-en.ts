import type { projectsContest as source } from "./contest-id";

export const projectsContest: typeof source = {
  loading: "Loading contest results",
  back: "Back to project",
  kicker: "Contest results",
  ownFinalist: "Your work “{title}” is among the finalists.",
  stageLabel: {
    terbuka: "Open for entries",
    dinilai: "Being judged",
    finalis: "Finalists announced",
    pemenang: "Winners announced",
  },
  sentence: {
    open: "Entries are still open{until}. Results are announced after judging.{next}",
    until: " until {date}",
    judging: "Entries are closed and the judges are reading the work.{next}",
    finalists: "The finalists have been announced.{next}",
    winners:
      "The winners have been announced{on}. The announcement is not changed without an audit note.",
    on: " on {date}",
    next: " {label} will be announced on {date}.",
    winnersWord: "Winners",
    finalistsWord: "Finalists",
  },
  finalistName: "Finalist {n}",
  lists: {
    sectionBoth: "Finalists and winners",
    notYet: "The finalists have not been announced. The list appears on this page once they are.",
    finalists: "Finalists",
    noFinalists: "The list of finalists is not available yet.",
    mine: " · your work",
    winners: "Winners",
    noWinners: "The list of winners is not available yet.",
    place: "Place {rank}",
    tie: " (tie)",
    jurorNote: "Judges' note: {note}",
  },
  schedule: {
    title: "Schedule",
    closed: "Entries close",
    finalists: "Finalists announced",
    winners: "Winners announced",
    done: " · done",
  },
  criteria: {
    title: "Judging criteria",
    anonymous:
      "Anonymous judging: judges do not see the author's name. Names are revealed when the winners are announced.",
  },
};
