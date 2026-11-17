# Prompt: video hero v2 (gaya Notion, tanpa zoom)

Tempel isi di bawah garis ini ke sesi baru. Sesi ini bekerja di repo **Motion-Graphics-Code** (proyek Remotion `client/ranahmenulis-hero`) dan membaca repo RanahMenulis di `D:\Code\Ranah Penulis` sebagai sumber komponen. Prompt ini menggantikan bagian storyboard di `docs/desain/landing/Brief Video Hero.md`; bagian teknis, bahan, dan pemeriksaan di brief itu masih berlaku kecuali yang disebut di bawah.

---

Kamu akan membuat ulang video hero landing RanahMenulis. Baca dulu `D:\Code\Ranah Penulis\docs\desain\landing\Brief Video Hero.md` dan `D:\Code\Ranah Penulis\CLAUDE.md` (bagian Landing dan Aturan kerja). Jawab dan jelaskan dalam Bahasa Indonesia; kode dan komentar kode dalam English.

## Kenapa diulang

Video lama (36,5 detik, kamera bergerak, zoom ke detail) diganti karena client meminta **gaya hero Notion tanpa zoom**: seluruh aplikasi terlihat di satu bingkai yang diam, dan yang bergerak hanya isi aplikasinya. Tiga hal lain juga berubah sejak video lama dibuat:

1. Font aplikasi kini **Inter** (antarmuka) dan **Merriweather** (tulisan). Video lama memakai Schibsted Grotesk dan Source Serif 4. Render ulang wajib memakai font baru, kalau tidak teks di video berbeda dari halaman di sekitarnya.
2. Judul hero landing berubah menjadi "Ruang Digital Untuk Setiap Ceritamu. Mulai Bersama Kami." dengan eyebrow "Digital Writing Ecosystem". Video tidak memuat teks tambahan, tetapi `hero.ariaLabel` di `src/features/landing/copy/id.ts` dan `en.ts` harus diperbarui agar cocok dengan adegan baru.
3. Tombol **Bagikan** di editor sekarang **aktif** (langkah 6c): dialog penjelas lalu `/tulis?dokumen=<id>`. Catatan di brief lama bahwa tombolnya nonaktif sudah tidak berlaku.

## Referensi yang harus kamu bedah dulu

