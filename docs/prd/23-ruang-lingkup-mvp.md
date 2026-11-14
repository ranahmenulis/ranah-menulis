## 23. Ruang Lingkup MVP

MVP memuat tiga modul inti (Studio dengan Streak, Community, Projects) dan Grup Penulis dengan alur inti yang bekerja ujung ke ujung. Alur lanjutan (produksi buku yang rumit, pembayaran online, sertifikat, kartu) menyusul. Pembagian di bawah adalah usulan yang mengikuti prioritas founder dan harus disetujui.

**Target waktu (rapat 8 November 2026).** Pengerjaan ditargetkan selesai dalam satu bulan (Desember 2026), bertahap per modul: tiap modul di-review bersama founder sebelum lanjut ke modul berikutnya. Setelah fitur matang, dilakukan uji keamanan, kecepatan, dan beban sebelum peluncuran. Estimasi audit (33 sampai 47 minggu kerja satu developer) lebih panjang dari target ini, jadi kecocokan target dan cakupan MVP perlu ditinjau (Q-44).

| Area | Termasuk di MVP | Ditunda |
| --- | --- | --- |
| Fondasi | Registrasi dan login, profil, RBAC dengan tingkat Super Admin dan Administrator, notifikasi dalam aplikasi dan email, admin dasar, moderasi, audit log, keamanan dan privasi, desain responsif, blok Dashboard "Hari ini" di Beranda (PLT-10, sementara, Q-49) | Login sosial (Q-05), notifikasi dorong |
| Ranah Streak (di dalam Studio) | Target harian, pelacakan kata berbasis delta, kalender, streak, statistik dasar, milestone dasar | Kartu pencapaian |
| Ranah Studio | Editor, simpan otomatis, offline dan konflik, dokumen dan folder, penghitung, ekspor TXT dan PDF, kirim ke Projects, bagikan ke Community | Template, manuskrip multi-bab, ekspor DOCX |
| Ranah Community | Postingan (prolog atau cuplikan karya yang diatur publik, tanpa DM), feed, Apresiasi, komentar, bookmark, follow, Discover kategori dasar, profil dan portofolio, laporan | Karya penuh, chat atau DM antarpenulis, cerita berseri, Highlight, kartu tulisan, rekomendasi kompleks |
| Grup Penulis | Grup dibuat Administrator, undangan anggota, satu atau lebih admin grup, tulisan yang dibagikan ke grup terlihat anggota, audit log keanggotaan | Logo grup (PLT-09, Fase 2); aturan lanjutan sesuai jawaban Q-38, Q-41, dan Q-48 |
| Marketplace | Tidak ada | Seluruhnya setelah MVP; isi belum ditentukan (Q-39) |
| Aplikasi di Play Store dan App Store | Tidak ada; MVP berupa web responsif | Pembungkusan dari versi web setelah web stabil, bila disetujui (Q-40) |
| Projects: keempat kategori | Katalog dan detail, ketentuan hak cipta, pendaftaran, biaya tampil, pembayaran QRIS (semi-manual), pengiriman karya, status submission, pengelolaan proyek oleh Organizer | Pemesanan buku, pembayaran online |
| Antologi | Seleksi, feedback editor, revisi, persetujuan, status tahap produksi manual | Alat produksi dan layout di dalam platform |
| Solo | Paket, pengajuan, dasbor tahap penerbitan manual | Pratinjau layout interaktif |
| Kelas Menulis | Kelas, kurikulum, jadwal, materi, tugas, feedback, progres | Sertifikat otomatis |
| Lomba | Pengiriman, juri, kriteria, penilaian anonim, pengumuman finalis dan pemenang | Sertifikat otomatis |
| Di luar cakupan | Fitur AI di dalam aplikasi (keputusan founder), algoritma rekomendasi kompleks, monetisasi lanjutan, aplikasi native yang dibangun terpisah dari versi web | Sesuai brief founder |

**Prinsip pemotongan.** Bila waktu terbatas, yang dikorbankan adalah kedalaman fitur, bukan keberadaan modul. Studio, Streak, Community, dan keempat kategori Projects tetap hadir dengan alur inti.

**Syarat selesai MVP.**

- Pengguna dapat menjalani perjalanan lengkap: daftar, menulis, tercatat di Streak, terbit di Community, mendaftar proyek, mengirim karya, dan menerima keputusan.
- Semua acceptance criteria bertanda MVP di bagian 26 lulus.
- Pengujian keamanan hak akses dan anonimitas lomba lulus.
- Keputusan mendasar di bagian 28 yang berstatus Blokir MVP sudah dijawab.
