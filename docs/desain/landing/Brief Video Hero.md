# Brief Video Hero Landing RanahMenulis

Status: **disetujui pengguna, 15 November 2026** (keputusan di bagian 8). Client belum melihat landing; ia melihat hasilnya setelah video jadi.

Video ini dibangun di repo Motion-Graphics-Code memakai pipeline Remotion yang ada di sana. Isinya merender **komponen asli RanahMenulis**, tidak menggambar ulang UI. Brief ini menjelaskan apa yang tampil, urutannya, dan bahan apa yang dipakai.

Referensi: `C:\Users\toxix\Downloads\animos-preview.mp4` (hero animos.app).

---

## 1. Tujuan

Client meminta landing yang **sedikit teks tetapi tetap menjelaskan**. Video hero menggantikan sebagian besar penjelasan tertulis dengan menunjukkan satu perjalanan naskah dalam ±27 detik:

> Menulis di Studio → target harian tercapai, Streak naik → membagikan cuplikan ke Community → muncul di Jelajahi → bukunya menyusul.

Penonton harus menangkap tiga hal tanpa membaca paragraf apa pun:

1. Studio adalah tempat menulis yang tenang dan tulisannya tersimpan sendiri.
2. Target harian dan Streak mencatat kemajuan tanpa gamifikasi berisik.
3. Yang dibagikan hanya bagian yang dipilih, dan naskah lengkapnya tetap pribadi.

## 2. Yang diambil dari animos, dan yang tidak

Hasil bedah video animos: 28,8 detik, 1400×824, 60 fps. Isinya satu take tanpa potongan (deteksi scene tidak menemukan cut). Videonya rekaman layar produknya sendiri.

| Ditiru | Tidak ditiru |
|---|---|
| **Satu take tanpa cut.** Perpindahan adegan lewat gerak kamera dan navigasi di UI, bukan lewat potongan | Latar lanskap 3D di luar bingkai aplikasi. RanahMenulis monokrom, jadi latarnya cukup `subtle` |
| **Kamera hidup**: dibuka dengan close-up, mundur ke tampilan penuh, lalu maju ke detail yang sedang berubah. Ada motion blur saat kamera bergerak cepat | Motion blur pada konten yang diam. Blur hanya dipakai saat kamera berpindah |
| **Kursor nyata dengan satu aksi per ketukan**: klik, geser, centang. Kursor bergerak lalu berhenti sebelum mengeklik | Kontrol yang bergerak tanpa kursor. Setiap perubahan di UI harus ada sebabnya |
| **Hasil langsung terlihat**: setiap aksi kursor langsung mengubah sesuatu di layar | Efek dekoratif seperti kartu 3D yang berputar. RanahMenulis tidak punya gerak seperti itu (DESIGN.md 4.6) |
| **Tanpa teks tambahan dan tanpa caption.** Yang menjelaskan adalah UI-nya | Warna aksen biru. Kita memakai token monokrom |

## 3. Format teknis

| Butir | Nilai |
|---|---|
| Rasio utama (desktop) | **16:10, 1600×1000**, 60 fps. Di landing tampil di kolom penuh `max-w-[1296px]` |
| Versi ponsel | **4:5, 1080×1350.** Timeline yang sama, hanya jalur kameranya lebih rapat ke area yang sedang aktif. Tanpa versi ini, UI desktop di layar ponsel terlalu kecil untuk terbaca |
| Durasi | ±27 detik, diputar berulang (loop) |
| Loop | Frame terakhir menyatu kembali ke frame pertama lewat crossfade 0,5 detik, atau dengan keadaan akhir yang sama dengan awal (lihat adegan 5) |
| Audio | Tidak ada, karena video diputar `muted` |
| Tema | Dua render dari komposisi yang sama: `data-theme="light"` dan `data-theme="dark"`. Landing memilih versi yang sesuai tema pengunjung |
| Hasil yang diserahkan | Empat render: 16:10 dan 4:5, masing-masing terang dan gelap. MP4 H.264 (CRF ±23, `+faststart`), di bawah **3 MB per versi**. Ditambah WebM VP9/AV1 bila lebih kecil, dan **poster PNG/WebP** dari frame yang paling menjelaskan (usulan: adegan 3, saat pesan privasi tampil) |
| Bingkai aplikasi | Persegi tanpa radius (token RanahMenulis), border `line`, dan bayangan halus kalau sistem desain memang punya. Tanpa chrome browser |

