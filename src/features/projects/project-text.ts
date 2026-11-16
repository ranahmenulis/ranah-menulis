import { formatNumber, formatProjectDate, quotaLeft } from "./project-model";
import type { Project, ProjectState } from "./types";

export const stateLabel: Record<ProjectState, string> = {
  buka: "Buka",
  "segera-tutup": "Segera tutup",
  "kuota-penuh": "Kuota penuh",
  ditutup: "Ditutup",
};

/** "Tutup 25 Nov 2026 WIB", "Ditutup 4 Nov 2026 WIB", or "Dibuka sepanjang tahun" [usulan]. */
export function deadlineText(project: Project, state: ProjectState): string {
  if (project.closesAt === null) return "Dibuka sepanjang tahun";
  const date = `${formatProjectDate(project.closesAt, project.timeZone)} ${project.timeZone}`;
  return state === "ditutup" ? `Ditutup ${date}` : `Tutup ${date}`;
}

/** "Sisa 9 dari 40 kuota", "Kuota penuh", or `null` when there is no quota. */
export function quotaText(project: Project): string | null {
  const left = quotaLeft(project);
  if (left === null || !project.quota) return null;
  return left === 0
    ? "Kuota penuh"
    : `Sisa ${formatNumber(left)} dari ${formatNumber(project.quota.total)} kuota`;
}
