# Brief Desain RanahMenulis (MVP + Landing Page)

Sumber: PRD v0.2 (bagian 2, 4, 8, 11, 15, 16, 17, 20), roadmap MVP (`MVP Scope RanahMenulis.md`), catatan keputusan client. Semua yang berlabel **Usulan** adalah rekomendasi saya, bukan keputusan founder.

Pembaca dokumen ini: desainer atau Claude Design. Bagian 8 berisi prompt siap tempel.

---

## 1. Yang harus dipahami sebelum mendesain

**Produk.** Aplikasi web responsif yang mengantar orang dari satu paragraf sampai buku terbit, dalam satu akun. Tiga modul: Studio (menulis + Streak), Community (dibaca), Projects (Antologi, Solo, Kelas, Lomba). Pasar: Indonesia dan Malaysia. Bahasa antarmuka MVP: Indonesia.

**Perasaan yang dikehendaki (PRD 2):** "Terasa seperti platform buku dan penerbitan, bukan dasbor SaaS generik dan bukan media sosial umum." Studio sengaja **tidak** meniru Microsoft Word. Dokumen pribadi tidak pernah tampil publik otomatis.

**Pengguna utama (hipotesis, PRD 4):** penulis pemula, penulis aktif, calon penulis buku, peserta kelas/lomba, pembaca, serta sisi kerja (Organizer, Editor, Juri/Mentor, Admin). Dua dunia berbeda: **dunia penulis** (tenang, fokus, hangat) dan **dunia kerja pengelola** (padat, jelas, cepat dipindai). Keduanya harus terasa satu keluarga, tetapi kepadatannya boleh berbeda.

**Yang belum ada dan harus diputuskan:** logo, warna, huruf, referensi visual dari founder. PRD tidak menetapkannya (pertanyaan "referensi desain" ditahan sampai Fase 1). Jadi tahap pertama desain adalah **eksplorasi arah**, bukan langsung membuat layar.

## 2. Arah visual (Usulan)

Pegangan: tipografi bacaan adalah pahlawannya, bukan kartu dan ikon.

- **Rasa:** kertas, tinta, perpustakaan, penerbit kecil yang punya selera. Tenang dan hangat, tidak ramai.
- **Tipografi:** huruf serif berkarakter untuk judul dan teks karya; sans yang bersih untuk antarmuka. Teks bacaan nyaman untuk bacaan panjang (NFR-10): lebar baris sekitar 60–72 karakter, jarak baris longgar. Uji dengan teks Indonesia sungguhan, bukan lorem ipsum.
- **Warna:** satu warna aksen yang punya sikap, bukan palet SaaS. Latar bukan putih dingin. Mode terang dan gelap, keduanya lulus kontras WCAG AA (NFR-09).
- **Bentuk:** konsisten satu skala radius, satu gaya tombol, satu gaya kartu. Kerapian lebih penting daripada efek.
- **Gerak:** hemat. Dipakai untuk memberi kabar (tersimpan, streak naik), bukan hiasan. Hormati `prefers-reduced-motion`.
- **Konten nyata:** semua contoh karya, nama, dan angka di desain harus masuk akal dan ditulis sungguhan (bahasa Indonesia yang wajar, bukan terjemahan), tidak lorem ipsum, tidak nama "John Doe".

**Tiga arah yang disarankan untuk dieksplorasi dulu** (pilih satu bersama founder):
1. **Kertas & Tinta**: krem hangat, tinta hitam kecokelatan, aksen terakota. Editorial, seperti halaman buku.
2. **Perpustakaan Malam**: gelap yang hangat (bukan hitam biru), teks krem, aksen emas redup. Nyaman untuk menulis larut malam.
3. **Cetak**: dua warna ala cetak, kontras tegas, sentuhan tekstur kertas. Lebih berani dan muda.

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

## 6. Brief Landing Page

**Tujuan.** Halaman promosi pra-peluncuran. Aplikasi belum ada, jadi satu aksi utama: **bergabung ke daftar tunggu**. (PRD 17.1 mendefinisikan Landing: pesan nilai, cuplikan karya, ajakan daftar; pengguna yang sudah masuk diarahkan ke Beranda.)

**Pengunjung.** Penulis (pemula sampai calon penulis buku), peminat kelas dan lomba, pembaca. Datang dari Instagram, Threads, WhatsApp, kebanyakan lewat ponsel.

**Pesan inti (bisa ditajamkan oleh copywriter):** satu perjalanan dari satu paragraf sampai buku terbit; karya yang ditulis sekali dipakai di semua tempat; penulis tetap memegang karyanya.

