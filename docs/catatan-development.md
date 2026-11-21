# Catatan Development RanahMenulis

Sumber status terkini. **Wajib dibaca di awal setiap permintaan, sebelum menyentuh apa pun.** Jangan menebak posisi proyek: kalau yang dicari tidak ada di sini, baca [Catatan Slicing](desain/Catatan%20Slicing.md) (arsip fase slicing) atau tanyakan. Perbarui berkas ini di akhir setiap sesi yang mengubah status.

Terakhir diperbarui: **21 November 2026**.

## 1. Posisi sekarang

- **Fase:** slicing selesai (semua layar MVP dibangun dengan data dummy dan lokal, tersimpan di peramban). Berikutnya fase backend. Belum ada backend: login di-bypass, data tidak dibagikan antar pengguna.
- **Produksi:** `https://ranah-menulis.vercel.app`. Branch `main`, sinkron dengan `origin/main` (commit kode terakhir `e3a0a68`).
- **Gate terakhir (21 November 2026):** `npm run check` lulus (223 berkas, 1.846 tes) dan `npm run build` berhasil.
- **Perombakan UI "semua layar sama" (21 November 2026), di lokal, belum di-push (user minta tes lokal dulu):** fase 0–4 semua sudah di-commit (`2e96360`, `50ba82f`, `4271ef9`, `5e0db25`, `9910aa8`: sampul Projects, hero Streak dan Statistik, pita Beranda, penanda halaman Dokumen, keadaan kosong bergambar, jangkar Event, Grup, Profil, Notifikasi). Tes penuh belum dijalankan sejak fase 3.
- **Fase 5 (21 November 2026):** pita peran Kelola (Editor, Juri, Mentor, Organizer, Admin, dan ringkasan `/kelola`), DESIGN.md 7.8. Di-commit lokal, belum di-push. Gate: `npm run check` lulus (234 berkas, 1.900 tes) dan `npm run build` berhasil.
- **Fase 6 (21 November 2026):** gerak tambahan dari `find-animation-opportunities` (DESIGN.md 7.9), di-commit lokal, belum di-push.
- **Layar akun (21 November 2026):** dipoles dengan pelat kertas marmer, lihat Log sesi.
- **Poles alur Projects dan dasbor (21 November 2026):** kepala kecil `ProjectStrip` di langkah alur dan pita `DashboardBand` di dasbor Kelas dan Solo (Backlog 0a butir 1 dan 2), di-commit lokal, belum di-push. Gate: `npm run check` lulus (241 berkas, 1.921 tes); `npm run build` belum dijalankan (server dev memakai `.next` yang sama).
- **Berikutnya:** uji klik dan keyboard sungguhan di semua layar yang diubah 21 November 2026, perangkat ponsel fisik oleh user, lalu push setelah user setuju. Pengaturan akun (0a butir 3) juga selesai.
- **Hook git:** `pre-commit` = lint-staged; `pre-push` = `typecheck` saja. Tes penuh lewat `npm run check` dan CI.
- **Saklar demo peran:** `NEXT_PUBLIC_DEMO_ROLES=1` aktif di Vercel Production, jadi `?sebagai=` (tamu dan peran kelola) berlaku di produksi. **Wajib dihapus bersama bypass login saat auth sungguhan masuk.**
- **Panduan uji:** `docs/panduan-uji-pengguna.md` (juga `.html`, `.pdf`), versi web `/panduan-uji.html`, berkas contoh `/contoh-naskah.txt` dan `.pdf`. Diuji di Vercel lewat Chrome CDP pada 21 November 2026. Perbarui panduan bila alur atau nama tombol berubah.

## 2. Sudah selesai (ringkas)

Landing; Beranda; Studio (Dokumen, Editor, Streak, Statistik, riwayat versi, target, sprint, pencarian, arsip, jenis dan tag); Community (rename dari Jelajahi, detail artikel, Tulis postingan, unggah gambar); Grup; Event umum; Projects semua kategori (daftar, QRIS contoh, kirim karya, revisi, dasbor Kelas dan Solo, hasil Lomba, batal daftar, kelas berjalan, testimoni); Profil; Tersimpan dan Notifikasi (termasuk preferensi dan notifikasi pengelola); Akun dan Pengaturan (tanpa backend); semua area Kelola (Editor, Mentor, Organizer, Juri, Admin: pengguna, moderasi, audit, kurasi, pengaturan, grup). Rincian per fitur ada di CLAUDE.md dan Catatan Slicing.

