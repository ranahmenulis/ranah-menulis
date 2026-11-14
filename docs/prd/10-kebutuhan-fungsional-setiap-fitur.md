## 10. Kebutuhan Fungsional Setiap Fitur

Kolom "Pemicu dan perilaku sistem" menjelaskan apa yang terjadi saat pengguna bertindak. Kolom "Data" menyebut data inti yang disimpan. Kolom "Gagal dan kasus tepi" menyebut kondisi tidak normal yang harus ditangani. Batasan akses per role ada di bagian 15.

### 10.1 Kapabilitas platform

| ID | Pemicu dan perilaku sistem | Data | Gagal dan kasus tepi |
| --- | --- | --- | --- |
| PLT-01 | Pengguna mendaftar dengan email dan kata sandi; sistem mengirim email verifikasi; akun aktif penuh setelah verifikasi. Login, logout, dan reset kata sandi tersedia. Setiap akun baru otomatis berperan Registered User; peran lain tidak dapat dipilih saat mendaftar. Metode login sosial: Q-05 | Email, hash kata sandi (dikelola Supabase Auth), status verifikasi, waktu daftar | Email sudah terdaftar; tautan verifikasi kedaluwarsa (kirim ulang); kata sandi lemah ditolak; percobaan login berulang dibatasi |
| PLT-02 | Pengguna melengkapi profil: nama, username unik, foto, bio, negara (Indonesia atau Malaysia), zona waktu, genre. Zona waktu terisi otomatis dari perangkat dan dapat diubah | Profil, username, negara, zona waktu, pengaturan privasi | Username dipakai orang lain; foto melebihi ukuran; perubahan zona waktu memengaruhi perhitungan streak (aturan di bagian 14) |
| PLT-03 | Sistem memeriksa role dan penugasan pada setiap aksi yang dilindungi, di antarmuka maupun di basis data. Role Administrator dan Super Admin hanya dapat diberikan atau dicabut oleh Super Admin. Administrator atau Super Admin membuat grup, mengundang anggota, dan menunjuk Admin Grup (satu grup boleh lebih dari satu Admin Grup; aturan di bagian 15.4) | Role, penugasan per proyek, submission, atau grup | Pengguna tanpa hak mendapat pesan akses ditolak; Administrator yang mencoba memberi role Administrator ditolak; pencabutan Super Admin terakhir ditolak; perubahan role dicatat di audit log |
| PLT-04 | Peristiwa penting (lihat bagian 20) membuat notifikasi dalam aplikasi dan, bila berlaku, email. Pengguna mengatur preferensi | Notifikasi, status baca, preferensi | Email gagal terkirim (coba ulang); notifikasi duplikat dicegah |
| PLT-05 | Administrator mengelola pengguna (di bawah tingkat Administrator), grup, proyek, konten yang dikurasi, dan melihat audit log. Super Admin memiliki semua wewenang itu, ditambah memberi dan mencabut role Administrator dan mengubah pengaturan tingkat sistem | Audit log (siapa, apa, kapan) | Tindakan sensitif memerlukan konfirmasi; tidak ada pengguna, termasuk Super Admin, yang dapat mengubah atau menghapus log |
| PLT-06 | Pengguna melaporkan karya atau komentar; laporan masuk antrean; admin memutuskan (abaikan, sembunyikan, hapus, tindak pada akun) | Laporan, alasan, status, keputusan | Laporan ganda pada konten sama digabung; pelapor tidak terlihat oleh pihak terlapor |
| PLT-07 | Halaman proyek menampilkan biaya per mata uang. Peserta membayar lewat QRIS dan sistem mengonfirmasi lewat webhook; bila konfirmasi otomatis belum tersedia, peserta mengirim bukti dan Organizer atau Administrator mengonfirmasi. Setelah itu pendaftaran menjadi aktif | Biaya, mata uang, status pembayaran, bukti | Bukti ditolak; kuota habis sebelum konfirmasi (aturan penahanan kuota: Q-20) |
| PLT-10 | **Sementara, ditinjau ulang setelah desain (Q-49).** Pengguna yang masuk melihat blok "Hari ini" di atas feed Beranda, berurutan: Lanjutkan menulis (dokumen yang terakhir diubah, tombol membukanya); Progres hari ini (kata hari ini terhadap target dan streak, tautan ke Dasbor Streak); Perlu perhatian (paling banyak tiga butir: Perlu Revisi, pembayaran menunggu konfirmasi dengan sisa waktu penahanan kuota, tugas kelas mendekati deadline, undangan grup; untuk Organizer, Editor, Judge, Mentor, dan Administrator berisi pekerjaan yang menunggu mereka); Proyek saya (satu sampai dua pendaftaran aktif beserta status dan deadline berikutnya); Notifikasi baru. Blok tanpa isi tidak ditampilkan. Pengguna baru melihat tiga langkah awal: lengkapi profil, tetapkan target harian, tulis dokumen pertama; langkah hilang setelah selesai. Guest tidak melihat blok ini | Tidak ada data baru; dibaca dari Studio, Streak, Projects, dan notifikasi milik pengguna sendiri | Satu blok gagal dimuat tidak mematikan blok lain maupun feed; pemegang beberapa peran melihat butir gabungan paling banyak tiga dengan tautan ke Kelola atau Admin; belum ada target harian: ajakan menetapkan target |