**Cerita halaman (urutan usulan):**
1. Hero: satu pernyataan, satu aksi (daftar tunggu), satu visual yang berbicara tentang menulis.
2. Perjalanan: Menulis → Streak → Dibagikan → Terbit.
3. Tiga modul: Studio (+Streak), Community, Projects, masing-masing dengan cuplikan tampilan yang nyata.
4. Empat jalur Projects: Antologi, Solo, Kelas Menulis, Lomba.
5. Kepercayaan: dokumen pribadi tetap pribadi, versi kirim tidak berubah, hak cipta pada penulis kecuali dinyatakan lain di muka.
6. Grup Penulis dan dua negara (Indonesia, Malaysia), singkat.
7. Form daftar tunggu: nama panggilan, email, negara, minat (opsional).
8. Tanya jawab singkat. Footer.

**Aturan isi (penting).**
- **Jangan mengarang** angka pengguna, testimoni, logo mitra, atau tanggal rilis. Yang boleh: fakta dari PRD.
- Jangan menjanjikan MYR untuk pembayaran (baru Fase 2) atau aplikasi Play Store/App Store (setelah web stabil).
- Soal AI: keputusan client adalah **tanpa fitur AI di dalam aplikasi**; bila disebut di publik, konfirmasi ke client dulu.
- Jika memakai tampilan produk, tandai sebagai ilustrasi (aplikasi belum rilis) dan jangan menaruh keterangan panjang di bawah gambar.
- Contoh tulisan di visual harus ditulis sungguhan dan indah, karena landing ini menjual tulisan.

**Hal teknis untuk desain.** Responsif mobile-first; kontras AA; bisa dibaca saat gerak dimatikan; metadata Open Graph (pratinjau WhatsApp/Threads); form dengan keadaan kirim, sukses, galat; tidak ada gambar yang gagal tampil (setiap visual punya cadangan statis).

**Satu momen yang diingat (Usulan).** Visual hero berupa transformasi: satu paragraf yang diketik → halaman → sampul buku. Ini menyatukan seluruh janji produk dalam satu gerak yang jujur. Gerak sekali saat dimuat, tidak berulang, tanpa efek gulir yang membajak.

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

### Prompt 1: Eksplorasi arah (jangan lompat ke layar dulu)

```
Kamu desainer produk senior yang selera visualnya kuat dan spesifik. Aku butuh arah visual untuk RanahMenulis.

KONTEKS
RanahMenulis adalah aplikasi web responsif yang mengantar orang dari satu paragraf sampai buku terbit. Tiga modul: Studio (ruang menulis + kebiasaan/Streak), Community (karya dibaca, diapresiasi), Projects (Antologi, buku Solo, Kelas Menulis, Lomba). Pasar Indonesia dan Malaysia, bahasa Indonesia. Pengguna: penulis pemula sampai calon penulis buku, pembaca, serta tim pengelola (editor, juri, admin).

NADA YANG DIMINTA
Terasa seperti platform buku dan penerbitan. BUKAN dasbor SaaS generik, BUKAN media sosial umum, BUKAN "aplikasi AI". Tenang, hangat, sastrawi tanpa pretensius. Tipografi bacaan adalah pahlawannya.

TUGAS
Buat 3 arah visual yang benar-benar berbeda satu sama lain (bukan 3 variasi warna):
1. Kertas & Tinta: krem hangat, tinta hitam kecokelatan, satu aksen terakota, editorial.
2. Perpustakaan Malam: gelap hangat (bukan hitam kebiruan), teks krem, aksen redup; nyaman menulis larut malam.
3. Cetak: dua warna ala cetak, kontras tegas, sentuhan tekstur kertas; lebih berani dan muda.
Untuk tiap arah tunjukkan: pasangan huruf (serif untuk judul dan teks karya, sans untuk antarmuka; harus bagus untuk bahasa Indonesia), palet dengan token terang dan gelap, skala radius, gaya tombol, gaya kartu, contoh 1 layar editor menulis dan 1 kartu postingan Community dengan TEKS NYATA.

ATURAN
- Semua teks contoh ditulis sungguhan dalam bahasa Indonesia yang wajar (puisi pendek, prolog cerpen). Tanpa lorem ipsum, tanpa nama generik.
- Dilarang: gradien ungu/biru, glassmorphism, blob, kartu tiga kolom berikon bulat, foto stok orang di depan laptop, emoji sebagai ikon, statistik atau testimoni karangan.
- Kontras lulus WCAG AA di terang dan gelap.
- Akhiri dengan rekomendasimu: pilih satu dan jelaskan dalam tiga kalimat kenapa, termasuk risiko arah itu.
```

### Prompt 2: Sistem desain (setelah arah dipilih)

