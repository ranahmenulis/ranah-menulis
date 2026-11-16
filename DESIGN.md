# RanahMenulis — Sistem Desain

> Hitam putih, netral, terasa seperti membaca, bukan seperti dasbor.

**Status:** draf v0.2 (14 November 2026), sudah memuat referensi Medium dan Substack dari client. Bagian berlabel **Usulan** belum disetujui client dan boleh direvisi setelah ditinjau.
**Pembaca:** desainer, Claude Design, dan developer yang membangun UI di Next.js + Tailwind v4.
**Sumber:** keputusan client di WhatsApp, [Brief Desain](docs/Brief%20Desain%20RanahMenulis.md), PRD v0.2. Referensi Medium mentah (hanya halaman depan) ada di [docs/referensi/](docs/referensi/medium-homepage-style-reference.md).

---

## 1. Keputusan arah

| Keputusan | Asal | Tafsiran untuk desain |
| --- | --- | --- |
| "Hitam putih juga go, biar netral" | Client | Palet monokrom netral. Tidak ada warna merek. Latar **putih**, bukan krem: "netral" berarti tanpa nuansa hangat atau dingin. Abu-abu memakai abu murni (tanpa semburat biru seperti `zinc`/`slate`). |
| "Mungkin deket-deket Medium" | Client | Yang dijadikan acuan adalah **aplikasi Medium setelah masuk** (halaman artikel, feed, editor, profil, Library, notifikasi, statistik), bukan halaman depan pemasarannya yang berwarna krem. "Deket-deket" berarti mengikuti pola dan rasanya, bukan menyalin. |
| "Gapapa bang pake tombol merah" | Client, 14 Nov 2026 | Merah **final** untuk galat dan tindakan berbahaya. Semua status lain tetap monokrom (bagian 4.1). |
| Foto referensi Wafi: aplikasi Substack di ponsel, mode gelap | Client | Yang diambil adalah **pola ponselnya**: deretan penulis yang diikuti di atas feed, campuran karya panjang dan catatan pendek, bilah aksi di bawah tiap butir, tombol Tulis bulat, bilah bawah lima tab. Warna oranye, judul di atas gambar bergradien, dan bilah bawah berefek kaca **tidak** diambil, karena bertentangan dengan keputusan hitam putih (bagian 2.1). |
| Mode gelap | Wajib di MVP | Setiap token punya pasangan gelap. Ikut preferensi sistem, bisa diganti manual. |
| Anti-slop | Tim | Tampilan tidak boleh terasa seperti template buatan AI. Lihat bagian 9. |

## 2. Apa yang diambil dari Medium

Medium dipakai karena satu hal: **ia membuat tulisan menjadi pusat layar**. Itu yang kita ambil. Identitasnya (logo, ikon, hijau tombol Publish, tata letak persis) tidak diambil.

| Bagian Medium | Diambil | Diubah untuk Ranah |
| --- | --- | --- |
| Halaman artikel | Kolom baca tunggal ±680px, teks serif besar, baris penulis di bawah judul, bilah aksi bergaris atas-bawah, pemisah adegan tiga titik, komentar di laci samping | Judul karya serif (Medium memakai sans tebal); dukungan puisi (baris dijaga); penanda visibilitas; tidak ada paywall dan bintang member |
| Feed beranda | Daftar dipisah garis tipis, bukan kartu; baris "di [grup] oleh [penulis] · tanggal"; judul + cuplikan; meta berikon di kiri dan aksi (simpan, ⋯) di kanan; thumbnail 3:2 di kanan; tab bergaris bawah; kolom kanan (pilihan editor, sedang ramai, topik berchip +, penulis untuk diikuti, tautan footer kecil) | Blok "Hari ini" di atas feed (Brief 4A); thumbnail hanya bila karya punya gambar; judul dan cuplikan memakai serif karena yang dijual adalah suara tulisan (Medium memakai sans tebal) |
| Sidebar kiri | Beranda, Library, Profil, Stories, Stats, lalu garis dan daftar "Following" | Beranda, Studio (Streak sebagai sub-butir di bawahnya), Projects, Tersimpan, Profil, lalu garis, Kelola/Admin, lalu daftar Grup saya |
| Editor | Kanvas kosong, bilah format tetap di bawah bilah editor (pil bergaris), status "Tersimpan" berupa teks abu di bilah atas | Indikator simpan tiga keadaan; jumlah kata selalu terlihat; mode fokus; menu Kirim ke proyek; drawer kit inspirasi |
| Daftar cerita (Stories) | Tab Draf/Terbit, baris berisi judul dan meta, menu ⋯ | Folder, penanda "Dibagikan" dan "Dikirim ke proyek" |
| Profil | Dua kolom di desktop: karya di kiri, identitas di kanan | Genre, negara, portofolio proyek; streak hanya bila penulis memilih |
| Library | Daftar tersimpan | Disebut "Tersimpan" |
| Notifikasi | Daftar sederhana, tab Semua/Komentar | Butir status proyek dan pembayaran |
| Statistik | Angka besar dan grafik batang monokrom | Kata per hari, streak, milestone |
| Bilah atas | Logo kiri, pencarian, "Tulis", lonceng, avatar | Navigasi PRD: sidebar desktop, rail tablet, bilah bawah ponsel |

### 2.1 Dari referensi Substack (ponsel, Explore, halaman catatan)

| Bagian Substack | Diambil | Diubah untuk Ranah |
| --- | --- | --- |
| Deretan publikasi di atas feed | Deretan avatar penulis/grup yang diikuti, bisa digulir mendatar, dengan titik penanda karya baru, butir terakhir "+ Temukan" | Avatar lingkaran (bukan kotak membulat); titik penanda `ink`, bukan oranye; hanya di ponsel |
| Dua jenis butir feed | Tulisan panjang dengan judul, dan catatan pendek yang teksnya langsung terbaca | Postingan Community (maks. 500 kata) tampil seperti catatan: teks serif langsung, dipotong 8 baris |
| Bilah aksi per butir | Suka, komentar, bagikan ulang, bagikan, simpan | Apresiasi, Komentar, Bagikan, Simpan. Tanpa "bagikan ulang" (tidak ada di PRD) |
| Tombol tulis bulat | Tombol + di kanan bawah | Lingkaran `ink` 56px dengan ikon pena, hanya di Beranda dan Studio |
| Bilah bawah lima tab | Ikon + label | Bilah solid `canvas` bergaris atas, bukan kapsul kaca mengambang |
| Gambar dengan judul di atasnya | — | **Tidak diambil.** Judul selalu di luar gambar, tanpa gradien |
| Halaman Explore (grid campuran) | Baris chip kategori di atas, lalu grid tiga kolom berisi catatan pendek dan tulisan panjang bercampur; tombol "Load more" di bawah | Halaman **Discover**, bagian 6.8 |
| Halaman satu catatan dengan balasan | Satu kolom, balasan datar dipisah garis, "Show more replies", "Related notes", kolom kanan berisi pencarian dan ajakan masuk untuk tamu | Halaman postingan Community, bagian 6.9 |
| Banner oranye dan tombol "Subscribe" oranye | — | **Tidak diambil.** Tidak ada banner promosi dan tidak ada warna aksen |