### 10.2 Studio, area Streak

| ID | Pemicu dan perilaku sistem | Data | Gagal dan kasus tepi |
| --- | --- | --- | --- |
| STK-01 | Pengguna menetapkan target kata harian (angka bulat positif). Perubahan target berlaku mulai hari berikutnya agar hari berjalan tidak berubah di tengah hari (Q-07). Batas minimum dan maksimum target: Q-07 | Target, tanggal berlaku | Input bukan angka atau di luar batas ditolak |
| STK-02 | Saat Studio menyimpan perubahan, ia mengirim peristiwa aktivitas berisi dokumen, kata ditambahkan, kata dihapus, dan waktu. Streak menambahkan ke total harian menurut tanggal lokal pengguna. Sistem tidak menghitung ulang seluruh isi dokumen | Catatan aktivitas (tanggal lokal, dokumen, delta), total harian | Peristiwa ganda saat pengiriman ulang diabaikan (idempotensi); tempel teks besar diperlakukan sesuai aturan keaslian aktivitas |
| STK-03 | Kalender bulanan menandai hari: target tercapai, ada tulisan tetapi belum capai target, tidak ada aktivitas. Mengetuk hari menampilkan rincian kata | Total harian, status hari | Bulan tanpa data tampil kosong dengan ajakan menulis |
| STK-04 | Hari dihitung memenuhi syarat bila total kata bersih hari itu mencapai target. Streak adalah jumlah hari memenuhi syarat berturut-turut menurut zona waktu pengguna. Hari berjalan belum memutus streak sampai pergantian hari | Streak saat ini, streak terpanjang, tanggal terakhir memenuhi syarat | Pergantian zona waktu; aktivitas terkirim terlambat dari mode offline (dihitung ke tanggal saat menulis, dalam batas toleransi yang ditetapkan (Q-09)) |
| STK-05 | Halaman statistik menampilkan kata per hari, minggu, dan bulan, rata-rata, hari terbaik, dan perbandingan dengan target | Agregat dari catatan aktivitas | Data belum cukup tampil sebagai keadaan kosong |
| STK-06 | Milestone dibuka otomatis bila syarat terpenuhi (contoh: streak 7 hari, total 10.000 kata). Daftar milestone dan syaratnya ditetapkan produk (Q-10) | Definisi milestone, milestone pengguna, tanggal diraih | Milestone dibuka dua kali dicegah |
| STK-07 | Pengguna membuat kartu pencapaian (gambar) dengan nama dan milestone, lalu membagikannya ke Instagram, Threads, atau WhatsApp | Gambar kartu, tautan | Pembagian dibatalkan; ukuran gambar per platform |

### 10.3 Studio, area Menulis

