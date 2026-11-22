# Catatan Keputusan Client — RanahMenulis

Tanggal catatan: 2026-11-08 (diperbarui dengan hasil diskusi lanjutan di hari yang sama)
Sumber: percakapan WhatsApp dengan client (Mas Wafiy), audit repo, PRD v0.1, dan hasil diskusi lanjutan.

## 1. Konteks singkat

- Repo yang ada (`ibnulwafiy/ranahmenulis`, commit `ce2be12`) adalah **Penulis+ Workspace**, alat bantu menulis untuk penulis antologi. Bukan implementasi PRD RanahMenulis.
- Cakupan PRD: dari 52 ID fitur, 0 Implemented, 6 Partial, 1 Mocked, 1 UI Only, 44 Missing.
- Rekomendasi audit: **bangun fondasi baru** (repo baru, Next.js, skema database baru, redesign UI/UX), lalu ambil sebagian komponen dan konten dari repo lama.
- Aplikasi lama tetap berjalan sampai penggantinya siap.

## 2. Keputusan dan konfirmasi dari client

| No | Hal | Status | Sumber |
| --- | --- | --- | --- |
| 1 | Konsep Penulis+ berbeda dari konsep RanahMenulis di PRD | Dikonfirmasi client ("beda konsep") | Chat WA |
| 2 | Bagian yang sama dan cocok untuk dibawa: **Editor Menulis** di Workspace | Dikonfirmasi client | Chat WA |
| 3 | Fitur utama: Studio, Projects (Antologi, Solo, Kelas Menulis, Lomba), dan Community. **Ranah Streak menyatu dengan Ranah Studio** (satu tempat), karena streak dihitung dari aktivitas menulis di Studio. Ini menggantikan butir "empat fitur terpisah" sebelumnya | Diputuskan dalam diskusi | Diskusi lanjutan |
| 4 | Streak, Studio, dan Projects "pasti harus ada" | Dikonfirmasi client | Chat WA |
| 5 | Studio isinya seperti tools menulis | Dikonfirmasi client | Chat WA |
| 6 | Community tetap menjadi modul: bagikan karya, baca, apresiasi, komentar, jaringan. Client masih bingung isinya (contoh yang ia sebut: seperti Threads) | Terkonfirmasi sebagai modul; **isi detail belum diputuskan** | Chat WA dan teks yang ditempel |
| 7 | **Tidak ada fitur AI di dalam aplikasi.** Client menyiapkan prompt yang dipakai penulis di ChatGPT atau Claude | Dikonfirmasi client | Chat WA |
| 8 | **Arsitektur MVP:** frontend dan backend dalam satu proyek Next.js (monolith), database **Supabase**. Dibangun dari awal, desain dan skema baru, mengikuti PRD | Diputuskan dalam diskusi | Diskusi lanjutan |
| 9 | **Rencana migrasi:** bila aplikasi sudah penuh dipakai, database dipindah ke VPS. Rencananya disiapkan sejak MVP (lihat bagian 5) | Diputuskan dalam diskusi | Diskusi lanjutan |
| 10 | **Hak akses (RBAC):** peran platform (Penulis, Organizer, Editor, Juri, Admin) ditambah **Grup Penulis**: anggota grup saling melihat tulisan, dan ada admin grup | Diputuskan dalam diskusi; **aturan visibilitas belum diputuskan** (butir 7 di bagian 4) | Diskusi lanjutan |
| 11 | **Marketplace** ditambahkan di samping Community, **setelah MVP**. Isinya belum ditentukan. PRD v0.1 menetapkan tepat empat modul tanpa tambahan tanpa persetujuan, jadi perlu dicatat sebagai perubahan resmi | Disampaikan dalam diskusi; isi **belum diputuskan** | Diskusi lanjutan |
| 12 | Perpustakaan prompt dari repo lama ikut dibawa (tombol salin untuk ChatGPT/Claude) | **Asumsi**, perlu dikonfirmasi | Penyimpulan dari butir 7 |
| 13 | Client ingin aplikasi ada di Play Store dan App Store. Alasannya: "goalsnya ke sana", tanpa pertimbangan khusus | Tujuan dikonfirmasi; **cara dan waktunya belum diputuskan** (butir 9 di bagian 4) | Chat WA |

