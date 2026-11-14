Hitam putih, netral, terasa seperti membaca, bukan seperti dasbor. Sumber: DESIGN.md v0.2 bagian 4, 7, dan 9. Semua butir bertanda **[usulan]** mengisi celah di DESIGN.md dan menunggu persetujuan.

## Cara membaca papan ini

- **Halaman 1, Warna** dan **Halaman 2, Tipografi dan bentuk** ada di grup *Halaman* pada daftar komponen.
- **Halaman 3, Komponen** adalah semua kartu di grup Dasar, Lapisan, Navigasi, Produk, Keadaan, dan Landing. Setiap kartu menampilkan mode terang dan gelap berdampingan.
- Token mesin ada di `tokens.json`; kelas komponen ada di `components/bundle.css` (awalan `rm-`).

## Prinsip

1. **Tulisan adalah antarmukanya.** Kotak, ikon, dan hiasan harus membuktikan diri dulu.
2. **Hitam memberi tahu yang penting.** Satu isian tinta per layar.
3. **Garis, bukan kotak.** Pemisah adalah garis 1px `line` dan ruang kosong. Permukaan diam tidak berbayangan.
4. **Dua kepadatan, satu keluarga.** Dunia penulis lapang; dunia pengelola padat. Token sama.
5. **Penulis selalu tahu siapa yang bisa melihat karyanya.** Penanda visibilitas tidak pernah tersembunyi.

## Warna

- Latar halaman `canvas`; teks utama `ink`; meta dan cuplikan `ink-muted`; placeholder `ink-faint` hanya di atas `canvas` atau `surface`.
- Lapisan mengambang memakai `surface` + border 1px `line` + `shadow-float` (gelap: tanpa bayangan). Overlay dialog `rgba(0,0,0,0.4)` tanpa blur.
- Isian tinta (`ink`) dengan teks `on-ink`: tombol primer, chip terpilih, status Perlu Revisi, toast, tombol Tulis.
- **Merah** (`danger`, `danger-subtle`) hanya untuk pesan galat, border field galat, banner gagal memuat, pembayaran ditolak, dan tindakan yang tidak bisa dibatalkan. Tidak untuk status Ditolak, Belum tersinkron, angka, grafik, notifikasi, atau hiasan. Merah tidak pernah menjadi satu-satunya penanda: selalu ada ikon dan teks.
- Abu-abu adalah abu murni. Tidak ada warna merek dan tidak ada gradien.

## Tipografi

- Serif `--font-serif` (Source Serif 4, optical size aktif) untuk judul karya, teks karya, cuplikan, angka besar, judul landing, dan judul sampul. Wordmark bukan teks: pakai berkas logo.
- Tidak ada label kecil di atas judul, di halaman mana pun.
- Sans `--font-sans` (Schibsted Grotesk, masih usulan DESIGN.md) untuk semua antarmuka.
- Kolom baca maksimal 680px. Jarak antarparagraf 1.4em, tanpa indentasi, tanpa rata kanan-kiri. Puisi `white-space: pre-wrap`.
- Angka yang dibandingkan memakai `tabular-nums`. Bobot di atas 600 tidak dipakai. Italic hanya dari isi karya dan kutipan.
- Judul memakai `text-wrap: balance`.

## Bentuk, spasi, gerak

- Dua radius: `radius-full` (tombol, chip, avatar, kolom cari, toolbar format, pill status) dan `radius-0` (semua yang lain).
- Spasi kelipatan 4: `space-1` … `space-24`. Landing menambah `space-32` dan `space-40` [usulan].
- Gerak: 120ms (hover, press), 200ms (menu, laci, dialog), 300ms (perayaan streak), kurva `cubic-bezier(0.2, 0, 0, 1)`. Hanya `opacity` dan `transform` yang dianimasikan; perubahan warna latar terjadi seketika.
- Teks tidak pernah di bawah 11px, termasuk di miniatur dan cuplikan. Tidak ada animasi masuk saat gulir dan parallax. `prefers-reduced-motion`: perubahan instan.
- Fokus keyboard: outline 2px `ink`, offset 2px, di semua elemen interaktif.

## Logo

- Pakai berkas asli dari aset grup Logo: `v-hitam-png.png` di terang, `v-putih-png.png` di gelap dan di bagian daftar tunggu yang dibalik. Monogram R saja (`monogram-hitam.png` hasil potong `logo-hitam.png`, `logo-putih-aja.png`) untuk bilah editor dan bilah atas ponsel aplikasi.
- Jangan menggambar ulang, mengganti dengan huruf serif, atau memberi warna. Wordmark minimal 28px, ruang bebas setinggi huruf "r". Rincian di komponen Logo.

