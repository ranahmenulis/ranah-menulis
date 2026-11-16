import type { ProjectFixture } from "../types";
import { days } from "./days";

/**
 * Dummy Antologi projects. Every amount, quota, and date is a sample [konfirmasi: Q-19, Q-21,
 * Q-22, Q-31]. "Surat yang Tidak Pernah Terkirim" is the project the Beranda and Notifikasi
 * fixtures already talk about.
 */
const stages = [
  "Pendaftaran dan pengiriman naskah",
  "Seleksi dan feedback dari editor",
  "Revisi bila editor memintanya",
  "Persetujuan naskah final",
  "Penyuntingan, layout, dan produksi buku (status diperbarui Organizer)",
];

export const antologiFixtures: ProjectFixture[] = [
  {
    slug: "antologi-surat-yang-tidak-pernah-terkirim",
    category: "antologi",
    publication: "terbit",
    title: "Antologi: Surat yang Tidak Pernah Terkirim",
    summary: "Kumpulan surat untuk orang yang tidak sempat kita beri kabar.",
    about: [
      "Setiap orang pernah menulis surat yang akhirnya tidak dikirim: untuk kakek yang sudah tiada, sahabat yang pindah kota, atau diri sendiri di masa lalu. Antologi ini mengumpulkan surat-surat itu dalam satu buku.",
      "Karyamu dibaca editor, mendapat catatan, dan bila perlu direvisi sebelum masuk ke buku. Hak cipta tetap padamu.",
    ],
    requirements: [
      "Satu karya per penulis, berupa surat fiksi atau nonfiksi sepanjang 800 sampai 2.000 kata.",
      "Belum pernah diterbitkan di buku lain.",
      "Ditulis dalam bahasa Indonesia.",
    ],
    organizer: "Tim RanahMenulis",
    timeZone: "WIB",
    fee: { idr: 75_000, myr: 2500 },
    quota: { total: 40, taken: 31 },
    closesInMs: days(21),
    milestones: [
      { label: "Seleksi dan feedback editor", inMs: days(30) },
      { label: "Pengumuman karya yang diterima", inMs: days(45) },
    ],
    terms: {
      version: "2026-11-contoh",
      special: [
        "Karya yang diterima tidak dipublikasikan ke Community atau tempat lain oleh pengelola tanpa persetujuanmu.",
      ],
    },
    block: { kind: "antologi", theme: "Surat yang tidak pernah terkirim", stages },
  },
  {
    slug: "antologi-pulang-ke-pesisir",
    category: "antologi",
    publication: "terbit",
    title: "Antologi: Pulang ke Pesisir",
    summary: "Cerita dan puisi tentang kampung halaman yang menghadap laut.",
    about: [
      "Antologi cerpen dan puisi tentang pulang: pelabuhan, pasar ikan, rumah panggung, dan orang-orang yang menunggu di dermaga.",
      "Pendaftaran sudah ditutup. Kamu tetap bisa membaca ketentuannya sebagai gambaran proyek berikutnya.",
    ],
    requirements: [
      "Satu cerpen (maksimal 2.500 kata) atau tiga puisi per penulis.",
      "Belum pernah diterbitkan di buku lain.",
    ],
    organizer: "Tim RanahMenulis",
    timeZone: "WIB",
    fee: { idr: 50_000, myr: 1700 },
    quota: { total: 30, taken: 30 },
    closesInMs: -days(12),
    milestones: [{ label: "Pengumuman karya yang diterima", inMs: days(10) }],
    terms: {
      version: "2026-11-contoh",
      special: [
        "Karya yang diterima tidak dipublikasikan ke Community atau tempat lain oleh pengelola tanpa persetujuanmu.",
      ],
    },
    block: { kind: "antologi", theme: "Pulang ke kampung halaman di pesisir", stages },
  },
  {
    // A draft: never listed for the public (PRJ-01). Kept so that rule is exercised.
    slug: "antologi-puisi-tengah-malam",
    category: "antologi",
    publication: "draf",
    title: "Antologi: Puisi Tengah Malam",
    summary: "Belum diterbitkan.",
    about: ["Masih disusun Organizer."],
    requirements: ["Belum ditetapkan."],
    organizer: "Tim RanahMenulis",
    timeZone: "WIB",
    fee: {},
    quota: { total: 40, taken: 0 },
    closesInMs: days(60),
    milestones: [],
    terms: { version: "2026-11-contoh", special: [] },
    block: { kind: "antologi", theme: "Puisi yang ditulis lewat tengah malam", stages },
  },
];
