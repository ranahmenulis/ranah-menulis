# Panduan Uji Manual End-to-End RanahMenulis

Dokumen ini memetakan alur aplikasi beserta rutenya supaya seluruh fitur yang sudah dibangun bisa diuji manual dari awal sampai akhir. Rute dan data contoh diambil dari kode di `src/app/` dan `src/features/` per 20 November 2026.

## 0. Hal yang perlu diketahui sebelum menguji

- **Belum ada backend.** Semua data berasal dari fixture (contoh) atau disimpan **di peramban ini saja** (IndexedDB dan `localStorage`). Tidak ada data yang dibagikan antar perangkat atau antar akun. Satu pengguna dummy memainkan semua peran.
- **Login di-bypass.** Formulir akun hanya memvalidasi lalu berpindah layar. Tidak ada sesi nyata.
- **Jalankan dengan `npm run dev`** (`http://localhost:3000`). Beberapa kontrol uji (`?sebagai=`, tombol isi data contoh Streak) hanya ada di mode pengembangan. Di `npm run start` (produksi) pengguna selalu "masuk" tanpa peran kelola.
- **Pakai satu peramban dan satu profil.** Data uji hilang bila situs dibersihkan atau memakai jendela privat berbeda.
- **Bahasa:** UI hampir seluruhnya Bahasa Indonesia. Hanya landing dan akun yang punya terjemahan Inggris.

### 0.1 Mengganti sudut pandang (hanya development)

Tambahkan parameter `?sebagai=` ke alamat mana pun. Pilihan disimpan di `sessionStorage` per tab.

| Alamat | Efek |
| --- | --- |
| `?sebagai=tamu` | Tampilan tamu (belum masuk). Tombol Masuk dan Daftar muncul. |
| `?sebagai=masuk` | Kembali ke pengguna dummy, semua peran kelola dikosongkan. |
| `?sebagai=editor` | Masuk dengan peran Editor (menu **Kelola** muncul). |
| `?sebagai=organizer`, `juri`, `mentor`, `administrator`, `super-admin` | Peran lain. |
| `?sebagai=editor,juri` | Beberapa peran sekaligus (pisahkan koma). |

Pengguna dummy: **Rinjani Putri**, handle `rinjaniputri`, profil di `/penulis/rinjaniputri`.

### 0.2 Mengatur ulang data uji

DevTools → Application → Storage → **Clear site data** (centang IndexedDB dan Local Storage), lalu muat ulang. Ini menghapus dokumen Studio, postingan dan komentar buatan, pendaftaran, kiriman, tugas, skor, pengaturan, dan log audit.

Kunci `localStorage` penting: `ranah.account`, `ranah.registrations`, `ranah.notificationsRead`, `ranah.staffAssignments`, `ranah.roleGrants`, `ranah.events`, `ranah.writingGroups`, `ranah.auditLog`.
Database IndexedDB: `ranah-community`, `ranah-projects`, `ranah-kelas`, `ranah-solo`, dan database Studio.

### 0.3 Data contoh yang dipakai dalam skenario

**Proyek** (`/projects/<slug>`):

| Slug | Kategori | Keadaan | Biaya |
| --- | --- | --- | --- |
| `antologi-surat-yang-tidak-pernah-terkirim` | Antologi | Buka, kuota 31 dari 40, tutup 21 hari lagi | Rp 75.000 |
| `antologi-pulang-ke-pesisir` | Antologi | Kuota penuh, sudah ditutup | Rp 50.000 |
| `antologi-puisi-tengah-malam` | Antologi | **Draf** (tidak tampil; alamatnya menampilkan "Proyek ini tidak ditemukan") | Gratis |
| `solo-penerbitan-buku-sendiri` | Solo | Terbuka sepanjang tahun, tiga paket | Rp 1.500.000 / 3.500.000 / 6.000.000 |
| `kelas-cerpen-untuk-pemula` | Kelas | **Sudah berjalan** (mulai 2 hari lalu), segera tutup | Gratis |
| `kelas-menulis-puisi-dasar` | Kelas | Belum dimulai | Rp 150.000 |
| `lomba-cerpen-hujan-2026` | Lomba | Buka, tutup 9 hari lagi | Rp 35.000 |
| `lomba-esai-literasi-remaja` | Lomba | Segera tutup (2 hari), **anonim** | Gratis |
| `lomba-puisi-pendek-nusantara` | Lomba | Kuota penuh (100 dari 100) | Gratis |
| `lomba-cerita-mini-pesisir-2026` | Lomba | **Sudah selesai**, pemenang diumumkan, anonim | Rp 25.000 |

**Penugasan awal** (`?sebagai=` peran terkait): Editor → dua Antologi (`surat-yang-tidak-pernah-terkirim`, `pulang-ke-pesisir`) dan Solo; Mentor → `kelas-cerpen-untuk-pemula`; Juri → `lomba-cerpen-hujan-2026`. Proyek di luar daftar ini menguji keadaan "tidak ditugaskan".

**Postingan Community:** 19 postingan, contoh id: `hujan-pertama-bulan-november`, `toples-kerupuk`, `pasar-malam-selepas-hujan`, `penjaga-mercusuar`, `garam-dan-pelabuhan`.

**Penulis dummy:** `ainasofea`, `bayuwicaksono`, `dimaspratama`, `faridzulkifli`, `hafizrahman`, `laras`, `mayaanindita`, `nadiahroslan`, `nuraisyah`, `rinjaniputri`, `sitikhadijah`.

**Grup:** `penulis-pesisir` (Grup Penulis Pesisir) dan `ruang-cerpen` (Ruang Cerpen). **Event:** `cerita-selama-sepekan` (18 sampai 25 November 2026, jadi **aktif hanya sampai 25 November**; setelahnya uji pendaftaran event memakai event buatan sendiri).

**Alamat email khusus di formulir akun:** `salah@…` (gagal: sandi salah), `belum@…` (gagal: email belum diverifikasi), `terdaftar@…` (tidak bisa daftar: sudah terdaftar). Alamat lain selalu berhasil.