Hal yang **tidak** ada di Medium dan harus kita rancang sendiri: dasbor Streak, Projects (detail, pendaftaran, QRIS, kirim karya, 8 status), panel juri, dan halaman pengelola. Untuk itu berlaku bagian 6.

## 3. Prinsip

1. **Tulisan adalah antarmukanya.** Setiap layar menonjolkan teks karya. Kotak, ikon, dan hiasan harus membuktikan diri dulu sebelum dipakai.
2. **Hitam memberi tahu yang penting.** Karena tidak ada warna, ketebalan dan isian hitam adalah satu-satunya alat penekanan. Pakai seperlunya: satu tombol terisi per layar.
3. **Garis, bukan kotak.** Pemisahan dibuat dengan garis tipis dan ruang kosong. Tidak ada kartu bertumpuk dan bayangan pada permukaan diam.
4. **Dua kepadatan, satu keluarga.** Dunia penulis lapang dan tenang; dunia pengelola padat dan cepat dipindai. Token sama, jaraknya berbeda.
5. **Penulis selalu tahu siapa yang bisa melihat karyanya.** Penanda visibilitas tidak pernah tersembunyi.

## 4. Token

### 4.1 Warna

Semua nilai sudah dicek kontrasnya (WCAG 2.1). Rasio di kolom terakhir adalah terhadap `canvas`.

| Token | Terang | Gelap | Peran | Kontras (terang / gelap) |
| --- | --- | --- | --- | --- |
| `canvas` | `#ffffff` | `#121212` | Latar halaman | — |
| `surface` | `#ffffff` | `#1a1a1a` | Lapisan mengambang: dialog, menu, laci, toast. Di mode terang dipisah dengan garis + bayangan | — |
| `subtle` | `#f3f3f3` | `#232323` | Hover baris, chip, skeleton, kolom pencarian, blok kode | — |
| `ink` | `#191919` | `#ededed` | Teks utama, tombol terisi, garis tegas | 17.6 / 16.0 |
| `ink-muted` | `#5e5e5e` | `#a3a3a3` | Meta, keterangan, ikon tidak aktif, cuplikan | 6.5 / 7.4 |
| `ink-faint` | `#767676` | `#8c8c8c` | Placeholder, teks nonaktif | 4.5 / 5.6 |
| `line` | `#e6e6e6` | `#2e2e2e` | Garis pemisah, border input diam | dekoratif |
| `line-strong` | `#191919` | `#ededed` | Border input fokus, tab aktif, garis kutipan | — |
| `on-ink` | `#ffffff` | `#121212` | Teks di atas tombol terisi | 17.6 / 16.0 |
| `danger` | `#b3261e` | `#ff8f87` | Pesan galat, border field galat, tombol hapus permanen | 6.5 / 8.5 |
| `danger-subtle` | `#fbeeed` | `#2a1716` | Latar banner galat | — |

**Aturan merah (disetujui client):**
- Boleh: pesan galat form, banner gagal memuat, tombol dan konfirmasi tindakan yang tidak bisa dibatalkan (hapus permanen, tarik karya, cabut role), pembayaran ditolak (karena pengguna harus bertindak).
- Tidak boleh: status submission "Ditolak" (itu keputusan, bukan galat), "Belum tersinkron" (sementara dan tidak boleh membuat panik), angka, grafik, notifikasi, hiasan.
- Merah tidak pernah menjadi satu-satunya penanda. Selalu ada ikon dan teks.

### 4.2 Tipografi

**Keputusan client (brief font, 15 November 2026):** Inter untuk antarmuka, Merriweather untuk tulisan. Berlaku untuk aplikasi dan landing. Menggantikan usulan sebelumnya (Schibsted Grotesk dan Source Serif 4). Keduanya dari Google Fonts lewat `next/font`, variable font dengan sumbu optical size aktif.

| Peran | Huruf | Bobot (brief client) |
| --- | --- | --- |
| App Heading (judul halaman, hero landing) | **Inter** | Bold 700 |
| Section Heading (judul bagian) | **Inter** | SemiBold 600 |
| Body Text (teks antarmuka) | **Inter** | Regular 400 |
| Navigation | **Inter** | Medium 500 (aktif dan tidak aktif sama; aktif dibedakan warna `ink` dan ikon terisi) |
| Button | **Inter** | SemiBold 600 |
| Writing Editor | **Merriweather** | Regular 400 |
| Article Preview (teks karya di halaman baca, feed, Jelajahi) | **Merriweather** | Regular 400 |
| Quote (blockquote) | **Merriweather** | Italic 400 |

Brief tidak mengatur judul karya dan angka besar; keduanya tetap serif (Merriweather 600 untuk judul karya, 400 untuk `figure`). Merriweather punya tinggi huruf kecil yang lebih besar (±0,55 em) dan lebih lebar daripada Source Serif 4, jadi ukuran serif di skala bacaan diturunkan 1–2px agar kolom 680px tetap ±65–75 karakter per baris.

**Skala antarmuka (sans):**

| Token | Ukuran / jarak baris | Bobot | Dipakai untuk |
| --- | --- | --- | --- |
| `text-xs` | 13 / 18 | 400 | Meta, keterangan gambar, label kecil |
| `text-sm` | 14 / 20 | 400–500 | UI sekunder, tabel, tombol, tab |
| `text-base` | 16 / 24 | 400 | UI utama, form |
| `heading-sm` | 16 / 24 | 600 | Judul blok kecil |
| `heading-md` | 20 / 28 | 600 | Judul bagian |
| `heading-lg` | 28 / 34 (ponsel 24 / 30), tracking −0.015em | 700 | Judul halaman aplikasi ("Proyek saya") |

**Skala bacaan (serif):**

| Token | Desktop | Ponsel | Bobot | Dipakai untuk |
| --- | --- | --- | --- | --- |
| `read-body` | 18 / 30 | 16 / 28 | 400 | Teks karya, editor |
| `read-title` | 36 / 46, tracking −0.01em | 28 / 36 | 600 | Judul karya di halaman baca dan editor |
| `read-subtitle` | 20 / 30 | 18 / 28 | 400, `ink-muted` | Subjudul karya |
| `read-h2` | 23 / 32 | 20 / 28 | 600 | Subjudul di dalam karya |
| `feed-title` | 20 / 28 | 16 / 24 | 600 | Judul di feed dan daftar |
| `feed-excerpt` | 15 / 24 | 14 / 22 | 400, `ink-muted` | Cuplikan di feed |
| `figure` | 52 / 1.0 | 40 / 1.0 | 400, angka lining tabular | Angka streak, statistik |

**Skala landing (sans, Inter):** `display` `clamp(40px, 8vw, 88px)` / 1.02, tracking −0.035em, 700 (hero); `landing-h2` 40 / 48 (ponsel 28 / 36), tracking −0.025em, 600 (judul bagian).