| ID | Pemicu dan perilaku sistem | Data | Gagal dan kasus tepi |
| --- | --- | --- | --- |
| STD-01 | Pengguna membuat dokumen baru (kosong atau dari template) dan menulis. Pemformatan terbatas pada bold, italic, heading, paragraf, blockquote, bullet list, dan numbered list. Tidak ada fitur gaya Word yang kompleks | Dokumen (judul, isi terstruktur, folder, tanggal buat dan ubah) | Tempel teks berformat luar dibersihkan ke format yang didukung |
| STD-02 | Perubahan disimpan otomatis setelah jeda mengetik singkat. Indikator menampilkan Menyimpan, Tersimpan, atau Belum tersinkron. Saat offline, perubahan ditahan di perangkat dan dikirim ulang. Bila dokumen berubah di tempat lain, sistem mendeteksi konflik dan meminta pengguna memilih versi atau menggabungkan | Isi dokumen, nomor versi, waktu simpan terakhir | Pindah halaman saat menyimpan tidak boleh kehilangan data; konflik tidak boleh menimpa diam-diam; kapasitas penyimpanan penuh: Q-12 |
| STD-03 | Pengguna membuat, mengganti nama, memindahkan, dan menghapus dokumen dan folder; mencari berdasarkan judul dan isi; mengurutkan berdasarkan nama atau tanggal ubah. Penghapusan memindahkan ke Sampah dengan masa pemulihan (Q-12) | Dokumen, folder, hierarki, status hapus | Nama ganda diizinkan atau tidak: Q-12; menghapus folder berisi dokumen meminta konfirmasi |
| STD-04 | Penghitung menampilkan jumlah kata, karakter, dan paragraf, diperbarui saat mengetik; juga untuk bagian yang dipilih. Penghitung kata ini juga dasar delta untuk Streak | Jumlah kata dan karakter tersimpan di dokumen | Aturan menghitung kata untuk bahasa Indonesia dan Melayu (pemisah spasi, tanda hubung) harus konsisten antara tampilan dan Streak |
| STD-05 | Template (puisi, cerpen, novel, esai, artikel, jurnal, memoar) menyediakan struktur awal. Template dikelola Administrator | Template, kategori | Template tidak boleh mengubah dokumen yang sudah dibuat |
| STD-06 | Pengguna membuat manuskrip (misalnya "Arutala") yang berisi dokumen terurut sebagai Bab 1, Bab 2, Bab 3, ditambah Catatan dan Riset. Total kata manuskrip dihitung dari bab. Catatan dan Riset tidak ikut ekspor atau submission kecuali dipilih | Manuskrip, anggota dan urutan, jenis anggota (bab, catatan, riset) | Dokumen yang sama masuk dua manuskrip: Q-11; menghapus dokumen yang menjadi bab meminta konfirmasi |
| STD-07 dan STD-08 | Pengguna mengekspor dokumen atau manuskrip ke TXT, PDF (MVP), dan DOCX (Fase 2). Berkas dibuat di server dan diunduh | Berkas ekspor sementara | Dokumen besar memakan waktu: tampilkan progres; format tidak didukung sepenuhnya ditandai |
| STD-09 | Dari halaman proyek, peserta memilih dokumen atau manuskrip. Sistem membuat **versi submission** (salinan beku) lalu menautkannya ke pendaftaran. Mengedit dokumen asli tidak mengubah versi itu. Detail alur di 10.5 | Versi submission (isi, hash, waktu), tautan ke dokumen asal | Dokumen kosong atau di luar batas kata ditolak validasi |
| STD-10 | Dari dokumen, pengguna memilih bagian (prolog atau cuplikan) untuk dibagikan ke Community. Sistem membuat postingan (salinan publik dari bagian yang dipilih) setelah pengguna memeriksa pratinjau dan mengaturnya sebagai publik. Dokumen pribadi tetap pribadi | Karya komunitas, tautan ke dokumen asal | Mengedit dokumen asal tidak otomatis memperbarui karya publik; pembaruan harus disengaja (Q-16) |
| STD-11 | Di editor tersedia tab atau drawer bantuan berisi kit inspirasi (ide cerita, kalimat pembuka, kamus diksi, pertanyaan refleksi, ide judul, kalimat penutup, kamus transisi) dan perpustakaan prompt dengan tombol salin. Tab bantuan menjelaskan bagian yang sedang dibuka | Konten kit (statis), favorit pengguna | Konten kit tidak memanggil model AI |

### 10.4 Ranah Community