File: `C:\Users\toxix\Downloads\web-homepage-hero-1920x1200_final.mp4` (hero Notion). Hasil bedah awal, **verifikasi sendiri** dengan ffmpeg (`C:\Users\toxix\tools\ffmpeg-shared\ffmpeg-master-latest-win64-gpl-shared\bin\`):

- 10,97 dtk, 30 fps, 3840×2400 (16:10), H.264 ±1,6 Mbps, 2,1 MB. Tidak ada scene cut: satu take.
- **Kamera diam.** Seluruh antarmuka (sidebar, judul halaman, papan kanban) memenuhi bingkai dan terbaca tanpa zoom.
- Beberapa kursor berlabel (avatar dengan nama) bekerja **bersamaan** di papan: menyeret kartu antarkolom, mengetik di kartu, membuka balon komentar kecil. Tidak ada satu "pemeran utama"; kesan yang dikejar adalah ruang kerja yang hidup.
- Ritme padat tetapi tiap gerakan pendek dan jelas. Tidak ada teks penjelas di atas video.

Ekstrak bingkai tiap ±1 detik, lalu tulis ringkasan: apa yang berubah di layar per detik, berapa kursor aktif, bagaimana kartu bergerak saat diseret (kemiringan, bayangan, kecepatan), dan bagaimana video diulang (apakah keadaan akhir kembali ke awal). Pakai ringkasan itu sebagai dasar tempo.

## Konsep untuk RanahMenulis (usulan; ajukan ke user bila ada yang kamu ubah)

**Jangan meniru kolaborasi waktu nyata.** RanahMenulis tidak punya penyuntingan bersama; kursor penulis lain yang mengedit dokumen yang sama akan menjanjikan fitur yang tidak ada (PRD 6 dan 23). Yang boleh bergerak bersamaan adalah hal yang memang ada: tulisan Rinjani terketik, indikator target terisi, dan feed Jelajahi menerima postingan.

Usulan: **satu bingkai aplikasi layar penuh yang diam**, isinya berganti seperti halaman web sungguhan (kamera tidak bergerak):

1. **Studio** (0–5 dtk): editor `/studio/[id]` dengan sidebar aplikasi. Paragraf kedua "Yang Ditunggu Nenek di Bawah Jambu Air" terketik, `SaveIndicator` berganti "Menyimpan…" lalu "Tersimpan", jumlah kata naik, `TargetIndicator` naik ke 500/500 dan cincinnya terisi sekali (300 ms, tanpa toast).
2. **Bagikan** (5–8,5 dtk): satu kursor mengeklik Bagikan, dialog penjelas muncul (pesan "tetap Pribadi, yang menjadi publik hanya teks yang dipilih"), lalu `/tulis?dokumen=` dengan satu paragraf dicentang dan visibilitas Publik. Pesan yang tidak bisa ditutup tampil minimal 1,5 dtk.
3. **Jelajahi** (8,5–12 dtk): postingan Rinjani masuk di posisi pertama masonry, berdampingan dengan penulis lain. Akhiri dengan sampul `BookCover` hanya bila itu muat tanpa memecah kesan satu bingkai; bila tidak, loop kembali ke Studio lewat crossfade 0,5 dtk.

Target ±12 dtk, 30 fps, loop. Semua data dari fixture (lihat bagian 4 brief lama). Jangan menambah fitur yang belum ada (Projects, pembayaran, tombol nonaktif).

## Spesifikasi teknis (perubahan dari brief lama)

| Butir | Nilai |
| --- | --- |
| Rasio desktop | 16:10. **1920×1200**, 30 fps (referensi 30 fps; 60 fps tidak perlu karena tanpa kamera). Viewport aplikasi di dalam: 1280×800 diskalakan 1,5×, supaya teks terbaca di kolom landing 1296 px pada layar retina |
| Versi ponsel | **4:5, 1080×1350, dengan tata letak ponsel sungguhan** (aplikasi di lebar 375–430: bilah bawah, satu kolom), bukan desktop yang diperbesar. Karena kamera diam, ini satu-satunya cara teks tetap terbaca |
| Tema | Terang dan gelap dari satu komposisi (`data-theme`); mode gelap memakai token gelap |
| Bahasa | Render **`id` dan `en`**. Isi aplikasi (judul, komentar, UI) memakai kamus yang sesuai. `VIDEO_LOCALE` di `src/features/landing/components/hero-video.tsx` kemudian dikembalikan ke pemetaan satu-satu |
| Ukuran | Di bawah 3 MB per berkas. Dengan 12 dtk dan 30 fps, target bitrate ±1,6 Mbps cukup |
| Keluaran | `public/landing/hero/<locale>/{16x10,4x5}-{light,dark}.mp4` dan poster `.webp` dari frame adegan 2 (pesan privasi). Total 8 MP4 (2 bahasa × 2 rasio × 2 tema) |
| Bingkai | Tanpa chrome browser dan tanpa bilah jendela (monokrom, DESIGN.md). Bila user menghendaki bilah jendela seperti Notion, tanyakan dulu |
| Gerak | Tidak ada gerak kamera dan tidak ada motion blur. Gerak UI memakai durasi aplikasi (120/200/300 ms), hanya opasitas dan transform, dihitung dari frame, bukan CSS transition |

## Pemasangan

Setelah render: salin ke `D:\Code\Ranah Penulis\public\landing\hero\`, perbarui `hero.ariaLabel` (id dan en), sesuaikan `VIDEO_LOCALE`, dan jalankan di RanahMenulis: `npm run check` lalu `npm run build`. Verifikasi di Chrome pada 375 dan 1280 px, terang dan gelap, bahwa poster tampil sebelum video main dan tombol jeda berfungsi. Jangan commit atau push tanpa diminta.

## Mulai dengan

1. Bedah referensi dan tulis ringkasannya (jangan menulis kode dulu).
2. Ajukan storyboard final per detik beserta daftar komponen yang dipakai, lalu **berhenti dan tunggu persetujuan user** sebelum membangun komposisi.