Ukuran viewport aplikasi di dalam bingkai: **1280×800** (breakpoint `lg`). Nilai ini dipakai untuk semua adegan agar tata letak tidak meloncat. Sidebar mengikuti aplikasi: editor `/studio/[id]` dan `/tulis` tampil layar penuh tanpa sidebar, sedangkan Streak dan Jelajahi memakai kerangka aplikasi dengan sidebar.

## 4. Benang cerita dan data

Satu penulis, satu naskah, dari awal sampai akhir. Semua data sudah ada di fixture, jadi tidak ada yang dikarang:

| Butir | Nilai | Sumber |
|---|---|---|
| Penulis | **Rinjani Putri** (@rinjaniputri, ID) | `src/features/community/fixtures/authors.ts` |
| Dokumen Studio | **Yang Ditunggu Nenek di Bawah Jambu Air** | `heroDoc.title` di `src/features/landing/copy.ts` |
| Paragraf yang sudah tertulis | `heroDoc.page[0]` ("Hujan pertama bulan November…", 40 kata) | `copy.ts` |
| Paragraf yang diketik | `heroDoc.page[1]` ("Aku baru mengerti kebiasaan itu…", 20 kata). `heroDoc.typed` tidak dipakai karena isinya potongan `page[0]` | `copy.ts` |
| Postingan | **Hujan Pertama Bulan November**, jenis prolog, genre Cerpen, Publik. Paragrafnya sama persis dengan `page[0]`. **Khusus video**: waktu "baru saja" dan 0 Apresiasi, karena baru diterbitkan | `src/features/community/fixtures/posts-a.ts` (post pertama) |
| Postingan lain di Jelajahi | Fixture lain (Hafiz Rahman, Nur Aisyah, Aina Sofea, dan seterusnya) | `posts-a.ts`, `posts-b.ts` |
| Target harian | 500 kata | `daily-progress.ts` |
| Streak | 6 hari, menjadi 7 setelah target tercapai | Angka adegan, sesuai contoh di DESIGN.md |

Waktu relatif ("3 hari lalu") dihitung dari tanggal tetap di komposisi, bukan dari `Date.now()`, agar setiap render menghasilkan frame yang sama.

## 5. Storyboard

Waktu di bawah ini perkiraan. Detik pastinya ditentukan di `cues.json`/timeline proyek video. Prinsipnya: **setiap adegan berisi satu aksi utama dan satu perubahan di layar.**

### Adegan 1 · Menulis (0,0–7,0 dtk)

- **Pembuka**: close-up ke permukaan tulis Studio. Judul dokumen sudah ada, kursor teks berkedip, dan paragraf pertama sudah tertulis (`heroDoc.page[0]`).
- **Aksi**: paragraf kedua (`heroDoc.page[1]`) diketik dengan ritme manusia, sekitar 2 karakter per frame pada 30 fps, dengan jeda kecil setelah titik.
- **Perubahan di layar**:
  - `SaveIndicator` berganti "Menyimpan…" lalu "Tersimpan", mengikuti jeda ketik dan bukan setiap ketukan.
  - Jumlah kata di bilah editor naik dari 40 ke 60 kata, sesuai teks yang benar-benar terlihat (`tabular-nums`).
- **Kamera**: mundur pelan (±1,5 dtk) dari close-up ke bilah editor penuh, sehingga penanda visibilitas **🔒 Pribadi** dan indikator target ikut terlihat.

### Adegan 2 · Target harian dan Streak (7,0–12,5 dtk)

- **Kamera**: maju ke `TargetIndicator` di bilah atas, yang menunjukkan "480 / 500 hari ini". Angka ini naik bersama jumlah kata dokumen, sampai 500 tepat saat paragraf selesai.
- **Aksi**: kalimat terakhir selesai diketik.
- **Perubahan di layar**: indikator menjadi "500 / 500" dan cincinnya **terisi sekali selama 300 ms**. Tanpa toast, konfeti, atau suara (DESIGN.md: "satu-satunya perayaan").
- **Aksi kursor**: klik indikator. Popover terbuka dengan **teks yang benar-benar ada di komponen**: judul "Target hari ini tercapai." dan isi "Target hari ini sudah tercapai. Angka tetap bertambah selama kamu menulis." Kalimat "Streakmu naik menjadi 7 hari" masih `[usulan]` di kode, jadi tidak dipakai. Kenaikan streak diperlihatkan di tab Streak.
- **Sekilas tab Streak** (±1,5 dtk): kamera menyapu ke `/studio/streak`. Titik hari ini di `StreakCalendar` terisi tinta (300 ms) dan angka streak naik dari 6 ke 7. Lalu kamera kembali ke editor.