Aturan:
- Lebar kolom baca maksimal **680px** (±65–72 karakter).
- Jarak antarparagraf karya `1.4em`. Tidak ada indentasi baris pertama, tidak ada rata kanan-kiri.
- Puisi: baris dan baris kosong dijaga (`white-space: pre-wrap`).
- Semua angka yang dibandingkan (jumlah kata, biaya, kuota, tanggal di tabel) memakai `font-variant-numeric: tabular-nums`.
- Bobot 700 hanya untuk App Heading (`heading-lg`, `display`); di tempat lain paling tebal 600. Italic hanya dari isi karya dan kutipan.

### 4.3 Spasi

Satuan dasar **4px**. Skala: 4, 8, 12, 16, 24, 32, 48, 64, 96.

| Konteks | Dunia penulis | Dunia pengelola |
| --- | --- | --- |
| Jarak antarbaris daftar | 24–32 | 12–16 |
| Tinggi baris tabel | — | 44 |
| Padding halaman (ponsel) | 16 | 16 |
| Padding halaman (desktop) | 24–48 | 24 |
| Jarak antarbagian | 48–64 | 32 |

### 4.4 Bentuk

Hanya **dua nilai radius**, warisan Medium:
- `radius-full` (9999px): tombol, chip, avatar, kolom pencarian, toolbar format.
- `0`: semua yang lain — input, dialog, laci, menu, gambar, tabel, toast, sampul.

Ini yang membuat Ranah langsung berbeda dari tampilan shadcn bawaan yang membulatkan semuanya `rounded-md`.

### 4.5 Garis dan kedalaman

- Pemisah: 1px `line`. Tidak ada garis ganda dan tidak ada kotak di dalam kotak lebih dari dua tingkat.
- Permukaan diam (feed, halaman, tabel) **tidak** berbayangan.
- Hanya lapisan mengambang yang berbayangan, satu token: `0 2px 12px rgb(0 0 0 / 0.08)` + border 1px `line`. Di mode gelap bayangan dihapus; cukup `surface` + border.
- Overlay di belakang dialog: `rgb(0 0 0 / 0.4)` tanpa blur.

### 4.6 Gerak

- Durasi: 120ms (hover, press), 200ms (buka menu, laci, dialog), 300ms (perayaan streak).
- Kurva: `cubic-bezier(0.2, 0, 0, 1)` untuk masuk; keluar lebih cepat.
- Gerak hanya untuk memberi kabar: tersimpan, streak naik, laci terbuka. Tidak ada animasi masuk saat gulir, tidak ada parallax.
- `prefers-reduced-motion`: semua gerak jadi perubahan instan atau fade 100ms.
- Gulir yang diizinkan (16 November 2026): tautan jangkar menggulir halus (`scroll-behavior: smooth`, hanya tanpa reduced motion; `data-scroll-behavior` di `<html>` agar pindah rute tetap instan), dan barisan yang bisa digulir ke samping memakai `scroll-edge-fade` (tepi yang masih berisi memudar, terikat posisi gulir) serta `scroll-snap`. Tetap dilarang: animasi masuk saat gulir, parallax, bilah kemajuan baca, bilah navigasi yang menyembunyikan diri saat gulir.
- Jembatan perubahan: ubin Jelajahi yang baru muncul (muat lebih banyak, ganti kategori) fade 150ms; blok sukses daftar tunggu fade dan naik 8px (520ms); ikon Apresiasi dan Simpan mengecil ke 0,9 saat ditekan (120ms) [usulan].

**Pengecualian landing (15 November 2026, direvisi 16 November 2026).** Landing pra-peluncuran boleh bergerak lebih banyak dari aplikasi, tetap di dalam sistem desain ini (palet, huruf, dan tata letak tidak dipilih ulang). Batasnya bukan jumlah lapisan, melainkan empat pertanyaan untuk setiap gerak:

- **Frekuensi**: seberapa sering pembaca melihatnya.
- **Tujuan**: umpan balik, penjelasan, atau mencegah perubahan mendadak. Delight hanya untuk momen yang jarang.
- **Durasi**: muat dalam batas; entrance paling lama 700ms.
- **Fungsi**: tidak menggerakkan data yang sedang dibaca.

Gerak yang gagal di salah satu pertanyaan tidak dipasang. Yang berlaku sekarang:

1. **Entrance hero, sekali saat dimuat:** H1 naik baris per baris dari masker kata (700ms, baris berjarak 80ms), lalu kalimat penjelas dan tombol naik 12px (520ms, berjarak 60ms).
2. **Satu momen kedatangan**, satu-satunya entrance yang dipicu gulir: judul penutup `#daftar` naik dengan masker kata yang sama seperti hero, sekali, saat masuk melewati 15% bawah layar atau saat halaman dibuka lewat `#daftar`. Landing hanya punya satu momen seperti ini.
3. **Lapisan hover dan tekan:** `lp-btn` (naik 1px saat hover, hanya pointer halus; turun 1px dan skala 0,985 saat ditekan), `lp-press` (tombol sekunder dan chip minat di form; skala 0,985), dan `lp-link` (garis bawah digambar dari kiri). Tombol aplikasi tidak berubah.
4. **Penjelasan di mockup Studio:** butir legenda yang di-hover (hanya pointer halus) menyorot penandanya dan meredupkan penanda lain (150ms); butir 03 juga mengisi bilah target dari kiri (300ms). Tanpa hover tidak ada yang bergerak; peredupan berlaku instan saat reduced motion.
5. **Loop pratinjau di Ekosistem** (Streak, Project, Studio): lihat di bawah. Community dan Marketplace diam.
6. **Video hero**: lihat di bawah.
7. **Jembatan form:** pesan "sudah terdaftar", tombol "Pakai email lain", dan galat kirim fade 200ms; blok sukses fade dan naik 8px (520ms).

**Video hero** (15 November 2026, menggantikan animasi kode "paragraf → halaman 12 → sampul"): loop tanpa suara yang dirender dari komponen asli aplikasi (brief: `docs/desain/landing/Brief Video Hero.md`), 16:10 dari md ke atas dan 4:5 di ponsel, versi terang dan gelap mengikuti tema. Poster tampil lebih dulu dan menjadi gambar utuh tanpa JS atau saat reduced motion; video memudar masuk (300ms) setelah benar-benar main, berhenti saat hero tidak terlihat, dan punya tombol jeda karena berjalan lebih dari 5 detik.

**Loop pratinjau di Ekosistem**: siklus 3,2 detik, mulai dari gambar jadi, satu perubahan per siklus, hanya satu loop berjalan di satu layar (yang paling terlihat; lainnya main saat disentuh pointer), dan tombol jeda.

Tetap dilarang di landing: reveal pada setiap judul atau bagian, parallax, accordion (FAQ selalu terbuka), hitung naik pada angka, gerak pada apa pun yang bertanda "Menyusul", serta bayangan atau warna aksen baru. Semua gerak memakai `--ease-out`, hanya `transform` dan `opacity`. HTML dari server berisi keadaan akhir; kelas `lp-motion` di `<html>` (skrip inline, tidak dipasang saat reduced motion, dicabut bila landing tidak terhidrasi dalam 3,5 detik) yang menyalakan gerak. Gerak yang dipicu gulir wajib langsung tampil utuh bila observer tidak tersedia.

### 4.7 Ikon