---

## 1. Peta rute dan isi tiap layar

Tiap rute dicocokkan dengan dokumen sumber. Kolom **Rujukan** memakai ID dari PRD v0.2 (`docs/prd/`): fitur (`PLT-`, `STK-`, `STD-`, `COM-`, `PRJ-`, `SOL-`, `KLS-`, `LMB-`) ada di bagian 09 dan 10, spesifikasi halaman di bagian 17, alur di bagian 13, navigasi di bagian 16, notifikasi di bagian 20, keputusan client di `docs/catatan-keputusan-client.md`. Desain awal (arsip) ada di `docs/desain/aplikasi/` dan `docs/desain/landing/`.

Kolom **Akses** menunjukkan siapa yang bisa membuka layar menurut kode saat ini. Layar tanpa penjelasan lain tampil untuk pengguna dummy yang sudah "masuk".

### 1.1 Publik dan akun

| Rute | Isi layar | Akses | Rujukan |
| --- | --- | --- | --- |
| `/` | Landing pra-peluncuran: hero dengan video, bukti sosial, lima modul ekosistem, mockup editor beranotasi, jalur penerbitan, FAQ, form daftar tunggu, kaki halaman. Ganti tema dan bahasa. | Semua | PRD 17.1 (Landing); `docs/produk/Copy Landing RanahMenulis.md`; `docs/desain/landing/` |
| `/masuk` | Formulir masuk (email, sandi), tautan lupa sandi dan daftar. Menerima `?lanjut=` untuk tujuan setelah masuk. | Tamu | PLT-01; AC-01; PRD 17.1 |
| `/daftar` | Formulir daftar: email, sandi 8–72 byte (huruf dan angka), persetujuan ketentuan. | Tamu | PLT-01 |
| `/verifikasi` | Menunggu verifikasi email (bawaan), `?status=berhasil` (lanjut ke `/mulai`), `?status=kedaluwarsa` (kirim ulang). | Tamu | PLT-01; AC-01 |
| `/mulai` | Onboarding profil: nama, username unik 3–20, foto, bio, negara, zona waktu, genre. | Setelah daftar | PLT-02 |
| `/lupa-sandi` | Permintaan tautan atur ulang sandi. | Tamu | PLT-01 |
| `/atur-ulang-sandi` | Formulir sandi baru; `?status=kedaluwarsa` menampilkan tautan kedaluwarsa. | Tamu | PLT-01 |
| `/pengaturan` | Pengaturan akun: profil, menulis (ukuran isi, mode mesin tik, posisi, kutip melengkung, penyingkat), keamanan (ganti sandi), tampilan, Zona bahaya (hapus akun). | Masuk | PLT-02; STD-17; PRD 17.1 (Pengaturan akun) |
| `/sistem-desain`, `/sistem-desain/overlay` | Pratinjau seluruh komponen UI dan galeri overlay (Dialog, Laci, Menu, Toast, konflik). | Hanya development (404 di produksi) | `DESIGN.md` |

### 1.2 Kerangka aplikasi `(app)`