Catatan: "tidak mau AI" berarti tanpa fitur AI di dalam aplikasi. Pengembangan aplikasinya tetap boleh berbantuan AI.

## 3. Dampak ke dokumen

- **PRD:** Disarankan naik ke v0.2 dengan perubahan berikut:
  - Baris "AI Writing Assistant" di bagian 24.2 diubah dari "ditunda" menjadi "tidak dibangun (keputusan client)".
  - Perpustakaan prompt menjadi konten pendukung di dalam Studio.
  - Ranah Streak digabung ke Ranah Studio. Struktur empat modul di PRD perlu ditulis ulang (tiga modul inti ditambah Marketplace setelah MVP).
  - Matriks izin (bagian 15) menambah Grup Penulis dan admin grup.
  - Marketplace dimasukkan sebagai fase setelah MVP, dengan isi yang masih dibuka.
- **Audit dan roadmap:** Struktur enam fase tetap berlaku. Yang berubah: stack ditetapkan (Next.js monolith dan Supabase, bukan lagi pilihan terbuka D2/D5), Fase 3 mencakup grup penulis, dan ada rencana migrasi ke VPS di luar enam fase (bagian 5).
- **Jadwal:** Estimasi roadmap sekitar 33–47 minggu kerja satu developer berbantuan AI (sekitar 8–11 bulan). Angka itu **sudah mengasumsikan bantuan AI**. Atas arahan, presentasi ke client tidak lagi menyebut angka pasti: disampaikan "lebih cepat dengan bantuan AI, jadwal pasti setelah Fase 1". Angka internal tetap perlu divalidasi setelah Fase 1. Di chat client sempat disebut "sampai 6 bulan lebih", jadi ekspektasi perlu diluruskan.

## 4. Pertanyaan yang masih terbuka untuk client

Prioritas: butir 1 sampai 3 paling menentukan.

1. Dari Workspace sekarang, mana lagi yang dibawa? (✅ atau ❌): Word Counter, Writing Session, Blueprint 10 Hari, Workbook Harian, Template Outline dan Naskah, Ebook Panduan, Story/Character/Plot/Scene Builder, Conflict Generator, Emotion Mapper, Synopsis Builder, Writing Checklist.
2. Editor Menulis: tetap sederhana seperti sekarang, atau ditambah format dasar (tebal, miring, judul, kutipan, daftar)? PRD (STD-01) meminta format dasar.
3. Community di awal: tulisan pendek dulu (seperti Threads, sekitar 500 kata), atau pendek dan panjang sekaligus?
4. "Tanpa AI" termasuk fitur kecil seperti cek ejaan atau saran kata otomatis?
5. Penulis+ yang sekarang masih dipakai penulis antologi? Kira-kira berapa orang?
6. Ada batas waktu atau acara yang aplikasi baru harus sudah dipakai?
7. **Grup Penulis:** anggota grup melihat semua tulisan sesama anggota, atau hanya yang dibagikan ke grup?
8. **Marketplace:** isinya apa (karya digital, buku, jasa seperti editor dan desain cover, atau lainnya)? Perlu persetujuan resmi sebagai tambahan di luar empat modul PRD.
9. **Play Store dan App Store:** harus ada sejak rilis pertama, atau boleh web dulu lalu menyusul ke store? Pilihan yang ditawarkan: (a) aplikasi native langsung, (b) web dulu lalu dibungkus jadi aplikasi (saran).

Pertanyaan yang ditahan sampai Fase 1: pembayaran (manual atau online), siapa pengelola proyek, hak cipta, format kelas, kebijakan Malaysia, usia, refund, dan referensi desain.

### Alasan versi web tetap wajib (bahan jawaban bila client memilih native)

