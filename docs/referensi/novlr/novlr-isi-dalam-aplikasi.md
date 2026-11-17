# Novlr, isi di dalam aplikasi

Tanggal riset: 16 November 2026. Sumber: akun paket **Novlr Free** yang sudah login di `studio.novlr.org`, dibuka lewat browser bawaan aplikasi. Untuk acuan desain produk RanahMenulis; melengkapi `novlr-referensi-desain-produk.md` (riset publik).

## Cara membaca dan batasan

- **DILIHAT** = teks atau elemen yang tampil di layar akun ini. Label dalam tanda kutip adalah teks persis di UI.
- **DUGAAN** = kesimpulan dari petunjuk, belum terlihat langsung.
- Tidak ada aksi yang mengubah data. Dialog Create, Import, Start a group, dan Create Writing Habit dibuka hanya untuk dilihat lalu dibatalkan. Tidak ada proyek uji yang dibuat, tidak ada yang digabung, dikirim, dibeli, atau dihapus. Tombol "Join Draftsgiving", "Enroll", "Upgrade", dan "Add" (sprint) tidak ditekan.
- Panel browser berukuran sempit (sekitar 736 px), sehingga sidebar tersembunyi. Navigasi lengkap baru terlihat setelah viewport dilebarkan ke 1280 px. Tampilan mungkin berbeda dari desktop penuh.
- Akun hanya punya satu proyek dan 3 kata, jadi banyak layar dalam keadaan kosong atau menampilkan **data contoh** berlabel "Sample data" / "This is sample data, not your own writing."
- Nama pengguna lain di Draftsgiving tidak disalin ke laporan.

## 1. Desk (beranda)

### Terlihat langsung

Urutan dari atas ke bawah (urutan ini dari struktur halaman; di desktop kartu tersusun dua sampai tiga kolom):

1. Sapaan: "Welcome to Novlr, [nama]!"
2. Baris penyemangat: "Your characters are wondering where you've been."
3. Ringkasan mingguan: "You've written 3 words over the last 7 days. That's 100% more than the week before." Ringkasan ini membandingkan 7 hari terakhir dengan 7 hari sebelumnya, dan menampilkan panah tren.
4. Kartu onboarding bertumpuk, label "ONBOARDING", judul "Import your work", isi "Bring your draft in from DOCX, ODT, RTF, or Scrivener and keep writing without starting from scratch." Tombol "Import now" dan tombol tutup ("Dismiss Import your work"). Kartu bertumpuk, jadi ada lebih dari satu langkah onboarding (hanya satu yang terbaca).
5. Tombol ikon "Organise your desk" (ikon kisi).
6. Kartu **Projects**: judul "Projects", tombol "Create" dan "Import", daftar proyek dengan keterangan "Last edited today", tautan "All projects →".
7. Kartu **Draftsgiving** (kartu promosi acara): gambar, "1–30 November", "Thirty days, one goal, and a table full of writers. It's on now. Words count from the day you join.", deretan avatar, "1,613 writers already in", tombol "Join Draftsgiving".
8. Kartu **Reading Room**: "Expert writing advice, writing and publishing tips, book reviews, and your questions answered." Tiga artikel (judul dan tanggal), tautan "Go to The Reading Room". Artikel membuka situs novlr.org.
9. Kartu **Habit Streak**: "Set a daily or weekly writing target to build consistency. Track your progress." Tombol "Set your target".
10. Kartu **Productivity**: heatmap kalender dengan label bulan (Aug, Sep, Oct, Nov), tiap sel punya label tooltip seperti "Nov 16, 2026: 3 words", legenda "Less" ke "More", ringkasan "1 writing days in the last 12 weeks", tautan "Detailed analytics". Rentang 12 minggu.
11. Kartu **Word Count**: "across all projects", "Words added across all projects:" dengan tiga angka "this week", "this month", "this year".
12. Kartu **Novlr Academy**: "Unlock your writing potential with expert-led courses", tiga kursus, tautan "All courses".
13. Kartu **Words Written**: grafik batang, selektor periode (tampil "7 days"), sumbu tanggal, tulisan "Total Written" dan "Daily Average".
14. Kartu **Upcoming Writing Sprints** dengan label "Discord": "Join us every Monday, Tuesday, and Thursday in the Novlr Discord!", dua jadwal ("Thursday Writing Sprints!" Thu Nov 19 · 5pm - 7pm; "Monday Writing Sprints!" Mon Nov 23 · 5pm - 6pm), tiap jadwal punya tombol "Add", dan tombol "Join a Writing Sprint".
15. Kartu **Writer's Wisdom**: kutipan penulis terkenal dengan atribusi.
16. Kartu **Spotify Playlist of the Week**: "Expertly curated playlists with distinct themes for a multitude of different headspaces writers need", tautan "See All 45 Playlists".

Pengaturan ulang kartu (DILIHAT setelah menekan tombol "Organise your desk"):
- Tombol berubah menjadi "Done editing".
- Banner: "Drag cards to reorder them, click the eye icon to show/hide cards. Set all to visible | reset to default layout". Jadi kartu **bisa diseret untuk diurutkan ulang dan bisa disembunyikan** lewat ikon mata, dengan dua pintasan "Set all to visible" dan "reset to default layout". Seretan sendiri tidak dicoba. Halaman juga memuat petunjuk aksesibilitas dnd ("To pick up a draggable item, press the space bar...").

Tombol "Resume Writing" ada di sidebar, bukan di Desk: kartu kecil berisi "Resume Writing" dan "aads - fs" (judul bagian terakhir dan nama proyek). Tautannya menuju manuskrip bagian yang terakhir dibuka.

### Interaksi

- "Set your target" membuka dialog "Create Writing Habit" (lihat bagian 2).
- "Resume Writing": DILIHAT hanya sebagai tautan ke `/project/<id>/manuscript/<id bagian>`. Artinya langsung ke editor di bagian terakhir. Tidak ditekan pada Desk, tetapi alamat itu dibuka dan terbukti menampilkan editor bagian tersebut.
- Sel heatmap adalah tombol dengan label kata per hari.

### Terkunci / berbayar

- Tidak ada kartu Desk yang terkunci. Kartu Habit Streak berlaku di Free (dialog target terbuka).

### Tidak bisa dipastikan

- Opsi lain pada selektor periode kartu Words Written (hanya "7 days" yang terlihat).
- Apakah seretan kartu tersimpan antar perangkat.
- Isi kartu onboarding berikutnya dalam tumpukan.

## 2. Habits & Goals

### Terlihat langsung

Halaman `/goals`, dibagi dua bagian berlabel kapital "HABITS" dan "GOALS".

**Bagian HABITS**
- Kartu "HABIT STREAK" dengan ikon gir (pengaturan) di sudut kanan atas. Keadaan kosong: ilustrasi potret, teks "Research shows that writers who set a specific daily or weekly target produce more, and have more ideas, than those who wait for inspiration.", tombol "Create a habit →".
- Kartu "PREVIOUS STREAKS": "No previous streaks" dan "When you change your habit target, streaks of 2+ days are saved here". Jadi streak yang tersimpan sebagai riwayat hanya yang 2 hari atau lebih, dan hanya saat target diubah.

**Dialog "Create Writing Habit"** (dibuka dari "Set your target", "Create a habit", dan ikon gir; ketiganya membuka dialog yang sama)
- "How many words?" dengan enam pilihan: 250 (terpilih bawaan), 500, 1,000, 2,000, 5,000, "Custom". Memilih "Custom" memunculkan isian "Custom Amount" (nilai awal 250).
- "How often?" dengan dua pilihan: "Daily" (bawaan) dan "Weekly".
- Pratinjau hidup: "Your habit: Write 250 words daily" (berubah menjadi "weekly" bila Weekly dipilih).
- Tombol "Close" dan "Create".
- Tidak ada isian waktu pengingat, hari aktif, zona waktu, atau notifikasi di dialog ini.

