# Gap fitur: Novlr dan RanahMenulis, per menu

Tanggal: 16 November 2026. Dibuat atas permintaan: catat **semua** fitur Novlr yang menunya mirip dengan RanahMenulis, tanpa memilih-milih, termasuk sub-fitur kecil dengan deskripsinya.

Sumber sisi Novlr: `docs/referensi/novlr/novlr-isi-dalam-aplikasi.md` (dilihat langsung di akun Free; label dalam tanda kutip adalah teks persis di UI). Sumber sisi RanahMenulis: `CLAUDE.md` (status build), `docs/prd/09-daftar-fitur-setiap-modul.md` dan `24-fitur-fase-kedua-dan-ketiga.md` (ID fitur), `docs/desain/Catatan Slicing.md` (rencana N1 sampai N17), dan pemeriksaan kode `src/features/studio` untuk beberapa butir yang disebut "terverifikasi di kode". **Status RanahMenulis di luar butir itu diambil dari dokumen, belum diaudit baris per baris di kode.**

## Cara membaca

Status sisi RanahMenulis:

| Status | Arti |
| --- | --- |
| **ADA** | Sudah dibangun (data dummy atau lokal, belum backend) |
| **SEBAGIAN** | Ada versi lebih sempit atau lain bentuknya |
| **RENCANA** | Ada di rencana dengan ID (N1..N17, 6f, 6g) tetapi belum dibangun |
| **PRD LANJUT** | Ada di PRD sebagai Fase 2 atau Fase 3 |
| **TIDAK ADA** | Tidak ada di PRD maupun rencana |
| **DILEWATI** | Sengaja tidak diambil (tercatat di Catatan Slicing) |

### Peta menu: lima menu RanahMenulis dan padanannya di Novlr

Catatan penting soal nama: **"Projects" di dua produk berbeda arti.** Di Novlr, Projects adalah ruang kerja naskah (satu buku: Overview, Planning, Manuscript, Notebook). Di RanahMenulis, Projects adalah program penerbitan (Antologi, Solo, Kelas, Lomba). Padanan ruang kerja naskah Novlr di RanahMenulis adalah **Studio** (dokumen dan folder), dan manuskrip multi-bab ada di Fase 2 (STD-06).

| Menu RanahMenulis | Padanan di Novlr | Catatan |
| --- | --- | --- |
| Home (Beranda) | Desk, ditambah kartu Draftsgiving, Reading Room, dan "Resume Writing" di sidebar | Beranda RanahMenulis juga berisi feed Community; Desk Novlr tidak |
| Studio | Projects (ruang kerja naskah), Note Library, Habits & Goals, Analytics | Streak dan Statistik ada di Studio RanahMenulis, di Novlr berdiri sendiri |
| Project (Projects) | Academy (padanan Kelas Menulis); tidak ada padanan Antologi, Solo, Lomba | Novlr punya "Sites" (situs penulis) yang terkunci di Free |
| Community | Community, Events, Writing Groups, Draftsgiving, Resources (Reading Room) | Novlr tidak punya feed, profil publik, apresiasi, komentar publik, atau follow |
| Marketplace | Tidak ada. Paling dekat: "Writer Discounts" di Resources dan "Sites" | Marketplace RanahMenulis berlabel "Menyusul" dan Fase 3 |

### Ringkasan: isi utama tiap menu di Novlr

| Menu RanahMenulis | Fitur utama di Novlr |
| --- | --- |
| Home | **Desk**: sapaan dan ringkasan mingguan, kartu onboarding, kartu Projects, Habit Streak, Productivity (heatmap), Word Count, Words Written, Academy, Reading Room, Draftsgiving, jadwal sprint, kutipan, Spotify. Kartu bisa diseret, disembunyikan, dan direset ("Organise your desk"). Sidebar punya "Resume Writing". |
| Studio | **Projects** (ruang kerja naskah: Overview, Planning, Manuscript, Notebook; editor dengan widget target, statistik kata, timer sprint, tata bahasa; panel Notes, Comments, Versions; Share, Export, Share snippet), **Note Library**, **Habits & Goals** (habit harian atau mingguan, goal proyek), **Analytics** (grafik, heatmap, pace, jam dan hari favorit). |
| Project | **Academy**: katalog kursus (Free atau Starter), halaman kursus, Course Player mengambang, progres per pelajaran. Plus **Sites** (situs penulis, terkunci). Tidak ada Antologi, Solo, Lomba, submission, atau pembayaran proyek. |
| Community | **Community** (pintu ke Discord, sprint, playlist), **Events** (satu kartu: Draftsgiving), **Draftsgiving** (tiga tingkat target, dasbor pribadi, kartu progres, "duduk di meja"), **Writing Groups** (buat atau gabung lewat kode, publik atau privat), **Resources** (tautan keluar). |
| Marketplace | Tidak ada. Yang mendekati hanya "Writer Discounts" dan paket Lifetime. |

Tiga kesimpulan dari peta ini:
1. **Studio RanahMenulis menggabungkan empat menu Novlr.** Penulisan, streak, dan statistik di Novlr berdiri sendiri-sendiri.
2. **"Projects" beda arti di dua produk** (lihat catatan di atas). Satu-satunya padanan Projects RanahMenulis di Novlr adalah Academy.
3. **Community dan Marketplace hampir tanpa acuan Novlr.** Novlr tidak punya feed, profil publik, komentar, follow, atau jual-beli; Community-nya dialihdayakan ke Discord. Acuan untuk dua menu ini harus datang dari produk lain.

---

## 1. Home (Beranda) dan Desk Novlr