| Rute | Isi layar | Akses | Rujukan |
| --- | --- | --- | --- |
| `/beranda` | Blok "Hari ini" (target dan progres, Lanjutkan menulis, Panduan awal), Ringkasan (kalimat 7 hari, angka minggu/bulan/tahun), Perlu perhatian (revisi, pembayaran, undangan), Proyek saya, notifikasi baru, feed Mengikuti dan Jelajahi, tautan komunitas luar bila diatur. | Masuk | PLT-10; PLT-12; COM-03; PRD 17.1 (Beranda); N1, N2 |
| `/jelajahi` | Discover: chip kategori lengket, masonry 3/2/1 kolom, "Muat lebih banyak" (9 per muat). Kategori kosong disembunyikan. | Semua | COM-09; PRD 17.4 (Discover) |
| `/postingan/[id]` | Halaman baca: judul, penulis, isi prolog atau cuplikan, Apresiasi, Simpan, komentar satu tingkat, menu ⋯ (Laporkan), bilah aksi lengket di bawah. | Semua; aksi perlu masuk | COM-01, 04, 05, 06; PRD 17.4 (Halaman postingan) |
| `/penulis/[handle]` | Profil publik: identitas (kolom lengket di lg), Ikuti, tab Karya · Tentang · Proyek. Profil sendiri menampilkan "Ubah profil" nonaktif. | Semua | COM-08, COM-10; PRD 17.4 (Profil penulis) |
| `/tersimpan` | Daftar postingan yang disimpan, tulisan yang sudah tidak tersedia ditandai. Di ponsel dibuka dari profil sendiri. | Masuk | COM-06; PRD 17.4 (Bookmark) |
| `/notifikasi` | Daftar notifikasi bertab, tandai dibaca; sumber yang sama dengan lonceng. Memuat notifikasi peserta dan pengelola. | Masuk | PLT-04; PRD bagian 20 |
| `/grup` | Daftar grup saya, buat grup (nama maks 40, deskripsi maks 240), undangan. | Masuk | COM-12 (grup), PLT-03, BR-COM-12; PRD 16 (Grup) |
| `/grup/[id]` | Detail grup: anggota, tulisan anggota, bagikan progres (persetujuan terpisah), keluar, kelola anggota untuk Admin Grup. | Anggota; pengelolaan untuk Admin Grup | COM-14; Q-38, Q-41, Q-48, Q-57 |
| `/event` | Daftar kartu Event umum (tanpa kalender); jumlah peserta saja. | Semua | COM-13, BR-COM-09; PRD 17.4 (Event) |
| `/event/[id]` | Detail event: jadwal, aturan, target, kuota opsional, gabung (pilih satu dokumen Studio), progres, sprint bersama. Nama peserta hanya untuk sesama anggota grup yang sama. | Semua; gabung perlu masuk | COM-13, BR-COM-09 |
| `/studio` | Daftar dokumen dan folder dengan tab Dokumen · Streak · Statistik, tab Aktif · Arsip · Sampah, cari (Ctrl+K), jenis dan tag, status "Dibagikan" dan "Dikirim ke proyek". Query: `?tab=arsip`, `?folder=`, `?jenis=`, `?tag=`. | Masuk | STD-03, 14, 15, 16; PRD 17.2 (Daftar dokumen, Sampah) |
| `/studio/streak` | Dasbor Streak: progres hari ini, streak berjalan dan terpanjang, target harian, kalender bulan, milestone. Tombol "isi 30 hari data contoh" hanya di development. | Masuk | STK-01 sampai STK-04, STK-06; PRD 17.3 (Dasbor Streak, Milestone) |
| `/studio/statistik` | Statistik menulis: grafik batang Harian/Mingguan/Bulanan, rata-rata, hari terbaik, kartu Tempo dan jam favorit, tabel nilai. | Masuk | STK-05; PRD 17.3 (Statistik) |
| `/projects` | Katalog satu halaman: chip kategori, penyaring Status dan Biaya, blok Unggulan (tanpa filter). Query: `?kategori=&status=&biaya=`. | Semua | PRJ-01; PRD 17.5 (Pusat Projects, Daftar per kategori) |
| `/projects/saya` | Semua pendaftaran, kiriman, dan status beserta tautan ke dasbor, kiriman, dan hasil. | Peserta | PRJ-04; PRD 17.5 (Proyek saya) |
| `/projects/[slug]` | Detail proyek: tema, syarat naskah, blok khas kategori (alur Antologi, paket Solo, kurikulum Kelas, kriteria dan hadiah Lomba), jadwal, hak cipta, kolom kanan (biaya, kuota, tombol aksi sesuai status). | Semua | PRJ-01, SOL-01, KLS-01, LMB-01; PRD 17.5 (Detail proyek) |
| `/projects/[slug]/daftar` | Pendaftaran: ringkasan, paket (Solo), ketentuan dan hak cipta, kotak setuju, tombol Daftar; atau status pendaftaran dan alasan tidak bisa mendaftar. | Masuk | PRJ-02, BR-PRJ-02/03/04; PRD 17.5 (Pendaftaran) |
| `/projects/[slug]/bayar` | Pembayaran QRIS (IDR): kode contoh berlabel, sisa waktu tahanan kursi 24 jam, status menunggu/lunas/kedaluwarsa. | Pendaftar berbayar | PLT-07; Q-20 |
| `/projects/[slug]/kirim?dokumen=<id>` | Formulir kirim karya: pilih dokumen, judul, genre (Solo: jenis buku dan sinopsis), catatan editor, pernyataan keaslian, validasi tiap aturan. | Peserta `terdaftar` (Antologi, Lomba, Solo) | STD-09, PRJ-04 langkah 1–5; PRD 17.5 (Kirim karya) |
| `/projects/[slug]/kiriman/[id]` | Detail kiriman: status, riwayat versi dan status, alasan editor, tombol Kirim revisi dan Tarik. | Pemilik kiriman | PRJ-04; PRD 10.5 (tabel status); PRD 17.5 (Detail submission) |
| `/projects/[slug]/kiriman/[id]/revisi` | Kirim revisi: pilih dokumen (boleh lain), tenggat revisi 7 hari, maks 2 putaran; ditolak bila belum berubah. | Pemilik kiriman berstatus Perlu Revisi | PRJ-04; Q-22 |
| `/projects/[slug]/dasbor` | **Kelas:** jadwal, materi (tandai selesai), tugas, progres. **Solo:** linimasa tahap, berkas pratinjau, Setujui final atau Minta perubahan. Dipilih dari kategori proyek. | Pendaftar `terdaftar` | KLS-01, 02; SOL-02; AC-29; PRD 17.5 (Dasbor Kelas, Dasbor Solo) |
| `/projects/[slug]/tugas/[id]` | Halaman tugas: instruksi, tenggat, kirim dari Studio atau teks langsung, feedback mentor, kirim ulang. | Peserta kelas | KLS-03; PRD 17.5 (Halaman tugas) |
| `/projects/[slug]/hasil` | Hasil Lomba: tahap sekarang, finalis ("Finalis N" bila anonim), pemenang dengan hadiah dan catatan juri. | Semua (tamu juga) | LMB-02; PRD 17.5 (Halaman hasil lomba) |

### 1.3 Layar penuh (di luar kerangka)

| Rute | Isi layar | Akses | Rujukan |
| --- | --- | --- | --- |
| `/studio/baru` | Editor dengan draf kosong; baru tersimpan saat ada isi. | Masuk | STD-01, STD-02 |
| `/studio/[id]` | Editor Tiptap: bilah format, jumlah kata (popover), mode fokus, sprint, menu ⋯ (Bagikan, Kirim ke proyek, Ekspor, Target dokumen, Riwayat versi, Jenis dan tag, Arsipkan, Pindah ke sampah), laci Bantuan, dialog konflik. | Pemilik | STD-01, 02, 04, 07, 09, 10, 12, 13, 18; STK-08; PRD 17.2 (Editor, Dialog konflik, Riwayat versi) |
| `/tulis` | Tulis postingan: pilih dokumen atau "Tulis langsung", pilih bagian, judul, genre, visibilitas (tanpa nilai bawaan), pratinjau, Terbitkan atau Simpan sebagai draf. Query `?dokumen=<id>`. | Penulis | COM-01, STD-10; PRD 17.4 (Tulis postingan) |
| `/tulis/[id]` | Melanjutkan draf postingan sebagai teks langsung. | Pemilik draf | COM-01 |

### 1.4 Kelola `/kelola` (butuh peran lewat `?sebagai=`)

Rujukan umum: PRD 15 (role dan permission), PRD 17.6, `docs/prd/13-user-flows.md`, penegakan sebenarnya RLS (PRD 15.3).

