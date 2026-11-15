# Catatan slicing RanahMenulis

Serah terima per **15 November 2026** untuk sesi yang mulai mengubah desain menjadi kode Next.js. Baca ini dulu, lalu [DESIGN.md](../../DESIGN.md) bagian 4, 5, 7, 8, 9, 10.

## Keadaan sekarang

- Repo baru berisi fondasi: Next.js 16, React 19, Tailwind 4, Supabase (klien di `src/lib/supabase/`, `src/proxy.ts`), satu migrasi `supabase/migrations/0001_fondasi_akun_dan_role.sql`. `src/app/page.tsx` masih placeholder, token belum diimplementasi.
- Desain ada di tiga artifact claude.ai, **sudah disalin** ke [docs/desain/](README.md) (token, CSS komponen, 32 papan aplikasi, 9 papan landing). Claude Design **tidak dipakai lagi** karena boros usage.
- Belum di-commit: DESIGN.md, `docs/desain/`, `docs/Copy Landing RanahMenulis.md`, `docs/referensi/`, `public/logo/`, perubahan Brief Desain. DESIGN.md belum memuat tambahan dari artifact (lihat bagian terakhir README arsip).

## Urutan slicing

1. [x] **Token dan komponen dasar.** `globals.css` Tailwind v4 dari DESIGN.md bagian 10, ditambah `ink-read` (#191919 / #d2d2d2) dan `opacity-press` (0.72). Huruf lewat `next/font`: Source Serif 4 (sumbu optical size) dan Schibsted Grotesk. Dua radius saja (`rounded-full` dan 0). Rujukan kelas: `docs/desain/sistem-desain/components/bundle.css` (awalan `rm-`) dan README tiap komponen.
2. [x] **Landing.** Papan di `docs/desain/landing/`, teks di `docs/Copy Landing RanahMenulis.md`. Gerak hero: `landing/Gerak.dc.html`.
   Sisa sebelum tayang: terapkan migrasi `0002_daftar_tunggu.sql` ke Supabase, halaman `/kebijakan-privasi` dan `/kontak` (tautan sudah dipasang, halamannya belum ada), gambar Open Graph 1200×630 (papan `OG.dc.html`), SVG logo, dan tiga butir persetujuan client di bawah.
3. [x] **Editor Studio** (dengan IndikatorSimpan, IndikatorTarget, DialogKonflik, drawer bantuan, mode fokus), selesai 15 November 2026 dengan **penyimpanan di perangkat** (IndexedDB). Overlay Dialog, Laci, Menu, Popover, dan Toast ada di `src/components/ui/`; editor di `src/features/studio/`, rute `/studio/[id]`. Sisa yang disengaja, jangan dianggap selesai:
   - **Keputusan user (15 November 2026): seluruh slicing memakai data dummy dan login di-bypass sampai semua layar selesai dan desain disetujui.** Backend (auth, migrasi, RLS, store Supabase) baru dikerjakan sesudahnya; jangan membangunnya lebih awal.
   - **3c, sinkron server (ditunda sampai desain disetujui):** migrasi `documents` + RLS + tes RLS, dan store Supabase. Butuh login (R1); diajukan sebagai rencana sendiri. Sampai itu, "Tersimpan" berarti tersimpan di perangkat dan "Belum tersinkron" hanya muncul saat peramban offline.
   - Butir menu **Kirim ke proyek, Ekspor, Pindah ke sampah** dan tombol **Bagikan** tampil nonaktif (menunggu Projects R4, ekspor STD-07, daftar dokumen langkah 4, dialog Bagikan langkah 6).
   - Tautan "Kembali ke Studio" menuju `/` dan popover target belum punya "Buka Streak" sampai tab Streak ada (langkah 4).
   - **[konfirmasi]** target harian 500 tetap (STK-01), aturan menghapus tulisan hari ini (dipakai opsi mengurangi, BR-STK-04), ambang teks tempel (Q-08, belum ada batas), zona waktu hari mengikuti perangkat, isi kit inspirasi (contoh sementara di `help-content.ts`).
   - Keadaan "Belum tersimpan" (penyimpanan perangkat gagal, mencoba ulang tiap 5 detik) tidak ada di papan; ditambahkan sebagai [usulan].
4. [x] **Tab Streak**, lalu **Beranda** (blok Hari ini), lalu **tab Dokumen Studio**, selesai 15 November 2026 dengan data lokal dan dummy, termasuk kerangka aplikasi (bilah atas, sidebar, rail, bilah bawah 5 tab). Rute `/beranda`, `/studio`, `/studio/streak`. Yang disengaja belum:
   - Beranda: **Perlu perhatian, Proyek saya, Notifikasi, dan feed memakai fixture dummy** (`src/features/home/fixtures.ts`); tombol aksinya nonaktif. Diganti data nyata di langkah 5 (Community) dan R4 (Projects). Tab "Jelajahi" hanya menampilkan toast "segera hadir".
   - Butir nav **Projects, Tersimpan, Profil**, pencarian, dan lonceng tampil nonaktif; daftar **Grup saya** di sidebar belum ada (Q-38).
   - Dokumen: **Kirim ke proyek dan Ekspor** nonaktif; folder hanya satu tingkat, tanpa hapus folder (perilaku dokumen di dalamnya [konfirmasi]); pencarian dan urutan dokumen (STD-03) belum.
   - Streak: zona waktu mengikuti perangkat (papan menampilkan catatan zona; menunggu profil), daftar milestone tetap contoh papan (Q-10), ambang statistik tidak ada ([konfirmasi]), target hari pertama berlaku hari itu juga.
   - Bilah bawah memakai lima tab; empat tab tetap [konfirmasi] ke client.
5. [ ] **Community:** Jelajahi, halaman postingan, Tulis postingan.
6. [ ] **Layar yang belum didesain**, dibangun langsung dari komponen yang ada dan spesifikasi DESIGN.md bagian 6: akun dan onboarding (R1), profil publik, Tersimpan, Notifikasi, Statistik, dialog Bagikan dan Kirim ke proyek, Projects (R4–R5), Kelola dan Admin, Grup.

Urutan rilis dan ketergantungan data: `docs/MVP Scope RanahMenulis.md`. Backend mengikuti rilis R1 dst.; jangan membangun tabel di luar yang dibutuhkan layar yang sedang dikerjakan.

## Aturan kerja

- **Sumber kebenaran bila bertentangan:** keputusan client, PRD v0.2, DESIGN.md, baru arsip artifact.
- **Skill:** `design-taste-frontend` hanya untuk landing. Aturannya (foto nyata, momen hero) bertabrakan dengan DESIGN.md untuk layar aplikasi. Untuk polesan aplikasi pakai `emil-design-eng` dan `animate`; `break-ui` untuk uji data terburuk.
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
