export const kelolaShared = {
  areas: {
    organizer: {
      label: "Proyek",
      summary: "Buat dan ubah proyek, tugaskan tim, dan lihat peserta serta kiriman.",
    },
    editor: {
      label: "Antrean submission",
      summary: "Tinjau karya yang ditugaskan kepadamu, beri catatan, dan putuskan.",
    },
    juri: { label: "Penilaian", summary: "Nilai karya lomba yang ditugaskan kepadamu." },
    mentor: {
      label: "Kelas",
      summary: "Kelola peserta, tugas, pengumpulan, dan feedback kelasmu.",
    },
    admin: {
      label: "Admin",
      summary: "Pengguna dan role, moderasi, kurasi, lingkar, dan audit log.",
    },
  },
  band: {
    eyebrow: "Ruang kerja · {role}",
    sectionLabel: "Ruang kerja {role}",
    loading: " (memuat)",
    roles: {
      editor: { role: "Editor", unit: "karya perlu tindakan" },
      juri: { role: "Juri", unit: "karya belum kamu nilai" },
      mentor: { role: "Mentor", unit: "pengumpulan menunggu penilaianmu" },
      organizer: { role: "Organizer", unit: "proyek aktif" },
      admin: { role: "Administrator", unit: "laporan baru menunggu keputusan" },
    },
    entries: {
      editor: "Tinjau yang perlu tindakan",
      juri: "Lanjut menilai",
      mentor: "Nilai pengumpulan",
      organizer: "Kelola Event",
      admin: "Buka moderasi",
    },
  },
  overview: {
    title: "Kelola",
    subtitle: "Ruang kerja untuk setiap peran yang kamu pegang.",
  },
  frame: { loading: "Memuat", summary: "Ringkasan", navLabel: "Bagian kelola" },
  menu: { open: "Buka menu kelola", close: "Tutup menu kelola", title: "Kelola" },
  denied: {
    title: "Kelola",
    guest: "Masuk dulu untuk membuka bagian ini.",
    role: "Kamu tidak punya akses ke bagian ini.",
    signIn: "Masuk",
    home: "Kembali ke Beranda",
  },
  placeholder: { notOpen: "Bagian ini belum dibuka." },
  frozen: { empty: "Versi ini tidak berisi teks." },
  reason: {
    empty: "Tulis alasannya. Peserta membacanya di detail karya.",
    tooLong: "Alasan paling banyak {limit} karakter.",
  },
};
