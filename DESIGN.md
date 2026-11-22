# RanahMenulis — Sistem Desain

> Hitam putih, netral, terasa seperti membaca, bukan seperti dasbor.

**Status:** draf v0.2 (14 November 2026), sudah memuat referensi Medium dan Substack dari client. Bagian berlabel **Usulan** belum disetujui client dan boleh direvisi setelah ditinjau.
**Pembaca:** desainer, Claude Design, dan developer yang membangun UI di Next.js + Tailwind v4.
**Sumber:** keputusan client di WhatsApp, [Brief Desain](docs/produk/Brief%20Desain%20RanahMenulis.md), PRD v0.2. Referensi Medium mentah (hanya halaman depan) ada di [docs/referensi/](docs/referensi/medium-homepage-style-reference.md).

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
| Sidebar kiri | Beranda, Library, Profil, Stories, Stats, lalu garis dan daftar "Following" | Beranda, Jelajahi, Studio, Projects, Tersimpan, Profil (Streak hanya tab di dalam Studio, 20 November 2026), lalu garis, Kelola/Admin, lalu daftar Grup saya |
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
3. **Garis untuk daftar, permukaan untuk wajah.** Daftar dan tabel tetap dipisah garis tipis dan ruang kosong, tanpa kartu bertumpuk dan bayangan. Permukaan (`subtle`, pita gelap `app-band`) dipakai untuk menandai jenis isi dan jangkar layar, bukan untuk membungkus setiap butir.
4. **Dua kepadatan, satu keluarga.** Dunia penulis lapang dan tenang; dunia pengelola padat dan cepat dipindai. Token sama, jaraknya berbeda.
5. **Penulis selalu tahu siapa yang bisa melihat karyanya.** Penanda visibilitas tidak pernah tersembunyi.
6. **Satu jangkar visual per layar** (21 November 2026, setelah audit "semua layar sama"): setiap layar punya satu hal yang langsung terlihat sebelum teks dibaca: sampul proyek (7.6), foto, angka `figure`, kalender titik tinta, atau pita gelap. Hitam putih tetap, yang bertambah adalah ukuran, permukaan, gambar, dan gerak. Ujinya: tutup logo, dan layar Projects, Studio, Community, dan Kelola tetap bisa dibedakan sekilas.
7. **Momen yang terasa.** Langkah penting (terdaftar, karya terkirim, revisi terkirim, pembayaran diterima, pemenang) memakai layar pencapaian (7.7), bukan satu kalimat.

## 4. Token

### 4.1 Warna

Semua nilai sudah dicek kontrasnya (WCAG 2.1). Rasio di kolom terakhir adalah terhadap `canvas`.

| Token | Terang | Gelap | Peran | Kontras (terang / gelap) |
| --- | --- | --- | --- | --- |
| `canvas` | `#ffffff` | `#121212` | Latar halaman | — |
| `surface` | `#ffffff` | `#1a1a1a` | Lapisan mengambang: dialog, menu, laci, toast. Di mode terang dipisah dengan garis + bayangan | — |
| `subtle` | `#f3f3f3` | `#232323` | Hover baris, chip, skeleton, kolom pencarian, blok kode | — |
| `ink` | `#191919` | `#ededed` | Teks utama, tombol terisi, garis tegas | 17.6 / 16.0 |
| `ink-soft` | `#3d3d3d` | `#c4c4c4` | Isi kedua: ringkasan, cuplikan, keterangan di dalam pita (21 November 2026) | 10.9 / 10.8 |
| `ink-muted` | `#5e5e5e` | `#a3a3a3` | Hanya meta: waktu, hitungan, label kecil, ikon tidak aktif | 6.5 / 7.4 |
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
| `feed-title` | 20 / 28 | 18 / 24 | 600 | Judul di feed dan daftar |
| `feed-excerpt` | 15 / 24 | 15 / 22 | 400, `ink-muted` | Cuplikan di feed |
| `figure` | 52 / 1.0 | 40 / 1.0 | 400, angka lining tabular | Angka streak, statistik |

**Skala landing (sans, Inter):** `display` `clamp(40px, 8vw, 88px)` / 1.02, tracking −0.035em, 700 (judul penutup); `landing-h2` 40 / 48 (ponsel 28 / 36), tracking −0.025em, 600 (judul bagian). **Hero C2** (20 November 2026, `lp-hero-title`): Inter 700, `clamp(44px, 8.1vw, 118px)` / 0,92 dan tracking −0,055em (ponsel `min(9.4vw, 44px)` / 1), tiga baris rata kiri; baris tengah memakai **Merriweather miring 300** (`lp-hero-serif`, 0,9em, tracking −0,035em, menjorok 1,05em dari md). Itu satu-satunya judul Inter yang berganti huruf di tengah baris, dan **perlu persetujuan client** karena brief font menetapkan Inter untuk judul hero; bila ditolak, ganti ke Inter tanpa mengubah susunan. **Font ketiga, hanya di landing** (keputusan user, 20 November 2026): JetBrains Mono 400 dan 500 (`next/font`, token `--font-mono`) untuk satu baris colophon di atas judul hero (11,5px, ponsel 10,5px, tracking 0,02em, `ink-muted`) dan penanda posisi legenda Studio di ponsel; tidak dipakai di aplikasi.

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
- **Pita gelap `app-band`** (21 November 2026): dipasang bersama `theme-dark`, sehingga semua token di dalamnya gelap. Di halaman gelap pita naik satu tingkat (`#1d1d1d`, `subtle` `#2a2a2a`, garis `#363636`) agar tidak tenggelam. Dipakai untuk jangkar layar: Unggulan di katalog, kepala detail proyek, layar pencapaian, paket Solo termahal. Paling banyak satu pita besar per layar; tombol terisi tetap di luar pita.
- Permukaan diam (feed, halaman, tabel) **tidak** berbayangan.
- Hanya lapisan mengambang yang berbayangan, satu token: `0 2px 12px rgb(0 0 0 / 0.08)` + border 1px `line`. Di mode gelap bayangan dihapus; cukup `surface` + border.
- Overlay di belakang dialog: `rgb(0 0 0 / 0.4)` tanpa blur.

### 4.6 Gerak

- Durasi: 120ms (hover, press), 200ms (buka menu, laci, dialog), 300ms (perayaan streak).
- Kurva: `cubic-bezier(0.2, 0, 0, 1)` untuk masuk; keluar lebih cepat.
- **Gerak di aplikasi tidak dibatasi pada kabar** (keputusan user, 21 November 2026, menggantikan larangan sebelumnya): reveal sekali saat terlihat, entrance, hover yang menggerakkan sampul, dan perayaan boleh dipakai di aplikasi seperti di landing. Tetap: `transform`/`opacity` (atau properti individual `translate`, `scale`, `rotate`), `--ease-out`, tidak menggerakkan data yang sedang dibaca, dan mati total saat reduced motion. Kelas bersama: `data-rise` + `data-seen` (naik 16px dan memudar, `--delay` per ubin lewat `revealDelay`, hook `lib/use-reveal-once.ts`), `rm-cover-enter` (sampul naik dari miring −4°, 900ms), `rm-rise-in` (teks naik berurutan), `rm-burst` (cincin tinta melebar dari sampul, 1800ms, sekali).
- `prefers-reduced-motion`: semua gerak jadi perubahan instan atau fade 100ms.
- Gulir yang diizinkan (16 November 2026): tautan jangkar menggulir halus (`scroll-behavior: smooth`, hanya tanpa reduced motion; `data-scroll-behavior` di `<html>` agar pindah rute tetap instan), dan barisan yang bisa digulir ke samping memakai `scroll-edge-fade` (tepi yang masih berisi memudar, terikat posisi gulir) serta `scroll-snap`. Tetap dilarang di aplikasi: parallax (landing punya pengecualian di bawah) dan bilah kemajuan baca. Bilah navigasi yang menyembunyikan diri saat gulir ditunda sampai uji ponsel (hanya kandidat untuk halaman baca postingan). Reveal sekali saat terlihat diizinkan (lihat butir gerak di atas).
- Jembatan perubahan: ubin Jelajahi yang baru muncul (muat lebih banyak, ganti kategori) fade 150ms; blok sukses daftar tunggu fade dan naik 8px (520ms); ikon Apresiasi dan Simpan mengecil ke 0,9 saat ditekan (120ms) [usulan]; hati Apresiasi juga muncul sekali saat dinyalakan (0,85 → 1,15 → 1, 260ms, `rm-heart-pop`), tidak saat dimatikan atau saat halaman dibuka.
- **Tekan tombol** (21 November 2026): tombol `primary`, `secondary`, dan `danger` mengecil ke 0,97 saat ditekan (120ms, `scale`), di samping keadaan opacity atau latar yang sudah ada; tombol `text`, tautan, dan chip tidak.

**Pengecualian landing (15 November 2026, direvisi 16 November 2026).** Landing pra-peluncuran boleh bergerak lebih banyak dari aplikasi, tetap di dalam sistem desain ini (palet, huruf, dan tata letak tidak dipilih ulang). Batasnya bukan jumlah lapisan, melainkan empat pertanyaan untuk setiap gerak:

- **Frekuensi**: seberapa sering pembaca melihatnya.
- **Tujuan**: umpan balik, penjelasan, atau mencegah perubahan mendadak. Delight hanya untuk momen yang jarang.
- **Durasi**: muat dalam batas; entrance paling lama 700ms.
- **Fungsi**: tidak menggerakkan data yang sedang dibaca.

Gerak yang gagal di salah satu pertanyaan tidak dipasang. Yang berlaku sekarang:

1. **Entrance hero, sekali saat dimuat:** H1 naik baris per baris dari masker kata (700ms, baris berjarak 80ms), lalu kalimat penjelas dan tombol naik 12px (520ms, berjarak 60ms).
2. **Momen kedatangan** (direvisi 20 November 2026; aturan "hanya satu" dicabut untuk landing): judul penutup `#daftar` naik dengan masker kata yang sama seperti hero, sekali, saat melewati 15% bawah layar. Ditambah, semuanya sekali per kunjungan dan lewat `motion/use-reveal.ts` (`data-reveal`, lalu `data-seen` saat melewati 25% bawah layar; tanpa observer langsung tampil):
   - **Gambar hero ikut entrance judul:** gravir naik dari `translate: 0 8%` dan memudar masuk (1100ms, jeda `--follow`), editor naik 48px (900ms, jeda `--follow` + 120ms). Memakai properti `translate` agar bertumpuk dengan `transform` paralaks.
   - **Sampul Penerbitan** (`cover-stack.tsx`): naik 32px dan memudar (700ms, kiri, kanan, lalu tengah, berjarak 70ms), lalu berada di dua kedalaman saat digulir (`--cp`: samping ±12px, tengah ±24px) di depan ruang percetakan yang bergeser.
   - **Penanda Studio** muncul satu per satu (1, 3, 5, 6; skala 0,6 ke 1, 220ms, berjarak 90ms), lalu bilah target terisi (600ms, jeda 400ms). Animasi dengan fill `backwards`, sehingga sorotan hover tetap memakai transisinya sendiri.
   - **Pelat Holbein dan keladi** ditarik turun seperti cetakan baru: `clip-path: inset(0 0 100% 0)` ke `inset(0)`, 900ms, pada gambarnya (bukan pembungkus, agar `multiply` keladi tetap sampai ke halaman). Satu-satunya gerak landing di luar `transform` dan `opacity` (keputusan user, 20 November 2026).
3. **Lapisan hover dan tekan:** `lp-btn` (naik 1px saat hover, hanya pointer halus; panah di tombol bergeser 3px ke kanan dalam 200ms; turun 1px dan skala 0,985 saat ditekan), `lp-press` (tombol sekunder dan chip minat di form; skala 0,985), dan `lp-link` (garis bawah digambar dari kiri). Lapisan ini hanya untuk landing; tombol aplikasi memakai tekan 0,97 (lihat Tekan tombol di atas).
4. **Penjelasan di mockup Studio:** butir legenda yang di-hover (hanya pointer halus) menyorot penandanya dan meredupkan penanda lain (150ms); butir 03 juga mengisi bilah target dari kiri (300ms). Peredupan berlaku instan saat reduced motion. Di ponsel angka posisi legenda ("01 / 06") bergulung: yang lama naik keluar, yang baru naik dari bawah (180ms). **Legenda ponsel bergeser sendiri** (permintaan user, 20 November 2026; `motion/use-auto-advance.ts`): satu kartu tiap 3 detik, kembali ke 01 setelah 06, hanya bila legenda terlihat 60% dan tab aktif, dan **berhenti permanen pada sentuhan, tekan, roda, atau fokus keyboard pertama** (pembaca selalu menang). Target dan angka posisi dibaca dari letak kartu terhadap tepi snap, bukan dari lebar kartu.
5. **Loop pratinjau di Ekosistem** (Streak, Project, Studio): lihat di bawah. Community dan Marketplace diam.
6. **Video hero**: lihat di bawah.
7. **Jembatan form:** pesan "sudah terdaftar", tombol "Pakai email lain", dan galat kirim fade 200ms; blok sukses fade dan naik 8px (520ms).

**Video hero** (15 November 2026, menggantikan animasi kode "paragraf → halaman 12 → sampul"): loop tanpa suara yang dirender dari komponen asli aplikasi (brief: `docs/desain/landing/Brief Video Hero.md`), 16:10 dari md ke atas dan 4:5 di ponsel, versi terang dan gelap mengikuti tema. Poster tampil lebih dulu dan menjadi gambar utuh tanpa JS atau saat reduced motion; video memudar masuk (300ms) setelah benar-benar main, berhenti saat hero tidak terlihat, dan punya tombol jeda karena berjalan lebih dari 5 detik.

**Loop pratinjau di Ekosistem**: siklus 3,2 detik, mulai dari gambar jadi, satu perubahan per siklus, hanya satu loop berjalan di satu layar (yang paling terlihat; lainnya main saat disentuh pointer), dan tombol jeda.

**Foto domain publik dan paralaks (20 November 2026, menggantikan larangan parallax di bawah).** Lima foto monokrom dari domain publik (sumber di komentar `features/landing/assets.ts`, moodboard 37 aset) memperkaya landing tanpa mengubah tata letak: gravir perpustakaan London Institution naik dari dasar hero dengan editor di atasnya (`hero-band.tsx`), pelat tangan Holbein di samping teks pembuka Studio, ruang percetakan 1914 di belakang tiga sampul Penerbitan, keladi di kolom kiri Tanya jawab, dan awan berbulan Baade di pita penutup. Foto dipakai apa adanya: `grayscale(1) contrast(1.18) brightness(.98)` (`lp-photo`), tanpa dither, partikel, atau canvas. **Tidak ada foto yang dibalik (invert) di mode gelap** (keputusan user, 20 November 2026, setelah dibandingkan dengan artifact): gravir, pelat, dan keladi tampil apa adanya; hanya keladi (`lp-plate`) memakai `multiply` di mode terang agar kertasnya melebur ke halaman. Masker pudar hero ada pada kotak gambar (`.lp-relief`), bukan pada gambar yang bergeser. **Tanpa keterangan atau kredit gambar di halaman**; alt text hanya pada pelat yang bermakna (Holbein, keladi), tiga lainnya dekoratif. Berkas: WebP abu-abu di `public/landing/assets/` (±800 KB seluruhnya, semua `loading="lazy"`), lewat komponen `Plate`. **Paralaks** (`motion/scroll-drift.ts`, satu pendengar gulir pasif dan satu rAF per frame untuk semua elemen): hero menggeser gravir 0 sampai −60px dan mengecilkannya dari 1,10 ke 1,02 sementara editor naik 0 sampai −36px; ruang percetakan dan langit bergeser ±20 dan ±25px. Hanya `transform`, lewat variabel CSS (`--par`, `--sc`, `--lift`, `--dy`, `--ds`) yang hanya ditulis bila `lp-motion` menyala, jadi tanpa skrip atau saat reduced motion semua foto diam di posisi awal. Elemen yang jauh di luar layar dilewati.

**Pengecualian bentuk landing (20 November 2026).** (1) Bingkai video editor di hero (`lp-device-frame`) memakai radius 14px dan bayangan `0 40px 90px -30px` karena ia perangkat yang terangkat dari gravir; ini pengecualian dari "hanya rounded-full atau tanpa radius" dan "tanpa bayangan baru", berlaku hanya di sana. (2) **Hitam landing lebih dalam di mode gelap**: kanvas `#0c0c0c`, `subtle` `#1a1a1a`, garis `#262626` (token aplikasi tetap `#121212`, `#232323`, `#2e2e2e`), hanya di bawah `.lp-root` (pembungkus di `app/page.tsx`, lewat `:has` pada `<html>`), supaya foto dan pita penutup tampil setegas artifact. Cabut blok "Dark landing" di `globals.css` untuk kembali ke token aplikasi. (3) **Pita penutup `#daftar` gelap di kedua tema** (`theme-dark`, set token gelap tetap), menggantikan pita yang dibalik; lukisan bulan hanya bekerja di latar gelap. Form di dalamnya memakai selubung `canvas` 70% dengan blur.