## Sampul buku

Sampul hitam berjudul serif putih dalam tiga ukuran (64, 160, 300–360). Logo tidak tampil di muka sampul, kecuali monogram kecil di pojok kanan bawah atau punggung [usulan]. Rincian di komponen SampulBuku.

## Ikon

Phosphor Regular (usulan DESIGN.md), 20px di UI dan 24px di navigasi; aktif memakai varian Fill. Ikon hanya untuk navigasi dan aksi. Ikon di papan ini **digambar ulang** mengikuti gaya Phosphor karena paketnya tidak bisa dimuat di pratinjau; ganti dengan paket asli saat implementasi.

## Isi dan nada

- Bahasa Indonesia yang wajar, ditulis sungguhan. Contoh tulisan harus bagus: prolog cerpen, puisi pendek, nama seperti Rinjani Putri dan Hafiz Rahman.
- Tombol berupa kata kerja + objek: "Kirim ke proyek", "Mulai menulis". Tanpa tanda seru beruntun.
- Microcopy pendek dan hangat: "Tersimpan", "Lanjutkan menulis".
- Tidak ada angka, testimoni, atau logo mitra karangan. Fakta yang belum pasti ditulis `[konfirmasi client]`.

## Dilarang

Tampilan shadcn bawaan; Inter, Geist, Playfair Display, Fraunces, Instrument Serif/Sans, Space Grotesk; label kecil huruf kapital di atas setiap judul; gradien, glassmorphism, blur, blob, glow; grid tiga kolom berikon bulat; ikon hiasan dan emoji; lorem ipsum; dasbor penuh widget berkotak; animasi masuk saat gulir, parallax, kartu terangkat saat hover; lebih dari satu tombol terisi per layar.

## Daftar [usulan]

| Butir | Usulan | Alasan |
| --- | --- | --- |
| Press tombol | Primer opacity 0.72; sekunder latar `line`; teks bergaris bawah | DESIGN.md hanya menentukan hover |
| Label tombol berbahaya | `on-ink`, bukan putih tetap | Putih di atas `danger` gelap hanya 2,2:1 |
| Placeholder di atas `subtle` | `ink-muted` | `ink-faint` di atas `subtle` terang 4,1:1, gagal AA |
| Form sukses | Ikon centang + teks `ink` 500, tanpa hijau | Belum ditentukan; menjaga monokrom |
| Status pill | Tinggi 24, `text-xs`, Draf bergaris putus `ink-faint` | Ukuran dan warna garis belum ditentukan |
| Bagian terbalik | Memakai set token tema lawan | Input, chip, fokus, dan galat tetap terbaca |
| Email sudah terdaftar | Kabar netral, bukan galat merah | Tidak ada yang gagal dari sisi pengunjung |
| Tombol hero | Tinggi 48, padding 28, 16px | DESIGN.md hanya punya 40 dan 32 |
| Bilah atas landing | 64px desktop, 52px ponsel. Tombol sekunder selama tombol hero terlihat, primer setelah tombol hero lewat, kembali sekunder saat bagian daftar tunggu terlihat. Garis rambut bawah muncul setelah halaman digulir | Menjaga tepat satu isian tinta per layar |
| Judul bagian landing | `landing-h2` serif 42/52 400, −0.025em (ponsel 32/40), juga untuk pernyataan kepercayaan | Satu suara dengan judul hero |
| Hero ponsel | Hanya editor dan sampul; halaman bernomor disembunyikan | Teks di bawah 11px tidak dipakai di mana pun |
| Grid landing | 1200px, 12 kolom, gutter 24, margin 48/16 | Belum ada di DESIGN.md |
| Jarak antarbagian landing | 128 dan 160 (ponsel 80) | Brief 6.1 |
| Kolom hero | Judul 880px, penjelas 560px `read-subtitle` | Judul 96px pecah dua baris seimbang |
| Akordeon | Pertanyaan serif 22/32, tanpa animasi buka | Belum ditentukan |
| Bingkai cuplikan | Border 1px `line`, tanpa bayangan dan tanpa jendela tiruan | Belum ditentukan |
| Skeleton | Denyut opacity 1,2 detik | DESIGN.md hanya melarang shimmer saat reduced-motion |
| Label rail tablet | `text-xs` | DESIGN.md menyebut "label kecil" |
| Minggu di kalender | Mulai Senin | Kebiasaan kalender Indonesia dan Malaysia |
| Lembar bawah | Tanpa pegangan seret | Ditutup lewat tombol atau overlay |
| Monogram minimal | 20px | DESIGN.md 4.8 hanya menentukan wordmark 28 |
| Sampul buku | Rasio 1:1,43; margin 10%; judul 11% lebar, 4 baris (panjang: 9%, 5 baris); penulis di kiri bawah | Belum ada di DESIGN.md |
| Sampul di gelap | Tetap hitam #191919 dengan garis 1px `line` | Tanpa garis, sampul tenggelam di #121212 |
| Logo di sampul | Hanya monogram 6% di pojok kanan bawah atau punggung | Sampul milik penulis, bukan milik platform |

