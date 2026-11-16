import { formatProjectDate, zoneIana } from "../project-model";
import type { TimeZoneName } from "../types";
import type { AssignmentState } from "./types";

export const stateLabel: Record<AssignmentState, string> = {
  terkunci: "Belum dibuka",
  "belum-dikumpulkan": "Belum dikumpulkan",
  terlambat: "Lewat tenggat",
  dikumpulkan: "Dikumpulkan",
  "perlu-perbaikan": "Perlu perbaikan",
  selesai: "Selesai",
};

/** One sentence under an assignment that says what to do about it. */
export const stateHint: Record<AssignmentState, string> = {
  terkunci: "Tugas dibuka saat kelas dimulai.",
  "belum-dikumpulkan": "Kumpulkan sebelum tenggat.",
  terlambat: "Tenggat sudah lewat, tetapi tugas masih diterima dan ditandai terlambat.",
  dikumpulkan: "Tugasmu sudah terkirim dan menunggu mentor.",
  "perlu-perbaikan": "Mentor meminta perbaikan. Baca catatannya, lalu kumpulkan lagi.",
  selesai: "Mentor menandai tugas ini selesai.",
};

/** "Sabtu, 21 November · 19.00 WIB": the project's own zone, named, so it reads the same for all. */
export function sessionTime(at: number, zone: TimeZoneName): string {
  const timeZone = zoneIana(zone);
  const date = new Intl.DateTimeFormat("id-ID", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(at);
  const time = new Intl.DateTimeFormat("id-ID", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(at);
  return `${date} · ${time} ${zone}`;
}

export const dueText = (dueAt: number, zone: TimeZoneName) =>
  `Tenggat ${formatProjectDate(dueAt, zone)}`;

/** "1 dari 3 selesai" for the progress line. */
export const progressText = (done: number, total: number) => `${done} dari ${total} selesai`;