**Bagian GOALS** (berisi data contoh, berlabel "This is sample data, not your own writing.")
- Dua kartu contoh: "Finish the first draft" 53%, 42,300 / 80,000, "Due in 1 month"; "Write 500 words a day this month" 37%, 5,500 / 15,000, "Due in 2 weeks".
- Kartu promosi: "Writers with goals write more" / "Set a word count or a deadline for any project and watch the bar fill as you write." dengan tombol "Upgrade".
- "COMPLETED GOALS": "Your achievements will appear here as you complete goals".

### Interaksi

- Memilih jumlah kata dan frekuensi langsung memperbarui kalimat "Your habit:". "Create" tidak ditekan, dialog ditutup lewat "Close".
- Dari editor, panel bawah juga menawarkan "Build a habit" dan "Set a goal for this project" (bagian 7).

### Terkunci / berbayar

- Bagian Goals memakai data contoh dan bertuliskan "Upgrade". DUGAAN: Goals untuk proyek (jumlah kata atau tenggat) membutuhkan paket berbayar. Namun di Overview proyek, kotak "Set a goal for this project" tampil tanpa gembok di Free, jadi pembatasannya belum jelas.
- Sidebar menampilkan "For 30-day history, upgrade" pada halaman ini. Riwayat 30 hari tampaknya berbayar.

### Tidak bisa dipastikan

- Jenis target harian, bulanan, proyek, dan tenggat: yang terlihat hanya **harian dan mingguan** untuk Habit, serta "word count atau deadline" untuk Goal (hanya lewat teks promosi dan data contoh). Target bulanan sebagai jenis tersendiri tidak terlihat; hanya muncul sebagai teks contoh ("Write 500 words a day this month").
- Cara streak ditampilkan setelah habit dibuat dan apa yang memutusnya. Habit tidak dibuat. Satu-satunya tampilan streak adalah data contoh di Analytics (bagian 3).
- Aturan zona waktu untuk streak, pengingat, notifikasi, dan tampilan saat target tercapai (selain teks contoh "Target hit! Your streak continues").

## 3. Analytics

### Terlihat langsung

Halaman `/analytics`, tiga bagian.

**PRODUCTIVITY & HABITS**
- Empat angka bergaya KPI, tiap angka memiliki perbandingan "vs prev period": "WORDS WRITTEN TODAY", "WORDS WRITTEN IN THE LAST 7 DAYS", "...LAST 30 DAYS", "...LAST 365 DAYS". Di akun ini semuanya 3 dengan "100%". Ini data nyata (cocok dengan 3 kata yang ditulis).
- Blok bertanda "Sample data" (data contoh, buram, tertutup kartu promosi "See the whole picture of your writing" / "A grid of writing days lighting up your productivity; full history of words written; your writing pace; habit analysis and more..." dengan tombol "Upgrade"). Isinya:
  - "HABIT STREAK": angka besar "6" dengan satuan "week streak", bilah progres, "1,240 / 1,000 words this week", "Target hit! Your streak continues", "Longest: 14 weeks". Contoh ini memakai streak **mingguan**.
  - "WORDS WRITTEN" "Last 30 days": grafik batang per hari dengan sumbu Oct/Nov dan skala 0 sampai 1.2k. 
  - "PACE": "992 /day" dengan kalimat humor "At this pace it would take you 208 days to write Moby Dick."
  - "AVERAGE WORDS REMOVED": "84 /day" dengan "The edit is as important as getting the words out. Good riddance."
  - "WRITING ACTIVITY": heatmap Mon sampai Sun dengan kolom bulan May sampai Nov, tooltip "May 21, 2026: 991 words", ringkasan "107 writing days in the last 6 months".
  - "PRODUCTIVITY TREND": "INCREASED PRODUCTIVITY" / "You have written more over the last three weeks than in the previous three. You are on fire, keep up the great work!"
  - "FAVOURITE WRITING TIME": "in the evening"; "FAVOURITE WRITING DAY": "Saturday".

**WORD COUNTS**
- Daftar proyek nyata: nama, "3 words", "last edited 2 minutes ago".
- Blok data contoh: "TOTAL WORD COUNT" 124,380 "Across all projects" dengan grafik 0 sampai 140.0K; "WORD COUNT CHANGE" "THIS WEEK +4,860", "THIS MONTH +18,370", "THIS YEAR +71,920"; "AVERAGE SECTION LENGTH 2,140 words" dengan kalimat "Average adult fiction is around 2k-4k words per chapter" dan tautan "More average lengths across genres"; selektor "Word count scope"; promosi "Watch your words add up" / "Your word counts over any period of time with full history; what changed this week, month or year; section length analysis & page count estimator." dengan "Upgrade".

**Definisi di UI**
- "Words Written" = kata yang **ditambahkan** dalam periode (grafik per hari, "Total Written", "Daily Average"). Di Desk: "Words added across all projects".
- "Word Count" = **total kata** dalam proyek atau seluruh proyek, plus perubahannya (this week/month/year). Di editor: "Section Word Count", "Project Word Count", "Words Written Today".
- Ada metrik "Average Words Removed", jadi Novlr menghitung kata yang dihapus terpisah dari kata yang ditambah.

### Interaksi

- Selektor periode di grafik Words Written berada di Desk ("7 days") dan di Analytics. Klik pada selektor di Analytics mengenai lapisan promosi, bukan menu.
- Heatmap dan grafik memiliki tooltip per sel.

### Terkunci / berbayar

- Hampir semua analitik di luar empat angka teratas dan daftar proyek terkunci di balik "Upgrade" dengan data contoh buram.
- Sidebar: "For the full Academy, upgrade" tampil di halaman ini (petunjuk berputar, bukan terkait Analytics).

### Tidak bisa dipastikan

- Pilihan periode lain di selektor (7 hari, 30 hari, 365 hari, atau lainnya) karena blok terkunci dan Desk tidak dibuka menunya.
- Tampilan analitik berbayar yang sebenarnya (hanya data contoh).
- Apakah ada filter per proyek (hanya "Word count scope" terlihat sebagai nama kontrol).

## 4. Community

### Terlihat langsung

**Community** (`/community`)
- Kartu "JOIN OUR DISCORD" dengan indikator "286 online", teks "Joining the Novlr community is a great way to connect with like-minded people.", tombol "Get involved", daftar "Popular channels:" ("Writing Sprints", "Writing resources and advice", "Ask for feedback").
- "UPCOMING WRITING SPRINTS" (sama seperti di Desk, dua jadwal dengan tombol "Add" dan "Join a Writing Sprint").
- "TOP 3 PLAYLISTS" "Our top 3 playlists this week": tiga playlist, tautan "All Playlists".
- "FOLLOW US": Instagram, Facebook, Discord, Tumblr, Threads, Spotify, Bluesky, Twitter.
- Tidak ada umpan, forum, atau profil pengguna di dalam aplikasi.

**Events** (`/events`)
- Judul "Events", subjudul "Write alongside other Novlr writers."
- Hanya satu kartu: label "ON NOW", "Draftsgiving 2026", "Novlr's November writing challenge.", "1–30 November", status "Open".
- Tidak ada tampilan kalender, tidak ada daftar acara lain, tidak ada tombol gabung di kartu (kartu menuju halaman acara).

