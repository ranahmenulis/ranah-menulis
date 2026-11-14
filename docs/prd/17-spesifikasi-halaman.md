## 17. Spesifikasi Halaman

Untuk setiap halaman: tujuan, siapa yang mengakses, isi utama, aksi utama, dan keadaan khusus (kosong, memuat, galat). Setiap halaman wajib memiliki keadaan memuat, kosong, dan galat yang dirancang, serta tampilan mobile.

### 17.1 Umum dan akun

| Halaman | Akses | Isi utama dan aksi | Keadaan khusus |
| --- | --- | --- | --- |
| Landing | Guest | Pesan nilai produk, cuplikan karya, ajakan daftar | Pengguna masuk diarahkan ke Beranda |
| Daftar, Masuk, Lupa sandi | Guest | Formulir, validasi, pesan galat jelas | Email belum terverifikasi: ajakan kirim ulang |
| Pengaturan akun | Registered User | Profil, negara, zona waktu, privasi, notifikasi, hapus akun | Perubahan zona waktu menampilkan peringatan efek pada streak |
| Notifikasi | Registered User | Daftar notifikasi, tandai dibaca, tautan ke objek | Kosong |
| Beranda, blok "Hari ini" (sementara, Q-49) | Registered User | Di atas feed: Lanjutkan menulis, Progres hari ini, Perlu perhatian, Proyek saya, Notifikasi baru (PLT-10). Aksi utama: Lanjutkan menulis | Pengguna baru: tiga langkah awal; blok tanpa isi disembunyikan; tiap blok memuat dan gagal sendiri dengan tombol coba lagi |

### 17.2 Studio, area Menulis

| Halaman | Akses | Isi utama dan aksi | Keadaan khusus |
| --- | --- | --- | --- |
| Daftar dokumen | Pemilik | Folder dan dokumen, cari, urutkan, buat, pindah, hapus, status penerbitan (sudah dibagikan, sudah dikirim ke proyek) | Kosong: ajakan menulis dan pilih template |
| Editor | Pemilik | Area tulis, bilah format terbatas, judul, jumlah kata dan karakter dan paragraf, indikator simpan, menu Bagikan, Kirim ke proyek, Ekspor | Offline, konflik, dokumen dihapus dari perangkat lain |
| Dialog konflik | Pemilik | Perbandingan dua versi dan pilihan memakai salah satu atau menggabungkan | Wajib diselesaikan sebelum menyimpan |
| Manuskrip | Pemilik (Fase 2) | Susunan bab, catatan, riset, total kata, urutkan, ekspor | Bab kosong |
| Sampah | Pemilik | Dokumen terhapus, pulihkan, hapus permanen | Kosong |

### 17.3 Studio, area Streak

| Halaman | Akses | Isi utama dan aksi | Keadaan khusus |
| --- | --- | --- | --- |
| Dasbor Streak | Pemilik | Progres hari ini terhadap target, streak saat ini dan terpanjang, kalender bulan, tombol Mulai menulis | Belum ada target: ajakan menetapkan target |
| Statistik | Pemilik | Grafik kata per hari, minggu, bulan, rata-rata, hari terbaik | Data belum cukup |
| Milestone | Pemilik | Daftar pencapaian terbuka dan terkunci, syarat, tombol Bagikan (Fase 2) | Semua terkunci |

### 17.4 Ranah Community

| Halaman | Akses | Isi utama dan aksi | Keadaan khusus |
| --- | --- | --- | --- |
| Feed | Publik (interaksi perlu akun) | Kartu karya (nama, username, foto, jenis, isi atau pratinjau, tanggal, hitungan apresiasi, komentar, bookmark) | Pengguna baru tanpa follow diarahkan ke Discover |
| Discover | Publik | Kategori: Trending Today, New Writers, Editor's Picks, Most Appreciated, Most Saved, Hidden Gems, Indonesia Writers, Malaysia Writers | Kategori kosong disembunyikan |
| Halaman postingan | Publik | Judul, penulis, isi prolog atau cuplikan dengan tata letak membaca nyaman, Apresiasi, komentar bersusun, bookmark, bagikan, laporkan, Highlight (Fase 2) | Postingan ditarik, atau dihapus: halaman tidak tersedia |
| Halaman seri | Publik (Fase 2) | Daftar bab berurutan, ikuti seri | Seri tanpa bab terbit |
| Tulis postingan | Writer | Tulis prolog atau pilih cuplikan dari dokumen, judul, genre, atur publik, pratinjau, terbitkan atau simpan sebagai draf | Melebihi batas kata postingan |
| Profil penulis | Publik | Nama, username, foto, bio, negara, genre, portofolio, karya, followers, following, tombol ikuti | Profil pribadi sebagian |
| Bookmark | Pemilik | Daftar karya tersimpan, hapus bookmark | Kosong |
| Pembuat kartu tulisan | Writer (Fase 2) | Pilih bagian teks, gaya kartu, pratinjau, unduh atau bagikan | Teks terlalu panjang |