## Aplikasi, putaran 1 [usulan]

Ditambahkan untuk layar Editor Studio, Dasbor Streak, dan Beranda (kanvas "RanahMenulis Aplikasi"). Satu warna baru: `ink-read` [usulan]. Tidak ada radius baru.

- **Variabel CSS** di `components/variabel.css`: token warna, huruf, radius, spasi, dan opasitas sebagai variabel, untuk kanvas Design. Dimuat sebelum `components/bundle.css`. `tokens.json` tetap sumbernya.
- Komponen baru: ToolbarFormat, DialogKonflik, KartuPrompt, Milestone (dengan perayaan `rm-dot-fill`), StatistikRingkas, BlokHariIni, LangkahAwal, DeretanPenulis, Pemberitahuan. Kelas tambahan: `rm-editor`, `rm-sel`, `rm-caret`, `rm-focus-hud`, `rm-pop`, `rm-radio`, `rm-tag`.

| Butir | Usulan | Alasan |
| --- | --- | --- |
| Seleksi teks di editor | Latar `line` | Monokrom, terbaca di dua mode |
| Format aktif di toolbar | Garis bawah 2px `on-ink` | Tidak ada warna kedua di atas `ink` |
| Pindah ke sampah | Butir menu biasa, bukan merah | Bisa dipulihkan dari Sampah; merah hanya untuk yang tidak bisa dibatalkan |
| Dialog konflik | Tanpa tombol tutup, `Esc` tidak menutup; tiga pilihan termasuk "Simpan keduanya" | BR-STD-04: tidak pernah menimpa diam-diam |
| Perbedaan versi | Tambahan: latar `subtle` + garis bawah. Hapusan: coret `ink-muted` | Tanpa hijau dan merah |
| Belum tersinkron | Indikator + popover penjelasan saat indikator diklik | Menenangkan tanpa toast |
| Milestone terkunci | Cincin putus-putus `ink-faint`, sisa syarat sebagai fakta | Dibedakan dengan isi, bukan warna |
| Perayaan target | Cincin hari ini terisi lewat `transform: scale`, 300 ms, sekali | DESIGN.md 7.3; gerak hanya opacity dan transform |
| Pemberitahuan netral | Latar `subtle` + ikon info | Zona waktu dan target baru bukan galat |
| Blok Hari ini | Label 160px di kiri, garis atas `line-strong` | Baris bergaris, bukan widget |
| Deretan penulis | Titik karya baru 12px `ink` bercincin `canvas` | DESIGN.md menyebut 8px; 8px tenggelam di atas avatar 56 |
| Teks karya gelap `ink-read` | #d2d2d2 di atas #121212, 12,4:1; terang tetap #191919 | ink #ededed 16:1 terasa menyilaukan untuk menulis larut malam. Dipakai di `rm-editor` (editor dan mode fokus) |
| Kalender ponsel | `rm-cal--touch`: sel minimal 48px; desktop tetap 36px | Target sentuh 44px |
| Perlu Revisi bergaris | `rm-status--revisi-line` di Beranda | Satu isian tinta per layar: tombol Lanjutkan menulis |
| Angka di meta | `rm-meta`, `rm-save`, `rm-feed-foot` memakai angka proporsional | Titik ribuan dan jam (“14.02”, “Rp150.000”) tampak renggang dengan tabular di Schibsted Grotesk. Tabel, statistik, dan angka figure tetap tabular |
| Bilah tab | Garis digambar dengan `box-shadow` inset | Border bermargin negatif memunculkan scrollbar vertikal di bilah yang bisa digulir |

## Aplikasi, revisi 1b [usulan]: Studio dan Streak satu modul

Mengikuti DESIGN.md 5.3 dan keputusan client (catatan keputusan butir 3): Streak adalah fitur di dalam Studio, bukan modul ketiga. Tiga modul inti tetap Studio, Community, dan Projects. Tidak ada warna atau radius baru.

