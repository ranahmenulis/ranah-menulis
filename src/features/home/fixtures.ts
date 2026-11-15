import type { SubmissionStatus } from "@/components/ui/status-submission";

/**
 * Dummy data for Beranda until Community (step 5) and Projects (R4) exist. Everything here is
 * placeholder content written to look like real use; none of it comes from a database.
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

export const notification = {
  who: "Nur Aisyah",
  text: "membalas komentarmu di “Bahasa yang Kupakai untuk Memarahi Adik”.",
  meta: "3 belum dibaca · terbaru 25 menit lalu",
};

export type Followed = { name: string; fresh: boolean };
export const followed: Followed[] = [
  { name: "Hafiz Rahman", fresh: true },
  { name: "Nur Aisyah", fresh: true },
  { name: "Grup Penulis Pesisir", fresh: false },
  { name: "Dimas Pratama", fresh: true },
  { name: "Aina Sofea", fresh: false },
];

export type FeedEntry =
  | {
      kind: "work";
      id: string;
      author: string;
      group?: string;
      date: string;
      title: string;
      excerpt: string;
      label: string;
      appreciations: number;
      comments: number;
    }
  | {
      kind: "note";
      id: string;
      author: string;
      date: string;
      text: string;
      appreciations: number;
      comments: number;
    };

export const feed: FeedEntry[] = [
  {
    kind: "work",
    id: "w1",
    author: "Hafiz Rahman",
    group: "Grup Penulis Pesisir",
    date: "14 Okt",
    title: "Bahasa yang Kupakai untuk Memarahi Adik",
    excerpt:
      "Ibu tidak pernah mengajariku cara marah dengan baik. Yang kupunya hanya nada suara dan satu kalimat yang kuulang sampai adikku berhenti menangis dan mulai menghitung berapa kali aku mengucapkannya.",
    label: "Prolog · Esai · 2 menit baca",
    appreciations: 48,
    comments: 12,
  },
  {
    kind: "note",
    id: "n1",
    author: "Nur Aisyah",
    date: "1 jam lalu",
    text: "Menulis dua puluh menit sebelum subuh ternyata mengubah cara aku membaca hari. Kalimat-kalimat yang biasanya kabur jadi punya tepi. Besok aku coba lagi, mungkin dengan lampu yang lebih redup.",
    appreciations: 31,
    comments: 5,
  },
  {
    kind: "work",
    id: "w2",
    author: "Dimas Pratama",
    date: "12 Nov",
    title: "Rumah di Ujung Rel",
    excerpt:
      "Setiap kereta lewat, gelas di rak dapur bergeser setengah jari. Bapak sudah berhenti menggesernya kembali. Kami belajar membaca jadwal dari jarak gelas-gelas itu.",
    label: "Cuplikan · Cerpen",
    appreciations: 112,
    comments: 27,
  },
  {
    kind: "note",
    id: "n2",
    author: "Aina Sofea",
    date: "Kemarin",
    text: "Kata “rindu” kupakai tiga kali dalam satu halaman, dan tidak satu pun terasa jujur. Kuganti dengan menyebut apa yang tertinggal di meja makan. Baru terasa.",
    appreciations: 64,
    comments: 9,
  },
];
