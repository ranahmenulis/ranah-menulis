export const kelolaEditor = {
  queue: {
    title: "Antrean submission",
    description: "Karya yang ditugaskan kepadamu untuk ditinjau.",
    loading: "Memuat antrean",
    loadError: "Antrean belum bisa dibuka karena data di perangkat ini tidak terbaca.",
    filterGroup: "Saring antrean",
    seeAll: "Lihat semua karya",
    filters: {
      "perlu-tindakan": "Perlu tindakan",
      ditinjau: "Sedang ditinjau",
      "menunggu-revisi": "Menunggu revisi",
      selesai: "Selesai",
      semua: "Semua",
    },
    empty: {
      "perlu-tindakan": "Tidak ada karya yang menunggu tindakanmu.",
      ditinjau: "Tidak ada karya yang sedang kamu tinjau.",
      "menunggu-revisi": "Tidak ada karya yang menunggu revisi peserta.",
      selesai: "Belum ada karya yang selesai kamu putuskan.",
      semua: "Belum ada karya yang masuk untuk kamu tinjau.",
    },
  },
  table: {
    work: "Karya",
    status: "Status",
    words: "Kata",
    waitingSince: "Menunggu sejak",
    revisions: "Revisi",
    waitingSincePrefix: "Menunggu sejak ",
    revisionsPrefix: "Revisi ",
    revisionsOf: "{n} dari {max}",
  },
  review: {
    back: "Antrean submission",
    backToQueue: "Kembali ke antrean",
    loading: "Memuat karya",
    loadError: "Karya belum bisa dibuka karena data di perangkat ini tidak terbaca.",
    goneTitle: "Karya ini tidak ditemukan.",
    goneNotice: "Kiriman ini tidak ada di perangkat ini. Alamatnya mungkin salah.",
    blockedTitle: "Tidak bisa dibuka.",
    blocked: {
      "tidak-ditugaskan": "Karya ini tidak ditugaskan kepadamu.",
      "bukan-karya-editor":
        "Karya ini tidak ditinjau lewat antrean Editor. Lomba dinilai Juri, dan tugas kelas diperiksa Mentor.",
    },
    byLine: "oleh {name} · {genre} · {size} · dikirim {date}",
    info: {
      package: "Paket",
      synopsis: "Sinopsis",
      note: "Catatan peserta untuk editor",
    },
    text: {
      title: "Naskah",
      noFrozen: "Karya ini tidak punya salinan beku.",
      versionGroup: "Versi naskah",
      version: "Versi {n}",
      latest: " (terbaru)",
      line: "Versi {n} · {size} · dibekukan {date}",
    },
    hints: {
      draf: "Karya ini belum dikirim.",
      terkirim: "Karya ini menunggu kamu mulai meninjau.",
      peninjauan:
        "Karya ini sedang ditinjau. Putuskan untuk menerima, menolak, atau meminta revisi.",
      "perlu-revisi": "Menunggu revisi dari peserta.",
      "revisi-terkirim": "Peserta sudah mengirim revisi dan menunggu kamu meninjau lagi.",
      diterima: "Karya ini sudah diterima.",
      ditolak: "Karya ini sudah ditolak.",
      ditarik: "Peserta menarik karya ini, jadi tidak perlu ditinjau lagi.",
    },
  },
  steps: {
    labels: {
      peninjauan: "Mulai tinjau",
      "perlu-revisi": "Minta revisi",
      diterima: "Terima",
      ditolak: "Tolak",
    },
    revisionLimit: "Batas putaran revisi sudah tercapai. Putuskan Terima atau Tolak.",
    dialogs: {
      "perlu-revisi": {
        title: "Minta revisi",
        hint: "Peserta mendapat tenggat tujuh hari untuk mengirim revisi. Tulis apa yang perlu diperbaiki.",
      },
      diterima: {
        title: "Terima karya ini",
        hint: "Keputusan ini final dan peserta akan diberi tahu. Tulis alasannya.",
      },
      ditolak: {
        title: "Tolak karya ini",
        hint: "Keputusan ini final dan peserta akan diberi tahu. Tulis alasan yang bisa mereka baca.",
      },
    },
  },
  decision: {
    title: "Langkah berikutnya",
    saveFailed:
      "Keputusan belum tersimpan karena data di perangkat ini tidak bisa ditulis. Coba lagi sebentar lagi.",
    rejected:
      "Status karya ini sudah berubah, jadi langkah itu tidak bisa dijalankan. Tampilan sudah diperbarui.",
    missing: "Karya ini tidak ditemukan lagi.",
  },
};