Tetap dilarang di landing: reveal pada setiap judul atau bagian, accordion (FAQ selalu terbuka), hitung naik pada angka, gerak pada apa pun yang bertanda "Menyusul", serta bayangan atau warna aksen baru selain pengecualian di atas. Semua gerak memakai `--ease-out`, hanya `transform` dan `opacity`. HTML dari server berisi keadaan akhir; kelas `lp-motion` di `<html>` (skrip inline, tidak dipasang saat reduced motion, dicabut bila landing tidak terhidrasi dalam 3,5 detik) yang menyalakan gerak. Gerak yang dipicu gulir wajib langsung tampil utuh bila observer tidak tersedia.

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
| < 768 (ponsel) | Bilah atas 52px: monogram R kiri; kanan cari, lonceng, avatar. **Bilah bawah** solid 56px + safe area, bergaris atas, **lima tab**: Beranda, Jelajahi, Studio, Projects, Profil (Streak lewat tab Studio; Jelajahi punya tab sendiri karena ikon pencarian di bilah atas tidak cukup jelas sebagai pintunya, 20 November 2026). Kelola dan Admin lewat menu Profil. **Tombol Tulis** bulat `ink` 56px di kanan bawah, 16px di atas bilah bawah, hanya di Beranda dan Studio. |
| 768–1023 (tablet) | Bilah atas + **rail** kiri 72px berisi ikon dengan label kecil |
| ≥ 1024 (desktop) | Bilah atas 56px bergaris bawah 1px. **Sidebar** kiri 240px yang bisa disembunyikan (pola Medium): Beranda, Jelajahi, **Studio** (tanpa sub-butir Streak, lihat 5.3), Projects, Tersimpan, Profil, lalu garis pemisah, Kelola dan Admin (hanya bila punya peran) | Buka-tutup sidebar beranimasi 200ms `--ease-out`: kolom menyempit sementara daftarnya bergeser keluar ke kiri; saat tertutup kolomnya `inert`; instan saat reduced motion.
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
- **Navigasi (diputuskan user, 20 November 2026):** Streak **tidak ada** di sidebar, rail, maupun bilah bawah ponsel. Satu-satunya pintu adalah tab Streak di Studio (dan tautan dari Beranda, Editor, Dokumen); halaman Streak menyalakan butir Studio.
- **Desktop:** halaman Studio punya dua tab bergaris bawah: **Dokumen** dan **Streak**. Mengetuk Streak tidak berpindah modul, hanya berpindah area.
- **Penghubung dua arah:** di halaman Dokumen terlihat satu baris ringkas progres hari ini ("Hari ini 320 / 500 kata") yang membuka tab Streak. Di Editor, indikator target kecil di bilah atas terhubung ke Streak. Streak selalu punya tombol "Mulai menulis" yang membuka dokumen terakhir.
- **Ponsel:** bilah bawah empat tab (Beranda, Studio, Projects, Profil); butir terbuka di bawah ini terjawab. Tab Streak dan tab Studio berbagi judul modul "Studio" di bilah atas, dan Streak tidak muncul di Beranda sebagai modul tersendiri selain blok "Hari ini".
- **Bahasa:** di teks publik, Streak disebut sebagai bagian Studio ("target harian di Studio"), bukan produk terpisah.
- **Asal keputusan:** rapat dengan client (transkrip, Agil dan Wafi): nama tunggal "Studio" dipilih supaya orang tidak bingung dengan dua nama; "Streak" hanya nama fitur di dalamnya. "Tab" yang disebut di rapat itu adalah tab bantuan (kit inspirasi) di dalam editor, yang sudah ada sebagai drawer bantuan (6.3); tab Dokumen/Streak di 5.3 adalah usulan desain tambahan dan boleh diganti bila client keberatan.
- **Terjawab (20 November 2026):** lima tab (Jelajahi ditambahkan), Streak di dalam Studio.
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

**Susunan tiga kolom (20 November 2026, masukan user "terlalu banyak teks, bingung harus ngapain, perlu garis antar segmen"; tata letak Medium, isi Desk Novlr):** sidebar, kolom tengah 680 yang berada di tengah sisa ruang, lalu dari 1280 kolom kanan yang **menempel ke tepi layar** selebar `clamp(20rem, 24vw, 28rem)` (±24% layar, rasio Medium) dengan garis kiri 1px setinggi halaman (tidak lengket), padding kiri 32 dan kanan 24. Di bawah 1280 isi kolom kanan turun **di bawah feed**, dipisah garis `line-strong` (keputusan user 20 November 2026: di ponsel feed lebih dulu, seperti Medium).

1. Kolom tengah: salam `heading-lg` "Siap menulis, {nama depan}?" (`#beranda-title`), satu kalimat 7 hari terakhir (`weekSentence`, tanpa persen), lalu **jangkar layar** (21 November 2026): pita gelap `app-band` berisi halaman dokumen terakhir (penanda 6.4, masuk dengan `rm-cover-enter`), judul serif 24/30px yang naik, meta `ink-soft`, dan cincin Hari ini (`TodayRing` ringkas, sama dengan hero Streak) bila ada target harian; satu tombol terisi Lanjutkan (atau "Belum ada dokumen." + Mulai menulis) **di bawah pita**. Tiga langkah awal untuk penulis baru tetap kartu berbingkai 1px `line`. Di kolom kanan, Progres hari ini menampilkan streak sebagai angka serif 44px yang bergulung dan kata hari ini sebagai teks (bilah dihapus karena cincin sudah ada); Proyek saya memakai sampul 7.6 selebar 44px. Setiap aksi hanya muncul sekali. Baris "Notifikasi baru" dihapus (lonceng sudah ada).
1a. Kolom kanan (`home-rail.tsx`), bagian berjudul `text-sm` semibold, **dipisah garis `line-strong`**; butir di dalam satu bagian dipisah garis `line`: Progres hari ini (bilah target, streak, tiga angka kata), Perlu perhatian, Proyek saya, Undangan grup, Bersama penulis lain (Event, Grup Penulis, Tulis postingan, Komunitas). Bagian kosong tidak digambar; Progres disembunyikan selama Tiga langkah awal tampil. Tanpa konten editorial (keputusan client h6).
2. **Ponsel saja:** deretan penulis dan grup yang diikuti (avatar 56, nama `text-xs` di bawahnya, titik `ink` 8px bila ada karya baru, butir terakhir "+ Temukan" ke Discover).
3. Tab bergaris bawah: **Mengikuti** · **Jelajahi** (ke Discover). Tab aktif: teks `ink` + garis bawah 1px `line-strong`; yang lain `ink-muted`. Di ponsel tab bisa digulir mendatar.
4. **Butir karya** (tanpa kartu), dipisah garis 1px, padding vertikal 24px:
   - Avatar 20px + "di **Grup X** oleh **Nama** · 14 Okt" `text-xs`.
   - `feed-title`, lalu `feed-excerpt` dua baris (dipotong).
   - **Skala ponsel mengikuti Medium (diukur dari tangkapan layar 440px, 20 November 2026):** Medium memakai judul 20/24, subjudul 16/20, meta 14, jarak baris sekitar 32px atas-bawah; Ranah memakai judul serif 18/24 (serif dibuat 2px lebih kecil dari sans), cuplikan 15/22, baris penulis, label, dan hitungan 13px (12px dari md), dan padding butir 28px di ponsel (24px dari md). Gutter halaman tetap 16 (Medium 24) supaya kolom teks di sebelah thumbnail 80px tidak menyempit.
   - Baris bawah `text-xs ink-muted`: kiri ikon + jumlah apresiasi dan komentar; kanan Simpan, ⋯.
   - Thumbnail hanya bila karya punya gambar, rasio 3:2 di kanan: 160×107 desktop, 80×53 ponsel, tanpa radius.
5. **Butir catatan** (postingan Community pendek): avatar 32 + nama + waktu, lalu teks serif 16/26 langsung tanpa judul, dipotong 8 baris dengan "Baca selengkapnya", lalu bilah aksi Apresiasi, Komentar, Bagikan, Simpan.

### 6.3 Studio: editor (pola editor Medium)

- **Bilah editor** menggantikan bilah atas: kiri **panah kembali** berlabel "Kembali ke Studio" menuju daftar dokumen (diubah 16 November 2026: sebelumnya logo R menuju `/`, tanpa jalan keluar yang jelas; menyimpan dulu dengan `saveNow()` dan bila gagal tinggal di tempat dengan toast), judul dokumen dipotong, **penanda visibilitas** (ikon gembok + "Pribadi"), indikator simpan. Kanan: jumlah kata (`tabular-nums`; tombol yang membuka popover Kata · Karakter · Paragraf · Waktu baca, "12 dari 167 kata" saat teks dipilih), tombol primer kecil "Bagikan", ⋯ (Kirim ke proyek, Ekspor, Riwayat versi, Pindah ke sampah), tombol mode fokus.
- **Kanvas** 680px: placeholder judul "Judul" (`read-title`, `ink-faint`), placeholder isi "Mulai dari satu kalimat." (`read-body`, `ink-faint`).
- **Bilah format** tetap terlihat di bawah bilah editor (diubah 16 November 2026 mengikuti mockup landing dan permintaan user; sebelumnya pil `ink` melayang saat teks dipilih): satu pil bergaris 1px (`line`, latar kanvas, tidak terisi karena Bagikan adalah satu-satunya tombol terisi) di tengah kolom, ikon `ink`: Tebal, Miring, Judul, Kutipan, Daftar berpoin, Daftar bernomor (enam format STD-01). Butir aktif bergaris bawah, tidak diwarnai. Target sentuh 40×36 di ponsel. Menempel di atas saat kanvas digulir (di luar area gulir), tersembunyi di mode fokus, tidak mengambil fokus dari editor. Format hanya yang diizinkan STD-01, bukan toolbar lengkap ala Word.
- **Mode fokus:** bilah, bilah format, dan sidebar hilang, hanya teks; jumlah kata dan indikator simpan tetap terlihat redup di pojok. `Esc` keluar.
- **Sematan penghitung kata (N20, STD-18) [usulan]:** popover penghitung memuat pilihan Dokumen, Sprint, Target dokumen, dan Lepas sematan. Satu sematan memakai posisi penghitung yang ada. Sprint menampilkan tambahan kata bersih. Target memakai angka ringkas `320 / 1.000` di bilah dengan label `terlewat` bila tenggatnya lewat. Rincian kata dan tenggat ada di popover. Di ponsel, timer memakai ikon dengan hitung mundur atau kata “selesai”. Label `terlewat` dan `hari ini` berada di bawah angka masing-masing. Keterangan target harian saat luring disingkat menjadi `Luring`, dengan penjelasan di popover. Jarak antarkontrol dirapatkan. Saat data sematan belum tersedia, bilah menampilkan hitungan biasa dan popover menjelaskan alasannya. Penghitung menunggu hidrasi dan, untuk sematan target, tanggal lokal. Pilihan tersimpan di akun lokal. Kontrolnya berada di Editor Studio, dengan jumlah kata dokumen tetap terlihat di mode fokus.
- **Preferensi menulis (N8, [usulan]):** ukuran isi Kecil · Standar · Besar memakai satu jenis huruf. Standar mengikuti tipografi responsif yang sudah ada. Kanvas menunggu hidrasi agar ukuran tersimpan berlaku sejak teks muncul. Mode Mesin Tik menempatkan baris kursor di Atas, Tengah, atau Bawah area terlihat, termasuk di mode fokus. Gulir berlangsung instan. Kutip melengkung serta substitusi `--` menjadi `—` dan `...` menjadi `…` adalah dua sakelar terpisah, keduanya mati secara bawaan. Backspace tepat setelah substitusi mengembalikan urutan yang diketik. Preferensi hanya dipakai di Editor Studio. Editor Tulis langsung di `/tulis` memakai perilaku bawaannya.
- **Pencarian cepat (STD-14):** ikon kaca pembesar di bilah Studio dan Editor serta `Ctrl+K` / `⌘K` membuka dialog **Cari di Studio**. Pintasan tetap tersedia di mode fokus. Fokus awal pada kolom. Panah memilih hasil, Enter membuka, Escape menutup dan memulihkan fokus. Hasil berlabel Dokumen atau Folder, dengan baris bergaris tipis dan tombol **Tampilkan lagi** sesudah 20 hasil. Dialog memakai panel di desktop dan lembar bawah di ponsel. Saat berpindah dari Editor, simpan lebih dulu dan tutup dialog sebelum navigasi.
- **Drawer bantuan** (kit inspirasi, perpustakaan prompt): laci kanan 360px, tombol Salin per prompt.