- Satu set: **Phosphor** bobot Regular (Usulan; tidak terlalu identik dengan tampilan shadcn). Ukuran 20px di UI, 24px di navigasi.
- Ikon tidak aktif `ink-muted`; aktif `ink` dengan varian Fill.
- Ikon hanya untuk navigasi dan aksi. Tidak dipakai sebagai hiasan judul bagian. Ikon tanpa label wajib punya `aria-label` dan tooltip.

## 4.8 Logo

Logo sudah ada, hitam putih, di `public/logo/`. Logo **tidak boleh digambar ulang, diganti huruf serif, atau diberi warna**.

| Berkas | Isi | Dipakai untuk |
| --- | --- | --- |
| `v-hitam-png.png` (1080×356, transparan) | Monogram R + "ranah. menulis" dua baris | Wordmark utama di terang: bilah atas landing, footer, Open Graph |
| `v-putih-png.png` (1280×423, transparan) | Sama, putih | Wordmark di gelap dan di bagian daftar tunggu yang dibalik |
| `logo-hitam.png`, `logo-putih.png` (1080×1080, **latar solid**, ada margin) | Monogram R saja | Ikon aplikasi dan avatar; potong dulu marginnya |
| `logo-putih-aja.png` (566×569, transparan) | Monogram R putih | Monogram di latar gelap (bilah editor mode gelap) |
| `horizontal-*.jpg` | Satu baris "ranah menulis" tanpa titik, **JPG berlatar putih** | Cadangan; tidak untuk latar gelap |
| `vertikal-*.jpg` | Sama dengan wordmark dua baris tetapi di kanvas persegi berlatar putih | Cadangan |

Aturan:
- Wordmark utama = monogram R + "ranah." / "menulis" dua baris. Tinggi minimal 28px di layar. Ruang bebas di sekelilingnya minimal setinggi huruf "r".
- Bilah atas ponsel yang sempit memakai **monogram R saja**. Bilah editor tidak memakai logo sebagai tombol: kiri adalah panah kembali (lihat 6.3).
- Terang memakai versi hitam, gelap memakai versi putih. Tidak ada versi abu-abu atau berwarna.
- Huruf logo adalah geometris rata dengan ujung membulat. Huruf itu **tidak** dipakai di antarmuka: tipografi antarmuka tetap Inter dan Merriweather. Kesamaan rasa (ujung membulat) dijaga lewat tombol pill, bukan lewat font.
- Catatan teknis: belum ada SVG. Untuk implementasi minta SVG dari pembuat logo; sebelum itu pakai PNG transparan. JPG berlatar putih tidak boleh dipasang di atas `canvas` gelap.

## 5. Kerangka aplikasi

### 5.1 Titik henti

| Lebar | Navigasi |
| --- | --- |
| < 768 (ponsel) | Bilah atas 52px: monogram R kiri; kanan cari, lonceng, avatar. **Bilah bawah** solid 56px + safe area, bergaris atas: Beranda, Studio, Streak, Projects, Profil. Kelola dan Admin lewat menu Profil. **Tombol Tulis** bulat `ink` 56px di kanan bawah, 16px di atas bilah bawah, hanya di Beranda dan Studio. |
| 768–1023 (tablet) | Bilah atas + **rail** kiri 72px berisi ikon dengan label kecil |
| ≥ 1024 (desktop) | Bilah atas 56px bergaris bawah 1px. **Sidebar** kiri 240px yang bisa disembunyikan (pola Medium): Beranda, **Studio** dengan satu sub-butir **Streak** menjorok di bawahnya (lihat 5.3), Projects, Tersimpan, Profil, lalu garis pemisah, Kelola dan Admin (hanya bila punya peran) |
| ≥ 1280 | Halaman baca dan feed menampilkan kolom kanan 320px (pilihan editor, genre, penulis untuk diikuti) |

**Bilah atas desktop:** kiri tombol sidebar + wordmark; lalu kolom pencarian pill `subtle` 240px; kanan: "Tulis" (ikon pena + teks, tombol teks), lonceng dengan titik ink bila ada yang belum dibaca, avatar 32px.

**Item navigasi aktif:** teks `ink` bobot 500 + ikon Fill. Tidak ada latar pill di belakang item aktif.

### 5.2 Lebar konten

| Halaman | Lebar maksimal |
| --- | --- |
| Baca karya, editor, tulis postingan | 680 |
| Feed, profil (kolom utama), notifikasi, Tersimpan | 728 |
| Projects, Streak, statistik | 1040 |
| Kelola, Admin, panel juri | 1280 |

### 5.3 Studio dan Streak: satu modul

Menurut PRD (bagian 8 dan 16) dan daftar modul client, **Ranah Studio sudah mencakup Streak**: satu modul, satu navigasi, satu alur data. Streak dihitung dari aktivitas menulis di Studio. Tiga modul inti MVP adalah **Studio (termasuk Streak), Community, dan Projects**; Dashboard/Beranda adalah platform pendukung, bukan modul.

Konsekuensi untuk tampilan:
- **Desktop:** Streak bukan item sejajar dengan Studio. Ia sub-butir di bawah Studio di sidebar, dan halaman Studio punya dua tab bergaris bawah: **Dokumen** dan **Streak**. Mengetuk Streak tidak berpindah modul, hanya berpindah area.
- **Penghubung dua arah:** di halaman Dokumen terlihat satu baris ringkas progres hari ini ("Hari ini 320 / 500 kata") yang membuka tab Streak. Di Editor, indikator target kecil di bilah atas terhubung ke Streak. Streak selalu punya tombol "Mulai menulis" yang membuka dokumen terakhir.
- **Ponsel:** PRD menetapkan bilah bawah Beranda, Studio, Streak, Projects, Profil, jadi Streak tetap punya tab sendiri sebagai pintu cepat. Tab Streak dan tab Studio berbagi judul modul "Studio" di bilah atas, dan Streak tidak muncul di Beranda sebagai modul tersendiri selain blok "Hari ini".
- **Bahasa:** di teks publik, Streak disebut sebagai bagian Studio ("target harian di Studio"), bukan produk terpisah.
- **Asal keputusan:** rapat dengan client (transkrip, Agil dan Wafi): nama tunggal "Studio" dipilih supaya orang tidak bingung dengan dua nama; "Streak" hanya nama fitur di dalamnya. "Tab" yang disebut di rapat itu adalah tab bantuan (kit inspirasi) di dalam editor, yang sudah ada sebagai drawer bantuan (6.3); tab Dokumen/Streak di 5.3 adalah usulan desain tambahan dan boleh diganti bila client keberatan.
- **Terbuka:** apakah bilah bawah ponsel tetap memakai lima tab (PRD 16, usulan) atau empat tab dengan Streak di dalam Studio. Putuskan saat melihat desain ponsel yang sudah dirender.
- **Pengecualian dari "satu modul":** ID fitur STK dan STD tetap terpisah di PRD agar rujukan tidak putus. Itu urusan dokumen, bukan antarmuka.

### 5.4 Dari menulis ke Streak: satu alur data

Streak tidak diisi manual. Studio mengirim **perubahan kata bersih** setiap kali menyimpan (PRD STK-02, BR-STK-01..08), dan Streak menambahkannya ke total harian. Antarmuka harus memperlihatkan sebab-akibat ini, bukan hanya tautan antar tab.