- Link karya yang dibagikan akan dibuka orang yang belum punya aplikasinya. Tanpa web, mereka hanya disuruh install dulu, dan kebanyakan berhenti di situ.
- Pratinjau link yang rapi di WA, IG, dan Threads dibaca dari halaman web.
- Halaman karya, antologi, lomba, dan kelas bisa ditemukan lewat Google hanya bila ada versi web.
- Pengelola, juri, dan editor bekerja di laptop; PRD juga meminta dukungan desktop, tablet, dan HP.

### Hal yang perlu diketahui bila masuk store

Berdasarkan aturan Apple dan Google sejauh yang diketahui, perlu dicek ulang ke aturan terbaru sebelum diumumkan ke client.

- Pembayaran konten digital di dalam aplikasi iPhone umumnya lewat sistem Apple, dengan potongan 15–30%. Bisa berdampak ke Kelas Menulis; layanan penerbitan buku fisik biasanya tidak.
- Aplikasi dengan konten buatan pengguna (Community) wajib punya fitur lapor, blokir, dan moderasi.
- Pengguna harus bisa menghapus akun dari dalam aplikasi.
- Apple dapat menolak aplikasi yang hanya membungkus web tanpa fitur khas aplikasi, misalnya notifikasi.
- Biaya akun developer: Apple sekitar $99 per tahun, Google $25 sekali bayar.

## 5. Rencana tindakan

1. Kirim kesimpulan dan pertanyaan di atas ke client.
2. Perbarui PRD ke v0.2 setelah jawaban masuk.
3. **Fase 0:** tambal temuan F1 sampai F4 di aplikasi lama bila masih dipakai; siapkan repo baru (D4) dan proyek Supabase baru (D5). Framework (D2) sudah diputuskan: Next.js.
4. **Fase 1:** model domain (entitas, status submission, matriks izin termasuk Grup Penulis) dan sistem desain.
5. Lanjut sesuai roadmap: Fase 2 UI dengan data tiruan, Fase 3 backend fondasi (termasuk grup penulis), Fase 4 modul tersambung, Fase 5 pengerasan dan peluncuran.
6. Marketplace dan pengemasan ke Play Store/App Store dijadwalkan setelah MVP, mengikuti jawaban client.

### Rencana migrasi database ke VPS

Dilakukan saat aplikasi sudah penuh dipakai. Waktunya ditentukan oleh pemicu, bukan tanggal. Pemicu belum diberi angka dan ditetapkan bersama setelah ada data pemakaian (contoh: biaya Supabase, batas performa, kebutuhan lokasi data atau kontrol penuh).

**Disiapkan sejak MVP agar mudah pindah:**

1. Skema database dikelola lewat berkas migrasi berurutan di repo.
2. Semua akses data lewat satu lapisan di server (bukan langsung dari browser), sehingga mengganti sumber data tidak mengubah tampilan.
3. Supabase Auth dan Storage dipakai lewat lapisan tipis, supaya bisa diganti tanpa menulis ulang fitur.
4. Cadangan rutin dan latihan memulihkan data dilakukan sejak awal.

**Langkah pindah:**

1. Tetapkan pemicu.
2. Siapkan VPS: Postgres, cadangan otomatis, pemantauan, pengamanan server.
3. Uji coba: salin data ke VPS, jalankan aplikasi pada salinan, uji akses per peran.
4. Pindah: mode baca-saja singkat, salin data terakhir, ganti sambungan database.
5. Pantau dan siap mundur: Supabase tetap hidup beberapa minggu sebagai cadangan.

**Yang perlu diganti saat pindah:** login (Supabase Auth), penyimpanan file (Storage), dan aturan keamanan data (RLS) yang memakai identitas dari login Supabase. Database Postgres-nya sendiri relatif mudah dipindah.

**Dua jalur, dipilih saat pindah:** self-host Supabase di VPS (perubahan kode terkecil), atau Postgres biasa dengan login sendiri (lebih bebas, kerja lebih banyak).

**Perlu ditinjau lagi bila** ada ketentuan lokasi data pribadi di Indonesia atau Malaysia (risiko R9 di audit).

### Temuan teknis yang paling mendesak di aplikasi lama (jika masih dipakai)

