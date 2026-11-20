# Roadmap MVP RanahMenulis

Dasar: daftar MVP dari client + PRD v0.2 (bagian 9, 15, 19, 23, 28) + catatan keputusan 8 November. Dokumen ini analisis dan urutan kerja, bukan perubahan PRD. Ukuran usaha (S/M/L) adalah penilaian saya, belum divalidasi tim teknis.

## 1. Cakupan MVP yang diminta, dipetakan ke PRD

| Yang diminta client | ID PRD di MVP | Selisih / catatan |
| --- | --- | --- |
| Ranah Studio (menulis, dokumen, editor, autosave, Streak) | STD-01..04, 07, 09, 10, 11; STK-01..06 | Template, manuskrip multi-bab, DOCX, kartu pencapaian ditunda |
| Ranah Projects (Antologi, Solo, Kelas, Lomba) | PRJ-01..04; ANT-01, 02; SOL-01, 02; KLS-01..03; LMB-01, 02 | Pemesanan buku, sertifikat ditunda; produksi buku berupa status manual |
| Ranah Community | COM-01, 03, 04, 05, 06, 08, 09, 10 | Hanya prolog/cuplikan (maks. 500 kata); karya penuh, seri, Highlight, DM ditunda |
| Dashboard / Beranda | Belum ada spesifikasinya | Di PRD "Beranda" = feed Community. Dashboard ringkasan aktivitas + akses modul adalah halaman baru yang perlu didefinisikan |
| Profil & Settings | PLT-02, COM-10 | Sesuai |
| Super Admin & Admin Panel | PLT-03, 05, 06 | Sesuai (dua tingkat admin) |
| Organizer / Management Panel | PRJ-03, antrean Editor, panel Juri, kelola kelas | Sesuai |
| Auth & Authorization | PLT-01, 03 | Login sosial ditunda (Q-05) |
| Notifikasi | PLT-04 | Penyedia email belum dipilih (Q-47) |
| Payment Management | PLT-07 | QRIS IDR semi-manual; MYR Fase 2 |
| Grup Penulis (diatur Admin) | Bagian 15.4, US-30..32, 38, 39 | Logo grup Fase 2; visibilitas tulisan belum diputuskan (Q-38) |

## 2. Temuan analisis

1. **Cakupan tidak muat target satu bulan.** Rapat 8 Nov menargetkan Desember 2026; audit memperkirakan 33–47 minggu kerja satu developer berbantuan AI. Cakupan ini sama dengan yang diaudit, jadi ketidakcocokan itu masih berlaku (Q-44). Opsi: rilis bertahap per modul (usulan PRD), atau kecilkan cakupan dengan memotong kedalaman, bukan modul (prinsip pemotongan PRD bagian 23).
2. **Projects adalah porsi terbesar dan sumber pendapatan,** tetapi bergantung pada hampir semua yang lain: dokumen Studio (versi beku), RBAC per penugasan, pembayaran, dan notifikasi. Jadi ia harus dibangun belakangan, dan fondasinya harus matang lebih dulu.
3. **Keamanan hak akses ada di database (RLS), bukan hanya UI.** Pola RLS dan penugasan harus ditetapkan sebelum modul mana pun dibangun. Perubahan di belakang mahal, dan rencana pindah ke VPS ikut bergantung padanya (PRD 19.3).
4. **Tiga risiko teknis terbesar:** (a) autosave + offline + deteksi konflik di editor (STD-02, tidak boleh kehilangan teks); (b) anonimitas juri di Lomba yang harus lulus uji akses negatif; (c) QRIS buatan sendiri yang menyimpan sesi merchant di VPS (keamanan dan kebijakan penyedia, Q-19).
5. **Repo `ranahmenulis/` bukan fondasi.** Itu Penulis+ (Vite + React). Bangun baru dengan Next.js + Supabase; bawa hanya Editor dan perpustakaan prompt.