| # | Fitur Novlr (yang terlihat) | Padanan RanahMenulis | Status | Gap dan catatan |
| --- | --- | --- | --- | --- |
| 1.1 | Sapaan "Welcome to Novlr, [nama]!" dengan baris penyemangat acak ("Your characters are wondering where you've been.") | Beranda tanpa sapaan bernama; ada blok "Hari ini" | SEBAGIAN | Sapaan hangat dan salinan bersyarat belum ada (disebut dalam penyelarasan Beranda dan Streak) |
| 1.2 | Ringkasan mingguan: "You've written 3 words over the last 7 days. That's 100% more than the week before." dengan panah tren | Tidak ada; `statistics.ts` sudah punya data kata per hari | RENCANA (N2) | Cuma butuh rumus 7 hari dibanding 7 hari sebelumnya |
| 1.3 | Kartu onboarding bertumpuk ("Import your work", tombol "Import now", bisa ditutup) | Komponen `LangkahAwal` ada di sistem desain; onboarding profil `/mulai` ada | SEBAGIAN | Tidak ada kartu langkah-awal bertumpuk di Beranda yang bisa ditutup; tidak ada impor |
| 1.4 | Tombol "Organise your desk": seret kartu untuk urut, ikon mata untuk sembunyikan, "Set all to visible", "reset to default layout" | Tidak ada | RENCANA (N16) | Bertabrakan dengan Beranda sebagai feed; perlu putusan apakah dipecah menjadi dasbor dan feed. Masukan client (Fahmi) soal Beranda sejalan |
| 1.5 | Kartu **Projects**: daftar proyek ("Last edited today"), tombol "Create" dan "Import", tautan "All projects" | Blok "Hari ini" (lanjutkan menulis) dan "Proyek saya" (Projects, dua proyek) | SEBAGIAN | "Proyek saya" RanahMenulis adalah program, bukan naskah; naskah ada di Studio |
| 1.6 | Kartu **Draftsgiving**: gambar, tanggal, "1,613 writers already in", avatar, tombol "Join Draftsgiving" | Tidak ada | RENCANA (N17, model Event) | Butuh model Event umum lebih dulu |
| 1.7 | Kartu **Reading Room**: tiga artikel blog dengan tanggal, tautan keluar | Tidak ada | TIDAK ADA | Konten editorial dari situs lain |
| 1.8 | Kartu **Habit Streak** ("Set your target") | Streak ada di tab Studio dan ringkasan di blok "Hari ini" | ADA | Dialog target lebih kaya di Novlr (lihat 2.20) |
| 1.9 | Kartu **Productivity**: heatmap 12 minggu (Aug sampai Nov), legenda Less/More, "1 writing days in the last 12 weeks", tautan "Detailed analytics" | Kalender Streak | SEBAGIAN | RanahMenulis punya kalender aktivitas; rentang dan ringkasan kalimatnya perlu dibandingkan |
| 1.10 | Kartu **Word Count**: kata ditambahkan "this week", "this month", "this year" | Statistik Harian/Mingguan/Bulanan | SEBAGIAN | Angka tiga periode sekaligus di satu kartu belum ada di Beranda |
| 1.11 | Kartu **Novlr Academy**: tiga kursus, "All courses" | Tidak ada di Beranda; Projects Kelas ada | SEBAGIAN | Tidak ada promosi kursus di Beranda |
| 1.12 | Kartu **Words Written**: grafik batang, selektor periode ("7 days"), "Total Written", "Daily Average" | Statistik (grafik batang, rata-rata) | ADA | Di halaman Statistik, bukan di Beranda |
| 1.13 | Kartu **Upcoming Writing Sprints** (Discord): jadwal, tombol "Add", "Join a Writing Sprint" | Tidak ada | TIDAK ADA | Di Novlr sprint hidup di Discord; PRD memintanya di dalam produk, cakupan belum diputuskan |
| 1.14 | Kartu **Writer's Wisdom**: kutipan penulis terkenal | Tidak ada | TIDAK ADA | Konten kecil, gampang |
| 1.15 | Kartu **Spotify Playlist of the Week** | Tidak ada | TIDAK ADA | Di luar cakupan |
| 1.16 | "Resume Writing" di sidebar: nama bagian terakhir dan proyek, tautan ke manuskrip | Kartu "Lanjutkan menulis" di sidebar (lg), ikon di rail (md) | ADA (N1) | Ponsel tidak punya; dokumen terakhir = terakhir diubah |
| 1.17 | Notifikasi baru, hal yang perlu perhatian | Baris Notifikasi, "Perlu perhatian" (permintaan revisi) di Beranda | ADA | Novlr Desk tidak punya ini; ini kelebihan RanahMenulis |
| 1.18 | (tidak ada di Novlr) feed Community di Beranda | Feed "Mengikuti" dan "Jelajahi" | ADA | Kelebihan RanahMenulis |

---

## 2. Studio dan padanan di Novlr

### 2A. Daftar dokumen dan daftar proyek