```
Arah visual terpilih: [NAMA ARAH]. Bangun sistem desain RanahMenulis berdasarkan arah itu.

Isi: token warna (terang dan gelap), skala tipografi (judul, teks karya untuk bacaan panjang dengan lebar baris 60-72 karakter, antarmuka), spasi, radius, bayangan, tombol (primer, sekunder, ghost; keadaan hover, press, disabled, loading), input dan form (label terlihat, galat di bawah field), kartu, tab, dialog, toast, badge status, bilah navigasi desktop, navigasi ringkas tablet, bilah bawah smartphone (Beranda, Studio, Streak, Projects, Profil), keadaan kosong, keadaan memuat (skeleton), keadaan galat.

Komponen khusus produk: (1) indikator simpan dengan tiga keadaan: Menyimpan, Tersimpan, Belum tersinkron; (2) badge status submission untuk delapan status: Draf, Terkirim, Dalam Peninjauan, Perlu Revisi, Revisi Terkirim, Diterima, Ditolak, Ditarik; (3) bilah progres Streak terhadap target kata harian; (4) penanda visibilitas: Pribadi, Publik, Grup.

Aturan: satu pasang tombol, satu gaya kartu, satu skala radius, satu skala heading. Dua tingkat kotak bersarang paling banyak. Gerak hemat dan menghormati prefers-reduced-motion. Setiap komponen punya contoh dengan konten Indonesia nyata.
```

### Prompt 3: Landing page

```
Rancang landing page pra-peluncuran RanahMenulis memakai sistem desain yang sudah ditetapkan. Mobile-first, lalu desktop.

TUJUAN: satu aksi, yaitu bergabung ke daftar tunggu (nama panggilan, email, negara Indonesia/Malaysia/lainnya, minat opsional). Aplikasi belum rilis.

PESAN: satu perjalanan dari satu paragraf sampai buku terbit; karya yang ditulis sekali dipakai di Studio, Community, dan Projects tanpa menulis ulang; penulis tetap memegang karyanya.

URUTAN BAGIAN, masing-masing satu ide dan satu layar (maksimal dua):
1. Hero: satu pernyataan, satu tombol, satu visual. Visual hero = satu momen: paragraf yang diketik menjadi halaman lalu menjadi sampul buku. Bergerak sekali saat dimuat, tidak berulang.
2. Perjalanan: Menulis, Streak, Dibagikan, Terbit.
3. Tiga modul dengan cuplikan tampilan yang nyata (editor dengan penghitung kata dan indikator Tersimpan; postingan Community; kartu proyek dengan kuota dan deadline).
4. Empat jalur Projects: Antologi, Solo, Kelas Menulis, Lomba.
5. Kepercayaan: dokumen pribadi tetap pribadi; versi yang dikirim tidak berubah saat draf diedit; hak cipta tetap pada penulis kecuali ketentuan proyek menyatakan lain dan disetujui lebih dulu.
6. Grup Penulis dan dua negara, singkat.
7. Form daftar tunggu dengan keadaan kirim, sukses, galat.
8. Tanya jawab 5-6 butir, footer.

ATURAN ISI
- Jangan mengarang angka pengguna, testimoni, logo mitra, atau tanggal rilis.
- Jangan menjanjikan pembayaran MYR atau aplikasi toko aplikasi.
- Tampilan produk adalah ilustrasi; jangan menaruh keterangan di bawah gambar.
- Tulis semua teks sungguhan dalam bahasa Indonesia yang wajar. Headline menyebut hal konkret (menulis, buku, pembaca), bukan "wujudkan kreativitasmu". Tombol berupa kata kerja + objek ("Gabung daftar tunggu").
- Contoh tulisan di visual harus indah dan ditulis sungguhan.

ATURAN VISUAL
- Dilarang: gradien ungu/biru, glassmorphism, grid tiga ikon bulat sebagai satu-satunya struktur, foto stok orang tersenyum, emoji sebagai ikon, animasi masuk pada setiap kartu saat gulir, parallax pada teks.
- Tipografi bacaan jadi pahlawan; ruang kosong disengaja; satu aksi utama per layar.
- Setiap visual punya cadangan statis; kontras AA; prefers-reduced-motion mematikan gerak tanpa menyembunyikan konten.
- Sertakan metadata berbagi (judul, deskripsi, gambar Open Graph) untuk pratinjau WhatsApp dan Threads.

Keluaran: desain mobile (390) dan desktop (1440), plus keadaan form. Akhiri dengan daftar hal yang kamu pilih untuk TIDAK dilakukan dan alasannya.
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

**Rekomendasi alur:** (1) Claude Design: Prompt 1 → pilih arah → Prompt 2 → Prompt 3 dan 4. (2) Saat implementasi Next.js: pakai `design-taste-frontend` untuk landing/halaman publik (diarahkan editorial), `emil-design-eng` dan `break-ui` untuk komponen aplikasi.

## 10. Yang perlu diputuskan sebelum desain final

1. **Referensi visual dari founder** (3 situs/aplikasi yang disukai dan 3 yang tidak) dan preferensi warna/logo. Belum ada.
2. **Dashboard / Beranda**: disusun di bagian 4A. Perlu persetujuan founder atas keputusan utamanya (bagian atas Beranda, bukan halaman terpisah).
3. **Bahasa Melayu** di MVP atau tidak (Q-32): memengaruhi panjang teks dan istilah "Apresiasi".
4. **Isi pesan "tanpa AI"** di materi publik: setujui client dulu.
5. **Sumber foto/ilustrasi** untuk landing: tidak ada aset dari client; jangan memakai stok yang tampak seperti klaim.
