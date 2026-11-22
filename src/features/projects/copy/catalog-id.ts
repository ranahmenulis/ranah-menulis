export const projectsCatalog = {
  categories: {
    semua: {
      label: "Semua",
      description: "Program untuk menulis, berkolaborasi, berkompetisi, dan menerbitkan buku.",
    },
    antologi: {
      label: "Antologi",
      description:
        "Satu buku bertema dari banyak penulis. Naskahmu diseleksi, direvisi bersama editor, lalu masuk produksi.",
    },
    solo: {
      label: "Solo",
      description: "Menerbitkan satu bukumu sendiri, dari penyuntingan sampai produksi.",
    },
    kelas: {
      label: "Kelas Menulis",
      description:
        "Kelas, workshop, dan mentoring menulis dengan tugas dan umpan balik dari mentor.",
    },
    lomba: {
      label: "Lomba",
      description:
        "Kompetisi menulis dengan tenggat, penjurian berkriteria, dan pengumuman pemenang.",
    },
  },
  stateFilters: {
    semua: "Semua status",
    buka: "Buka",
    "segera-tutup": "Segera tutup",
    ditutup: "Ditutup",
  },
  feeFilters: { semua: "Semua biaya", gratis: "Gratis", berbayar: "Berbayar" },
  states: {
    buka: "Buka",
    "segera-tutup": "Segera tutup",
    "kuota-penuh": "Kuota penuh",
    ditutup: "Ditutup",
  },
  fee: { free: "Gratis", startingFrom: "Mulai dari" },
  deadline: {
    yearRound: "Dibuka sepanjang tahun",
    closes: "Tutup {date}",
    closed: "Ditutup {date}",
  },
  quota: {
    label: "Kuota",
    none: "Tanpa kuota",
    full: "Kuota penuh",
    left: "Sisa {left} dari {total} kuota",
  },
  daysLeft: { lastDay: "Hari ini hari terakhir", days: "{n} hari lagi" },
  action: {
    openClassDashboard: "Buka dasbor kelas",
    openDashboard: "Buka dasbor",
    sendWork: "Kirim karya",
    sentOf: "{n} dari {works}",
    works: "{n} karya",
  },
  filters: { category: "Kategori", status: "Status", fee: "Biaya" },
  view: {
    title: "Projects",
    mine: "Proyek saya",
    none: "Tidak ada proyek",
    count: "{n} proyek",
    clearFilters: "Hapus penyaring",
    seeAll: "Lihat semua Projects",
    noMatch: "Tidak ada proyek yang cocok dengan penyaring ini.",
    noneInCategory: "Belum ada proyek {category} yang dibuka.",
    noneOpen: "Belum ada proyek yang dibuka.",
  },
  featured: { label: "Unggulan", all: "Semua proyek", view: "Lihat proyek" },
  detail: {
    allProjects: "Semua Projects",
    about: "Tentang proyek",
    requirements: "Syarat naskah",
    scheduleTitle: "Jadwal",
    registration: "Pendaftaran",
    scheduleNote:
      "Semua tanggal mengikuti zona waktu proyek ({zone}). Pendaftaran dan pengiriman berlaku sampai akhir hari pada tanggal itu.",
    rightsTitle: "Hak cipta dan ketentuan",
    rights:
      "Hak cipta karyamu tetap padamu, kecuali ketentuan proyek menyatakan lain secara eksplisit. Ketentuan lengkap proyek ini kamu baca dan setujui sebelum mendaftar.",
    managedBy: "Dikelola oleh {organizer}.",
  },
  aside: {
    label: "Pendaftaran",
    feePackage: "Biaya paket",
    fee: "Biaya",
    sent: "Karya terkirim",
    results: "Lihat hasil lomba",
    viewRegistration: "Lihat pendaftaran",
    registeredOn: "Terdaftar pada {date}.",
    awaitingPayment: "Menunggu pembayaran; kuotamu ditahan.",
    packageNote: " Paket {name}.",
  },
  blocks: {
    antologiTitle: "Alur seleksi dan produksi",
    theme: "Tema ",
    soloTitle: "Paket layanan",
    kelasTitle: "Pengajar dan kurikulum",
    moduleSr: "Modul {n}. ",
    meetings: "{n} pertemuan",
    lombaTitle: "Kriteria dan hadiah",
    prizes: "Hadiah",
    anonymous:
      "Penilaian anonim: nama dan profil peserta disembunyikan dari juri sampai penilaian ditutup.",
  },
  screens: {
    loadingProjects: "Memuat Projects",
    loadingProject: "Memuat proyek",
    loadingDashboard: "Memuat dasbor",
    goneTitle: "Proyek ini tidak ditemukan.",
    goneBody: "Alamatnya mungkin salah ketik, atau proyeknya belum dibuka untuk umum.",
    goneBack: "Lihat semua Projects",
  },
};