| ID | Pemicu dan perilaku sistem | Data | Gagal dan kasus tepi |
| --- | --- | --- | --- |
| COM-01 | Penulis menulis prolog atau memilih cuplikan dari dokumen Studio, memberi judul dan genre, mengaturnya sebagai publik, lalu terbitkan. Postingan dibatasi 500 kata (usulan, Q-14). Hanya teks yang dipilih yang menjadi publik | Postingan (isi, genre, status, tanggal terbit, tautan opsional ke dokumen asal) | Melebihi batas: pesan jelas dan isi tidak hilang; draf dapat disimpan sebelum terbit; teks yang dipilih dari dokumen tidak mengubah dokumen asal |
| COM-02 | Penulis membuat seri dan menambahkan bab berurutan yang terhubung. Pembaca dapat membaca berurutan dan mengikuti seri | Seri, bab, urutan | Menghapus bab di tengah seri: Q-15 |
| COM-03 | Feed menampilkan postingan dengan nama penulis, username, foto, isi, tanggal terbit, jumlah Apresiasi, komentar, dan bookmark. Sumber feed: penulis yang diikuti dan rekomendasi dasar (Q-17) | Postingan, agregat interaksi | Feed kosong untuk pengguna baru diarahkan ke Discover; pemuatan bertahap (infinite scroll atau halaman) |
| COM-04 | Pengguna memberi atau menarik Apresiasi pada karya. Satu pengguna satu Apresiasi per karya. Penulis menerima notifikasi | Apresiasi (pengguna, karya, waktu) | Ketuk ganda tidak membuat duplikat; apresiasi pada karya sendiri: Q-18 |
| COM-05 | Pengguna menulis komentar, membalas komentar, menghapus komentar sendiri, dan melaporkan komentar. Penulis karya dapat menyembunyikan atau menghapus komentar di karyanya (Q-16) | Komentar (induk, penulis, isi, status) | Komentar kosong atau terlalu panjang ditolak; balasan pada komentar yang dihapus mengikuti aturan bisnis |
| COM-06 | Pengguna menyimpan karya ke daftar Bookmark pribadi dan membukanya kembali. Bookmark bersifat pribadi | Bookmark | Karya yang ditarik muncul sebagai tidak tersedia |
| COM-07 | Pembaca memilih sepotong teks dalam karya dan menandainya sebagai Highlight ("This Line Hit Me"). Karya menampilkan Highlight paling banyak dipilih. Highlight dapat menjadi sumber kartu tulisan | Highlight (karya, rentang teks, pengguna) | Karya diedit setelah ada Highlight: rentang harus tetap valid atau ditandai usang |
| COM-08 | Pengguna mengikuti dan berhenti mengikuti penulis; jumlah followers dan following tampil di profil | Relasi follow | Tidak bisa mengikuti diri sendiri |
| COM-09 | Discover menampilkan kategori: Trending Today, New Writers, Editor's Picks, Most Appreciated, Most Saved, Hidden Gems, Indonesia Writers, Malaysia Writers. Editor's Picks dikurasi manual. Aturan pemeringkatan kategori lain ditetapkan di bagian 14 | Agregat interaksi, kurasi | Kategori tanpa konten disembunyikan; algoritma rekomendasi kompleks ditunda |
| COM-10 | Profil publik berisi nama, username, foto, bio, negara, genre, portofolio, karya terbit, followers, following. Pengguna mengatur apa yang tampil | Profil, portofolio | Akun dinonaktifkan: profil tidak tampil |
| COM-11 | Penulis memilih bagian teks dari karyanya, memilih tampilan kartu, dan mengunduh atau membagikan gambar ke Instagram, Threads, atau WhatsApp. Kartu memuat nama penulis dan tautan karya asli | Kartu (teks terpilih, gaya, tautan) | Teks terlalu panjang untuk kartu dibatasi; karya asli ditarik: tautan menuju halaman tidak tersedia |
| COM-12 | Penulis memilih dokumen, jenis (pendek atau panjang), judul, genre, dan menerbitkan karya penuh sebagai salinan publik. Batas kata tulisan pendek dan tulisan panjang ditetapkan saat fitur ini dikerjakan (Q-14). Muncul di Fase 2 | Karya (jenis, isi, genre, status, tanggal terbit) | Melebihi batas: pesan jelas dan saran mengubah jenis; draf dapat disimpan sebelum terbit |

### 10.5 Projects: fondasi bersama empat kategori