## 3. Roadmap MVP (rilis bertahap, review founder tiap tahap)

| Rilis | Isi | Ukuran | Bergantung pada | Keputusan yang harus sudah ada |
| --- | --- | --- | --- | --- |
| **R0. Fondasi & desain** | Repo Next.js + TypeScript + Tailwind + shadcn/ui; proyek Supabase; migrasi berurutan; lapisan akses data di server; pola RLS + tabel penugasan; sistem desain dan desain UI semua modul (disetujui founder sebelum backend); Super Admin awal | M | — | Q-36 (anggaran/jadwal), Q-44, Q-40, Q-32, Q-06 |
| **R1. Akun & platform** | Registrasi/login/verifikasi/reset (PLT-01); profil + zona waktu (PLT-02); RBAC dua tingkat admin (PLT-03); audit log; admin dasar pengguna & role; notifikasi dalam aplikasi; email transaksional; shell Dashboard/Beranda | M | R0 | Q-01, Q-03, Q-04, Q-47 |
| **R2. Studio + Streak** | Editor + format dasar; autosave, offline, konflik; dokumen/folder/sampah; penghitung kata; ekspor TXT/PDF; kit inspirasi + prompt; target harian, delta kata idempoten, kalender, streak, statistik, milestone | L | R1 | Q-07, Q-08, Q-12, Q-10, Q-11 |
| **R3. Community** | Bagikan prolog dari Studio (STD-10); feed; apresiasi; komentar + balasan; bookmark; follow; Discover kategori dasar; profil publik/portofolio; lapor + antrean moderasi (PLT-06); halaman publik di-render server + Open Graph | L | R1, R2 | Q-14, Q-16, Q-17, Q-18 |
| **R4. Projects fondasi + Payment** | Katalog + detail; persetujuan hak cipta tersimpan per versi; pendaftaran; panel Organizer (buat, jadwal, kuota, penugasan); pembayaran QRIS semi-manual + konfirmasi admin; mesin status submission + versi beku (STD-09, PRJ-04) | L | R2 (dokumen), R1 (RBAC) | Q-19, Q-20, Q-21, Q-30, Q-31, Q-13 |
| **R5. Empat kategori Projects** | Antologi (antrean editor, feedback, revisi, tahap produksi manual); Lomba (kriteria, juri, penilaian anonim, pengumuman); Kelas (kurikulum, tugas, feedback mentor, progres); Solo (paket, pengajuan, dasbor tahap manual). Urutan saran: Lomba dan Antologi dulu (memakai alur submission), lalu Kelas, lalu Solo | L | R4 | Q-22, Q-23, Q-24, Q-26, Q-27, Q-28 |
| **R6. Grup Penulis + pengerasan** | Grup oleh Administrator, undangan, lebih dari satu admin grup, tulisan dibagikan ke grup, audit keanggotaan; uji keamanan hak akses & anonimitas; uji kecepatan dan beban; cadangan + uji pemulihan; analitik dan pemantauan galat | M | R2, R1 | Q-38, Q-41, Q-48, Q-34, Q-35 |

Grup sengaja di R6 karena semua kebutuhannya (RBAC, berbagi dokumen) sudah ada setelah R3, dan Q-38 (visibilitas) bisa dijawab sambil menunggu. Kalau client ingin Grup lebih awal, ia bisa disisipkan setelah R3 tanpa mengubah rilis lain.

## 4. Jalur kritis

R0 (desain + RLS) → R1 (RBAC) → R2 (dokumen Studio) → R4 (versi beku + pembayaran) → R5. Community (R3) dan R4 bisa berjalan paralel bila ada lebih dari satu developer. Dengan satu developer, urutannya serial seperti tabel.

## 5. Bila waktu terbatas: potong kedalaman, bukan keberadaan