## 3. Backlog dekat (belum dikerjakan)

0. **Lanjutan perombakan UI** (rencana disetujui 21 November 2026, monokrom tetap, gerak tidak dibatasi): fase 4a sampai 6 dan pelonggaran (hati, tekan tombol) selesai lokal; berikutnya uji ponsel (termasuk keputusan bilah navigasi yang bersembunyi di halaman baca), mode gelap, dan klik/keyboard sungguhan untuk semua layar yang diubah, lalu push setelah user setuju. Fase 3 selesai (Beranda dan Dokumen dikerjakan 21 November 2026, belum di-commit). Gerak, hover, dan keyboard belum diuji dengan klik sungguhan.
0a. **Poles layar yang tertinggal** (audit 21 November 2026). Butir 1, 2, dan 3 **selesai** 21 November 2026 (lihat Log sesi). Catatan asli:
    1. **Alur Projects** (satu paket): Daftar (`register-view`), Kirim karya (`submit-view`), Revisi (`revise-view`), Bayar (`payment-view`), dan halaman Tugas Kelas (`kelas/components/assignment-view`) polos (tautan kembali, judul, kotak info, formulir). Beri kepala kecil berisi `ProjectCover` ukuran kecil, kategori, dan judul proyek, memakai komponen yang ada; layar sebelumnya (detail) dan sesudahnya (`MilestoneHero`) sudah berjangkar.
    2. **Dasbor Kelas** (`kelas/components/class-dashboard.tsx`) dan **dasbor Solo** (`solo/components/solo-dashboard.tsx`): tanpa sampul atau pita sama sekali (grep 0). Usul pita gelap `app-band` berisi sampul dan angka bergulung (progres kelas, tahap Solo yang berjalan). Belum pernah dilihat di peramban karena butuh pendaftaran: isi data localStorage dulu (pendaftaran `terdaftar` untuk `kelas-cerpen-untuk-pemula` dan `solo-penerbitan-buku-sendiri`, serta kiriman Solo Diterima) agar bisa dipotret. Layar detail kiriman dan Tugas juga belum pernah dilihat.
    3. **Pengaturan akun** (selesai; prioritas rendah, opsional): formulir panjang tanpa kepala; usul kepala foto besar, nama serif, username seperti kepala profil.
    - **Sengaja polos, jangan dipoles:** Editor Studio, Tulis postingan, layar dalam Kelola (tinjauan, detail kelas, form skor, detail Organizer, Buat event, Buat proyek).
    - Setelah itu: uji klik dan keyboard sungguhan di semua layar yang diubah 21 November 2026, perangkat ponsel fisik, lalu `npm run check` dan `npm run build` sebelum push (tes penuh belum dijalankan sejak commit `8d4ef34`; ada satu tes rapuh `studio-search-dialog.test.tsx` saat seluruh tes berjalan bersamaan).
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

