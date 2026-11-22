import type { Locale } from "@/lib/i18n/config";
import { catalogCopy } from "./copy/catalog";
import { formatNumber, formatProjectDate, quotaLeft } from "./project-model";
import type { Project, ProjectState } from "./types";

/** Indonesian labels; use `stateLabelOf` for the interface language. */
export const stateLabel: Record<ProjectState, string> = catalogCopy("id").states;

export const stateLabelOf = (state: ProjectState, locale: Locale = "id"): string =>
  catalogCopy(locale).states[state];

/** "Tutup 25 Nov 2026 WIB", "Ditutup 4 Nov 2026 WIB", or "Dibuka sepanjang tahun" [usulan]. */
export function deadlineText(project: Project, state: ProjectState, locale: Locale = "id"): string {
  const copy = catalogCopy(locale).deadline;
  if (project.closesAt === null) return copy.yearRound;
  const date = `${formatProjectDate(project.closesAt, project.timeZone, locale)} ${project.timeZone}`;
  return (state === "ditutup" ? copy.closed : copy.closes).replace("{date}", date);
}

/** "Sisa 9 dari 40 kuota", "Kuota penuh", or `null` when there is no quota. */
export function quotaText(project: Project, locale: Locale = "id"): string | null {
  const left = quotaLeft(project);
  if (left === null || !project.quota) return null;
  const copy = catalogCopy(locale).quota;
  return left === 0
    ? copy.full
    : copy.left
        .replace("{left}", formatNumber(left, locale))
        .replace("{total}", formatNumber(project.quota.total, locale));
}