- Discover cukup 3–4 kategori awal; Editor's Picks manual.
- Notifikasi hanya dalam aplikasi + email untuk verifikasi, reset, dan pembayaran.
- Solo dan Antologi: tahap produksi murni status manual (sudah usulan PRD).
- Pembayaran sepenuhnya manual (bukti transfer + konfirmasi admin) lebih dulu, QRIS webhook menyusul; ini membuat VPS tidak jadi penghambat rilis pertama.
- Statistik Streak dan milestone: daftar paling dasar.

## 6. Pertanyaan "Blokir MVP" yang belum dijawab, dikelompokkan menurut rilis yang terhalang

- **Sebelum R0/R1:** Q-01, Q-03, Q-04, Q-06, Q-32, Q-36, Q-40, Q-44
- **Sebelum R2:** Q-07, Q-08, Q-11
- **Sebelum R4:** Q-13, Q-19, Q-20, Q-21, Q-30, Q-31
- **Sebelum R5:** Q-24, Q-26, Q-28
- **Sebelum R6:** Q-34, Q-38

Yang paling menentukan untuk dibawa ke client lebih dulu: **Q-44 (jadwal vs cakupan), Q-19 (pembayaran), Q-21 (ketentuan hak cipta, butuh penasihat hukum), dan Q-38 (visibilitas Grup).**

## 7. Pengingat scope MVP dari founder (17 November 2026)

Teks asli, dikirim ulang oleh user saat slicing 6g berjalan. Ini acuan utama untuk menilai apa yang masuk MVP.

**1. Tiga Modul Utama (Core Product).** Ketiganya wajib tersedia sejak MVP dengan alur dasar yang berfungsi end-to-end.

1. *Ranah Studio*: ruang menulis, pengelolaan dokumen, editor, autosave, dan Streak menulis.
2. *Ranah Projects*: pengelolaan Antologi, Penerbitan Solo, Kelas Menulis, dan Lomba.
3. *Ranah Community*: ruang interaksi penulis dan pembaca, berbagi tulisan, apresiasi, komentar, dan discover.

**2. Supporting Platform (wajib, bukan modul utama).**

- *Dashboard / Beranda*: ringkasan aktivitas, progres, dan akses ke modul.
- *User Profile & Settings*: identitas penulis, portofolio, dan pengaturan akun.
- *Super Admin & Admin Panel*: pengelolaan pengguna, role, konten, proyek, moderasi, dan **konfigurasi platform**.
- *Organizer / Management Panel*: pengelolaan proyek, submission, editor, mentor, dan juri.
- *Authentication & Authorization*: login, registrasi, manajemen role dan permission.
- *Notification System*: **notifikasi aktivitas** dan email transaksional.
- *Payment Management*: pembayaran, **verifikasi, status transaksi, dan administrasi pembayaran**.
- *Grup Penulis*: kolaborasi dan pengelolaan keanggotaan sebagai kapabilitas lintas modul, bisa diatur oleh Admin.

**Selisih terhadap PRD v0.2 yang ditemukan saat slicing 6g** (belum mengubah PRD):

| Butir founder | Di PRD | Tindak lanjut |
| --- | --- | --- |
| Konfigurasi platform (Admin Panel) | 17.6 punya halaman "Admin: pengaturan sistem" untuk Super Admin, **tanpa isi** | Isinya harus ditentukan bersama user; masuk sub-langkah 6g-7. Kandidat dari PRD: tautan komunitas (PLT-12), data pembayaran, versi ketentuan hak cipta |
| Notifikasi aktivitas untuk pengelola | PRD 20 memuat "submission ditugaskan", "revisi dikirim", "karya tugas dikumpulkan" (AC-30), belum dibangun di slicing | Sub-langkah 6g-N |
| Administrasi pembayaran, status transaksi | PLT-07 hanya QRIS semi-manual dan konfirmasi | Daftar transaksi dengan status dan jalur bukti di 6g-3b |

Tidak ada di daftar ini: Event umum (COM-13, masuk lewat keputusan client 17 November 2026) dan Template Studio (ditunda).