### Adegan 3 · Membagikan cuplikan (12,5–19,5 dtk)

Ini adegan terpenting karena memuat pesan privasi.

- **Aksi 1**: kursor mengeklik **Bagikan** di bilah editor. Tombol ini sedang diaktifkan di aplikasi (lihat bagian 8). **Render video menunggu perubahan itu masuk**, supaya yang tampil adalah perilaku yang benar-benar ada.
- **Transisi**: halaman **Tulis postingan** terbuka dengan dokumen "Yang Ditunggu Nenek di Bawah Jambu Air" sudah terpilih, langsung di `BlockChoices`, belum ada paragraf yang dicentang.
- **Aksi 2** (`BlockChoices`): kursor mencentang **satu** paragraf, yaitu paragraf pertama. Paragraf lain tetap tidak dicentang, dan itu harus terlihat jelas.
- **Aksi 3** (`SettingsPanel`): kursor memilih visibilitas **Publik**. Tampilkan dulu keadaan **tanpa pilihan**, karena visibilitas memang tidak punya nilai bawaan.
- **Kamera**: berhenti ±1,5 dtk pada pesan yang tidak bisa ditutup: "Yang menjadi publik hanya teks ini. Dokumenmu di Studio tetap pribadi…". **Ini frame poster.**
- **Aksi 4**: klik **Terbitkan** di `ComposeBar`.

### Adegan 4 · Muncul di Jelajahi (19,5–25,0 dtk)

- **Transisi**: navigasi ke `/jelajahi`, chip kategori di atas, dan masonry tiga kolom.
- **Perubahan di layar**: `DiscoverTile` "Hujan Pertama Bulan November" oleh Rinjani Putri ada di posisi pertama, dengan waktu "baru saja" dan 0 Apresiasi. Postingan lain memakai data fixture apa adanya. Masuknya hanya memakai opasitas dan translasi 8 px, 200 ms.
- **Kamera**: mundur pelan sehingga ubin-ubin dari penulis lain ikut terlihat. Kesan yang dikejar: tulisanmu kini ada di antara penulis lain.
- **Aksi kursor**: arahkan ke ubin itu (keadaan hover), tanpa mengeklik.

### Adegan 5 · Bukunya menyusul, lalu kembali ke awal (25,0–27,0 dtk)

- **Sampul buku** `BookCover` "Yang Ditunggu Nenek di Bawah Jambu Air" karya Rinjani Putri tampil di tengah latar `subtle` selama ±1,5 dtk, sesuai judul hero "Bukunya menyusul".
- Tampilkan sebagai objek sampul saja, **tanpa UI aplikasi di sekitarnya**, karena Projects belum dibangun. Jangan sampai terbaca sebagai fitur penerbitan yang sudah siap.
- Crossfade 0,5 dtk ke frame pertama (close-up editor).

## 6. Bahan

### Komponen yang dipakai

| Adegan | Komponen | Berkas | Catatan integrasi |
|---|---|---|---|
| 1–2 | `EditorBar` | `src/features/studio/components/editor-bar.tsx` | Terima props. `menuItems` cukup diisi array kosong atau tiruan |
| 1 | `SaveIndicator` | `studio/components/save-indicator.tsx` | Punya state internal untuk popover. Kendalikan lewat props `status` per frame |
| 2 | `TargetIndicator` | `studio/components/target-indicator.tsx` | **Isian cincin memakai state dan efek internal (`justReached`), yang tidak deterministik di Remotion.** Render sebagai keadaan statis per frame, lalu animasikan cincinnya di komposisi |
| 1 | Permukaan tulis | `studio/components/editor-canvas.tsx` | **Jangan jalankan Tiptap.** Render HTML statis dengan class permukaan tulis yang sama |
| 2 | `StreakCalendar`, `TodaySection` | `studio/components/streak/` | `today` diisi tanggal tetap. `StreakCalendar` punya state internal (bulan, hari terpilih); cukup render keadaan awalnya |
| 3 | `BlockChoices` | `community/components/compose/source-picker.tsx` | Terima props |
| 5 | `BookCover` | `src/components/ui/book-cover.tsx` | — |
| 3 | `SettingsPanel`, `WordCounter`, `ComposeBar` | `community/components/compose/` | `SettingsPanel` butuh `state` dan `dispatch`. Bentuk `ComposeState` per frame dari `compose-state.ts`, dengan `dispatch` kosong |
| 4 | `DiscoverTile`, `AuthorLine` | `community/components/discover/discover-tile.tsx` | Memakai `next/link`, jadi perlu stub |
| 4 | Chip kategori | `src/components/ui/chip.tsx`, `community/categories.ts` | — |
| Semua | `TopBar`/sidebar app-shell | `src/features/app-shell/` | Memakai `usePathname`. Stub-nya mengembalikan rute adegan |
| Semua | `VisibilityTag`, `Button`, `Avatar`, `BookCover` | `src/components/ui/` | `Button` memakai `next/link`, jadi perlu stub |

