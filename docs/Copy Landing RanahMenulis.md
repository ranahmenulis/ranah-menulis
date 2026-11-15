# Copy Landing RanahMenulis (tulis ulang v1)

**Status:** usulan, 14 November 2026. Menggantikan teks di prototipe landing (`Main.dc.html`). Semua klaim dicocokkan dengan PRD v0.2; butir yang belum pasti ditandai **[konfirmasi]**.
**Pembaruan 15 November 2026:** client meminta landing "jangan terlalu banyak teks, simpel tapi menjelaskan". Versi ringkas ada di [bagian 4](#4-versi-ringkas-v2-15-november-2026) dan menggantikan bagian 2 untuk teks yang tampil. Bagian 2 tetap menjadi dasar klaimnya.
**Dasar:** [DESIGN.md](../DESIGN.md) bagian 12 (Suara dan nada), [Brief bagian 6](Brief%20Desain%20RanahMenulis.md).

---

## 1. Kartu suara

| Hal | Aturan |
| --- | --- |
| Siapa yang bicara | Penulis lain yang rapi dan jujur. Yakin tanpa berseru, spesifik tanpa memamerkan diri. |
| Kata ganti | "kamu" untuk pembaca. "kami" hanya untuk hal yang tim lakukan (mengabari lewat email). Di kalimat fitur, produknya yang jadi subjek: "Studio menyimpan otomatis". |
| Kalimat | 8 sampai 16 kata. Satu kalimat panjang per bagian, hanya bila ia menjelaskan. |
| Istilah tetap | **Studio, Streak, Community, Projects** (nama modul, huruf besar). **Draf** untuk yang masih ditulis, **naskah** untuk yang dikirim ke proyek, **tulisan** untuk umum. **Antologi, Buku Solo, Kelas Menulis, Lomba.** Satu istilah, selalu kata yang sama. |
| Nada bergerak | Hero paling punya suara. Janji kepercayaan tegas dan tenang. FAQ, form, dan galat datar dan ramah, karena pembaca di sana sedang berhati-hati. |
| Humor | Tidak ada. |
| Tanda baca | Tanpa tanda seru. Tanpa tiga titik untuk gaya. Satu pengecualian: "Mengirim…" pada tombol yang sedang memuat. |
| Jangan pernah | "wujudkan", "solusi", "platform terbaik", "revolusioner", "tanpa ribet", "yuk", "sahabat menulismu", "perjalanan kreatifmu", "karya terbaikmu", "ekosistem", "bersama kami". Juga kalimat yang cocok untuk produk mana pun bila nama RanahMenulis dihapus. |
| Janji | Hanya yang ada di PRD MVP. Sertifikat (Fase 2), pembayaran ringgit, aplikasi toko, AI: tidak disebut. |

**Uji sebelum lolos:** (1) baca keras-keras, bila terdengar seperti iklan, tulis ulang; (2) hapus nama produk, bila kalimat masih cocok untuk aplikasi lain, tulis ulang; (3) setiap klaim punya baris di PRD.

---

## 2. Teks yang diusulkan

Format: **Sekarang** → **Usulan**. Alasan di kolom kanan hanya bila ada perubahan bermakna. Teks yang tidak ada di daftar ini dipertahankan.

### Hero
| Elemen | Sekarang | Usulan | Alasan |
| --- | --- | --- | --- |
| H1 | Dari satu paragraf sampai buku terbit. | **Tulis paragrafnya hari ini. Bukunya menyusul.** | Lebih konkret dan punya gerak. Judul lama tetap cadangan yang bagus. |
| Kalimat penjelas | Tulis di Studio dengan target harian, bagikan cuplikannya ke pembaca, lalu kirim naskah yang sama ke antologi, kelas, lomba, atau buku solo. | **Tulis di Studio, bagikan cuplikannya ke pembaca, lalu kirim naskah yang sama ke antologi, kelas, lomba, atau buku solo. Tanpa menyalin ulang.** | Janji utamanya (satu naskah, dipakai di mana-mana) kini terucap. "Dengan target harian" pindah ke langkah Streak. |
| Tombol | Gabung daftar tunggu · Lihat cara kerjanya | (tetap) | |
| Keterangan bawah visual | Satu paragraf di Studio · Halaman 12 · Buku terbit | **Hapus.** | Brief melarang keterangan di bawah gambar; `aria-label` hero sudah menjelaskan urutannya. |

### Cara kerja: Satu naskah, empat langkah
| Langkah | Sekarang | Usulan | Alasan |
| --- | --- | --- | --- |
| Menulis | Tulis di Studio. Setiap kalimat tersimpan otomatis dan tetap pribadi sampai kamu memutuskan lain. | **Tulis di Studio. Tulisanmu tersimpan otomatis dan tetap pribadi sampai kamu sendiri yang membagikannya.** | "Memutuskan lain" kabur. Sekarang jelas siapa yang memegang kendali. |
| Streak | Pasang target kata harian. Hari yang mencapai target menjadi satu titik tinta, tanpa lencana dan tanpa suara. | **Tetapkan target kata per hari. Setiap hari yang tercapai menjadi satu titik di kalendermu. Tanpa konfeti, tanpa poin.** | "Tanpa lencana" tidak akurat: PRD punya milestone (STK-06). "Tanpa suara" terdengar seperti catatan desainer, bukan janji ke penulis. |
| Dibagikan | Bagikan prolog atau cuplikan ke Community. Naskah lengkapnya tetap di Studio. | **Bagikan prolog atau cuplikan ke Community. Yang tampil hanya bagian yang kamu pilih; naskah lengkapnya tetap di Studio.** | Menegaskan salinan publik (STD-10), kekhawatiran utama penulis. |
| Terbit | Kirim naskah yang sama ke antologi tanpa mengetik ulang. Yang dikirim adalah versi beku; drafmu boleh terus berubah. | **Kirim naskah yang sama ke antologi tanpa menyalin ulang. Editor membaca salinan saat kamu menekan Kirim, dan drafmu boleh terus kamu ubah.** | "Versi beku" adalah istilah sistem; penulis tidak berpikir begitu. |

### Projects: Ke mana naskahmu bisa pergi
| Jalur | Sekarang | Usulan |
| --- | --- | --- |
| Antologi | Satu karya, satu buku bertema bersama penulis lain. Editor memberi catatan, kamu merevisi, sampai naskahmu diterima. | **Naskahmu masuk ke buku bertema bersama tulisan penulis lain. Editor memberi catatan, kamu merevisi, sampai naskahmu diterima.** |
| Buku Solo | Bukumu sendiri, dari editing dan proofreading sampai sampul dan layout, dengan status setiap tahap yang bisa kamu pantau. | **Bukumu sendiri. Editing, proofreading, sampul, dan layout dikerjakan bertahap, dan kamu bisa melihat posisi bukumu di setiap tahap.** |
| Kelas Menulis | Belajar dari mentor lewat materi, tugas, dan catatan untuk tulisanmu sendiri, dari puisi sampai novel. | (tetap) |
| Lomba | Kompetisi dengan kriteria penilaian yang jelas, penjurian anonim bila penyelenggara memilihnya, dan hasil yang tercatat. | **Kompetisi dengan kriteria penilaian yang jelas. Penyelenggara boleh memilih penjurian anonim, sehingga juri menilai naskah tanpa tahu penulisnya.** |

Label alur di kanan baris: Antologi "Seleksi · revisi · terbit" (tetap); Buku Solo "Editing · sampul · produksi" (tetap); Kelas Menulis ~~"Tugas · umpan balik · sertifikat"~~ → **"Materi · tugas · umpan balik"** (sertifikat Fase 2, PRD KLS-04); Lomba "Kriteria · finalis · pemenang" (tetap).

### Tiga janji
| Judul | Sekarang | Usulan | Alasan |
| --- | --- | --- | --- |
| Draf pribadimu tetap pribadi. | Dokumen di Studio hanya bisa dibaca olehmu. Yang tampil di Community adalah salinan teks yang kamu pilih sendiri. | **Dokumen di Studio tidak dibaca orang lain. Satu-satunya pengecualian adalah alasan hukum atau moderasi, dan itu dicatat. Yang tampil di Community hanya salinan teks yang kamu pilih.** | PRD BR-STD-05: admin tidak membaca dokumen pribadi kecuali ada alasan hukum atau moderasi yang dicatat. Klaim "hanya kamu" terlalu kuat. |
| Yang sudah dikirim tidak ikut berubah. | Setiap kiriman ke proyek menyimpan versi beku. Revisi membuat versi baru, dan versi lama tetap tersimpan. | **Setiap kiriman menyimpan salinan pada saat kamu menekan Kirim. Revisi membuat versi baru, dan versi sebelumnya tetap tersimpan.** | |
| Hak cipta tetap milikmu. | Kecuali ketentuan proyek yang kamu setujui sebelum mendaftar menyatakan lain secara tertulis. Ketentuan itu selalu bisa dibaca dulu. | **Kecuali ketentuan sebuah proyek menyatakan lain. Ketentuan itu tertulis, bisa kamu baca sebelum mendaftar, dan hanya berlaku bila kamu menyetujuinya.** | Kalimat lama berbelit ("yang kamu setujui sebelum mendaftar menyatakan lain secara tertulis"). |

### Daftar tunggu
Judul "Simpan namamu di daftar tunggu." dan kalimat pengantar dipertahankan. Label, placeholder, dan semua pesan galat dan sukses juga dipertahankan: sudah pendek, spesifik, dan memberi langkah berikutnya.

Satu perubahan: tombol saat memuat "Mengirim" → **"Mengirim…"**.

### Tanya jawab
| Pertanyaan | Sekarang | Usulan | Catatan |
| --- | --- | --- | --- |
| Apa itu Grup Penulis? | Ruang kecil tempat anggota saling membaca tulisan yang mereka bagikan ke grup, dikelola oleh admin grup. Anggota hanya melihat grupnya sendiri, dan dokumen yang tidak kamu bagikan tetap pribadi. Kamu boleh keluar kapan saja. | **Ruang kecil tempat sekelompok penulis saling membaca tulisan yang dibagikan ke grup. Grup dikelola oleh admin grup. Dokumen yang tidak kamu bagikan tetap pribadi.** | **[konfirmasi]** kalimat "boleh keluar kapan saja" dan "hanya melihat grupnya sendiri" dihapus: PRD Q-38 (isi grup) belum final. |
| Apakah tersedia di Indonesia dan Malaysia? | Ya. RanahMenulis dibuat untuk penulis di kedua negara, dan negara di profilmu menentukan di mana tulisanmu ditampilkan, misalnya di daftar penulis Malaysia. Penulis dari negara lain boleh bergabung ke daftar tunggu. | **Ya. Saat dibuka, RanahMenulis melayani penulis di Indonesia dan Malaysia. Kamu memilih negara di profil, dan tulisanmu muncul di daftar penulis negara itu. Antarmukanya berbahasa Indonesia lebih dulu. Penulis dari negara lain boleh masuk daftar tunggu.** | Antarmuka Indonesia dulu adalah keputusan MVP; Melayu belum (Q-32). Lebih baik dikatakan di muka. |
| Siapa yang bisa membaca drafku? | Hanya kamu. Dokumen di Studio selalu pribadi. Orang lain hanya membaca cuplikan yang kamu bagikan, dan karya yang kamu kirim ke proyek dibaca oleh pengelola proyek itu. | **Tidak ada orang lain. Dokumen di Studio selalu pribadi; pengecualiannya hanya alasan hukum atau moderasi, dan itu dicatat. Pembaca melihat cuplikan yang kamu bagikan, dan pengelola proyek membaca naskah yang kamu kirim ke proyek mereka.** | Selaras dengan janji kedua. |
| Apakah hak cipta karyaku tetap milikku? | Ya, kecuali ketentuan proyek yang kamu setujui sebelum mendaftar menyatakan lain secara tertulis. Ketentuan itu selalu bisa dibaca sebelum kamu mendaftar. | **Ya. Pengecualiannya hanya bila ketentuan sebuah proyek menyatakan lain. Ketentuan itu bisa kamu baca sebelum mendaftar, dan kamu harus menyetujuinya lebih dulu.** | |
| Berapa biayanya? | [konfirmasi client] | **Menulis di Studio dan membaca di Community direncanakan tanpa biaya langganan di awal. Program di Projects, seperti antologi dan kelas, punya biayanya sendiri yang tampil sebelum kamu mendaftar.** | **[konfirmasi]** dasarnya rapat 8 November 2026 (PRD hal. monetisasi). Jangan dipasang sebelum client setuju. |
| Kapan RanahMenulis dibuka? | Tanggalnya belum diumumkan. Orang di daftar tunggu yang pertama kami kabari. | (tetap) | |

---

## 3. Yang perlu dikonfirmasi ke client sebelum tayang

1. Biaya: apakah kalimat "tanpa biaya langganan di awal" boleh dipublikasikan?
2. Grup Penulis: apa yang dilihat anggota dan apakah anggota bebas keluar (Q-38).
3. Janji privasi: apakah tim nyaman dengan kalimat pengecualian "alasan hukum atau moderasi, dan itu dicatat". Ini jujur sesuai PRD, tetapi client yang memutuskan nadanya.

---

## 4. Versi ringkas v2 (15 November 2026)

**Status:** draf untuk ditinjau pengguna. Client melihatnya nanti bersama landing yang sudah jadi.

**Prinsip:** video hero dan pratinjau yang bergerak yang menjelaskan cara kerja; teks hanya memberi nama dan satu janji. Target ±200 kata yang terbaca (sebelumnya ±470). Kartu suara di bagian 1 tetap berlaku, termasuk tanpa tanda seru dan daftar kata yang dilarang.

### Hero

| Elemen | v1 | v2 |
| --- | --- | --- |
| H1 | Tulis paragrafnya hari ini. Bukunya menyusul. | (tetap) |
| Kalimat penjelas | Tulis di Studio, bagikan cuplikannya ke pembaca, lalu kirim naskah yang sama ke antologi, kelas, lomba, atau buku solo. Tanpa menyalin ulang. (25 kata) | **Tulis di Studio, bagikan cuplikannya, lalu kirim naskah yang sama ke antologi atau buku solo. Tanpa menyalin ulang.** (18 kata) |
| Tombol | Gabung daftar tunggu · Lihat cara kerjanya | (tetap) |

Kelas dan Lomba tetap disebut di bagian Projects.

### Cara kerja: Satu naskah, empat langkah

Judul langkah tetap. Satu kalimat per langkah; pratinjau yang bergerak memperagakan sisanya.

| Langkah | v1 (kata) | v2 |
| --- | --- | --- |
| Menulis | 17 | **Tersimpan otomatis dan tetap pribadi sampai kamu membagikannya.** |
| Target harian | 26 | **Setiap hari yang mencapai target menjadi satu titik di kalendermu.** |
| Dibagikan | 21 | **Yang tampil di Community hanya bagian yang kamu pilih.** |
| Terbit | 22 | **Kirim naskah ke antologi tanpa menyalin ulang. Drafmu tetap bisa diubah.** |

"Tanpa konfeti, tanpa poin" dan "naskah lengkapnya tetap di Studio" kini diperagakan oleh pratinjau, tidak ditulis.

### Projects: Ke mana naskahmu bisa pergi

Paragraf penjelas setiap jalur **dihapus**. Yang tampil hanya nama dan label alur:

| Jalur | Label alur |
| --- | --- |
| Antologi | Seleksi · revisi · terbit |
| Buku Solo | Editing · sampul · produksi |
| Kelas Menulis | Materi · tugas · umpan balik |
| Lomba | Kriteria · finalis · pemenang |

Dari 92 menjadi ±20 kata. Klaim "penjurian anonim" (Lomba) ikut hilang dari landing; ia tetap ada di PRD.

### Tiga janji

Ketiga judul dibaca bersama sebagai satu pernyataan besar (momen `word-highlight`, DESIGN.md 4.6). Di bawahnya setiap janji punya label pendek (**Privasi**, **Kiriman**, **Hak cipta**) dan satu kalimat:

| Judul | v2 |
| --- | --- |
| Draf pribadimu tetap pribadi. | **Tidak dibaca orang lain, kecuali alasan hukum atau moderasi yang dicatat.** **[konfirmasi]** nada pengecualian (BR-STD-05) |
| Yang sudah dikirim tidak ikut berubah. | **Revisi membuat versi baru; versi yang dikirim tetap tersimpan.** |
| Hak cipta tetap milikmu. | **Kecuali ketentuan proyek yang kamu baca dan setujui sebelum mendaftar.** |

### Daftar tunggu

| Elemen | v1 | v2 |
| --- | --- | --- |
| Judul | Simpan namamu di daftar tunggu. | (tetap) |
| Pengantar | Kami mengabarimu lewat email saat RanahMenulis dibuka untuk penulis di Indonesia dan Malaysia. | **Kami kabari lewat email saat RanahMenulis dibuka.** |

Negara tetap disebut di FAQ dan di kaki halaman ("Indonesia · Malaysia"). Label, placeholder, dan pesan form tidak berubah.

### Tanya jawab

Dua pertanyaan **dihapus** karena sudah dijawab oleh Tiga janji: "Siapa yang bisa membaca drafku?" dan "Apakah hak cipta karyaku tetap milikku?". Semua jawaban tampil terbuka, tanpa accordion (aturan `design-taste-frontend`); dengan empat butir pendek, itu tetap ringkas.

| Pertanyaan | v2 |
| --- | --- |
| Apa itu Grup Penulis? | **Ruang kecil tempat sekelompok penulis saling membaca tulisan yang dibagikan ke grup. Dokumen yang tidak kamu bagikan tetap pribadi.** **[konfirmasi]** Q-38 |
| Apakah tersedia di Indonesia dan Malaysia? | **Ya. Kamu memilih negara di profil, dan tulisanmu muncul di daftar penulis negara itu. Antarmukanya berbahasa Indonesia lebih dulu.** |
| Berapa biayanya? | **Menulis dan membaca direncanakan tanpa biaya langganan di awal. Program di Projects punya biaya sendiri yang tampil sebelum mendaftar.** **[konfirmasi]** biaya |
| Kapan RanahMenulis dibuka? | (tetap) Tanggalnya belum diumumkan. Orang di daftar tunggu yang pertama kami kabari. |

Kalimat "penulis dari negara lain boleh masuk daftar tunggu" dihapus: form daftar tunggu tidak membatasi negara, jadi tidak perlu diumumkan.

### Ringkasan jumlah kata (perkiraan)

| Bagian | v1 | v2 |
| --- | --- | --- |
| Hero (kalimat penjelas) | 25 | 18 |
| Cara kerja | 88 | ±40 |
| Projects | 92 | ±20 |
| Tiga janji | 79 | ±30 |
| Daftar tunggu | 26 | ±12 |
| Tanya jawab | 182 | ±70 |
| **Total** | **±490** | **±190** |