| Rute | Peran | Isi layar | Rujukan |
| --- | --- | --- | --- |
| `/kelola` | Semua pemegang peran | Ringkasan area yang bisa dibuka. Tanpa peran: layar akses ditolak. | PRD 16 (Kelola, Admin); PLT-03 |
| `/kelola/editor` | Editor, Administrator, Super Admin | Antrean submission Antologi dan Solo yang ditugaskan; filter `?status=` (Perlu tindakan, Sedang ditinjau, Menunggu revisi, Selesai, Semua). | PRJ-04; PRD 17.6 (Antrean submission) |
| `/kelola/editor/[id]` | idem | Tinjauan: naskah beku, pemilih versi, riwayat status, panel keputusan (Mulai tinjau, Minta revisi, Terima, Tolak; alasan wajib). | PRJ-04; Q-22, Q-23 |
| `/kelola/mentor` | Mentor, Administrator, Super Admin | Daftar kelas yang ditugaskan. | KLS-03; PRD 17.6 (Kelola kelas) |
| `/kelola/mentor/[slug]` | idem | Tiga tab `?tab=pengumpulan\|tugas\|peserta`: antrean pengumpulan (filter `?status=`), tugas buatan mentor, peserta. | KLS-03; Q-26, Q-27 |
| `/kelola/mentor/[slug]/pengumpulan/[id]` | idem | Tinjau pengumpulan tugas: Minta perbaikan atau Tandai selesai. | KLS-03 |
| `/kelola/organizer` | Organizer, Administrator, Super Admin | Daftar proyek yang dikelola; filter `?status=` (bawaan Aktif). | PRJ-03; PRD 17.6 (Kelola proyek); AC-26 |
| `/kelola/organizer/baru` | idem | Formulir buat proyek per kategori. | PRJ-03 |
| `/kelola/organizer/[slug]` | idem | Enam tab `?tab=proyek\|penugasan\|peserta\|kiriman\|pembayaran\|tahap`: ubah proyek dan aksi (terbitkan, tutup, arsip), penugasan Editor/Mentor/Juri, peserta, kiriman, konfirmasi pembayaran (berbayar), tahap Solo dan Lomba (hasil, tutup penilaian). | PRJ-03, PLT-07, SOL-02, LMB-01, LMB-02 |
| `/kelola/organizer/event` | Organizer pemilik, Administrator, Super Admin | Daftar event yang dikelola. | COM-13 |
| `/kelola/organizer/event/baru` | idem | Formulir buat event (jadwal, target, kuota, sprint). | COM-13 |
| `/kelola/organizer/event/[id]` | idem | Ubah event; jadwal dan target terkunci sejak peserta pertama. | COM-13 |
| `/kelola/juri` | Juri, Administrator, Super Admin | Lomba yang ditugaskan dengan progres "n dari m karya sudah kamu nilai". | LMB-01; PRD 17.6 (Panel penilaian) |
| `/kelola/juri/[slug]` | idem | Daftar "Karya N" (tanpa penulis); filter `?status=` (Belum dinilai bawaan). | LMB-01; BR-PRJ-08; AC-27 |
| `/kelola/juri/[slug]/karya/[id]` | idem | Naskah beku, skor 1–10 per kriteria berbobot, catatan, Simpan penilaian; terkunci setelah penilaian ditutup. | LMB-01; BR-PRJ-09; AC-28 |
| `/kelola/admin` | Administrator, Super Admin | Pengguna dan role: cari `?q=`, filter `?peran=`. | PLT-05; PRD 17.6 (Admin: pengguna dan role) |
| `/kelola/admin/pengguna/[id]` | idem | Detail: role, akun (tangguhkan atau pulihkan), penugasan, riwayat. | PLT-03, PLT-05; AC-SA1 sampai AC-SA4 |
| `/kelola/admin/moderasi` | idem | Antrean kasus laporan; filter `?status=baru\|selesai\|semua`. | PLT-06; PRD 17.6 (Admin: moderasi) |
| `/kelola/admin/moderasi/[kasus]` | idem | Detail kasus (`post:<id>` atau `comment:<id>`): konten, jumlah dan alasan laporan, keputusan. Identitas pelapor tidak tampil. | PLT-06 |
| `/kelola/admin/audit` | idem | Log audit hanya-baca, terbaru dulu, 25 per halaman, filter `?jenis=`. | PLT-05; SEC-10; PRD 17.6 (Admin: audit log) |
| `/kelola/admin/kurasi` | idem | Editor's Picks (tambah, hapus, urutkan) dan Proyek unggulan. | COM-09, BR-COM-05; PRD 17.6 (Admin: kurasi) |
| `/kelola/admin/pengaturan` | idem | Tautan komunitas luar (`https://`, maks 200 karakter). | PLT-12; PRD 17.6 (Admin: pengaturan sistem) |
| `/kelola/admin/grup` | idem | Daftar grup dan peringatan grup tanpa Admin Grup. | PLT-05, COM-12; PRD 17.6 (Admin: grup) |
| `/kelola/admin/grup/[id]` | idem | Detail grup: tunjuk dan cabut Admin Grup, anggota. | PLT-05, COM-12 |
| `/kelola/[area]` | Sesuai area | Penampung sementara untuk nama area yang belum punya rute sendiri; rute spesifik di atas menang. | - |

### 1.5 Kesesuaian PRD dan kode

Rute dan layar yang **ada di PRD tetapi belum ada atau belum ditemukan di kode** (jangan dicari saat menguji; bukan bug):

