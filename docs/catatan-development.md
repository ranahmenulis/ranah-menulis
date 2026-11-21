# Catatan Development RanahMenulis

Sumber status terkini. **Wajib dibaca di awal setiap permintaan, sebelum menyentuh apa pun.** Jangan menebak posisi proyek: kalau yang dicari tidak ada di sini, baca [Catatan Slicing](desain/Catatan%20Slicing.md) (arsip fase slicing) atau tanyakan. Perbarui berkas ini di akhir setiap sesi yang mengubah status.

Terakhir diperbarui: **21 November 2026**.

## 1. Posisi sekarang

- **Fase:** slicing selesai (semua layar MVP dibangun dengan data dummy dan lokal, tersimpan di peramban). Berikutnya fase backend. Belum ada backend: login di-bypass, data tidak dibagikan antar pengguna.
- **Produksi:** `https://ranah-menulis.vercel.app`. Branch `main`, sinkron dengan `origin/main` (commit kode terakhir `e3a0a68`).
- **Gate terakhir (21 November 2026):** `npm run check` lulus (223 berkas, 1.846 tes) dan `npm run build` berhasil.
- **Belum di-commit (21 November 2026): perombakan UI "semua layar sama".** Fase 0–3 dari rencana yang disetujui user selesai di lokal: prinsip baru di DESIGN.md (jangkar visual per layar, momen pencapaian, gerak bebas), token `ink-soft`, pita `app-band`, sampul tipografis Projects, layar pencapaian, hero Streak, Statistik berpita, angka bergulung. User minta **tes di lokal dulu, jangan push**.
- **Hook git:** `pre-commit` = lint-staged; `pre-push` = `typecheck` saja. Tes penuh lewat `npm run check` dan CI.
- **Saklar demo peran:** `NEXT_PUBLIC_DEMO_ROLES=1` aktif di Vercel Production, jadi `?sebagai=` (tamu dan peran kelola) berlaku di produksi. **Wajib dihapus bersama bypass login saat auth sungguhan masuk.**
- **Panduan uji:** `docs/panduan-uji-pengguna.md` (juga `.html`, `.pdf`), versi web `/panduan-uji.html`, berkas contoh `/contoh-naskah.txt` dan `.pdf`. Diuji di Vercel lewat Chrome CDP pada 21 November 2026. Perbarui panduan bila alur atau nama tombol berubah.

## 2. Sudah selesai (ringkas)

Landing; Beranda; Studio (Dokumen, Editor, Streak, Statistik, riwayat versi, target, sprint, pencarian, arsip, jenis dan tag); Community (rename dari Jelajahi, detail artikel, Tulis postingan, unggah gambar); Grup; Event umum; Projects semua kategori (daftar, QRIS contoh, kirim karya, revisi, dasbor Kelas dan Solo, hasil Lomba, batal daftar, kelas berjalan, testimoni); Profil; Tersimpan dan Notifikasi (termasuk preferensi dan notifikasi pengelola); Akun dan Pengaturan (tanpa backend); semua area Kelola (Editor, Mentor, Organizer, Juri, Admin: pengguna, moderasi, audit, kurasi, pengaturan, grup). Rincian per fitur ada di CLAUDE.md dan Catatan Slicing.

## 3. Backlog dekat (belum dikerjakan)

0. **Lanjutan perombakan UI** (rencana disetujui 21 November 2026, monokrom tetap, gerak tidak dibatasi): fase 4 keadaan kosong bergambar (gravir domain publik di `EmptyState`) dan Grup/Event/Profil/Notifikasi; fase 5 Kelola sebagai dunia lain (pita kepala peran); fase 6 `find-animation-opportunities`. Sisa fase 3 yang belum: penanda jenis di daftar dokumen dan kartu Hari ini di Beranda. Gerak, hover, dan keyboard belum diuji dengan klik sungguhan.
1. **N10** daftar pintasan keyboard (kecil, sudah disetujui client).
2. Ganti kata "galat" menjadi "error" di teks aplikasi (baru panduan yang diganti). Perlu cakupan jelas lebih dulu: kamus `id` dan `en` serta teks di komponen.
3. **N9** gambar kutipan dan **N21** kartu progres: opsional, user belum memintanya, **prioritas paling akhir**.
4. **N26** impor .docx: Fase 2.
5. Cek manual dua hal yang belum terbukti di Vercel: (a) setelah mengisi Peringkat 1 dan Simpan hasil di tab Tahap lomba, layar hasil sempat menulis "1 finalis, 0 pemenang"; kemungkinan isian dari skrip uji tidak terbaca, bisa juga bug; (b) Simpan tautan komunitas di Admin tidak muncul di audit log (mungkin skrip uji).
6. Belum diuji di peramban: buat proyek Organizer sampai Terbitkan, buat event, beri role, tunjuk Admin Grup, tampilan ponsel sungguhan, mode terang di beberapa layar, keyboard N24a.

## 4. Backend (belum dimulai, butuh rencana dan persetujuan)

Menurut CLAUDE.md aturan 3 dan 7: tampilkan rencana lalu tunggu persetujuan; tanya dulu sebelum membuat atau mengubah project Supabase, menjalankan migrasi ke database non-lokal, dan sebelum deploy.

