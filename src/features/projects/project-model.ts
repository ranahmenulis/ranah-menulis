import { PROJECTS_HREF } from "@/features/app-shell/nav";
import type { Locale } from "@/lib/i18n/config";
import { formatDate, formatNumber as formatLocaleNumber } from "@/lib/i18n/format";
import { catalogCopy } from "./copy/catalog";
import type {
  CategoryFilter,
  FeeFilter,
  Filters,
  Money,
  Project,
  ProjectCategory,
  ProjectFixture,
  ProjectState,
  StateFilter,
  TimeZoneName,
} from "./types";

export const HOUR = 60 * 60 * 1000;
export const DAY = 24 * HOUR;
/** [usulan] A project closes "soon" in its last seven calendar days. */
const SOON_DAYS = 7;
/** Neither zone has daylight saving, so a fixed offset is exact. */
const ZONES: Record<TimeZoneName, { iana: string; hours: number }> = {
  WIB: { iana: "Asia/Jakarta", hours: 7 },
  MYT: { iana: "Asia/Kuala_Lumpur", hours: 8 },
};

/** The IANA name of a project zone, for formatting a moment the way the project reads it. */
export const zoneIana = (zone: TimeZoneName): string => ZONES[zone].iana;

/** Calendar day number of a moment in the project's zone. */
function dayNumber(timestamp: number, zone: TimeZoneName): number {
  return Math.floor((timestamp + ZONES[zone].hours * HOUR) / DAY);
}

/** The last millisecond of that calendar day in the zone: the deadline is the end of its day. */
export function endOfDay(timestamp: number, zone: TimeZoneName): number {
  return (dayNumber(timestamp, zone) + 1) * DAY - ZONES[zone].hours * HOUR - 1;
}

/** The first millisecond of that calendar day in the zone. */
export function startOfDay(timestamp: number, zone: TimeZoneName): number {
  return dayNumber(timestamp, zone) * DAY - ZONES[zone].hours * HOUR;
}

const ID_COPY = catalogCopy("id");

export const CATEGORIES: { id: CategoryFilter; label: string; description: string }[] = (
  ["semua", "antologi", "solo", "kelas", "lomba"] as const
).map((id) => ({ id, ...ID_COPY.categories[id] }));

export const STATE_FILTERS: { id: StateFilter; label: string }[] = (
  ["semua", "buka", "segera-tutup", "ditutup"] as const
).map((id) => ({ id, label: ID_COPY.stateFilters[id] }));

export const FEE_FILTERS: { id: FeeFilter; label: string }[] = (
  ["semua", "gratis", "berbayar"] as const
).map((id) => ({ id, label: ID_COPY.feeFilters[id] }));

export const DEFAULT_FILTERS: Filters = { category: "semua", state: "semua", fee: "semua" };

export const projectHref = (slug: string) => `${PROJECTS_HREF}/${slug}`;

export function categoryLabel(id: ProjectCategory, locale: Locale = "id"): string {
  return catalogCopy(locale).categories[id]?.label ?? id;
}

/**
 * Fixture offsets become absolute times, once, when the page opens. The registration deadline
 * lands on the end of its day in the project's zone [usulan], so "Tutup 25 Nov" means all of 25 Nov.
 */
export function resolveProjects(fixtures: ProjectFixture[], now: number): Project[] {
  return fixtures.map(({ closesInMs, milestones, absolute, ...rest }) => ({
    ...rest,
    closesAt: absolute
      ? absolute.closesAt
      : closesInMs === null
        ? null
        : endOfDay(now + closesInMs, rest.timeZone),
    milestones: absolute
      ? absolute.milestones
      : milestones.map((m) => ({ label: m.label, at: now + m.inMs })),
  }));
}

function daysLeft(closesAt: number, now: number, zone: TimeZoneName): number {
  return dayNumber(closesAt, zone) - dayNumber(now, zone);
}

export function projectState(project: Project, now: number): ProjectState {
  const { closesAt, quota } = project;
  if (closesAt !== null && closesAt < now) return "ditutup";
  if (quota && quota.taken >= quota.total) return "kuota-penuh";
  if (closesAt !== null && daysLeft(closesAt, now, project.timeZone) <= SOON_DAYS) {
    return "segera-tutup";
  }
  return "buka";
}

/** Seats left, or `null` when the project has no quota. */
export function quotaLeft(project: Project): number | null {
  if (!project.quota) return null;
  return Math.max(0, project.quota.total - project.quota.taken);
}

/** 1234567 → "1.234.567" (id) or "1,234,567" (en), like every other count in the app. */
export const formatNumber = (n: number, locale: Locale = "id"): string =>
  formatLocaleNumber(n, locale);

/** Rupiah as "Rp12.500.000"; ringgit from sen as "RM25" or "RM25,50" ("RM25.50" in English). */
export function formatMoney(
  amount: number,
  currency: "idr" | "myr",
  locale: Locale = "id",
): string {
  if (currency === "idr") return `Rp${formatNumber(amount, locale)}`;
  const whole = Math.floor(amount / 100);
  const sen = amount % 100;
  const point = locale === "en" ? "." : ",";
  return sen === 0
    ? `RM${formatNumber(whole, locale)}`
    : `RM${formatNumber(whole, locale)}${point}${String(sen).padStart(2, "0")}`;
}

