## 8. Penjelasan Detail Modul

Setiap modul dijelaskan dengan format yang sama: tujuan, pengguna, cara kerja, data, kondisi berhasil dan gagal, hubungan dengan modul lain, batasan akses, dan contoh nyata. Daftar fitur ada di bagian 9, kebutuhan fungsional rinci di bagian 10.

Studio dan Streak adalah **satu modul** dengan satu navigasi dan satu alur data: Streak dihitung dari aktivitas menulis di Studio. Bagiannya tetap dipisah menjadi dua area (8.1, 9.2, 10.2, 14.1, 17.3 untuk Streak; 8.2, 9.3, 10.3, 14.2, 17.2 untuk Menulis) agar aturan masing-masing mudah dibaca, dan nomor bagian dipertahankan agar rujukan tidak putus. ID fitur STK dan STD tetap dipakai. Marketplace dan Grup Penulis dibahas di bagian 7, 15.4, dan 23.

### 8.1 Studio, area Streak

| Aspek | Penjelasan |
| --- | --- |
| Tujuan | Membantu pengguna menulis secara konsisten dan melihat perkembangan produktivitasnya |
| Pengguna | Registered User dan Writer. Guest tidak memakai Streak |
| Cara kerja | Pengguna menetapkan target kata per hari. Saat menulis di Studio, Studio mengirim **perubahan kata** (selisih, bukan hitung ulang seluruh dokumen) ke Streak. Streak menjumlahkannya per hari menurut zona waktu pengguna, membandingkan dengan target, lalu memperbarui streak, kalender, statistik, dan milestone |
| Data | Target harian, zona waktu, catatan aktivitas menulis (tanggal lokal, dokumen, kata ditambahkan, kata dihapus), total harian, panjang streak, milestone yang diraih |
| Berhasil | Total kata hari itu mencapai target sehingga hari ditandai selesai dan streak bertambah satu |
| Gagal atau tepi | Target tidak tercapai sampai pergantian hari sehingga streak putus. Koneksi terputus: aktivitas dikirim ulang setelah tersambung. Salin-tempel teks besar: tunduk pada aturan keaslian aktivitas (bagian 14) |
| Hubungan modul | Sumber data dari Studio; hasilnya tampil di profil Community; kartu pencapaian dibagikan ke media sosial |
| Akses | Setiap pengguna hanya melihat data Streak miliknya. Yang tampil publik di profil hanya bila pengguna memilih menampilkannya (Q-45) |
| Contoh | Dewi menetapkan 300 kata per hari. Ia menulis 320 kata di dokumen "Bab 1". Progres harian menjadi 106 persen, hari ditandai selesai, streak naik dari 6 menjadi 7, dan milestone "7 Hari Berturut-turut" terbuka dengan tombol Bagikan |

### 8.2 Studio, area Menulis

| Aspek | Penjelasan |
| --- | --- |
| Tujuan | Ruang kerja utama untuk menulis, menyimpan, mengedit, dan mengelola seluruh karya, dengan pengalaman yang bersih dan profesional |
| Pengguna | Registered User dan Writer. Premium Member bila ada batas yang berbeda (Q-02) |
| Kit inspirasi dan bantuan | Tab atau drawer bantuan di dalam editor. Isinya kit inspirasi: ide cerita, kalimat pembuka, kamus diksi, pertanyaan refleksi, ide judul, kalimat penutup, dan kamus transisi, ditambah perpustakaan prompt siap salin untuk ChatGPT atau Claude. Tab bantuan juga menjelaskan bagian yang sedang dibuka bila pengguna bingung (rapat 8 November 2026) |
| Fitur dari Penulis+ | Editor, penghitung kata, Blueprint 10 Hari, dan fitur lain dari Penulis+ dibawa ke Studio. Di rapat, founder menyebut word counter dan blueprint dibawa; daftar akhir fitur yang dibawa dikonfirmasi ulang sebelum desain Studio |
| Cara kerja | Pengguna membuat dokumen, menulis dengan pemformatan terbatas (bold, italic, heading, paragraf, blockquote, daftar), dan sistem menyimpan otomatis. Dokumen disusun dalam folder atau digabung menjadi manuskrip. Dari dokumen, pengguna dapat membagikan ke Community, mengirim ke Projects, atau mengekspor |
| Data | Dokumen (isi, judul, folder, tanggal ubah, jumlah kata), folder, manuskrip dan urutan bab, template, status simpan |
| Berhasil | Setiap ketikan tersimpan tanpa tindakan manual; status penyimpanan terlihat; data tidak hilang saat pindah halaman |
| Gagal atau tepi | Internet terputus: perubahan ditahan di perangkat dan disinkronkan ulang. Dokumen diubah di dua perangkat: konflik dideteksi dan pengguna diminta memilih. Dokumen dihapus: masuk ke sampah sebelum hapus permanen (Q-12) |
| Hubungan modul | Mengirim perubahan kata ke Streak; menjadi sumber karya untuk Community; menjadi sumber submission untuk Projects |
| Akses | Dokumen bersifat pribadi. Tidak pernah publik secara otomatis walau dipakai untuk fitur lain |
| Contoh | Raka membuat manuskrip "Arutala" berisi Bab 1 sampai 3, Catatan, dan Riset. Ia mengetik di Bab 2 di kereta; sinyal hilang; status berubah menjadi "Belum tersinkron"; sinyal kembali dan status menjadi "Tersimpan" tanpa kehilangan teks |

### 8.3 Ranah Community

