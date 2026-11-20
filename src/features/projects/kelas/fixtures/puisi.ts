import type { ClassFixture } from "../types";

/**
 * Sample content for "Kelas Menulis Puisi Dasar" (a class that has not started: it opens twelve
 * days after the page opens). The real curriculum is written by the mentor [konfirmasi Q-26, Q-27].
 */
export const puisiClass: ClassFixture = {
  slug: "kelas-menulis-puisi-dasar",
  sessions: [
    {
      id: "p1",
      title: "Mendengar bunyi",
      day: 0,
      time: "19.30",
      minutes: 90,
      link: "https://meet.example.com/puisi-1",
    },
    {
      id: "p2",
      title: "Citraan",
      day: 3,
      time: "19.30",
      minutes: 90,
      link: "https://meet.example.com/puisi-2",
    },
    {
      id: "p3",
      title: "Larik dan bait",
      day: 7,
      time: "19.30",
      minutes: 90,
      link: "https://meet.example.com/puisi-3",
    },
    {
      id: "p4",
      title: "Jeda dan tarikan napas",
      day: 10,
      time: "19.30",
      minutes: 90,
      link: "https://meet.example.com/puisi-4",
    },
    {
      id: "p5",
      title: "Metafora, bagian satu",
      day: 14,
      time: "19.30",
      minutes: 90,
      link: "https://meet.example.com/puisi-5",
    },
    {
      id: "p6",
      title: "Metafora, bagian dua",
      day: 17,
      time: "19.30",
      minutes: 90,
      link: "https://meet.example.com/puisi-6",
    },
    {
      id: "p7",
      title: "Membaca ulang puisimu",
      day: 21,
      time: "19.30",
      minutes: 90,
      link: "https://meet.example.com/puisi-7",
    },
    {
      id: "p8",
      title: "Merevisi dan penutup",
      day: 24,
      time: "19.30",
      minutes: 90,
      link: "https://meet.example.com/puisi-8",
    },
  ],
  modules: [
    {
      title: "Mendengar bunyi dan citraan",
      materials: [
        {
          id: "puisi-1a",
          title: "Membaca puisi dengan telinga",
          minutes: 6,
          body: [
            "Bacalah satu puisi pendek dengan suara keras, dua kali. Catat kata yang terdengar paling nyaring.",
          ],
          exercise:
            "Dengarkan satu bunyi di sekitarmu selama satu menit, lalu tulis lima kata yang paling mirip bunyi itu.\n\nSusun lima kata itu menjadi dua larik.",
        },
      ],
      assignment: {
        id: "tugas-1",
        title: "Puisi empat larik tentang bunyi",
        instructions: ["Tulis puisi empat larik yang berangkat dari satu bunyi di sekitarmu."],
        dueDay: 6,
      },
    },
    {
      title: "Larik, bait, dan jeda",
      materials: [
        {
          id: "puisi-2a",
          title: "Di mana larik berhenti",
          minutes: 7,
          body: [
            "Memotong larik adalah keputusan makna. Coba pindahkan satu potongan dan dengarkan perubahannya.",
          ],
        },
      ],
      assignment: {
        id: "tugas-2",
        title: "Potong ulang satu puisi",
        instructions: [
          "Ambil puisimu dari tugas pertama dan tulis ulang dengan pemotongan larik yang berbeda.",
        ],
        dueDay: 13,
      },
    },
    {
      title: "Metafora tanpa berlebihan",
      materials: [
        {
          id: "puisi-3a",
          title: "Satu perbandingan yang tepat",
          minutes: 8,
          body: [
            "Satu metafora yang tepat lebih kuat daripada lima yang dipaksakan. Pilih yang paling mengejutkanmu sendiri.",
          ],
        },
      ],
      assignment: {
        id: "tugas-3",
        title: "Puisi dengan satu metafora",
        instructions: ["Tulis puisi enam sampai delapan larik yang berporos pada satu metafora."],
        dueDay: 20,
      },
    },
    {
      title: "Merevisi puisi sendiri",
      materials: [
        {
          id: "puisi-4a",
          title: "Memangkas",
          minutes: 6,
          body: [
            "Hapus kata yang tidak menambah apa pun. Puisi hampir selalu membaik setelah dipangkas.",
          ],
        },
      ],
      assignment: {
        id: "tugas-4",
        title: "Puisi yang direvisi",
        instructions: [
          "Kumpulkan satu puisi pilihanmu dalam versi akhir, dengan satu paragraf tentang apa yang kamu ubah.",
        ],
        dueDay: 27,
      },
    },
  ],
};
