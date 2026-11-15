// Landing copy. Source: docs/Copy Landing RanahMenulis.md, section 4 (short v2, 15 Nov 2026).
// Three items are marked [konfirmasi] and must not go live before the client agrees:
//   1. Pricing (FAQ "Berapa biayanya?")
//   2. Grup Penulis (FAQ, Q-38)
//   3. Privacy tone: the "alasan hukum atau moderasi" exception (BR-STD-05)

export const heroTitle = "Tulis paragrafnya hari ini. Bukunya menyusul.";

export const heroLead =
  "Tulis di Studio, bagikan cuplikannya, lalu kirim naskah yang sama ke antologi atau buku solo. Tanpa menyalin ulang.";

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

// One sentence per step; the moving previews demonstrate the rest (copy v2, section 4).
export const steps = {
  menulis: {
    title: "Menulis",
    text: "Tersimpan otomatis dan tetap pribadi sampai kamu membagikannya.",
  },
  target: {
    title: "Target harian",
    text: "Setiap hari yang mencapai target menjadi satu titik di kalendermu.",
  },
  dibagikan: {
    title: "Dibagikan",
    text: "Yang tampil di Community hanya bagian yang kamu pilih.",
  },
  terbit: {
    title: "Terbit",
    text: "Kirim naskah ke antologi tanpa menyalin ulang. Drafmu tetap bisa diubah.",
  },
};

export const projectsTitle = "Ke mana naskahmu bisa pergi.";

export const projects = [
  { name: "Antologi", flow: "Seleksi · revisi · terbit" },
  { name: "Buku Solo", flow: "Editing · sampul · produksi" },
  { name: "Kelas Menulis", flow: "Materi · tugas · umpan balik" },
  { name: "Lomba", flow: "Kriteria · finalis · pemenang" },
];

// The three titles read together as one statement (the word-highlight moment); each label and
// sentence sits small underneath.
export const trust = [
  {
    label: "Privasi",
    title: "Draf pribadimu tetap pribadi.",
    // [konfirmasi] tone of the exception (BR-STD-05)
    text: "Tidak dibaca orang lain, kecuali alasan hukum atau moderasi yang dicatat.",
  },
  {
    label: "Kiriman",
    title: "Yang sudah dikirim tidak ikut berubah.",
    text: "Revisi membuat versi baru; versi yang dikirim tetap tersimpan.",
  },
  {
    label: "Hak cipta",
    title: "Hak cipta tetap milikmu.",
    text: "Kecuali ketentuan proyek yang kamu baca dan setujui sebelum mendaftar.",
  },
];

export const waitlist = {
  title: "Simpan namamu di daftar tunggu.",
  intro: "Kami kabari lewat email saat RanahMenulis dibuka.",
  interests: ["Menulis rutin", "Antologi", "Buku solo", "Kelas", "Lomba", "Membaca"],
};

// The draft-privacy and copyright questions moved to the three promises above.
export const faq = [
  {
    question: "Apa itu Grup Penulis?",
    // [konfirmasi] Q-38
    answer:
      "Ruang kecil tempat sekelompok penulis saling membaca tulisan yang dibagikan ke grup. Dokumen yang tidak kamu bagikan tetap pribadi.",
  },
  {
    question: "Apakah tersedia di Indonesia dan Malaysia?",
    answer:
      "Ya. Kamu memilih negara di profil, dan tulisanmu muncul di daftar penulis negara itu. Antarmukanya berbahasa Indonesia lebih dulu.",
  },
  {
    question: "Berapa biayanya?",
    // [konfirmasi] pricing; based on the 8 November 2026 meeting
    answer:
      "Menulis dan membaca direncanakan tanpa biaya langganan di awal. Program di Projects punya biaya sendiri yang tampil sebelum mendaftar.",
  },
  {
    question: "Kapan RanahMenulis dibuka?",
    answer: "Tanggalnya belum diumumkan. Orang di daftar tunggu yang pertama kami kabari.",
  },
];
