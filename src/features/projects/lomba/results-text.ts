import { formatProjectDate } from "../project-model";
import type { Project } from "../types";
import { announcementDates } from "./contest-model";
import type { ContestStage } from "./types";

/**
 * One or two sentences that say where the contest stands and what comes next, with the date. A
 * contest that has not announced anything still says when, so the page is never an empty promise.
 */
export function stageSentence(project: Project, stage: ContestStage): string {
  const zone = project.timeZone;
  const { finalists, winners } = announcementDates(project);
  const date = (at: number | null) => (at === null ? null : formatProjectDate(at, zone));
  const next = (label: string, at: number | null) =>
    at === null ? "" : ` ${label} diumumkan ${date(at)}.`;

  switch (stage) {
    case "terbuka":
      return `Penerimaan karya masih dibuka${
        project.closesAt === null ? "" : ` sampai ${date(project.closesAt)}`
      }. Hasil diumumkan setelah penilaian.${next("Pemenang", winners)}`;
    case "dinilai":
      return `Penerimaan karya sudah ditutup dan karya sedang dinilai juri.${
        finalists !== null ? next("Finalis", finalists) : next("Pemenang", winners)
      }`;
    case "finalis":
      return `Finalis sudah diumumkan.${next("Pemenang", winners)}`;
    case "pemenang":
      return `Pemenang sudah diumumkan${winners === null ? "" : ` pada ${date(winners)}`}. Pengumuman tidak diubah tanpa catatan audit.`;
  }
}
