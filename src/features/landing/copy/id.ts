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
    title: "RanahMenulis · Ruang digital untuk setiap ceritamu",
    description:
      "Temukan ruang untuk menulis, mengembangkan kemampuan, terhubung dengan komunitas, dan menerbitkan karyamu bersama RanahMenulis.",
  },
  topBar: {
    logoLabel: "RanahMenulis, ke atas",
    navLabel: "Halaman",
    menu: "Menu halaman",
    ecosystem: "Ekosistem",
    studio: "Studio",
    publishing: "Penerbitan",
    faq: "Tanya jawab",
    cta: "Gabung daftar tunggu",
    ctaShort: "Daftar tunggu",
  },
  hero: {
    eyebrow: "Digital Writing Ecosystem",
    // Three lines: the middle one is set in the serif italic (DESIGN.md 4.6, hero C2).
    titleLines: ["Ruang Digital Untuk", "Setiap Ceritamu.", "Mulai Bersama Kami."],
    colophon: "Indonesia · Malaysia",
    lead: "Temukan ruang untuk menulis, mengembangkan kemampuan, terhubung dengan komunitas, dan menerbitkan karyamu bersama RanahMenulis.",
    cta: "Gabung daftar tunggu",
    secondary: "Jelajahi Ekosistem",
    ariaLabel:
      "Video tanpa suara: satu paragraf diketik di Studio dan tersimpan, target 500 kata hari ini tercapai dan streak naik menjadi 7 hari. Paragraf pertama dibagikan ke Community sebagai postingan publik, sementara dokumennya tetap pribadi. Postingan itu muncul di Jelajahi, lalu tampil sampul buku Yang Ditunggu Nenek di Bawah Jambu Air karya Rinjani Putri.",
    saving: "Menyimpan…",
    saved: "Tersimpan 14.02",
    words: "kata",
  },
  // Alt text of the public-domain plates that carry meaning; the other three are decorative.
  images: {
    holbein: "Studi tangan Erasmus yang sedang menulis, gambar Hans Holbein muda.",
    keladi: "Gravir tanaman keladi dalam pot, dari majalah The American Florist tahun 1886.",
  },
  // Sample manuscript shown in the hero and the previews.
  doc: {
    title: "Yang Ditunggu Nenek di Bawah Jambu Air",
    shortTitle: "Yang Ditunggu Nenek",
    author: "Rinjani Putri",
    typed:
      "Hujan pertama bulan November selalu datang sore hari, tepat ketika Nenek selesai menyapu halaman. Ia tidak pernah berlari masuk.",
    page: [
      "Hujan pertama bulan November selalu datang sore hari, tepat ketika Nenek selesai menyapu halaman. Ia tidak pernah berlari masuk. Ia berdiri dulu di bawah jambu air, membiarkan beberapa tetes jatuh ke kerudungnya, seolah menunggu seseorang yang berjanji pulang bersama musim.",
      "Aku baru mengerti kebiasaan itu bertahun-tahun kemudian, setelah rumah itu dijual dan pohon jambunya ditebang orang yang tidak suka daun berserakan.",
    ],
    editorBase:
      "Ada orang yang menunggu dengan duduk di beranda, memandangi ujung jalan sampai matanya perih.",
    editorTail: " Nenek menunggu dengan basah.",
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
    cta: "Gabung bersama mereka",
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
        preview: "Editor Studio: kalimat terakhir diketik, lalu tersimpan. Dokumen tetap pribadi.",
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
  studio: {
    eyebrow: "Ranah Studio",
    title: "Ruang Menulismu yang Fokus dan Nyaman.",
    lead: "Tulis, kembangkan, dan selesaikan karyamu di Ranah Studio. Workspace profesional untuk penulis.",
    featuresLabel: "Fitur Ranah Studio",
    swipe: "Geser",
    mockup:
      "Editor Ranah Studio: judul dan dua paragraf, bilah format sederhana, jumlah kata dan karakter, waktu baca, dan target hari ini 320 dari 500 kata.",
    characters: "karakter",
    readingTime: "{count} mnt baca",
    today: "Hari ini {count} / 500 kata",
    soon: "Menyusul",
    // The six tiles from image 3. Templates are Phase 2 (STD-05), so that tile is marked.
    features: [
      { name: "Text Formatter", text: "Atur format tulisanmu dengan mudah." },
      { name: "Statistik Menulis", text: "Pantau progres dan konsistensi menulismu." },
      { name: "Target Harian", text: "Bangun kebiasaan menulis yang terukur." },
      { name: "Template Menulis", text: "Mulai menulis lebih cepat dengan berbagai template." },
      {
        name: "Word & Character Counter",
        text: "Ketahui jumlah kata dan karakter secara real-time.",
      },
      { name: "Reading Time", text: "Lihat estimasi waktu baca karyamu." },
    ],
    cta: "Coba Ranah Studio Sekarang",
  },
  publishing: {
    eyebrow: "Publishing Opportunities",
    title: "Dari Naskah Digital Menjadi Karya Nyata.",
    lead: "Wujudkan impian menerbitkan buku pertamamu bersama ekosistem penerbitan RanahMenulis.",
    covers: "Tiga sampul buku hitam putih dari program penerbitan RanahMenulis.",
    coverTitles: [
      "Surat yang Tidak Pernah Terkirim",
      "Yang Ditunggu Nenek di Bawah Jambu Air",
      "Dua Puluh Menit Sebelum Subuh",
    ],
    pathsTitle: "Berbagai Jalur Penerbitan Sesuai Tahap Perjalananmu",
    // Names and sentences from image 2.
    paths: [
      { name: "Antologi", text: "Berkarya bersama penulis lain dalam satu buku tema pilihan." },
      { name: "Solo Book", text: "Terbitkan karya solomu dengan pendampingan tim." },
      { name: "Kelas Menulis", text: "Tingkatkan keterampilan menulis dan siapkan naskah terbit." },
      { name: "Lomba Menulis", text: "Ikuti kompetisi menulis dengan peluang penerbitan." },
    ],
    cta: "Terbitkan Karyamu Sekarang",
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
  waitlist: {
    eyebrow: "Mulai Perjalanan Menulismu",
    title: "Saatnya Menulis, Berkembang, dan Menerbitkan Karya.",
    intro:
      "Bergabunglah dengan RanahMenulis dan menjadi bagian dari ekosistem penulis di Indonesia dan Malaysia.",
    note: "RanahMenulis belum dibuka. Simpan namamu, kami kabari lewat email saat dibuka.",
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
      "Digital Writing Ecosystem. Ruang tumbuh bagi setiap penulis untuk menulis, berkembang, dan menerbitkan karya.",
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