**Writing Groups** (`/groups`)
- Judul "Writing Groups", subjudul "Create your community and write together."
- Tombol "Join one" (kode undangan) dan "Start one".
- "Your groups": "You're not in a group yet."
- "All public groups (56)", tabel dengan kolom GROUP, EVENT, WORDS, WRITERS (Event berisi "Draftsgiving"). Tiap baris punya nama grup, label ("Official" atau "Public"), jumlah kata, deretan avatar.
- Dialog "Start a group": judul "Start a group", "Invite your friends to share a seat at your Draftsgiving table.", isian "Group name" (placeholder "Night Owls", batas 40 karakter, "0/40"), "Event" (daftar turun, nilai "Draftsgiving · November 1–30"), pilihan "Public" (bawaan) atau "Private", catatan "Members can see all usernames, project titles, and progress.", tombol "Cancel" dan "Start the group". Dibatalkan.
- Jadi Writing Groups **ada di dalam aplikasi**, tetapi terikat pada acara (saat ini hanya Draftsgiving). Dialog "Join one" tidak dibuka.

**Draftsgiving** (`/events/draftsgiving`, dibuka tanpa parameter `?join=1`, jadi tidak bergabung)
- Header: "November 1–30 · Day 16 of 30", logo bertulis, "Thirty days, one goal, and a table full of writers with whom to share the journey.", "Ends Nov 30 at 11:59 PM your time." (waktu lokal pengguna), tautan "Learn more." ke artikel bantuan.
- Kartu "Choose a goal to suit your appetite." dengan "Only words you add from the day you join count. You can change your goal any time." Tiga tingkat target (radio): "Small Plate" 10,000 words "About 334 words a day"; "A Generous Portion" 25,000 words "About 834 words a day"; "All the Trimmings" 50,000 words "About 1,667 words a day" berlabel "The classic". Tombol "Join Draftsgiving". Catatan "Free for everyone. All you need is a Novlr account."
- "Everyone at Draftsgiving": "6,446,132 words added by 1,613 writers so far" (agregat global).
- "Who's writing": per tingkat target, deretan avatar peserta dengan nama pengguna terlihat sebagai teks alternatif, plus penghitung "+498 more writers", dan tombol "See everyone going for [tingkat]".
- "Draftsgiving groups": "Join Draftsgiving to take a seat at a table." Kartu grup resmi untuk tiap tingkat dengan label "Official", jumlah penulis di meja (mis. 358), "words so far", "15% of the goal, on average", avatar, dan "Everyone on this goal writes here."
- "Write with friends": "A table for you and the writers you invite." tombol "Start one" dan "Join one", "Got a code from a friend? Pull up a chair."
- "All public Draftsgiving groups": tabel Group, Words, Writers dengan grup resmi dan grup buatan pengguna (label "Public").

### Interaksi

- Tombol "Add" pada sprint kemungkinan menambahkan ke kalender (tidak ditekan; DUGAAN).
- Pembukaan "Start one" dan "Start a group" hanya menampilkan formulir.

### Terkunci / berbayar

- Draftsgiving: "Free for everyone". Events dan Writing Groups tidak menampilkan gembok.

### Tidak bisa dipastikan

- Layar setelah bergabung: kartu progres pribadi, bar progres, apa yang dilihat peserta lain tentang kemajuan saya. Hanya terlihat tanda bahwa anggota grup dapat melihat "usernames, project titles, and progress".
- Isi tabel "Join one" (kode) dan halaman satu grup.
- Apakah ada pesan, obrolan, atau umpan di dalam grup. Tidak terlihat; komunikasi sprint diarahkan ke Discord.
- Apakah ada peringkat antar peserta atau grup. Yang terlihat hanya kolom jumlah kata dan penulis per grup; kolom peringkat eksplisit tidak ada.

## 5. Projects

### Terlihat langsung

**Daftar proyek** (`/projects`)
- Judul "Projects", tombol "Create" dan "Import".
- Tab "Active" dan "Archive". Tab Archive tidak dibuka.
- Kotak "Search projects...".
- Tombol "Filters" yang membuka panel dengan satu kelompok "Type" (hanya "Script" yang terlihat, sesuai tipe proyek yang ada).
- Penghitung "1 projects" dengan kotak centang pilih-semua (indikasi aksi massal; DUGAAN).
- Tampilan **kartu** (satu kartu: nama proyek, "3m ago", "3 words", menu ⋮). Tidak ada tombol beralih list/grid.
- Keadaan kosong (terlihat sesaat): ikon buku, "Start your next project", "Create your first project and begin writing. Every great story starts with a single word.", tombol "Create Project".
- Menu ⋮ pada kartu: "Share", "Edit", "Export", "Duplicate", "Archive", "Delete".

**Dialog "Create Project"**: isian "Title: e.g. The Hobbit", daftar "Type (optional)" dengan sepuluh pilihan: Novel, Short story, Non-fiction, Memoir, Novella, Poetry, Article, Script, General, Course. Tombol "Cancel" dan "Create". Tidak dikirim.

**Dialog "Import document"**: "Import a manuscript from Word, ODT, RTF, or Scrivener." Area seret "Drag a file or folder here, or" dengan tombol "Select file" dan "Import from Scrivener". Catatan ".docx, .odt, or .rtf (max 50 MB). For a Scrivener project, use Import from Scrivener." dan tautan "What can I import?". "DESTINATION": "New project" (bawaan) atau "Existing project". Tombol "Cancel" dan "Continue" (nonaktif sampai ada file). Dibatalkan.

**Halaman satu proyek** (`/project/<id>`, membuka ke Overview). Empat tab: "Overview", "Planning", "Manuscript", "Notebook". Ikon centang hijau di samping nama proyek (indikator tersimpan; DUGAAN).
- Overview: area "Add Cover"; "Project Title"; chip jenis "Script", "+ Collection", "+ Status"; "Synopsis" dengan "+ Create a synopsis"; "Tags" dengan tombol +; "Details": Word Count, Sections, Last Edited, Created; "Recently Edited" (bagian terakhir dengan cuplikan teks dan "4m ago"); "Project Goals": "Current Goal" ("Set a goal for this project", "You can do it!") dan "Completed Goals" ("No completed goals yet", "Your achievements will appear here").
- Planning: navigasi antar bagian (panah, judul bagian, "Section 1 · 3 words · 1 of 2"), dua baris papan: "Main Plot 0" dan "Secondary Plot 0", masing-masing dengan area tambah (+) putus-putus dan menu ⋮. Terlihat seperti papan alur berbasis kartu (DUGAAN).
- Manuscript: panel "Sections" (daftar bagian, ikon "Section options", tombol "Close sidebar"), lalu editor (bagian 7).
- Notebook: judul "Notebook", "Search 0 Notes...", "Filters", "Sort", tombol + bulat, area "Create new note".
- Menu ⋮ proyek: "Share", "Export project", "Duplicate Project", "Writing Preferences", "Delete Project".

**Note Library** (`/note-library`): "Create", tab "Active" dan "Archive", pencarian "Search notes...", "Filters", "0 notes", keadaan kosong "Start adding notes" / "Create your first note to capture ideas, research, and inspiration for your writing." dan tombol "Create Note". Ini perpustakaan catatan lintas proyek.

**Isi studio (editor)**: lihat bagian 7 untuk panel alat; di sisi kanan editor ada tab "Notes", "Comments", "Versions".

### Interaksi

- Mengklik proyek di daftar membuka Overview. Tab berganti lewat bilah tab atas (alamat `/overview`, `/planning`, `/manuscript`, `/notebook`).
- "Resume Writing" di sidebar membuka langsung manuskrip.

### Terkunci / berbayar

