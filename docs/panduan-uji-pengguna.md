# Panduan Uji RanahMenulis

**Untuk:** penguji dan client · **Per:** 21 November 2026

Tujuan: memastikan semua layar dan alur sudah sesuai harapan **sebelum** server (login dan database) dibangun. Ikuti urutan dari atas ke bawah, klik tautan di setiap langkah, lakukan yang diminta, lalu centang ☐ jika hasilnya sesuai. Catat apa pun yang terasa membingungkan, janggal, atau kurang.

## Baca dulu (1 menit)

- **Data masih contoh.** Semua yang Anda buat hanya tersimpan **di peramban Anda sendiri**. Tidak terlihat orang lain.
- **Anda otomatis "masuk"** sebagai pengguna contoh **Rinjani Putri**. Halaman Masuk dan Daftar baru tampilan, belum ada login sungguhan.
- **Bagian 1 (penulis dan peserta)** dibuka lewat alamat publik `ranah-menulis.vercel.app`. Tidak perlu memasang apa pun.
- **Bagian 2 (semua role pengelola)** juga dibuka di alamat yang sama. Peran dipilih lewat `?sebagai=` pada tautan (sudah disediakan di tiap langkah), tanpa memasang apa pun. Semua dikerjakan di **satu peramban dan satu perangkat**, karena data tersimpan di peramban itu.
- Pindah role: buka tautan dengan `?sebagai=` di tab yang sama (sudah disediakan di tiap langkah). Satu orang memainkan semua role.
- Coba juga di ponsel dan mode gelap (tombol tema di bilah atas).
- **Cara mencatat temuan:** tulis nomor langkah (misal *1.C3*) dan apa yang terasa kurang sesuai.

---

# Bagian 1. Penulis dan peserta