| # | Fitur Novlr | Padanan RanahMenulis | Status | Gap dan catatan |
| --- | --- | --- | --- | --- |
| 2.1 | Daftar proyek sebagai kartu: judul, "3m ago", "3 words", menu ⋮ | Tab Dokumen: baris dokumen | ADA | Bentuknya baris, bukan kartu |
| 2.2 | Tab "Active" dan "Archive" ("No archived projects": menyimpan tanpa menghapus) | Daftar dokumen dan Sampah | SEBAGIAN | Tidak ada Arsip; hanya Sampah |
| 2.3 | Kotak "Search projects..." | Tidak ada pencarian di daftar dokumen (terverifikasi di kode: `use-document-list` tanpa pencarian) | TIDAK ADA di build; PRD STD-03 meminta "cari, urutkan" | Gap terhadap PRD, bukan hanya terhadap Novlr |
| 2.4 | "Filters" (kelompok "Type") | Tidak ada | TIDAK ADA | |
| 2.5 | Kotak centang pilih-semua dan penghitung "1 projects" (aksi massal) | Tidak ada | TIDAK ADA | |
| 2.6 | Menu ⋮ kartu: Share, Edit, Export, Duplicate, Archive, Delete | Menu baris: ubah nama, pindah ke folder, kirim ke proyek, hapus (terverifikasi di kode: `rename`, `move`, `sendToProject`, `delete`) | SEBAGIAN | Tidak ada Duplicate, Archive, atau Export di daftar |
| 2.7 | "Create" dengan dialog "Create Project": judul ("e.g. The Hobbit") dan "Type (optional)": Novel, Short story, Non-fiction, Memoir, Novella, Poetry, Article, Script, General, Course | Tombol buat dokumen; tanpa jenis | SEBAGIAN | Tidak ada jenis dokumen; folder sebagai pengganti pengelompokan |
| 2.8 | "Import": dialog "Import document" (.docx, .odt, .rtf maks 50 MB, "Import from Scrivener", tujuan New project atau Existing project) | Tidak ada | TIDAK ADA | Tidak ada di PRD dan Catatan Slicing menandai Scrivener "sengaja dilewati" |
| 2.9 | Keadaan kosong "Start your next project" | Keadaan kosong daftar dokumen | ADA | |
| 2.10 | Folder | Folder (buat, ubah nama, pindah) | ADA | Novlr punya "Collection" di level proyek |
| 2.11 | Pembatasan jumlah (Free: 5 proyek) | Tidak ada pembatasan | TIDAK ADA (sengaja) | Model bisnis berbeda |

### 2B. Halaman satu proyek (Overview, Planning, Manuscript, Notebook)

| # | Fitur Novlr | Padanan RanahMenulis | Status | Gap dan catatan |
| --- | --- | --- | --- | --- |
| 2.12 | **Overview**: cover ("Add Cover"), "Project Title", jenis, "+ Collection", "+ Status", "Synopsis" ("+ Create a synopsis"), "Tags", "Details" (Word Count, Sections, Last Edited, Created) | Tidak ada halaman ringkasan dokumen | TIDAK ADA | Untuk proyek buku; manuskrip multi-bab ada di Fase 2 |
| 2.13 | "Recently Edited": bagian terakhir dengan cuplikan | Baris "Lanjutkan menulis" | SEBAGIAN | |
| 2.14 | "Project Goals": "Current Goal" dan "Completed Goals" | Tidak ada goal per dokumen | RENCANA (N13) | Perlu putusan client; keluhan pengguna Novlr: hanya satu goal |
| 2.15 | **Planning**: papan "Main Plot" dan "Secondary Plot", kartu per bagian, navigasi antar bagian | Tidak ada | TIDAK ADA | Tidak ada di PRD |
| 2.16 | **Manuscript**: panel "Sections" (daftar bagian, "Section options", tutup sidebar) | Satu dokumen per halaman; tidak ada hierarki bagian | PRD LANJUT (STD-06, Fase 2) | |
| 2.17 | **Notebook** per proyek: "Search N Notes...", "Filters", "Sort", "Create new note" | Tidak ada | RENCANA (N15) | Tidak ada di PRD, ukuran L |
| 2.18 | Menu ⋮ proyek: Share, Export project, Duplicate Project, Writing Preferences, Delete Project | Menu ⋯ Editor: Bagikan, Kirim ke proyek, Pindah ke sampah | SEBAGIAN | Ekspor masih nonaktif; Duplicate dan Writing Preferences tidak ada |
| 2.19 | **Writing Preferences** per proyek: Font family, Font size, Line spacing, Indent paragraphs, Space between paragraphs, Writing language | Tidak ada | TIDAK ADA | Editor RanahMenulis memakai satu gaya tetap (Merriweather) |

### 2C. Editor (isi manuskrip)