### 21 November 2026 (poles alur Projects dan dasbor, Backlog 0a)
- Rencana disetujui user, ikut semua rekomendasi: bilah progres Kelas pindah ke dalam pita, detail kiriman ikut diberi kepala kecil, Pengaturan akun ditunda.
- `ProjectStrip` (sampul 48px, kategori, judul) di Daftar, Bayar menunggu dan kedaluwarsa, Kirim karya, Kirim revisi, detail kiriman (judul menaut ke proyek), Tugas Kelas, dan layar blokir Daftar, Kirim, dasbor Kelas, dasbor Solo (strip menjadi h1). Judul layar dipendekkan: "Daftar", "Kirim karya". Layar `MilestoneHero` tidak berubah.
- `DashboardBand` + `BandFigure`: Kelas = persen bergulung, bilah `progressbar`, mentor; Solo = "N/M" tahap (`stagePosition`, `soloFigure`) atau status dalam kata sebelum diterima. Perilaku, validasi, dan alur formulir tidak berubah.
- Tes baru: `project-strip.test.tsx`, `dashboard-band.test.tsx`, `solo/solo-figure.test.ts`; `register-view` dan `submit-view` disesuaikan dengan judul baru.
- Verifikasi CDP dengan data uji yang diisi lewat skrip (pendaftaran di localStorage, kiriman Solo Diterima dan Antologi Perlu Revisi di IndexedDB, baris tahap Solo): desktop terang dan gelap, ponsel 390 terang dan gelap, tidak ada halaman melebar. Pelajaran: di Git Bash argumen `/projects/...` diubah jadi path Windows; jalankan skrip dengan `MSYS_NO_PATHCONV=1`.
- Lanjutan atas permintaan user: kepala Pengaturan (`SettingsHead`: avatar 88, nama serif, @username tersimpan), tes `settings-head.test.tsx`; tes akun 14 berkas lulus; CDP desktop terang, ponsel terang dan gelap. Avatar kini tampil dua kali (kepala dan isian foto tepat di bawahnya), dibiarkan karena isian foto bagian formulir.
- Belum: klik dan keyboard sungguhan, ponsel fisik, `npm run build`.

### 21 November 2026 (layar akun dipoles)
- User: Masuk dan Daftar masih polos. Keputusan (ikut rekomendasi): dua kolom berpelat foto, dua gambar (Masuk/Daftar dan pemulihan/verifikasi/Mulai), kalimat serif ditulis sendiri.
- Dikerjakan: kertas marmer dari moodboard (a109 1869 dan a108 c. 1880, berwarna asli, belum dipakai di tempat lain) di `public/auth/`; `auth-art.ts`, `auth-plate.tsx`; `AuthFrame` dua kolom dari lg dengan panel `app-band` lengket, strip 140px di bawah lg; `AuthPage` naik bertahap dan `celebrate` (cincin tinta di Verifikasi berhasil); kamus `account.plate` id dan en. Gambar dekoratif (`alt=""`), seperti EmptyPlate.
- Verifikasi: tes akun dan i18n (16 berkas) dan related (20 berkas) lulus, termasuk `auth-art.test.ts` dan `auth-frame.test.tsx` baru; CDP desktop terang dan gelap, ponsel 390 terang dan gelap tanpa halaman melebar, cincin terlihat di tengah animasi.

### 21 November 2026 (uji ponsel dan mode gelap)
- Sapuan otomatis 20 layar yang diubah hari ini di 390×844, terang dan gelap, lewat CDP (`Emulation.setDeviceMetricsOverride` mobile + sentuh), dengan pemeriksa elemen yang melewati tepi kanan, dan lembar kontak `sharp` untuk ditinjau.
- **Bug ditemukan dan diperbaiki** (sudah ada sejak `b9aba29`): menu ⋯ komentar dibungkus `scale-90`, sehingga lembar bawahnya di ponsel terjepit jadi strip 40px di tepi kanan (transform menjadi acuan posisi elemen `fixed`) dan halaman postingan melebar 2px. Skala kini hanya pada tombol pemicu (`[&>button]:scale-90`). Pelajaran: jangan memasang `transform` pada pembungkus `Menu`, `Dialog`, atau `Drawer`.
- Bilah aksi ponsel di halaman postingan: Bagikan dan Simpan kini hanya ikon dengan `aria-label` (sebelumnya label teks membuatnya tidak muat di 375px).
- Tidak ada temuan lain: pita gelap terbaca di mode gelap (naik satu tingkat), tombol primer berbalik, tidak ada halaman lain yang melebar. Beberapa tangkapan masih skeleton karena server dev mengompilasi; layar yang sama dicek di tema lain.
- Bilah navigasi yang bersembunyi saat gulir: rekomendasi tidak dipasang (lihat ringkasan sesi); bila user setuju, hapus dari daftar tunda.
- Belum: klik dan keyboard sungguhan, perangkat fisik.