| ID | Pemicu dan perilaku sistem | Data | Gagal dan kasus tepi |
| --- | --- | --- | --- |
| PRJ-01 | Daftar proyek dapat disaring berdasarkan kategori, status (buka, segera tutup, ditutup), dan biaya. Halaman detail menampilkan tema atau deskripsi, persyaratan, biaya per mata uang, kuota dan sisa kuota, jadwal dan deadline, pengelola, dan tombol aksi yang sesuai status | Proyek, kategori, ketentuan, biaya, kuota, jadwal, status publikasi | Proyek draf tidak tampil bagi publik; proyek ditutup tetap dapat dibaca; Guest diminta masuk saat menekan Daftar |
| PRJ-02 | Sebelum mendaftar, peserta membaca dan **wajib menyetujui** ketentuan penggunaan dan publikasi karya serta pernyataan hak cipta. Sistem menyimpan versi ketentuan yang disetujui dan waktunya. Bila berbayar, peserta melihat biaya dan menyelesaikan pembayaran (PLT-07). Pendaftaran aktif bila syarat terpenuhi | Pendaftaran (peserta, proyek, status), persetujuan (versi ketentuan, waktu), pembayaran | Kuota penuh; deadline lewat; peserta sudah terdaftar; peserta tidak memenuhi syarat (misalnya negara bila dibatasi (Q-29)) |
| PRJ-03 | Organizer membuat proyek (kategori, judul, deskripsi, ketentuan, biaya, kuota, jadwal), menugaskan Editor atau Judge/Mentor, mempublikasikan, menutup, dan melihat daftar peserta serta submission | Proyek, penugasan, jadwal | Organizer hanya mengakses proyek miliknya; proyek yang sudah punya peserta tidak dapat dihapus, hanya diarsipkan; perubahan ketentuan setelah ada peserta memerlukan pemberitahuan |
| PRJ-04 | Alur pengiriman karya (rinci di bawah) | Submission, versi, status | Lihat tabel status |
| PRJ-05 | Pembeli memesan buku terbit melalui halaman buku; sistem menyimpan pesanan dan statusnya | Pesanan | Ditunda ke Fase 3; model penjualan (cetak, pre-order, pengiriman) (Q-25) |

**Alur pengiriman karya (berlaku untuk Antologi, Solo, dan Lomba).**

1. **Memilih proyek.** Peserta membuka detail proyek dan menekan Kirim Karya. Syarat: sudah terdaftar dan aktif, sebelum deadline.
2. **Mengisi informasi.** Peserta mengisi judul karya, genre atau kategori, ringkasan atau catatan untuk editor, dan pernyataan keaslian karya. Isian tambahan mengikuti proyek.
3. **Memilih naskah.** Peserta memilih dokumen atau manuskrip dari Studio, atau (bila proyek mengizinkan) mengunggah berkas (Q-13).
4. **Validasi.** Sistem memeriksa jumlah kata terhadap batas proyek, kelengkapan isian, deadline, dan batas jumlah karya per peserta. Kegagalan ditampilkan per aturan, tanpa menghapus isian.
5. **Mengirim.** Sistem membuat versi submission beku (isi, jumlah kata, hash, waktu) dan menetapkan status Terkirim. Peserta menerima konfirmasi.
6. **Peninjauan.** Editor yang ditugaskan (Antologi) atau Judge (Lomba) melihat submission. Editor mencatat feedback dan keputusan sementara.
7. **Revisi (Antologi).** Bila perlu, status menjadi Perlu Revisi. Peserta mengedit di Studio dan mengirim ulang; sistem membuat versi baru, versi lama tetap tersimpan.
8. **Keputusan akhir.** Editor atau Organizer menetapkan Diterima atau Ditolak, disertai alasan. Peserta diberi tahu.
9. **Lanjutan.** Karya yang Diterima masuk ke tahap produksi (ANT-02) atau, pada Lomba, ke pengumuman.

| Status submission | Arti | Siapa yang mengubah | Berikutnya |
| --- | --- | --- | --- |
| Draf | Peserta mengisi tetapi belum mengirim | Peserta | Terkirim |
| Terkirim | Versi beku dibuat dan menunggu peninjau | Sistem | Dalam Peninjauan, Ditarik |
| Dalam Peninjauan | Editor atau Judge sedang menilai | Editor, Judge | Perlu Revisi, Diterima, Ditolak |
| Perlu Revisi | Editor meminta perbaikan dengan catatan | Editor | Revisi Terkirim, Ditarik |
| Revisi Terkirim | Peserta mengirim versi baru | Sistem | Dalam Peninjauan |
| Diterima | Karya lolos | Editor, Organizer | Produksi (Antologi) atau final (Lomba) |
| Ditolak | Karya tidak lolos | Editor, Organizer | Selesai |
| Ditarik | Peserta mencabut karya sebelum keputusan | Peserta | Selesai |

Aturan: perubahan status dicatat dengan siapa, kapan, dan alasan; peserta tidak dapat melewati tahap; setelah deadline pengiriman, hanya revisi yang diminta editor yang diperbolehkan. Batas jumlah putaran revisi dan masa revisi: Q-22.