Alamat dasar: [ranah-menulis.vercel.app](https://ranah-menulis.vercel.app/beranda)

## 1.A Mulai

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| A1 | [Halaman awal](https://ranah-menulis.vercel.app/) | Gulir sampai bawah, ganti bahasa dan tema. | Lima bagian ekosistem, contoh editor, jalur penerbitan, FAQ, form daftar tunggu. ☐ |
| A2 | [Daftar](https://ranah-menulis.vercel.app/daftar) | Isi email, sandi (8 karakter lebih, ada huruf dan angka), centang ketentuan. | Lanjut ke layar verifikasi. ☐ |
| A3 | [Verifikasi](https://ranah-menulis.vercel.app/verifikasi?status=berhasil) | Buka. | Email terverifikasi, lanjut ke pengenalan profil. ☐ |
| A4 | [Mulai](https://ranah-menulis.vercel.app/mulai) | Isi nama, username, bio, zona waktu, genre. | Profil tersimpan. ☐ |
| A5 | [Beranda](https://ranah-menulis.vercel.app/beranda) | Perhatikan susunan, lalu tutup panduan awal. | Satu kartu "Hari ini" dengan satu tombol utama. Jelas harus mulai dari mana? ☐ |

## 1.B Menulis di Studio

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| B1 | [Studio](https://ranah-menulis.vercel.app/studio) | Klik tombol tulisan baru. | Editor penuh layar terbuka. ☐ |
| B2 | [Editor baru](https://ranah-menulis.vercel.app/studio/baru) | Ketik judul dan beberapa paragraf (sekitar 100 kata). Pakai tebal, miring, judul, kutipan, daftar. | Format berlaku, jumlah kata bertambah, tersimpan otomatis. ☐ |
| B3 | Editor | Klik "N kata". | Kata, karakter, paragraf, waktu baca. ☐ |
| B4 | Editor | Nyalakan mode fokus, lalu keluar. | Tampilan bersih. ☐ |
| B5 | Editor | Jalankan timer sprint 1 menit sambil menulis. | Hasil "N kata dalam M menit" di akhir. ☐ |
| B6 | Editor, menu ⋯ | Atur Target dokumen, lihat Riwayat versi, Ekspor PDF. | Target tampil di jumlah kata, riwayat bisa dibuka, PDF terunduh. ☐ |
| B7 | Editor, panah kembali | Kembali ke daftar. | Dokumen ada di daftar. Beri jenis dan tag lewat menu ⋯. ☐ |
| B8 | [Studio](https://ranah-menulis.vercel.app/studio) | Buat folder, duplikat dokumen, tekan Ctrl+K dan cari satu kata dari tulisan. | Pencarian menemukan dokumen. ☐ |
| B9 | [Streak](https://ranah-menulis.vercel.app/studio/streak) | Atur target harian. | Kalender, streak, dan progres hari ini tampil. ☐ |
| B10 | [Statistik](https://ranah-menulis.vercel.app/studio/statistik) | Ganti Harian, Mingguan, Bulanan. | Grafik terisi. ☐ |
| B11 | [Beranda](https://ranah-menulis.vercel.app/beranda) | Kembali. | Kata hari ini, ringkasan minggu, dan tombol Lanjutkan menulis terisi. ☐ |

## 1.C Community

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| C1 | [Community](https://ranah-menulis.vercel.app/jelajahi) | Ganti kategori, klik "Muat lebih banyak". | Tulisan tampil sebagai ubin. ☐ |
| C2 | [Contoh tulisan](https://ranah-menulis.vercel.app/postingan/hujan-pertama-bulan-november) | Beri apresiasi, simpan, tulis komentar dan balasan. | Hitungan bertambah, komentar muncul. ☐ |
| C3 | [Profil penulis](https://ranah-menulis.vercel.app/penulis/nuraisyah) | Klik Ikuti, buka tab Karya dan Tentang. | Tombol berubah jadi Mengikuti. ☐ |
| C4 | [Tersimpan](https://ranah-menulis.vercel.app/tersimpan) | Buka. | Tulisan dari C2 ada di sini. ☐ |
| C5 | [Tulis postingan](https://ranah-menulis.vercel.app/tulis) | Pilih dokumen dari B2, centang bagian yang dibagikan, isi judul dan genre, pilih siapa yang boleh membaca, terbitkan. | Hanya teks yang dipilih menjadi publik. Tulisan muncul di Community dan profil Anda. ☐ |

## 1.D Grup dan Event

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| D1 | [Grup](https://ranah-menulis.vercel.app/grup) | Buat grup baru. | Anda menjadi Admin Grup. ☐ |
| D2 | [Grup contoh](https://ranah-menulis.vercel.app/grup/penulis-pesisir) | Lihat anggota, bagikan progres menulis. | Progres tampil setelah persetujuan. ☐ |
| D3 | [Event](https://ranah-menulis.vercel.app/event/cerita-selama-sepekan) | Gabung dengan satu dokumen, menulis di Studio, kembali. | Progres event bertambah. Event contoh aktif sampai **25 November 2026**. ☐ |

## 1.E Projects: dari daftar sampai hasil

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| E1 | [Katalog](https://ranah-menulis.vercel.app/projects) | Ganti kategori, filter Status dan Biaya. | Daftar proyek berubah. ☐ |
| E2 | [Lomba berbayar](https://ranah-menulis.vercel.app/projects/lomba-cerpen-hujan-2026) | Baca detail, klik Daftar, centang ketentuan, Daftar. | Status "Menunggu pembayaran". ☐ |
| E3 | [Bayar](https://ranah-menulis.vercel.app/projects/lomba-cerpen-hujan-2026/bayar) | Lihat kode QRIS. | Kode contoh berlabel dan sisa waktu 24 jam. Pembayaran **dikonfirmasi pengelola** di Bagian 2. ☐ |
| E4 | [Lomba gratis](https://ranah-menulis.vercel.app/projects/lomba-esai-literasi-remaja) | Daftar, lalu klik Kirim karya, pilih dokumen dari B2. | Status "Terkirim". ☐ |
| E5 | [Proyek saya](https://ranah-menulis.vercel.app/projects/saya) | Buka. | Pendaftaran dan kiriman terlihat dengan statusnya. ☐ |
| E6 | [Kelas berjalan](https://ranah-menulis.vercel.app/projects/kelas-cerpen-untuk-pemula) | Daftar (gratis), klik Buka dasbor kelas. | Jadwal, materi, tugas, progres. ☐ |
| E7 | Dasbor kelas | Tandai satu materi selesai, klik Lanjutkan, salin latihan ke Studio. | Latihan menjadi dokumen baru di Studio. ☐ |
| E8 | Dasbor kelas, tugas pertama | Kumpulkan tugas dengan teks langsung. | Status "Dikumpulkan". Dinilai di Bagian 2. ☐ |
| E9 | [Solo](https://ranah-menulis.vercel.app/projects/solo-penerbitan-buku-sendiri) | Pilih paket, daftar, lalu kirim naskah. | Naskah terkirim. Tahap penerbitan berjalan di Bagian 2. ☐ |
| E10 | [Hasil lomba selesai](https://ranah-menulis.vercel.app/projects/lomba-cerita-mini-pesisir-2026/hasil) | Buka. | Pemenang, hadiah, catatan juri. ☐ |

## 1.F Notifikasi, pengaturan, dan ponsel

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| F1 | [Notifikasi](https://ranah-menulis.vercel.app/notifikasi) | Buka. | Pemberitahuan pendaftaran dan kiriman dari bagian E. ☐ |
| F2 | [Pengaturan](https://ranah-menulis.vercel.app/pengaturan) | Ubah tampilan, menulis, dan pilihan notifikasi. Simpan. | Perubahan berlaku. ☐ |
| F3 | Ponsel | Ulangi beberapa langkah di ponsel dan mode gelap. | Bilah bawah punya lima tab, dialog muncul dari bawah, tidak ada halaman yang bergeser ke samping. ☐ |

---

# Bagian 2. Semua role pengelola (satu cerita)

**Persiapan:** pakai peramban yang sama dengan Bagian 1. Kerjakan **Bagian 1 bagian E** lebih dulu (daftar lomba berbayar, kirim karya, daftar kelas dan kumpulkan tugas, daftar Solo dan kirim naskah, kirim Antologi), lalu lanjutkan di bawah. Ganti role dengan membuka tautan di tab yang sama.

## 2.A Organizer: menyiapkan dan menjalankan proyek

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| A1 | [Daftar proyek Organizer](https://ranah-menulis.vercel.app/kelola/organizer?sebagai=organizer) | Buka. | Proyek yang dikelola tampil. ☐ |
| A2 | [Buat proyek](https://ranah-menulis.vercel.app/kelola/organizer/baru?sebagai=organizer) | Isi satu proyek Antologi lengkap, simpan, lalu Terbitkan. | Proyek muncul di [katalog](https://ranah-menulis.vercel.app/projects). ☐ |
| A3 | [Lomba berbayar, tab Pembayaran](https://ranah-menulis.vercel.app/kelola/organizer/lomba-cerpen-hujan-2026?sebagai=organizer&tab=pembayaran) | Klik Konfirmasi pembayaran. | Pendaftaran peserta menjadi lunas, status "Terdaftar". ☐ |
| A4 | [Event baru](https://ranah-menulis.vercel.app/kelola/organizer/event/baru?sebagai=organizer) | Buat event, simpan. | Event tampil di [daftar event](https://ranah-menulis.vercel.app/event). ☐ |

## 2.B Peserta: kirim karya setelah dikonfirmasi

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| B1 | [Lomba berbayar](https://ranah-menulis.vercel.app/projects/lomba-cerpen-hujan-2026?sebagai=masuk) | Klik Kirim karya, pilih dokumen, kirim. | Status "Terkirim". ☐ |

## 2.C Juri dan Organizer: lomba sampai pemenang

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| C1 | [Panel Juri](https://ranah-menulis.vercel.app/kelola/juri?sebagai=juri) | Buka lomba, buka satu "Karya N". | Karya tampil tanpa nama penulis. ☐ |
| C2 | Karya tadi | Isi skor 1 sampai 10 tiap kriteria, Simpan penilaian. | Progres juri naik. ☐ |
| C3 | [Tahap lomba](https://ranah-menulis.vercel.app/kelola/organizer/lomba-cerpen-hujan-2026?sebagai=organizer&tab=tahap) | Klik Tutup penerimaan, mulai dinilai, lalu Tutup penilaian. | Penilaian ditutup. ☐ |
| C4 | Tab Tahap | Pilih finalis dan peringkat, isi catatan juri, Simpan hasil. Klik Umumkan finalis, lalu Umumkan pemenang. | Tahap maju sesuai urutan. ☐ |
| C5 | [Hasil lomba](https://ranah-menulis.vercel.app/projects/lomba-cerpen-hujan-2026/hasil?sebagai=masuk) | Buka sebagai peserta. | Pemenang, hadiah, dan catatan juri tampil. ☐ |

## 2.D Editor: antologi dan penerbitan Solo

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| D1 | [Antrean Editor](https://ranah-menulis.vercel.app/kelola/editor?sebagai=editor) | Buka kiriman dari daftar. | Naskah beku dan riwayat status tampil. ☐ |
| D2 | Kiriman Antologi | Klik Mulai tinjau, lalu Terima dengan alasan. | Status menjadi Diterima. ☐ |
| D3 | Kiriman Solo | Mulai tinjau, lalu Terima. | Status Diterima. ☐ |
| D4 | [Tahap Solo](https://ranah-menulis.vercel.app/kelola/organizer/solo-penerbitan-buku-sendiri?sebagai=organizer&tab=tahap) | Klik Lanjut ke tahap berikutnya sampai persetujuan final, tambah pratinjau (gambar atau PDF). | Tahap maju. ☐ |
| D5 | [Dasbor Solo](https://ranah-menulis.vercel.app/projects/solo-penerbitan-buku-sendiri/dasbor?sebagai=masuk) | Sebagai penulis, lihat pratinjau, klik Setujui. | Produksi dimulai. ☐ |
| D6 | [Notifikasi](https://ranah-menulis.vercel.app/notifikasi?sebagai=masuk) | Buka. | Ada pemberitahuan Diterima dan tahap Solo. ☐ |

## 2.E Mentor: kelas

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| E1 | [Kelola kelas](https://ranah-menulis.vercel.app/kelola/mentor?sebagai=mentor) | Buka Kelas Cerpen untuk Pemula, tab Tugas, tambah satu tugas. | Tugas baru ada di dasbor peserta. ☐ |
| E2 | Tab Pengumpulan | Buka pengumpulan dari peserta, klik Tandai selesai. | Status "Selesai". ☐ |
| E3 | [Dasbor kelas](https://ranah-menulis.vercel.app/projects/kelas-cerpen-untuk-pemula/dasbor?sebagai=masuk) | Sebagai peserta, lihat progres. | Progres naik. Tulis satu testimoni. ☐ |
| E4 | [Testimoni, Organizer](https://ranah-menulis.vercel.app/kelola/organizer/kelas-cerpen-untuk-pemula?sebagai=organizer&tab=testimoni) | Lihat testimoni. | Testimoni tampil dan dapat dikelola. ☐ |

## 2.F Administrator dan Super Admin

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| F1 | [Pengguna dan role](https://ranah-menulis.vercel.app/kelola/admin?sebagai=super-admin) | Cari pengguna, buka detailnya, beri satu role. | Role tampil di detail. ☐ |
| F2 | Postingan di Community | Sebagai pembaca, laporkan satu komentar dengan alasan. | Laporan terkirim. ☐ |
| F3 | [Moderasi](https://ranah-menulis.vercel.app/kelola/admin/moderasi?sebagai=administrator) | Buka kasus, pilih keputusan Sembunyikan dengan alasan. | Konten hilang dari layar pembaca. Pelapor tidak terlihat. ☐ |
| F4 | [Kurasi](https://ranah-menulis.vercel.app/kelola/admin/kurasi?sebagai=administrator) | Tambah satu Editor's Pick dan satu proyek unggulan. | Tampil di Community dan katalog. ☐ |
| F5 | [Pengaturan](https://ranah-menulis.vercel.app/kelola/admin/pengaturan?sebagai=administrator) | Isi tautan komunitas luar (`https://...`). | Tautan tampil di sidebar dan Beranda. ☐ |
| F6 | [Grup](https://ranah-menulis.vercel.app/kelola/admin/grup?sebagai=administrator) | Buka satu grup, tunjuk Admin Grup. | Admin Grup berubah. ☐ |
| F7 | [Audit log](https://ranah-menulis.vercel.app/kelola/admin/audit?sebagai=administrator) | Buka. | Semua tindakan di atas tercatat, terbaru dulu, hanya bisa dibaca. ☐ |

---

## Lembar masukan

| Pertanyaan | Jawaban |
|---|---|
| Layar mana yang paling membingungkan? | |
| Fitur apa yang kurang atau berlebih? | |
| Apakah alur dari daftar sampai hasil terasa wajar? | |
| Teks atau istilah mana yang perlu diubah? | |
| Siap lanjut ke tahap server (login dan database)? | Ya / Belum, karena: |