- F1 (High, Potential): service worker memakai cache-first untuk panggilan Supabase (`public/sw.js:58-75`).
- F2 (High, Confirmed): error tulis Supabase tidak dicek, toast "Tersimpan otomatis" muncul walau gagal (`Workspace.tsx:101-116`, `150-173`, `349-447`).
- F3 (High, Confirmed): pola hapus lalu sisipkan tanpa transaksi (`Workspace.tsx:391-459`).
- F4 (High, Potential): error pemuatan awal tidak dicek, state kosong bisa menimpa data server (`Workspace.tsx:254-344`).

## 6. Pesan siap kirim ke client

Kesimpulan:

```
Mas, ini kesimpulan dari diskusi kita ya:

1. RanahMenulis punya 3 modul inti: Studio (Streak menyatu di dalamnya, karena streak dihitung dari aktivitas menulis), Projects (Antologi, Solo, Kelas Menulis, Lomba), dan Community. Marketplace menyusul setelah versi pertama.

2. Hak akses: ada peran Penulis, Organizer, Editor, Juri, dan Admin. Ditambah Grup Penulis, anggotanya bisa saling melihat tulisan, dengan admin grup sendiri.

3. Dari aplikasi Penulis+ yang sekarang, yang dibawa ke aplikasi baru terutama Editor Menulis dan perpustakaan prompt. Sisanya menunggu keputusan Mas.

4. Tidak ada fitur AI di dalam aplikasi. Penulis tetap bisa menyalin prompt dari aplikasi untuk dipakai di ChatGPT atau Claude.

5. Teknologi: Next.js dalam satu proyek (tampilan dan server jadi satu) dengan database Supabase. Kalau nanti sudah penuh dipakai, database dipindah ke server sendiri (VPS), dan rencana pindahnya sudah disiapkan dari awal.

6. Aplikasi baru dibuat dari nol, desain dan database baru. Penulis+ yang sekarang tetap dibiarkan jalan sampai yang baru siap.

7. Urutan kerjanya: desain dulu, disetujui Mas, baru backend dibangun.

Soal waktu, pengerjaan dibantu AI jadi lebih cepat. Angka pastinya saya kabari setelah tahap desain dan cakupan awal disepakati.

Boleh dikoreksi kalau ada yang kurang pas ya Mas. Setelah itu saya kirim beberapa pertanyaan singkat untuk menentukan detailnya.
```

Pertanyaan:

```
Yang masih perlu Mas putuskan:

1. Mana lagi dari Workspace yang sekarang yang mau dibawa? Balas ✅ atau ❌:
   Word Counter, Writing Session, Blueprint 10 Hari, Workbook Harian, Template Outline dan Naskah, Ebook Panduan, Story/Character/Plot/Scene Builder, Conflict Generator, Emotion Mapper, Synopsis Builder, Writing Checklist

2. Editor Menulis:
   a. Tetap sederhana seperti sekarang
   b. Ditambah format dasar (tebal, miring, judul, kutipan, daftar)

3. Community di awal:
   a. Tulisan pendek dulu (seperti Threads, maksimal sekitar 500 kata)
   b. Pendek dan panjang (cerpen, esai) sekaligus

4. Grup Penulis: anggota melihat semua tulisan sesama anggota, atau hanya yang dibagikan ke grup?

5. Marketplace: isinya apa? Karya digital, buku, jasa (editor, desain cover), atau lainnya? Mulai setelah versi pertama.

6. "Tanpa AI" itu termasuk fitur kecil seperti cek ejaan atau saran kata otomatis juga?

7. Penulis+ yang sekarang masih dipakai penulis antologi? Kira-kira berapa orang?

8. Ada batas waktu atau acara yang aplikasi barunya harus sudah dipakai?

9. Play Store dan App Store: harus langsung ada sejak rilis pertama, atau boleh web dulu lalu menyusul ke store?
```

## 7. Rujukan