### 10.6 Projects: Antologi, Solo, Kelas Menulis, Lomba

| ID | Pemicu dan perilaku sistem | Data | Gagal dan kasus tepi |
| --- | --- | --- | --- |
| ANT-01 | Editor yang ditugaskan membuka antrean submission, membaca versi beku, mengisi feedback, dan memilih Perlu Revisi, Diterima, atau Ditolak. Persetujuan karya menyimpan versi yang disetujui sebagai naskah final peserta | Feedback, keputusan, versi yang disetujui | Editor tidak dapat melihat submission di luar penugasan; dua editor memberi keputusan berbeda: aturan penengah (Q-23) |
| ANT-02 | Organizer memperbarui tahap pasca-penerimaan: penyuntingan, desain dan layout, produksi, terbit, dengan catatan dan tanggal. Peserta melihat tahap saat ini di dasbornya. Pelacakan manual pada MVP | Tahap, tanggal, catatan | Tahap mundur harus disertai alasan; informasi pemesanan buku: Fase 3 |
| SOL-01 | Daftar paket menampilkan layanan, harga per mata uang, dan persyaratan naskah. Penulis memilih paket, mengisi pengajuan (jenis buku, sinopsis, jumlah kata, naskah dari Studio), lalu mengirim. Tim penerbitan meninjau kelayakan dan menyetujui atau meminta perbaikan | Paket, pengajuan, naskah, status | Naskah di bawah atau di atas batas paket; pengajuan ditolak dengan alasan; ketentuan hak cipta wajib disetujui |
| SOL-02 | Dasbor Solo menampilkan tahap: pengajuan, editing, proofreading, desain cover, layout, persetujuan final, produksi, selesai. Pada persetujuan final, penulis menyetujui atau meminta perubahan | Tahap, tanggal, berkas pratinjau (cover, layout), persetujuan | Berkas pratinjau besar; persetujuan final tidak dapat dibatalkan setelah produksi dimulai (Q-24) |
| KLS-01 | Halaman kelas menampilkan profil pengajar, kurikulum (modul dan pertemuan), materi, jadwal, biaya, dan kuota. Format kelas (langsung, rekaman, campuran): Q-26 | Kelas, modul, materi, jadwal, pengajar | Jadwal bentrok; materi hanya dapat dibuka peserta terdaftar |
| KLS-02 | Setelah mendaftar, peserta masuk dasbor kelas: jadwal berikutnya, materi, tugas, feedback, dan bilah progres (persentase modul dan tugas selesai) | Pendaftaran, progres | Progres dihitung dari tugas dan materi yang ditandai selesai |
| KLS-03 | Mentor membuat tugas dengan deadline; peserta mengumpulkan tulisan dari Studio (versi beku) atau teks langsung; mentor memberi feedback dan status (selesai atau perlu perbaikan) | Tugas, pengumpulan, feedback | Pengumpulan terlambat: aturan (Q-27); mentor hanya melihat peserta kelasnya |
| KLS-04 | Peserta yang memenuhi syarat kelulusan menerima sertifikat dengan nama, kelas, tanggal, dan kode verifikasi | Sertifikat | Syarat kelulusan (Q-27); nama pada sertifikat dapat diperbaiki sekali oleh peserta |
| LMB-01 | Admin atau Organizer menetapkan kriteria dan bobot. Juri yang ditugaskan menilai tiap karya per kriteria dan memberi catatan. Bila lomba anonim, nama dan profil peserta disembunyikan dari juri sampai penilaian ditutup. Skor digabung menurut aturan (rata-rata atau lainnya (Q-28)) | Kriteria, bobot, penugasan, skor, catatan | Juri tidak dapat mengubah skor setelah penilaian ditutup; konflik kepentingan (juri mengenal peserta): Q-28; karya anonim tidak boleh memuat identitas di isi karya |
| LMB-02 | Organizer menetapkan finalis lalu pemenang berdasarkan hasil; pengumuman dipublikasikan di halaman lomba dan notifikasi dikirim ke peserta | Finalis, pemenang, peringkat, tanggal umum | Hasil seri; pengumuman tidak dapat diubah tanpa catatan audit |
| LMB-03 | Sertifikat peserta, finalis, dan pemenang dibuat dengan format yang berbeda | Sertifikat | Fase 2 |
