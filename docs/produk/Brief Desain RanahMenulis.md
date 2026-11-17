# Brief Desain RanahMenulis (MVP + Landing Page)

Sumber: PRD v0.2 (bagian 2, 4, 8, 11, 15, 16, 17, 20), roadmap MVP (`MVP Scope RanahMenulis.md`), catatan keputusan client. Semua yang berlabel **Usulan** adalah rekomendasi saya, bukan keputusan founder.

Pembaca dokumen ini: desainer atau Claude Design. Bagian 8 berisi prompt siap tempel.

---

## 1. Yang harus dipahami sebelum mendesain

**Produk.** Aplikasi web responsif yang mengantar orang dari satu paragraf sampai buku terbit, dalam satu akun. Tiga modul: Studio (menulis + Streak), Community (dibaca), Projects (Antologi, Solo, Kelas, Lomba). Pasar: Indonesia dan Malaysia. Bahasa antarmuka MVP: Indonesia.

**Perasaan yang dikehendaki (PRD 2):** "Terasa seperti platform buku dan penerbitan, bukan dasbor SaaS generik dan bukan media sosial umum." Studio sengaja **tidak** meniru Microsoft Word. Dokumen pribadi tidak pernah tampil publik otomatis.

**Pengguna utama (hipotesis, PRD 4):** penulis pemula, penulis aktif, calon penulis buku, peserta kelas/lomba, pembaca, serta sisi kerja (Organizer, Editor, Juri/Mentor, Admin). Dua dunia berbeda: **dunia penulis** (tenang, fokus, hangat) dan **dunia kerja pengelola** (padat, jelas, cepat dipindai). Keduanya harus terasa satu keluarga, tetapi kepadatannya boleh berbeda.

**Yang sudah diputuskan (November 2026):** client memilih **hitam putih, netral, mendekati Medium** (aplikasi Medium setelah masuk, bukan halaman depannya). Merah disetujui client untuk galat dan tindakan berbahaya; mode gelap wajib. Wafi juga memberi referensi aplikasi Substack di ponsel; yang diambil hanya pola tata letaknya (DESIGN.md bagian 2.1). Rinciannya ada di [DESIGN.md](../../DESIGN.md), yang menjadi sumber utama token dan komponen. **Belum ada:** logo; huruf final menunggu uji spesimen.

## 2. Arah visual (diputuskan)

Pegangan: tipografi bacaan adalah pahlawannya, bukan kartu dan ikon. Detail lengkap ada di [DESIGN.md](../../DESIGN.md). Ringkasnya:

- **Rasa:** seperti membaca di Medium: tenang, netral, tulisan menjadi pusat layar. Bukan dasbor SaaS, bukan media sosial umum.
- **Tipografi:** Source Serif 4 untuk judul dan teks karya; sans grotesk untuk antarmuka (usulan Schibsted Grotesk). Teks bacaan 20/32, kolom maksimal 680px (NFR-10). Uji dengan teks Indonesia sungguhan.
- **Warna:** monokrom netral, latar putih, abu-abu murni. Merah hanya untuk galat dan tindakan yang tidak bisa dibatalkan. Mode terang dan gelap, keduanya lulus WCAG AA (NFR-09).
- **Bentuk:** dua radius saja: pill untuk tombol, chip, dan avatar; tanpa radius untuk yang lain. Pemisahan dengan garis tipis, bukan kartu berbayangan.
- **Gerak:** hemat. Dipakai untuk memberi kabar (tersimpan, streak naik), bukan hiasan. Hormati `prefers-reduced-motion`.
- **Konten nyata:** semua contoh karya, nama, dan angka di desain harus masuk akal dan ditulis sungguhan (bahasa Indonesia yang wajar, bukan terjemahan), tidak lorem ipsum, tidak nama "John Doe".

Tiga arah sebelumnya (Kertas & Tinta, Perpustakaan Malam, Cetak) tidak dipakai lagi.

## 3. Aturan lintas layar (dari PRD)

| Aturan | Sumber |
| --- | --- |
| Setiap halaman punya keadaan **memuat, kosong, dan galat** yang dirancang, plus tampilan mobile | 17 |
| Titik henti: desktop (bilah navigasi tetap, Studio punya mode fokus), tablet (navigasi ringkas ikon+label), smartphone (bilah bawah: Beranda, Studio, Streak, Projects, Profil; aksi Tulis cepat; Kelola dan Admin lewat menu profil) | 16 |
| Indikator simpan dan jumlah kata di Studio terlihat tanpa membuka menu | 16 |
| Notifikasi dari ikon di bilah atas semua halaman | 16 |
| Guest yang menekan aksi butuh-akun diarahkan masuk, lalu kembali ke tujuan semula | 16 |
| Halaman proyek menampilkan jalur kembali dan status peserta (belum daftar, terdaftar, menunggu pembayaran) | 16 |
| Mata uang IDR dan MYR tampil sesuai negara; total terlihat sebelum bayar; tanggal dan zona waktu per pengguna | 11, 22 |
| Aksesibilitas: keyboard, pembaca layar, kontras cukup (arah WCAG 2.1 AA) | NFR-09 |
| Halaman publik (karya, profil, proyek) punya pratinjau berbagi yang rapi (Open Graph) | NFR-16 |