| Fitur PRD | Status |
| --- | --- |
| Template menulis (STD-05), Manuskrip (STD-06), Impor `.docx` (STD-20), Ekspor DOCX (STD-08) | Fase 2, tidak dibangun |
| Cerita berseri dan halaman seri (COM-02), Highlight (COM-07), Kartu tulisan (COM-11), Publikasi karya penuh (COM-12 versi publikasi) | Fase 2, tidak dibangun |
| Halaman daftar pintasan keyboard (STD-17 bagian kedua), Gambar kutipan (STD-19), Kartu progres (STK-10), Riwayat streak (STK-09) | MVP menurut PRD, **tidak ditemukan di kode** |
| Batalkan pendaftaran proyek gratis (PRJ-06), "Kelas yang sedang berjalan" dan tombol Lanjutkan (KLS-05), Salin latihan ke Studio (KLS-06), Testimoni kelas (KLS-07) | MVP menurut PRD, **tidak ditemukan di kode** |
| Pengaturan notifikasi dan email progres mingguan (PLT-11), email transaksional (PLT-04 bagian email) | Menunggu backend |
| Pemesanan buku (PRJ-05), Marketplace, pembayaran MYR (PLT-08), Logo grup (PLT-09), Sertifikat (KLS-04, LMB-03) | Fase 2 atau 3 |
| Kolom "tombol Bagikan milestone" di Streak (STK-07) | Fase 2 |

Selisih perilaku antara PRD dan kode yang sengaja diambil sebagai **[usulan]** (menunggu persetujuan client):

- PRD 17.6 menyebut pengaturan sistem hanya untuk Super Admin; kode mengizinkan Administrator juga.
- Milestone dan Statistik ada di dalam layar Studio/Streak, bukan halaman terpisah bernama "Milestone".
- Pembatalan pendaftaran dan refund (Q-30) belum diputuskan.

---

## 2. Alur uji

Format tiap skenario: **Awal** (kondisi dan rute), **Langkah**, **Harapan**. Tandai ✅ atau ❌ pada kolom hasil Anda sendiri. Skenario saling berurutan: alur Studio, Community, Projects, lalu Kelola.

Rujukan alur di PRD: perjalanan inti penulis (13.1) untuk A sampai D, pengiriman dan revisi Antologi (13.2) dan alur Solo (13.3) dan Kelas (13.4) dan Lomba (13.5) untuk E dan H. Kriteria penerimaan ada di `docs/prd/26-acceptance-criteria.md`.

### A. Landing dan daftar tunggu

1. Buka `/`. Harapan: hero, bagian Ekosistem, Pengalaman menulis, Penerbitan, FAQ, penutup dengan form. Tidak ada tombol Masuk di bilah atas.
2. Ganti tema (terang/gelap) dan bahasa (Indonesia/Inggris) dari bilah atas. Harapan: tema berubah tanpa kedipan saat dimuat ulang; teks berganti bahasa; alamat tetap `/`.
3. Kirim form daftar tunggu dengan email tidak valid. Harapan: pesan galat, tidak terkirim.
4. Kirim dengan email valid. Harapan: pesan sukses. (Memerlukan env Supabase; tanpa itu galat server yang ramah akan tampil.)
5. Di layar ≤ 767px, buka hamburger. Harapan: menu bagian tampil dan bisa ditutup dengan Escape.

### B. Akun (tanpa backend)

1. **Daftar:** `/daftar` → isi email, sandi (8–72 byte, huruf dan angka), setuju. Harapan: validasi per bidang; dengan `terdaftar@x.com` muncul galat "sudah terdaftar"; email lain lanjut ke `/verifikasi`.
2. **Verifikasi:** `/verifikasi` (menunggu), `?status=berhasil` (tombol lanjut ke `/mulai`), `?status=kedaluwarsa` (opsi kirim ulang).
3. **Onboarding:** `/mulai` → isi nama, username (3–20, unik; username penulis dummy seperti `laras` ditolak), zona waktu → lanjut. Harapan: setelah selesai menuju `/beranda`.
4. **Masuk:** `/masuk` dengan `salah@x.com` (galat kredensial), `belum@x.com` (diarahkan ke verifikasi), email lain (berhasil → `/beranda`).
5. **Lanjut ke tujuan:** buka `/masuk?lanjut=%2Fprojects` lalu masuk. Harapan: mendarat di `/projects`. Coba `?lanjut=//evil.com` dan `?lanjut=%2Fmasuk`; harapan: jatuh ke `/beranda`.
6. **Lupa sandi:** `/lupa-sandi` → kirim → tautan menuju `/atur-ulang-sandi` (juga `?status=kedaluwarsa`).
7. **Pengaturan:** `/pengaturan` → ubah profil, bagian **Menulis** (ukuran isi, mode mesin tik, posisi, kutip melengkung, penyingkat `--` dan `...`), ganti sandi, tema dan bahasa → **Simpan perubahan**. Harapan: tersimpan setelah muat ulang.
8. **Hapus akun:** Zona bahaya → dialog meminta mengetik `HAPUS` (atau `DELETE`). Tombol merah aktif hanya bila cocok.
9. **Keluar** (dari menu akun): `?sebagai=tamu` aktif; bilah atas menampilkan Masuk dan Daftar yang membawa `?lanjut=` ke halaman sekarang.

### C. Studio: menulis

**Dokumen dan editor**
1. `/studio` → tombol dokumen baru (atau `/studio/baru`). Ketik beberapa paragraf. Harapan: judul otomatis; indikator simpan; dokumen muncul di daftar setelah ada isi. Draf kosong tidak pernah tersimpan.
2. Bilah format: Tebal, Miring, Judul, Kutipan, Daftar berpoin, Daftar bernomor. Pilih semua (Ctrl+A) lalu terapkan daftar. Harapan: format benar.
3. Klik "N kata" → popover Kata, Karakter, Paragraf, Waktu baca; pilih teks → "12 dari N kata".
4. **Mode fokus.** Harapan: bilah format hilang; HUD menampilkan kata.
5. **Timer sprint** (tombol Sprint; 1–180 menit). Harapan: chip sisa waktu; saat habis, hasil "N kata dalam M menit". Muat ulang halaman mengakhiri sprint.
6. **Target dokumen** (menu ⋯): tambah target kata dan tenggat (maks. 5). Harapan: ringkasan target di popover kata dan baris daftar.
7. **Riwayat versi** (menu ⋯): ketik, hapus banyak teks (≥100 kata dan ≥30%), simpan; buka laci. Harapan: potret versi; pratinjau; **Pulihkan** menyimpan teks sekarang sebagai versi "pemulihan" dulu.
8. **Ekspor** (menu ⋯): TXT dan PDF (opsi judul depan, nomor halaman, jarak baris). Harapan: berkas terunduh; menu nonaktif untuk dokumen tanpa teks.
9. **Konflik dua tab:** buka dokumen yang sama di dua tab, ubah keduanya. Harapan: dialog konflik tak bisa ditutup, pilih salah satu.
10. **Jalan keluar:** panah kembali di bilah editor menyimpan lalu ke `/studio`.