| # | Fitur Novlr | Padanan RanahMenulis | Status | Gap dan catatan |
| --- | --- | --- | --- | --- |
| 2.20 | Teks dengan judul bagian di atas, tampilan polos | Editor Tiptap, layar penuh `/studio/[id]` | ADA | |
| 2.21 | Bilah format saat teks dipilih: Bold, Italic, Underline, Blockquote, penghitung kata pilihan ("3 words"), menu ⋯ | Bilah format permanen: Tebal, Miring, Judul, Kutipan, Daftar berpoin, Daftar bernomor | SEBAGIAN | Tidak ada Underline, Strikethrough, rata teks; Novlr tidak punya Judul sebagai tombol |
| 2.22 | Menu ⋯: rata kiri/tengah/kanan/penuh | Tidak ada | TIDAK ADA | STD-01 membatasi format |
| 2.23 | Menu ⋯: "Bullet list", "Numbered list" | Daftar berpoin dan bernomor | ADA | |
| 2.24 | Menu ⋯: "Split chapter" (potong bagian) | Tidak ada | PRD LANJUT (STD-06) | |
| 2.25 | Menu ⋯: "Thesaurus" (nonaktif di Free) | Kit inspirasi "Kamus diksi" (padanan kata) di Laci bantuan | SEBAGIAN | Kamus RanahMenulis adalah daftar statis di panel, tidak terhubung ke kata terpilih |
| 2.26 | Menu ⋯: "Comment" (komentar inline) | Tidak ada | TIDAK ADA | Komentar RanahMenulis hanya di postingan Community |
| 2.27 | Menu ⋯: "Share snippet": gambar kutipan (Square, Portrait, Landscape; Serif atau Sans Serif; sembilan tema warna; kredit "written in Novlr"; Download) | Dialog Bagikan mengirim teks terpilih ke postingan Community | SEBAGIAN | Gambar kutipan = N9, kartu tulisan yang dapat dibagikan = COM-11 (Fase 2) |
| 2.28 | Indikator tersimpan (centang hijau di bilah atas proyek) | Indikator simpan, penanganan offline, dialog konflik dua tab | ADA | RanahMenulis lebih rinci |
| 2.29 | Widget bawah: **target** ("Build a habit", "Set a goal for this project") | Indikator target harian di editor | SEBAGIAN | Tidak ada jalan membuat habit atau goal dari editor |
| 2.30 | Widget bawah: **statistik** (Section Word Count, Project Word Count, Words Written Today; tiap angka bisa dipin) | Tombol "N kata" membuka popover Kata, Karakter, Paragraf, Waktu baca (juga pilihan) | SEBAGIAN | RanahMenulis menambah karakter, paragraf, waktu baca; tidak ada pin dan tidak ada hitungan proyek (karena tidak ada proyek multi-bagian) |
| 2.31 | Widget bawah: **timer sprint** (Time +mins, Words +words, Pace 0wpm, pin, play) | Tidak ada | RENCANA (N5) | |
| 2.32 | Widget bawah: **tata bahasa** ("Ready to check grammar", "Run Check") | Tidak ada | DILEWATI | Sengaja tidak dibangun |
| 2.33 | Mode layar penuh (ikon di bilah atas, F11) dan keluar dengan Esc | Mode fokus dengan HUD, bilah format tersembunyi | ADA | Verifikasi: kode `focus-hud.tsx` dan `editor-bar.tsx` ada |
| 2.34 | Mode tulis: Typewriter atau Word Processor, posisi typewriter High/Middle/Low | Tidak ada | RENCANA (N8) | |
| 2.35 | Tipografi otomatis: `--` jadi em-dash, `...` jadi elipsis, `->` jadi panah, pintasan ©, ™, pecahan | Tidak ada | RENCANA (N8) | |
| 2.36 | Kutip melengkung (opsi) | Tidak ada | RENCANA (N8) | |
| 2.37 | Fitur ramah disleksia (kotak centang) | Tidak ada | TIDAK ADA | |
| 2.38 | Proofreader per manuskrip dengan bahasa (English (British)) dan "Saved words" | Tidak ada | DILEWATI | Teks Indonesia belum ada pemeriksa |
| 2.39 | Pintasan keyboard (daftar: Ctrl+K cari, Ctrl+M menu, Ctrl+\ sidebar, format, tipografi) | Pintasan bawaan Tiptap; tidak ada daftar | RENCANA (N10) | |
| 2.40 | Ukuran font bawaan (16pt) per akun | Tidak ada | RENCANA (N8) | |
| 2.41 | (tidak ada di Novlr) Kit inspirasi dan perpustakaan prompt di Laci bantuan | Laci bantuan: Ide cerita, Kalimat pembuka, Kamus diksi, Pertanyaan refleksi, Ide judul, Kalimat penutup, plus lima prompt (STD-11; terverifikasi di kode) | ADA | Kelebihan RanahMenulis. Teks isi masih placeholder [konfirmasi] |

### 2D. Panel samping editor

| # | Fitur Novlr | Padanan RanahMenulis | Status | Gap dan catatan |
| --- | --- | --- | --- | --- |
| 2.42 | **Notes**: "Take Note", "Create Note" (profil tokoh, world building, riset) | Tidak ada | RENCANA (N15) | |
| 2.43 | **Comments**: "No comments yet", komentar inline, setelan "Every comment" | Tidak ada | TIDAK ADA | |
| 2.44 | **Versions**: "Current Version", daftar versi per jam dengan kata, pin per versi, "Showing last 3 days. Go unlimited with Studio." | Tidak ada panel; `DocumentStore.history` ada | RENCANA (N6) | Cek dulu apakah history menyimpan isi atau hanya jumlah kata |
| 2.45 | Pencarian global "Find Anything" (Ctrl+K): Project, Section, Collection, Note; filter tag, status, koleksi | Ikon pencarian di bilah atas nonaktif ("searchSoon"); terverifikasi di kode | RENCANA (N7) | |

### 2E. Berbagi dan ekspor

| # | Fitur Novlr | Padanan RanahMenulis | Status | Gap dan catatan |
| --- | --- | --- | --- | --- |
| 2.46 | **Share** > People (Beta): undang lewat email dengan peran Co-author, Editor, Beta Reader | Tidak ada kolaborasi naskah; peran Editor dan Mentor hanya di Projects (6g belum) | TIDAK ADA untuk naskah | Peran RanahMenulis ditugaskan Organizer, bukan penulis |
| 2.47 | **Reading link**: tautan baca publik, "Include cover image and synopsis", "Include author credit", "Let readers share your link", "Edit sections", "Stop sharing" | Bagikan ke Community: Publik, Pribadi, atau Grup; teks yang dipilih saja yang menjadi publik; maksimal 500 kata | SEBAGIAN | Model berbeda: RanahMenulis menerbitkan cuplikan ke feed; Novlr memberi tautan baca ke seluruh bagian terpilih |
| 2.48 | **Export**: format .docx (bawaan), .pdf, .ODT, .rtf, .MD, .epub; judul sebagai halaman depan; catatan; nomor halaman; Single/1.5/Double; Author name (Yes/No/Pen name); simbol © | Menu Ekspor nonaktif | RENCANA (N3): TXT dan PDF; DOCX Fase 2 (STD-08) | Opsi halaman depan, nomor halaman, jarak baris sudah ada di rencana N3 |
| 2.49 | Pencadangan otomatis Google Drive dan Dropbox (Studio) | Tidak ada | DILEWATI | |
| 2.50 | Pemulihan cadangan lokal ("Recover local backup") dan diagnostik sinkron | Penyimpanan lokal IndexedDB dan dialog konflik | SEBAGIAN | |
| 2.51 | (tidak ada di Novlr) Kirim ke Projects sebagai versi submission beku | Kirim ke proyek (STD-09), versi beku dengan hash | ADA | Kelebihan RanahMenulis |

