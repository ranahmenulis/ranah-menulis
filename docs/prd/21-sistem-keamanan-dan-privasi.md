## 21. Sistem Keamanan dan Privasi

Karya tulis adalah aset pribadi penulis, dan sebagian proyek menyimpan data pembayaran dan identitas. Keamanan dan privasi karena itu menjadi syarat peluncuran, bukan tambahan.

| ID | Area | Kebutuhan |
| --- | --- | --- |
| SEC-01 | Autentikasi | Login lewat Supabase Auth; verifikasi email; kata sandi tidak disimpan sendiri; pembatasan percobaan login; sesi dapat dicabut |
| SEC-02 | Otorisasi | Role-Based Access Control diterapkan di basis data lewat Row Level Security pada semua tabel yang berisi data pengguna; pemeriksaan di antarmuka hanya pelengkap |
| SEC-03 | Pemisahan data | Dokumen pribadi, data Streak, bookmark, dan data pembayaran hanya dapat dibaca pemiliknya dan pihak berwenang yang tercatat |
| SEC-04 | Keaslian submission | Versi submission disimpan dengan hash isi sehingga perubahan dapat dideteksi; tidak dapat diubah setelah dikirim |
| SEC-05 | Anonimitas lomba | Pada lomba anonim, data identitas tidak boleh sampai ke antarmuka atau respons API milik juri; diuji secara khusus |
| SEC-06 | Hak cipta | Ketentuan wajib disetujui sebelum pendaftaran; pernyataan keaslian saat mengirim; prosedur laporan dan penurunan konten melanggar hak cipta |
| SEC-07 | Penyimpanan berkas | Berkas di Supabase Storage dengan kebijakan akses per pemilik atau penugasan; tautan unduhan bertanda tangan dan berbatas waktu; validasi jenis dan ukuran berkas |
| SEC-08 | Perlindungan aplikasi | Perlindungan terhadap XSS (isi tulisan dibersihkan sebelum ditampilkan), CSRF, injeksi, dan unggahan berbahaya; pembatasan laju untuk komentar, apresiasi, dan pendaftaran |
| SEC-09 | Moderasi | Alur laporan, penyembunyian, penghapusan, dan penangguhan akun; pedoman komunitas tertulis |
| SEC-10 | Audit | Log tindakan sensitif: perubahan role (termasuk pemberian dan pencabutan role Administrator dan Super Admin), pembuatan grup dan penunjukan Admin Grup, keputusan submission, penilaian, konfirmasi pembayaran, pembukaan kembali penilaian, akses admin ke data pribadi |
| SEC-11 | Privasi pengguna | Pengaturan visibilitas profil, streak, dan portofolio; pengguna dapat mengunduh dan menghapus datanya |
| SEC-12 | Kepatuhan regulasi | Kebijakan privasi dan syarat layanan untuk dua negara. Rujukan awal yang perlu ditinjau penasihat hukum: UU Pelindungan Data Pribadi di Indonesia dan Personal Data Protection Act di Malaysia. Lokasi penyimpanan data dan transfer lintas negara perlu dikaji (Q-30) |
| SEC-13 | Pembayaran | Data kartu tidak disimpan platform; ditangani penyedia pembayaran bersertifikasi saat gateway dipakai |
| SEC-14 | Cadangan dan pemulihan | Pencadangan basis data dan berkas berkala, pengujian pemulihan |
| SEC-15 | Usia pengguna | Batas usia minimum dan perlakuan pengguna di bawah umur: Q-06 |
| SEC-16 | Penghapusan akun | Pengguna dapat menghapus akun. Perlakuan karya yang sudah terbit di Community, karya Diterima pada buku yang terbit, dan catatan keuangan: Q-34 |
| SEC-17 | Akun hak tertinggi | Super Admin dibuat lewat penyiapan awal oleh tim teknis, bukan lewat pendaftaran, dan jumlahnya dibatasi. Usulan: verifikasi dua langkah wajib untuk Super Admin dan Administrator. Semua tindakan Super Admin tercatat di audit log yang tidak dapat diubah atau dihapus siapa pun |

Prinsip data minimal: platform hanya mengumpulkan data yang dibutuhkan untuk fitur yang berjalan. Referensi hukum di atas bukan nasihat hukum dan harus diverifikasi.
