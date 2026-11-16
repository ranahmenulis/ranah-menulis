import type { ProjectFixture } from "../types";
import { days } from "./days";

/**
 * Dummy Lomba projects. Prizes, criteria, weights, and whether judging is anonymous are samples
 * [konfirmasi: Q-28]. "Lomba Cerpen Hujan 2026" is the one the Beranda fixture already mentions.
 */
export const lombaFixtures: ProjectFixture[] = [
  {
    slug: "lomba-cerita-mini-pesisir-2026",
    category: "lomba",
    publication: "terbit",
    title: "Lomba Cerita Mini Pesisir 2026",
    summary:
      "Cerita pendek tentang laut dan orang-orang di tepinya. Sudah selesai: hasil diumumkan.",
    about: [
      "Cerita mini bertema pesisir: pelabuhan, nelayan, garam, dan segala yang dibawa pasang. Lomba ini sudah selesai dan hasilnya diumumkan di halaman hasil.",
      "Penilaian dilakukan juri secara anonim: nama penulis baru dibuka saat pemenang diumumkan.",
    ],
    requirements: [
      "Cerita 500 sampai 1.500 kata bertema pesisir.",
      "Maksimal satu karya per peserta.",
      "Belum pernah dimenangkan atau diterbitkan. Jangan mencantumkan namamu di dalam isi karya.",
    ],
    submission: { minWords: 500, maxWords: 1_500, maxWorks: 1 },
    organizer: "Tim RanahMenulis",
    timeZone: "WIB",
    fee: { idr: 25_000, myr: 800 },
    quota: null,
    closesInMs: -days(30),
    milestones: [
      { label: "Pengumuman finalis", inMs: -days(14) },
      { label: "Pengumuman pemenang", inMs: -days(3) },
    ],
    terms: {
      version: "2026-11-contoh",
      special: [
        "Karya tidak boleh memuat identitasmu di dalam isinya, karena penilaian dilakukan anonim.",
      ],
    },
    block: {
      kind: "lomba",
      criteria: [
        { name: "Orisinalitas", weight: 35 },
        { name: "Kekuatan cerita", weight: 35 },
        { name: "Bahasa", weight: 30 },
      ],
      prizes: ["Juara 1: Rp1.500.000", "Juara 2: Rp750.000", "Juara 3: Rp350.000"],
      anonymous: true,
    },
  },
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
    submission: { minWords: 1_000, maxWords: 2_500, maxWorks: 2 },
    organizer: "Tim RanahMenulis",
    timeZone: "WIB",
    fee: { idr: 35_000, myr: 1200 },
    quota: null,
    closesInMs: days(9),
    milestones: [
      { label: "Pengumuman finalis", inMs: days(14) },
      { label: "Pengumuman pemenang", inMs: days(21) },
    ],
    terms: {
      version: "2026-11-contoh",
      special: [
        "Karya tidak boleh memuat identitasmu di dalam isinya, karena penilaian dilakukan anonim.",
      ],
    },
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
    submission: { minWords: 1, maxWords: 150, maxWorks: 1 },
    organizer: "Tim RanahMenulis",
    timeZone: "MYT",
    fee: {},
    quota: { total: 100, taken: 100 },
    closesInMs: days(4),
    milestones: [{ label: "Pengumuman pemenang", inMs: days(18) }],
    terms: { version: "2026-11-contoh", special: [] },
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
    submission: { minWords: 700, maxWords: 1_200, maxWorks: 1 },
    organizer: "Tim RanahMenulis",
    timeZone: "WIB",
    fee: {},
    quota: null,
    closesInMs: days(2),
    milestones: [{ label: "Pengumuman pemenang", inMs: days(16) }],
    terms: {
      version: "2026-11-contoh",
      special: [
        "Karya tidak boleh memuat identitasmu di dalam isinya, karena penilaian dilakukan anonim.",
      ],
    },
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