### 2F. Habits & Goals dan Streak

| # | Fitur Novlr | Padanan RanahMenulis | Status | Gap dan catatan |
| --- | --- | --- | --- | --- |
| 2.52 | "Habit Streak" dengan penjelasan "Research shows that writers who set a specific daily or weekly target produce more..." dan tombol "Create a habit" | Tab Streak | ADA | |
| 2.53 | Dialog "Create Writing Habit": "How many words?" 250, 500, 1,000, 2,000, 5,000, Custom ("Custom Amount") | Pengaturan target (nilai bebas) | SEBAGIAN | Preset dan Custom = N4 |
| 2.54 | "How often?" Daily atau Weekly | Hanya harian | RENCANA (N12) | Perlu putusan client dan aturan putus (Q-08) |
| 2.55 | Pratinjau kalimat "Your habit: Write 250 words daily" | Tidak ada | RENCANA (N4) | |
| 2.56 | Ikon gir pengaturan di kartu habit | Pengaturan target di Streak | ADA | |
| 2.57 | "PREVIOUS STREAKS": streak 2+ hari tersimpan saat target diganti | Riwayat streak tidak terlihat | TIDAK ADA | Streak RanahMenulis memakai target; perubahan berlaku besok |
| 2.58 | Contoh streak mingguan: "6 week streak", bilah "1,240 / 1,000 words this week", "Target hit! Your streak continues", "Longest: 14 weeks" | Streak harian, streak terpanjang, kalender, milestone | SEBAGIAN | Milestone adalah kelebihan RanahMenulis |
| 2.59 | **Goals** (proyek): "Finish the first draft" 42,300 / 80,000 "Due in 1 month", persen, tenggat; boleh banyak | Tidak ada | RENCANA (N13) | Terkunci di Free pada Novlr |
| 2.60 | "COMPLETED GOALS" ("Your achievements will appear here") | Milestone di Streak | SEBAGIAN | |
| 2.61 | Zona waktu pengguna menentukan hari | Zona waktu di profil, peringatan streak | ADA | Aturan putus streak Novlr tidak terlihat |
| 2.62 | "Success Nudges" notifikasi penyemangat | Tidak ada | TIDAK ADA | |

### 2G. Analytics dan Statistik

| # | Fitur Novlr | Padanan RanahMenulis | Status | Gap dan catatan |
| --- | --- | --- | --- | --- |
| 2.63 | Empat angka: kata hari ini, 7, 30, 365 hari, tiap angka dengan "vs prev period" | Statistik: total, rata-rata, hari terbaik, hari memenuhi target (30 hari/12 minggu/12 bulan) | SEBAGIAN | Perbandingan dengan periode sebelumnya belum ada |
| 2.64 | Grafik "WORDS WRITTEN" 30 hari | Grafik batang Harian/Mingguan/Bulanan | ADA | Dengan garis target di Harian |
| 2.65 | "PACE" ("992 /day", "208 days to write Moby Dick") | Tidak ada | RENCANA (N14) | |
| 2.66 | "AVERAGE WORDS REMOVED" | Tidak ada | RENCANA (N14) | Butuh pencatatan penghapusan |
| 2.67 | "WRITING ACTIVITY": heatmap 6 bulan, "107 writing days in the last 6 months" | Kalender aktivitas | SEBAGIAN | |
| 2.68 | "PRODUCTIVITY TREND" ("You are on fire...") | Tidak ada | RENCANA (N14) | |
| 2.69 | "FAVOURITE WRITING TIME" dan "FAVOURITE WRITING DAY" | Tidak ada | RENCANA (N14) | |
| 2.70 | "WORD COUNTS": total kata semua proyek, grafik, "WORD COUNT CHANGE" minggu/bulan/tahun, "AVERAGE SECTION LENGTH" | Tidak ada total lintas dokumen | TIDAK ADA | |
| 2.71 | Selektor "Word count scope" | Tidak ada | TIDAK ADA | |
| 2.72 | Definisi dua metrik: "Words Written" (kata ditambah) vs "Word Count" (ukuran naskah) | Satu sumber hitungan kata (`docStats`) | SEBAGIAN | Pemisahan istilah belum dirumuskan |
| 2.73 | Pembatasan: analitik mendalam hanya Starter ke atas | Tidak ada pembatasan | TIDAK ADA (sengaja) | |

### 2H. Note Library

| # | Fitur Novlr | Padanan RanahMenulis | Status | Gap dan catatan |
| --- | --- | --- | --- | --- |
| 2.74 | Note Library lintas proyek: Create, tab Active dan Archive, pencarian, Filters, "0 notes", "Create your first note..." | Tidak ada | RENCANA (N15) | Tidak ada di PRD |

---

## 3. Project (Projects) dan padanan di Novlr

Novlr tidak punya program penerbitan. Yang bisa dipadankan hanya Academy dan, secara longgar, Sites.

