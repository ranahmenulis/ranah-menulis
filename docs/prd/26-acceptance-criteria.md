## 26. Acceptance Criteria

Format Given-When-Then agar dapat langsung dipakai QA. Semua kriteria berstatus MVP kecuali disebut lain. Nilai yang masih menunggu keputusan ditandai.

### 26.1 Akun dan hak akses

| ID | Fitur | Kriteria |
| --- | --- | --- |
| AC-01 | PLT-01 | Given pengguna baru, when mendaftar dengan email valid, then akun dibuat dan email verifikasi terkirim; sebelum verifikasi, fitur yang memerlukan akun penuh tidak dapat dipakai |
| AC-02 | PLT-03 | Given Registered User biasa, when mencoba membuka halaman Admin atau Kelola lewat tautan langsung atau permintaan API, then akses ditolak dan tidak ada data yang bocor |
| AC-03 | PLT-03 | Given Editor A yang ditugaskan pada submission X, when meminta submission Y yang bukan miliknya, then sistem menolak permintaan |
| AC-G1 | PLT-03 (Grup Penulis) | Given penulis A anggota grup X dan penulis C bukan anggota, when C meminta tulisan yang A bagikan ke grup X lewat tautan langsung atau API, then akses ditolak; anggota grup X dapat membacanya |
| AC-G2 | PLT-03 (Grup Penulis) | Given admin grup X, when mencoba membaca dokumen anggota yang tidak dibagikan ke grup atau mengubah isi tulisan anggota, then permintaan ditolak |
| AC-G3 | PLT-03 (Grup Penulis) | Given penulis keluar dari grup X, when anggota lain membuka tulisannya, then akses dicabut |
| AC-G4 | PLT-03 (Grup Penulis) | Given Administrator (atau penulis, BR-COM-12) membuat grup X dan menunjuk dua Admin Grup, when keduanya mengelola anggota, then kedua Admin Grup berhasil mengelola grup X dan ditolak saat mencoba mengelola grup lain |
| AC-SA1 | PLT-01, PLT-03 | Given pengguna baru, when mendaftar, then akunnya berperan Registered User dan ia tidak dapat memilih atau memberi dirinya role Administrator atau Super Admin lewat antarmuka maupun API |
| AC-SA2 | PLT-03 | Given Administrator yang bukan Super Admin, when mencoba memberi atau mencabut role Administrator lewat antarmuka atau API, then permintaan ditolak; dan given Super Admin, when memberi role Administrator kepada pengguna, then berhasil dan tercatat di audit log (siapa, kepada siapa, kapan) |
| AC-SA3 | PLT-03 | Given hanya tersisa satu Super Admin aktif, when pencabutan role Super Admin itu dicoba, then permintaan ditolak |
| AC-SA4 | PLT-05 | Given Super Admin atau Administrator, when mencoba mengubah atau menghapus entri audit log, atau membaca dokumen Studio pribadi di luar mekanisme alasan hukum yang tercatat (Q-03), then permintaan ditolak |
| AC-D1 | PLT-10 (sementara, Q-49) | Given Writer yang punya dokumen dan target harian, when membuka Beranda, then blok "Hari ini" tampil di atas feed berisi dokumen terakhir diubah dan progres hari ini; menekan Lanjutkan menulis membuka dokumen itu |
| AC-D2 | PLT-10 (sementara, Q-49) | Given pengguna yang tidak punya butir Perlu perhatian, proyek aktif, maupun notifikasi baru, when membuka Beranda, then blok-blok itu tidak tampil dan feed tetap tampil; dan given satu blok gagal dimuat, then blok lain dan feed tetap tampil |
| AC-D3 | PLT-10 (sementara, Q-49) | Given Guest, when membuka Beranda, then blok "Hari ini" tidak tampil; dan given Editor A, when blok Perlu perhatian dimuat, then hanya submission yang ditugaskan kepada A yang dihitung |
| AC-M1 | Migrasi ke VPS (bagian 19.3) | Given data di Supabase, when diekspor dan dipulihkan ke instans PostgreSQL lain, then skema terbentuk ulang dari berkas migrasi dan uji akses negatif per role lulus |

### 26.2 Studio dan Streak