- PRD RanahMenulis v0.2 (sumber yang dirawat): `PRD RanahMenulis v0.2.md` di folder proyek
- PRD RanahMenulis v0.1 (arsip, kini ikut diperbarui jadi v0.2 di claude.ai): https://claude.ai/artifact/7peCWVDK2nhM2iTQGdu4cq
- Lembar Keputusan Novlr (jawaban di bagian 8): https://claude.ai/artifact/GzmNiosgKgkyVUxkRRttap
- Audit dan Roadmap RanahMenulis: https://claude.ai/artifact/9XQYbgvLmodhruWvRS3XJp
- Presentasi ke client: `docs/arsip/RanahMenulis - Kondisi dan Rencana.pptx` (17 slide, sudah memuat keputusan di atas)
- Repo yang diaudit: `ranahmenulis/` di workspace (commit `ce2be12`, tidak diubah selama audit).

## 8. Jawaban Lembar Keputusan Novlr (17 November 2026)

Dari: Wafiy. Lembar: https://claude.ai/artifact/GzmNiosgKgkyVUxkRRttap. Kode butir (h, s, p, c, m, a) mengikuti lembar itu. Ini keputusan client: butir Novlr yang berstatus `[usulan]` di dokumen lain dan dijawab "Setuju, diambil" di sini kini disetujui. Keputusan yang mengubah PRD (mis. target per dokumen, pembatalan proyek gratis, batas dokumen gratis, Event umum, grup buatan penulis) belum dimasukkan ke PRD; perlu pembaruan PRD dan `prd/CHANGELOG.md`.

### Setuju, diambil

| Butir | Keputusan |
| --- | --- |
| h1, h3, h4, h5 | Ringkasan mingguan di Beranda; kartu panduan awal yang bisa ditutup; kartu proyek dan kelas yang sedang dibuka; tiga angka kata (minggu ini, bulan ini, tahun ini) |
| s1, s4, s5, s6, s7 | Dialog target dengan pilihan cepat; riwayat streak sebelumnya; timer sprint di editor; ekspor naskah; riwayat versi tulisan |
| s9, s10, s11, s12, s13 | Pencarian cepat dan pencarian di daftar dokumen; pengaturan menulis di akun; daftar pintasan keyboard; statistik tambahan; arsip dan duplikat dokumen |
| s20, s25 | Gambar kutipan untuk dibagikan; angka kata yang bisa disematkan di editor |
| p3, p4, p5 | Bagian "Kelas yang sedang berjalan" dengan tombol Lanjutkan; salin latihan menulis ke Studio; testimoni peserta di halaman kelas |
| c4, c5, c6 | Berbagi progres ke grup sebagai pilihan terpisah; peringatan privasi di grup; kartu progres yang bisa dibagikan |
| a1, a2 | Pengaturan notifikasi; email progres menulis mingguan |

### Diambil dengan syarat atau bentuk tertentu

- **s3** Target per dokumen: target kata dan tenggat per dokumen, boleh lebih dari satu.
- **s8** Riwayat versi disimpan **3 hari**, seperti paket Free Novlr.
- **s14** Tambah jenis dokumen dan tag (status tidak disebut).
- **s15** Impor `.docx` saja, setelah MVP.
- **s24** Notifikasi penyemangat saat menulis: ya, sederhana.
- **p2** Pendaftaran proyek hanya bisa dibatalkan untuk proyek **gratis** (BR-PRJ-11 / Q-30 untuk yang berbayar tetap terbuka).
- **c1** Event dibangun sebagai fitur umum; tantangan pertama menjadi contoh.
- **c2** Penulis boleh membuat grup sendiri.
- **c3** Timer sprint pribadi dulu; sesi bersama menjadi bagian Event.
- **c7** Daftar peserta event: hanya jumlah peserta; nama hanya terlihat oleh anggota grup yang sama.
- **c8** Tampilan acara cukup daftar kartu, tanpa kalender.
- **c9** Satu tautan komunitas luar resmi (Discord atau WhatsApp).
- **a4** Ada batas dokumen untuk akun gratis (angkanya belum ditentukan).

### Tidak diambil atau ditunda

