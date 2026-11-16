import type { ProjectFixture } from "../types";
import { days } from "./days";

/**
 * Dummy Solo and Kelas Menulis projects. Prices, packages, quotas, and teachers are samples
 * [konfirmasi: Q-19, Q-24, Q-26, Q-30]. Solo has no deadline or quota: it is a service that stays
 * open [usulan]. Class format (live, recorded, mixed) is undecided (Q-26), so it is not stated.
 */
export const soloKelasFixtures: ProjectFixture[] = [
  {
    slug: "solo-penerbitan-buku-sendiri",
    category: "solo",
    publication: "terbit",
    title: "Solo: Menerbitkan Bukumu Sendiri",
    summary: "Tiga paket layanan untuk satu naskah, dari penyuntingan sampai produksi.",
    about: [
      "Untuk penulis yang sudah punya naskah utuh dan ingin menerbitkannya sebagai satu buku. Kamu memilih paket, mengajukan naskah dari Studio, lalu memantau tiap tahap di dasbormu.",
      "Tim penerbitan meninjau kelayakan naskah lebih dulu. Bila belum layak, kamu mendapat alasan dan catatan perbaikan.",
    ],
    requirements: [
      "Naskah lengkap: prosa 20.000 sampai 80.000 kata, atau kumpulan puisi minimal 40 puisi.",
      "Naskah milikmu sendiri dan belum terikat penerbit lain.",
      "Satu pengajuan untuk satu naskah.",
    ],
    organizer: "Tim RanahMenulis",
    timeZone: "WIB",
    fee: {},
    quota: null,
    closesInMs: null,
    milestones: [],
    block: {
      kind: "solo",
      packages: [
        {
          name: "Naskah Siap Terbit",
          fee: { idr: 1_500_000, myr: 50_000 },
          includes: ["Penyuntingan naskah", "Proofreading"],
        },
        {
          name: "Terbit Lengkap",
          fee: { idr: 3_500_000, myr: 120_000 },
          includes: ["Penyuntingan naskah", "Proofreading", "Desain cover", "Layout isi buku"],
        },
        {
          name: "Terbit dan Produksi",
          fee: { idr: 6_000_000, myr: 200_000 },
          includes: [
            "Penyuntingan naskah",
            "Proofreading",
            "Desain cover",
            "Layout isi buku",
            "Persetujuan final dan produksi buku",
          ],
        },
      ],
    },
  },
  {
    slug: "kelas-menulis-puisi-dasar",
    category: "kelas",
    publication: "terbit",
    title: "Kelas Menulis Puisi Dasar",
    summary: "Delapan pertemuan untuk belajar membaca, menulis, dan merevisi puisi.",
    about: [
      "Kelas untuk pemula yang ingin menulis puisi tanpa bingung harus mulai dari mana. Tiap modul diakhiri tugas pendek yang kamu tulis di Studio dan dikumpulkan ke mentor.",
      "Mentor membaca tugasmu dan memberi umpan balik tertulis. Progres belajarmu terlihat di dasbor kelas.",
    ],
    requirements: [
      "Tidak perlu pengalaman menulis puisi.",
      "Tugas dikumpulkan dari Studio sebelum tenggat tiap modul.",
    ],
    organizer: "Tim RanahMenulis",
    timeZone: "WIB",
    fee: { idr: 150_000, myr: 4500 },
    quota: { total: 30, taken: 24 },
    closesInMs: days(10),
    milestones: [
      { label: "Kelas dimulai", inMs: days(12) },
      { label: "Pertemuan terakhir", inMs: days(40) },
    ],
    block: {
      kind: "kelas",
      teacher: {
        name: "Nadira Kusuma",
        bio: "Penyair. Menulis dan mengajar puisi sejak 2015.",
      },
      modules: [
        { title: "Mendengar bunyi dan citraan", meetings: 2 },
        { title: "Larik, bait, dan jeda", meetings: 2 },
        { title: "Metafora tanpa berlebihan", meetings: 2 },
        { title: "Merevisi puisi sendiri", meetings: 2 },
      ],
    },
  },
  {
    slug: "kelas-cerpen-untuk-pemula",
    category: "kelas",
    publication: "terbit",
    title: "Kelas Cerpen untuk Pemula",
    summary: "Kelas gratis: dari ide sampai cerpen pertama yang selesai.",
    about: [
      "Kelas singkat untuk menyelesaikan satu cerpen pertamamu. Kamu belajar membangun tokoh, adegan, dan akhir cerita, dengan tugas kecil tiap pekan.",
    ],
    requirements: ["Terbuka untuk semua pemula.", "Tugas dikumpulkan dari Studio tiap pekan."],
    organizer: "Tim RanahMenulis",
    timeZone: "WIB",
    fee: {},
    quota: { total: 50, taken: 38 },
    closesInMs: days(3),
    milestones: [{ label: "Kelas dimulai", inMs: days(5) }],
    block: {
      kind: "kelas",
      teacher: {
        name: "Bagas Wirawan",
        bio: "Cerpenis. Dua kumpulan cerpennya terbit pada 2021 dan 2024.",
      },
      modules: [
        { title: "Dari ide ke kerangka", meetings: 1 },
        { title: "Tokoh dan keinginannya", meetings: 1 },
        { title: "Menulis adegan", meetings: 2 },
        { title: "Akhir cerita dan revisi", meetings: 1 },
      ],
    },
  },
];
