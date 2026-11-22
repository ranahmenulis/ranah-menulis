import type { Notification } from "./types";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Dummy notifications, newest first. Links point to Community posts and author profiles that exist
 * in its fixtures. Events about submissions are not here: they come from the stored submissions
 * (src/features/projects/submission-notifications.ts). The payment line has no destination until
 * QRIS exists (6f-6), so its href is null.
 */
export const notificationFixtures: Notification[] = [
  {
    id: "n-balasan-nur",
    kind: "comment",
    actorId: "nur-aisyah",
    others: 0,
    message: { key: "replyComment", params: { title: "Bahasa yang Kupakai untuk Memarahi Adik" } },
    href: "/postingan/bahasa-untuk-memarahi-adik",
    agoMs: 25 * MINUTE,
  },
  {
    id: "n-balasan-maya",
    kind: "comment",
    actorId: "maya-anindita",
    others: 0,
    message: { key: "replyComment", params: { title: "Hujan Pertama Bulan November" } },
    href: "/postingan/hujan-pertama-bulan-november",
    agoMs: HOUR + 10 * MINUTE,
  },
  {
    id: "n-apresiasi",
    kind: "reaction",
    actorId: "hafiz-rahman",
    others: 11,
    message: { key: "appreciated", params: { title: "Hujan Pertama Bulan November" } },
    href: "/postingan/hujan-pertama-bulan-november",
    agoMs: 2 * HOUR + 30 * MINUTE,
  },
  {
    id: "n-ikuti",
    kind: "follow",
    actorId: "dimas-pratama",
    others: 0,
    message: { key: "followed" },
    href: "/penulis/dimaspratama",
    agoMs: 5 * HOUR,
    seen: true,
  },
  {
    id: "n-sebut",
    kind: "comment",
    actorId: "hafiz-rahman",
    others: 0,
    message: { key: "mentioned", params: { title: "Garam dan Pelabuhan" } },
    href: "/postingan/garam-dan-pelabuhan",
    agoMs: DAY + 6 * HOUR,
    seen: true,
  },
];