**Manajemen dokumen**
1. Buat folder, pindahkan dokumen, ganti nama. Harapan: breadcrumb dan urutan benar.
2. Menu ⋯ → **Jenis dan tag**: pilih jenis, tambah tag (maks 5, 24 karakter; kapitalisasi tak dibedakan). Penyaring `?jenis=` dan `?tag=` bekerja lintas folder.
3. **Arsipkan** → tab Arsip (`/studio?tab=arsip`) → **Pulihkan** (kembali ke folder asal bila masih ada). **Duplikat** membuat salinan tanpa target dan versi lama.
4. **Pindah ke sampah** → tab Sampah → pulihkan atau hapus permanen. Dari editor: toast **Urungkan** memulihkan dan membuka editor lagi.
5. **Pencarian:** Ctrl+K (⌘K) atau ikon cari, dari `/studio`, `/studio/streak`, `/studio/statistik`, dan editor. Harapan: hasil judul dan folder, tab Semua mencari isi; dokumen Arsip dan Sampah tidak ikut.

**Streak dan Statistik**
1. `/studio/streak` → di development klik **isi 30 hari data contoh**. Harapan: kalender, streak, milestone.
2. Ubah target harian (pilihan 250, 500, 1.000, 2.000, 5.000). Harapan: berlaku **besok**, hari ini tetap target lama.
3. `/studio/statistik` → Harian, Mingguan, Bulanan; panah dan Home/End pada grafik; tabel di `<details>`; kartu Tempo, hari favorit, jam favorit, Kata berkurang.

### D. Community

1. **Beranda** `/beranda`: "Hari ini" mencerminkan kata yang baru ditulis; tab Mengikuti dan Jelajahi; "Panduan awal" punya "Tutup panduan" yang final.
2. **Jelajahi** `/jelajahi`: ganti chip kategori, "Muat lebih banyak". Ubah lebar jendela: 3/2/1 kolom, di bawah 576px menjadi daftar.
3. **Postingan** `/postingan/hujan-pertama-bulan-november`: Apresiasi, Simpan, komentar, balas satu tingkat, menu ⋯ (Laporkan). Sebagai tamu, aksi memunculkan dialog Masuk.
4. **Tulis postingan** `/tulis`: pilih dokumen Studio atau "Tulis langsung"; pilih bagian, **pilih visibilitas** (tanpa nilai bawaan); catatan "yang menjadi publik hanya teks ini" tak bisa ditutup; batas 500 kata tidak memotong; **Simpan sebagai draf** lalu buka lagi lewat `/tulis/[id]`; terbit → layar sukses.
5. **Dari Editor:** menu Bagikan → "Pilih bagian untuk dibagikan" → membuka `/tulis?dokumen=<id>`. Bagikan nonaktif untuk dokumen tanpa teks. Dokumen di Sampah atau tak ada menampilkan `Notice`.
6. **Profil** `/penulis/rinjaniputri` (tombol "Ubah profil" nonaktif) dan `/penulis/laras` (Ikuti dan batal Ikuti; hitungan pengikut berubah). Alamat salah → "Penulis ini tidak ditemukan". Tab Karya, Tentang, Proyek (kosong).
7. **Tersimpan** `/tersimpan`: simpan dua postingan, buka, lepas satu (tetap tampil sampai halaman ditinggalkan).
8. **Notifikasi** `/notifikasi`: tab, hitungan belum dibaca di lonceng berkurang saat dibaca; keadaan baca bertahan setelah muat ulang.
9. **Grup** `/grup` → buat grup (privat bawaan; nama maks 40, deskripsi maks 240) → jadi Admin Grup. `/grup/penulis-pesisir` dan `/grup/ruang-cerpen`: gabung (publik langsung; privat lewat kode atau undangan), keluar, bagikan progres (butuh persetujuan terpisah). Keluar membuat cuplikan lama tak terbaca bagi anggota lain.
10. **Event** `/event` → `/event/cerita-selama-sepekan`: jumlah peserta tampil untuk semua; **nama hanya untuk sesama anggota grup yang sama**. Gabung (pilih satu dokumen dan target kata), tulis di dokumen itu → progres naik; keluar menghapus progres. Sprint event berjalan 19.00–19.30 WIB.

### E. Projects (sisi peserta)

**Katalog dan detail**
1. `/projects`: chip Semua · Antologi · Solo · Kelas Menulis · Lomba; penyaring Status dan Biaya. Harapan: filter bertahan di alamat (`?kategori=lomba&status=buka&biaya=gratis`); tombol Back mengembalikan filter.
2. Buka tiap proyek di tabel 0.3. Harapan: blok khas kategori (alur, paket, kurikulum, kriteria, hadiah), jadwal, kolom kanan lengket. `antologi-puisi-tengah-malam` dan alamat ngawur → "Proyek ini tidak ditemukan" dengan tautan "← Semua Projects".

**Pendaftaran gratis** — `lomba-esai-literasi-remaja`
1. `/projects/lomba-esai-literasi-remaja` → Daftar → `/daftar`: centang ketentuan → **Daftar**. Harapan: langsung "Terdaftar"; kuota (bila ada) bertambah satu; mengulang tidak menggandakan.
2. Sebagai `?sebagai=tamu`: layar menampilkan alasan "perlu masuk".

**Pendaftaran gagal** — `antologi-pulang-ke-pesisir` (ditutup), `lomba-puisi-pendek-nusantara` (kuota penuh). Harapan: alasan jelas, tidak ada formulir.