### 21 November 2026 (sesi UI, pelonggaran setelah fase 6)
- User meminta daftar hal yang lazim di aplikasi lain tetapi dilarang di sini. Hasil sisir DESIGN.md: dua pelanggaran sendiri (eyebrow huruf kapital di pita peran fase 5; larangan "animasi masuk saat gulir" yang usang di 4.6) dan tiga kandidat pelonggaran.
- Dikerjakan (keputusan user): eyebrow pita peran menjadi huruf biasa; DESIGN 4.6 diperbarui; hati Apresiasi pop sekali saat dinyalakan (`rm-heart-pop`, 260ms, tidak saat dimatikan atau dibuka); tombol `primary`, `secondary`, `danger` mengecil ke 0,97 saat ditekan.
- Ditunda: bilah navigasi yang bersembunyi saat gulir di halaman baca ponsel (diputuskan saat uji ponsel). Menunggu client: tooltip grafik Statistik, simpan otomatis draf postingan `/tulis`. Dipertahankan: lonceng bertitik tanpa angka, item navigasi aktif tanpa pill, angka apresiasi kecil, merah bukan untuk Ditolak.
- Verifikasi: tes terarah (button, post-action-bar baru, Kelola components, related) lulus; CDP: pop hati terukur (skala 1,02 di 80ms), pita peran berlabel huruf biasa. Tes penuh belum dijalankan ulang untuk perubahan ini; wajib sebelum push.

### 21 November 2026 (sesi UI, fase 6: gerak tambahan)
- `find-animation-opportunities` atas seluruh aplikasi (tanpa landing): kesimpulannya gerak sudah hampir pas; lima usulan disetujui user dan dikerjakan (DESIGN.md 7.9): titik `GroupSeal` dari pusatnya, PublishDone naik bertahap, pemenang lomba dari juara terakhir ke juara 1, titik tahap Solo, `<details>` materi kelas dan Bantuan Studio membuka halus (`.rm-details`).
- Ditolak (terlalu sering atau data): pop Apresiasi/Simpan, skala tekan `Button` (bertentangan dengan DESIGN 4.6), animasi ulang grafik, Ctrl+K, tab, chip, indikator simpan.
- Verifikasi: tes terarah 12 berkas lulus + `winner-step.test.ts`; CDP: urutan jeda pemenang 144/90/0 ms, `<details>` 24 → 184 (100 ms) → 224 px, tangkapan layar hasil lomba dan Grup.
- Gate penuh: `npm run check` 1.901 dari 1.902 tes lulus; satu gagal di `studio-search-dialog.test.tsx` (berkas tidak disentuh) dan lulus 3/3 saat dijalankan sendiri, jadi rapuh di bawah beban (catat bersama tes Event yang sama polanya). Build tidak dijalankan ulang (hanya CSS dan komponen, tanpa rute).

### 21 November 2026 (sesi UI, fase 5: Kelola sebagai dunia lain)
- Keputusan user: pita hanya di layar utama area dan ringkasan (layar dalam tetap), angka Admin = kasus moderasi Baru, penanda SVG tipografis (bukan foto).
- Dikerjakan: `kelola/role-band.ts` (murni), `RoleBand`/`RoleBandLink`, lima `RoleMark` SVG, `use-band-work.ts`, `editor/use-editor-queue.ts` (diekstrak dari `QueueView`), `AdminBand` di layout Admin (akar tab saja). Ringkasan `/kelola` jadi grid pita per peran. Tombol sekunder "Kelola Event" Organizer menjadi tautan di pita; "Buat proyek" tetap satu-satunya tombol terisi.
- Angka Juri hanya menghitung lomba yang penilaiannya dibuka (karya di lomba belum dibuka tidak bisa dinilai).
- Verifikasi: tes baru `tests/features/kelola/role-band.test.ts`, `components/role-band.test.tsx`, `components/kelola-overview.test.tsx`; tes Kelola 27 berkas lulus sebelum tes baru; tangkapan layar CDP desktop terang (enam layar), gelap (ringkasan, Juri), ponsel 390 (Mentor, ringkasan). Peran dev Admin adalah `administrator`, bukan `admin`. Belum: klik dan keyboard sungguhan.
- Gate penuh: `npm run check` lulus (234 berkas, 1.900 tes) dan `npm run build` berhasil.