- Sidebar halaman Note Library menampilkan "For unlimited projects, upgrade". Ini mengindikasikan Free punya batas jumlah proyek, tetapi **angka batasnya tidak tampil** (lihat tabel).
- Riwayat versi di editor dibatasi (bagian 7).

### Tidak bisa dipastikan

- Isi tab Archive, filter selain "Type", opsi pengurutan "Sort" pada Notebook.
- Perilaku "Export" (format) dan "Share" (tautan publik atau kolaborasi).
- Isi "Writing Preferences".
- Apakah Collection dan Status punya nilai bawaan.

## 6. Academy

### Terlihat langsung

- `/academy`: "Novlr Academy", pengantar "Boost your writing skills with Novlr Academy. Learn while you write with a mix of fully integrated courses and non-integrated guided learning to help you achieve your writing and publishing goals."
- "Featured Course": "Couch to 80k Creative Writing Bootcamp" oleh Tim Clare, "53 lessons | 53 audio", tombol "Audio trailer" dan "Enroll". Lalu "Course Overview" (penjelasan umum).
- "All Courses", enam kursus. Tiap kartu menampilkan lencana akses, gambar, judul, pengajar, "N lessons | N video/audio", deskripsi, tombol aksi dan "Overview":
  - Free: "How to Write a Crime Novel with Jack Heath" (12 lessons, video), "Couch to 80k Creative Writing Bootcamp" (53 lessons, audio), "Write to Play: Rediscover the Joy of Writing" (61 lessons, 6 video).
  - Starter: "Write a Non-Fiction Book Proposal" (24 lessons, audio), "An Introduction to the Novel Fast Drafting Method" (6 lessons, video), "A Beginner's Guide to Book Publicity" (5 lessons, video).
  - Tombol: "Enroll" untuk kursus Free, "Upgrade to Enroll" untuk kursus Starter.
- Bagian testimoni "What Writers Are Saying" (dua kutipan).
- Halaman satu kursus (`/academy/courses/how-to-write-a-crime-novel`): "Back to Academy", judul, pengajar, tombol "Enroll in This Course", deskripsi, "What You'll Learn" (daftar manfaat), "How It Works", "Course Curriculum" (daftar judul pelajaran, "12 lessons"), "About the Instructor", "Course Details" (Lessons, Author, Level: "All Levels").

### Interaksi

- "Overview" membuka halaman kursus. "Enroll" tidak ditekan.

### Terkunci / berbayar

- Tiga kursus berlabel "Starter" tidak bisa diikuti di Free ("Upgrade to Enroll"). Paket berbayar yang membuka mereka bernama "Starter" (atau paket di atasnya). Sidebar: "For the full Academy, upgrade".

### Tidak bisa dipastikan

- Pelacak progres, pemutar kursus ("course player" disebut di teks), dan sertifikat. Tidak mendaftar ke kursus, jadi tidak terlihat. Tidak ada kata "certificate" di halaman yang dibaca.
- Apakah "integrated" berarti pelajaran muncul di dalam editor.

## 7. Flow widget di editor

Catatan: kata "Flow" tidak muncul di UI yang dilihat. Yang ada adalah bilah alat di bagian bawah editor dengan empat ikon. Pemetaan ke "Flow widget" adalah DUGAAN.

### Terlihat langsung

Editor manuskrip: bilah atas proyek, ikon panel kiri (Sections) dan kanan, judul bagian di tengah, teks. Bilah bawah dengan empat ikon; tiap ikon membuka kartu mengambang:

1. Ikon target: dua baris. "Build a habit / Make it muscle memory." dan "Set a goal for this project / You can do it!", masing-masing dengan tombol + bulat berwarna (merah muda dan hijau toska).
2. Ikon grafik batang: "Section Word Count" 3, "Project Word Count" 3, "Words Written Today" 3. Setiap angka punya ikon pin (menyematkan ke bilah; DUGAAN).
3. Ikon stopwatch (timer sprint): "Time +mins", "Words +words", "Pace 0wpm", tombol pin pada tiap baris, garis putus-putus kuning dan tombol putar (play). Terlihat sebagai timer sprint: isi menit atau kata, lalu mulai.
4. Ikon A dengan centang: "Ready to check grammar" dan tombol "Run Check" (ungu). Pemeriksa tata bahasa. Tidak dijalankan.

Panel kanan editor: tab "Notes", "Comments", "Versions".
- Notes: "Take Note" / "With notes you can keep your character profiles, world building, and background research right here." tombol "Create Note".
- Versions: "Current Version 3 words · Just now", "Today 2 versions", daftar jam dan jumlah kata (dengan ikon pin per versi), dan catatan "Showing last 3 days. Go unlimited with Studio."

### Interaksi

- Mengeklik ikon membuka dan menutup kartu; kartu menumpuk di tengah bawah. Pin tidak ditekan, play tidak ditekan.

### Terkunci / berbayar

- Riwayat versi di Free hanya 3 hari terakhir. Versi tak terbatas butuh "Studio" (nama paket tertinggi yang terlihat).
- Sidebar: "For cloud backup, upgrade" (pencadangan awan berbayar) dan "For more themes, upgrade" (tema tambahan berbayar). Keduanya petunjuk berputar di kartu paket.

### Tidak bisa dipastikan

- Apakah ada sematan (pin) yang menaruh widget tetap di layar atau di bilah bawah; apakah ada mode Flow terpisah (fokus penuh).
- Perilaku timer setelah dimulai, hasil pemeriksaan tata bahasa, dan batas penggunaannya di Free.
- Toolbar format teks (tebal, miring, dsb.) tidak diperiksa terpisah karena fokus pada widget.

## 8. Navigasi

### Terlihat langsung

Sidebar (setelah viewport dilebarkan), dari atas ke bawah:
1. Logo "novlr" dengan menu "Switch Novlr product" (pemilih produk; tidak terbuka saat diklik) dan tombol ciutkan sidebar.
2. "Desk"
3. "Draftsgiving" (dengan tombol "Hide Draftsgiving from the sidebar", jadi butir acara bisa disembunyikan)
4. "Projects"
5. "Note Library"
6. "Habits & Goals"
7. "Analytics"
8. Kelompok "Community": "Community", "Events", "Writing Groups"
9. "Academy"
10. "Resources" (bisa dibuka): "Writer Discounts", "Writing Tips", "Publishing Advice", "The Reading Room"
11. Kartu "Resume Writing" dengan nama bagian dan proyek terakhir
12. "Helpdesk", "Co-ownership" (tautan ke novlr.org)
13. Kartu paket di bawah: "NOVLR FREE" dengan satu kalimat petunjuk dan tautan "upgrade". Kalimat berubah per halaman: "For cloud backup, upgrade", "For 30-day history, upgrade", "For the full Academy, upgrade", "For more themes, upgrade", "For unlimited projects, upgrade".

Bilah atas aplikasi: ikon rumah dan jejak (breadcrumb), ikon pencarian, ikon mode fokus/layar penuh, avatar profil. Ada tombol chat dukungan bulat di pojok kanan bawah ("Open chat").

### Interaksi

- Butir yang sedang acara berlangsung (Draftsgiving) disisipkan di bawah Desk dan bisa disembunyikan.
- Di layar sempit sidebar hilang dan bilah atas tersisa.

### Terkunci / berbayar

- Sidebar tidak memberi gembok pada butir; pembatasan muncul di dalam halaman (Analytics, Goals, Versions, kursus Starter) dan lewat kartu paket yang berganti kalimat.
- Nama paket yang terlihat: Free, Starter, Studio.

### Tidak bisa dipastikan

- Isi pemilih produk "Switch Novlr product".
- Halaman Resources dan Helpdesk (tidak dibuka).
- Halaman harga dan perbandingan paket (tidak dibuka; tidak ada upgrade yang ditekan).

