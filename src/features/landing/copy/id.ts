// Landing copy, Indonesian (source of the dictionary shape). Source: docs/produk/Copy Landing
// RanahMenulis.md, section 5 (v3, the client's landing brief of 15 Nov 2026). Eyebrows, headlines,
// subheadlines, tiles, and pillars follow the client's six images word for word, without the word
// "Muslim". Items marked [konfirmasi] must not go live before the client agrees:
//   1. Pricing (FAQ "Berapa biayanya?")
//   2. Grup Penulis (FAQ, Q-38)
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
    eyebrow: "Writer Development Platform",
    // Three lines: the middle one is set in the serif italic (DESIGN.md 4.6, hero C2).
    titleLines: ["Dari Penulis Pemula,", "Menjadi Penulis", "yang Berkarya."],
    colophon: "Indonesia · Malaysia",
    lead: "Kembangkan kemampuan menulismu, bangun kebiasaan berkarya, temukan komunitas, dan wujudkan tulisanmu menjadi karya nyata bersama RanahMenulis.",
    cta: "Mulai Perjalanan Menulis",
    secondary: "Jelajahi RanahMenulis",
    saved: "Tersimpan 14.02",
    words: "kata",
  },
  // Sample manuscript shown in the hero and the previews.
  doc: {
    title: "Yang Ditunggu Nenek di Bawah Jambu Air",
    page: [
      "Hujan pertama bulan November selalu datang sore hari, tepat ketika Nenek selesai menyapu halaman. Ia tidak pernah berlari masuk. Ia berdiri dulu di bawah jambu air, membiarkan beberapa tetes jatuh ke kerudungnya, seolah menunggu seseorang yang berjanji pulang bersama musim.",
      "Aku baru mengerti kebiasaan itu bertahun-tahun kemudian, setelah rumah itu dijual dan pohon jambunya ditebang orang yang tidak suka daun berserakan.",
    ],
    anthologyTitle: "Surat yang Tidak Pernah Terkirim",
    anthologyLabel: "Antologi: Surat yang Tidak Pernah Terkirim",
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
  // Module names only, no body text (client note): each mockup shows what the module holds.
  ecosystem: {
    eyebrow: "The Ecosystem",
    title: "Satu Ekosistem. Banyak Kemungkinan.",
    lead: "Semua yang dibutuhkan untuk mengembangkan perjalanan menulismu, dalam satu tempat.",
    inStudio: "Bagian dari Studio",
    soon: "Menyusul",
    modules: {
      streak: {
        name: "Ranah Streak",
        preview:
          "Streak di Studio: target 500 kata hari ini tercapai, titik hari ini terisi, streak menjadi 12 hari.",
      },
      project: {
        name: "Ranah Project",
        preview:
          "Kiriman antologi diterima. Draf di Studio boleh berubah; versi yang dikirim tetap versi 2.",
      },
      studio: {
        name: "Ranah Studio",
      },
      community: {
        name: "Ranah Community",
        preview:
          "Community: cuplikan tulisan dari penulis yang diikuti, dengan Apresiasi dan komentar. Program Writer Battle, Roast My Writing, dan The Writers Confess menyusul.",
      },
      marketplace: {
        name: "Marketplace",
        preview:
          "Marketplace, menyusul: buku dan ebook, jasa kepenulisan, info pekerjaan, dan event literasi.",
      },
    },
    community: {
      programs: ["Writer Battle", "Roast My Writing", "The Writers Confess"],
      author: "Nur Aisyah",
      initials: "NA",
      time: "2 jam lalu",
      excerpt:
        "Menulis dua puluh menit sebelum subuh ternyata mengubah cara aku membaca hari. Kalimat-kalimat yang biasanya kabur jadi punya tepi.",
      meta: "Cuplikan · Esai",
    },
    marketplace: {
      categories: ["Buku & ebook", "Jasa kepenulisan", "Info pekerjaan", "Event literasi"],
      listingMeta: "Buku fisik · Rinjani Putri",
    },
  },
  // Studio lives in the hero only (tahap H): the editor mockup and the six feature names from
  // image 3, without their sentences. Templates are Phase 2 (STD-05), so that one is marked.
  studio: {
    eyebrow: "Ranah Studio",
    featuresLabel: "Fitur Ranah Studio",
    mockup:
      "Editor Ranah Studio: judul dan dua paragraf di lembar kertas, bilah format sederhana, jumlah kata dan karakter, waktu baca, dan target hari ini 320 dari 500 kata.",
    characters: "karakter",
    readingTime: "{count} mnt baca",
    today: "Hari ini {count} / 500 kata",
    soon: "Menyusul",
    features: [
      "Text Formatter",
      "Statistik Menulis",
      "Target Harian",
      "Template Menulis",
      "Word & Character Counter",
      "Reading Time",
    ],
  },
  publishing: {
    title: "Dari Naskah Digital Menjadi Karya Nyata.",
    lead: "Wujudkan impian menerbitkan buku pertamamu bersama ekosistem penerbitan RanahMenulis.",
    covers: "Tiga sampul buku dari program penerbitan RanahMenulis, di depan ruang percetakan.",
    coverTitles: [
      "Surat yang Tidak Pernah Terkirim",
      "Yang Ditunggu Nenek di Bawah Jambu Air",
      "Dua Puluh Menit Sebelum Subuh",
    ],
    // Names from image 2; their sentences were cut in tahap H.
    paths: ["Antologi", "Solo Book", "Kelas Menulis", "Lomba Menulis"],
    cta: "Lihat Peluang Menerbitkan Karya",
  },
  previews: {
    pause: "Jeda animasi",
    play: "Putar animasi",
    streakUnit: "hari berturut-turut",
    todayWords: "Hari ini {count} / 500 kata",
    reached: "Tercapai",
    weekdays: ["S", "S", "R", "K", "J", "S", "M"],
    submissionMeta: "“Toples Kerupuk” · versi 2 · dikirim 3 Nov",
    sent: "Dikirim",
    accepted: "Diterima",
    submissionNote: "Draf di Studio diubah 2 jam lalu. Versi yang dikirim tetap versi 2.",
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