- **h2** Kartu Beranda yang bisa diatur: belum, Beranda tetap satu susunan.
- **h6** Konten editorial di Beranda: tidak.
- **s2** Target mingguan: harian saja di MVP.
- **s16** Catatan riset dan profil tokoh: Fase 2, bersama manuskrip multi-bab.
- **s17** Struktur buku (bagian dan papan alur): Fase 2 sesuai PRD, papan alur ikut di sana.
- **s18** Kolaborasi naskah dan komentar di dalam teks: tidak di MVP; umpan balik lewat Projects (editor, mentor) dan komentar Community.
- **s19** Tautan baca publik untuk naskah: tidak; berbagi lewat Bagikan ke Community (cuplikan maks 500 kata).
- **s21** Pilihan font dan jarak baris per dokumen: tetap satu gaya tulis.
- **s22** Kamus diksi terhubung ke kata terpilih: tetap daftar statis di panel bantuan.
- **s23** Mode ramah disleksia: tunda.
- **p1** Kursus mandiri (rekaman): tidak; kelas tetap hidup dengan jadwal dan mentor.
- **p6** Sertifikat kelas: tetap Fase 2.
- **m1** Marketplace: tetap Fase 3, acuan dari produk lain dicari nanti.
- **m2** Penawaran dan diskon mitra: tidak perlu.
- **a3** Tema tambahan: tidak, cukup terang dan gelap.

### Perlu dibahas dulu (belum diputuskan)

- **s26** Pemeriksa tata bahasa
- **s27** Cadangan otomatis ke Google Drive dan Dropbox
- **p7** Pemutar materi mengambang
- **p8** Situs penulis dengan domain sendiri
- **a5** Kartu paket dan data contoh buram di tiap halaman
- **a6** Undang teman dengan hadiah
- **a7** Chat dukungan dan alat diagnostik

Catatan Wafiy: "Kita bahas yang perlu dibahas."

### Pesan tambahan dari Wafiy (WhatsApp, 17 November 2026)

- **Penamaan ulang "Roast My Writing":** namanya akan diganti. Jangan diganti sekarang; client ingin menunggu sampai pekerjaan selesai supaya semua revisi dikerjakan sekaligus. Nama penggantinya belum diberikan.
- **Community tanpa chat realtime:** jangan membangun chat realtime di bagian Community. Dibuat seperti Novlr; percakapan diarahkan ke platform lain lewat satu tautan komunitas resmi (selaras dengan c9). Chat/DM tetap di luar cakupan.

### Pengingat scope MVP dari founder (17 November 2026)

User mengirim ulang daftar scope MVP founder (tiga modul inti dan delapan supporting platform). Teks lengkapnya dan tiga selisih terhadap PRD (konfigurasi platform, notifikasi pengelola, administrasi pembayaran) ada di `docs/produk/MVP Scope RanahMenulis.md` bagian 7. PRD belum diubah.


### Unggahan gambar dan berkas (keputusan user, 20 November 2026)

- **Gambar di postingan Community** tidak ada di PRD (COM-03 menyebut "foto" penulis, bukan lampiran) dan tidak masuk daftar MVP Community. Dibangun atas persetujuan user: satu gambar per postingan, teks alternatif wajib, diperkecil dan diubah ke WebP di perangkat. **Perlu konfirmasi client.**
- **Sampul dokumen Studio, banner proyek, dan logo grup**: tidak dibangun (tidak ada di PRD atau Fase 2, PLT-09).
- **Unggah naskah Solo (DOCX/PDF)** mengikuti Q-13 dan **pratinjau sampul/isi buku dari tim** mengikuti SOL-02 (keduanya MVP). Batas ukuran berkas **10 MB bersifat sementara**: client belum memberi angka (konstanta `FILE_MAX_BYTES` di `src/lib/files/limits.ts`).
- Berkas disimpan di perangkat (IndexedDB `ranah-files`). Saat backend ada: Supabase Storage dengan RLS (naskah hanya penulis dan tim yang ditugaskan; pratinjau hanya penulis buku itu), pemindaian berkas, dan batas ukuran dari client.

### Masukan client setelah uji (Wafiy, WhatsApp, 22 November 2026)

