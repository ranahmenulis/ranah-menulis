# Catatan slicing RanahMenulis

Serah terima per **15 November 2026** untuk sesi yang mulai mengubah desain menjadi kode Next.js. Baca ini dulu, lalu [DESIGN.md](../../DESIGN.md) bagian 4, 5, 7, 8, 9, 10.

## Keadaan sekarang

**Progres per 15 November 2026: langkah 1–5 selesai, langkah 6 berjalan (6a selesai, 6b–6g belum).** Semua layar memakai data dummy atau lokal (IndexedDB) dan login di-bypass sampai semua layar selesai dan desain disetujui. Backend (auth, migrasi 0002 dan seterusnya, RLS, store Supabase) belum dikerjakan; migrasi 0002 belum diterapkan. Perubahan langkah 5 belum di-commit.

- Desain ada di tiga artifact claude.ai yang **sudah disalin** ke [docs/desain/](README.md) (token, CSS komponen, 32 papan aplikasi, 9 papan landing). Claude Design **tidak dipakai lagi** karena boros usage.
- Peta kode ada di CLAUDE.md. Daftar yang disengaja belum dibuat tercantum di tiap langkah di bawah.

## Urutan slicing

1. [x] **Token dan komponen dasar.** `globals.css` Tailwind v4 dari DESIGN.md bagian 10, ditambah `ink-read` (#191919 / #d2d2d2) dan `opacity-press` (0.72). Huruf lewat `next/font`: Source Serif 4 (sumbu optical size) dan Schibsted Grotesk. Dua radius saja (`rounded-full` dan 0). Rujukan kelas: `docs/desain/sistem-desain/components/bundle.css` (awalan `rm-`) dan README tiap komponen.
2. [x] **Landing.** Papan di `docs/desain/landing/`, teks di `docs/Copy Landing RanahMenulis.md`. Gerak hero: `landing/Gerak.dc.html`.
   **Revisi 15 November 2026** (permintaan client: sedikit teks, simpel tapi menjelaskan): teks v2 (bagian 4 dokumen copy, ±190 kata), pratinjau Cara kerja yang ber-loop, entrance hero, momen `word-highlight` di Tiga janji, FAQ terbuka, lapisan hover. Aturannya di DESIGN.md 4.6 (pengecualian landing). Video hero menyusul (`landing/Brief Video Hero.md`); sampai videonya jadi, tahap hero lama tetap dipakai.
   Sisa sebelum tayang: terapkan migrasi `0002_daftar_tunggu.sql` ke Supabase, halaman `/kebijakan-privasi` dan `/kontak` (tautan sudah dipasang, halamannya belum ada), gambar Open Graph 1200×630 (papan `OG.dc.html`), SVG logo, dan tiga butir persetujuan client di bawah.
3. [x] **Editor Studio** (dengan IndikatorSimpan, IndikatorTarget, DialogKonflik, drawer bantuan, mode fokus), selesai 15 November 2026 dengan **penyimpanan di perangkat** (IndexedDB). Overlay Dialog, Laci, Menu, Popover, dan Toast ada di `src/components/ui/`; editor di `src/features/studio/`, rute `/studio/[id]`. Sisa yang disengaja, jangan dianggap selesai:
   - **Keputusan user (15 November 2026): seluruh slicing memakai data dummy dan login di-bypass sampai semua layar selesai dan desain disetujui.** Backend (auth, migrasi, RLS, store Supabase) baru dikerjakan sesudahnya; jangan membangunnya lebih awal.
   - **3c, sinkron server (ditunda sampai desain disetujui):** migrasi `documents` + RLS + tes RLS, dan store Supabase. Butuh login (R1); diajukan sebagai rencana sendiri. Sampai itu, "Tersimpan" berarti tersimpan di perangkat dan "Belum tersinkron" hanya muncul saat peramban offline.
   - Butir menu **Kirim ke proyek, Ekspor, Pindah ke sampah** dan tombol **Bagikan** tampil nonaktif (menunggu Projects R4, ekspor STD-07, daftar dokumen langkah 4, dialog Bagikan langkah 6).
   - Tautan "Kembali ke Studio" menuju `/` dan popover target belum punya "Buka Streak" sampai tab Streak ada (langkah 4).
   - **[konfirmasi]** target harian 500 tetap (STK-01), aturan menghapus tulisan hari ini (dipakai opsi mengurangi, BR-STK-04), ambang teks tempel (Q-08, belum ada batas), zona waktu hari mengikuti perangkat, isi kit inspirasi (contoh sementara di `help-content.ts`).
   - Keadaan "Belum tersimpan" (penyimpanan perangkat gagal, mencoba ulang tiap 5 detik) tidak ada di papan; ditambahkan sebagai [usulan].
4. [x] **Tab Streak**, lalu **Beranda** (blok Hari ini), lalu **tab Dokumen Studio**, selesai 15 November 2026 dengan data lokal dan dummy, termasuk kerangka aplikasi (bilah atas, sidebar, rail, bilah bawah 5 tab). Rute `/beranda`, `/studio`, `/studio/streak`. Yang disengaja belum:
   - Beranda: **Perlu perhatian, Proyek saya, dan Notifikasi memakai fixture dummy** (`src/features/home/fixtures.ts`); tombol aksinya nonaktif. Feed sudah memakai Community (langkah 5); sisanya diganti data nyata di R4 (Projects).
   - Butir nav **Projects, Tersimpan, Profil**, pencarian, dan lonceng tampil nonaktif; daftar **Grup saya** di sidebar belum ada (Q-38).
   - Dokumen: **Kirim ke proyek dan Ekspor** nonaktif; folder hanya satu tingkat, tanpa hapus folder (perilaku dokumen di dalamnya [konfirmasi]); pencarian dan urutan dokumen (STD-03) belum.
   - Streak: zona waktu mengikuti perangkat (papan menampilkan catatan zona; menunggu profil), daftar milestone tetap contoh papan (Q-10), ambang statistik tidak ada ([konfirmasi]), target hari pertama berlaku hari itu juga.
   - Bilah bawah memakai lima tab; empat tab tetap [konfirmasi] ke client.
5. [x] **Community:** Jelajahi, halaman postingan, Tulis postingan, selesai 15 November 2026 dengan data dummy dan penyimpanan lokal (IndexedDB `ranah-community`). Rute `/jelajahi`, `/postingan/[id]`, `/tulis`, `/tulis/[id]`. Keputusan user: butir Jelajahi di sidebar dan rail (ponsel lewat ikon cari, tetap lima tab); draf disimpan lokal dan dibuka lagi di `/tulis/[id]` lewat baris "Draf postingan"; postingan dan komentar buatan pengguna masuk ke Jelajahi, feed, dan halaman postingan; tampilan tamu lewat `?sebagai=tamu` (hanya development). Yang disengaja belum atau berbeda dari papan:
   - Masuk dan Daftar (dialog tamu, kolom kanan tamu, blok komentar) tampil nonaktif sampai auth ada. Pencarian, Tersimpan, profil penulis (nama penulis belum bisa diklik), dan penyebutan `@nama` (hanya digarisbawahi) belum.
   - Kategori Jelajahi memakai daftar pilihan tetap (rumus BR-COM-05 / Q-17 [konfirmasi]); "Semua" ditambahkan sesuai DESIGN.md 6.8 dan tidak ada di papan. Nama kategori tetap Inggris [konfirmasi]. Bentuk ubin ditentukan otomatis: ada foto, teks ≤45 kata menjadi catatan, selain itu berjudul [usulan]. Foto hanya ada di fixture (tempat gambar berlabel); Tulis postingan belum bisa melampirkan gambar [konfirmasi].
   - Tulisan terkait: genre sama dulu, lalu paling diapresiasi, maksimal 5 [konfirmasi dasar]. Komentar yang disembunyikan penulis hanya terlihat oleh penulis; komentar yang dilaporkan hanya disembunyikan dari tampilan pelapor [konfirmasi]. Alasan laporan belum dikirim ke mana pun.
   - Ponsel: menu ⋯ halaman postingan ada di bilah aksi bawah (papan menaruhnya di bilah atas), dan Terbitkan tidak dinonaktifkan di langkah pilih bagian bila formulir sudah lengkap. Pilihan "Grup" memakai satu grup dummy (Q-38).
   - Postingan yang sudah terbit belum bisa diedit atau ditarik; draf tidak disimpan otomatis. Tombol Bagikan memakai share bawaan peramban atau menyalin tautan (dialog Bagikan dokumen ada di langkah 6).
   - Tombol "Tulis postingan" ada di Beranda dan Jelajahi; Editor Studio belum punya jalan masuk "Bagikan sebagai postingan" (langkah 6).
6. [ ] **Layar yang belum didesain**, dibangun **seluruhnya langsung di Claude Code** (keputusan user, 15 November 2026: Claude Design tidak dipakai lagi, termasuk untuk Detail proyek, Kirim karya, dan Panel juri) dari komponen yang ada dan spesifikasi DESIGN.md bagian 6. Tetap data dummy atau lokal, tanpa backend. Tiap sub-langkah mendapat rencana rinci sendiri sebelum dikerjakan (CLAUDE.md butir 3):
   - [x] **6a. Tersimpan dan Notifikasi** (DESIGN 6.6), selesai 15 November 2026. Tersimpan: daftar pola feed dari marks "Simpan", kosong, dan butir tidak tersedia (PRD COM-06). Notifikasi: tab Semua · Komentar · Proyek, belum dibaca bertitik, tandai dibaca, tautan ke objek, notifikasi sejenis digabung (PRD bagian 20). Lonceng di bilah atas menuju ke sini dan hitungannya mengikuti data yang sama; baris Notifikasi di Beranda juga. Yang disengaja belum: teks hanya Indonesia (belum dua bahasa); notifikasi untuk karya sendiri dan proyek tanpa tujuan (`href: null`) sampai 6b dan 6f; Notifikasi tanpa keadaan memuat dan galat (data sinkron); **di ponsel Tersimpan belum punya jalan masuk** (tab Profil nonaktif); preferensi notifikasi dan email belum; urutan Tersimpan memakai tanggal terbit, bukan waktu simpan (mark tidak mencatat waktu) [usulan].
   - [ ] **6b. Profil publik penulis** (DESIGN 6.5): Karya · Tentang · Proyek; nama penulis di feed dan halaman postingan menjadi tautan.
   - [ ] **6c. Dialog Bagikan, Kirim ke proyek, dan jalan masuk "Bagikan sebagai postingan"** dari Editor Studio (DESIGN 7.5).
   - [ ] **6d. Statistik** (DESIGN 6.6). Cakupan belum jelas: statistik postingan, atau perluasan tab Streak.
   - [ ] **6e. Akun dan onboarding** (R1): Masuk, Daftar, Lupa sandi, Verifikasi, Profil dan zona waktu. Hanya tampilan; tombol Masuk dan Daftar yang kini nonaktif diaktifkan.
   - [ ] **6f. Projects** (R4–R5): katalog, detail proyek, Kirim karya, QRIS, status submission (DESIGN 6.7, 7.4).
   - [ ] **6g. Kelola, Admin, Juri, dan Grup** (DESIGN 6.7).

Urutan rilis dan ketergantungan data: `docs/MVP Scope RanahMenulis.md`. Backend mengikuti rilis R1 dst.; jangan membangun tabel di luar yang dibutuhkan layar yang sedang dikerjakan.

## Aturan kerja

- **Sumber kebenaran bila bertentangan:** keputusan client, PRD v0.2, DESIGN.md, baru arsip artifact.
- **Skill:** `design-taste-frontend` dibuat untuk landing; aturannya (foto nyata, momen hero, kartu terangkat saat hover) bertabrakan dengan DESIGN.md untuk layar aplikasi. Untuk layar langkah 6 skill ini dipakai atas permintaan user (15 November 2026) hanya pada prinsip yang tidak bertentangan (tepi sejajar, tanpa keterangan di bawah gambar, ikon nyata, teks polos, respons hover dan tekan); bila bertabrakan, **DESIGN.md menang**. Untuk polesan aplikasi pakai `emil-design-eng` dan `animate`; `break-ui` untuk uji data terburuk.
- **Setiap layar** dicek di terang dan gelap, lebar 375 dan 1280, dengan judul panjang, nama satu huruf, dan nol butir. Keadaan memuat, kosong, galat wajib ada (DESIGN.md bagian 8). Daftar larangan: bagian 9.
- **Satu tombol terisi per layar.** Merah hanya untuk galat dan tindakan yang tidak bisa dibatalkan.
- File `.dc.html` tidak bisa dibuka di browser; baca sebagai teks. Catatan keputusan per bagian ada di `docs/desain/aplikasi/canvas.json` (`notes`).
- Teknis: logo hanya PNG (belum ada SVG), jadi minta SVG ke pembuat logo; ikon di artifact digambar ulang, ganti dengan paket Phosphor asli; JPG logo berlatar putih tidak boleh dipasang di mode gelap.

## Utang sebelum langkah 3 (per 15 November 2026)

- Belum sesuai CLAUDE.md butir 5: tes RLS untuk migrasi 0002 belum ada (butuh Supabase lokal). Tes untuk server action daftar tunggu sudah ada di `src/features/landing/waitlist/actions.test.ts`, dan kode landing kini berada di `src/features/landing/` (aturan struktur ada di CLAUDE.md).
- Migrasi 0002 belum diterapkan dan belum melewati persetujuan rencana (butir 3).
- ~~Dialog, Laci, Menu, dan Toast belum dibuat~~ Selesai 15 November 2026 (lihat langkah 3).
- Pengalih tema manual belum ada (tema masih ikut sistem). Galeri `/sistem-desain/overlay` punya tombol tema sendiri.
- Uji viewport nyata: Chrome headless biasa terpotong di bawah 500px; pakai Chrome DevTools Protocol (`Emulation.setDeviceMetricsOverride`).

## Keputusan yang masih terbuka

Memblokir tampilan:
- **Bilah bawah ponsel:** lima tab (PRD 16) atau empat tab dengan Streak di dalam Studio (usulan). Bangun lima tab dulu bila belum ada jawaban.
- **Menghapus tulisan hari ini:** mengurangi progres (BR-STK-04) atau tidak (Q-08). Papan `StreakHapus` membandingkan keduanya. Bila mengurangi, usulan: status "tercapai" ikut dicabut.
- **Landing tidak boleh tayang** sebelum tiga butir disetujui client: kalimat biaya, kalimat Grup Penulis (Q-38), nada janji privasi (BR-STD-05). Form daftar tunggu butuh tabel, halaman Kebijakan privasi, dan halaman Kontak yang belum ada. Juga belum jelas: landing untuk RanahMenulis atau Beyond Studio.
- **Huruf sans final** menunggu uji spesimen (Schibsted Grotesk usulan).

Tidak memblokir, tulis sebagai [konfirmasi] di UI atau kode: lama simpan Sampah (Q-12, tanpa angka hari), ambang data statistik, perilaku teks tempel besar (Q-08), daftar milestone (Q-10), isi Grup dan opsi visibilitas Grup (Q-38), kebijakan hapus akun (SEC-16, Q-34), batas usia (SEC-15, Q-06), nama kategori Jelajahi (Inggris atau Indonesia), dasar "Tulisan terkait", gambar pada postingan (COM-01 tidak menyebutnya), opsi negara "Lainnya" (PLT-02 hanya Indonesia atau Malaysia).

## Larangan isi (dari PRD, berlaku di UI dan teks)

Fase 2 tidak digambar atau dijanjikan: kartu pencapaian, manuskrip multi-bab, DOCX, template, karya penuh di Community, cerita berseri, Highlight, DM, sertifikat, pembayaran MYR, riwayat versi dokumen, login sosial. Tidak ada fitur AI. Postingan Community maksimal 500 kata dan hanya prolog atau cuplikan.