| # | Fitur Novlr | Padanan RanahMenulis | Status | Gap dan catatan |
| --- | --- | --- | --- | --- |
| 3.1 | Academy: pengantar, "Featured Course", "All Courses" | Katalog Projects, kategori Kelas Menulis | ADA | |
| 3.2 | Kartu kursus: lencana Free/Starter, pengajar, "N lessons" dan "N video/audio", deskripsi, tombol "Enroll" atau "Upgrade to Enroll", "Overview" | Kartu proyek dengan biaya, kuota, status | ADA | Akses berdasarkan paket vs berdasarkan bayar per proyek |
| 3.3 | Halaman kursus: "What You'll Learn", "How It Works", "Course Curriculum" (daftar pelajaran), "About the Instructor", "Course Details" (Lessons, Author, Level) | Detail proyek Kelas: tentang, syarat, kurikulum, pengajar, jadwal, hak cipta | ADA | |
| 3.4 | "Enroll in This Course" langsung (toast "Enrolled successfully!") dan "Un-enroll" kapan saja | Daftar lewat halaman dengan ketentuan dan persetujuan hak cipta; tanpa pembatalan | SEBAGIAN | Batal daftar belum diputuskan (refund, BR-PRJ-11) |
| 3.5 | "Courses in progress" di atas daftar: "Lesson 2 of 12", bilah progres, "Resume", "Un-enroll" | "Proyek saya" dan dasbor kelas dengan progres | ADA | |
| 3.6 | **Course Player** mengambang (geser, ubah ukuran, minimalkan dan lanjut), daftar pelajaran dapat dilipat, "Mark complete", progres per pelajaran | Dasbor kelas: materi ditandai selesai, jadwal pertemuan, tautan rekaman | SEBAGIAN | Kelas RanahMenulis hidup (jadwal dan mentor); Novlr rekaman mandiri. Pemutar mengambang DILEWATI |
| 3.7 | "Writing exercise" dengan tombol "Copy exercise" (latihan di editor sendiri) | Tugas dengan pengumpulan dari dokumen Studio atau teks | ADA | RanahMenulis lebih lengkap |
| 3.8 | (tidak ada di Novlr) tugas, feedback mentor, status Perlu perbaikan, tugas terlambat | Dasbor kelas, tugas, panel mentor (dev) | ADA | Kelebihan RanahMenulis |
| 3.9 | Sertifikat kelas | Tidak ada di Novlr yang terlihat; PRD KLS-04 | PRD LANJUT (Fase 2) | |
| 3.10 | Testimoni "What Writers Are Saying" | Tidak ada | TIDAK ADA | |
| 3.11 | "Sites": situs penulis dan "Upgrade to publish" | Solo (penerbitan paket) | TIDAK ADA padanan langsung | Berbeda total; Sites DILEWATI |
| 3.12 | (tidak ada di Novlr) Antologi: seleksi, feedback editor, revisi | 6f-3, 6f-4 dibangun; panel editor 6g belum | ADA / RENCANA | |
| 3.13 | (tidak ada di Novlr) Lomba: kriteria, juri anonim, hasil | 6f-5c halaman hasil dibangun; panel juri 6g belum | ADA / RENCANA | |
| 3.14 | (tidak ada di Novlr) Solo dasbor | 6f-5b | RENCANA | |
| 3.15 | (tidak ada di Novlr) Pembayaran QRIS | 6f-6 | RENCANA | |

---

## 4. Community dan padanan di Novlr

### 4A. Community (halaman utama Novlr)

| # | Fitur Novlr | Padanan RanahMenulis | Status | Gap dan catatan |
| --- | --- | --- | --- | --- |
| 4.1 | "JOIN OUR DISCORD" dengan "286 online", "Get involved", "Popular channels" (Writing Sprints, Writing resources and advice, Ask for feedback) | Tidak ada | TIDAK ADA | Novlr mengalihdayakan komunitas ke Discord |
| 4.2 | "UPCOMING WRITING SPRINTS" dengan tombol "Add" | Tidak ada | TIDAK ADA | |
| 4.3 | "TOP 3 PLAYLISTS", "FOLLOW US" (Instagram, Facebook, Discord, Tumblr, Threads, Spotify, Bluesky, Twitter) | Ikon media sosial di footer landing nonaktif | SEBAGIAN | |
| 4.4 | (tidak ada di Novlr) feed, apresiasi, komentar, bookmark, follow, profil, Discover | Jelajahi, postingan, komentar satu tingkat, Tersimpan, Ikuti, profil publik | ADA | Kelebihan RanahMenulis. Novlr tidak punya semuanya |

### 4B. Events

| # | Fitur Novlr | Padanan RanahMenulis | Status | Gap dan catatan |
| --- | --- | --- | --- | --- |
| 4.5 | Halaman Events: "Write alongside other Novlr writers." Daftar kartu: "ON NOW", judul, deskripsi, tanggal, status "Open"; tanpa kalender | Tidak ada | RENCANA (N17, model Event umum) | Hanya satu acara di Novlr |
| 4.6 | Entri sidebar acara berjalan yang bisa disembunyikan ("Hide Draftsgiving from the sidebar") | Tidak ada | RENCANA | |

### 4C. Draftsgiving (acara)

| # | Fitur Novlr | Padanan RanahMenulis | Status | Gap dan catatan |
| --- | --- | --- | --- | --- |
| 4.7 | Header: "November 1–30 · Day 16 of 30", "Ends Nov 30 at 11:59 PM your time" | Tidak ada | RENCANA (N17) | |
| 4.8 | Tiga tingkat target: Small Plate 10.000, A Generous Portion 25.000, All the Trimmings 50.000 ("The classic"), tiap tingkat "About N words a day" | Tidak ada | RENCANA (N17) | |
| 4.9 | Dialog bergabung: pilih tingkat, pilih proyek (atau "Start a Draftsgiving project", "Import a project"), username publik; "Only words you add... from today will count" | Tidak ada | RENCANA (N17) | |
| 4.10 | Dasbor pribadi: "MY PROJECT 0 / 10,000 words", penanda kecepatan, "TODAY 0 of 667 words", "Get writing", target harian dihitung ulang dari sisa | Tidak ada | RENCANA (N17) | |
| 4.11 | "Days left", "Best day", grafik "Your November so far" (kata vs Pace) | Tidak ada | RENCANA (N17) | |
| 4.12 | "Share progress": gambar progres (Square 1080, Story), opsi tampil target, progres, avatar, username; "Copy text", "Download image" | Tidak ada | RENCANA (N17), terkait COM-11 | |
| 4.13 | "EVERYONE AT DRAFTSGIVING": total kata dan jumlah penulis global | Tidak ada | RENCANA (N17) | |
| 4.14 | "Who's writing": avatar peserta per tingkat dengan "+N" dan "See everyone going for..." | Tidak ada | RENCANA (N17) | Nama pengguna peserta terlihat publik |
| 4.15 | "YOUR GOAL'S TABLE": meja resmi per tingkat ("Official"), jumlah penulis, kata total, "% of the goal, on average", "Take a seat" (opt-in terpisah dari bergabung) | Tidak ada | RENCANA (N17) dan 6g (Grup) | |
| 4.16 | "Write with friends": "Start one" dan "Join one" (kode) | Tidak ada | RENCANA | |
| 4.17 | "All public Draftsgiving groups" (tabel Group, Words, Writers, "Show more") | Tidak ada | RENCANA | |
| 4.18 | Spanduk "Hold yourself accountable." dengan "Share" | Tidak ada | RENCANA | |
| 4.19 | Toast "You're in. Save room for words." | Tidak ada | RENCANA | |

