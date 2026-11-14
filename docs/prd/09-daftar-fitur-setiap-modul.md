## 9. Daftar Fitur Setiap Modul

Setiap fitur memiliki ID yang dipakai di seluruh dokumen (kebutuhan fungsional, user stories, acceptance criteria). Kolom Fase adalah **usulan** yang mengikuti prioritas founder: tiga modul inti wajib ada di MVP, sementara alur lanjutan boleh menyusul. Persetujuan fase ada di bagian 23 dan 28.

### 9.1 Kapabilitas platform (bukan modul)

| ID | Fitur | Pengguna utama | Fase |
| --- | --- | --- | --- |
| PLT-01 | Registrasi, login, verifikasi email, reset kata sandi | Semua | MVP |
| PLT-02 | Profil dan pengaturan akun (nama, username, foto, bio, negara, zona waktu, genre) | Registered User | MVP |
| PLT-03 | Role-Based Access Control, tingkat Super Admin, dan penugasan per proyek dan per grup | Super Admin, Administrator | MVP |
| PLT-04 | Notifikasi dalam aplikasi dan email transaksional | Semua | MVP |
| PLT-05 | Panel administrasi dasar (pengguna, role, grup, proyek, konten, audit log) | Super Admin, Administrator | MVP |
| PLT-06 | Moderasi dan penanganan laporan | Administrator | MVP |
| PLT-07 | Pembayaran: informasi biaya, pembayaran QRIS (konfirmasi lewat webhook; awalnya semi-manual dengan dashboard admin), dan konfirmasi manual | Peserta, Organizer | MVP (Q-19) |
| PLT-08 | Pembayaran online MYR dan gateway resmi lintas mata uang | Peserta | Fase 2 |
| PLT-09 | Logo grup: Admin Grup atau Administrator mengunggah gambar sebagai logo Grup Penulis | Admin Grup, Administrator | Fase 2 |
| PLT-10 | Dashboard di Beranda: blok ringkasan "Hari ini" di atas feed (lanjutkan menulis, progres harian, hal yang perlu perhatian, proyek saya, notifikasi baru) | Registered User ke atas | MVP (sementara, ditinjau ulang setelah desain; Q-49) |

### 9.2 Studio, area Streak

| ID | Fitur | Pengguna utama | Fase |
| --- | --- | --- | --- |
| STK-01 | Target menulis harian | Writer | MVP |
| STK-02 | Pelacakan jumlah kata (berbasis perubahan) | Writer | MVP |
| STK-03 | Kalender aktivitas menulis | Writer | MVP |
| STK-04 | Penghitungan streak | Writer | MVP |
| STK-05 | Statistik harian, mingguan, bulanan | Writer | MVP (dasar) |
| STK-06 | Pencapaian atau milestone | Writer | MVP (daftar dasar) |
| STK-07 | Kartu pencapaian yang dapat dibagikan | Writer | Fase 2 |

### 9.3 Studio, area Menulis

| ID | Fitur | Pengguna utama | Fase |
| --- | --- | --- | --- |
| STD-01 | Editor tulisan (bold, italic, heading, paragraf, blockquote, bullet, numbered list) | Writer | MVP |
| STD-02 | Penyimpanan otomatis, status simpan, penanganan offline, penanganan konflik | Writer | MVP |
| STD-03 | Pengelolaan dokumen dan folder (buat, ubah nama, pindah, hapus, cari, urutkan) | Writer | MVP |
| STD-04 | Penghitung kata, karakter, paragraf | Writer | MVP |
| STD-05 | Template menulis | Writer | Fase 2 |
| STD-06 | Pengelolaan manuskrip (gabungan dokumen menjadi proyek buku) | Writer | Fase 2 (Q-11) |
| STD-07 | Ekspor TXT dan PDF | Writer | MVP (Q-46) |
| STD-08 | Ekspor DOCX | Writer | Fase 2 |
| STD-09 | Kirim dokumen ke Projects sebagai versi submission | Writer | MVP |
| STD-10 | Bagikan prolog atau cuplikan dokumen ke Community | Writer | MVP |
| STD-11 | Kit inspirasi dan tab bantuan di dalam editor (ide cerita, kalimat pembuka, kamus diksi, pertanyaan refleksi, ide judul, kalimat penutup, kamus transisi, perpustakaan prompt) | Writer | MVP |

### 9.4 Ranah Community

| ID | Fitur | Pengguna utama | Fase |
| --- | --- | --- | --- |
| COM-01 | Postingan prolog atau cuplikan karya (diatur publik oleh penulis) | Writer | MVP |
| COM-02 | Cerita berseri | Writer | Fase 2 |
| COM-03 | Feed | Semua | MVP |
| COM-04 | Apresiasi | Registered User | MVP |
| COM-05 | Komentar (tulis, balas, hapus milik sendiri, laporkan) | Registered User | MVP |
| COM-06 | Bookmark | Registered User | MVP |
| COM-07 | Highlight ("This Line Hit Me") | Registered User | Fase 2 (Q-15) |
| COM-08 | Follow penulis | Registered User | MVP |
| COM-09 | Discover | Semua | MVP (kategori dasar) |
| COM-10 | Profil penulis publik dan portofolio | Semua | MVP |
| COM-11 | Kartu tulisan yang dapat dibagikan | Writer | Fase 2 |
| COM-12 | Publikasi karya penuh (tulisan pendek dan tulisan panjang) | Writer | Fase 2 (Q-14) |

### 9.5 Projects

| ID | Fitur | Kategori | Pengguna utama | Fase |
| --- | --- | --- | --- | --- |
| PRJ-01 | Daftar dan halaman detail proyek | Semua | Semua | MVP |
| PRJ-02 | Ketentuan, persetujuan hak cipta, dan pendaftaran peserta | Semua | Writer | MVP |
| PRJ-03 | Pengelolaan proyek oleh Organizer (buat, jadwal, kuota, publikasi, penugasan) | Semua | Project Organizer | MVP |
| PRJ-04 | Pengiriman karya dan status submission | Antologi, Solo, Lomba | Writer | MVP |
| PRJ-05 | Pemesanan buku | Antologi, Solo | Pembeli | Fase 3 (Q-25) |
| ANT-01 | Seleksi, feedback editor, permintaan revisi, persetujuan karya | Antologi | Editor | MVP |
| ANT-02 | Pelacakan penyuntingan, desain, layout, produksi, penerbitan | Antologi | Organizer | MVP (status manual) |
| SOL-01 | Daftar paket, detail layanan, harga, persyaratan, pengajuan penerbitan | Solo | Writer | MVP |
| SOL-02 | Dasbor perkembangan penerbitan (editing, proofreading, cover, layout, persetujuan final, produksi) | Solo | Writer | MVP (status manual) |
| KLS-01 | Kurikulum, materi, jadwal, profil pengajar | Kelas Menulis | Writer | MVP |
| KLS-02 | Dasbor peserta dan progres belajar | Kelas Menulis | Writer | MVP |
| KLS-03 | Tugas, pengumpulan tugas, feedback mentor | Kelas Menulis | Writer, Mentor | MVP |
| KLS-04 | Sertifikat kelas | Kelas Menulis | Writer | Fase 2 |
| LMB-01 | Kriteria dan sistem penilaian juri (termasuk anonim) | Lomba | Judge | MVP |
| LMB-02 | Pengumuman finalis dan pemenang | Lomba | Semua | MVP |
| LMB-03 | Sertifikat lomba | Lomba | Pemenang, peserta | Fase 2 |