Dicatat apa adanya dari pesan dan dua tangkapan layar yang diteruskan user. **Belum ada yang dikerjakan.** Perubahan di bawah ini belum dipecah menjadi rencana; tiap butir yang mengubah perilaku atau menyentuh lebih dari 5 berkas perlu rencana dan persetujuan dulu (CLAUDE.md aturan 2 dan 3).

**Dari tangkapan layar (ditandai penting oleh client)**

- **Beranda, blok "Bersama penulis lain"** (tautan Event, Grup Penulis, Tulis postingan; tangkapan juga memuat kartu "Undangan grup"): *"Yang wajib diganti bagian ini bang, grup menulis, usahain ada di komunitas, kalo ditaro dibagian sini. Nanti dia bakal jadi fitur yg tersembunyi."* Maksud yang ditangkap: Grup Penulis ditempatkan di Community, bukan di Beranda, dan nanti menjadi fitur tersembunyi. Belum jelas: apakah Event dan kartu Undangan grup ikut pindah, dan apakah "tersembunyi" berarti dimatikan lewat pengaturan atau hanya dikeluarkan dari MVP.
- **Community, chip kategori** ("Trending Today", "New Writers", "Editor's Picks", dan seterusnya): *"bagian 'trending today..' dan seterusnya nanti bakal diganti pakai fitur yg 3 (roasting, writter battle dll) di fase ke 2 ya bang."* Jadi chip ini diganti fitur ketiga (Roast My Writing, writer battle, dan sejenisnya) di Fase 2. Untuk sekarang belum ada perintah mengubah; hanya pemberitahuan arah.

**Pertanyaan client untuk kita jawab**

- **A1.** Bagian Ranah Studio ("Ruang Menulismu yang Fokus dan Nyaman") di landing: bisakah dibuat demo langsung supaya calon pengguna bisa merasakan pengalaman menulis sebelum mendaftar?
- **A2.** Apakah akan ada login dengan Google?
- **A3.** Email verifikasi memakai penyedia apa? Client menilai email standar Supabase sangat terbatas kuotanya. (Terkait tahap backend: SMTP khusus.)

**Revisi dan perbaikan**

- **Multi bahasa**: masih banyak teks yang tidak ikut berganti ke bahasa yang dipilih. (Sudah diketahui: Studio, Community, Beranda, galat daftar tunggu, dan teks contoh fixture masih Indonesia, lihat CLAUDE.md bagian i18n.)
- **Bilah bawah ponsel**: hapus tab Profil, karena profil sudah ada di kanan atas (ikon avatar) dan jadi dobel. Berdampak pada keputusan lima tab di bilah bawah (Beranda, Jelajahi, Studio, Projects, Profil) dan pada tautan "Tersimpan" yang kini dibuka dari profil sendiri di ponsel.
- **Tahanan kuota pembayaran**: *"kuotamu ditahan 24 jam, 2 jam aja bang"*. `HOLD_MS` (`projects/payment-model.ts`) 24 jam menjadi 2 jam. Menjawab Q-20 dengan angka dari client; teks "24 jam" di layar, notifikasi, dan panduan uji ikut diperiksa.

**Revisi fitur Studio** (teks client, disalin utuh)

> 1. Folder dan dokumen dipisah. Penulis bisa membuat folder untuk mengelompokkan dokumen, serta membuat dokumen baru secara terpisah. Dokumen lama maupun baru bisa dimasukkan ke dalam folder.
> 2. Folder sebagai tempat menyimpan naskah buku. Setiap folder bisa diberi cover dan judul buku. Di dalamnya, penulis bisa membuat beberapa dokumen untuk menyusun naskah per bab atau subbab.
>
> Jadi, folder berfungsi sebagai tempat menyimpan dan mengorganisasi naskah buku, sedangkan dokumen digunakan untuk menulis isi naskah.

Penjelasan tambahan dari user: sistemnya seperti folder di Google Drive; dari folder nanti bisa memasukkan Google Docs, spreadsheet, dan seterusnya.

