import type { ClassFixture } from "../types";

/**
 * Sample content for "Kelas Cerpen untuk Pemula" (a running class: it started two days before the
 * page opens, and the first assignment is already past its deadline). The real curriculum, links
 * and instructions are written by the mentor [konfirmasi Q-26, Q-27].
 */
export const cerpenClass: ClassFixture = {
  slug: "kelas-cerpen-untuk-pemula",
  sessions: [
    {
      id: "p1",
      title: "Pembukaan dan dari ide ke kerangka",
      day: 0,
      time: "19.00",
      minutes: 90,
      link: "https://meet.example.com/cerpen-1",
    },
    {
      id: "p2",
      title: "Tokoh dan keinginannya",
      day: 7,
      time: "19.00",
      minutes: 90,
      link: "https://meet.example.com/cerpen-2",
    },
    {
      id: "p3",
      title: "Menulis adegan, bagian satu",
      day: 14,
      time: "19.00",
      minutes: 90,
      link: "https://meet.example.com/cerpen-3",
    },
    {
      id: "p4",
      title: "Menulis adegan, bagian dua",
      day: 16,
      time: "19.00",
      minutes: 90,
      link: "https://meet.example.com/cerpen-4",
    },
    {
      id: "p5",
      title: "Akhir cerita dan revisi",
      day: 21,
      time: "19.00",
      minutes: 90,
      link: "https://meet.example.com/cerpen-5",
    },
  ],
  modules: [
    {
      title: "Dari ide ke kerangka",
      materials: [
        {
          id: "cerpen-1a",
          title: "Satu ide, satu pertanyaan",
          minutes: 6,
          body: [
            "Cerpen yang berhasil biasanya berangkat dari satu pertanyaan: apa yang terjadi bila tokoh ini kehilangan hal yang paling dijaganya?",
            "Tulis ide ceritamu dalam satu kalimat, lalu ubah menjadi pertanyaan. Pertanyaan itu yang akan kamu jawab sepanjang cerita.",
          ],
          exercise:
            "Tulis ide ceritamu dalam satu kalimat.\n\nUbah kalimat itu menjadi satu pertanyaan: apa yang terjadi bila tokohku kehilangan hal yang paling dijaganya?\n\nTulis tiga kemungkinan jawabannya, masing-masing satu kalimat.",
        },
        {
          id: "cerpen-1b",
          title: "Kerangka tiga babak",
          minutes: 8,
          body: [
            "Awal memperkenalkan tokoh dan masalahnya. Tengah memperlihatkan usaha tokoh yang gagal. Akhir memperlihatkan harga yang dibayar tokoh.",
          ],
        },
      ],
      assignment: {
        id: "tugas-1",
        title: "Kerangka cerpenmu",
        instructions: [
          "Tulis satu paragraf tentang ide ceritamu, lalu kerangka tiga babaknya dalam tiga atau empat kalimat tiap babak.",
          "Tidak perlu rapi. Mentor membaca untuk melihat arah ceritamu.",
        ],
        dueDay: 1,
      },
    },
    {
      title: "Tokoh dan keinginannya",
      materials: [
        {
          id: "cerpen-2a",
          title: "Apa yang diinginkan tokohmu",
          minutes: 7,
          body: [
            "Tokoh yang hidup selalu menginginkan sesuatu, dan sesuatu itu menghalangi mereka. Sebut keinginannya dengan jelas sebelum menulis adegan pertama.",
          ],
        },
      ],
      assignment: {
        id: "tugas-2",
        title: "Profil singkat tokoh utama",
        instructions: [
          "Tulis satu halaman tentang tokoh utamamu: apa yang ia inginkan, apa yang menghalangi, dan satu kebiasaan kecil yang hanya ia punya.",
        ],
        dueDay: 8,
      },
    },
    {
      title: "Menulis adegan",
      materials: [
        {
          id: "cerpen-3a",
          title: "Adegan yang bekerja",
          minutes: 9,
          body: [
            "Adegan yang bekerja punya tokoh, tujuan, dan hambatan. Bila salah satunya hilang, adegan itu hanya pengisi halaman.",
            "Mulailah adegan selambat mungkin dan akhiri secepat mungkin.",
          ],
          exercise:
            "Pilih satu adegan dari cerpenmu. Tulis dalam satu kalimat apa yang diinginkan tokohmu di adegan itu, dan apa yang menghalanginya.\n\nLalu tulis adegannya, mulai dari saat paling dekat dengan masalah.",
        },
        {
          id: "cerpen-3b",
          title: "Dialog yang tidak menjelaskan",
          minutes: 6,
          body: [
            "Orang jarang mengatakan persis apa yang mereka maksud. Biarkan tokohmu berputar-putar, dan biarkan pembaca menangkap sisanya.",
          ],
          url: "https://rekaman.example.com/cerpen-dialog",
        },
      ],
      assignment: {
        id: "tugas-3",
        title: "Satu adegan lengkap",
        instructions: [
          "Tulis satu adegan 400 sampai 800 kata dari cerpenmu. Pastikan jelas apa yang diinginkan tokohmu di adegan itu, dan apa yang menghalanginya.",
        ],
        dueDay: 15,
      },
    },
    {
      title: "Akhir cerita dan revisi",
      materials: [
        {
          id: "cerpen-4a",
          title: "Akhir yang terasa pantas",
          minutes: 7,
          body: [
            "Akhir yang baik terasa tak terhindarkan sekaligus mengejutkan. Kembalilah ke pertanyaan di awal ceritamu dan jawab, meski jawabannya pahit.",
          ],
        },
      ],
      assignment: {
        id: "tugas-4",
        title: "Cerpen utuh",
        instructions: [
          "Kumpulkan cerpenmu yang sudah selesai dari awal sampai akhir, setelah satu kali revisi.",
        ],
        dueDay: 22,
      },
    },
  ],
};