Isi pekerjaannya (urutan belum diputuskan):
- Supabase Auth menggantikan bypass login dan `dummy-auth`; hapus saklar demo peran.
- Migrasi skema dengan RLS di setiap tabel dan **tes RLS** (butuh Supabase lokal, belum ada). Migrasi 0002 belum diterapkan.
- Mengganti tiap store lokal lewat antarmuka yang sudah disiapkan (`DocumentStore`, `PostStore`, `SubmissionStore`, `AssignmentStore`, `SoloStore`, `FileStore`, `local-list-store`) tanpa mengubah layar.
- Supabase Storage untuk unggahan, pembayaran QRIS sungguhan, email dan notifikasi dari server, data bersama antar pengguna.
- Pengujian menyeluruh sebelum rilis.

## 5. Utang dan hal yang menunggu client

- Butir bertanda [usulan] atau [konfirmasi] di PRD belum semuanya disetujui client. Landing belum boleh tayang sebelum butir di Catatan Slicing "Utang sebelum langkah 3" disetujui.
- Konfirmasi client: gambar postingan dan batas unggah 10 MB (`FILE_MAX_BYTES`), baris serif hero, font mono, pita gelap landing, sumber angka social proof, alamat media sosial.
- Nama "Roast My Writing" akan diganti; client minta menunggu sampai pekerjaan selesai. Jangan diganti sekarang.
- Utang teknis: `simplify` untuk 6g-1 dan 6g-2; audit belum mencatat pembayaran, keputusan submission, dan penilaian (SEC-10); video hero versi Indonesia; tab Proyek di profil (butuh persetujuan penulis); bukti transfer, harga ringgit, dan refund; audit aksesibilitas dan alur menyeluruh; tinjauan UI/UX (masukan Fahmi: Beranda, alur dasbor, garis pemisah).
- Hal yang "perlu dibahas" client tidak boleh dibangun (lihat CLAUDE.md, Keputusan Lembar Novlr).

## 6. Log sesi

### 21 November 2026 (sesi UI)
- Audit: aplikasi terasa monoton karena DESIGN.md sendiri memerintahkan keseragaman (kolom 680 + garis di ±20 spesifikasi, 45 kolom 680, 209 garis, 488 teks abu, tanpa gambar di luar landing dan Community). Monokrom bukan penyebab utama.
- Keputusan user: tetap monokrom; urutan fase 0→1→2 lalu 3; sampul dipilih sendiri oleh Claude; **jangan batasi animasi**; tes lokal dulu, jangan push.
- Dikerjakan: `cover-model.ts` + `project-cover.tsx` (empat pola kategori), katalog grid sampul (`project-tile.tsx`), Unggulan dan kepala detail sebagai pita gelap, jadwal garis waktu, blok kategori bernomor, `milestone-hero.tsx` (Terdaftar, Pembayaran diterima, Karyamu terkirim, Revisimu terkirim), `streak-hero.tsx`, kalender lebih besar, total Statistik berpita, `use-count-up.ts`. `useRevealOnce` pindah ke `lib`.
- Temuan: ubin `data-rise` tidak tampil bila observer belum jalan dan reduced motion aktif (diperbaiki dengan aturan CSS reduced motion); tes tema perlu mengecualikan `.app-band`; tes Event kadang gagal saat seluruh tes berjalan bersamaan tetapi lolos sendiri (3/3).
- Verifikasi: tangkapan layar Chrome headless lewat CDP (katalog terang/gelap, ponsel 390, detail, layar Terdaftar, Streak dan Statistik dengan data contoh).
### 21 November 2026
- Gate penuh lulus; sembilan commit di-push (`86a1219`, `60dee87`, `e3a0a68`). Hook `pre-push` dipangkas jadi `typecheck` (keputusan user: tes penuh sudah ada di CI dan `npm run check`).
- Saklar demo peran ditambah (`isDemoRolesEnabled` di `lib/env.ts`, dipakai `lib/viewer.ts`, ada tes, dicatat di `.env.example` dan CLAUDE.md). User mengisi variabelnya di Vercel.
- Panduan uji ditulis ulang sebagai alur lurus tanpa skenario error, semua role, tautan ke Vercel, dan diverifikasi di Vercel: alur Lomba (daftar, konfirmasi bayar, kirim, tutup penerimaan, nilai Juri, tutup penilaian, finalis dan pemenang), Antologi sampai Diterima Editor, Solo (unggah PDF, Editor, semua tahap, dua pratinjau, Setujui), kelas (kumpul tugas, Mentor Tandai selesai), halaman Admin.
- Temuan yang memperbaiki panduan: naskah ±1.100 kata; Juri baru bisa menilai setelah penerimaan ditutup; karya berbayar menunggu konfirmasi pembayaran; Editor perlu Mulai tinjau sebelum Terima.
- Keputusan user: N9 dan N21 opsional dan paling akhir; client harus bisa menguji semua role di Vercel (bukan localhost); tautan panduan harus bisa diklik dan terbuka di tab baru; kata "error" menggantikan "galat" di panduan.
- Alat uji: tidak ada tool peramban bawaan; Chrome dikendalikan lewat protokol DevTools (skrip sementara). Data localStorage hilang bila Chrome dimatikan kurang dari 5 detik setelah aksi.
- Dokumen ini dibuat; Catatan Slicing dibekukan sebagai arsip.
