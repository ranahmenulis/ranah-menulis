import type { ContestResults } from "./types";

/**
 * Sample results by project slug. Only a contest whose dates have passed (or that a
 * development-only panel pushed forward) shows them. The people are the dummy Community authors,
 * so a name links to a profile that exists. Real results are set by the Organizer (6g).
 */
export const contestResults: ContestResults[] = [
  {
    slug: "lomba-cerita-mini-pesisir-2026",
    finalists: [
      { id: "f1", title: "Garam di Tepi Jendela", genre: "Cerpen", authorId: "maya-anindita" },
      {
        id: "f2",
        title: "Perahu yang Pulang Lebih Awal",
        genre: "Cerpen",
        authorId: "bayu-wicaksono",
      },
      { id: "f3", title: "Surat untuk Mercusuar", genre: "Cerpen", authorId: "aina-sofea" },
      { id: "f4", title: "Pasang", genre: "Cerpen", authorId: "hafiz-rahman" },
      { id: "f5", title: "Ikan Terakhir Pak Salim", genre: "Cerpen", authorId: "nur-aisyah" },
      { id: "f6", title: "Anak Laut", genre: "Cerpen", authorId: "dimas-pratama" },
    ],
    winners: [
      {
        entryId: "f1",
        rank: 1,
        jurorNote: "Citraan yang tenang dan akhir yang tidak menjelaskan terlalu banyak.",
      },
      {
        entryId: "f3",
        rank: 2,
        jurorNote:
          "Bentuk surat dipakai dengan segar, dan suaranya konsisten sampai kalimat terakhir.",
      },
      {
        entryId: "f2",
        rank: 2,
        jurorNote: "Adegan di dermaga paling hidup di antara semua finalis.",
      },
    ],
  },
  {
    slug: "lomba-cerpen-hujan-2026",
    finalists: [
      { id: "f1", title: "Suara di Atas Seng", genre: "Cerpen", authorId: "laras" },
      {
        id: "f2",
        title: "Payung yang Tidak Pernah Kembali",
        genre: "Cerpen",
        authorId: "farid-zulkifli",
      },
      { id: "f3", title: "November di Dapur Ibu", genre: "Cerpen", authorId: "maya-anindita" },
    ],
    winners: [
      { entryId: "f3", rank: 1, jurorNote: "Hujan hadir sebagai suasana, bukan hiasan." },
      { entryId: "f1", rank: 2, jurorNote: "Bunyi dituliskan dengan teliti." },
      { entryId: "f2", rank: 3, jurorNote: "Premisnya sederhana dan terjaga sampai akhir." },
    ],
  },
  {
    slug: "lomba-puisi-pendek-nusantara",
    finalists: [
      { id: "f1", title: "Peta Tanpa Garis", genre: "Puisi", authorId: "nur-aisyah" },
      { id: "f2", title: "Doa Nelayan", genre: "Puisi", authorId: "aina-sofea" },
    ],
    winners: [
      { entryId: "f2", rank: 1, jurorNote: "Empat larik yang tidak bisa dipangkas lagi." },
      { entryId: "f1", rank: 2, jurorNote: "Metafora tunggal yang dipegang sampai akhir." },
    ],
  },
  {
    slug: "lomba-esai-literasi-remaja",
    finalists: [
      { id: "f1", title: "Buku Pertama yang Kupinjam", genre: "Esai", authorId: "hafiz-rahman" },
      { id: "f2", title: "Perpustakaan di Ujung Gang", genre: "Esai", authorId: "dimas-pratama" },
    ],
    winners: [{ entryId: "f1", rank: 1, jurorNote: "Argumen yang jelas dan contoh yang jujur." }],
  },
];
