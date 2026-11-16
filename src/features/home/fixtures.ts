/**
 * Dummy data for Beranda until the account screens exist. Everything here is placeholder content
 * written to look like real use; none of it comes from a database. "Perlu perhatian" keeps the two
 * items that are not about a project; the revision request and "Proyek saya" come from
 * src/features/projects. The feed comes from src/features/community, notifications from
 * src/features/notifications.
 */

export type AttentionItem = { title: string; meta: string; actions: string[] };
export const attention: AttentionItem[] = [
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

/** `handle` is set for authors, who have a profile; groups have none yet (Q-38). */
export type Followed = { name: string; fresh: boolean; handle?: string };
export const followed: Followed[] = [
  { name: "Hafiz Rahman", fresh: true, handle: "hafizrahman" },
  { name: "Nur Aisyah", fresh: true, handle: "nuraisyah" },
  { name: "Grup Penulis Pesisir", fresh: false },
  { name: "Dimas Pratama", fresh: true, handle: "dimaspratama" },
  { name: "Aina Sofea", fresh: false, handle: "ainasofea" },
];