| Butir | Usulan | Alasan |
| --- | --- | --- |
| Tab halaman Studio | Dua tab bergaris bawah di bawah judul "Studio": **Dokumen** dan **Streak**. Dasbor Streak menjadi isi tab Streak | Satu modul, satu navigasi. Tab bantuan editor (Kit inspirasi · Prompt) tidak berubah |
| Sidebar desktop | Streak menjadi sub-butir menjorok di bawah Studio (`rm-nav-item--sub`, tinggi 36, tanpa ikon) | DESIGN.md 5.1 |
| Baris progres di tab Dokumen | `rm-today-line`: "Hari ini 320 / 500 kata" + garis progres 160px, satu baris, membuka tab Streak | Penghubung dua arah (DESIGN.md 5.3) |
| Indikator target di editor | Lihat komponen **IndikatorTarget** (revisi 1c). Bukan tombol terisi | Penghubung dua arah tanpa menambah isian tinta |
| Bilah bawah ponsel | Dua varian dibandingkan: lima tab (PRD 16) dan empat tab (`rm-bottombar--4`). PRD 16 menetapkan lima tab; empat tab adalah usulan. **[konfirmasi]** ke client | Lihat papan "Bilah bawah ponsel" |
| Teks karya gelap | `ink-read` #d2d2d2 hanya untuk `rm-editor` (teks karya). 12,4:1 pada canvas, 11,5:1 pada surface | Lebih lembut dari ink 16:1; UI tetap ink |
| Kalender Streak | Desktop 36px sesuai komponen. Ponsel saja `rm-cal--touch` 48px | Target sentuh |

**Perbaikan render:** `.rm-stat span` dan `.rm-kit-item span` kini memakai selektor anak langsung. Runtime kanvas membungkus setiap isian `{{ }}` dalam `<span>`, sehingga selektor turunan ikut mengecilkan angka statistik dan nama kit inspirasi.

## Aplikasi, revisi 1c [usulan]: menulis menggerakkan Streak

Mengikuti DESIGN.md 5.4 dan PRD 8.1 (STK-02, STK-03, BR-STK-01..08). Streak tidak diisi manual: setiap simpan otomatis di Studio mengirim perubahan kata bersih, dan Streak menambahkannya. Tidak ada warna, radius, atau gerak baru.

| Butir | Usulan | Alasan |
| --- | --- | --- |
| IndikatorTarget | Komponen baru, empat keadaan: berjalan, tercapai, melebihi, offline. Angka berubah setelah simpan otomatis, bukan setiap ketukan | Sebab-akibat terlihat di tempat menulis |
| Label pembeda | Dokumen "167 kata"; indikator "468 / 500 hari ini" dengan cincin. Tooltip "Kata hari ini dari semua dokumen" | Dua angka tidak tertukar |
| Saat tercapai | Hanya cincin terisi sekali (`rm-dot-fill`, 300ms). Kalimat streak naik ada di popover dan tab Streak | Tidak memotong menulis |
| Popover indikator | Tiga dokumen teratas hari ini, streak saat ini, "Buka Streak" | STK-03 dalam bentuk ringkas |
| Offline | "· tercatat saat tersambung"; angka lokal tetap bergerak, tanpa lompatan setelah sinkron | BR-STK-02 |
| Teks tempel besar | Dihitung sebagian, catatan netral di popover. **[konfirmasi]** ambang dan perilakunya (Q-08) | BR-STK-05 belum ditetapkan |
| Rincian hari di tab Streak | Mengetuk hari menampilkan kata per dokumen; "Mulai menulis" menyebut dokumen terakhir yang dibuka | STK-03; DESIGN.md 5.4 butir 6-7 |

## Aplikasi, revisi 1d [usulan]: koreksi ke PRD v0.2

Enam koreksi agar papan tidak mengklaim lebih dari PRD. Tidak ada komponen, token, warna, radius, atau bayangan baru.

