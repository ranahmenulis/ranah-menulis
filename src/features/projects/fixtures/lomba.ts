import type { ProjectFixture } from "../types";
import { days } from "./days";

/**
 * Dummy Lomba projects. Prizes, criteria, weights, and whether judging is anonymous are samples
 * [konfirmasi: Q-28]. "Lomba Cerpen Hujan 2026" is the one the Beranda fixture already mentions.
 */
export const lombaFixtures: ProjectFixture[] = [
  {
    slug: "lomba-cerpen-hujan-2026",
    category: "lomba",
    publication: "terbit",
    title: "Lomba Cerpen Hujan 2026",
    summary: "Cerpen bertema hujan, dinilai juri tanpa mengetahui nama penulisnya.",
    about: [
      "Hujan bisa menjadi kabar baik, kenangan, atau bencana kecil di dapur. Tulis satu cerpen yang membuat pembaca mendengar suara hujan di halamannya.",
      "Penilaian dilakukan juri secara anonim: nama dan profilmu disembunyikan sampai penilaian ditutup.",
    ],
    requirements: [
      "Cerpen 1.000 sampai 2.500 kata bertema hujan.",
      "Maksimal dua karya per peserta.",
      "Belum pernah dimenangkan atau diterbitkan. Jangan mencantumkan namamu di dalam isi karya.",
    ],
    organizer: "Tim RanahMenulis",
    timeZone: "WIB",
    fee: { idr: 35_000, myr: 1200 },
    quota: null,
    closesInMs: days(9),
    milestones: [
      { label: "Pengumuman finalis", inMs: days(14) },
      { label: "Pengumuman pemenang", inMs: days(21) },
    ],
    block: {
      kind: "lomba",
      criteria: [
        { name: "Orisinalitas", weight: 30 },
        { name: "Kekuatan cerita", weight: 30 },
        { name: "Bahasa", weight: 25 },
        { name: "Kesesuaian dengan tema", weight: 15 },
      ],
      prizes: ["Juara 1: Rp2.000.000", "Juara 2: Rp1.000.000", "Juara 3: Rp500.000"],
      anonymous: true,
    },
  },
  {
    slug: "lomba-puisi-pendek-nusantara",
    category: "lomba",
    publication: "terbit",
    title: "Lomba Puisi Pendek Nusantara",
    summary: "Puisi sepanjang maksimal dua belas larik dari penulis Indonesia dan Malaysia.",
    about: [
      "Satu puisi, dua belas larik, satu tarikan napas. Lomba ini terbuka bagi penulis Indonesia dan Malaysia.",
      "Kuota sudah penuh. Pengumuman hasil akan tampil di halaman ini.",
    ],
    requirements: ["Satu puisi, maksimal 12 larik.", "Bahasa Indonesia atau Melayu."],
    organizer: "Tim RanahMenulis",
    timeZone: "MYT",
    fee: {},
    quota: { total: 100, taken: 100 },
    closesInMs: days(4),
    milestones: [{ label: "Pengumuman pemenang", inMs: days(18) }],
    block: {
      kind: "lomba",
      criteria: [
        { name: "Kekuatan citraan", weight: 40 },
        { name: "Pilihan kata", weight: 40 },
        { name: "Keutuhan puisi", weight: 20 },
      ],
      prizes: ["Juara 1: Rp1.500.000 atau RM450", "Juara 2: Rp750.000 atau RM225"],
      anonymous: false,
    },
  },
  {
    slug: "lomba-esai-literasi-remaja",
    category: "lomba",
    publication: "terbit",
    title: "Lomba Esai Literasi Remaja",
    summary: "Esai tentang buku yang mengubah caramu melihat sekitar.",
    about: [
      "Untuk penulis berusia 13 sampai 19 tahun. Ceritakan satu buku yang pernah mengubah caramu melihat sekolah, rumah, atau teman-temanmu.",
    ],
    requirements: [
      "Esai 700 sampai 1.200 kata.",
      "Peserta berusia 13 sampai 19 tahun pada hari pendaftaran terakhir.",
    ],
    organizer: "Tim RanahMenulis",
    timeZone: "WIB",
    fee: {},
    quota: null,
    closesInMs: days(2),
    milestones: [{ label: "Pengumuman pemenang", inMs: days(16) }],
    block: {
      kind: "lomba",
      criteria: [
        { name: "Gagasan", weight: 40 },
        { name: "Argumentasi", weight: 35 },
        { name: "Bahasa", weight: 25 },
      ],
      prizes: ["Juara 1: Rp1.000.000", "Juara 2: Rp500.000"],
      anonymous: true,
    },
  },
];