## Perbedaan dengan laporan publik

| Topik | Laporan publik (acuan sebelumnya) | Terlihat di dalam aplikasi | Status |
| --- | --- | --- | --- |
| Batas proyek Free (2 atau 5) | Berbeda-beda antar sumber | **5 proyek.** Kartu paket di Account > Subscription: "Write for free, up to 5 projects". Starter 10 proyek, Studio tak terbatas. Batas belum diuji dengan membuat proyek | DILIHAT (teks paket; perilaku batas belum diuji) |
| Habit harian atau mingguan | Harian saja, atau harian dan mingguan | Dialog "Create Writing Habit" menawarkan **Daily dan Weekly**. Data contoh Analytics memakai streak mingguan ("6 week streak") | DILIHAT |
| Jenis target lain (bulanan, proyek, tenggat) | Goals proyek dan tenggat | Hanya teks contoh dan promosi ("Set a word count or a deadline for any project"). Habit tidak punya jenis bulanan | DUGAAN untuk Goals, gembok belum terbukti |
| Aturan putus streak | Berbeda antar sumber | Tidak terlihat. Hanya "Target hit! Your streak continues" (contoh), "Longest: 14 weeks", dan "streaks of 2+ days are saved here" saat target diubah | Tidak bisa dipastikan |
| Kalender acara di dalam aplikasi | Disebut ada dan juga tidak ada | **Tidak ada tampilan kalender.** Halaman Events hanya daftar kartu (satu acara). Jadwal sprint berupa daftar dengan tombol "Add" | DILIHAT |
| Writing Groups di dalam aplikasi | Hanya tautan Discord | **Ada di dalam aplikasi**: halaman grup, buat (publik atau privat), gabung dengan kode, tabel grup publik. Terikat ke acara (kini Draftsgiving). Obrolan tetap di Discord | DILIHAT |
| Draftsgiving | Tantangan 30 hari November | Tiga tingkat target (10.000, 25.000, 50.000 kata), grup resmi, agregat global, daftar peserta dengan nama pengguna terlihat, "Free for everyone" | DILIHAT |
| Kontes | Disebut ada | Tidak terlihat. Draftsgiving berupa tantangan menulis bersama, bukan kompetisi dengan juri | DILIHAT (tidak ada kontes) |
| Lencana (badge) pencapaian | Disebut ada | Tidak terlihat. Label "Official" dan "Public" pada grup hanyalah penanda jenis grup. "Completed Goals" menyebut "achievements" tetapi tidak menampilkan lencana | Tidak terlihat |
| Peringkat (leaderboard) | Disebut ada | Tidak ada kolom peringkat. Tabel grup menampilkan jumlah kata dan penulis, urutan tidak dijelaskan | Tidak terlihat; urutan tidak bisa dipastikan |
| Sertifikat Academy | Disebut ada | Setelah mendaftar kursus: ada progres "1 of 12 lessons completed" dan Course Player, tetapi tidak ada kata "certificate" di halaman kursus atau pemutar. Pelajaran terakhir belum diselesaikan, jadi layar kelulusan tidak terlihat | Tidak terlihat; layar kelulusan tidak bisa dipastikan |
| Riwayat versi di Free | Tidak jelas | "Showing last 3 days" di Free, "Go unlimited with Studio" | DILIHAT |
| Pengaturan ulang kartu Desk | Tidak jelas | Bisa diseret, disembunyikan lewat ikon mata, dan direset ("Organise your desk") | DILIHAT |
| Analytics di Free | Sebagian gratis | Empat angka kata (hari ini, 7, 30, 365 hari) dan daftar proyek nyata; sisanya data contoh di balik "Upgrade" | DILIHAT |

## Tambahan putaran kedua (16 November 2026, setelah izin memakai fitur)

Atas arahan pengguna, saya mendaftar ke kursus gratis "How to Write a Crime Novel with Jack Heath" dan menandai pelajaran 1 selesai (perubahan ini ada di akun Novlr pengguna; bisa dibatalkan lewat tombol "Un-enroll"). Tidak ada proyek dibuat, "Join Draftsgiving" tidak ditekan (peserta tampil publik), "Create reading link" tidak ditekan (membuat tautan baca publik), tidak ada ekspor atau unduhan, tidak ada perubahan pengaturan akun.

### A. Academy setelah mendaftar (DILIHAT)

- Klik "Enroll in This Course": toast "Enrolled successfully!". Halaman kursus berubah: "0 of 12 lessons completed" dengan bilah progres, tombol "Open Course Player" (kemudian "Continue Learning"), dan di bawah: "You enrolled on this course on 16th Nov 2026", "No longer interested?", "Unenroll from this course to stop it from showing in your lists. You can resume with current progress anytime by re-enrolling.", tombol "Un-enroll".
- Daftar Academy menambah bagian "Courses in progress" di atas: judul, "Lesson 2 of 12", bilah progres, tombol "Resume →" dan tautan "Un-enroll". Kartu di "All Courses" berganti tombol menjadi "Resume Learning".
- **Course Player** adalah jendela mengambang, bukan halaman. Dialog pengantar "Welcome to the Academy Player" / "Your floating learning companion": "Move it anywhere" (seret header, "Keep learning while you write!"), "Resize to fit" (seret tepi), "Minimize and keep playing" (kecil jadi bilah, pelajaran terus diputar). Tombol "Got it!".
- Isi pemutar: judul kursus dan "Lesson 1 of 12", tombol minimalkan, perbesar, tutup; panel "Course Lessons (12)" yang bisa dilipat dengan lingkaran status per pelajaran; judul pelajaran, deskripsi, area video, panah pelajaran sebelum/berikutnya; "Didn't get to the end of this lesson but want to mark complete anyway? Mark complete"; kartu "Writing exercise" dengan tombol "Copy exercise" dan instruksi seperti "Open a new project in Novlr, and write the following words: ..." (latihan dikerjakan di editor, bukan di pemutar).
- "Mark complete": lingkaran pelajaran menjadi centang hijau, header memuat "Lesson 1 of 12 · Complete", toast "Lesson marked as complete!". Progres di halaman kursus menjadi "1 of 12 lessons completed". Saat diminimalkan, pemutar menjadi kartu kecil di sudut kanan bawah berisi judul pelajaran, tombol perbesar dan tutup.
- Video tidak diputar (area gelap, tidak diuji).

### B. Account (menu avatar > Account/Preferences), enam tab (DILIHAT)

Dialog "Account" / "Manage your Novlr account settings" dengan tab: Preferences, Backups, My Account, Subscription, Notifications, Invite friends, Support, dan "Log out".