### 21 November 2026 (akhir sesi UI: cara melanjutkan)
- Fase 4a dan 4b sudah di-commit (`5e0db25`, `9910aa8`). Commit 4a yang dijalankan user menggantung di terminal IDE dan memegang `.git/index.lock`; dengan izin user prosesnya dihentikan dan kuncinya dihapus. Gambar kosong untuk Grup, Event, dan Notifikasi ikut commit 4b karena berkasnya memuat perubahan kedua fase.
- Gate sebelum push: `npm run check` (tes penuh belum dijalankan sejak fase 3) dan `npm run build`.
- Berikutnya: fase 5 (Kelola sebagai dunia lain, pita kepala per peran), fase 6 (`find-animation-opportunities`), lalu uji ponsel, mode gelap, dan klik/keyboard sungguhan untuk semua layar yang diubah hari ini.

### 21 November 2026 (sesi UI, fase 4b)
- Event: lembar kalender (bulan, tanggal serif, hari; zona event) di daftar dan pita kepala detail dengan target bergulung dan hitung mundur bergaris. Daftar event jadi baris, bukan kartu.
- Grup: segel monogram (huruf awal, titik per anggota, nada dari id) di daftar dan pita kepala detail dengan jumlah anggota bergulung.
- Profil: nama serif 34/48px, tiga angka bergulung (karya, pengikut, mengikuti).
- Notifikasi: dikelompokkan Hari ini, Kemarin, Minggu ini, Lebih lama. Temuan: memecah jadi beberapa `<ul>` membuat baris dipasang ulang saat sumber lain dimuat sehingga klik hilang (3 tes `management-inbox` gagal); diperbaiki dengan satu daftar dan judul hari `role="presentation"`.
- Verifikasi: tes terarah Event, Grup, Notifikasi, Profil, Beranda lulus (satu tes `group-view` sempat gagal saat berjalan bersama lalu lulus sendiri); tangkapan layar desktop terang enam layar. Belum: ponsel, mode gelap, klik dan keyboard sungguhan, tes penuh. Belum di-commit. Saat sesi ini ada `.git/index.lock` dari proses lain (tidak disentuh).

### 21 November 2026 (sesi UI, fase 4a)
- Keputusan user: gambar kosong **tidak boleh duplikat** dengan landing atau Community, diambil dari moodboard (`claude.ai/artifact/28b43Y3jyRYYq9fXDfStBV`), dan **berwarna asli** (tidak diabu-abukan, agar tidak monoton).
- Dikerjakan: `EmptyState art` + `EmptyPlate`, `lib/empty-art.ts` (sumber tiap gambar), `public/empty/` delapan WebP 16–114 KB (maks. 560px). Dipasang di Dokumen (tingkat teratas), Beranda belum mengikuti, Tersimpan, Notifikasi, Proyek saya, Grup saya, Event, karya profil. Filter, Sampah, Arsip, dan Kelola tetap teks.
- Rencana 4b (belum dikerjakan): pita kepala detail grup dan event, monogram atau blok tanggal di katalog, angka besar di profil, notifikasi per hari.
- Verifikasi: tes terarah 137 lulus; tangkapan layar Dokumen dan Tersimpan kosong. Belum di-commit (fase 3 juga belum).

### 21 November 2026 (sesi UI, Beranda dan Dokumen)
- Daftar Dokumen: ikon diganti penanda halaman per jenis dokumen yang terisi menurut jumlah kata (`document-mark.ts`, `DocumentMark`, `FolderMark`); baris naik bertahap, garis tergores, hover mengangkat lembar.
- Beranda: kartu Hari ini menjadi pita gelap (halaman dokumen + cincin `TodayRing` yang diekstrak dari hero Streak); Progres kolom kanan jadi angka streak bergulung; Proyek saya bersampul kecil.
- Verifikasi: tangkapan layar Chrome headless (Dokumen dengan enam jenis, Beranda terang 1366). Belum: ponsel, mode gelap, klik dan keyboard sungguhan. Belum di-commit.

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