### 6.4 Daftar dokumen Studio

Tab Semua · Arsip · Sampah. Folder tampil di tab Semua. Butir: **penanda halaman** (21 November 2026, `document-mark.ts`, `DocumentMark`) menggantikan ikon: lembar kertas 4:5 selebar 28/34px yang garisnya mengikuti jenis (Cerpen paragraf berindentasi, Puisi baris pendek di tengah per bait, Esai bilah judul lalu rata kanan-kiri, Novel judul bab dan garis punggung, Naskah nama tokoh tebal lalu dialog, tanpa jenis garis polos) dan terisi ke bawah menurut jumlah kata (log, kosong untuk 0 kata, penuh mulai ±5.000 kata); folder berupa tiga lembar bertumpuk. Arsip dan Sampah memudar. Gerak: baris naik sekali saat dipasang (jeda 45ms, maks. 12 baris), garis lembar tergores dari kiri, hover baris mengangkat lembar dan mengipaskan lembar folder; diam saat reduced motion. Lalu judul `heading-sm`, meta "Diubah 2 jam lalu · 1.240 kata", penanda teks kecil bergaris "Dibagikan" / "Dikirim ke proyek", ⋯ di kanan. Kosong: satu kalimat serif + tombol "Mulai menulis".

Jenis dokumen opsional tampil sebagai teks kecil. Tag tampil sebagai pil monokrom yang berbaris ulang saat ruang sempit. Menu ⋯ membuka dialog **Jenis dan tag**, dengan pemilih jenis, satu isian untuk menambah tag, dan tombol lepas per tag. Tombol Simpan menjadi satu-satunya aksi terisi di dialog. Daftar aktif memiliki pemilih Jenis dokumen dan Tag yang tersimpan di alamat. Saat disaring dari tingkat teratas, hasil lintas folder menyebut nama folder pada barisnya. Di dalam folder, penyaring hanya berlaku pada folder itu. Hasil kosong memberi aksi **Hapus penyaring**. Bila baris keluar dari hasil setelah simpan, fokus berpindah ke pesan hasil. **[usulan]**

Aksi Arsipkan dan Duplikat ada di menu ⋯ dokumen aktif. Tab Arsip memakai baris yang sama dengan waktu pengarsipan, jumlah kata, dan nama folder bila ada. Pulihkan berupa tombol teks. Saat kosong, tampilkan “Arsip kosong.” dan “Lihat semua dokumen”. Status aksi menerima fokus setelah baris hilang. Setelah duplikat berhasil, tampilkan tautan Buka salinan. Tautan editor ke dokumen arsip menampilkan pesan singkat dan Buka Arsip.

Tab Semua menyediakan **Cari judul atau isi**. Hasil lintas folder menyebut foldernya. Di dalam folder, pencarian mengikuti cakupan folder terbuka. Jenis dan Tag tetap berlaku bersama kata kunci. Hasil kosong menyediakan **Hapus pencarian** dan memfokuskan kembali kolom. Saat berhasil membuka folder dari dialog pencarian, fokus berpindah ke nama folder.

### 6.5 Profil penulis

Desktop: kolom kiri (nama `heading-lg`, tab Karya · Tentang · Proyek, lalu daftar karya pola feed) dan kolom kanan 320px (avatar 88, nama, jumlah pengikut, bio, negara, genre, tombol Ikuti, streak bila penulis mengizinkan). Ponsel: identitas di atas, tab di bawahnya. **Jangkar (21 November 2026, fase 4b):** nama dalam serif 34/48px yang naik saat dibuka; di kolom identitas tiga angka serif 28px yang bergulung (karya publik, pengikut, mengikuti) di antara dua garis, menggantikan baris "n pengikut · n mengikuti".

### 6.6 Tersimpan, Notifikasi, Statistik

- **Tersimpan:** daftar pola feed.
- **Notifikasi:** tab Semua · Komentar · Proyek. **Dikelompokkan per hari kalender** (21 November 2026, fase 4b, `notification-days.ts`): Hari ini, Kemarin, Minggu ini (2–6 hari), Lebih lama; judul kelompok serif 20px dengan jumlah kecil dan garis `line-strong`, satu daftar dengan judul hari sebagai pemisah, supaya baris tidak dipasang ulang saat pindah kelompok; urutan di dalam kelompok mengikuti urutan lama; baris naik bertahap. Butir: avatar/ikon 32, kalimat (`text-sm`, nama pelaku 500), waktu. Belum dibaca: titik ink 6px di kiri + teks `ink`; sudah dibaca: `ink-muted`. Tugas Editor, Mentor, dan Juri masuk Proyek. Moderasi dan Editor’s Picks masuk Semua. Baris pengelola mengikuti pekerjaan aktif **[usulan]**. Juri lomba anonim hanya melihat label “Karya N” dan nama lomba. Pesan konten yang disembunyikan bisa ditandai dibaca melalui tombol berteks generik. Kerangka memuat bergaris dan galat sebagian mengikuti bagian 8. Jika baris yang sedang difokuskan hilang karena akses atau status berubah, fokus berpindah ke baris status inbox.
- **Statistik:** (21 November 2026) total dalam pita gelap (`app-band`) sebagai angka serif 64/104px tipis yang bergulung naik (`CountUp`), tiga angka kecil di bawah garis; grafik batang monokrom (batang `ink`, sumbu `line`), tanpa gradien, tinggi 240/288px, batang tumbuh dari sumbu berurutan (`rm-bar`) setiap kali grafik dipasang atau satuan waktu berganti.
- **Metrik menulis (N14):** bagian bergaris tipis setelah grafik dan sebelum tabel, dengan Tempo, Hari favorit, Jam favorit, dan Kata berkurang. Keempatnya mengikuti rentang Statistik. Tempo diberi satuan kata per hari menulis. Keterangan menjelaskan bahwa Kata berkurang menjumlahkan selisih ketika jumlah kata turun antarsimpanan, dan penggantian dengan jumlah kata yang sama bernilai nol. Nilai tanpa data menampilkan “Belum cukup data”. Jam memakai zona akun saat penyimpanan. Teks Statistik sengaja hanya Bahasa Indonesia.

### 6.7 Halaman di luar pola Medium