- **Preferences:** "Interface theme": Light, Dark, System, plus tiga tema berlabel STUDIO (Evening, Parchment, Airy). Kotak "Turn on dyslexia-friendly editor features". "Editor behaviour": "Default font size" (16pt), "Curly quotes", "Writing mode" (Typewriter atau Word Processor), "Typewriter position" (High, Middle, Low), "Proofreader" (bisa dinyalakan per manuskrip), "Proofreading language" (English (British)), "Saved words" (daftar kata yang diabaikan pemeriksa tata bahasa, tombol "Add"), "Commenting" ("Hide inline comments when sidebar is closed"). Lalu tabel **Keyboard shortcuts**: pencarian global Ctrl+K, toggle navigasi Ctrl+M, layar penuh F11, toggle sidebar kiri Ctrl+\ dan kanan Ctrl+Shift+\, Tab untuk indentasi, Esc keluar editor, "--" menjadi em-dash; format Bold, Italic, Underline, Strikethrough, daftar poin, daftar nomor, blockquote, rata kiri/tengah/kanan; dan puluhan pintasan tipografi (mis. "..." menjadi elipsis, "->" menjadi panah, "(c)" menjadi simbol hak cipta, "1/2" menjadi pecahan).
- **Backups:** kartu "Google Drive" dan "Dropbox" (keduanya "Not Connected", tombol "Upgrade to Studio", catatan bahwa Novlr hanya dapat membuat dan mengubah berkasnya sendiri); "Local Export": "Export your projects directly to your computer as .docx, .pdf, .ODT, .rtf, .MD and .epub."
- **My Account:** "Personal Information" (foto, nama, "No username yet", email dengan "Email verified", "Member since November 2026"), "Language" (English), "Security" (Password, "Last changed", "Change Password"), "Danger Zone" ("Delete Account": penghapusan permanen, "All data will be removed within 30 days"). Data pribadi tidak disalin ke laporan.
- **Subscription:** "Choose the Novlr you need", sakelar Monthly/Yearly. Paket: **Novlr Studio** "MOST POPULAR", $16/bulan (ditagih tahunan $192, "Save 20%"): "Unlimited projects and version history", "Cloud backups and three extra themes", "Priority support", dan modul "SITES" ("Link your own domain"). **Starter** "Writing only", $8/bulan ($96/tahun): "10 writing projects", "In-depth analytics and goals", "30-day version history", "Full Novlr Academy", "No author website." **Free**: $0, "Write for free, up to 5 projects", "Design your site, ready to launch", "Upgrade to publish." (ditandai "Your current plan"). **Lifetime**: $499 sekali bayar, "Become a co-owner of Novlr", "Exclusive Discord channels".
- **Notifications:** "In-app notifications" > "Success Nudges" ("Receive notifications to cheer on your progress while writing!", tombol "Try one"); "Emails": "Novlr news" (maksimum 2 per bulan), "Weekly writing progress emails", "Ask Novlr Newsletter" (bulanan); "Comments" (pilihan "Every comment") dan "Feedback notes" ("Every note").
- **Invite friends:** "Give a friend Novlr. When they subscribe, you both get a month of Studio free." Tautan dan kode rujukan dengan "Copy link", "Copy code", "Send invite" per email, penghitung Invited / Joined / Subscribed (0/0/0).
- **Support:** "In-app chat", email, Discord, dan alat teknis: "Run sync diagnostic", "Debug data", "Recover local backup".

Dampak pada tabel sebelumnya: batas Free adalah 5 proyek; Goals dan analitik mendalam ada di Starter ke atas; riwayat versi 3 hari (Free), 30 hari (Starter), tak terbatas (Studio); pencadangan awan hanya Studio.

### C. Menu proyek dan editor yang baru dibuka (DILIHAT)

- **Writing Preferences** (menu ⋮ proyek): "Project writing preferences" / "Font and paragraph layout for this project's editor and exports": "Font family" (nilai Mono), "Font size", "Line spacing" (1.15), "Indent paragraphs", "Space between paragraphs", "Writing language". Catatan "Applies to the whole project, for every author." Jadi tata letak adalah milik proyek, sedangkan ukuran font bawaan, typewriter, dan curly quotes milik akun.
- **Export project:** dialog "Exporting [proyek]" dengan pemilih format (bawaan "Word Document (.docx)"; format lain tercantum di Backups: PDF, ODT, RTF, MD, EPUB), "ADD TO YOUR EXPORT": "Include project title as front page" (aktif), "Include notes" (mati), "Include page numbers" (aktif), "Line height" (Single, 1.5, Double), "Author name" (Yes, No, Pen name), "Include copyright symbol ©". Tombol "Cancel" dan "Export". Tidak diekspor.
- **Share** (menu ⋮ proyek): "People" berlabel Beta dengan isian "Invite by email" dan pilihan peran: **Co-author** ("Has full access to the project"), **Editor** ("Can edit and comment"), **Beta Reader** ("Can read and comment"), tombol "Invite", daftar anggota ("You. Author."), dan "Reading link": "Anyone with the link can read the sections you choose, no account needed." dengan "Create reading link". Tidak membuat tautan.
- **Pencarian global** ("Find Anything", Ctrl+K atau ikon kaca pembesar): kotak "Start typing to search...", kotak centang jenis hasil Project, Section, Collection, Note; filter "All tags", "All statuses", "All collections"; "Show advanced filters"; keadaan awal "Start searching" / "Type to search across projects, sections, collections, and notes."
- **Toolbar saat teks dipilih:** bilah bawah berganti menjadi bilah format: Bold, Italic, Underline, Blockquote, penghitung kata pilihan ("3 words"), dan menu ⋯: rata kiri/tengah/kanan/rata penuh, "Bullet list", "Numbered list", "Split chapter", "Thesaurus" (nonaktif), "Comment", "Share snippet".
- **Share snippet:** "Create an image of your words to download or share." Pilihan rasio Square 1:1, Portrait 9:16, Landscape 16:10; huruf Serif atau Sans Serif; sembilan tema warna (Ocean, Sunset, Forest, Minimal, Dark, Classic, Emerald, Lavender, Midnight); "Include author credit" ("Show that this was proudly 'written in Novlr'", opsi mematikannya berlabel "Upgrade to unselect this option"); pratinjau dan "Final image: 600 × 600px"; tombol "Download". Tidak diunduh.
- **Comments** (panel kanan): keadaan kosong "No comments yet".
- **Join one** (Writing Groups): dialog "Join a group" / "Pick a table, or enter a code from a friend." dengan pencarian, "No groups to join yet." (karena belum bergabung ke Draftsgiving) dan "Have a code? Enter it".
- **Tab Archive proyek:** "No archived projects" / "Projects you archive will appear here. You can archive projects to keep them out of your active workspace without deleting them."
- Sidebar menambah satu petunjuk lagi: "For priority support, upgrade" dan "To publish your book, upgrade". Jadi ada fitur **publish buku** (modul "Sites": situs penulis dengan domain sendiri) yang berbayar.

### D. Belum dibuka dan alasannya

| Menu | Alasan |
| --- | --- |
| Layar duduk di meja Draftsgiving ("Take a seat") dan layar satu grup | Membagikan nama proyek dan progres ke ratusan peserta; tidak dipilih |
| Mengundang orang ke proyek (Co-author, Editor, Beta Reader) | Mengirim undangan ke orang sungguhan |
| Switch Novlr product | Tidak terbuka saat diklik dua kali |
| Resources (Writer Discounts, Writing Tips, Publishing Advice, The Reading Room), Helpdesk, Co-ownership | Tautan keluar ke situs novlr.org, bukan layar aplikasi |
| Sites (situs penulis) | Terkunci di balik "Upgrade to publish"; tidak ada layar yang bisa dibuka di Free |
| Pelajaran 2 sampai 12, layar kelulusan kursus | Tidak ditandai selesai satu per satu; video tidak diputar |
| Mode fokus/layar penuh (ikon di bilah atas) dan Notes/Create Note | Tidak diuji pada putaran ini |

## Tambahan putaran ketiga: Draftsgiving setelah bergabung dan reading link

Dengan persetujuan pengguna, akun bergabung ke Draftsgiving (tingkat Small Plate, username publik uji "ujiriset", proyek "fs"), lalu reading link dibuat dan langsung dicabut. Akun uji ini masih tercatat sebagai peserta (1.614 penulis). Keluar dari acara belum dicoba dan jalurnya tidak terlihat.

### E. Draftsgiving setelah bergabung (DILIHAT)