**Pendaftaran berbayar + QRIS** — `lomba-cerpen-hujan-2026`
1. Daftar → status **Menunggu pembayaran**, menahan satu kursi 24 jam.
2. Tombol detail "Bayar sekarang" → `/projects/lomba-cerpen-hujan-2026/bayar`: kode QRIS contoh berlabel (bukan kode asli).
3. Konfirmasi pembayaran dilakukan Organizer (lihat skenario H.4). Setelah itu status "Terdaftar".
4. Proyek berharga ringgit saja menampilkan pembayaran "menyusul".

**Solo** — `solo-penerbitan-buku-sendiri`: daftar dengan memilih paket (Rp 1,5 juta / 3,5 juta / 6 juta) → konfirmasi pembayaran oleh Organizer → "Kirim naskah".

**Kirim karya** — `/projects/<slug>/kirim?dokumen=<id>` (siapkan dokumen berisi teks cukup banyak)
1. Antologi `antologi-surat-yang-tidak-pernah-terkirim` (berbayar, harus lunas dulu) atau Lomba gratis `lomba-esai-literasi-remaja`.
2. Isi judul (maks 120), genre, catatan editor (maks 500), pernyataan keaslian → kirim. Uji gagal: kata di bawah atau di atas batas, judul kosong. Harapan: satu pesan per aturan yang gagal; isian tidak hilang.
3. Satu dokumen hanya sekali per proyek; batas karya tercapai → tombol "Batas karya tercapai".
4. Dari Studio: menu "Kirim ke proyek" (dialog memilih proyek yang diikuti). Di daftar dokumen muncul penanda "Dikirim ke proyek".

**Status kiriman dan revisi** — `/projects/[slug]/kiriman/[id]`
1. Status awal Terkirim. Keputusan datang dari Editor (skenario H.1). Harapan: notifikasi muncul di `/notifikasi` dan butir "Perlu perhatian" di Beranda untuk revisi.
2. **Perlu Revisi** → `/projects/[slug]/kiriman/[id]/revisi`: ubah dokumen lalu kirim (ditolak bila belum berubah). Maks 2 putaran.
3. Tarik kiriman (hanya dari Terkirim dan Perlu Revisi) lewat dialog; jatah dan penanda terlepas.

**Dasbor Kelas** — daftar `kelas-cerpen-untuk-pemula` (gratis, sudah berjalan)
1. `/projects/kelas-cerpen-untuk-pemula/dasbor`: jadwal, materi (tandai selesai), tugas, progres. Tugas pertama sudah lewat tenggat (kirim tetap diterima, ditandai Terlambat).
2. `/projects/kelas-cerpen-untuk-pemula/tugas/<id>`: kirim dari Studio atau ketik teks. Setelah mentor menilai (skenario H.2): Perlu perbaikan → kirim ulang; Selesai → progres naik.
3. `kelas-menulis-puisi-dasar` (belum dimulai, berbayar): jadwal dan tugas tampil, materi tertutup, formulir terkunci.

**Dasbor Solo** — setelah naskah **Diterima** (Editor, H.1) dan tahap dijalankan Organizer (H.4)
1. `/projects/solo-penerbitan-buku-sendiri/dasbor`: linimasa tahap sesuai paket.
2. Pada tahap Persetujuan final (setelah tim menambah pratinjau): **Setujui** (dialog, tak bisa dibatalkan) atau **Minta perubahan** (catatan wajib, maks 2 kali).

**Hasil Lomba** — `/projects/lomba-cerita-mini-pesisir-2026/hasil` (publik, juga untuk tamu)
Harapan: tahap "Pemenang diumumkan", pemenang dengan hadiah, catatan juri, hasil seri ("Juara 2 (seri)"); lomba anonim membuka nama saat pemenang diumumkan. Lomba lain: halaman menjelaskan tahap dan jadwal berikutnya.

**Proyek saya** `/projects/saya`: semua pendaftaran, status, dan tautan ke dasbor, kiriman, hasil.

### F. Notifikasi lintas fitur

Periksa `/notifikasi` (dan lonceng) setelah: kiriman diterima sistem, keputusan Editor, tugas dinilai mentor, tugas baru dari mentor, pembayaran menunggu/diterima/habis, ketentuan proyek diperbarui, pengumuman lomba, dan notifikasi pengelola (H). Status baca tersimpan di `ranah.notificationsRead`.

### G. Hak akses (negatif)

1. Tanpa peran: buka `/kelola` → layar akses ditolak dengan jalan keluar. Menu "Kelola" tidak ada.
2. `?sebagai=editor` lalu buka `/kelola/mentor` → ditolak. Proyek yang tidak ditugaskan menampilkan keadaan blokir.
3. `?sebagai=administrator` → semua area terbuka.
4. Catatan: ini hanya tampilan. Penegakan sebenarnya adalah RLS (belum ada tes RLS).

### H. Kelola (per peran)

Mulai dari `/kelola?sebagai=<peran>`. Menu area tampil di kiri (lg) atau chip lengket (ponsel).

**H.1 Editor** (`?sebagai=editor`)
1. `/kelola/editor`: filter Perlu tindakan (bawaan), Sedang ditinjau, Menunggu revisi, Selesai, Semua (`?status=`). Terlama menunggu tampil dulu.
2. Buka kiriman → naskah beku, pemilih versi, riwayat status. **Mulai tinjau** → Minta revisi / Terima / Tolak (alasan wajib 1–1000 karakter kecuali Mulai tinjau). Setelah 2 revisi, "Minta revisi" diblokir dengan penjelasan.
3. Harapan: sisi peserta (E) memperlihatkan status, alasan, dan notifikasi yang sesuai.

**H.2 Mentor** (`?sebagai=mentor`)
1. `/kelola/mentor` → `kelas-cerpen-untuk-pemula` (`?tab=pengumpulan`, `tugas`, `peserta`).
2. Tinjau pengumpulan: **Minta perbaikan** (catatan wajib) atau **Tandai selesai** (catatan opsional).
3. Tab Tugas: tambah tugas (judul, tenggat), ubah, hapus (hanya bila belum ada pengumpulan). Peserta terdaftar mendapat notifikasi "Tugas baru" dan progres turun.
4. Tab Peserta: hanya pendaftar di perangkat ini.

