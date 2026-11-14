## 14. Business Rules

Aturan bertanda **Usulan** adalah rekomendasi untuk dikonfirmasi. Aturan tanpa tanda diturunkan langsung dari brief founder.

### 14.1 Studio, area Streak: penghitungan kata

| ID | Aturan |
| --- | --- |
| BR-STK-01 | Aktivitas yang dicatat adalah **perubahan kata bersih** yang terjadi di Studio, bukan jumlah total kata dokumen. Sistem tidak menghitung ulang seluruh dokumen berulang kali |
| BR-STK-02 | Setiap peristiwa aktivitas memiliki pengenal unik sehingga pengiriman ulang tidak menggandakan hitungan |
| BR-STK-03 | Hari memenuhi syarat streak bila total kata bersih hari itu mencapai target harian pengguna. **Usulan** (alternatif: minimal satu kata, atau ambang tetap untuk semua pengguna) |
| BR-STK-04 | Total kata bersih harian = kata ditambahkan di hari itu dikurangi kata dihapus pada teks yang ditulis hari itu, dan tidak pernah di bawah nol. Menghapus tulisan lama tidak mengurangi progres. **Usulan** |
| BR-STK-05 | Tulisan yang ditempel dalam jumlah besar sekaligus tidak dihitung penuh. Ambang dan perilaku tepatnya ditetapkan founder (contoh: kata hasil tempel di atas ambang tertentu tidak dihitung). (Q-08) |
| BR-STK-06 | Hari ditentukan oleh zona waktu di profil pengguna; hari berganti pukul 00.00 waktu lokal. Perubahan zona waktu hanya berlaku ke depan dan tidak mengubah hari yang sudah lewat. **Usulan** |
| BR-STK-07 | Streak putus bila satu hari penuh berakhir tanpa memenuhi syarat. Mekanisme pemulihan (misalnya hari libur atau freeze) tidak ada di MVP. (Q-09) |
| BR-STK-08 | Aktivitas di dokumen yang kemudian dihapus tetap dihitung untuk hari itu. **Usulan** |
| BR-STK-09 | Data streak bersifat pribadi. Menampilkannya di profil adalah pilihan pengguna |

### 14.2 Studio, area Menulis: keterkaitan dokumen

| ID | Aturan |
| --- | --- |
| BR-STD-01 | Dokumen selalu pribadi. Membagikan ke Community atau mengirim ke Projects tidak mengubah visibilitas dokumen asal |
| BR-STD-02 | Karya di Community adalah salinan terpisah dari dokumen. Mengedit dokumen tidak mengubah karya publik kecuali penulis memperbaruinya dengan sengaja |
| BR-STD-03 | Pengiriman ke Projects membuat **versi submission beku** yang tidak berubah walau dokumen asal diedit. Revisi membuat versi baru; versi lama tetap tersimpan |
| BR-STD-04 | Konflik penyimpanan tidak pernah diselesaikan dengan menimpa diam-diam; pengguna selalu diberi pilihan |
| BR-STD-05 | Hanya pemilik yang dapat membaca dan mengubah dokumen. Administrator dan Super Admin tidak membaca dokumen pribadi kecuali ada alasan hukum atau moderasi yang dicatat (Q-03) |

### 14.3 Community

| ID | Aturan |
| --- | --- |
| BR-COM-01 | Di MVP penulis hanya membagikan prolog atau cuplikan karya, bukan karya penuh. Postingan baru terlihat publik setelah penulis mengaturnya publik secara eksplisit. Batas postingan 500 kata (usulan, Q-14). Karya penuh dan batas atas tulisan panjang diputuskan di Fase 2 (COM-12, Q-14) |
| BR-COM-02 | Satu pengguna hanya dapat memberi satu Apresiasi per karya; dapat ditarik kembali |
| BR-COM-03 | Pengguna hanya dapat menghapus komentar sendiri; penulis karya dapat menyembunyikan komentar di karyanya (Q-16); admin dapat menghapus komentar yang melanggar |
| BR-COM-04 | Penulis dapat menarik karyanya kapan saja. Karya yang ditarik hilang dari feed dan Discover; komentar dan apresiasi disimpan tersembunyi agar dapat dipulihkan jika karya diterbitkan kembali. **Usulan** |
| BR-COM-05 | Editor's Picks dipilih manual oleh tim. Trending Today, Most Appreciated, Most Saved, New Writers, dan Hidden Gems ditentukan oleh aturan sederhana yang disepakati (contoh: jumlah interaksi dalam periode tertentu, penulis dengan karya pertama, karya berapresiasi rendah tetapi dibaca dan disimpan). Rumus tepatnya (Q-17) |
| BR-COM-06 | Indonesia Writers dan Malaysia Writers ditentukan oleh negara di profil penulis |
| BR-COM-07 | Pengguna mengakui karya yang diterbitkan adalah miliknya atau ia berhak menerbitkannya; pelanggaran hak cipta ditangani lewat prosedur laporan dan penurunan konten |
| BR-COM-08 | Kartu tulisan wajib memuat nama penulis dan tautan karya asli; hanya penulis yang dapat membuat kartu dari karyanya, atau pembaca dari Highlight dengan atribusi penuh (Q-15) |

### 14.4 Projects, submission, dan hak cipta

| ID | Aturan |
| --- | --- |
| BR-PRJ-01 | Hanya empat kategori proyek: Antologi, Solo, Kelas Menulis, Lomba. Kategori baru memerlukan persetujuan founder |
| BR-PRJ-02 | Sebelum mendaftar, peserta wajib menyetujui ketentuan penggunaan dan publikasi karya. Persetujuan disimpan beserta versi ketentuan dan waktunya |
| BR-PRJ-03 | **Hak cipta karya tetap pada penulis** kecuali ketentuan proyek yang disetujui menyatakan lain secara eksplisit dan terbaca sebelum mendaftar. Isi ketentuan baku (hak terbit, jangka waktu, eksklusivitas, royalti): Q-21 dan perlu tinjauan hukum |
| BR-PRJ-04 | Pendaftaran dan pengiriman ditutup saat kuota penuh atau deadline lewat. Zona waktu deadline adalah zona waktu proyek yang ditampilkan jelas; zona waktu proyek ditetapkan oleh Organizer (Q-29) |
| BR-PRJ-05 | Status submission hanya berubah mengikuti tabel transisi di 10.5; setiap perubahan dicatat |
| BR-PRJ-06 | Organizer hanya mengelola proyeknya; Editor hanya submission yang ditugaskan; Judge hanya karya yang ditugaskan |
| BR-PRJ-07 | Proyek yang sudah memiliki pendaftar tidak dihapus, hanya diarsipkan |
| BR-PRJ-08 | Pada lomba anonim, identitas peserta disembunyikan dari juri selama penilaian. Siapa yang masih dapat melihat identitas (Organizer, Admin): Q-28 |
| BR-PRJ-09 | Juri tidak dapat mengubah skor setelah penilaian ditutup; pembukaan kembali hanya oleh Administrator dengan catatan audit |
| BR-PRJ-10 | Biaya disimpan per mata uang dalam satuan terkecil. Harga di IDR dan MYR ditetapkan terpisah, bukan dikonversi otomatis |
| BR-PRJ-11 | Kebijakan pengembalian dana saat peserta mundur atau proyek dibatalkan: Q-30 |
| BR-PRJ-12 | Karya Diterima pada Antologi tidak dipublikasikan ke Community atau tempat lain oleh pengelola tanpa persetujuan penulis sesuai ketentuan proyek |
