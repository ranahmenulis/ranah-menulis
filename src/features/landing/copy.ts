// Teks landing. Sumber: docs/Copy Landing RanahMenulis.md (usulan 14 Nov 2026).
// Tiga butir ditandai [konfirmasi] dan belum boleh tayang sebelum client setuju:
//   1. Biaya (FAQ "Berapa biayanya?")
//   2. Grup Penulis (FAQ; kalimat soal keluar grup sengaja dihapus, Q-38)
//   3. Nada privasi: pengecualian "alasan hukum atau moderasi, dan itu dicatat" (BR-STD-05)

export const heroTitle = "Tulis paragrafnya hari ini. Bukunya menyusul.";

export const heroLead =
  "Tulis di Studio, bagikan cuplikannya ke pembaca, lalu kirim naskah yang sama ke antologi, kelas, lomba, atau buku solo. Tanpa menyalin ulang.";

export const heroDoc = {
  title: "Yang Ditunggu Nenek di Bawah Jambu Air",
  shortTitle: "Yang Ditunggu Nenek",
  author: "Rinjani Putri",
  typed:
    "Hujan pertama bulan November selalu datang sore hari, tepat ketika Nenek selesai menyapu halaman. Ia tidak pernah berlari masuk.",
  page: [
    "Hujan pertama bulan November selalu datang sore hari, tepat ketika Nenek selesai menyapu halaman. Ia tidak pernah berlari masuk. Ia berdiri dulu di bawah jambu air, membiarkan beberapa tetes jatuh ke kerudungnya, seolah menunggu seseorang yang berjanji pulang bersama musim.",
    "Aku baru mengerti kebiasaan itu bertahun-tahun kemudian, setelah rumah itu dijual dan pohon jambunya ditebang orang yang tidak suka daun berserakan.",
  ],
  heroAriaLabel:
    "Satu paragraf diketik di Studio, menjadi halaman 12 sebuah buku, lalu menjadi buku bersampul hitam berjudul Yang Ditunggu Nenek di Bawah Jambu Air karya Rinjani Putri.",
};

export const stepsTitle = "Satu naskah, empat langkah.";

export const steps = {
  menulis: {
    title: "Menulis",
    text: "Tulis di Studio. Tulisanmu tersimpan otomatis dan tetap pribadi sampai kamu sendiri yang membagikannya.",
  },
  target: {
    title: "Target harian",
    text: "Tetapkan target kata per hari di Studio. Streak, bagian dari Studio, mencatat setiap hari yang tercapai sebagai satu titik di kalendermu. Tanpa konfeti, tanpa poin.",
  },
  dibagikan: {
    title: "Dibagikan",
    text: "Bagikan prolog atau cuplikan ke Community. Yang tampil hanya bagian yang kamu pilih; naskah lengkapnya tetap di Studio.",
  },
  terbit: {
    title: "Terbit",
    text: "Kirim naskah yang sama ke antologi tanpa menyalin ulang. Editor membaca salinan saat kamu menekan Kirim, dan drafmu boleh terus kamu ubah.",
  },
};

export const projectsTitle = "Ke mana naskahmu bisa pergi.";

export const projects = [
  {
    name: "Antologi",
    flow: "Seleksi · revisi · terbit",
    text: "Naskahmu masuk ke buku bertema bersama tulisan penulis lain. Editor memberi catatan, kamu merevisi, sampai naskahmu diterima.",
  },
  {
    name: "Buku Solo",
    flow: "Editing · sampul · produksi",
    text: "Bukumu sendiri. Editing, proofreading, sampul, dan layout dikerjakan bertahap, dan kamu bisa melihat posisi bukumu di setiap tahap.",
  },
  {
    name: "Kelas Menulis",
    flow: "Materi · tugas · umpan balik",
    text: "Belajar dari mentor lewat materi, tugas, dan catatan untuk tulisanmu sendiri, dari puisi sampai novel.",
  },
  {
    name: "Lomba",
    flow: "Kriteria · finalis · pemenang",
    text: "Kompetisi dengan kriteria penilaian yang jelas. Penyelenggara boleh memilih penjurian anonim, sehingga juri menilai naskah tanpa tahu penulisnya.",
  },
];

export const trust = [
  {
    title: "Draf pribadimu tetap pribadi.",
    // [konfirmasi] nada pengecualian (BR-STD-05)
    text: "Dokumen di Studio tidak dibaca orang lain. Satu-satunya pengecualian adalah alasan hukum atau moderasi, dan itu dicatat. Yang tampil di Community hanya salinan teks yang kamu pilih.",
  },
  {
    title: "Yang sudah dikirim tidak ikut berubah.",
    text: "Setiap kiriman menyimpan salinan pada saat kamu menekan Kirim. Revisi membuat versi baru, dan versi sebelumnya tetap tersimpan.",
  },
  {
    title: "Hak cipta tetap milikmu.",
    text: "Kecuali ketentuan sebuah proyek menyatakan lain. Ketentuan itu tertulis, bisa kamu baca sebelum mendaftar, dan hanya berlaku bila kamu menyetujuinya.",
  },
];

export const waitlist = {
  title: "Simpan namamu di daftar tunggu.",
  intro:
    "Kami mengabarimu lewat email saat RanahMenulis dibuka untuk penulis di Indonesia dan Malaysia.",
  interests: ["Menulis rutin", "Antologi", "Buku solo", "Kelas", "Lomba", "Membaca"],
};

export const faq = [
  {
    question: "Apa itu Grup Penulis?",
    // [konfirmasi] Q-38
    answer:
      "Ruang kecil tempat sekelompok penulis saling membaca tulisan yang dibagikan ke grup. Grup dikelola oleh admin grup. Dokumen yang tidak kamu bagikan tetap pribadi.",
  },
  {
    question: "Apakah tersedia di Indonesia dan Malaysia?",
    answer:
      "Ya. Saat dibuka, RanahMenulis melayani penulis di Indonesia dan Malaysia. Kamu memilih negara di profil, dan tulisanmu muncul di daftar penulis negara itu. Antarmukanya berbahasa Indonesia lebih dulu. Penulis dari negara lain boleh masuk daftar tunggu.",
  },
  {
    question: "Siapa yang bisa membaca drafku?",
    // [konfirmasi] nada pengecualian (BR-STD-05)
    answer:
      "Tidak ada orang lain. Dokumen di Studio selalu pribadi; pengecualiannya hanya alasan hukum atau moderasi, dan itu dicatat. Pembaca melihat cuplikan yang kamu bagikan, dan pengelola proyek membaca naskah yang kamu kirim ke proyek mereka.",
  },
  {
    question: "Apakah hak cipta karyaku tetap milikku?",
    answer:
      "Ya. Pengecualiannya hanya bila ketentuan sebuah proyek menyatakan lain. Ketentuan itu bisa kamu baca sebelum mendaftar, dan kamu harus menyetujuinya lebih dulu.",
  },
  {
    question: "Berapa biayanya?",
    // [konfirmasi] biaya; dasar rapat 8 November 2026
    answer:
      "Menulis di Studio dan membaca di Community direncanakan tanpa biaya langganan di awal. Program di Projects, seperti antologi dan kelas, punya biayanya sendiri yang tampil sebelum kamu mendaftar.",
  },
  {
    question: "Kapan RanahMenulis dibuka?",
    answer: "Tanggalnya belum diumumkan. Orang di daftar tunggu yang pertama kami kabari.",
  },
];