Aturan yang memengaruhi tampilan:
- **Yang dihitung:** kata bersih yang ditulis **hari ini**, dari semua dokumen. Menghapus tulisan lama tidak mengurangi progres; menghapus tulisan yang ditulis hari ini mengurangi, tidak pernah di bawah nol. Dokumen yang kemudian dihapus tetap dihitung untuk hari itu. (BR-STK-04, 08; usulan)
- **Teks tempel dalam jumlah besar** tidak dihitung penuh; ambang dan perilakunya belum ditetapkan (Q-08). **[konfirmasi]**
- **Offline:** peristiwa disimpan di perangkat dan dikirim saat tersambung, dihitung ke tanggal saat menulis, tanpa menggandakan hitungan (BR-STK-02; toleransi Q-09).
- **Hari** berganti pukul 00.00 menurut zona waktu profil; hari berjalan belum memutus streak.

Perilaku di Editor (semua [usulan]):
1. **Indikator target** di bilah atas ("320 / 500", `tabular-nums`) bergerak mengikuti penyimpanan otomatis, bukan setiap ketukan, dan selalu berbeda secara visual dari jumlah kata dokumen: jumlah kata dokumen berlabel "167 kata", indikator target berlabel "hari ini". Tooltip dan popover menjelaskan perbedaannya ("Kata hari ini dari semua dokumen").
2. **Saat target tercapai** di tengah menulis: cincin pada indikator terisi sekali (300ms) dan teks menjadi "500 / 500". **Tidak ada toast, dialog, atau suara yang memotong menulis.** Kalimat "Target hari ini tercapai. Streakmu naik menjadi 7 hari." baru muncul bila indikator diketuk, dan di tab Streak.
3. **Sesudah tercapai**, indikator tetap bertambah ("612 / 500"), tanpa pesan tambahan.
4. **Offline:** indikator tetap bergerak dari data lokal dan memakai penanda kecil "tercatat saat tersambung"; setelah sinkron tidak ada lompatan angka.
5. **Mengetuk indikator** membuka popover berisi kata hari ini per dokumen (3 teratas), streak saat ini, dan tautan "Buka Streak".

Perilaku di Streak:
6. Mengetuk hari di kalender menampilkan rincian kata **per dokumen** (STK-03; catatan aktivitas menyimpan dokumen).
7. Tombol "Mulai menulis" membuka dokumen terakhir diedit; indikator target di editor langsung melanjutkan angka hari itu.

## 6. Halaman inti

### 6.1 Halaman baca karya (pola artikel Medium)

Urutan dari atas, satu kolom 680px:
1. `read-title`, lalu `read-subtitle` bila ada.
2. **Baris penulis:** avatar 44px, nama (`text-base` 500) + tautan "Ikuti" (teks, bukan tombol), baris kedua `text-sm ink-muted`: "6 menit baca · 12 Nov 2026 · Cerpen".
3. **Bilah aksi**, garis 1px di atas dan bawah, tinggi 48px: kiri Apresiasi + jumlah, Komentar + jumlah; kanan Simpan, Bagikan, ⋯ (Laporkan).
4. Isi karya `read-body`. Pemisah adegan: tiga titik `· · ·` di tengah, jarak 48px. Kutipan: garis kiri 3px `line-strong`, serif italic, indentasi 20px. Gambar selebar kolom, keterangan `text-xs ink-muted` di tengah.
5. Chip genre.
6. Bilah aksi diulang.
7. Blok "Ditulis oleh": avatar 64, nama `heading-md`, pengikut, bio dua baris, tombol Ikuti (garis).
8. Komentar: **laci kanan 420px** di desktop, halaman penuh di ponsel. Balasan bersusun satu tingkat, berindentasi 24px dengan garis kiri 1px.

### 6.2 Beranda (feed)

1. Blok "Hari ini" (Brief 4A): Lanjutkan menulis, Progres hari ini, Perlu perhatian, Proyek saya. Disajikan sebagai baris bergaris, bukan widget berkotak. Paling tinggi satu layar ponsel.
2. **Ponsel saja:** deretan penulis dan grup yang diikuti (avatar 56, nama `text-xs` di bawahnya, titik `ink` 8px bila ada karya baru, butir terakhir "+ Temukan" ke Discover).
3. Tab bergaris bawah: **Mengikuti** · **Jelajahi** (ke Discover). Tab aktif: teks `ink` + garis bawah 1px `line-strong`; yang lain `ink-muted`. Di ponsel tab bisa digulir mendatar.
4. **Butir karya** (tanpa kartu), dipisah garis 1px, padding vertikal 24px:
   - Avatar 20px + "di **Grup X** oleh **Nama** · 14 Okt" `text-xs`.
   - `feed-title`, lalu `feed-excerpt` dua baris (dipotong).
   - Baris bawah `text-xs ink-muted`: kiri ikon + jumlah apresiasi dan komentar; kanan Simpan, ⋯.
   - Thumbnail hanya bila karya punya gambar, rasio 3:2 di kanan: 160×107 desktop, 80×53 ponsel, tanpa radius.
5. **Butir catatan** (postingan Community pendek): avatar 32 + nama + waktu, lalu teks serif 16/26 langsung tanpa judul, dipotong 8 baris dengan "Baca selengkapnya", lalu bilah aksi Apresiasi, Komentar, Bagikan, Simpan.

### 6.3 Studio: editor (pola editor Medium)

- **Bilah editor** menggantikan bilah atas: kiri **panah kembali** berlabel "Kembali ke Studio" menuju daftar dokumen (diubah 16 November 2026: sebelumnya logo R menuju `/`, tanpa jalan keluar yang jelas; menyimpan dulu dengan `saveNow()` dan bila gagal tinggal di tempat dengan toast), judul dokumen dipotong, **penanda visibilitas** (ikon gembok + "Pribadi"), indikator simpan. Kanan: jumlah kata (`tabular-nums`; tombol yang membuka popover Kata · Karakter · Paragraf · Waktu baca, "12 dari 167 kata" saat teks dipilih), tombol primer kecil "Bagikan", ⋯ (Kirim ke proyek, Ekspor, Riwayat versi, Pindah ke sampah), tombol mode fokus.
- **Kanvas** 680px: placeholder judul "Judul" (`read-title`, `ink-faint`), placeholder isi "Mulai dari satu kalimat." (`read-body`, `ink-faint`).
- **Bilah format** tetap terlihat di bawah bilah editor (diubah 16 November 2026 mengikuti mockup landing dan permintaan user; sebelumnya pil `ink` melayang saat teks dipilih): satu pil bergaris 1px (`line`, latar kanvas, tidak terisi karena Bagikan adalah satu-satunya tombol terisi) di tengah kolom, ikon `ink`: Tebal, Miring, Judul, Kutipan, Daftar berpoin, Daftar bernomor (enam format STD-01). Butir aktif bergaris bawah, tidak diwarnai. Target sentuh 40×36 di ponsel. Menempel di atas saat kanvas digulir (di luar area gulir), tersembunyi di mode fokus, tidak mengambil fokus dari editor. Format hanya yang diizinkan STD-01, bukan toolbar lengkap ala Word.
- **Mode fokus:** bilah, bilah format, dan sidebar hilang, hanya teks; jumlah kata dan indikator simpan tetap terlihat redup di pojok. `Esc` keluar.
- **Drawer bantuan** (kit inspirasi, perpustakaan prompt): laci kanan 360px, tombol Salin per prompt.