| Halaman | Arah |
| --- | --- |
| Dasbor Streak (tab Streak di dalam Studio, lihat 5.3) | (21 November 2026) Pita gelap `streak-hero.tsx`: "Streak saat ini" sebagai angka serif tipis 88/132px yang bergulung naik, kalimat streak, terpanjang, dan deret titik tujuh hari terakhir (hari ini paling kanan, muncul berurutan); di kanan cincin progres hari ini (lingkaran `line` yang menutup dengan `ink` dari kosong, `role=progressbar`, angka kata bergulung di dalamnya). Di bawah pita: kalimat hari ini dan tombol "Mulai menulis". Tanpa target: pita berisi "Belum ada target harian." dan tombol di bawahnya. Kalender titik tinta 52px per sel (ponsel selebar layar, 48px), titik 20px yang muncul berurutan tiap ganti bulan (`rm-pop`), hover `subtle`. Tiga angka ringkas bergulung. Milestone bertitik 28px |
| Katalog Projects (`/projects`) | Lebar 1040. Judul halaman 40px dengan kalimat kategori tepat di bawahnya. Satu bilah lengket: chip kategori di kiri, dua tombol menu **Status** dan **Biaya** di kanan (slot `end` `StickyChipBar`; di ponsel satu baris di bawah chip). Tombol berbentuk chip bertanda caret, terisi `ink` dan berlabel pilihannya ("Status: Buka") saat menyaring; panelnya `Popover` berisi pilihan tunggal (radio). Klik mouse memilih dan menutup, panah memindah pilihan tanpa menutup, Escape menutup dan fokus kembali ke tombol (21 November 2026). Penyaring tersimpan di alamat. Unggulan sebagai pita gelap bersampul besar (satu proyek = pita lebar; lebih = dua kolom). Daftar berupa grid sampul (2 lajur ponsel, 3 md, 4 lg, 5 xl), tanpa bingkai: sampul 7.6, lalu kategori dan keadaan, judul serif, ringkasan dua baris `ink-soft` (disembunyikan di bawah sm), biaya tebal, sisa kuota, dan tenggat. Ubin naik sekali saat terlihat dengan jeda per lajur. Keadaan proyek berupa teks biasa (bukan pil, agar tidak tertukar dengan status submission 7.4); hanya "Segera tutup" yang tebal. Kosong: kategori tanpa proyek ("Belum ada proyek Solo yang dibuka." + Lihat semua Projects) dan hasil penyaring kosong (+ Hapus penyaring) **[usulan]** |
| Pendaftaran proyek (`/projects/[slug]/daftar`) | Satu kolom 680 dalam kerangka aplikasi, tautan "← Kembali ke proyek" di atas. Urutan: judul, Ringkasan (kategori, biaya, tenggat), Pilih paket (hanya Solo, radio), Ketentuan (pernyataan baku + ketentuan khusus + versi), kotak "Saya sudah membaca dan menyetujui", satu tombol terisi "Daftar" yang nonaktif sampai syarat terpenuhi dengan kalimat alasan di bawahnya. Setelah itu layar status (serif): "Kamu terdaftar." atau "Pendaftaranmu menunggu pembayaran." + tombol "Lihat proyek". Tamu, kuota penuh, dan ditutup: `Notice` satu kalimat + jalan kembali **[usulan]** |
| Kirim karya (`/projects/[slug]/kirim`) | Satu kolom 680 dalam kerangka aplikasi, tautan "← Kembali ke proyek" di atas. Urutan: judul dan satu kalimat aturan (rentang kata, jumlah karya, tenggat), `Notice` bila lomba anonim, Naskah (daftar radio dokumen Studio dengan jumlah kata; dokumen kosong atau yang sudah dikirim tampil nonaktif beralasan), Informasi karya (judul, genre atau jenis buku, sinopsis untuk Solo, catatan editor opsional), kotak pernyataan keaslian, satu tombol terisi "Kirim karya". Tiap aturan yang gagal tampil sebagai pesan di tempatnya dan isian tidak pernah dihapus. Setelah itu layar status (serif): "Karyamu terkirim." + pill Terkirim (7.4) + kalimat tentang salinan beku, dengan "Lihat proyek" (terisi), "Kirim karya lain" bila masih ada jatah, dan "Kembali ke Studio". Di bawah form ada daftar baca "Karya yang sudah kamu kirim". Tamu, belum terdaftar, menunggu pembayaran, ditutup, batas tercapai, dan Kelas: `Notice` satu kalimat + jalan keluar **[usulan]** |
| Proyek saya (`/projects/saya`) | Satu kolom 680 dalam kerangka aplikasi, tautan "← Semua Projects" di atas, judul h1. Satu bagian per proyek yang diikuti: baris kecil kategori dan status pendaftaran, judul serif, lalu tiap karya (judul tautan, satu baris keterangan kata dan waktu kirim, `StatusSubmission` di kanan). Proyek tanpa karya menampilkan status pendaftaran sebagai teks, bukan status submission (7.4). Urutan: yang perlu revisi dulu, lalu aktivitas terbaru. Hairline antar proyek, tanpa kotak. Kosong: kalimat serif + "Lihat Projects"; tamu: `Notice` masuk; gagal baca: `ErrorBanner` + Coba lagi, bukan daftar kosong **[usulan]** |
| Detail kiriman (`/projects/[slug]/kiriman/[id]`) | Satu kolom 680, tautan "← Proyek saya". Kepala: kategori dan proyek, judul h1, satu baris genre, kata, dan waktu, pill status (7.4) dan satu kalimat artinya. Perlu Revisi: bagian "Catatan editor" (serif), tenggat dan putaran, satu tombol terisi "Kirim revisi" (atau `Notice` bila tenggat lewat atau putaran habis). Lalu Informasi karya, Riwayat status (pill, waktu, oleh siapa, alasan), Riwayat versi (nomor, kata, waktu beku, sidik SHA-256 terpotong), dan "Tarik karya" sebagai `danger-text`. Dialog tarik (`alertdialog`) menyebut apa yang tetap tersimpan; tombol konfirmasinya `danger`, satu-satunya yang merah. Fokus pindah ke judul setelah tarik karena pemicunya hilang. Keputusan peninjau tidak lagi diuji lewat panel di sini; dilakukan dari `/kelola/editor` (lihat Kelola, Admin, Juri) **[usulan]** |
| Kirim revisi (`/projects/[slug]/kiriman/[id]/revisi`) | Pola layar Kirim karya: tautan "← Kembali ke karya", judul, putaran dan tenggat, catatan editor, Naskah (dokumen yang sudah dikirim terpilih), catatan opsional, satu tombol terisi "Kirim revisi". Setelah itu layar status serif "Revisimu terkirim." dengan "Lihat karya" **[usulan]** |
| Detail proyek | Kepala berupa pita gelap: kategori dan keadaan, judul `read-title`, ringkasan, dan sampul besar di kanan (di ponsel di atas). Jadwal berupa garis waktu bertitik (titik terisi = sudah lewat). Blok kategori: Antologi dan Kelas sebagai langkah bernomor serif besar (`01`, `02`), pengajar dengan inisial bulat di permukaan `subtle`, paket Solo sebagai permukaan berdampingan (termahal di pita gelap), kriteria Lomba sebagai garis bobot yang terisi saat terlihat dan hadiah sebagai podium tipografis. Sisanya tata letak dokumen satu kolom 680 (tentang, syarat naskah, satu blok khas kategori hanya-baca, jadwal dengan zona waktu proyek, hak cipta), kolom kanan 320 lengket berisi biaya per mata uang, kuota dengan garis 4px, pendaftaran, dan satu tombol aksi sesuai status (Daftar, Masuk untuk mendaftar, Kuota penuh, Pendaftaran ditutup; setelah terdaftar dan aktif: Kirim karya, Pengiriman ditutup, Batas karya tercapai, dengan baris "Karya terkirim: n dari m karya"). Di bawah lg kolom kanan pindah ke bawah judul. Tautan "← Semua Projects" di atas **[usulan]** |
| QRIS | Satu kolom sempit 400: QR di atas latar putih murni (juga di mode gelap, agar terbaca), hitung mundur `tabular-nums`, status sebagai teks besar |
| Masuk, Daftar, Lupa sandi, Verifikasi, Lengkapi profil | Kerangka tanpa navigasi: bilah dengan logo dan kontrol tampilan, satu kolom 416 di tengah. Judul `heading-lg` + satu kalimat, formulir satu kolom dengan label di atas, satu tombol terisi, tautan alternatif sebagai teks di bawahnya. Galat di bawah bidangnya dan fokus pindah ke bidang pertama yang salah; keadaan lain (sandi salah, belum verifikasi, tautan kedaluwarsa, terkunci) sebagai kalimat atau `Notice` di atas bidang **[usulan]** **Pelat kertas pelapis** (21 November 2026): dari lg dua kolom, formulir kiri dan panel gelap `app-band` lengket di kanan berisi kertas marmer berwarna asli (`account/auth-art.ts`: Masuk dan Daftar memakai marmer 1869, Lupa sandi, Atur ulang, Verifikasi, dan Mulai memakai marmer biru-emas c. 1880) dengan satu kalimat serif miring di bawahnya (kamus `account.plate`, ditulis sendiri); di bawah lg strip 140px di atas formulir tanpa kalimat. Dekoratif (`aria-hidden`, `alt=""`). Gerak: pelat "dicetak" (`rm-plate`), judul, kalimat, dan formulir naik (`rm-rise-in`); Verifikasi berhasil memancarkan cincin tinta sekali (`AuthPage celebrate`). |
| Pengaturan akun (`/pengaturan`) | Satu kolom 680 dalam kerangka aplikasi. Bagian bergaris tipis di atas, judul `heading-md`: Informasi pribadi (foto 88, nama, username, bio, negara, zona waktu, genre; email hanya-baca dengan tanda terverifikasi; satu tombol terisi "Simpan perubahan"), Bahasa, Menulis (ukuran teks dan mode Standar sebagai bawaan, posisi baris hanya tampil jika Mesin Tik dipilih, dua sakelar tipografi; simpan langsung dan pesan galat dengan Coba lagi), Privasi dan Notifikasi (kotak centang yang tersimpan seketika), Keamanan (tombol garis membuka dialog), Zona bahaya (satu-satunya merah di halaman: bingkai garis merah, tombol teks merah; tombol merah terisi hanya di dialog konfirmasi yang meminta kata tertentu), lalu Keluar sebagai tombol teks **[usulan]** |
| Kelola kelas Mentor (`/kelola/mentor`, `/kelola/mentor/[slug]`, `.../pengumpulan/[id]`) | Daftar kelas: baris bergaris tipis dengan jumlah "menunggu penilaianmu". Satu kelas: judul, tiga tab sebagai tautan (`?tab=`) Pengumpulan (chip Perlu dinilai, Menunggu perbaikan, Selesai, Semua berjumlah, tabel padat, "Terlambat" sebagai teks), Tugas (baris; satu tombol terisi "Buat tugas"; Ubah dan Hapus teks, Hapus merah hanya bila belum ada pengumpulan; dialog hapus merah), Peserta (tabel hitungan dan `Notice` bahwa hanya pendaftar di perangkat ini yang terlihat). Tinjauan: satu kolom 680, tulisan beku `read-body`, pemilih versi, "Langkah berikutnya" dengan Minta perbaikan (catatan wajib) dan Tandai selesai (catatan opsional), keduanya bergaris; tombol konfirmasi di dialog yang terisi **[usulan]** |
| Proyek Organizer (`/kelola/organizer`, `/baru`, `/[slug]`) | Daftar: chip Aktif, Draf, Terbit, Ditutup, Diarsipkan berjumlah; baris bergaris tipis (judul, kategori, status, peserta, kiriman; "Proyek contoh" bila hanya-baca); satu tombol terisi "Buat proyek". Satu proyek: empat tab tautan (Proyek, Penugasan, Peserta, Kiriman); aksi status (Terbitkan bergaris, Tutup pendaftaran dan Arsipkan teks, Hapus draf merah teks) dengan dialog konfirmasi dan hasil ditulis di baris `role=status` yang menerima fokus; formulir satu kolom 680 dengan bagian bergaris atas (Dasar, Jadwal, Biaya dan kuota, Aturan kiriman, Ketentuan khusus, blok kategori), isian baris-per-butir dengan petunjuk format, satu tombol terisi "Simpan perubahan" atau "Buat draf"; field terkunci memakai `disabled` dan `Notice`. Penugasan: kotak centang per orang, disimpan langsung dan diucapkan. Pembayaran: satu baris dengan status teks dan satu tombol bergaris "Konfirmasi pembayaran" lewat dialog. Tahap: Solo = baris buku dengan tombol bergaris/teks kecil per langkah; Lomba = tahap sekarang, jadwal, tombol langkah ke depan, dialog `alertdialog` yang menyebut pengumuman tidak bisa ditarik; hasil aksi ditulis di baris `role=status` yang menerima fokus. Hasil lomba: daftar berperingkat (`ol`) dengan skor, kotak centang Finalis, lalu Peringkat dan Catatan juri hanya untuk finalis, satu tombol terisi "Simpan hasil", `Notice` keadaan terkunci **[usulan]** |
| Penilaian Juri (`/kelola/juri`, `/[slug]`, `/[slug]/karya/[id]`) | Daftar lomba: baris bergaris tipis dengan progres dan keadaan penilaian. Satu lomba: judul, keadaan penilaian, catatan lomba anonim, chip Belum dinilai · Sudah dinilai · Semua berjumlah, baris "Karya N · judul" dengan skor sendiri; tanpa nama penulis. Satu karya: satu kolom 680, naskah beku `read-body`, lalu formulir "Penilaianmu": `Notice` keadaan penilaian, satu isian angka per kriteria dengan bobot di labelnya dan petunjuk 1 sampai 10, catatan opsional, baris `role=status` untuk hasil, satu tombol terisi "Simpan penilaian" yang hilang saat ditutup (isian jadi `disabled`). Penutupan dan pembukaan kembali ada di tab Tahap Organizer: tombol bergaris, dialog `alertdialog`, pembukaan kembali dengan `ReasonDialog` **[usulan]** |
| Antrean submission Editor (`/kelola/editor`, `/kelola/editor/[id]`) | Antrean: judul, chip penyaring dengan jumlah (Perlu tindakan, Sedang ditinjau, Menunggu revisi, Selesai, Semua; tersimpan di `?status=`), tabel padat; di bawah sm baris menumpuk dengan label. Tinjauan: satu kolom 680, naskah beku `read-body`, pemilih versi, riwayat status, "Langkah berikutnya" hanya langkah yang diizinkan tabel PRD 10.5. Satu tombol terisi: "Mulai tinjau" bila itu satu-satunya langkah; tiga keputusan (Minta revisi, Terima, Tolak) bergaris, dan tombol konfirmasi di dialog yang terisi. Tolak tidak merah **[usulan]**; alasan wajib untuk semua keputusan. Fokus pindah ke judul setelah langkah |
| Admin pengguna dan role (`/kelola/admin`, `/kelola/admin/pengguna/[id]`) | Daftar: kolom cari, chip role, baris bergaris tipis (nama, @handle, role, "Ditangguhkan"). Detail: satu kolom 680 dengan tautan "← Semua pengguna", baris status `role=status` yang menerima fokus, bagian Role (satu baris per role, tombol Beri atau Cabut kecil; yang tak boleh diubah diganti teks "Hanya Super Admin" atau "Super Admin terakhir"), Akun (Tangguhkan merah hanya sebagai teks), Penugasan, Riwayat. Semua perubahan lewat dialog bercatatan; tanpa tombol terisi. |
| Admin moderasi dan audit log (`/kelola/admin/moderasi`, `/[kasus]`, `/audit`) | Bilah tab tautan Pengguna · Moderasi · Audit log di atas. Antrean: chip Baru · Selesai · Semua dengan hitungan, baris bergaris tipis (jenis, penulis, kutipan, jumlah laporan dan alasan teratas, waktu). Kasus: satu kolom 680 dengan tautan "← Antrean moderasi", baris status `role=status` yang menerima fokus, bagian Isi, Alasan laporan (hitungan saja, pelapor tidak tampil), Keputusan sebagai tombol sekunder (Hapus dan Tangguhkan penulis bertulisan merah, tanpa tombol terisi), dialog bercatatan. Audit log: catatan satu kalimat dengan waktu dan alasan, chip jenis, "Muat lebih banyak", tanpa kontrol ubah atau hapus dan pemberitahuan hanya-baca. |
| Admin kurasi dan pengaturan (`/kelola/admin/kurasi`, `/pengaturan`) | Dua tab baru di bilah Admin. Kurasi: satu kolom, bagian Editor's Picks (daftar bergaris tipis dengan Naikkan, Turunkan, Cabut; kotak cari lalu Tambah) dan Proyek unggulan (Tandai atau Lepas), baris status `role=status` di atas yang menerima fokus bila tombolnya hilang. Pengaturan: satu kolom 576, satu isian Tautan komunitas, satu tombol terisi Simpan, Hapus tautan sebagai tombol teks, keduanya lewat dialog konfirmasi. Di sisi pengguna: tautan teks "Komunitas" (ikon panah keluar) di sidebar dan Beranda, dan bagian "Unggulan" di atas daftar Projects tanpa filter. |
| Grup Penulis (`/grup`, `/grup/[id]`) | Daftar satu kolom 680, tautan kembali ke Beranda, satu tombol terisi Buat grup dan tombol bergaris Masukkan kode. Undangan memiliki Terima dan Tolak. Bagian Grup saya dan Grup publik memakai baris bergaris, nama, label Publik/Privat, dan jumlah anggota. Nonanggota hanya melihat ringkasan grup publik. **Segel grup** (21 November 2026, fase 4b, `group-seal.tsx`): lingkaran berisi huruf awal nama dalam serif, cincin titik satu per anggota (maks. 24, muncul berurutan), nada `ink` atau kertas dan kemiringan dari id grup; 48px di baris daftar (berputar saat hover), 128/144px di kepala detail. Kepala detail = pita gelap: segel, "Grup publik/privat", nama serif 30/40px, jumlah anggota serif 48px bergulung, deskripsi. Detail anggota berisi baris anggota, cuplikan, dan Progres dengan dialog pratinjau yang menerangkan informasi yang dibagikan. Keluar lewat dialog konfirmasi; hasil tetap tampil di baris `role=status` yang menerima fokus. Tautan privat bagi nonanggota memakai keadaan Tidak tersedia. **[usulan]** |
| Admin Grup Penulis (`/kelola/admin/grup`, `/kelola/admin/grup/[id]`) | Tab Grup di Admin. Daftar baris bergaris, dengan peringatan apabila tidak ada Admin Grup. Detail menampilkan identitas, kode yang dapat diganti, undangan, dan anggota. Admin Grup memakai kontrol kelola yang sama di detail grup sendiri. Keluarkan dan Cabut Admin Grup menggunakan dialog bercatatan. Hasil perubahan tampil di baris status. Tindakan sensitif masuk kategori Grup di Audit log. **[usulan]** |
| Event umum (`/event`, `/event/[id]`, Studio) | Pintu masuk dari Beranda. **Lembar kalender** (21 November 2026, fase 4b, `date-leaf.tsx`, `event-face.ts`): bulan di pita `ink`, tanggal serif besar, hari; dihitung di zona event. Daftar berupa baris bergaris (bukan kartu) dengan lembar 56px yang terangkat saat hover, judul, status, jadwal, peserta, hitung mundur ("Mulai dalam 2 hari 3 jam", "Berakhir dalam …", "Event sudah selesai"), dan ringkasan. Kepala detail = pita gelap: lembar besar, status dan peserta, judul serif 30/40px, jadwal, target kata serif 48px bergulung, hitung mundur dengan garis yang terisi selama event berjalan (teks biasa, bukan live region). Detail satu kolom dengan jalan kembali, satu aksi utama sesuai status, aturan, waktu sprint, dan nama yang tersaring berdasarkan grup aktif. Progres pribadi memakai garis monokrom dan hasil sprint sebagai teks. Studio menampilkan hitung mundur dari jam selesai dan tombol kembali ke event. Dialog gabung memilih dokumen dan menjelaskan privasi. Dialog keluar mengembalikan fokus ke baris status setelah pemicu hilang. **[usulan]** |
| Kelola Event (`/kelola/organizer/event`, `/baru`, `/[id]`) | Daftar baris bergaris dengan jumlah peserta dan satu tombol terisi Buat event. Form satu kolom berisi informasi, jadwal dan peserta, serta sprint opsional. Bidang terkunci memakai isian nonaktif dengan penjelasan. Tautan ke detail publik dan jalan kembali selalu tersedia pada layar terkait. **[usulan]** |
| Kelola, Admin, Juri | Kepadatan pengelola: tabel 14px, baris 44px, header lengket, tanpa zebra, filter di atas sebagai chip. Panel juri: teks karya `read-body` di kiri, kriteria dan skor di kanan, identitas penulis tidak pernah dirender |

