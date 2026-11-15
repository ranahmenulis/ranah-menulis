// Landing copy, Indonesian (source of the dictionary shape). Source: docs/Copy Landing
// RanahMenulis.md, section 4 (short v2, 15 Nov 2026). Three items are marked [konfirmasi] and must
// not go live before the client agrees:
//   1. Pricing (FAQ "Berapa biayanya?")
//   2. Grup Penulis (FAQ, Q-38)
//   3. Privacy tone: the "alasan hukum atau moderasi" exception (BR-STD-05)

export const landing = {
  meta: {
    title: "RanahMenulis · Tulis paragrafnya hari ini. Bukunya menyusul.",
    description:
      "Tulis di Studio, bagikan cuplikannya, lalu kirim naskah yang sama ke antologi atau buku solo. Tanpa menyalin ulang.",
  },
  topBar: {
    logoLabel: "RanahMenulis, ke atas",
    navLabel: "Halaman",
    how: "Cara kerja",
    projects: "Projects",
    faq: "Tanya jawab",
    cta: "Gabung daftar tunggu",
    ctaShort: "Daftar tunggu",
  },
  hero: {
    title: "Tulis paragrafnya hari ini. Bukunya menyusul.",
    lead: "Tulis di Studio, bagikan cuplikannya, lalu kirim naskah yang sama ke antologi atau buku solo. Tanpa menyalin ulang.",
    cta: "Gabung daftar tunggu",
    secondary: "Lihat cara kerjanya",
    ariaLabel:
      "Satu paragraf diketik di Studio, menjadi halaman 12 sebuah buku, lalu menjadi buku bersampul hitam berjudul Yang Ditunggu Nenek di Bawah Jambu Air karya Rinjani Putri.",
    saving: "Menyimpan…",
    saved: "Tersimpan 14.02",
    words: "kata",
  },
  stepsTitle: "Satu naskah, empat langkah.",
  // One sentence per step; the moving previews demonstrate the rest (copy v2, section 4).
  steps: {
    menulis: {
      title: "Menulis",
      text: "Tersimpan otomatis dan tetap pribadi sampai kamu membagikannya.",
      preview: "Editor Studio: kalimat terakhir diketik, lalu tersimpan. Dokumen tetap pribadi.",
    },
    target: {
      title: "Target harian",
      text: "Setiap hari yang mencapai target menjadi satu titik di kalendermu.",
      preview:
        "Streak di Studio: target 500 kata hari ini tercapai, titik hari ini terisi, streak menjadi 12 hari.",
    },
    dibagikan: {
      title: "Dibagikan",
      text: "Yang tampil di Community hanya bagian yang kamu pilih.",
      preview:
        "Memilih bagian untuk Community: hanya paragraf pertama yang dicentang dan menjadi publik.",
    },
    terbit: {
      title: "Terbit",
      text: "Kirim naskah ke antologi tanpa menyalin ulang. Drafmu tetap bisa diubah.",
      preview:
        "Kiriman antologi diterima. Draf di Studio boleh berubah; versi yang dikirim tetap versi 2.",
    },
  },
  previews: {
    pause: "Jeda animasi",
    play: "Putar animasi",
    shareHint: "Bagian yang tidak dipilih tetap pribadi.",
    shareNotice: "Yang menjadi publik hanya teks ini.",
    streakUnit: "hari berturut-turut",
    todayWords: "Hari ini {count} / 500 kata",
    reached: "Tercapai",
    weekdays: ["S", "S", "R", "K", "J", "S", "M"],
    submissionMeta: "“Toples Kerupuk” · versi 2 · dikirim 3 Nov",
    sent: "Dikirim",
    accepted: "Diterima",
    submissionNote: "Draf di Studio diubah 2 jam lalu. Versi yang dikirim tetap versi 2.",
  },
  projectsTitle: "Ke mana naskahmu bisa pergi.",
  projects: [
    { name: "Antologi", flow: "Seleksi · revisi · terbit" },
    { name: "Buku Solo", flow: "Editing · sampul · produksi" },
    { name: "Kelas Menulis", flow: "Materi · tugas · umpan balik" },
    { name: "Lomba", flow: "Kriteria · finalis · pemenang" },
  ],
  // The three titles read together as one statement (the word-highlight moment); each label and
  // sentence sits small underneath.
  trust: [
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
  ],
  waitlist: {
    title: "Simpan namamu di daftar tunggu.",
    intro: "Kami kabari lewat email saat RanahMenulis dibuka.",
    interests: ["Menulis rutin", "Antologi", "Buku solo", "Kelas", "Lomba", "Membaca"],
    form: {
      ariaLabel: "Gabung daftar tunggu",
      thanks: "Terima kasih, {name}. Namamu sudah tercatat.",
      fallbackName: "kamu",
      confirmation: "Kabar pembukaan akan dikirim ke {email}.",
      name: "Nama panggilan",
      namePlaceholder: "Misalnya Rinjani",
      email: "Email",
      emailPlaceholder: "nama@domain.com",
      country: "Negara",
      countries: { ID: "Indonesia", MY: "Malaysia", OTHER: "Lainnya" },
      interest: "Minat",
      interestHint: "(opsional, boleh lebih dari satu)",
      exists:
        "Email ini sudah ada di daftar tunggu. Kamu tidak perlu mendaftar lagi; kabar pembukaan akan dikirim ke alamat ini.",
      failed: "Gagal mengirim karena koneksi terputus. Isianmu masih di sini; coba kirim lagi.",
      submit: "Gabung daftar tunggu",
      sending: "Mengirim…",
      retry: "Coba kirim lagi",
      otherEmail: "Pakai email lain",
      consentBefore: "Dengan bergabung, kamu menyetujui",
      privacy: "Kebijakan privasi",
      consentAfter: "RanahMenulis.",
    },
  },
  faqTitle: "Tanya jawab",
  // The draft-privacy and copyright questions moved to the three promises above.
  faq: [
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
  ],
  footer: {
    countries: "Indonesia · Malaysia",
    navLabel: "Kaki halaman",
    privacy: "Kebijakan privasi",
    contact: "Kontak",
  },
};
