// Landing copy, Indonesian (source of the dictionary shape). Source: docs/produk/Copy Landing
// RanahMenulis.md, section 5 (v3, the client's landing brief of 15 Nov 2026). Eyebrows, headlines,
// subheadlines, tiles, and pillars follow the client's six images word for word, without the word
// "Muslim". Items marked [konfirmasi] must not go live before the client agrees:
//   1. Pricing (FAQ "Berapa biayanya?")
//   2. Lingkar Menulis (FAQ, Q-38; renamed from Grup Penulis, client 23 November 2026)
//   3. The source of the social proof numbers (social-proof.ts)
//   4. Features shown as "Menyusul" (Community programs, Marketplace, templates; PRD Q-50 to Q-52)

export const landing = {
  meta: {
    title: "RanahMenulis · Dari Penulis Pemula, Menjadi Penulis yang Berkarya",
    description:
      "Kembangkan kemampuan menulismu, bangun kebiasaan berkarya, temukan komunitas, dan wujudkan tulisanmu menjadi karya nyata bersama RanahMenulis.",
  },
  topBar: {
    logoLabel: "RanahMenulis, ke atas",
    navLabel: "Halaman",
    menu: "Menu halaman",
    ecosystem: "Ekosistem",
    studio: "Studio",
    publishing: "Penerbitan",
    faq: "Tanya jawab",
    // Client (Wafiy, 24 Nov 2026): one primary call to action. It still leads to the waitlist.
    cta: "Mulai Menulis",
  },
  // Hero words from the client (Wafiy, 24 Nov 2026), replacing the brief v3 headline.
  hero: {
    // Two lines in one face (25 Nov 2026, Fahmi and Wafiy: simpler hero, no pill, no countries).
    titleLines: ["Dari Penulis Pemula,", "Menjadi Penulis yang Berkarya."],
    // The client's sentence with the middle items deleted, not rewritten.
    lead: "Kembangkan kemampuan menulismu dan wujudkan tulisanmu menjadi karya nyata.",
    cta: "Mulai Perjalanan Menulis",
    secondary: "Jelajahi RanahMenulis",
  },
  // Sample manuscript shown on the hero stage.
  doc: {
    title: "Yang Ditunggu Nenek di Bawah Jambu Air",
    page: [
      "Hujan pertama bulan November selalu datang sore hari, tepat ketika Nenek selesai menyapu halaman. Ia tidak pernah berlari masuk. Ia berdiri dulu di bawah jambu air, membiarkan beberapa tetes jatuh ke kerudungnya, seolah menunggu seseorang yang berjanji pulang bersama musim.",
      "Aku baru mengerti kebiasaan itu bertahun-tahun kemudian, setelah rumah itu dijual dan pohon jambunya ditebang orang yang tidak suka daun berserakan.",
    ],
  },
  // One compact line, Reedsy style (client note): the numbers live in social-proof.ts.
  socialProof: {
    title: "Ruang Bertumbuh untuk Para Penulis.",
    writers: "penulis",
    works: "karya",
    books: "buku terbit",
    programs: "program",
    and: "dan",
  },
  // Five cards in one shape (client, 24 Nov 2026): name, one benefit, the app's own screen, and
  // a way in where the landing has one. The Studio benefit is the client's; the others were
  // written by the team and approved by the user.
  ecosystem: {
    eyebrow: "The Ecosystem",
    title: "Satu Ekosistem. Banyak Kemungkinan.",
    lead: "Semua yang dibutuhkan untuk mengembangkan perjalanan menulismu, dalam satu tempat.",
    inStudio: "Bagian dari Studio",
    soon: "Menyusul",
    modules: {
      studio: {
        name: "Ranah Studio",
        benefit: "Tempat menulis, mengedit, dan menyimpan karya dalam ruang kerja yang nyaman.",
        link: "Jelajahi Studio",
        preview:
          "Daftar Naskah di Studio: tiga naskah dengan jumlah kata, jenis, tag, dan waktu terakhir diubah.",
      },
      streak: {
        name: "Ranah Streak",
        benefit: "Bangun kebiasaan menulis setiap hari dengan target dan streak yang terlihat.",
        preview:
          "Streak di Studio: 12 hari berturut-turut, tujuh hari terakhir, dan progres hari ini 320 dari 500 kata.",
      },
      project: {
        name: "Ranah Project",
        benefit: "Ikuti antologi, kelas, lomba, dan penerbitan buku, lalu pantau status karyamu.",
        link: "Lihat jalur penerbitan",
        preview:
          "Proyek saya: antologi Surat yang Tidak Pernah Terkirim, dengan karya Toples Kerupuk versi 2 berstatus Diterima.",
      },
      community: {
        name: "Ranah Community",
        benefit: "Bagikan tulisan, baca karya penulis lain, dan saling memberi apresiasi.",
        preview:
          "Feed Community: dua tulisan dari penulis lain, dengan jumlah Apresiasi dan komentar.",
      },
      marketplace: {
        name: "Marketplace",
        benefit: "Buku, jasa kepenulisan, info pekerjaan, dan event literasi di satu tempat.",
        categories: ["Buku & ebook", "Jasa kepenulisan", "Info pekerjaan", "Event literasi"],
      },
    },
  },
  // Studio lives in the hero only (tahap H): the editor mockup and the six feature names from
  // image 3, without their sentences. Templates are Phase 2 (STD-05), so that one is marked.
  studio: {
    eyebrow: "Ranah Studio",
    featuresLabel: "Fitur Ranah Studio",
    mockup:
      "Editor Ranah Studio dari aplikasi: bilah atas dengan status simpan, jumlah kata, dan target hari ini 320 dari 500 kata, bilah format, lalu judul dan dua paragraf naskah.",
    caption: "Tulis, rapikan, dan pantau target harianmu dalam satu ruang kerja.",
  },
  publishing: {
    title: "Dari Naskah Digital Menjadi Karya Nyata.",
    lead: "Wujudkan impian menerbitkan buku pertamamu bersama ekosistem penerbitan RanahMenulis.",
    covers: "Sampul empat proyek dari katalog Projects: Antologi, Solo, Kelas Menulis, dan Lomba.",
    // Names from image 2; one line each, written by the team and approved by the user (24 Nov 2026).
    paths: [
      { name: "Antologi", benefit: "Tulis bersama penulis lain dalam satu buku bertema." },
      { name: "Solo Book", benefit: "Terbitkan bukumu sendiri, dari naskah sampai cetak." },
      { name: "Kelas Menulis", benefit: "Belajar dari mentor lewat tugas dan umpan balik." },
      { name: "Lomba Menulis", benefit: "Kirim karya terbaikmu untuk dinilai juri." },
    ],
    cta: "Lihat Peluang Menerbitkan Karya",
  },
  waitlist: {
    eyebrow: "Mulai Perjalanan Menulismu",
    title: "Saatnya Menulis, Berkembang, dan Menerbitkan Karya.",
    intro:
      "Bergabunglah dengan RanahMenulis dan menjadi bagian dari ekosistem penulis di Indonesia dan Malaysia.",
    // The four pillars from image 1.
    pillarsLabel: "Yang ada di RanahMenulis",
    pillars: ["Ruang Menulis Fokus", "Komunitas Positif", "Peluang Terbit", "Pengembangan Diri"],
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
      errors: {
        nameRequired: "Isi nama panggilanmu dulu.",
        emailRequired: "Isi alamat emailmu.",
        emailInvalid: "Alamat email belum lengkap. Contoh: nama@domain.com",
      },
      failed: "Gagal mengirim karena koneksi terputus. Isianmu masih di sini; coba kirim lagi.",
      submit: "Gabung Bersama RanahMenulis",
      sending: "Mengirim…",
      retry: "Coba kirim lagi",
      otherEmail: "Pakai email lain",
      consentBefore: "Dengan bergabung, kamu menyetujui",
      privacy: "Kebijakan privasi",
      consentAfter: "RanahMenulis.",
    },
  },
  faqTitle: "Tanya jawab",
  faq: [
    {
      question: "Apa itu Lingkar Menulis?",
      // [konfirmasi] Q-38
      answer:
        "Ruang kecil tempat sekelompok penulis saling membaca tulisan yang dibagikan ke lingkar. Dokumen yang tidak kamu bagikan tetap pribadi.",
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
    description:
      "Writer Development Platform. Ruang tumbuh bagi setiap penulis untuk menulis, berkembang, dan menerbitkan karya.",
    navLabel: "Kaki halaman",
    product: "Produk",
    program: "Program",
    support: "Dukungan",
    help: "Pusat Bantuan",
    faq: "FAQ",
    contact: "Kontak",
    privacy: "Kebijakan Privasi",
    terms: "Syarat & Ketentuan",
    soon: "Segera tersedia",
    social: "Media sosial",
    copyright: "© 2026 RanahMenulis. All rights reserved.",
  },
};