### 6.8 Discover (pola Explore Substack)

Halaman untuk menemukan tulisan di luar yang diikuti. PRD menetapkan delapan kategori: Trending Today, New Writers, Editor's Picks, Most Appreciated, Most Saved, Hidden Gems, Indonesia Writers, Malaysia Writers. Kategori tanpa isi disembunyikan.

1. **Baris chip kategori** di atas, bisa digulir mendatar, lengket di bawah bilah atas. Chip pil `subtle`; terpilih memakai isian `ink`. Chip pertama "Semua".
2. **Grid lajur campuran (20 November 2026, pola Explore Substack).** Lebar halaman 1280. Lajur menurut lebar kontainer: 4 dari 1240px, 3 dari 896px, 2 dari 576px, di bawahnya daftar biasa pola 6.2. Jarak antarlajur dan antarubin 24px. Kepadatan dari masonry terukur (`useRowSpan`: baris grid 4px, tiap ubin merentang setinggi isinya, `grid-auto-flow: dense`), jadi ubin lebar dan sempit saling mengisi tanpa celah. Satu halaman 12 ubin (habis dibagi 2, 3, 4). **Reveal:** tiap ubin naik 12px dan memudar masuk (500ms `--ease-out`, `translate` dan `opacity` saja) **sekali**, saat pertama terlihat (`useRevealOnce`, IntersectionObserver, tanpa observer langsung tampil); jeda bertingkat 60ms per lajur (maks. 180ms) supaya satu baris mengalir dan ubin di bawah tidak menunggu; ubin dari "Muat lebih banyak" dan pergantian kategori memakai cara yang sama; mati total saat reduced motion.
3. **Ubin**: permukaan `subtle` tanpa garis, sudut siku, tanpa bayangan, **satu tingkat saja**. Bentuk (`tileForm`):
   - **Catatan:** teks serif 16/26 langsung, dipotong 8 baris.
   - **Karya:** `feed-title`, `feed-excerpt` tiga baris.
   - **Sampul** (karya dengan foto lanskap, lebar ≥1,25× tinggi): foto selebar ubin di atas, ubin merentang **dua lajur** mulai 3 lajur, judul 26/34.
   - **Bergambar** (karya dengan foto lain): foto selebar ubin di atas judul, satu lajur.
   - **Sisip** (catatan dengan foto): teks dulu, foto di dalam padding di bawahnya, tinggi maksimal 352px.
   Foto memakai rasio dan **warna aslinya** (keputusan user 20 November 2026: tidak dibuat hitam putih; WebP 900px), tanpa teks di atas gambar dan tanpa gradien. Di bawah ubin: apresiasi dan komentar kecil di kiri, Simpan di kanan. Di daftar ponsel foto menjadi thumbnail 80×53 di kanan.
