import { PROJECTS_HREF } from "@/features/app-shell/nav";
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

export const CATEGORIES: { id: CategoryFilter; label: string; description: string }[] = [
  {
    id: "semua",
    label: "Semua",
    description: "Program untuk menulis, berkolaborasi, berkompetisi, dan menerbitkan buku.",
  },
  {
    id: "antologi",
    label: "Antologi",
    description:
      "Satu buku bertema dari banyak penulis. Naskahmu diseleksi, direvisi bersama editor, lalu masuk produksi.",
  },
  {
    id: "solo",
    label: "Solo",
    description: "Menerbitkan satu bukumu sendiri, dari penyuntingan sampai produksi.",
  },
  {
    id: "kelas",
    label: "Kelas Menulis",
    description: "Kelas, workshop, dan mentoring menulis dengan tugas dan umpan balik dari mentor.",
  },
  {
    id: "lomba",
    label: "Lomba",
    description:
      "Kompetisi menulis dengan tenggat, penjurian berkriteria, dan pengumuman pemenang.",
  },
];

export const STATE_FILTERS: { id: StateFilter; label: string }[] = [
  { id: "semua", label: "Semua status" },
  { id: "buka", label: "Buka" },
  { id: "segera-tutup", label: "Segera tutup" },
  { id: "ditutup", label: "Ditutup" },
];

export const FEE_FILTERS: { id: FeeFilter; label: string }[] = [
  { id: "semua", label: "Semua biaya" },
  { id: "gratis", label: "Gratis" },
  { id: "berbayar", label: "Berbayar" },
];

export const DEFAULT_FILTERS: Filters = { category: "semua", state: "semua", fee: "semua" };

export const projectHref = (slug: string) => `${PROJECTS_HREF}/${slug}`;

export function categoryLabel(id: ProjectCategory): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

/**
 * Fixture offsets become absolute times, once, when the page opens. The registration deadline
 * lands on the end of its day in the project's zone [usulan], so "Tutup 25 Nov" means all of 25 Nov.
 */
export function resolveProjects(fixtures: ProjectFixture[], now: number): Project[] {
  return fixtures.map(({ closesInMs, milestones, ...rest }) => ({
    ...rest,
    closesAt: closesInMs === null ? null : endOfDay(now + closesInMs, rest.timeZone),
    milestones: milestones.map((m) => ({ label: m.label, at: now + m.inMs })),
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

/** 1234567 → "1.234.567", like every other count in the app. */
export const formatNumber = (n: number): string => n.toLocaleString("id-ID");

/** Rupiah as "Rp12.500.000"; ringgit from sen as "RM25" or "RM25,50". */
export function formatMoney(amount: number, currency: "idr" | "myr"): string {
  if (currency === "idr") return `Rp${formatNumber(amount)}`;
  const whole = Math.floor(amount / 100);
  const sen = amount % 100;
  return sen === 0
    ? `RM${formatNumber(whole)}`
    : `RM${formatNumber(whole)},${String(sen).padStart(2, "0")}`;
}

/** Currencies that have a price above zero, rupiah first; empty means free. */
function moneyParts(fee: Money): string[] {
  return [
    fee.idr !== undefined && fee.idr > 0 ? formatMoney(fee.idr, "idr") : null,
    fee.myr !== undefined && fee.myr > 0 ? formatMoney(fee.myr, "myr") : null,
  ].filter((v): v is string => v !== null);
}

/** "Rp75.000 · RM25", or "Gratis" when nothing is charged. */
export function moneyLabel(fee: Money): string {
  const parts = moneyParts(fee);
  return parts.length > 0 ? parts.join(" · ") : "Gratis";
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
export function feeLines(project: Project): string[] {
  return moneyParts(effectiveFee(project));
}

export function feeLabel(project: Project): string {
  if (isFree(project)) return "Gratis";
  return `${project.block.kind === "solo" ? "Mulai dari " : ""}${feeLines(project).join(" · ")}`;
}

/** "25 Nov 2026" in the project's own zone, so the deadline reads the same for everyone (BR-PRJ-04). */
export function formatProjectDate(timestamp: number, zone: TimeZoneName): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: ZONES[zone].iana,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(timestamp);
}

/** "25 Nov 2026, 14.30" in the project's zone: a payment hold ends at a time, not a day. */
export function formatProjectDateTime(timestamp: number, zone: TimeZoneName): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: ZONES[zone].iana,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

export function daysLeftLabel(closesAt: number, now: number, zone: TimeZoneName): string {
  const days = Math.max(0, daysLeft(closesAt, now, zone));
  return days === 0 ? "Hari ini hari terakhir" : `${days} hari lagi`;
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