- Dialog "Join Draftsgiving" / "Choose your goal. You can change it any time.": tiga kartu tingkat (sama seperti halaman acara), "Your project" (pilih proyek yang ada, "Start a Draftsgiving project", atau "Import a project"; catatan "Only words you add to this project from today will count toward your Draftsgiving goal."), "Username" dengan awalan @ dan keterangan "How other writers see you in Who's writing.", tombol "Not now" dan "Join Draftsgiving". Username wajib; akun yang belum punya username diminta mengisinya di sini.
- Toast "You're in. Save room for words."
- Halaman berubah menjadi dasbor pribadi, urutan dari atas:
  1. Kartu "MY PROJECT": nama proyek, "0 / 10,000 words", bilah progres dengan penanda kecepatan, "0% of your goal. Write 5,334 words today to stay on pace.", tautan "Share progress".
  2. "TODAY": "0 of 667 words", "667 to go today.", tombol besar "Get writing" (menuju editor). Target harian dihitung ulang dari sisa kata dan sisa hari (bukan tetap 334 per hari), makanya angkanya naik karena sudah hari ke-16.
  3. Spanduk "Hold yourself accountable." dengan tombol "Share" dan thumbnail kartu progres; bisa ditutup.
  4. Dua kartu angka: "Days left 15 including today" dan "Best day 0 Give it time."
  5. "EVERYONE AT DRAFTSGIVING": total kata dan jumlah penulis global (kini 1.614).
  6. "Your November so far": grafik garis "Your words" dibanding "Pace" dari Nov 1 sampai Nov 30, sumbu 0 sampai 10k, label "Today · 0".
  7. "Who's writing": per tingkat, avatar peserta dan "+N"; penulis sendiri tampil di tingkatnya.
  8. "Draftsgiving groups": "YOUR GOAL'S TABLE" (kartu meja resmi tingkatnya: "Official", jumlah penulis, kata total, "21% of the goal, on average", ajakan "Sit with the writers on your goal." dengan tombol "Take a seat"), "Your groups" ("You're not in a group yet.", "Start one", "Join one"), lalu tabel "All public Draftsgiving groups" (56 grup, tombol "Show more").
- Modal otomatis "Sit at the Small Plate table?": "503 writers on your goal share a table. Take a seat to track your progress alongside theirs.", catatan "Members can see all usernames, project titles, and progress.", tombol "Not now" dan "Take a seat", serta "You can take a seat later from the Draftsgiving page." Saya memilih "Not now", jadi kartu progres pribadi tidak dibagikan ke meja. Duduk di meja adalah langkah opt-in terpisah dari bergabung.
- Dialog "Share your progress": "A picture of your Draftsgiving so far, ready to post anywhere.", pratinjau kartu (angka kata, "Day 16", target, avatar, @username, "novlr.org/draftsgiving"), bentuk "Square" (1080 x 1080) atau "Story", pengaturan "Show my goal", "Show my progress", "Show my avatar", "Show my username", tombol "Copy text" dan "Download image". Tidak diunduh.
- Perilaku data: kata dihitung hanya dari proyek yang dipilih sejak hari bergabung. Kata sebelum bergabung tidak dihitung ("Words count from the day you join").

### F. Reading link (DILIHAT)

- Setelah "Create reading link": toast "Your reading link is ready"; tampil tautan `studio.novlr.org/share/p/<uuid>` dengan tombol salin; teks "Anyone with this link can read your project."
- Opsi: sakelar "Include cover image and synopsis", "Include author credit", "Let readers share your link"; tombol "Edit sections" dan "Stop sharing".
- "Edit sections": dialog "Edit shared sections" / "Hiding a section doesn't hide any sections nested inside it." / "1 of 1 sections shared." dengan daftar bagian manuskrip dan tombol "Cancel" dan "Save".
- "Stop sharing": tautan dicabut dan dialog kembali ke keadaan awal ("Create reading link"). Tautan hanya hidup sekitar satu menit; isinya hanya tiga kata uji.
- Peran undangan (Co-author, Editor, Beta Reader) tidak diuji dengan mengundang orang.

### Perubahan yang tertinggal di akun Novlr

- Terdaftar di kursus "How to Write a Crime Novel" (pelajaran 1 ditandai selesai). Bisa dicabut dengan "Un-enroll".
- Terdaftar di Draftsgiving dengan username publik "ujiriset". Tidak terlihat tombol keluar; kemungkinan lewat pengaturan di halaman acara (tidak dicari).
- Username akun mungkin kini terisi. Periksa Account > My Account bila ingin dihapus atau diganti.

## Peta ke MVP Scope RanahMenulis: apa lagi yang layak dianalisis

`docs/produk/MVP Scope RanahMenulis.md` tidak menyebut Novlr secara langsung. Pemetaan di bawah dibuat dari kolom "Yang diminta client" dan ID PRD pada dokumen itu. Kolom "Sudah dianalisis" merujuk ke laporan ini.

| Cakupan MVP (rilis) | Padanan di Novlr | Sudah dianalisis | Sisa yang bisa dianalisis |
| --- | --- | --- | --- |
| Studio: editor, dokumen/folder/sampah, autosave, konflik (STD-01..03, R2) | Manuskrip, Sections, Versions, indikator tersimpan (centang) | Bilah format, panel Notes/Comments/Versions, riwayat versi dibatasi | Sampah dan pemulihan (Delete Project, hapus section), "Split chapter", seret urutan Sections, perilaku offline/konflik (butuh uji dua tab; tidak aman diuji sembarangan) |
| Ekspor (STD-07, R2) | Export project, Local Export | Dialog dan format | Hasil berkas (tidak diunduh) |
| Streak dan statistik (STK-01..06, R2) | Habit Streak, Productivity, Analytics | Dialog target, tampilan contoh | Tampilan streak asli setelah habit dibuat, aturan putus streak (perlu membuat habit uji lalu menghapusnya) |
| Community: bagikan prolog, feed, profil publik (COM, R3) | Share snippet, Draftsgiving, Writing Groups | Share snippet, grup | Tidak ada umpan atau profil publik di Novlr; satu-satunya padanan adalah snippet dan reading link |
| Kelas: kurikulum, tugas, progres (KLS-01..03, R5) | Academy dan Course Player | Pendaftaran, pemutar, progres, tanda selesai | Pelajaran lain, alur "Un-enroll", layar kelulusan, tugas menulis di editor |
| Pengguna dan profil, zona waktu (PLT-02, R1) | Account > My Account, Preferences | Semua tab dibaca | Tidak ada isian zona waktu yang terlihat; tidak diubah |
| Notifikasi (PLT-04, R1) | Account > Notifications, "Success Nudges" | Pengaturan terbaca | Tidak ada pusat notifikasi (lonceng) terlihat di bilah atas |
| Pembayaran, paket (PLT-07, R4) | Subscription, Lifetime, kode rujukan | Harga dan isi paket terbaca | Halaman pricing publik, alur checkout (tidak dibuka; tidak akan dibeli) |
| Kolaborasi: Editor/juri/mentor memberi umpan (Antologi, Kelas, Lomba, R5) | Share (Co-author, Editor, Beta Reader), Comments, Feedback notes | Peran dan dialog terbaca | Mengundang orang (tidak dilakukan), tampilan komentar berisi, notifikasi komentar |
| Grup Penulis oleh Admin (R6) | Writing Groups | Dialog buat/gabung | Layar satu grup (butuh bergabung ke Draftsgiving) |
| Dashboard/Beranda (R1, "belum ada spesifikasinya") | Desk | Seluruh kartu dan edit tata letak | Seret kartu (belum dicoba), penyimpanan tata letak antar perangkat |
| Admin Panel, Organizer, Juri (PLT-03, 05, 06; PRJ-03) | Tidak ada padanan di akun Free | Tidak berlaku | Tidak dapat dianalisis dari akun ini |
| Pemesanan buku, penerbitan (ditunda) | Sites ("Upgrade to publish") | Hanya teks promosi | Terkunci |