### 6.4 Daftar dokumen Studio

Pola "Stories" Medium: tab Semua · Folder · Sampah. Butir: judul `heading-sm`, meta "Diubah 2 jam lalu · 1.240 kata", penanda teks kecil bergaris "Dibagikan" / "Dikirim ke proyek", ⋯ di kanan. Kosong: satu kalimat serif + tombol "Mulai menulis".

### 6.5 Profil penulis

Desktop: kolom kiri (nama `heading-lg`, tab Karya · Tentang · Proyek, lalu daftar karya pola feed) dan kolom kanan 320px (avatar 88, nama, jumlah pengikut, bio, negara, genre, tombol Ikuti, streak bila penulis mengizinkan). Ponsel: identitas di atas, tab di bawahnya.

### 6.6 Tersimpan, Notifikasi, Statistik

- **Tersimpan:** daftar pola feed.
- **Notifikasi:** tab Semua · Komentar · Proyek. Butir: avatar/ikon 32, kalimat (`text-sm`, nama pelaku 500), waktu. Belum dibaca: titik ink 6px di kiri + teks `ink`; sudah dibaca: `ink-muted`.
- **Statistik:** angka `figure` dengan label `text-xs`; grafik batang monokrom (batang `ink`, sumbu `line`), tanpa gradien.

### 6.7 Halaman di luar pola Medium

| Halaman | Arah |
| --- | --- |
| Dasbor Streak (tab Streak di dalam Studio, lihat 5.3) | Angka streak `figure` serif besar, progres hari ini sebagai garis 4px (`line` → `ink`), kalender titik tinta (7.3), tombol "Mulai menulis" |
| Detail proyek | Tata letak dokumen satu kolom 680 (tema, syarat, jadwal, hak cipta), kolom kanan lengket berisi biaya, kuota, deadline, dan tombol aksi sesuai status |
| QRIS | Satu kolom sempit 400: QR di atas latar putih murni (juga di mode gelap, agar terbaca), hitung mundur `tabular-nums`, status sebagai teks besar |
| Kelola, Admin, Juri | Kepadatan pengelola: tabel 14px, baris 44px, header lengket, tanpa zebra, filter di atas sebagai chip. Panel juri: teks karya `read-body` di kiri, kriteria dan skor di kanan, identitas penulis tidak pernah dirender |

### 6.8 Discover (pola Explore Substack)

Halaman untuk menemukan tulisan di luar yang diikuti. PRD menetapkan delapan kategori: Trending Today, New Writers, Editor's Picks, Most Appreciated, Most Saved, Hidden Gems, Indonesia Writers, Malaysia Writers. Kategori tanpa isi disembunyikan.

1. **Baris chip kategori** di atas, bisa digulir mendatar, lengket di bawah bilah atas. Chip pil `subtle`; terpilih memakai isian `ink`. Chip pertama "Semua".
2. **Grid masonry.** Desktop 3 kolom di lebar halaman 1040, tablet 2 kolom, ponsel 1 kolom (daftar biasa pola 6.2, bukan masonry). Jarak antarkolom 24px.
3. **Ubin** adalah satu-satunya tempat kotak dipakai di halaman baca: border 1px `line`, radius 0, tanpa bayangan, padding 20px, **satu tingkat saja** (tidak ada kotak di dalam ubin). Isi ubin sama dengan butir feed: baris penulis `text-xs`, lalu salah satu dari tiga bentuk:
   - **Catatan:** teks serif 16/26 langsung, dipotong 8 baris.
   - **Karya:** `feed-title`, `feed-excerpt` tiga baris.
   - **Karya bergambar:** gambar rasio 3:2 di atas judul, tanpa teks di atas gambar dan tanpa gradien.
   Di bawah ubin: apresiasi dan komentar kecil di kiri, Simpan di kanan.
4. **Tombol "Muat lebih banyak"** (sekunder) di akhir, bukan gulir tanpa batas, supaya footer tetap terjangkau dan posisi tidak hilang.
5. Tidak ada banner promosi di atas grid dan tidak ada pengisi ruang (tulisan yang diiklankan, ajakan membuat akun) di antara ubin.
6. **Guard terhadap rasa media sosial:** ubin tanpa gambar adalah bawaan; grid yang didominasi foto berarti penulis melampirkan foto, bukan desain yang memaksanya. Angka apresiasi ditampilkan kecil dan tidak dipakai sebagai pengurut utama kecuali di kategori Most Appreciated.

### 6.9 Halaman postingan dengan balasan (pola halaman catatan Substack)

> Implementasi (langkah 5): kolom 680 di tengah; di ponsel bilah aksi lengket di bawah menggantikan bilah navigasi dan memuat menu ⋯, bilah atas hanya panah kembali. Ubin Jelajahi memakai container query (3 kolom ≥ 896px, 2 kolom ≥ 576px, di bawahnya daftar bergaris).

Melengkapi 6.1 untuk postingan pendek (catatan) dan bagian komentar:

1. Satu kolom 680px. Baris penulis di atas (avatar 44, nama, tombol Ikuti sebagai teks, waktu relatif), lalu teks serif `read-body`, lalu bilah aksi: Apresiasi, Komentar, Bagikan, Simpan.
2. Di bawahnya satu baris meta `text-xs ink-muted`: "1.173 apresiasi · 68 balasan · 13 Nov pukul 03.37" (waktu mutlak sesuai zona waktu pengguna).
3. **Balasan:** daftar datar satu tingkat, dipisah garis 1px, padding vertikal 20px. Tiap balasan: avatar 32, nama, waktu, teks `text-base` (bukan serif, agar dibedakan dari karya), bilah aksi kecil. Balasan atas balasan memakai satu tingkat indentasi 24px dengan garis kiri 1px; tidak lebih dalam. Penyebutan penulis (`@nama`) berupa tautan bergaris bawah, bukan berwarna.
4. Balasan panjang dipotong 6 baris dengan "Lihat selengkapnya". Daftar dipotong dengan tombol teks lebar penuh "Lihat balasan lainnya".
5. **Tulisan terkait** di bawah balasan: judul bagian `heading-md`, lalu butir pola 6.2, maksimal 5.
6. **Tamu (belum masuk):** isi dan balasan terbaca; bagian bawah diganti satu blok "Masuk untuk membaca lebih banyak dan ikut membalas" dengan tombol Masuk (primer) dan Buat akun (sekunder). Tindakan yang butuh akun mengarahkan masuk, lalu kembali ke tujuan semula (PRD 16). Kolom kanan 320px untuk tamu: pencarian, "Penulis untuk diikuti", dan blok masuk yang sama.

## 7. Komponen

### 7.1 Dasar