4. **Tombol "Muat lebih banyak"** (sekunder) di akhir, bukan gulir tanpa batas, supaya footer tetap terjangkau dan posisi tidak hilang.
5. Tidak ada banner promosi di atas grid dan tidak ada pengisi ruang (tulisan yang diiklankan, ajakan membuat akun) di antara ubin.
6. **Guard terhadap rasa media sosial:** ubin tanpa gambar adalah bawaan; grid yang didominasi foto berarti penulis melampirkan foto, bukan desain yang memaksanya. Data contoh memakai foto domain publik dari moodboard pada 9 dari 19 postingan (di bawah setengah, dijaga tes). Penulis boleh melampirkan **satu** gambar per postingan lewat Tulis postingan (20 November 2026): teks alternatif wajib, gambar diperkecil ke 1600px dan disimpan ulang sebagai WebP di perangkat (EXIF kamera ikut hilang). Angka apresiasi ditampilkan kecil dan tidak dipakai sebagai pengurut utama kecuali di kategori Most Appreciated.

### 6.9 Halaman postingan dengan balasan (pola halaman catatan Substack)

> **Detail artikel (20 November 2026, kerangka Medium):** urutan satu kolom 680: label, judul, byline, baris cakupan publik, **foto utama** bila ada (selebar layar di ponsel, selebar kolom dari md; tanpa keterangan, tanpa kredit, tanpa radius; `alt` dari penulis), teks serif dengan **drop cap** hanya untuk prosa (bukan Puisi), bilah aksi, baris meta, **kartu penulis** "Ditulis oleh" (avatar 56, bio, Ikuti), komentar, "Lainnya dari {penulis}" (maks. 3), lalu Tulisan terkait. Foto profil sendiri tampil di semua entri milikmu (`AuthorAvatar`); penulis contoh tetap memakai inisial.

> Implementasi (langkah 5): kolom 680 di tengah; di ponsel bilah aksi lengket di bawah menggantikan bilah navigasi dan memuat menu ⋯ (semua aksi berupa ikon dengan angka atau `aria-label`, tanpa label teks, supaya muat di 375px; 21 November 2026), bilah atas hanya panah kembali. Ubin Jelajahi memakai container query (3 kolom ≥ 896px, 2 kolom ≥ 576px, di bawahnya daftar bergaris).

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

Status tugas Kelas Menulis (`StatusTugas`) memakai bahasa yang sama dan tidak dicampur dengan tabel di atas: Belum dikumpulkan (garis putus-putus), Lewat tenggat dan Selesai (garis `line-strong`, Selesai dengan centang), Dikumpulkan (garis `line`), dan **Perlu perbaikan** (satu-satunya yang terisi). Sebelum kelas dimulai tugas hanya berupa teks "Belum dibuka" [usulan].

### 7.5 Penanda visibilitas

Selalu di dekat judul dokumen dan di dialog Bagikan: ikon + teks `text-xs`. **Pribadi** (gembok), **Grup: Nama Grup** (dua orang), **Publik** (globe). Mengubah ke Publik selalu lewat dialog yang menyebut persis teks mana yang akan tampil.

### 7.6 Sampul proyek (21 November 2026)

`projects/components/project-cover.tsx`, model murni `projects/cover-model.ts`. **Poster unggahan (22 November 2026, permintaan client):** Organizer boleh mengunggah satu poster per proyek (`ProjectBase.poster`, `projects/components/poster-cover.tsx`); poster menggantikan sampul tipografis di semua tempat `ProjectCover` dipakai, dipotong `object-cover` ke bingkai 4:5 yang sama, tanpa judul tercetak di atasnya. Sampul tipografis di bawah ini tetap menjadi cadangan: proyek tanpa poster, atau poster yang berkasnya hilang dari perangkat. Selama berkas dimuat bingkai berupa blok `subtle` polos (tanpa kedipan sampul otomatis). Poster dekoratif (`aria-hidden`) di mana pun kecuali kepala detail proyek (`describe`), yang membacakan teks alternatif karena poster biasanya berisi tulisan. Sampai backend ada, poster hanya terlihat di perangkat Organizer. Selain itu setiap proyek punya sampul tipografis yang digambar dari dirinya sendiri: rasio 4:5, dua nada (`ink`: hitam bertinta putih; `paper`: `subtle` bertinta hitam), warnanya tetap di dua tema seperti `BookCover`. Pola mengikuti kategori: **Antologi** tumpukan garis halaman (satu garis tebal), **Lomba** roset cincin dan gerigi, **Kelas** kertas bergaris dengan garis margin dan satu goresan pena, **Solo** huruf awal judul raksasa dengan bingkai tipis. Nada dan varian (0–2: perataan, cincin putus-putus, garis margin ganda) diturunkan dari hash slug, jadi satu proyek selalu sama di semua layar. Label kategori di pojok kiri atas; judul hanya dicetak di sampul besar (`showTitle`). Gerak: sampul menggambar dirinya saat ubin terlihat (`data-cover-reveal` tanpa `data-seen`), dan saat ditunjuk (`rm-cover-host`, hanya pointer halus) naik 6px dengan polanya bergerak (garis memanjang, roset berputar 60°, goresan digambar ulang, huruf naik). Dekoratif (`aria-hidden`); judul selalu ada sebagai teks.

### 7.7 Layar pencapaian (21 November 2026)

`projects/components/milestone-hero.tsx`: pita gelap berisi sampul proyek (masuk dengan `rm-cover-enter`), kalimat serif 30/40px yang naik, lalu fakta (status, salinan beku, biaya). Tombol lanjut di bawah pita. `celebrate` menyalakan cincin tinta yang melebar dari sampul, hanya untuk momen itu sendiri (bukan saat halaman dibuka lagi). Dipakai: Terdaftar, Menunggu pembayaran (tanpa cincin), Pembayaran diterima, Karyamu terkirim, Revisimu terkirim.

**Langkah di antara detail dan pencapaian** (21 November 2026): `projects/components/project-strip.tsx` (`ProjectStrip`). Kepala kecil di bawah tautan kembali: sampul 48px, kategori `text-xs`, judul proyek; naik sekali (`rm-rise-in` tanpa jeda). Dipakai Daftar, Bayar (menunggu, kedaluwarsa), Kirim karya, Kirim revisi, detail kiriman (`linked`: judul menaut ke proyek karena jalan kembalinya ke Proyek saya), halaman Tugas Kelas, dan semua layar "tidak bisa dibuka" (`titleAs="h1"`, sehingga nama proyek tidak tercetak dua kali). Judul layar tidak lagi mengulang nama proyek ("Daftar", "Kirim karya"). Tidak dipasang di layar yang memakai `MilestoneHero`.