### 4D. Writing Groups

| # | Fitur Novlr | Padanan RanahMenulis | Status | Gap dan catatan |
| --- | --- | --- | --- | --- |
| 4.20 | Halaman "Writing Groups": "Create your community and write together.", "Join one", "Start one" | Grup Penulis diatur Administrator (PRD bagian 15.4); tidak ada UI | RENCANA (6g, R6) | PRD: grup dibuat Administrator, bukan pengguna; berbeda dari Novlr |
| 4.21 | "Your groups": "You're not in a group yet." | Tidak ada | RENCANA (6g) | |
| 4.22 | "All public groups (56)": tabel GROUP, EVENT, WORDS, WRITERS, lencana "Official" dan "Public" | Tidak ada | RENCANA (6g) | |
| 4.23 | Dialog "Start a group": nama (maks 40), acara, Public atau Private, catatan "Members can see all usernames, project titles, and progress." | Tidak ada; pilihan "Grup" di Tulis postingan memakai satu grup dummy | RENCANA (6g); Q-38 | Peringatan privasi layak diambil (sudah dicatat di Catatan Slicing) |
| 4.24 | Dialog "Join a group": pencarian, "No groups to join yet.", "Have a code? Enter it" | Tidak ada | RENCANA (6g) | |
| 4.25 | Grup terikat acara (hanya Draftsgiving) | PRD: grup bukan terikat acara | BERBEDA | Putuskan hubungan Grup dan Event |

### 4E. Resources

| # | Fitur Novlr | Padanan RanahMenulis | Status | Gap dan catatan |
| --- | --- | --- | --- | --- |
| 4.26 | "Resources": Writer Discounts, Writing Tips, Publishing Advice, The Reading Room (tautan keluar) | Tidak ada | TIDAK ADA | Konten editorial; bukan MVP |
| 4.27 | "Helpdesk" dan "Co-ownership" | Tidak ada | TIDAK ADA | |

---

## 5. Marketplace

| # | Fitur Novlr | Padanan RanahMenulis | Status | Gap dan catatan |
| --- | --- | --- | --- | --- |
| 5.1 | Tidak ada marketplace jual-beli. Paling dekat: "Writer Discounts" (diskon mitra), "Sites" (situs penulis), dan paket Lifetime ($499) | Marketplace: label "Menyusul", Fase 3 (Q-39); pemesanan buku PRJ-05 Fase 3 | PRD LANJUT | Tidak ada acuan Novlr; acuan lain (Reedsy, Medium) tidak dicatat di sini |

---

## 6. Platform: akun, notifikasi, pencarian, paket

| # | Fitur Novlr | Padanan RanahMenulis | Status | Gap dan catatan |
| --- | --- | --- | --- | --- |
| 6.1 | Menu avatar: nama, "Account settings", Account, Preferences, Support, Log out | Avatar menuju Pengaturan; Keluar | ADA | |
| 6.2 | Account > **Preferences**: tema Light, Dark, System, Evening, Parchment, Airy (tiga terakhir STUDIO) | Tema terang dan gelap; tanpa "sistem" di UI | SEBAGIAN | Tiga tema premium tidak ada |
| 6.3 | Preferences > "Editor behaviour": font size, curly quotes, Writing mode, Typewriter position, Proofreader | Tidak ada | RENCANA (N8) | |
| 6.4 | Preferences > "Commenting" (sembunyikan komentar inline) | Tidak ada | TIDAK ADA | |
| 6.5 | Preferences > "Keyboard shortcuts" (tabel) | Tidak ada | RENCANA (N10) | |
| 6.6 | **Backups**: Google Drive, Dropbox, Local Export | Tidak ada | DILEWATI | |
| 6.7 | **My Account**: foto, nama, username ("No username yet"), email terverifikasi, "Member since", Language, Security (Change Password), Danger Zone (Delete Account, data dihapus dalam 30 hari) | Pengaturan: foto, nama, username, bio, negara, zona waktu, genre, bahasa, privasi, keamanan, zona bahaya (hapus akun dengan kata konfirmasi) | ADA | RanahMenulis lebih kaya (bio, negara, zona waktu, genre) |
| 6.8 | **Subscription**: Free, Starter ($8), Studio ($16), Lifetime ($499); isi tiap paket | Tidak ada langganan; monetisasi lewat biaya proyek | PRD LANJUT (Premium Fase 3, Q-02) | |
| 6.9 | **Notifications**: "Success Nudges", email Novlr news, Weekly writing progress emails, Ask Novlr Newsletter, "Comments", "Feedback notes" | Pengaturan: Notifikasi email; belum ada preferensi rinci | RENCANA (N11) | |
| 6.10 | **Invite friends**: tautan dan kode rujukan, undang lewat email, penghitung Invited/Joined/Subscribed, hadiah sebulan Studio | Tidak ada | DILEWATI | |
| 6.11 | **Support**: chat, email, Discord, "Run sync diagnostic", "Debug data", "Recover local backup" | Tidak ada | TIDAK ADA | |
| 6.12 | Bahasa antarmuka (English) | Indonesia dan Inggris (landing, akun, app-shell); Studio, Community, Beranda belum | SEBAGIAN | |
| 6.13 | Bilah atas: pencarian, layar penuh, avatar; chat dukungan bulat di pojok | Bilah atas: pencarian (nonaktif), "Tulis", lonceng, avatar | SEBAGIAN | |
| 6.14 | Kartu paket di sidebar dengan kalimat yang berganti per halaman ("For cloud backup, upgrade") | Tidak ada | DILEWATI | Model bisnis berbeda |
| 6.15 | Data contoh buram di balik "Upgrade" (Analytics, Goals) | Tidak ada | DILEWATI | |
| 6.16 | (tidak ada di Novlr) pusat notifikasi dengan tab Semua, Komentar, Proyek | Notifikasi, lonceng dengan hitungan | ADA | Kelebihan RanahMenulis |
| 6.17 | (tidak ada di Novlr) alur masuk, daftar, verifikasi, lupa sandi, onboarding | `(auth)` rute | ADA (tanpa backend) | |

