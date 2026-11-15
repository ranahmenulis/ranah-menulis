import type { Notification } from "./types";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Dummy notifications, newest first. Links point to Community posts and author profiles that exist
 * in its fixtures; project events have no destination until Projects is built, so their href is
 * null.
 */
export const notificationFixtures: Notification[] = [
  {
    id: "n-balasan-nur",
    kind: "comment",
    actorId: "nur-aisyah",
    others: 0,
    text: "membalas komentarmu di “Bahasa yang Kupakai untuk Memarahi Adik”.",
    href: "/postingan/bahasa-untuk-memarahi-adik",
    agoMs: 25 * MINUTE,
  },
  {
    id: "n-balasan-maya",
    kind: "comment",
    actorId: "maya-anindita",
    others: 0,
    text: "membalas komentarmu di “Hujan Pertama Bulan November”.",
    href: "/postingan/hujan-pertama-bulan-november",
    agoMs: HOUR + 10 * MINUTE,
  },
  {
    id: "n-apresiasi",
    kind: "reaction",
    actorId: "hafiz-rahman",
    others: 11,
    text: "mengapresiasi prolog “Hujan Pertama Bulan November”.",
    href: "/postingan/hujan-pertama-bulan-november",
    agoMs: 2 * HOUR + 30 * MINUTE,
  },
  {
    id: "n-revisi",
    kind: "project",
    actorId: null,
    others: 0,
    text: "Editor meminta revisi untuk “Surat untuk Kakek di Pelabuhan” di Antologi Surat yang Tidak Pernah Terkirim. Tenggat revisi 18 Nov.",
    href: null,
    agoMs: 3 * HOUR,
  },
  {
    id: "n-ikuti",
    kind: "follow",
    actorId: "dimas-pratama",
    others: 0,
    text: "mulai mengikutimu.",
    href: "/penulis/dimaspratama",
    agoMs: 5 * HOUR,
    seen: true,
  },
  {
    id: "n-pembayaran",
    kind: "project",
    actorId: null,
    others: 0,
    text: "Pembayaran Kelas Menulis Puisi Dasar menunggu konfirmasi. Kuotamu ditahan sampai 1 jam 42 menit lagi.",
    href: null,
    agoMs: DAY + 2 * HOUR,
    seen: true,
  },
  {
    id: "n-sebut",
    kind: "comment",
    actorId: "hafiz-rahman",
    others: 0,
    text: "menyebutmu dalam komentar di “Garam dan Pelabuhan”.",
    href: "/postingan/garam-dan-pelabuhan",
    agoMs: DAY + 6 * HOUR,
    seen: true,
  },
  {
    id: "n-lomba",
    kind: "project",
    actorId: null,
    others: 0,
    text: "Karyamu untuk Lomba Cerpen Hujan 2026 sudah diterima sistem.",
    href: null,
    agoMs: 3 * DAY,
    seen: true,
  },
];