| Komponen | Spesifikasi |
| --- | --- |
| **Tombol primer** | Pill, latar `ink`, teks `on-ink` `text-sm` 500, tinggi 40 (kecil 32), padding 16–20. Hover: opacity 0.85. Satu per layar. |
| **Tombol sekunder** | Pill, border 1px `ink`, teks `ink`, latar transparan. Hover: latar `subtle`. |
| **Tombol teks** | Tanpa border, `ink-muted` → `ink` saat hover. Untuk aksi ringan dan "Ikuti". |
| **Tombol berbahaya** | Hanya di dialog konfirmasi: pill latar `danger`, teks putih. Di tempat lain: tombol teks `danger`. |
| Keadaan tombol | Disabled: opacity 0.4, kursor bawaan. Loading: label tetap, titik tiga berdenyut menggantikan ikon, lebar tidak berubah. |
| **Input** | Tanpa radius, border 1px `line`, tinggi 44, padding 12. Fokus: border `line-strong`. Label di atas selalu terlihat (`text-sm` 500). Galat: border `danger`, pesan `text-sm danger` + ikon di bawah field. Isian tidak pernah dihapus saat galat. |
| **Tautan** | Di teks karya: `ink`, garis bawah selalu. Di UI: `ink`, garis bawah saat hover. Tidak ada tautan biru. |
| **Chip** (genre, filter) | Pill, latar `subtle`, `text-sm`, tinggi 32. Terpilih: latar `ink`, teks `on-ink`. |
| **Tab** | Teks `text-sm`, aktif `ink` + garis bawah 1px `line-strong`, seluruh bilah tab bergaris bawah `line`. |
| **Avatar** | Lingkaran. Tanpa foto: inisial `ink-muted` di atas `subtle`. Ukuran 20, 32, 44, 64, 88. |
| **Fokus keyboard** | Outline 2px `ink`, offset 2px, di semua elemen interaktif. Tidak pernah dihilangkan. |
| **Dialog** | Tanpa radius, `surface`, lebar 480, bayangan token. Ponsel: lembar bawah selebar layar. Judul `heading-md`, aksi di kanan bawah (primer paling kanan). |
| **Laci** | Dari kanan, tanpa radius, `surface`, border kiri `line`. Di md ke atas tidak-modal dan menggeser kanvas (halaman tetap bisa dipakai); di ponsel menjadi lembar bawah modal setinggi 84%. Masuk 200ms, keluar 150ms. |
| **Menu ⋯** | `surface`, border, bayangan, butir `text-sm` tinggi 36, aksi berbahaya di paling bawah setelah garis pemisah. |
| **Toast** | Kiri bawah (desktop) / atas bilah bawah (ponsel), latar `ink`, teks `on-ink`, tanpa radius, maksimal satu baris + satu aksi. Hilang setelah 4 detik kecuali galat. |

### 7.2 Indikator simpan (Studio)

Teks `text-xs` di bilah editor, tidak pernah berupa toast:

| Keadaan | Tampilan |
| --- | --- |
| Menyimpan | "Menyimpan…", `ink-muted` |
| Tersimpan | "Tersimpan", `ink-muted`; setelah 3 detik berubah jadi "Tersimpan 14.02" |
| Belum tersinkron | Ikon awan-coret + "Belum tersinkron", `ink`, bobot 500, menetap sampai tersambung. **Bukan merah.** |
| Belum tersimpan **[usulan]** | Sama dengan "Belum tersinkron" (ikon awan-coret, `ink` 500, bukan merah), tetapi untuk kegagalan menulis ke penyimpanan perangkat. Popover menyebut bahwa perubahan terakhir belum tersimpan dan Studio mencoba lagi. Hilang sendiri setelah berhasil |
| Konflik | Dialog konflik wajib (Brief R2): dua versi berdampingan |

### 7.3 Kalender titik tinta (Streak) — ciri khas Ranah

Grid 7 kolom, sel 36px, setiap hari berupa titik:

| Hari | Titik |
| --- | --- |
| Target tercapai | Lingkaran penuh `ink` 14px |
| Ada tulisan, belum target | Cincin 1.5px `ink` 14px |
| Kosong | Titik `line-strong` 4px dengan opacity 0.3 |
| Hari ini | Sel bergaris 1px `ink` |
| Masa depan | Tidak ada titik |

Saat target hari ini tercapai, cincin hari ini terisi tinta (300ms, sekali) dan angka streak naik. Itu satu-satunya perayaan: tanpa konfeti, lencana, atau suara.

### 7.4 Status submission (monokrom)

Prinsip: **makin berisi, makin butuh tindakanmu.** Selalu ada label teks; ikon hanya pendukung.

| Status | Tampilan |
| --- | --- |
| Draf | Pill bergaris putus-putus, `ink-muted` |
| Terkirim | Pill bergaris `line`, `ink` |
| Dalam Peninjauan | Pill bergaris `line`, ikon jam pasir |
| **Perlu Revisi** | **Pill terisi `ink`, teks `on-ink`** (satu-satunya yang terisi untuk penulis) |
| Revisi Terkirim | Pill bergaris `line`, `ink` |
| Diterima | Pill bergaris `line-strong`, ikon centang, bobot 500 |
| Ditolak | Pill bergaris `line`, ikon silang, `ink-muted` |
| Ditarik | Teks `ink-muted` tanpa pill dan tanpa ikon |

Di tampilan Organizer/Editor, status yang terisi adalah yang menunggu tindakan mereka (misalnya "Terkirim" untuk editor).

### 7.5 Penanda visibilitas

Selalu di dekat judul dokumen dan di dialog Bagikan: ikon + teks `text-xs`. **Pribadi** (gembok), **Grup: Nama Grup** (dua orang), **Publik** (globe). Mengubah ke Publik selalu lewat dialog yang menyebut persis teks mana yang akan tampil.

### 7.x Tombol tema dan bahasa

Dua kontrol tampilan ada di bilah atas landing, aplikasi, dan bingkai tamu [usulan]. Dari md ke atas: tombol bahasa (menu, ikon Translate, butir aktif bertanda "Aktif") dan tombol tema (ikon Sun atau Moon sesuai tema yang tampil; satu klik membalik Terang dan Gelap). Di bawah md keduanya digabung menjadi satu menu "Tampilan dan bahasa" (lembar bawah) agar bilah ponsel tidak sesak. Pilihan tema disimpan di cookie dan dipasang sebelum cat pertama; tanpa pilihan tersimpan, tema otomatis mengikuti sistem (tidak ada opsi "Ikuti sistem" di antarmuka; pilihan pengguna menimpanya). Saat tema berganti lewat tombol, tema baru terungkap sebagai lingkaran yang membesar dari tombol itu (View Transitions, 500 ms, ease-out); di layar sempit asalnya tombol menu. Reduced motion atau browser tanpa dukungan: berganti seketika. Papan `/sistem-desain` tidak memakai efek ini.

## 8. Keadaan halaman