Pengamatan terhadap kode saat ini (belum diputuskan): Studio sudah punya folder satu tingkat dan memindahkan dokumen ke folder, tetapi folder hanya punya nama; **tidak ada cover dan judul buku**. Keputusan 20 November 2026 di atas ("sampul dokumen Studio tidak dibangun") perlu ditinjau ulang karena sekarang yang diminta adalah cover untuk **folder**, bukan dokumen. Hal yang perlu ditanyakan sebelum rencana:

1. Apakah "folder dan dokumen dipisah" hanya berarti membuat folder dan dokumen terpisah dengan aksi "pindahkan ke folder" (yang sebagian sudah ada), atau tampilan Dokumen dipecah jadi dua bagian/tab (Folder dan Dokumen)?
2. Apakah semua folder otomatis jadi "buku" (punya cover dan judul), atau ada jenis folder biasa dan folder buku? Apakah judul buku berbeda dari nama folder?
3. Cover: unggah gambar (pakai jalur unggahan yang ada), atau cover tipografis yang dibuat otomatis seperti sampul Projects?
4. Urutan bab: perlu urutan manual (seret atau naik-turun) dan penomoran bab, atau tetap urut abjad/terakhir diubah?
5. Folder bersarang (subfolder): perlu atau cukup satu tingkat? Client menyebut "per bab atau subbab".
6. Apakah ada ekspor atau hitung kata per folder (naskah utuh)? Dan hubungannya dengan Projects: kirim satu naskah buku (gabungan bab) ke Antologi atau Solo?
7. "Memasukkan Google Docs, spreadsheet, dll": apakah artinya folder bisa memuat berkas jenis lain (unggah atau tautan), atau hanya perumpamaan dengan Google Drive? Spreadsheet tidak ada di PRD dan di luar editor teks Studio; jangan dibangun sebelum client memastikan.

**Keputusan tim dan jawaban client (22 November 2026, menjawab pertanyaan di atas)**

Keputusan tim (user): butir tab Profil, tahanan 2 jam, Grup Penulis dan Event ke Community, chip Community disembunyikan dulu, Indonesia dan Inggris dilengkapi di semua halaman, Login Google masuk MVP, email verifikasi memakai email bawaan Supabase sampai domain dibeli lalu Resend. Demo Studio: editor ringkas di landing tanpa akun (usulan tim, belum dijawab client).

- **Unggah jpg, png, pdf, dll (koreksi, 22 November 2026, siang):** tim sempat salah menangkap dan menjawab seolah-olah ini soal folder penulis di Studio. Client meluruskan: *"Nggak bang, maksudnya nanti di folder lain. Karena gini, admin kan nanti misal mau upload poster yang berupa gambar jd butuh itu."* Jadi kebutuhannya adalah **admin mengunggah gambar** (contoh: poster) di tempat penyimpanan terpisah dari Studio. Lalu: *"Kalopun bs gapapa nanti aja fase 2 its ok."* Keputusan awal tim: ditunda ke Fase 2. **Diubah oleh user pada hari yang sama: poster proyek masuk MVP sebagai unggahan opsional**, dengan sampul otomatis dari judul sebagai cadangan bila belum diunggah (menggantikan catatan 20 November bahwa banner proyek belum dibangun; logo grup tetap belum). Lingkup: poster proyek saja (event tidak), dipotong ke 4:5, teks alternatif wajib, diunggah Organizer atau Administrator. Folder Studio tetap hanya memuat dokumen teks (keputusan tim, bukan permintaan client): cover buku adalah satu-satunya gambar. Belum ditanyakan: poster dipakai di mana (proyek, event, landing). Unggah gambar dan PDF oleh tim yang sudah ada (pratinjau Solo di tab Tahap Organizer) tidak berubah.
- **Kirim buku utuh: ya** (jawaban client: "penulis 1 buku full bab dan sub bab"). Penulis perlu mengirim satu buku berisi seluruh bab dan subbab. Belum jelas: apakah bab dan subbab berarti dua tingkat folder (buku → bab → subbab), atau dokumen = bab dengan subbab sebagai judul di dalam dokumen. Dan proyek mana yang menerima buku utuh (Solo hampir pasti; Antologi dibatasi per karya).