## 4. Inventaris layar MVP, per rilis roadmap

Prioritas desain mengikuti urutan rilis. **Layar bertanda ★ adalah yang paling menentukan kesan produk** dan sebaiknya didesain paling matang lebih dulu.

### R1. Akun & platform
| Layar | Hal yang harus dipecahkan desain |
| --- | --- |
| Daftar, Masuk, Lupa sandi, verifikasi email | Singkat dan hangat; galat jelas; email belum terverifikasi: ajakan kirim ulang |
| Onboarding profil (nama, username, negara, zona waktu, genre) | Zona waktu terisi otomatis; jelaskan singkat bahwa zona waktu memengaruhi streak |
| Dashboard / Beranda ★ | **Belum ada di PRD.** Usulan: blok "Hari ini" di atas feed Beranda, bukan halaman terpisah. Lihat bagian 4A |
| Pengaturan akun, privasi, notifikasi | Peringatan efek ubah zona waktu terhadap streak; pilihan tampilkan streak di profil (default privat) |
| Notifikasi | Daftar, tandai dibaca, tautan ke objek; kosong |

### R2. Studio + Streak (jantung produk)
| Layar | Hal yang harus dipecahkan desain |
| --- | --- |
| Editor ★★ | Kanvas menulis yang tenang: hanya bold, italic, heading, kutipan, daftar. Mode fokus. Penghitung kata/karakter/paragraf. **Indikator simpan tiga keadaan: Menyimpan, Tersimpan, Belum tersinkron.** Menu Bagikan, Kirim ke proyek, Ekspor. Drawer bantuan: kit inspirasi dan perpustakaan prompt (tombol salin) |
| Dialog konflik ★ | Dua versi berdampingan, pilih salah satu atau gabungkan; wajib diselesaikan; tidak pernah menimpa diam-diam |
| Daftar dokumen & folder | Cari, urutkan, folder; penanda "sudah dibagikan" dan "sudah dikirim ke proyek"; kosong: ajakan menulis |
| Sampah | Pulihkan atau hapus permanen |
| Dasbor Streak ★ | Progres hari ini vs target, streak saat ini dan terpanjang, kalender bulan (hari capai target / ada tulisan / kosong), tombol Mulai menulis. Perayaan kecil saat streak naik tanpa norak |
| Statistik, Milestone | Kata per hari/minggu/bulan, rata-rata, hari terbaik; milestone terbuka dan terkunci |