| Keadaan | Aturan |
| --- | --- |
| Memuat | Skeleton berbentuk konten asli (baris judul, dua baris cuplikan) dengan latar `subtle`, tanpa shimmer bila reduced-motion. Di bawah 300ms tidak ditampilkan. |
| Kosong | Satu kalimat serif `heading-md` yang menyatakan keadaan + satu aksi. Contoh: "Belum ada tulisan di sini." · [Mulai menulis]. Tanpa ilustrasi orang generik. |
| Galat | Banner `danger-subtle` + ikon + kalimat apa yang gagal + tombol "Coba lagi". Galat satu blok tidak mematikan blok lain. |
| Tidak tersedia | Halaman satu kolom: "Karya ini sudah ditarik penulisnya." + tautan ke Beranda. |
| Akses ditolak | Sama, dengan kalimat yang menjelaskan peran yang dibutuhkan. |

## 9. Anti-slop

### Dilarang
- Tampilan shadcn bawaan: `rounded-md` di semua tempat, abu-abu `zinc`/`slate` kebiruan, kartu berborder dengan bayangan halus di semua daftar.
- Huruf klise AI: Inter, Geist, Playfair Display, Fraunces, Instrument Serif/Sans, Space Grotesk.
- Label kecil huruf kapital berspasi lebar di atas setiap judul bagian ("eyebrow").
- Gradien, glassmorphism, blur latar, blob, glow.
- Grid tiga kolom berikon bulat + judul + dua baris teks sebagai struktur utama.
- Ikon sebagai hiasan judul, emoji sebagai ikon.
- Angka, testimoni, atau logo mitra karangan. Lorem ipsum. Nama "John Doe".
- Dasbor penuh widget berkotak; angka besar tanpa makna.
- Animasi masuk saat gulir, parallax, hover yang mengangkat kartu.
- Lebih dari satu tombol terisi dalam satu layar.

### Diharuskan
- Teks contoh ditulis sungguhan dalam bahasa Indonesia yang wajar: prolog cerpen, puisi pendek, nama yang masuk akal ("Rinjani Putri", "Hafiz Rahman"), angka yang masuk akal.
- Microcopy pendek dan hangat, tanpa tanda seru beruntun: "Tersimpan", "Lanjutkan menulis", "Belum ada komentar. Jadilah yang pertama membaca dengan saksama."
- Setiap layar dicek dalam dua mode warna, di lebar 375 dan 1280, dan dengan data terburuk (judul panjang, nama satu huruf, nol butir).
- Bila sebuah layar terlihat bisa jadi template apa saja setelah logonya diganti, ulangi.

## 10. Implementasi (Tailwind v4)

Token di bawah menggantikan isi `src/app/globals.css`. Mode gelap ikut sistem, dan bisa dipaksa dengan `data-theme` di `<html>`.

```css
@import "tailwindcss";

@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

:root {
  --canvas: #ffffff;
  --surface: #ffffff;
  --subtle: #f3f3f3;
  --ink: #191919;
  --ink-muted: #5e5e5e;
  --ink-faint: #767676;
  --line: #e6e6e6;
  --line-strong: #191919;
  --on-ink: #ffffff;
  --danger: #b3261e;
  --danger-subtle: #fbeeed;
  --shadow-float: 0 2px 12px rgb(0 0 0 / 0.08);
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --canvas: #121212;
    --surface: #1a1a1a;
    --subtle: #232323;
    --ink: #ededed;
    --ink-muted: #a3a3a3;
    --ink-faint: #8c8c8c;
    --line: #2e2e2e;
    --line-strong: #ededed;
    --on-ink: #121212;
    --danger: #ff8f87;
    --danger-subtle: #2a1716;
    --shadow-float: none;
    color-scheme: dark;
  }
}

:root[data-theme="dark"] {
  --canvas: #121212;
  --surface: #1a1a1a;
  --subtle: #232323;
  --ink: #ededed;
  --ink-muted: #a3a3a3;
  --ink-faint: #8c8c8c;
  --line: #2e2e2e;
  --line-strong: #ededed;
  --on-ink: #121212;
  --danger: #ff8f87;
  --danger-subtle: #2a1716;
  --shadow-float: none;
  color-scheme: dark;
}

@theme inline {
  --color-canvas: var(--canvas);
  --color-surface: var(--surface);
  --color-subtle: var(--subtle);
  --color-ink: var(--ink);
  --color-ink-muted: var(--ink-muted);
  --color-ink-faint: var(--ink-faint);
  --color-line: var(--line);
  --color-line-strong: var(--line-strong);
  --color-on-ink: var(--on-ink);
  --color-danger: var(--danger);
  --color-danger-subtle: var(--danger-subtle);

  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-serif: var(--font-merriweather), Georgia, serif;

  --radius-*: initial;
  --radius-full: 9999px;

  --shadow-*: initial;
  --shadow-float: var(--shadow-float);

  --ease-out: cubic-bezier(0.2, 0, 0, 1);
}

body {
  background: var(--canvas);
  color: var(--ink);
  font-family: var(--font-sans);
}
```

Font di `src/app/layout.tsx` (menggantikan Geist):

```tsx
import { Inter, Merriweather } from "next/font/google";

const sans = Inter({ subsets: ["latin"], variable: "--font-inter", axes: ["opsz"] });
const serif = Merriweather({
  subsets: ["latin"],
  variable: "--font-merriweather",
  axes: ["opsz"],
  style: ["normal", "italic"],
});
```

`--radius-*: initial` sengaja menghapus skala radius bawaan Tailwind, sehingga `rounded-md` dan sejenisnya tidak bisa dipakai tanpa sengaja. Yang tersisa hanya `rounded-full` dan tanpa radius.

## 11. Belum diputuskan

1. ~~Huruf sans final~~ Diputuskan client 15 November 2026: Inter dan Merriweather (4.2).
2. **Mode gelap default:** ikut sistem (usulan) atau terang dulu. Referensi Medium dan Substack dari client sama-sama dalam mode gelap; layak ditanyakan apakah client memakai mode gelap sehari-hari.
3. **Judul di feed:** serif (usulan, pembeda dari Medium) atau sans tebal seperti Medium. Cukup ganti token `feed-title`.
4. Nilai ukuran Medium di dokumen ini adalah **perkiraan** dari pengamatan, bukan hasil ekstraksi. Cek ulang dengan inspeksi langsung halaman artikel dan editor Medium sebelum desain final.

## 12. Suara dan nada

Teks RanahMenulis ditulis seperti penulis yang rapi dan jujur: yakin tanpa berseru, spesifik tanpa memamerkan diri. Kartu suara lengkap, daftar kata yang tidak dipakai, dan teks landing yang sudah ditulis ulang ada di [docs/Copy Landing RanahMenulis.md](docs/Copy%20Landing%20RanahMenulis.md). Ringkasnya:

- Kata ganti "kamu". Kalimat 8-16 kata. Tanpa tanda seru dan tanpa humor.
- Istilah tetap: Studio, Streak, Community, Projects; draf (belum dikirim), naskah (sudah dikirim ke proyek), tulisan (umum).
- Hero paling punya suara; FAQ, form, dan galat datar dan ramah.
- Setiap klaim harus punya baris di PRD. Fitur Fase 2 (sertifikat, pembayaran ringgit) dan AI tidak disebut.
- Uji: bila nama produk dihapus dan kalimat masih cocok untuk aplikasi lain, tulis ulang.