| Butir | Usulan | Alasan |
| --- | --- | --- |
| Menu ⋯ dokumen | Tanpa "Riwayat versi": Kirim ke proyek, Ekspor, Pindah ke sampah | Riwayat versi di PRD hanya untuk submission; riwayat versi dokumen adalah Fase 2 |
| Penanda butir feed | Baris bawah diawali "Prolog" atau "Cuplikan" + jenis tulisan, waktu baca opsional ("Prolog · Esai · 2 menit baca", "Cuplikan · Cerpen") | COM-01: postingan Community MVP hanya prolog atau cuplikan, maksimal 500 kata |
| Sumber feed | Hanya penulis yang diikuti dan Grup; tidak ada konteks Kelas | Sumber feed di PRD |
| Sampah | "Dokumen di Sampah bisa dipulihkan", tanpa angka hari dan tanpa tanggal hapus permanen di meta. **[konfirmasi]** Q-12 | Lama simpan belum diputuskan |
| Statistik kosong | "Belum cukup data untuk statistik. Tulis beberapa hari, lalu angkanya muncul di sini." Ambang **[konfirmasi]** | Tujuh hari bukan angka PRD |
| Menghapus tulisan hari ini | **[konfirmasi]** BR-STK-04 usulan (mengurangi) vs Q-08 default (tidak mengurangi); dua opsi berdampingan di papan baru. Bila mengurangi dipilih, usulan: status tercapai ikut dicabut agar angka dan cincin tidak bertentangan | PRD bertentangan |
| Bilah bawah ponsel | PRD 16 lima tab; empat tab tetap usulan, **[konfirmasi]** ke client | Belum ada keputusan client tertulis |

## Aplikasi, putaran 2 [usulan]: Community MVP (R3)

Jelajahi, halaman postingan, dan tulis postingan di kanvas aplikasi (PRD 17.4, COM-01, 03, 04, 05, 06, 09, 10, STD-10). Acuan pola: Explore dan halaman catatan Substack, tanpa oranye, kaca, gradien, banner promosi, atau Subscribe. Tidak ada komponen `rm-` baru, token, warna, radius, atau bayangan baru; kelas papan memakai awalan lokal `dc-`, `ps-`, `tp-`.

| Butir | Usulan | Alasan |
| --- | --- | --- |
| Ubin Jelajahi | Border 1px `line`, radius 0, tanpa bayangan, padding 20; grid masonry 3 kolom (tablet 2), ponsel daftar bergaris seperti ButirFeed | Acuan client memakai ubin satu tingkat; satu-satunya pengecualian dari "garis, bukan kotak" |
| Bentuk ubin | Catatan pendek (teks serif dulu, "Cuplikan · Puisi dari “judul”" di bawah), prolog bertajuk, prolog bergambar (gambar 3:2 di atas, judul di luar gambar) | Judul selalu di luar gambar; COM-01 tetap punya judul |
| Chip kategori | `rm-chip` dalam baris lengket di bawah bilah atas; chip terpilih menjadi satu-satunya isian ink di Jelajahi | Pola Explore; satu isian tinta per layar |
| Butir sidebar Jelajahi | Di bawah Beranda, ikon kompas. Ponsel: lewat ikon cari di bilah atas | Bilah bawah tidak punya tempat; papan Beranda belum mengikuti |
| Penanda cakupan publik | Baris bergaris atas-bawah dengan ikon globe: "Prolog dari: [judul karya] · hanya bagian ini yang publik"; di akhir "Akhir prolog." | STD-10, US-11: pembaca dan penulis tahu ini bukan karya penuh |
| Komentar | Sans 15/24 (bukan serif) agar terbedakan dari karya; balasan satu tingkat indentasi 24; "Lihat balasan lainnya" tombol teks selebar kolom | COM-05; acuan halaman catatan |
| Baris redup komentar | Komentar disembunyikan atau dilaporkan menjadi satu baris `ink-muted` + ikon + tombol teks | Tanpa kotak di dalam kotak |
| Hapus komentar oleh penulis | `rm-menu-item--danger` + dialog konfirmasi | Tidak bisa dibatalkan; Sembunyikan tetap teks biasa |
| Bilah aksi ponsel | Lengket di bawah, 56px, garis atas 1px, menggantikan bilah bawah navigasi di halaman postingan | Aksi dekat ibu jari tanpa kapsul kaca |
| Pemilih bagian dokumen | Blok terpilih: latar `subtle` + `rm-check` terisi; tidak terpilih: teks `ink-muted` | Memakai komponen yang ada; tanpa warna sorot |
| Penghitung kata postingan | "135 / 500 kata" + `rm-progress`; lewat batas: angka, garis, dan pesan `danger` dengan ikon | AC-15: pesan jelas tanpa kehilangan isi |
| Visibilitas postingan | Tanpa pilihan bawaan; Terbitkan aktif setelah Publik atau Grup dipilih. Grup hanya untuk anggota, **[konfirmasi]** Q-38 | BR-COM-01: publik hanya bila diatur eksplisit |
| Pesan privasi tulis postingan | `rm-notice` berikon gembok, selalu tampil, tidak bisa ditutup | STD-10, Q-16 |
| Gambar pada postingan | Tempat gambar berlabel di ubin bergambar. **[konfirmasi]** COM-01 tidak menyebut gambar | Bentuk ubin diminta client |

