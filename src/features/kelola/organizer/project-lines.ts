import { startOfDay } from "@/features/projects/project-model";
import { dueAtOf, noonOf, paragraphsOf } from "@/features/projects/kelas/mentor-tasks";
import type { Money, SoloPackage, TimeZoneName } from "@/features/projects/types";

/**
 * Text the Organizer types, one item per line, turned into the structured parts of a project. Each
 * parser returns what it understood and the first line it could not, so the form can name it.
 */
export type Parsed<T> = { items: T[]; bad: string | null };

const lines = (text: string): string[] =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export const linesOf = lines;

/** "Seleksi editor | 2026-12-15": a label and the day it happens (the start of that day). */
export function parseMilestones(
  text: string,
  zone: TimeZoneName,
): Parsed<{ label: string; at: number }> {
  const items: { label: string; at: number }[] = [];
  for (const line of lines(text)) {
    const [label, date] = line.split("|").map((p) => p.trim());
    const noon = date ? noonOf(date) : null;
    if (!label || noon === null) return { items, bad: line };
    items.push({ label, at: startOfDay(noon, zone) });
  }
  return { items, bad: null };
}

export const formatMilestones = (
  list: readonly { label: string; at: number }[],
  zone: TimeZoneName,
): string => list.map((m) => `${m.label} | ${dateInputOf(m.at, zone)}`).join("\n");

/** The "yyyy-mm-dd" a date input shows for a moment, in the project's zone. */
export function dateInputOf(timestamp: number, zone: TimeZoneName): string {
  const shifted = new Date(timestamp + (zone === "WIB" ? 7 : 8) * 3_600_000);
  return shifted.toISOString().slice(0, 10);
}

export const dayEnd = dueAtOf;

export { paragraphsOf };

/** A rupiah amount typed as "75000" or "75.000". `null` when it is not a whole number. */
export function parseRupiah(text: string): number | null {
  const cleaned = text.trim().replace(/\./g, "");
  return /^\d{1,12}$/.test(cleaned) ? Number(cleaned) : null;
}

/** Ringgit typed as "25" or "25,50", stored as sen (BR-PRJ-10). */
export function parseRinggit(text: string): number | null {
  const match = /^(\d{1,9})(?:[.,](\d{1,2}))?$/.exec(text.trim());
  if (!match) return null;
  return Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
}

export const formatRupiah = (idr: number | undefined): string =>
  idr === undefined ? "" : String(idr);
export const formatRinggit = (sen: number | undefined): string =>
  sen === undefined ? "" : (sen / 100).toFixed(2).replace(/\.00$/, "");

export function feeOf(idr: string, myr: string): { fee: Money; bad: "idr" | "myr" | null } {
  const fee: Money = {};
  if (idr.trim()) {
    const value = parseRupiah(idr);
    if (value === null) return { fee, bad: "idr" };
    if (value > 0) fee.idr = value;
  }
  if (myr.trim()) {
    const value = parseRinggit(myr);
    if (value === null) return { fee, bad: "myr" };
    if (value > 0) fee.myr = value;
  }
  return { fee, bad: null };
}

/** "Penerbitan Standar | 1500000 | Layout isi; Desain sampul": a name, a price and what it includes. */
export function parsePackages(text: string): Parsed<SoloPackage> {
  const items: SoloPackage[] = [];
  for (const line of lines(text)) {
    const [name, price, includes] = line.split("|").map((p) => p.trim());
    const idr = price ? parseRupiah(price) : null;
    const list = (includes ?? "")
      .split(";")
      .map((i) => i.trim())
      .filter(Boolean);
    if (!name || idr === null || list.length === 0) return { items, bad: line };
    items.push({ name, fee: { idr }, includes: list });
  }
  return { items, bad: null };
}

export const formatPackages = (list: readonly SoloPackage[]): string =>
  list.map((p) => `${p.name} | ${p.fee.idr ?? 0} | ${p.includes.join("; ")}`).join("\n");

/** "Orisinalitas | 40": a criterion and its weight; the weights must add up to 100. */
export function parseCriteria(text: string): Parsed<{ name: string; weight: number }> {
  const items: { name: string; weight: number }[] = [];
  for (const line of lines(text)) {
    const [name, weight] = line.split("|").map((p) => p.trim());
    const value = weight ? Number(weight) : NaN;
    if (!name || !Number.isInteger(value) || value < 1 || value > 100) return { items, bad: line };
    items.push({ name, weight: value });
  }
  return { items, bad: null };
}

export const formatCriteria = (list: readonly { name: string; weight: number }[]): string =>
  list.map((c) => `${c.name} | ${c.weight}`).join("\n");

/** "Dasar plot | 2": a module title and how many meetings it takes. */
export function parseModules(text: string): Parsed<{ title: string; meetings: number }> {
  const items: { title: string; meetings: number }[] = [];
  for (const line of lines(text)) {
    const [title, meetings] = line.split("|").map((p) => p.trim());
    const value = meetings ? Number(meetings) : NaN;
    if (!title || !Number.isInteger(value) || value < 1 || value > 50) return { items, bad: line };
    items.push({ title, meetings: value });
  }
  return { items, bad: null };
}

export const formatModules = (list: readonly { title: string; meetings: number }[]): string =>
  list.map((m) => `${m.title} | ${m.meetings}`).join("\n");
