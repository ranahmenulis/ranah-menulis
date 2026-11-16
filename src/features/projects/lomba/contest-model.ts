import { projectHref } from "../project-model";
import type { Project } from "../types";
import type { ContestEntry, ContestResults, ContestStage, ContestWinner } from "./types";

/** The milestones that announce results: the project fixtures already carry them. */
export const FINALIST_LABEL = "Pengumuman finalis";
export const WINNER_LABEL = "Pengumuman pemenang";

export const resultsHref = (slug: string) => `${projectHref(slug)}/hasil`;

const ORDER: ContestStage[] = ["terbuka", "dinilai", "finalis", "pemenang"];
export const stageRank = (stage: ContestStage) => ORDER.indexOf(stage);

export const stageLabel: Record<ContestStage, string> = {
  terbuka: "Penerimaan karya",
  dinilai: "Sedang dinilai",
  finalis: "Finalis diumumkan",
  pemenang: "Pemenang diumumkan",
};

/** When each announcement happens, from the project's milestones. `null` when it has no such date. */
export function announcementDates(project: Project): {
  finalists: number | null;
  winners: number | null;
} {
  const at = (label: string) => project.milestones.find((m) => m.label === label)?.at ?? null;
  return { finalists: at(FINALIST_LABEL), winners: at(WINNER_LABEL) };
}

/**
 * The stage the dates say. [usulan] A contest is open for work until its deadline; then judging,
 * until the finalists are announced (a contest with no finalist date goes straight to winners),
 * then until the winners are.
 */
export function stageByDate(project: Project, now: number): ContestStage {
  if (project.closesAt === null || now <= project.closesAt) return "terbuka";
  const { finalists, winners } = announcementDates(project);
  if (winners !== null && now >= winners) return "pemenang";
  if (finalists !== null && now >= finalists) return "finalis";
  return "dinilai";
}

/**
 * The stage shown: the later of the dates and anything a development-only panel pushed forward.
 * An announcement is never taken back (PRD 17.5: it cannot be changed without an audit note), so
 * an override can only move the stage on.
 */
export function contestStage(project: Project, now: number, override?: ContestStage): ContestStage {
  const byDate = stageByDate(project, now);
  return override && stageRank(override) > stageRank(byDate) ? override : byDate;
}

/**
 * [usulan, Q-28 does not say who may see identities afterwards] An anonymous contest shows its
 * finalists without names until the winners are announced; any other contest shows names from the
 * finalists on.
 */
export function namesRevealed(anonymous: boolean, stage: ContestStage): boolean {
  return anonymous ? stage === "pemenang" : stageRank(stage) >= stageRank("finalis");
}

/** "Finalis 3": how an unnamed finalist is called. */
export const finalistLabel = (index: number) => `Finalis ${index + 1}`;

export type RankedWinner = ContestWinner & { entry: ContestEntry; tie: boolean };

/** Winners from first place down. Entries that are gone are dropped; equal ranks are marked a tie. */
export function rankedWinners(results: ContestResults): RankedWinner[] {
  const rows = results.winners.flatMap((w) => {
    const entry = results.finalists.find((f) => f.id === w.entryId);
    return entry ? [{ ...w, entry }] : [];
  });
  const perRank = new Map<number, number>();
  for (const row of rows) perRank.set(row.rank, (perRank.get(row.rank) ?? 0) + 1);
  return rows
    .map((row) => ({ ...row, tie: (perRank.get(row.rank) ?? 0) > 1 }))
    .sort(
      (a, b) => a.rank - b.rank || a.entry.id.localeCompare(b.entry.id, "id", { numeric: true }),
    );
}

/**
 * The prize of a place, from the project list ("Juara 1: Rp2.000.000" gives "Rp2.000.000"), or
 * `null` when the project lists none for that place.
 */
export function prizeFor(project: Project, rank: number): string | null {
  if (project.block.kind !== "lomba") return null;
  const prize = project.block.prizes[rank - 1];
  return prize ? prize.replace(/^Juara \d+:\s*/, "") : null;
}

export type FinalistRow = { entry: ContestEntry; mine: boolean };

/**
 * The finalists in order, with the reader's own work added when a development panel made it one.
 * It goes last and is told apart, so it is never mistaken for a fixture entry.
 */
export function finalistRows(
  results: ContestResults | null,
  mine: { title: string; genre: string; authorId: string } | null,
): FinalistRow[] {
  const rows = (results?.finalists ?? []).map((entry) => ({ entry, mine: false }));
  if (mine) rows.push({ entry: { id: "mine", ...mine }, mine: true });
  return rows;
}