### 17.5 Projects

| Halaman | Akses | Isi utama dan aksi | Keadaan khusus |
| --- | --- | --- | --- |
| Pusat Projects | Publik | Empat kategori, penyaringan, proyek unggulan | Kategori tanpa proyek aktif |
| Daftar per kategori | Publik | Kartu proyek dengan biaya, kuota tersisa, deadline | Tidak ada hasil penyaringan |
| Detail proyek | Publik | Tema, persyaratan, biaya, kuota, jadwal, pengelola, ketentuan hak cipta, tombol Daftar atau Kirim Karya sesuai status | Kuota penuh, deadline lewat, belum masuk |
| Pendaftaran | Writer | Ringkasan biaya, persetujuan ketentuan, pembayaran atau instruksi pembayaran | Menunggu konfirmasi pembayaran |
| Kirim karya | Peserta terdaftar | Formulir informasi, pemilih naskah dari Studio, hasil validasi, konfirmasi kirim | Validasi gagal, deadline, batas jumlah karya |
| Proyek saya | Peserta | Semua pendaftaran dan submission beserta status | Kosong |
| Detail submission | Peserta | Status, riwayat versi, feedback editor, tombol Kirim Revisi atau Tarik | Perlu Revisi menampilkan catatan |
| Dasbor Solo | Penulis Solo | Lini masa tahap penerbitan, berkas pratinjau, tombol setujui final | Tahap belum dimulai |
| Dasbor Kelas | Peserta kelas | Jadwal, materi, tugas, feedback, progres, sertifikat (Fase 2) | Kelas belum dimulai |
| Halaman tugas | Peserta, Mentor | Instruksi, deadline, pengumpulan, feedback | Terlambat |
| Halaman hasil lomba | Publik | Finalis, pemenang, ringkasan kriteria | Belum diumumkan |

### 17.6 Sisi pengelola dan admin

| Halaman | Akses | Isi utama dan aksi | Keadaan khusus |
| --- | --- | --- | --- |
| Kelola proyek | Organizer | Buat dan ubah proyek, jadwal, kuota, ketentuan, penugasan, daftar peserta, konfirmasi pembayaran, update tahap produksi | Draf, terbit, ditutup, diarsipkan |
| Antrean submission | Editor | Submission yang ditugaskan, filter status, baca versi beku, isi feedback, keputusan | Antrean kosong |
| Panel penilaian | Judge | Karya ditugaskan (anonim bila diatur), kriteria dan skor, catatan, kirim penilaian | Penilaian ditutup |
| Kelola kelas | Mentor | Peserta, tugas, pengumpulan, feedback, nilai kelulusan | Kelas belum punya peserta |
| Admin: pengguna dan role | Administrator, Super Admin | Cari pengguna, ubah role dasar dan penugasan, tangguhkan akun. Aksi beri atau cabut role Administrator hanya tampil dan berlaku untuk Super Admin | Tindakan perlu konfirmasi; pencabutan Super Admin terakhir ditolak |
| Admin: grup | Administrator, Super Admin | Buat grup, undang anggota, tunjuk dan cabut Admin Grup (lebih dari satu per grup), ubah nama dan deskripsi; unggah logo grup (Fase 2) | Grup belum punya Admin Grup: peringatan |
| Admin: pengaturan sistem | Super Admin | Pengaturan tingkat platform | Tindakan perlu konfirmasi |
| Admin: moderasi | Administrator, Super Admin | Antrean laporan, konteks, keputusan | Tidak ada laporan |
| Admin: kurasi | Administrator, Super Admin | Pilih Editor's Picks, kelola template |  |
| Admin: audit log | Administrator, Super Admin | Catatan tindakan sensitif yang dapat disaring; hanya baca | Tidak ada tombol ubah atau hapus |