**H.3 Juri** (`?sebagai=juri`)
1. `/kelola/juri` → `lomba-cerpen-hujan-2026`: karya tampil sebagai "Karya N" tanpa identitas.
2. Nilai tiap karya (skor 1–10 per kriteria, catatan opsional) → **Simpan penilaian**. Filter Belum dinilai/Sudah dinilai/Semua.
3. Setelah penilaian ditutup Organizer, skor tidak bisa diubah walau formulir sudah terbuka.

**H.4 Organizer** (`?sebagai=organizer`)
1. `/kelola/organizer/baru`: buat proyek untuk tiap kategori; coba aturan validasi (satu pesan per aturan). Proyek terbit muncul di `/projects` (hanya di peramban ini).
2. `/kelola/organizer/[slug]` tab **Penugasan**: tunjuk Editor/Mentor/Juri.
3. Tab **Peserta** dan **Kiriman**: daftar pendaftar dan kiriman di perangkat ini.
4. Tab **Pembayaran** (proyek berbayar): **Konfirmasi pembayaran** lewat dialog → sisi peserta menjadi "Terdaftar". Kedaluwarsa tetap tampil.
5. Tab **Tahap**: Solo: "Lanjut ke …" dan "Tambah pratinjau …" (memengaruhi dasbor Solo). Lomba: majukan tahap (dialog menyebut pengumuman tak bisa ditarik), **Tutup penilaian**, lalu isi hasil: centang Finalis, Peringkat, Catatan juri → **Simpan hasil** → majukan tahap agar tampil di halaman Hasil publik.
6. Arsipkan proyek: hilang dari katalog dan akses Editor dicabut; tidak bisa dibuka lagi.
7. `/kelola/organizer/event` → `/baru` dan `/[id]`: buat event; jadwal dan target terkunci sejak peserta pertama.

**H.5 Administrator / Super Admin** (`?sebagai=administrator` atau `super-admin`)
1. `/kelola/admin`: cari (`?q=`), filter peran (`?peran=`). `/kelola/admin/pengguna/[id]`: beri dan cabut role (alasan wajib untuk tingkat Administrator dan setiap pencabutan), tangguhkan dan pulihkan akun. Aturan: hanya Super Admin mengelola Administrator; tidak bisa memberi diri sendiri tingkat Administrator; Super Admin aktif terakhir tak bisa dicabut.
2. `/kelola/admin/moderasi`: laporkan sebuah postingan atau komentar dari sisi pembaca (D.3), lalu tinjau kasus (`?status=baru|selesai|semua`). Putusan: Abaikan, Sembunyikan, Hapus, Pulihkan, Tangguhkan penulis. Harapan: konten tersembunyi hilang dari Beranda, Jelajahi, profil, Tersimpan, komentar; identitas pelapor tidak pernah tampil.
3. `/kelola/admin/audit`: tiap aksi sensitif tercatat (penugasan, role, moderasi, kurasi, hasil lomba). Hanya baca, terbaru dulu, 25 per halaman (`?jenis=`).
4. `/kelola/admin/kurasi`: Editor's Picks (tambah, hapus, urutkan; tampil di Jelajahi) dan Proyek unggulan (blok "Unggulan" di `/projects` hanya tanpa filter).
5. `/kelola/admin/pengaturan`: isi tautan komunitas (`https://`, maks 200 karakter) → tampil di sidebar dan Beranda, tab baru. Kosongkan → hilang.
6. `/kelola/admin/grup` dan `/[id]`: tunjuk dan cabut Admin Grup; grup tanpa pengganti ditandai.
7. Ubah pemenang setelah diumumkan: tab Tahap lomba → **Ubah pemenang** (alasan wajib) → entri `contest.results.amend` di audit.

---

## 3. Uji lintas (checklist akhir)

- **Keyboard saja:** setiap alur utama dapat diselesaikan dengan Tab, Enter, dan Escape; fokus kembali ke pemicu setelah dialog ditutup.
- **Ponsel (≤ 767px):** bilah bawah lima tab dan tombol Tulis bulat; dialog menjadi lembar bawah (geser turun untuk menutup pada dua dialog Studio); tidak ada gulir horizontal; konten tidak tertutup poni.
- **Tema:** ulangi satu layar per area di mode terang dan gelap.
- **Layar penuh punya jalan keluar:** `/studio/[id]`, `/tulis`, `/tulis/[id]`.
- **Alur lintas layar:** kerjakan dari daftar → detail → aksi → kembali, dengan klik mouse sungguhan, jangan hanya mengandalkan alamat langsung.
- **Persistensi:** muat ulang setelah tiap aksi penting; data yang tersimpan lokal harus bertahan, status uji tab (`?sebagai=`) hanya bertahan selama tab hidup.
- **Bahasa:** hanya landing dan akun yang bilingual; Studio, Community, Projects, dan Kelola Bahasa Indonesia saja (disengaja).

## 4. Batas yang diketahui (jangan dilaporkan sebagai bug)

- Tidak ada sesi, email, pembayaran, atau notifikasi sungguhan; data tidak dibagikan antar perangkat atau orang.
- Pendaftar, peserta, dan kiriman di layar Kelola hanyalah yang dibuat di peramban ini.
- Pemeriksa tata bahasa, cadangan Drive, chat realtime, Marketplace, impor `.docx`, DOCX ekspor, sertifikat, dan statistik pembaca belum dibangun.
- Pembayaran QRIS hanya untuk IDR; bukti transfer, MYR, refund, dan pembatalan proyek gratis belum ada.
- Nama "Roast My Writing" akan diganti setelah pekerjaan selesai; jangan diubah sekarang.
- Harga, kuota, jadwal, dan batas kata di fixture adalah contoh dan belum disetujui client.