**Pita dasbor** (21 November 2026): `projects/components/dashboard-band.tsx` (`DashboardBand`, `BandFigure`). Pita gelap seperti layar pencapaian: sampul `showTitle`, keterangan ("Dasbor kelas", "Dasbor penerbitan"), h1 serif 26/32px, lalu satu angka besar serif 44/56px. Kelas: persen progres bergulung (`CountUp`) dengan bilah 4px `progressbar` dan "Mentor: …" di dalam pita; kalimat asal angka tetap di bawah pita. Solo: "N/M" tahap yang berjalan (`soloFigure` di `solo/solo-model.ts`, `stagePosition` di `stage-model.ts`, menghitung Pengajuan), atau status dalam kata (`BandFigure words`, 26/30px) sebelum naskah diterima. Tombol tetap di bawah pita.

**Kepala Pengaturan** (21 November 2026): `account/components/settings/settings-head.tsx` (`SettingsHead`) di bawah h1 "Pengaturan akun": avatar 88px (`rm-pop`), nama serif 30/40px dan @username (`rm-rise-in`), seperti kepala profil publik, lalu Ganti foto · Hapus foto (`PhotoControls`). Isian foto ada di kepala saja (satu foto per halaman): fotonya milik formulir, jadi foto baru langsung tampil sebagai pratinjau dan tersimpan lewat "Simpan perubahan"; nama dan username tetap nilai tersimpan. Bukan heading. Tanpa garis sendiri, karena bagian di bawahnya sudah bergaris atas. Onboarding `/mulai` tetap memakai `PhotoPicker` di dalam formulir.

### 7.8 Pita peran Kelola (21 November 2026)

Kelola adalah "dunia lain": layar utama tiap area dibuka pita gelap `RoleBand` (`kelola/components/role-band.tsx`, model murni `kelola/role-band.ts`) supaya pengelola langsung tahu ia sedang bekerja, bukan menulis. Isi pita: baris kecil "Ruang kerja · {peran}", judul layar serif 28/36px (h1 layar), satu kalimat, **satu angka kerja** serif 56/88px yang bergulung (`CountUp`; "—" saat memuat, disembunyikan bila data gagal dibaca karena layar di bawahnya sudah menyebut galatnya), dan satu tautan teks ke pekerjaan utamanya (tombol terisi tetap di permukaan halaman, mis. "Buat proyek"). Tautan hilang saat angkanya nol, kecuali Organizer ("Kelola Event").

| Peran | Penanda (`role-mark.tsx`) | Angka | Jalan masuk |
|---|---|---|---|
| Editor | lembar naskah dengan tanda koreksi (coret, sisip, lingkar) | karya Perlu tindakan | filter Perlu tindakan |
| Juri | tiga bobot kriteria di atas skala 1–10 | karya belum dinilai di lomba yang penilaiannya dibuka | lomba pertama yang masih punya |
| Mentor | daftar tugas yang dicentang satu per satu | pengumpulan menunggu penilaian | kelas pertama yang punya |
| Organizer | garis tahap dengan simpul dan bendera tenggat | proyek aktif | Kelola Event |
| Administrator | matriks titik, satu per pengguna (cincin = ditangguhkan) | kasus moderasi Baru | Moderasi |

Penanda adalah SVG tipografis sekeluarga dengan sampul proyek (7.6), `aria-hidden`, memakai gerak yang sudah ada: garis `rm-page-line`, goresan `rm-ring` (pathLength 1), titik dan tanda `rm-pop`, gerigi `rm-bar` (`.rm-mark` memberi `transform-box: fill-box`). Pita hanya di layar utama area; layar dalam (tinjauan, detail kelas, skor) tetap padat tanpa pita. Admin memasang pita di layout hanya di akar tiap tab, dengan nama area sebagai teks biasa karena h1 milik tab. `/kelola` memakai `RoleBandLink`: satu pita ringkas per area yang dipegang (seluruh pita satu tautan, naik bertahap `rm-row-in`, grid dua kolom dari xl). Ponsel: penanda 64px di samping judul, angka di bawahnya. Reduced motion: semua langsung tampil. Pita ini tampilan, bukan kontrol akses.

### 7.9 Gerak tambahan (fase 6, 21 November 2026)

Hasil `find-animation-opportunities`; sengaja sedikit, hanya momen langka dan satu perbaikan. (1) Titik `GroupSeal` membesar dari pusatnya sendiri (`.rm-seal-ring .rm-pop` dengan `transform-box: fill-box`). (2) "Postinganmu sudah terbit." naik bertahap seperti layar pencapaian (`rm-rise-in`) dan garis ringkasannya tergores dari kiri (`rm-page-line`), tetap tanpa confetti. (3) Pemenang lomba masuk dari juara terakhir ke juara 1 (`rm-row-in`, jeda tak seragam, `winnerStep`), lalu label "Juara 1" muncul sekali (`rm-pop`). (4) Titik tahap Solo berganti warna 300ms dan tahap yang berjalan muncul sekali. (5) `<details>` materi kelas dan Bantuan Studio memakai `.rm-details` (`::details-content` 0 ke `auto`, 250ms, `interpolate-size`); peramban tanpa dukungan langsung terbuka. **Ditolak:** pop pada Apresiasi dan Simpan, skala tekan pada `Button`, animasi ulang grafik saat ganti periode, pencarian Ctrl+K, tab, chip filter, dan indikator simpan Editor (terlalu sering dipakai atau data yang sedang dibaca).

### 7.x Tombol tema dan bahasa

Dua kontrol tampilan ada di bilah atas landing, aplikasi, dan bingkai tamu [usulan]. Dari md ke atas: tombol bahasa (menu, ikon Translate, butir aktif bertanda "Aktif") dan tombol tema (ikon Sun atau Moon sesuai tema yang tampil; satu klik membalik Terang dan Gelap). Di bawah md keduanya digabung menjadi satu menu "Tampilan dan bahasa" (lembar bawah) agar bilah ponsel tidak sesak. Pilihan tema disimpan di cookie dan dipasang sebelum cat pertama; tanpa pilihan tersimpan, tema otomatis mengikuti sistem (tidak ada opsi "Ikuti sistem" di antarmuka; pilihan pengguna menimpanya). Saat tema berganti lewat tombol, tema baru terungkap sebagai lingkaran yang membesar dari tombol itu (View Transitions, 500 ms, ease-out); di layar sempit asalnya tombol menu. Reduced motion atau browser tanpa dukungan: berganti seketika. Papan `/sistem-desain` tidak memakai efek ini.

## 8. Keadaan halaman

| Keadaan | Aturan |
| --- | --- |
| Memuat | Skeleton berbentuk konten asli (baris judul, dua baris cuplikan) dengan latar `subtle`, tanpa shimmer bila reduced-motion. Di bawah 300ms tidak ditampilkan. |
| Kosong | Satu kalimat serif `heading-md` yang menyatakan keadaan + satu aksi. Contoh: "Belum ada tulisan di sini." · [Mulai menulis]. Tanpa ilustrasi orang generik. **Kosong pertama kali** (21 November 2026, fase 4a) memakai pelat domain publik **berwarna asli** di atas kalimat (`EmptyState art`, `EmptyPlate`, daftar dan sumber di `lib/empty-art.ts`, berkas di `public/empty/`). Gambar diambil dari moodboard aset dan **tidak boleh sama** dengan gambar di landing atau Community (keputusan user 21 November 2026; warna asli juga keputusan user, pengecualian tertulis dari palet monokrom, sama seperti foto Community): Dokumen tingkat teratas = perempuan menulis di meja (Millais), Beranda belum mengikuti = halaman terbuka Hikayat Amir Hamzah beraksara Makassar, Tersimpan = interior perpustakaan c. 1700, Notifikasi = gravir mercusuar Eddystone 1703, Proyek saya = ruang gravir Lanman 1916, Grup saya = Membaca berdua (Millais), Event = awan di atas ladang (Dahl), karya profil = gravir mawar liar. Tinggi 160/192px, lebar mengikuti gambar, tanpa keterangan, `alt=""`. Gambar harus terbaca sebagai makna layarnya, bukan sekadar belum dipakai (studi tangan Dürer di Dokumen dibuang 21 November 2026 karena terbaca sebagai potret). Dokumen memakai `layout="side"`: pelat 96/112px di kiri, kalimat dan tombol di kanan (bertumpuk di bawah sm), dan kotak "Cari judul atau isi" tidak tampil selama belum ada dokumen aktif (tetap tampil bila ada kata kunci). Gerak: naik sekali, gambar "timbul" dari cetakan pucat ke warnanya, lalu bergeser sangat pelan (22 detik bolak-balik); diam saat reduced motion; sedikit diredupkan di mode gelap. Hasil penyaring atau pencarian kosong, folder kosong, Sampah, Arsip, dan tabel Kelola tetap teks saja. |
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

Teks RanahMenulis ditulis seperti penulis yang rapi dan jujur: yakin tanpa berseru, spesifik tanpa memamerkan diri. Kartu suara lengkap, daftar kata yang tidak dipakai, dan teks landing yang sudah ditulis ulang ada di [docs/produk/Copy Landing RanahMenulis.md](docs/produk/Copy%20Landing%20RanahMenulis.md). Ringkasnya:

- Kata ganti "kamu". Kalimat 8-16 kata. Tanpa tanda seru dan tanpa humor.
- Istilah tetap: Studio, Streak, Community, Projects; draf (belum dikirim), naskah (sudah dikirim ke proyek), tulisan (umum).
- Hero paling punya suara; FAQ, form, dan galat datar dan ramah.
- Setiap klaim harus punya baris di PRD. Fitur Fase 2 (sertifikat, pembayaran ringgit) dan AI tidak disebut.
- Uji: bila nama produk dihapus dan kalimat masih cocok untuk aplikasi lain, tulis ulang.