Ringkasannya: bagian yang paling bernilai untuk dianalisis berikutnya adalah (1) layar kelulusan kursus dan tugas menulis di Academy untuk acuan Kelas, (2) alur Share dengan peran Editor/Beta Reader dan komentar berisi untuk acuan umpan Antologi dan Kelas, (3) tampilan streak asli setelah habit dibuat dan aturan putus streak untuk acuan Streak, dan (4) layar setelah bergabung Draftsgiving untuk acuan Grup dan acara. Item 2 sampai 4 butuh aksi yang terlihat orang lain atau mengubah data akun, jadi perlu izin eksplisit.

## Catatan untuk desain RanahMenulis

Hanya pengamatan yang berguna bagi keputusan produk; belum menjadi keputusan.

- Pola upsell Novlr: konten terkunci tetap ditampilkan sebagai **data contoh buram** dengan satu kalimat nilai dan satu tombol. Kartu paket di sidebar mengganti kalimatnya sesuai halaman.
- Habit dibuat dari dialog kecil (jumlah kata dan frekuensi) dengan pratinjau kalimat hidup. Cocok dengan arah target harian di Streak RanahMenulis.
- Writing Groups terikat pada acara dan memakai kode undangan serta label publik/privat dengan peringatan privasi yang jelas ("Members can see all usernames, project titles, and progress").
- Widget editor dikelompokkan di bilah bawah (target, statistik kata, timer sprint, tata bahasa), masing-masing kartu mengambang kecil.

## Lampiran: tangkapan layar

Berkas gambar ada di `docs/referensi/novlr/novlr-ss/`. Semuanya diambil dari panel browser yang sempit (sekitar 800 px), jadi tata letak desktop penuh bisa berbeda. Tangkapan yang memuat nama atau email pemilik akun (sapaan Desk, menu avatar, dialog Share, tab My Account) sengaja tidak disertakan.

### Desk dan Habits

![Desk dalam mode atur kartu](novlr-ss/01-desk-atur-kartu.jpg)
*Desk, mode "Organise your desk": tombol "Done editing" dan banner petunjuk seret, mata, dan reset.*

![Dialog Create Writing Habit](novlr-ss/02-habit-dialog.jpg)
*Dialog "Create Writing Habit": pilihan kata, Daily atau Weekly, dan pratinjau kalimat.*

![Habit custom dan weekly](novlr-ss/03-habit-custom-weekly.jpg)
*Pilihan "Custom" memunculkan "Custom Amount"; "Weekly" mengubah kalimat menjadi "weekly".*

![Halaman Habits dan Goals](novlr-ss/04-habits-goals.jpg)
*Halaman Habits & Goals: kartu Habit Streak kosong dan "Previous streaks".*

### Analytics dan Draftsgiving

![Analytics terkunci](novlr-ss/05-analytics-terkunci.jpg)
*Analytics: data contoh buram di balik kartu "See the whole picture of your writing" dan tombol Upgrade.*

![Halaman Events](novlr-ss/06-events.jpg)
*Events: hanya satu kartu, tanpa kalender.*

![Draftsgiving sebelum bergabung](novlr-ss/07-draftsgiving-sebelum-gabung.jpg)
*Draftsgiving sebelum bergabung: tiga tingkat target.*

![Dialog Start a group](novlr-ss/08-writing-groups-start.jpg)
*Writing Groups, dialog "Start a group": nama, acara, Public atau Private, dan catatan privasi.*

![Dialog bergabung Draftsgiving](novlr-ss/29-draftsgiving-dialog-gabung.jpg)
*Dialog "Join Draftsgiving": tingkat, proyek, dan username publik (bagian bawah di bawah lipatan).*

![Dasbor Draftsgiving setelah bergabung](novlr-ss/30-draftsgiving-setelah-gabung.jpg)
*Setelah bergabung: progres, target hari ini, "Get writing", spanduk "Hold yourself accountable", dan toast "You're in. Save room for words."*

### Projects dan studio

![Daftar proyek](novlr-ss/09-projects-daftar.jpg)
*Daftar proyek: tab Active dan Archive, pencarian, Filters, kartu proyek.*

![Dialog Create Project dengan daftar tipe](novlr-ss/10-create-project-tipe.jpg)
*Create Project: isian judul dan daftar "Type (optional)" (Novel, Short story, Non-fiction, dan seterusnya).*

![Dialog Import document](novlr-ss/11-import-dialog.jpg)
*Import document: seret berkas, "Import from Scrivener", tujuan New project atau Existing project.*

![Menu kartu proyek](novlr-ss/12-menu-kartu-proyek.jpg)
*Menu ⋮ pada kartu proyek: Share, Edit, Export, Duplicate, Archive, Delete.*

![Overview proyek](novlr-ss/13-proyek-overview.jpg)
*Overview proyek: cover, jenis, Collection, Status, Synopsis, Tags, Details.*

![Tab Planning](novlr-ss/14-proyek-planning.jpg)
*Planning: papan "Main Plot" dan "Secondary Plot" per bagian.*

![Tab Notebook](novlr-ss/15-proyek-notebook.jpg)
*Notebook: pencarian, Filters, Sort, dan "Create new note".*

### Editor

![Widget target](novlr-ss/16-editor-target.jpg)
*Bilah bawah editor, ikon pertama: "Build a habit" dan "Set a goal for this project".*

![Widget statistik kata](novlr-ss/17-editor-statistik.jpg)
*Ikon kedua: Section Word Count, Project Word Count, Words Written Today, masing-masing dengan pin.*

![Widget timer sprint](novlr-ss/18-editor-timer.jpg)
*Ikon ketiga: Time, Words, Pace, dan tombol putar.*

![Widget tata bahasa](novlr-ss/19-editor-tata-bahasa.jpg)
*Ikon keempat: "Ready to check grammar" dan "Run Check".*

![Panel Versions](novlr-ss/20-editor-versions.jpg)
*Panel Versions: versi hari ini dan catatan "Showing last 3 days. Go unlimited with Studio."*

![Menu format teks](novlr-ss/27-editor-menu-format.jpg)
*Menu ⋯ saat teks dipilih: perataan, daftar, Split chapter, Thesaurus, Comment, Share snippet.*

![Dialog Share snippet](novlr-ss/28-share-snippet.jpg)
*Share snippet: rasio gambar, huruf, sembilan tema warna, dan kredit penulis.*

![Dialog Export](novlr-ss/25-export-dialog.jpg)
*Dialog Export: format, judul sebagai halaman depan, catatan, nomor halaman, line height.*

![Pencarian global](novlr-ss/26-pencarian-global.jpg)
*"Find Anything" (Ctrl+K): jenis hasil dan filter tag, status, koleksi.*

### Academy dan Account

![Kursus setelah mendaftar](novlr-ss/21-academy-terdaftar.jpg)
*Halaman kursus setelah "Enroll": progres "0 of 12 lessons completed" dan "Open Course Player".*

![Pengantar Academy Player](novlr-ss/22-academy-player-pengantar.jpg)
*Dialog pengantar "Welcome to the Academy Player".*

![Academy Player](novlr-ss/23-academy-player.jpg)
*Course Player mengambang: daftar pelajaran, video, "Mark complete", dan "Writing exercise".*

![Account, Preferences](novlr-ss/24-account-preferences.jpg)
*Account, tab Preferences: tema (tiga bertanda STUDIO) dan opsi dyslexia-friendly.*