/** Currencies that have a price above zero, rupiah first; empty means free. */
function moneyParts(fee: Money, locale: Locale = "id"): string[] {
  return [
    fee.idr !== undefined && fee.idr > 0 ? formatMoney(fee.idr, "idr", locale) : null,
    fee.myr !== undefined && fee.myr > 0 ? formatMoney(fee.myr, "myr", locale) : null,
  ].filter((v): v is string => v !== null);
}

/** "Rp75.000 · RM25", or "Gratis" when nothing is charged. */
export function moneyLabel(fee: Money, locale: Locale = "id"): string {
  const parts = moneyParts(fee, locale);
  return parts.length > 0 ? parts.join(" · ") : catalogCopy(locale).fee.free;
}

/** What the page charges: the cheapest paid package for Solo (a starting price), else the fee. */
export function effectiveFee(project: Project): Money {
  if (project.block.kind !== "solo") return project.fee;
  const { packages } = project.block;
  const pick = (key: "idr" | "myr") => {
    // A zero-priced package must not make the whole service look free.
    const prices = packages.map((p) => p.fee[key]).filter((v): v is number => (v ?? 0) > 0);
    return prices.length > 0 ? Math.min(...prices) : undefined;
  };
  return { idr: pick("idr"), myr: pick("myr") };
}

export function isFreeMoney(fee: Money): boolean {
  return moneyParts(fee).length === 0;
}

export function isFree(project: Project): boolean {
  return isFreeMoney(effectiveFee(project));
}

/** One entry per currency that has a price, rupiah first. Empty when the project is free. */
export function feeLines(project: Project, locale: Locale = "id"): string[] {
  return moneyParts(effectiveFee(project), locale);
}

export function feeLabel(project: Project, locale: Locale = "id"): string {
  const copy = catalogCopy(locale);
  if (isFree(project)) return copy.fee.free;
  const prefix = project.block.kind === "solo" ? `${copy.fee.startingFrom} ` : "";
  return `${prefix}${feeLines(project, locale).join(" · ")}`;
}

/** "25 Nov 2026" in the project's own zone, so the deadline reads the same for everyone (BR-PRJ-04). */
export function formatProjectDate(
  timestamp: number,
  zone: TimeZoneName,
  locale: Locale = "id",
): string {
  return formatDate(timestamp, locale, {
    timeZone: ZONES[zone].iana,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "25 Nov 2026, 14.30" in the project's zone: a payment hold ends at a time, not a day. */
export function formatProjectDateTime(
  timestamp: number,
  zone: TimeZoneName,
  locale: Locale = "id",
): string {
  return formatDate(timestamp, locale, {
    timeZone: ZONES[zone].iana,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

export function daysLeftLabel(
  closesAt: number,
  now: number,
  zone: TimeZoneName,
  locale: Locale = "id",
): string {
  const copy = catalogCopy(locale).daysLeft;
  const days = Math.max(0, daysLeft(closesAt, now, zone));
  return days === 0 ? copy.lastDay : copy.days.replace("{n}", String(days));
}

/** Buka still counts a project that is closing soon; Ditutup counts a full one (BR-PRJ-04). */
function matchesState(filter: StateFilter, state: ProjectState): boolean {
  if (filter === "buka") return state === "buka" || state === "segera-tutup";
  if (filter === "segera-tutup") return state === "segera-tutup";
  if (filter === "ditutup") return state === "ditutup" || state === "kuota-penuh";
  return true;
}

function matchesFee(filter: FeeFilter, project: Project): boolean {
  if (filter === "gratis") return isFree(project);
  if (filter === "berbayar") return !isFree(project);
  return true;
}

/** Whole catalog filter. Drafts are never listed (PRJ-01). Order of the fixtures is kept. */
export function filterProjects(list: Project[], filters: Filters, now: number): Project[] {
  return list.filter(
    (project) =>
      project.publication === "terbit" &&
      (filters.category === "semua" || project.category === filters.category) &&
      matchesState(filters.state, projectState(project, now)) &&
      matchesFee(filters.fee, project),
  );
}

type Params = Record<string, string | string[] | undefined>;

function pick<T extends string>(value: string | string[] | undefined, allowed: T[], fallback: T) {
  return typeof value === "string" && (allowed as string[]).includes(value)
    ? (value as T)
    : fallback;
}

/** Reads `?kategori=&status=&biaya=`; anything unknown falls back to "semua". */
export function parseFilters(params: Params): Filters {
  return {
    category: pick(
      params.kategori,
      CATEGORIES.map((c) => c.id),
      "semua",
    ),
    state: pick(
      params.status,
      STATE_FILTERS.map((s) => s.id),
      "semua",
    ),
    fee: pick(
      params.biaya,
      FEE_FILTERS.map((f) => f.id),
      "semua",
    ),
  };
}

/** The address query for a set of filters; only values that differ from the defaults. */
export function toQuery(filters: Filters): string {
  const query = new URLSearchParams();
  if (filters.category !== "semua") query.set("kategori", filters.category);
  if (filters.state !== "semua") query.set("status", filters.state);
  if (filters.fee !== "semua") query.set("biaya", filters.fee);
  const text = query.toString();
  return text ? `?${text}` : "";
}
