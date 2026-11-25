# Panduan Uji RanahMenulis

**Untuk:** penguji dan client · **Per:** 25 November 2026

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
| A1 | [Halaman awal](https://ranah-menulis.vercel.app/) | Gulir sampai bawah, ganti bahasa dan tema. | Judul dua baris, contoh editor Studio, lima bagian ekosistem, jalur penerbitan, FAQ, form daftar tunggu. Tampil utuh di terang, gelap, Indonesia, dan Inggris. ☐ |
| A2 | [Daftar](https://ranah-menulis.vercel.app/daftar) | Isi email, sandi (8 karakter lebih, ada huruf kecil, huruf besar, angka, dan simbol, mis. Rahasia123!), centang ketentuan. | Lanjut ke layar verifikasi. ☐ |
| A3 | [Verifikasi](https://ranah-menulis.vercel.app/verifikasi?status=berhasil) | Buka. | Email terverifikasi, lanjut ke pengenalan profil. ☐ |
| A4 | [Mulai](https://ranah-menulis.vercel.app/mulai) | Isi nama, username, bio, zona waktu, genre. | Profil tersimpan. ☐ |
| A5 | [Beranda](https://ranah-menulis.vercel.app/beranda) | Perhatikan susunan, lalu tutup panduan awal. | Satu kartu "Hari ini" dengan satu tombol utama. Jelas harus mulai dari mana? ☐ |

## 1.B Menulis di Studio

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| B1 | [Studio](https://ranah-menulis.vercel.app/studio) | Perhatikan tab **Naskah** (daftar berbentuk tabel), lalu klik **Naskah baru**. | Editor penuh layar terbuka. Judul naskah bisa diketik langsung di bilah atas editor. ☐ |
| B2 | [Editor baru](https://ranah-menulis.vercel.app/studio/baru) | Ketik judul, lalu tempel (paste) [naskah contoh](https://ranah-menulis.vercel.app/contoh-naskah.txt) sekitar 1.100 kata (dibutuhkan agar bisa dikirim ke lomba dan antologi). Pakai tebal, miring, judul, kutipan, daftar. | Format berlaku, jumlah kata bertambah, tersimpan otomatis. ☐ |
| B3 | [Studio](https://ranah-menulis.vercel.app/studio) (buka dokumen dari B2) | Klik "N kata". | Kata, karakter, paragraf, waktu baca. ☐ |
| B4 | [Studio](https://ranah-menulis.vercel.app/studio) (buka dokumen dari B2) | Nyalakan mode fokus, lalu keluar. | Tampilan bersih. ☐ |
| B5 | [Studio](https://ranah-menulis.vercel.app/studio) (buka dokumen dari B2) | Jalankan timer sprint 1 menit sambil menulis. | Hasil "N kata dalam M menit" di akhir. ☐ |
| B6 | [Studio](https://ranah-menulis.vercel.app/studio) (editor, menu ⋯) | Atur Target dokumen, lihat Riwayat versi, Ekspor PDF. | Target tampil di jumlah kata, riwayat bisa dibuka, PDF terunduh. ☐ |
| B7 | [Studio](https://ranah-menulis.vercel.app/studio) (panah kembali dari editor) | Kembali ke daftar. | Naskah ada di tabel (Judul, Kata, Jenis, Tag, Diubah, Dibuat). Klik judul kolom untuk mengurutkan. Beri jenis dan tag lewat menu ⋯. ☐ |
| B8 | [Studio](https://ranah-menulis.vercel.app/studio) | Buat folder, duplikat dokumen, tekan Ctrl+K dan cari satu kata dari tulisan. | Pencarian menemukan dokumen. ☐ |
| B9 | [Streak](https://ranah-menulis.vercel.app/studio/streak) | Atur target harian. | Kalender, streak, dan progres hari ini tampil. ☐ |
| B10 | [Statistik](https://ranah-menulis.vercel.app/studio/statistik) | Ganti Harian, Mingguan, Bulanan. | Grafik terisi. ☐ |
| B11 | [Beranda](https://ranah-menulis.vercel.app/beranda) | Kembali. | Kata hari ini, ringkasan minggu, dan tombol Lanjutkan menulis terisi. ☐ |
| B12 | [Studio](https://ranah-menulis.vercel.app/studio) (buka naskah dari B2) | Di editor, ganti font, ukuran, rata teks, dan gaya paragraf lewat bilah format. Buka menu ⋯ → **Tata letak halaman**, ubah margin dan jarak baris. | Perubahan berlaku seketika pada naskah itu saja. ☐ |
| B13 | [Studio](https://ranah-menulis.vercel.app/studio) (editor) | Pindah dari **Writing** ke **Pages** (Page Preview). | Teks terbagi per halaman A5 dengan label "perkiraan". Kembali ke Writing tanpa ada teks yang hilang. ☐ |
| B14 | [Studio](https://ranah-menulis.vercel.app/studio) | Klik judul sebuah naskah di tabel. | Halaman naskah dengan tab **Ringkasan** (sampul, sinopsis, target, bab terakhir dikerjakan) dan **Isi**. ☐ |
| B15 | [Studio](https://ranah-menulis.vercel.app/studio) | Klik **Buku baru**, beri judul dan unggah sampul (opsional). Tambahkan dua bab, lalu ubah urutannya dengan tombol Naikkan dan Turunkan. | Total kata buku bertambah, urutan bab tersimpan, fokus tidak hilang setelah memindah bab. ☐ |

## 1.C Community

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| C1 | [Community](https://ranah-menulis.vercel.app/jelajahi) | Ganti kategori, klik "Muat lebih banyak". | Tulisan tampil sebagai ubin. ☐ |
| C2 | [Contoh tulisan](https://ranah-menulis.vercel.app/postingan/hujan-pertama-bulan-november) | Beri apresiasi, simpan, tulis komentar dan balasan. | Hitungan bertambah, komentar muncul. ☐ |
| C3 | [Profil penulis](https://ranah-menulis.vercel.app/penulis/nuraisyah) | Klik Ikuti, buka tab Karya dan Tentang. | Tombol berubah jadi Mengikuti. ☐ |
| C4 | [Tersimpan](https://ranah-menulis.vercel.app/tersimpan) | Buka. | Tulisan dari C2 ada di sini. ☐ |
| C5 | [Tulis postingan](https://ranah-menulis.vercel.app/tulis) | Pilih dokumen dari B2, centang bagian yang dibagikan, isi judul dan genre, pilih siapa yang boleh membaca, terbitkan. | Hanya teks yang dipilih menjadi publik. Tulisan muncul di Community dan profil Anda. ☐ |

## 1.D Lingkar Menulis dan Event

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| D1 | [Lingkar Menulis](https://ranah-menulis.vercel.app/grup) | Klik **Buat lingkar**. Coba jenis **Tantangan 45 Hari** dan isi tanggal mulai. | Anda menjadi Admin Lingkar. Tanggal berakhir otomatis hari ke-45. Jenis dan tanggal tidak bisa diubah setelah dibuat. ☐ |
| D2 | [Lingkar contoh](https://ranah-menulis.vercel.app/grup/penulis-pesisir) | Lihat anggota, bagikan progres menulis. | Progres tampil setelah persetujuan. Halaman selebar halaman Community lain dengan dua kolom. ☐ |
| D3 | [Lingkar contoh](https://ranah-menulis.vercel.app/grup/penulis-pesisir) | Di ringkasan, nyalakan **Ikut leaderboard**, lalu tulis beberapa kata di Studio dan buka halaman ini lagi. | Anda masuk peringkat. Baris anggota lain berlabel "Contoh". Peringkat hanya terlihat anggota lingkar. ☐ |
| D4 | [Lingkar](https://ranah-menulis.vercel.app/grup) | Klik **Masukkan kode** dan masukkan kode lingkar privat dari Admin Lingkar (contoh: `PESISIR26`, hanya bila Anda belum anggota). | Muncul "Permintaan bergabung dikirim". Anda belum menjadi anggota sampai dijawab. Jawab di [Admin → Lingkar](https://ranah-menulis.vercel.app/kelola/admin/grup?sebagai=administrator) dengan **Terima**. ☐ |
| D5 | [Event](https://ranah-menulis.vercel.app/event/cerita-selama-sepekan) | Buka. | Event contoh **sudah selesai** (berakhir 25 November 2026), jadi tombol Gabung nonaktif dan alasannya tampil. Halaman selebar Community lain dengan dua kolom. ☐ |
| D6 | [Buat event](https://ranah-menulis.vercel.app/kelola/organizer/event/baru?sebagai=organizer) | Buat event baru yang sedang berjalan, lalu buka dari [daftar Event](https://ranah-menulis.vercel.app/event), gabung dengan satu dokumen, tulis di Studio, kembali. | Progres event bertambah. ☐ |

## 1.E Projects: dari daftar sampai hasil

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| E1 | [Katalog](https://ranah-menulis.vercel.app/projects) | Ganti kategori, filter Status dan Biaya. | Daftar proyek berubah. ☐ |
| E2 | [Lomba berbayar](https://ranah-menulis.vercel.app/projects/lomba-cerpen-hujan-2026) | Baca detail, klik Daftar, centang ketentuan, Daftar. | Status "Menunggu pembayaran". Pengiriman karya menyusul setelah pembayaran dikonfirmasi di Bagian 2. ☐ |
| E3 | [Bayar](https://ranah-menulis.vercel.app/projects/lomba-cerpen-hujan-2026/bayar) | Lihat kode QRIS. | Kode contoh berlabel dan sisa waktu 2 jam. ☐ |
| E4 | [Lomba gratis](https://ranah-menulis.vercel.app/projects/lomba-esai-literasi-remaja) | Daftar, lalu klik Kirim karya, pilih dokumen dari B2. | Status "Terkirim". ☐ |
| E5 | [Proyek saya](https://ranah-menulis.vercel.app/projects/saya) | Buka. | Pendaftaran dan kiriman terlihat dengan statusnya. ☐ |
| E6 | [Kelas berjalan](https://ranah-menulis.vercel.app/projects/kelas-cerpen-untuk-pemula) | Daftar (gratis), klik Buka dasbor kelas. | Jadwal, materi, tugas, progres. ☐ |
| E7 | [Dasbor kelas](https://ranah-menulis.vercel.app/projects/kelas-cerpen-untuk-pemula/dasbor) | Tandai satu materi selesai, klik Lanjutkan, salin latihan ke Studio. | Latihan menjadi dokumen baru di Studio. ☐ |
| E8 | [Tugas pertama](https://ranah-menulis.vercel.app/projects/kelas-cerpen-untuk-pemula/tugas/tugas-1) | Kumpulkan tugas dengan teks langsung. | Status "Dikumpulkan". Dinilai di Bagian 2. ☐ |
| E9 | [Solo](https://ranah-menulis.vercel.app/projects/solo-penerbitan-buku-sendiri) | Pilih paket "Terbit dan Produksi", centang ketentuan, Daftar. | Status "Menunggu pembayaran". Kirim naskah menyusul di Bagian 2. ☐ |
| E10 | [Hasil lomba selesai](https://ranah-menulis.vercel.app/projects/lomba-cerita-mini-pesisir-2026/hasil) | Buka. | Pemenang, hadiah, catatan juri. ☐ |

## 1.F Notifikasi, pengaturan, dan ponsel

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| F1 | [Notifikasi](https://ranah-menulis.vercel.app/notifikasi) | Buka. | Pemberitahuan pendaftaran dan kiriman dari bagian E. ☐ |
| F2 | [Pengaturan](https://ranah-menulis.vercel.app/pengaturan) | Ubah tampilan, menulis, dan pilihan notifikasi. Simpan. | Perubahan berlaku. ☐ |
| F3 | Ponsel | Ulangi beberapa langkah di ponsel dan mode gelap. | Bilah bawah punya empat tab dan tombol Tulis, dialog muncul dari bawah, tidak ada halaman yang bergeser ke samping. ☐ |
| F4 | [Beranda](https://ranah-menulis.vercel.app/beranda) | Klik avatar, pilih **Laporkan masalah**. Kirim kosong dulu, lalu isi jenis dan penjelasan dan kirim. | Pesan kesalahan muncul untuk isian kosong. Setelah terkirim muncul "Laporan diterima". Info teknis ditampilkan penuh dan tidak memuat isi tulisan. ☐ |

---

# Bagian 2. Semua role pengelola (satu cerita)

**Persiapan:** pakai peramban yang sama dengan Bagian 1 (data tersimpan di peramban itu). Kerjakan **Bagian 1 bagian B dan E** lebih dulu: naskah contoh, daftar lomba berbayar, daftar kelas dan kumpulkan tugas, serta daftar Solo. Ganti role dengan membuka tautan di tab yang sama. Tombol yang sama muncul dua kali (di layar lalu di dialog konfirmasi); klik tombol di dialog untuk menyelesaikan.

## 2.A Organizer: menyiapkan proyek dan konfirmasi pembayaran

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| A1 | [Daftar proyek Organizer](https://ranah-menulis.vercel.app/kelola/organizer?sebagai=organizer) | Buka. | Proyek yang dikelola tampil. ☐ |
| A2 | [Buat proyek](https://ranah-menulis.vercel.app/kelola/organizer/baru?sebagai=organizer) | Pilih Antologi, isi judul dan data lain, klik Buat draf, lalu Terbitkan. | Proyek muncul di [katalog](https://ranah-menulis.vercel.app/projects). ☐ |
| A3 | [Pembayaran lomba](https://ranah-menulis.vercel.app/kelola/organizer/lomba-cerpen-hujan-2026?sebagai=organizer&tab=pembayaran) | Klik Konfirmasi pembayaran, lalu konfirmasi di dialog. | Status "Lunas". ☐ |
| A4 | [Pembayaran antologi](https://ranah-menulis.vercel.app/kelola/organizer/antologi-surat-yang-tidak-pernah-terkirim?sebagai=organizer&tab=pembayaran) | Peserta mendaftar dulu di [halaman daftar](https://ranah-menulis.vercel.app/projects/antologi-surat-yang-tidak-pernah-terkirim/daftar?sebagai=masuk) (Rp75.000), lalu konfirmasi seperti A3. | Status "Lunas". ☐ |
| A5 | [Pembayaran Solo](https://ranah-menulis.vercel.app/kelola/organizer/solo-penerbitan-buku-sendiri?sebagai=organizer&tab=pembayaran) | Konfirmasi seperti A3. | Status "Lunas". ☐ |
| A6 | [Event baru](https://ranah-menulis.vercel.app/kelola/organizer/event/baru?sebagai=organizer) | Isi event, klik Buat event. | Event tampil di [daftar event](https://ranah-menulis.vercel.app/event). ☐ |

## 2.B Peserta: kirim karya

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| B1 | [Kirim ke lomba](https://ranah-menulis.vercel.app/projects/lomba-cerpen-hujan-2026/kirim?sebagai=masuk) | Pilih dokumen naskah contoh, isi judul dan genre, centang pernyataan, Kirim karya. | "Karyamu terkirim", status Terkirim. ☐ |
| B2 | [Kirim ke antologi](https://ranah-menulis.vercel.app/projects/antologi-surat-yang-tidak-pernah-terkirim/kirim?sebagai=masuk) | Sama seperti B1. | Status Terkirim. ☐ |
| B3 | [Kirim naskah Solo](https://ranah-menulis.vercel.app/projects/solo-penerbitan-buku-sendiri/kirim?sebagai=masuk) | Unggah [naskah contoh PDF](https://ranah-menulis.vercel.app/contoh-naskah.pdf) lewat tombol "Unggah PDF atau DOCX" (unduh dulu), isi judul, jenis buku, sinopsis, Kirim karya. | Status Terkirim. ☐ |

## 2.C Lomba: dari penerimaan sampai pemenang

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| C1 | [Tahap lomba](https://ranah-menulis.vercel.app/kelola/organizer/lomba-cerpen-hujan-2026?sebagai=organizer&tab=tahap) | Klik "Tutup penerimaan, mulai dinilai" lalu konfirmasi. | Tahap berubah menjadi "Sedang dinilai". Juri baru bisa menilai setelah ini. ☐ |
| C2 | [Panel Juri](https://ranah-menulis.vercel.app/kelola/juri/lomba-cerpen-hujan-2026?sebagai=juri) | Buka "Karya 1", isi skor 1 sampai 10 tiap kriteria, Simpan penilaian. | Naskah tampil tanpa nama penulis. Karya masuk "Sudah dinilai". ☐ |
| C3 | [Tahap lomba](https://ranah-menulis.vercel.app/kelola/organizer/lomba-cerpen-hujan-2026?sebagai=organizer&tab=tahap) | Klik Tutup penilaian, konfirmasi. | "Penilaian ditutup. Skor tidak bisa diubah lagi." ☐ |
| C4 | [Tahap lomba](https://ranah-menulis.vercel.app/kelola/organizer/lomba-cerpen-hujan-2026?sebagai=organizer&tab=tahap) | Centang Finalis, isi Peringkat 1 dan catatan juri, klik Simpan hasil. Lalu klik Umumkan finalis dan Umumkan pemenang (konfirmasi tiap kali). | Tahap berubah menjadi "Pemenang diumumkan". ☐ |
| C5 | [Hasil lomba](https://ranah-menulis.vercel.app/projects/lomba-cerpen-hujan-2026/hasil?sebagai=masuk) | Buka sebagai peserta. | Finalis dan pemenang tampil beserta catatan juri. ☐ |

## 2.D Editor: antologi dan Solo

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| D1 | [Antrean Editor](https://ranah-menulis.vercel.app/kelola/editor?sebagai=editor) | Buka kiriman Antologi. | Naskah beku dan riwayat status tampil. ☐ |
| D2 | [Antrean Editor](https://ranah-menulis.vercel.app/kelola/editor?sebagai=editor), kiriman Antologi | Klik Mulai tinjau, lalu Terima dan isi alasan. | Status Diterima. ☐ |
| D3 | [Antrean Editor](https://ranah-menulis.vercel.app/kelola/editor?sebagai=editor), kiriman Solo | Klik Mulai tinjau, lalu Terima dan isi alasan. | Status Diterima. ☐ |
| D4 | [Tahap Solo](https://ranah-menulis.vercel.app/kelola/organizer/solo-penerbitan-buku-sendiri?sebagai=organizer&tab=tahap) | Klik "Lanjut ke ..." (konfirmasi Lanjutkan) sampai persetujuan final. Klik "Tambah pratinjau sampul" dan "Tambah pratinjau isi buku", pilih berkas gambar atau PDF, Tambahkan. | Tahap maju, dua pratinjau tersimpan. ☐ |
| D5 | [Dasbor Solo](https://ranah-menulis.vercel.app/projects/solo-penerbitan-buku-sendiri/dasbor?sebagai=masuk) | Sebagai penulis, lihat pratinjau, klik Setujui, lalu "Setujui dan mulai produksi". | Tahap Produksi dimulai, tidak bisa dibatalkan. ☐ |
| D6 | [Notifikasi](https://ranah-menulis.vercel.app/notifikasi?sebagai=masuk) | Buka. | Pemberitahuan Diterima, tahap Solo, dan pratinjau. ☐ |

## 2.E Mentor: kelas

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| E1 | [Kelola kelas](https://ranah-menulis.vercel.app/kelola/mentor/kelas-cerpen-untuk-pemula?sebagai=mentor) | Buka tab Pengumpulan, buka tugas "Kerangka cerpenmu" milik peserta. | Tugas dan versi tampil. ☐ |
| E2 | [Pengumpulan](https://ranah-menulis.vercel.app/kelola/mentor/kelas-cerpen-untuk-pemula?sebagai=mentor) (tugas dari E1) | Klik Tandai selesai, konfirmasi. | Status "Selesai". ☐ |
| E3 | [Tab Tugas](https://ranah-menulis.vercel.app/kelola/mentor/kelas-cerpen-untuk-pemula?sebagai=mentor&tab=tugas) | Klik Buat tugas, isi, simpan. | Tugas baru tampil di dasbor peserta. ☐ |
| E4 | [Dasbor kelas](https://ranah-menulis.vercel.app/projects/kelas-cerpen-untuk-pemula/dasbor?sebagai=masuk) | Sebagai peserta, lihat progres dan tugas baru. Tulis satu testimoni. | Progres naik. ☐ |
| E5 | [Testimoni, Organizer](https://ranah-menulis.vercel.app/kelola/organizer/kelas-cerpen-untuk-pemula?sebagai=organizer&tab=testimoni) | Lihat testimoni. | Testimoni tampil dan dapat dikelola. ☐ |

## 2.F Administrator dan Super Admin

| # | Buka | Lakukan | Hasil yang diharapkan |
|---|---|---|---|
| F1 | [Pengguna dan role](https://ranah-menulis.vercel.app/kelola/admin?sebagai=super-admin) | Buka satu pengguna, klik Beri pada satu role. | Role tampil di detail pengguna. ☐ |
| F2 | [Moderasi](https://ranah-menulis.vercel.app/kelola/admin/moderasi?sebagai=administrator) | Buka satu laporan contoh, pilih Sembunyikan dan isi alasan. | Konten hilang dari layar pembaca. Identitas pelapor tidak tampil. ☐ |
| F3 | [Kurasi](https://ranah-menulis.vercel.app/kelola/admin/kurasi?sebagai=administrator) | Klik Tambah pada satu tulisan (Editor's Picks) dan satu proyek unggulan. | Tampil di Community dan katalog. ☐ |
| F4 | [Pengaturan](https://ranah-menulis.vercel.app/kelola/admin/pengaturan?sebagai=administrator) | Isi tautan komunitas luar (`https://...`), Simpan. | Tautan tampil di sidebar dan Beranda. ☐ |
| F5 | [Lingkar](https://ranah-menulis.vercel.app/kelola/admin/grup?sebagai=administrator) | Buka satu lingkar, tunjuk Admin Lingkar, jawab permintaan bergabung bila ada. | Admin Lingkar berubah dan permintaan terjawab. ☐ |
| F6 | [Audit log](https://ranah-menulis.vercel.app/kelola/admin/audit?sebagai=administrator) | Buka. | Tindakan F1 sampai F5 tercatat, terbaru dulu, hanya bisa dibaca. Konfirmasi pembayaran dan keputusan submission belum dicatat di sini. ☐ |
| F7 | [Laporan masalah](https://ranah-menulis.vercel.app/kelola/admin/laporan?sebagai=administrator) | Buka laporan dari 1.F4, ubah status ke Diproses lalu Selesai (catatan opsional). | Status hanya maju, nama pelapor terlihat, tindakan tercatat di audit. ☐ |

---

## Lembar masukan

| Pertanyaan | Jawaban |
|---|---|
| Layar mana yang paling membingungkan? | |
| Fitur apa yang kurang atau berlebih? | |
| Apakah alur dari daftar sampai hasil terasa wajar? | |
| Teks atau istilah mana yang perlu diubah? | |
| Siap lanjut ke tahap server (login dan database)? | Ya / Belum, karena: |