| ID | Fitur | Kriteria |
| --- | --- | --- |
| AC-04 | STD-02 | Given pengguna mengetik, when berhenti mengetik, then dalam jeda singkat indikator berubah menjadi Tersimpan dan isi dapat dibuka kembali setelah menutup tab |
| AC-05 | STD-02 | Given pengguna kehilangan koneksi saat menulis, when koneksi kembali, then perubahan tersinkron tanpa kehilangan teks dan indikator menunjukkan keadaan yang benar sepanjang proses |
| AC-06 | STD-02 | Given dokumen diubah di dua perangkat, when perangkat kedua menyimpan, then dialog konflik muncul dan tidak ada perubahan yang tertimpa tanpa pilihan pengguna |
| AC-07 | STD-03 | Given folder berisi dokumen, when pengguna memindahkan dokumen ke folder lain, then dokumen muncul hanya di folder tujuan dan hasil pencarian tetap menemukannya |
| AC-08 | STD-04 | Given teks 120 kata, 3 paragraf, then penghitung menampilkan 120 kata, jumlah karakter yang benar, dan 3 paragraf |
| AC-09 | STK-02 | Given dokumen berisi 1.000 kata dan pengguna menambah 50 kata, when disimpan, then catatan Streak bertambah 50, bukan 1.050 |
| AC-10 | STK-02 | Given peristiwa aktivitas dikirim dua kali dengan pengenal yang sama, then hitungan hanya bertambah sekali |
| AC-11 | STK-04 | Given target 300 kata dan pengguna menulis 320 kata hari ini menurut zona waktunya, then hari ditandai selesai dan streak bertambah satu |
| AC-12 | STK-04 | Given pengguna di Kuala Lumpur menulis pukul 23.30 waktunya, then aktivitas dihitung ke tanggal Kuala Lumpur, bukan tanggal UTC |
| AC-13 | STK-04 | Given pengguna tidak memenuhi target sepanjang satu hari penuh, then streak kembali ke nol setelah pergantian hari, dan streak terpanjang tetap |
| AC-32 | STD-12 | Given dokumen dengan versi berusia 4 hari, then versi itu tidak tersedia; versi berusia 2 hari dapat dipulihkan dan pemulihan membuat versi baru |
| AC-33 | STK-08 | Given dokumen dengan dua target, then progres tiap target dihitung dari kata dokumen itu dan tidak mengubah streak |
| AC-34 | BR-STD-07 | Given akun gratis di batas dokumen, when membuat dokumen baru, then ditolak dengan penjelasan dan dokumen lama tetap utuh |
| AC-39 | STD-07 | Given dokumen berisi teks, when pengguna mengekspor ke TXT atau PDF, then berkas terunduh dengan judul sebagai nama berkas dan isi tulisan; given dokumen tanpa teks, then menu Ekspor tidak aktif |

### 26.3 Community

| ID | Fitur | Kriteria |
| --- | --- | --- |
| AC-14 | STD-10, BR-STD-01 | Given dokumen pribadi, when penulis membagikan prolog atau cuplikannya ke Community, then hanya teks yang dipilih terbit sebagai salinan publik dan dokumen asal tetap tidak terlihat publik |
| AC-15 | COM-01 | Given postingan lebih dari 500 kata (batas bila disetujui), when mencoba terbit, then ditolak dengan pesan jelas tanpa kehilangan isi |
| AC-16 | COM-04 | Given pembaca sudah mengapresiasi karya, when mengetuk lagi, then apresiasi ditarik dan hitungan berkurang satu, tidak pernah ganda |
| AC-17 | COM-05 | Given komentar milik orang lain, then pengguna biasa tidak melihat tombol Hapus dan permintaan hapus langsung ditolak |
| AC-18 | COM-09 | Given penulis berprofil negara Malaysia, then karyanya masuk kategori Malaysia Writers di Discover |
| AC-19 | Guest | Given Guest, when membuka karya publik, then dapat membaca; when menekan Apresiasi, then diarahkan masuk lalu kembali ke karya yang sama |
| AC-35 | COM-13 | Given Event dengan peserta, then pengunjung melihat jumlah peserta saja; anggota grup yang sama melihat nama sesama anggota |
| AC-36 | COM-14 | Given anggota grup membagikan progres, then peringatan privasi tampil sebelum dibagikan; keluar dari grup mencabut akses |

### 26.4 Projects

| ID | Fitur | Kriteria |
| --- | --- | --- |
| AC-20 | PRJ-02 | Given proyek dengan ketentuan hak cipta, when peserta mendaftar, then pendaftaran hanya berhasil setelah persetujuan, dan versi ketentuan serta waktunya tersimpan |
| AC-21 | PRJ-02 | Given kuota habis atau deadline lewat, then tombol Daftar dan Kirim tidak aktif dan permintaan langsung ditolak |
| AC-22 | PRJ-04, BR-STD-03 | Given peserta mengirim dokumen, when kemudian mengedit dokumen asal, then versi submission tidak berubah dan editor tetap melihat versi saat dikirim |
| AC-23 | PRJ-04 | Given naskah melebihi batas kata proyek, then pengiriman ditolak dengan alasan dan isian peserta tidak hilang |
| AC-24 | ANT-01 | Given status Perlu Revisi dengan catatan, when peserta mengirim revisi, then versi baru terbentuk, versi lama tersimpan, dan status menjadi Revisi Terkirim lalu Dalam Peninjauan |
| AC-25 | PRJ-04 | Given status Ditolak atau Ditarik, then peserta tidak dapat melewati tahap berikutnya dan setiap perubahan tercatat di log |
| AC-26 | PRJ-03 | Given Organizer A, then ia tidak dapat melihat atau mengubah proyek Organizer B |
| AC-27 | LMB-01, SEC-05 | Given lomba anonim, when juri membuka karya, then nama, username, foto, dan pengenal peserta tidak muncul di tampilan maupun respons API |
| AC-28 | LMB-01 | Given penilaian ditutup, then juri tidak dapat mengubah skor |
| AC-29 | SOL-02 | Given pengajuan Solo yang disetujui, then dasbor penulis menampilkan tahap saat ini dan riwayat tahap dengan tanggal |
| AC-30 | KLS-03 | Given tugas kelas dikumpulkan, then mentor kelas itu menerima notifikasi dan dapat memberi feedback; mentor lain tidak dapat melihatnya |
| AC-31 | KLS-04 | **Fase 2.** Given peserta memenuhi syarat kelulusan, then sertifikat terbit dengan kode verifikasi |
| AC-37 | PRJ-06 | Given proyek gratis, when peserta membatalkan, then pendaftaran dicabut dan kuota kembali; given proyek berbayar, then tombol batal tidak tersedia |
| AC-38 | KLS-05, KLS-06 | Given peserta kelas berjalan, then Lanjutkan membuka materi atau tugas berikutnya dan latihan dapat disalin ke Studio sebagai dokumen baru |