**Jangan dipakai langsung**: `studio-editor.tsx`, `streak-view.tsx`, `compose-view.tsx`, `discover-view.tsx`, `home-view.tsx`. Kelimanya memuat data sendiri dari IndexedDB atau localStorage. Susun ulang layarnya dari komponen anak di tabel di atas.

### Gaya, font, ikon

- **Token dan Tailwind**: impor `src/app/globals.css` (Tailwind v4, `@import "tailwindcss"`), lalu tambahkan `@source` yang menunjuk ke `src/` RanahMenulis. Jangan menambah warna di luar token.
- **Font**: Schibsted Grotesk (sans) dan Source Serif 4 (tulisan) lewat `@remotion/google-fonts`, dipasang ke variabel `--font-schibsted` dan `--font-source-serif`.
- **Ikon**: `@phosphor-icons/react`, sudah dipakai komponen. Pastikan versinya sama dengan repo ini.
- **Kursor**: SVG panah sistem dan tangan (pointer saat di atas tombol), ukuran 1:1 terhadap viewport 1280×800. Klik ditandai dengan kursor mengecil 0,9× selama 80 ms, tanpa riak warna.

### Aturan gerak (DESIGN.md 4.6)

- Gerak di dalam UI memakai durasi aplikasi: 120 ms (hover, tekan), 200 ms (buka panel, menu, dialog), 300 ms (cincin target).
- Hanya opasitas dan transform. Tidak ada parallax atau animasi masuk yang dekoratif.
- **Gerak kamera** adalah satu-satunya pengecualian, karena itu bahasa video, bukan UI. Pakai ease-in-out yang lembut, 0,8–1,5 dtk per perpindahan, dan motion blur hanya saat kamera bergerak.
- Matikan semua CSS `transition` di root komposisi. Hitung semua gerak dari frame (`interpolate`/`spring`).

### Pengaturan proyek Remotion

1. Alias webpack:
   - `@` diarahkan ke `D:/Code/Ranah Penulis/src`.
   - `next/link`, `next/navigation`, dan `next/font/*` diganti stub.
   - `react` dan `react-dom` dipaksa ke `node_modules` proyek video, supaya tidak ada dua salinan React.
2. `@remotion/tailwind-v4` untuk CSS.
3. Satu komposisi dengan props `theme` (`light`/`dark`) dan `aspect` (`16:10`/`4:5`). Dari situ keluar empat render.
4. Path absolut ke `D:` hanya berlaku di laptop ini. Kalau proyek dipindah, salin snapshot `src/`.

## 7. Pemeriksaan sebelum diserahkan

- [ ] Semua teks UI terbaca jelas pada lebar landing 1296 px (desktop) dan 360 px (versi 4:5).
- [ ] Tidak ada fitur yang tampil sebagai sudah ada padahal belum dibangun (Projects, pembayaran, tombol yang masih nonaktif).
- [ ] Visibilitas pernah tampil tanpa pilihan sebelum Publik dipilih.
- [ ] Pesan privasi terbaca minimal 1,5 dtk.
- [ ] Loop tidak meloncat.
- [ ] Mode gelap memakai token gelap, bukan sekadar warna dibalik.
- [ ] Ukuran file di bawah 3 MB per versi. Poster tersedia.

## 8. Keputusan (15 November 2026)

1. **Versi ponsel 4:5: dibuat.**
2. **Sekilas tab Streak: ditampilkan** di adegan 2.
3. **Tombol "Bagikan" di editor: diaktifkan di aplikasi** sebelum video dirender. Perubahan aplikasinya punya rencana tersendiri.
4. **Penutup sampul buku: dipakai**, sebagai objek sampul tanpa UI Projects.
5. **Pemangkasan teks landing tidak dimintakan persetujuan client sekarang.** Client belum melihat landing; ia melihat hasil jadinya sekaligus.