---

## 7. Fitur RanahMenulis yang tidak punya padanan di Novlr

Dicatat agar gap dua arah terlihat.

| # | Fitur RanahMenulis | Menu | Status |
| --- | --- | --- | --- |
| 7.1 | Feed Community, Jelajahi dengan kategori | Community | ADA |
| 7.2 | Postingan prolog atau cuplikan, apresiasi, komentar berbalas, bookmark, follow | Community | ADA |
| 7.3 | Profil publik dan portofolio | Community | ADA |
| 7.4 | Tulis postingan dari bagian dokumen yang dipilih, visibilitas Publik, Pribadi, Grup | Studio dan Community | ADA |
| 7.5 | Katalog proyek (Antologi, Solo, Kelas, Lomba), pendaftaran dengan persetujuan hak cipta | Projects | ADA |
| 7.6 | Kirim karya, versi beku, status submission, revisi, tarik | Projects | ADA |
| 7.7 | Hasil Lomba (finalis anonim, pemenang, notifikasi) | Projects | ADA |
| 7.8 | Dasbor kelas, tugas, feedback mentor | Projects | ADA |
| 7.9 | Pembayaran QRIS | Projects | RENCANA |
| 7.10 | Panel Organizer, Editor, Juri, Admin | Kelola | RENCANA (6g) |
| 7.11 | Kit inspirasi dan prompt | Studio | ADA |
| 7.12 | Milestone Streak, penghitung dengan waktu baca | Studio | ADA |
| 7.13 | Notifikasi lintas modul | Platform | ADA |

---

## 8. Ringkasan hitungan

Dihitung dari tabel di atas: 152 baris bernomor di bagian 1 sampai 6, dengan 12 baris di antaranya adalah fitur RanahMenulis yang **tidak** ada di Novlr (ditandai "tidak ada di Novlr"). Sisanya, **140 fitur Novlr**, dipetakan seperti ini (butir berstatus ganda seperti "ADA / RENCANA" dihitung menurut kata pertama):

| Status di RanahMenulis | Jumlah | Porsi dari 140 |
| --- | --- | --- |
| ADA | 21 | 15% |
| SEBAGIAN | 30 | 21% |
| RENCANA (N1..N17, 6g) | 46 | 33% |
| PRD LANJUT (Fase 2 atau 3) | 5 | 4% |
| TIDAK ADA di PRD maupun rencana | 30 | 21% |
| DILEWATI (sengaja) | 7 | 5% |
| BERBEDA (konsep tidak sejalan) | 1 | 1% |

Cara membaca:
- Angka bukan nilai kualitas. Satu baris bisa berupa fitur besar (Draftsgiving) atau sangat kecil (kutipan Writer's Wisdom).
- Porsi RENCANA besar karena **Draftsgiving dan Grup** (baris 4.7 sampai 4.24) menyumbang sekitar 18 baris yang semuanya bergantung pada satu keputusan: model Event umum dan hubungannya dengan Grup (Q-38).
- **Kelompok TIDAK ADA** terbesar: struktur proyek buku (Overview, Planning, Notebook, Collection, Status, Writing Preferences, impor), pencarian dan penyaringan daftar dokumen, komentar inline, dan konten editorial (Reading Room, Writer's Wisdom, Resources, Spotify).
- Gap yang bukan terhadap Novlr tetapi terhadap PRD sendiri: **pencarian dan pengurutan dokumen (STD-03)** belum terlihat di kode, dan **ekspor (STD-07)** masih nonaktif, padahal keduanya MVP.
- Arah sebaliknya: 12 fitur RanahMenulis tidak ada padanan di Novlr, ditambah seluruh Community (feed, profil, komentar, follow) dan semua program Projects.

## 9. Batasan dokumen ini

- Sisi Novlr: akun Free. Isi yang terkunci (Goals nyata, analitik mendalam, tema Studio, Sites) hanya terlihat sebagai teks promosi atau data contoh. Menu yang belum dibuka tercatat di bagian D laporan `novlr-isi-dalam-aplikasi.md`.
- Sisi RanahMenulis: status berasal dari `CLAUDE.md` dan `Catatan Slicing.md`, ditambah pemeriksaan kode untuk Studio (pencarian, ubah nama, pindah, hapus, kit inspirasi, mode fokus). Status layar lain belum diaudit di kode.
- Pemetaan "mirip" adalah penilaian saya; beberapa butir bisa dipindah antar-menu bila struktur navigasi RanahMenulis berubah.
