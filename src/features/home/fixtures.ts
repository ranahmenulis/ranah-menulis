import type { SubmissionStatus } from "@/components/ui/status-submission";

/**
 * Dummy data for Beranda until Projects (R4) and the account screens exist. Everything here is
 * placeholder content written to look like real use; none of it comes from a database. The feed
 * itself comes from src/features/community, notifications from src/features/notifications.
 */

export type AttentionItem = { title: string; meta: string; actions: string[] };
export const attention: AttentionItem[] = [
  {
    title: "Editor meminta revisi untuk “Surat untuk Kakek di Pelabuhan”",
    meta: "Antologi Surat yang Tidak Pernah Terkirim · tenggat revisi 18 Nov",
    actions: ["Baca catatan editor"],
  },
  {
    title: "Pembayaran Kelas Menulis Puisi Dasar menunggu konfirmasi",
    meta: "Rp150.000 · kuotamu ditahan 1 jam 42 menit lagi",
    actions: ["Lihat pembayaran"],
  },
  {
    title: "Hafiz Rahman mengundangmu ke Grup Penulis Pesisir",
    meta: "Grup kecil, 14 anggota",
    actions: ["Terima", "Tolak"],
  },
];

export type ProjectItem = { status: SubmissionStatus; name: string; meta: string };
export const projects: ProjectItem[] = [
  {
    status: "perlu-revisi",
    name: "Antologi Surat yang Tidak Pernah Terkirim",
    meta: "“Surat untuk Kakek di Pelabuhan” · tenggat revisi 18 Nov",
  },
  {
    status: "terkirim",
    name: "Lomba Cerpen Hujan 2026",
    meta: "“Yang Ditunggu Nenek di Bawah Jambu Air” · pengumuman finalis 30 Nov",
  },
];

/** `handle` is set for authors, who have a profile; groups have none yet (Q-38). */
export type Followed = { name: string; fresh: boolean; handle?: string };
export const followed: Followed[] = [
  { name: "Hafiz Rahman", fresh: true, handle: "hafizrahman" },
  { name: "Nur Aisyah", fresh: true, handle: "nuraisyah" },
  { name: "Grup Penulis Pesisir", fresh: false },
  { name: "Dimas Pratama", fresh: true, handle: "dimaspratama" },
  { name: "Aina Sofea", fresh: false, handle: "ainasofea" },
];