| Aspek | Penjelasan |
| --- | --- |
| Tujuan | Jaringan sosial khusus penulis untuk membagikan gambaran karya yang sedang ditulis, membaca postingan penulis lain, menemukan penulis baru, mendapat apresiasi, dan membangun audiens |
| Pengguna | Guest (membaca konten publik), Registered User dan Writer (berinteraksi dan membuat postingan), Administrator (moderasi dan kurasi) |
| Cara kerja | Di MVP, Community berupa postingan. Penulis menceritakan apa yang sedang ia tulis lewat prolog atau cuplikan karya, yang ditulis langsung atau dipilih dari dokumen Studio, lalu mengaturnya sebagai publik. Sistem membuat **salinan publik** dari teks yang dipilih saja; dokumen pribadi tetap terpisah dan karya penuh tidak dibagikan. Pembaca menemukan postingan lewat Feed dan Discover, lalu memberi Apresiasi, komentar, bookmark, atau mengikuti penulis. Tidak ada pesan langsung (DM) atau chat pribadi di tahap awal. Publikasi karya penuh (tulisan pendek dan panjang), cerita berseri, Highlight, dan kartu tulisan menyusul di Fase 2 (COM-12) |
| Data | Postingan (prolog atau cuplikan, tanggal, status), apresiasi, komentar, bookmark, relasi follow, profil dan portofolio, laporan moderasi. Fase 2 menambah karya penuh, highlight, dan kartu tulisan |
| Berhasil | Postingan tampil di feed dan profil penulis, bisa diapresiasi dan dikomentari, dan tautan postingan bisa dibagikan |
| Gagal atau tepi | Postingan melebihi batas kata ditolak dengan pesan jelas. Komentar dilaporkan: masuk antrean moderasi. Postingan ditarik penulis: hilang dari feed, dengan nasib komentar dan hitungan mengikuti aturan bisnis bagian 14 |
| Hubungan modul | Teks postingan dapat dipilih dari Studio; profil menampilkan data Streak dan hasil Projects (misalnya karya antologi, pemenang lomba) bila pengguna mengizinkan |
| Akses | Konten publik dapat dibaca Guest. Berinteraksi memerlukan akun. Penulis hanya mengubah dan menghapus karya serta komentarnya sendiri |
| Contoh | Sari menulis puisi di Studio, lalu membagikan prolog tiga baris ke Community sebagai postingan publik. Pembaca memberi 48 Apresiasi dan satu komentar. Puisi lengkapnya tetap pribadi sampai karya penuh dibuka di Fase 2 |

### 8.4 Projects

Projects hanya memiliki empat kategori. Alur kerja tiap kategori berbeda, tetapi fondasinya sama: katalog, detail, pendaftaran, pengiriman, status, dan keputusan.

| Aspek | Penjelasan |
| --- | --- |
| Tujuan | Pusat program, kesempatan, dan kegiatan untuk mengembangkan kemampuan menulis, berkolaborasi, berkompetisi, dan menerbitkan buku |
| Pengguna | Writer dan Registered User (peserta); Project Organizer, Editor, Judge/Mentor (pengelola); Administrator |
| Cara kerja bersama | Organizer membuat proyek dalam salah satu dari empat kategori dan mempublikasikannya. Peserta membaca ketentuan, menyetujui syarat hak cipta, mendaftar (dan membayar bila berbayar), lalu mengirim karya atau tugas. Setiap pengiriman menyimpan **versi beku** dari dokumen Studio. Pengelola meninjau, menilai, atau memberi feedback sesuai kategori. Peserta memantau status di dasbornya |
| Data | Proyek, kategori, ketentuan, biaya (per mata uang), kuota, jadwal, pendaftaran, pembayaran, submission dan versinya, penugasan editor atau juri, feedback, penilaian, keputusan, status produksi |
| Berhasil | Peserta mendapat kejelasan status di setiap tahap dan keputusan akhir yang tercatat |
| Gagal atau tepi | Kuota penuh atau deadline lewat: pendaftaran dan pengiriman ditutup. Naskah tidak memenuhi syarat: validasi menolak dengan alasan. Pembayaran belum terkonfirmasi: pendaftaran belum aktif |
| Hubungan modul | Mengambil karya dari Studio; hasil seperti pemenang dan karya terbit dapat tampil di profil Community; mengirim notifikasi |
| Akses | Organizer hanya mengelola proyek yang ditugaskan; Editor hanya submission yang ditugaskan; Judge hanya karya yang ditugaskan |

| Kategori | Untuk siapa dan apa | Ciri khas alur |
| --- | --- | --- |
| Antologi | Beberapa penulis dalam satu buku bertema, contoh "Antologi: Surat yang Tidak Pernah Terkirim" | Seleksi, feedback editor, revisi, persetujuan, lalu penyuntingan, layout, produksi |
| Solo | Penulis menerbitkan satu buku sendiri (novel, puisi, memoar, esai, nonfiksi, kumpulan cerpen) | Paket layanan, pengajuan, editing, proofreading, cover, layout, persetujuan final, produksi, dasbor status |
| Kelas Menulis | Kelas, workshop, pelatihan, dan mentoring (creative writing, puisi, novel, akademik, copywriting, storytelling, esai) | Kurikulum, jadwal, materi, tugas, feedback mentor, progres, sertifikat |
| Lomba | Kompetisi menulis (puisi, cerpen, esai, artikel, microfiction, storytelling) | Deadline, penjurian berkriteria, penilaian anonim opsional, finalis, pemenang, sertifikat |