### R3. Community
| Layar | Hal yang harus dipecahkan desain |
| --- | --- |
| Tulis postingan | Pilih cuplikan dari dokumen Studio atau tulis langsung; batas 500 kata; pratinjau; **jelas bahwa yang publik hanya teks yang dipilih** |
| Feed ★ | Kartu postingan yang menghormati tulisan (bukan seperti media sosial umum); apresiasi, komentar, bookmark; pengguna baru kosong: arahkan ke Discover |
| Discover | Delapan kategori (Trending Today, New Writers, Editor's Picks, Most Appreciated, Most Saved, Hidden Gems, Indonesia Writers, Malaysia Writers); kategori kosong disembunyikan |
| Halaman postingan | Tata letak membaca yang nyaman, komentar bersusun, bagikan, laporkan; ditarik/dihapus: halaman tidak tersedia |
| Profil penulis publik ★ | Identitas literasi: bio, negara, genre, portofolio, followers; streak dan hasil proyek **hanya bila penulis memilih** |
| Bookmark | Daftar tersimpan |
| Moderasi (sisi admin) | Antrean laporan dengan konteks |

### R4. Projects fondasi + pembayaran
| Layar | Hal yang harus dipecahkan desain |
| --- | --- |
| Pusat Projects, daftar per kategori | Empat kategori, penyaringan (kategori, status, biaya), kartu dengan biaya, sisa kuota, deadline |
| Detail proyek ★ | Tema, persyaratan, biaya per mata uang, jadwal, ketentuan hak cipta, tombol aksi yang berubah sesuai status (Daftar, Kirim Karya, Kuota penuh, Deadline lewat) |
| Pendaftaran | **Persetujuan hak cipta wajib dibaca dan disetujui**; ringkasan biaya |
| Pembayaran QRIS | Kode QR, hitung mundur penahanan kuota, status menunggu/terkonfirmasi/ditolak, unggah bukti (mode semi-manual) |
| Kirim karya ★ | Formulir, pemilih naskah dari Studio, hasil validasi per aturan tanpa menghapus isian, konfirmasi |
| Proyek saya, Detail submission | **Delapan status** (Draf, Terkirim, Dalam Peninjauan, Perlu Revisi, Revisi Terkirim, Diterima, Ditolak, Ditarik); riwayat versi; feedback editor; tombol Kirim Revisi/Tarik |
| Kelola proyek (Organizer) | Buat/ubah proyek, jadwal, kuota, penugasan, daftar peserta, konfirmasi pembayaran |

### R5. Empat kategori
| Layar | Hal yang harus dipecahkan desain |
| --- | --- |
| Antrean submission (Editor) | Hanya yang ditugaskan; baca versi beku; feedback dan keputusan |
| Panel penilaian (Juri) ★ | Karya **anonim** (identitas tersembunyi), kriteria dan skor per kriteria, catatan; keadaan "penilaian ditutup" |
| Dasbor Solo | Lini masa tahap (pengajuan, editing, proofreading, cover, layout, persetujuan final, produksi, selesai), berkas pratinjau, tombol setujui final |
| Dasbor Kelas, Halaman tugas | Jadwal, materi, tugas, feedback mentor, bilah progres |
| Halaman hasil Lomba | Finalis, pemenang, ringkasan kriteria; belum diumumkan |

### R6. Grup & admin
| Layar | Hal yang harus dipecahkan desain |
| --- | --- |
| Grup saya, tulisan anggota | Hanya tulisan yang dibagikan ke grup (usulan PRD; Q-38 belum final) |
| Kelola anggota (Admin Grup) | Tambah/keluarkan; lebih dari satu admin grup |
| Admin: pengguna & role | Pemberian role Administrator hanya tampil untuk Super Admin; tindakan sensitif butuh konfirmasi |
| Admin: grup, moderasi, kurasi, audit log | Audit log hanya baca, tanpa tombol ubah/hapus |

## 4A. Spesifikasi Dashboard / Beranda (SEMENTARA, ditinjau ulang setelah desain jadi)

Padanan di PRD: **PLT-10**, Q-49, US-41/42, AC-D1..D3 (ditandai sementara). Bila desain mengubah susunan blok atau penempatannya, perbarui kedua dokumen bersamaan.

**Konflik yang harus dipecahkan lebih dulu.** PRD (bagian 16) menetapkan "Beranda" = feed Community, dan bilah bawah ponsel hanya berisi Beranda, Studio, Streak, Projects, Profil. Artinya **Beranda satu-satunya pintu ke Community di ponsel**. Bila Dashboard menggantikan Beranda, Community hilang dari navigasi ponsel.

**Usulan: Dashboard bukan halaman terpisah, melainkan bagian atas Beranda.** Pengguna yang masuk melihat blok "Hari ini" yang ringkas, lalu feed di bawahnya. Tidak ada tab tambahan, tidak ada perubahan navigasi PRD. Alternatif (tidak disarankan): halaman "Ringkasan" terpisah, yang menambah satu tujuan navigasi dan menggeser Community.

| Hal | Spesifikasi |
| --- | --- |
| Tujuan | Menjawab "apa yang perlu aku lakukan sekarang?" dalam satu pandangan, lalu mengantar ke modul yang tepat |
| Aksi utama | **Lanjutkan menulis**: membuka dokumen terakhir yang diedit. Bila belum punya dokumen: Mulai menulis |
| Tampil untuk | Registered User ke atas. Guest melihat feed saja (tanpa blok ini). Pengguna yang masuk dari Landing diarahkan ke sini (PRD 17.1) |
| Prinsip | Tinggi blok ini paling banyak satu layar ponsel di atas lipatan; sisanya feed. Bukan kumpulan widget: setiap blok punya satu kegunaan dan hilang bila tidak ada isinya |

**Isi blok, berurutan menurut prioritas** (semua data sudah ada di fitur MVP):

| Urutan | Blok | Isi | Sumber PRD | Tampil bila |
| --- | --- | --- | --- | --- |
| 1 | Lanjutkan menulis | Judul dokumen terakhir, jumlah kata, waktu ubah terakhir, tombol lanjutkan | STD-03 | Selalu |
| 2 | Progres hari ini | Kata hari ini terhadap target, streak saat ini; mengetuk membuka Dasbor Streak | STK-01, 04 | Sudah ada target. Belum: ajakan menetapkan target |
| 3 | Perlu perhatian | Daftar singkat hal yang menunggu tindakan pengguna, paling banyak 3 butir: Perlu Revisi dengan catatan editor, pembayaran menunggu konfirmasi (dengan sisa waktu penahanan kuota), tugas kelas mendekati deadline, undangan grup | Status submission 10.5, PLT-07, KLS-03, 15.4 | Ada butir. Bila kosong, blok hilang |
| 4 | Proyek saya | Satu sampai dua pendaftaran aktif dengan status dan deadline berikutnya; tautan "Lihat semua" | Proyek saya (17.5) | Punya pendaftaran |
| 5 | Notifikasi baru | Jumlah belum dibaca dan satu butir terbaru (ikon notifikasi tetap di bilah atas) | PLT-04 | Ada yang belum dibaca |
| 6 | Feed | Postingan penulis yang diikuti; pengguna baru diarahkan ke Discover | COM-03 | Selalu |

**Varian per peran** (blok "Perlu perhatian" berganti isi, struktur tetap):

| Peran | Isi "Perlu perhatian" |
| --- | --- |
| Writer / Registered User | Seperti tabel di atas |
| Organizer | Pendaftaran menunggu konfirmasi pembayaran, submission baru, proyek mendekati deadline |
| Editor | Jumlah submission yang ditugaskan dan belum diberi keputusan |
| Juri | Karya yang belum dinilai dan tenggat penilaian |
| Mentor | Pengumpulan tugas yang belum diberi feedback |
| Administrator, Super Admin | Laporan moderasi yang belum ditangani, grup tanpa Admin Grup |

Orang yang memegang beberapa peran melihat butir gabungan, dibatasi tiga, dengan tautan ke Kelola atau Admin untuk sisanya.

**Pengguna baru (belum ada data).** Daftar tiga langkah yang mengikuti perjalanan inti PRD 13.1, dan hilang setelah selesai: lengkapi profil (negara, zona waktu), tetapkan target harian, tulis dokumen pertama. Tidak ada lencana, poin, atau konfeti.

**Keadaan.** Memuat: kerangka tiap blok. Galat: tiap blok gagal sendiri dengan tombol coba lagi, tanpa mematikan feed. Kosong: blok hilang, bukan menampilkan "tidak ada data".

**Yang sengaja tidak ada di Dashboard MVP:** grafik statistik (itu di halaman Statistik), jumlah followers, angka apresiasi total, rekomendasi buatan algoritma, iklan atau banner promosi. Semuanya menambah keramaian dan tidak menjawab "apa yang harus kulakukan sekarang".

**Catatan data.** Semua blok membaca fitur yang sudah ada di R1–R4. Dashboard sendiri tidak menambah tabel baru, hanya satu kueri ringkasan per pengguna. Itu sebabnya ia aman dibangun belakangan, setelah Studio dan Projects ada isinya; di R1 cukup kerangka dengan blok 1, 2, dan feed.

## 5. Keadaan penting yang harus didesain eksplisit

1. **Simpan**: Menyimpan, Tersimpan, Belum tersinkron (offline), konflik.
2. **Streak**: belum ada target, hari berjalan, target tercapai, streak putus, milestone terbuka.
3. **Status submission**: delapan status dengan tampilan berbeda dan siapa yang bisa mengubahnya (PRD 10.5).
4. **Pembayaran**: menunggu, dikonfirmasi, ditolak, kuota habis sebelum konfirmasi.
5. **Visibilitas**: pribadi vs publik vs grup, harus selalu jelas bagi penulis (kekhawatiran utamanya adalah karya bocor).
6. **Lomba anonim**: tampilan juri vs tampilan Organizer.
7. **Akses ditolak** dan **halaman tidak tersedia** (karya ditarik).

## 6. Brief Landing Page (final, dikerjakan pertama)

**Tujuan.** Halaman promosi pra-peluncuran. Aplikasi belum ada, jadi satu aksi utama: **bergabung ke daftar tunggu**. (PRD 17.1 mendefinisikan Landing: pesan nilai, cuplikan karya, ajakan daftar; pengguna yang sudah masuk diarahkan ke Beranda.) Landing dikerjakan **paling awal** karena sekaligus menguji arah visual di DESIGN.md sebelum layar aplikasi dibuat.

**Rasa yang diminta client:** mahal, profesional, modern, seperti Medium. Hitam putih, netral.

**Pengunjung.** Penulis (pemula sampai calon penulis buku), peminat kelas dan lomba, pembaca. Datang dari Instagram, Threads, WhatsApp, kebanyakan lewat ponsel.

**Pesan inti:** satu perjalanan dari satu paragraf sampai buku terbit; naskah yang ditulis sekali dipakai di semua tempat tanpa menulis ulang; penulis tetap memegang karyanya.

### 6.1 Apa arti "mahal" di sini

Mahal bukan berarti banyak efek. Medium terasa mahal karena **menahan diri**. Terjemahannya:

| Ciri | Wujudnya |
| --- | --- |
| Huruf yang dirancang | Judul serif besar (Source Serif 4, bobot 400, tracking rapat), teks yang benar-benar enak dibaca, `text-wrap: balance` pada judul, angka tabular |
| Ruang kosong yang berani | Satu ide per layar; jarak antarbagian 128–160px di desktop; tidak semua ruang diisi |
| Ketepatan | Satu grid 12 kolom, tepi kiri yang sama untuk semua bagian, garis rambut 1px sebagai satu-satunya pemisah |
| Sedikit elemen | Satu tombol terisi per layar, tidak ada ikon hiasan, tidak ada lencana, tidak ada kartu bertumpuk |
| Produk yang nyata | Cuplikan tampilan aplikasi dibuat seteliti produk asli (indikator "Tersimpan", jumlah kata, kalender titik tinta, status "Diterima"), bukan kotak abu-abu |
| Tulisan yang indah | Contoh paragraf, puisi, dan judul karya ditulis sungguhan dan bagus, karena halaman ini menjual tulisan |
| Gerak yang jarang | Satu momen di hero, sekali saat dimuat. Selebihnya diam |
| Satu kejutan kontras | Satu bagian saja yang dibalik (latar `ink`, teks putih): bagian daftar tunggu |

### 6.2 Susunan halaman (final)

1. **Bilah atas:** logo wordmark (`public/logo/`, bukan huruf serif) di kiri; kanan: tautan "Cara kerja", "Projects", "Tanya jawab", lalu tombol pill "Gabung daftar tunggu" (menggulir ke form). Di ponsel: wordmark + tombol saja.
2. **Hero:** satu pernyataan, satu kalimat penjelas, satu tombol, satu visual. Visual: transformasi paragraf yang diketik → halaman bernomor → sampul buku hitam berjudul serif putih. Bergerak sekali saat dimuat; cadangan statisnya ketiga tahap tersusun bertingkat.
3. **Cara kerja: satu naskah, empat langkah.** Menulis → Streak → Dibagikan → Terbit, sebagai garis waktu bergaris rambut. Tiap langkah: satu kalimat + satu cuplikan tampilan nyata (bilah editor, kalender titik tinta, butir feed, status "Diterima" di antologi).
4. **Projects: empat jalur**, disusun seperti daftar isi buku (bergaris, bukan grid kartu): Antologi, Buku Solo, Kelas Menulis, Lomba. Tiap jalur satu kalimat tentang apa yang didapat penulis.
5. **Kepercayaan:** tiga pernyataan bertipografi besar seperti kutipan: draf pribadi tetap pribadi; versi yang dikirim tidak ikut berubah saat draf diedit; hak cipta tetap milik penulis kecuali disetujui lain di awal.
6. **Daftar tunggu** (satu-satunya bagian berlatar `ink`): judul, form nama panggilan, email, negara (Indonesia/Malaysia/lainnya), minat opsional (chip: Menulis rutin, Antologi, Buku solo, Kelas, Lomba, Membaca). Keadaan: kirim, sukses, galat, email sudah terdaftar.
7. **Tanya jawab** 5–6 butir, akordeon bergaris. Grup Penulis dan dua negara dijelaskan di sini, tidak perlu bagian sendiri.
8. **Footer** kecil: wordmark, "Indonesia · Malaysia", tautan Kebijakan privasi dan Kontak.

Bagian "tiga modul" dari versi sebelumnya dilebur ke bagian 3 supaya halaman lebih pendek dan lebih tenang.

### 6.3 Aturan isi

- **Jangan mengarang** angka pengguna, testimoni, logo mitra, atau tanggal rilis. Yang boleh: fakta dari PRD.
- Jangan menjanjikan MYR untuk pembayaran (baru Fase 2) atau aplikasi Play Store/App Store (setelah web stabil).
- Soal AI: keputusan client adalah **tanpa fitur AI di dalam aplikasi**; bila disebut di publik, konfirmasi ke client dulu.
- Soal biaya: menurut rapat 8 November 2026, fitur MVP dilepas tanpa langganan, sedangkan program Projects punya biaya per program. **Konfirmasi ke client** sebelum ditulis di Tanya jawab.
- Tampilan produk adalah ilustrasi (aplikasi belum rilis); jangan menaruh keterangan panjang di bawah gambar.
- Contoh tulisan di visual ditulis sungguhan dan indah.

### 6.4 Hal teknis

Responsif mobile-first (390 lalu 1440); kontras AA; bisa dibaca saat gerak dimatikan; mode terang utama, mode gelap mengikuti token DESIGN.md; metadata Open Graph (pratinjau WhatsApp/Threads, gambar 1200×630 hitam putih dengan judul serif); form dengan keadaan kirim, sukses, galat; tidak ada gambar yang gagal tampil.

## 7. Daftar anti-generik (checklist untuk setiap layar)

Dilarang:
- Gradien ungu/biru, glassmorphism, kartu mengambang bertumpuk, hiasan blob.
- Hero "Unleash your creativity" atau terjemahannya ("Wujudkan kreativitasmu!"); judul tanpa isi.
- Grid tiga kolom ikon bulat + judul + dua baris teks sebagai satu-satunya struktur.
- Foto stok orang tersenyum di depan laptop; emoji sebagai ikon; ikon gambar sendiri yang meniru logo asli.
- Statistik, testimoni, atau ulasan karangan.
- Dasbor abu-abu penuh widget; angka besar tanpa makna.
- Teks lorem ipsum atau nama contoh generik; terjemahan kaku dari bahasa Inggris.
- Animasi masuk pada setiap kartu saat gulir; parallax pada teks.

Diharuskan:
- Satu ide per bagian, satu aksi utama per layar.
- Tipografi bacaan yang sungguh-sungguh dirancang; ruang kosong yang disengaja.
- Konten nyata dan spesifik pada setiap mock.
- Satu sistem: satu pasang tombol, satu gaya kartu, satu skala radius, satu skala heading.
- Setiap layar punya keadaan kosong, memuat, galat.
- Baca kalimat keras-keras: bila terdengar seperti iklan umum, tulis ulang.

## 8. Prompt untuk Claude Design

Pakai berurutan. Tiap prompt berdiri sendiri; tempel brief ini (atau bagian yang relevan) sebagai konteks bila perlu. Tool-agnostic, tidak bergantung pada fitur spesifik.

### Prompt 1: Landing page (kerjakan pertama)

Lampirkan DESIGN.md dan bagian 6 brief ini bersama prompt.

```
Kamu desainer produk senior dengan selera editorial, terbiasa merancang untuk penerbit dan platform baca seperti Medium. Rancang landing page pra-peluncuran RanahMenulis. Hasilnya harus terasa mahal, profesional, dan modern, setara Medium, tanpa meniru Medium.

Lampiran: DESIGN.md (sistem desain, sumber utama token) dan Brief bagian 6. Bila ada yang bertentangan, DESIGN.md yang menang.

PRODUK
RanahMenulis adalah aplikasi web untuk penulis Indonesia dan Malaysia. Penulis menulis di Studio (dengan target kata harian dan Streak), membagikan karya ke Community, lalu membawa naskah yang sama ke Projects: Antologi, Buku Solo, Kelas Menulis, dan Lomba, tanpa menulis ulang. Aplikasi belum rilis. Satu-satunya aksi halaman ini: gabung daftar tunggu.

ARAH VISUAL (sudah diputuskan, jangan diganti)
- Hitam putih netral. Terang: latar #ffffff, teks #191919, teks redup #5e5e5e, garis #e6e6e6, latar halus #f3f3f3. Gelap: latar #121212, teks #ededed, teks redup #a3a3a3, garis #2e2e2e. Tidak ada warna lain; merah #b3261e hanya untuk pesan galat form.
- Huruf: Source Serif 4 untuk judul dan semua contoh tulisan (judul besar bobot 400, tracking rapat); Schibsted Grotesk untuk antarmuka, navigasi, tombol, dan label.
- Radius hanya dua: pill untuk tombol, chip, dan avatar; 0 untuk semua yang lain. Tanpa bayangan pada permukaan diam.
- Pemisah adalah garis rambut 1px dan ruang kosong, bukan kartu.

APA ARTI "MAHAL" DI SINI
Mahal karena menahan diri, bukan karena efek:
- Tipografi yang dirancang: judul hero serif besar (desktop sekitar 88-96px, ponsel 44-48px), text-wrap balance, teks isi yang enak dibaca.
- Ruang kosong yang berani: satu ide per layar, jarak antarbagian 128-160px di desktop.
- Ketepatan: grid 12 kolom, satu tepi kiri untuk semua bagian, perataan yang presisi.
- Satu tombol terisi per layar. Tanpa ikon hiasan, lencana, atau kartu bertumpuk.
- Cuplikan aplikasi dibuat seteliti produk asli dengan isi nyata, bukan kotak abu-abu.
- Satu bagian saja berlatar hitam (daftar tunggu) sebagai kejutan kontras.
- Gerak hanya satu momen di hero, sekali saat dimuat. Selebihnya diam.

SUSUNAN HALAMAN
Urutan dan isi bagian sudah ditetapkan. Komposisi tiap bagian bebas kamu tentukan: penempatan di grid, skala, ritme, cara cuplikan aplikasi ditata, dan bagaimana bagian berpindah ke bagian berikutnya. Bentuk yang kusebut di bawah (garis waktu, daftar isi) adalah arah, bukan cetakan; ganti bila kamu punya cara yang lebih kuat dan jelaskan alasannya.
1. Bilah atas: logo wordmark dari berkas yang disediakan (bukan huruf serif) di kiri; kanan "Cara kerja", "Projects", "Tanya jawab", lalu tombol pill "Gabung daftar tunggu". Ponsel: wordmark dan tombol saja.
2. Hero: judul kerja "Dari satu paragraf sampai buku terbit." (usulkan dua alternatif yang lebih tajam, tetap konkret); satu kalimat penjelas; tombol "Gabung daftar tunggu". Visual: satu paragraf yang diketik berubah menjadi halaman bernomor, lalu menjadi sampul buku hitam berjudul serif putih. Berjalan sekali; cadangan statisnya ketiga tahap tersusun bertingkat.
3. Cara kerja, "satu naskah, empat langkah": Menulis, Streak, Dibagikan, Terbit, sebagai garis waktu bergaris rambut. Tiap langkah satu kalimat dan satu cuplikan tampilan: bilah editor ("Pribadi · Tersimpan 14.02 · 1.240 kata"), kalender Streak berupa titik tinta (penuh = target tercapai, cincin = ada tulisan, titik kecil = kosong), satu butir feed Community, satu status "Diterima" pada antologi.
4. Projects: Antologi, Buku Solo, Kelas Menulis, Lomba, disusun seperti daftar isi buku (baris bergaris, bukan grid kartu), masing-masing satu kalimat tentang apa yang didapat penulis.
5. Kepercayaan: tiga pernyataan serif besar: draf pribadi tetap pribadi; versi yang dikirim ke proyek tidak ikut berubah saat draf diedit; hak cipta tetap milik penulis kecuali disetujui lain di awal.
6. Daftar tunggu (latar hitam): nama panggilan, email, negara (Indonesia, Malaysia, lainnya), minat opsional sebagai chip (Menulis rutin, Antologi, Buku solo, Kelas, Lomba, Membaca). Tampilkan keadaan kosong, sedang mengirim, sukses, galat, dan email sudah terdaftar.
7. Tanya jawab: 5-6 butir dalam akordeon bergaris, termasuk Grup Penulis dan ketersediaan di Indonesia dan Malaysia.
8. Footer kecil: wordmark, "Indonesia · Malaysia", Kebijakan privasi, Kontak.

ATURAN ISI
- Semua teks dalam bahasa Indonesia yang wajar dan ditulis sungguhan. Contoh tulisan (paragraf di hero, judul karya, puisi pendek di feed) harus indah, karena halaman ini menjual tulisan. Nama contoh yang masuk akal, misalnya Rinjani Putri atau Hafiz Rahman.
- Jangan mengarang jumlah pengguna, testimoni, logo mitra, tanggal rilis, atau harga. Jangan menjanjikan pembayaran ringgit atau aplikasi di Play Store/App Store. Jangan menyebut AI.
- Jawaban yang faktanya belum pasti (misalnya biaya) tulis sebagai [konfirmasi client].
- Tombol berupa kata kerja + objek. Tanpa tanda seru beruntun. Bila sebuah kalimat terdengar seperti iklan umum, tulis ulang.

DILARANG
Gradien, glassmorphism, blur, glow, blob; grid tiga kolom berikon bulat; foto stok; ilustrasi orang generik; emoji sebagai ikon; label kecil huruf kapital di atas setiap judul; penomoran bagian "01 / 02"; animasi masuk saat gulir; parallax; kartu yang terangkat saat hover; huruf Inter, Geist, Playfair, Fraunces, Instrument Serif; tampilan yang mirip template shadcn.

KELUARAN
- Untuk hero, tunjukkan dulu dua komposisi yang benar-benar berbeda (bukan variasi warna atau ukuran), pilih satu, dan jelaskan alasannya dalam dua kalimat.
- Ponsel 390px dan desktop 1440px, mode terang. Ditambah hero dan daftar tunggu versi desktop mode gelap.
- Keadaan form lengkap.
- Gambar Open Graph 1200x630 (hitam putih, judul serif).
- Di akhir: daftar hal yang sengaja tidak kamu lakukan beserta alasannya, lalu tiga titik paling lemah di desainmu sendiri.
```

### Prompt 2: Uji spesimen huruf (opsional, bila sans di landing terasa kurang pas)

```
Kamu desainer produk senior. Arah visual RanahMenulis sudah diputuskan: hitam putih, netral, mendekati aplikasi Medium setelah masuk (halaman artikel, feed, editor), bukan halaman depannya. Sistem lengkapnya ada di DESIGN.md yang kutempel di bawah. Jangan mengusulkan warna aksen atau arah lain.

TUGAS
Buat satu halaman spesimen untuk memilih huruf sans antarmuka. Serif tetap Source Serif 4. Bandingkan tiga kandidat sans: Schibsted Grotesk, Public Sans, IBM Plex Sans. Untuk tiap kandidat tampilkan, dalam mode terang dan gelap:
1. Satu butir feed (avatar, nama penulis, judul serif, cuplikan, meta "12 Nov · 24 apresiasi · 6 komentar").
2. Bilah editor Studio: "Pribadi · Tersimpan 14.02 · 1.240 kata · Bagikan".
3. Satu baris tabel pengelola: "Rinjani Putri · Antologi Hujan Bulan Juni · Perlu Revisi · 3 hari lagi · Rp75.000".
4. Bilah bawah ponsel: Beranda, Studio, Streak, Projects, Profil.

ATURAN
- Semua teks contoh ditulis sungguhan dalam bahasa Indonesia yang wajar (prolog cerpen, puisi pendek). Tanpa lorem ipsum, tanpa nama generik.
- Ikuti token, radius (pill atau 0), dan larangan anti-slop di DESIGN.md.
- Akhiri dengan rekomendasimu dalam tiga kalimat, termasuk risikonya.
```

### Prompt 3: Komponen sistem desain

```
Bangun pustaka komponen RanahMenulis persis menurut DESIGN.md yang kutempel di bawah (token, tipografi, radius, bagian 7). Jangan menambah warna, radius, atau bayangan di luar yang tertulis.

Tampilkan dalam mode terang dan gelap: tombol (primer, sekunder, teks, berbahaya; keadaan hover, press, disabled, loading), input dan form (label terlihat, galat di bawah field), chip, tab, avatar, dialog, lembar bawah ponsel, laci, menu, toast, bilah atas desktop dengan sidebar, rail tablet, bilah bawah ponsel, keadaan kosong, memuat, dan galat.

Komponen khusus produk: (1) indikator simpan tiga keadaan; (2) delapan status submission monokrom sesuai tabel 7.4; (3) kalender titik tinta Streak sesuai 7.3; (4) penanda visibilitas Pribadi, Grup, Publik.

Setiap komponen punya contoh dengan konten Indonesia nyata.
```

### Prompt 4: Layar inti per modul (ulangi per layar bertanda ★)

```
Rancang layar [NAMA LAYAR] RanahMenulis memakai sistem desain yang ada. Tampilkan mobile (390) dan desktop (1440), dengan keadaan: normal, memuat, kosong, galat, dan keadaan khusus berikut: [daftar keadaan dari bagian 5].

Tujuan layar: [satu kalimat]. Pengguna: [peran]. Aksi utama: [satu aksi]. Isi wajib: [dari tabel bagian 4].
Pakai konten Indonesia yang nyata dan spesifik. Layar ini harus terasa seperti platform buku dan penerbitan, bukan dasbor SaaS.
Jelaskan di akhir: apa yang sengaja kamu hilangkan agar layar tetap tenang.
```

Layar yang disarankan didesain lebih dulu, berurutan: **Editor + indikator simpan → Dasbor Streak → Dashboard/Beranda → Feed + profil publik → Detail proyek + Kirim karya → Detail submission (delapan status) → Panel juri anonim.**

---

## 9. Skill desain: perlu dipakai atau tidak

"design-daste" yang kamu maksud kemungkinan **`design-taste-frontend`** (tasteskill 2.5), terpasang di `.claude/skills/` proyek ini. Saya sudah membaca isinya.

**Apa itu:** skill anti-slop yang **membangun halaman web nyata** (HTML/CSS atau React/Next.js) dengan aturan ketat: satu bagian per layar, tepi kiri-kanan sama, foto nyata, tanpa keterangan di bawah gambar, gerak hover dan satu momen utama, ditambah pemeriksa otomatis di Chrome (`gate.mjs`) yang menggagalkan halaman bila melanggar.

**Untuk Claude Design: tidak bisa dipakai langsung.** Skill itu jalan di Claude Code (Node + Chrome), bukan di Claude Design. Tetapi **prinsip anti-slop-nya sudah saya serap ke bagian 7 dan ke prompt** di atas. Itulah cara memakainya untuk tahap desain.

**Kapan dipakai sungguhan:** saat landing page atau halaman publik diimplementasikan jadi kode (Next.js), karena di situ pemeriksa otomatisnya berguna.

**Peringatan bila dipakai untuk RanahMenulis:**
- Skill menggolongkan produk ini sebagai **software**. Bawaan jenis itu condong ke bagian gelap, efek shader, dan "app-frame" ala SaaS, yang justru bertentangan dengan PRD ("bukan dasbor SaaS generik"). Perlu diarahkan ke gaya editorial (foto/tipografi sebagai pemimpin, tanpa efek shader), mirip jalur jenis **product/service** di skill itu.
- Skill melarang keterangan di bawah gambar, mengharuskan foto nyata (stok sebagai pengganti harus dicantumkan sebagai pengganti), dan melarang karangan ulasan atau angka. Ini sejalan dengan aturan isi landing kita.
- Skill ini untuk **halaman pemasaran**. Untuk layar aplikasi (Studio, panel), ia kurang cocok.

**Skill lain yang terpasang dan relevan nanti (saat implementasi, bukan di Claude Design):**

| Skill | Pakai untuk |
| --- | --- |
| `emil-design-eng` | Kehalusan komponen: hover, press, popover, transisi |
| `apple-design` | Rasa tenang dan fisik pada interaksi Studio, sheet, gestur mobile |
| `break-ui` | Menguji data terburuk: nama panjang, teks tanpa spasi, nol item, angka besar, Melayu/Indonesia. Cocok untuk feed, kartu proyek, daftar dokumen |
| `mobile-native` | Rasa aplikasi di ponsel (PWA, bottom sheet, layar penuh), relevan karena rencana pembungkusan ke toko aplikasi |
| `animate`, `choreograph` | Momen hero landing dan perayaan streak, bila gerak diimplementasikan |

Yang tidak perlu: `animate-expo` dan `write-swift` (bukan native), `remove-animations` / `improve-animations` (belum ada kode).

**Rekomendasi alur:** (1) Claude Design: Prompt 1 (landing) → tinjau bersama client → Prompt 2 bila huruf sans perlu diganti → Prompt 3 (komponen) → Prompt 4 (layar inti), selalu dengan DESIGN.md sebagai konteks. (2) Saat implementasi Next.js: pakai `design-taste-frontend` untuk landing/halaman publik (diarahkan editorial), `emil-design-eng` dan `break-ui` untuk komponen aplikasi.

## 10. Yang perlu diputuskan sebelum desain final

1. **Logo dan huruf sans final.** Arah visual sudah diputuskan (hitam putih, mendekati Medium; lihat DESIGN.md). Logo sudah ada di `public/logo/` (DESIGN.md 4.8); belum ada SVG. Huruf sans dinilai dari hasil landing (Prompt 1), diuji ulang dengan Prompt 2 bila perlu.
2. **Dashboard / Beranda**: disusun di bagian 4A. Perlu persetujuan founder atas keputusan utamanya (bagian atas Beranda, bukan halaman terpisah).
3. **Bahasa Melayu** di MVP atau tidak (Q-32): memengaruhi panjang teks dan istilah "Apresiasi".
4. **Isi pesan "tanpa AI"** di materi publik: setujui client dulu.
5. **Sumber foto/ilustrasi** untuk landing: tidak ada aset dari client; jangan memakai stok yang tampak seperti klaim.
