## 15. Sistem Role dan Permission

Sistem memakai Role-Based Access Control. Hak diberikan lewat dua lapis: **role dasar** yang melekat pada akun, dan **penugasan terbatas** pada proyek, submission, grup, atau lomba tertentu. Setiap akun baru berperan Registered User; hak yang lebih tinggi hanya diberikan oleh pihak berwenang, tidak dipilih sendiri oleh pengguna. Hak tertinggi (Super Admin) dipegang oleh sedikit orang tepercaya. Tidak ada pengguna biasa yang memegang hak administratif, dan setiap pemeriksaan hak dilakukan di sisi server atau basis data, tidak hanya di antarmuka.

### 15.1 Daftar role

| Role | Jenis | Cakupan wewenang |
| --- | --- | --- |
| Guest | Tanpa akun | Melihat konten publik: karya terbit, profil publik, daftar dan detail proyek, Discover |
| Registered User | Role dasar | Seperti Guest, ditambah menulis di Studio, berinteraksi (apresiasi, komentar, bookmark, follow), mengelola profil dan Streak. Role awal setiap akun baru |
| Writer | Role dasar | Seperti Registered User, ditambah menerbitkan karya, mengelola portofolio, mendaftar dan mengirim karya ke Projects |
| Anggota Grup | Keanggotaan per grup | Melihat tulisan sesama anggota sesuai aturan visibilitas (Q-38) dan berinteraksi di dalam grup; tidak dapat mengubah tulisan anggota lain |
| Admin Grup | Penugasan per grup | Mengelola anggota dan pengaturan grup yang menjadi tanggung jawabnya; satu grup boleh memiliki lebih dari satu Admin Grup. Tidak punya wewenang administratif platform dan tidak dapat membaca dokumen yang tidak dibagikan ke grup |
| Premium Member | Status langganan | Manfaat Premium (Q-02). Tidak mengubah wewenang administratif |
| Project Organizer | Penugasan per proyek | Membuat dan mengelola hanya proyek yang menjadi tanggung jawabnya |
| Editor | Penugasan per submission | Mengakses dan meninjau hanya submission yang ditugaskan |
| Judge/Mentor | Penugasan per lomba atau kelas | Judge menilai hanya karya yang ditugaskan; Mentor memberi feedback hanya pada peserta kelasnya |
| Administrator | Role platform, diberikan oleh Super Admin | Mengelola pengguna (di bawah tingkat Administrator), moderasi, kurasi, proyek, dan grup (membuat grup, mengundang anggota, menunjuk Admin Grup), serta membaca audit log. Tidak dapat memberi atau mencabut role Administrator dan tidak dapat mengubah pengaturan tingkat sistem. Batas wewenang rinci: Q-03 |
| Super Admin | Role platform tertinggi (root), dibuat lewat penyiapan awal | Semua wewenang Administrator, ditambah memberi dan mencabut role Administrator (dan Super Admin lain) serta mengubah pengaturan tingkat sistem. Tidak membaca dokumen pribadi penulis kecuali atas alasan hukum yang tercatat, dan tidak dapat mengubah atau menghapus audit log (Q-03) |

Perbedaan Registered User dan Writer, dan cara seseorang menjadi Writer (otomatis saat menerbitkan, atau pilihan di profil), belum ditetapkan dan tercantum di bagian 28.

### 15.2 Matriks izin (usulan)

K = Kelola semua (buat, ubah, hapus), M = hanya milik sendiri, T = hanya yang ditugaskan, B = baca, - = tidak ada akses.

| Sumber daya | Guest | Registered User | Writer | Organizer | Editor | Judge/Mentor | Admin | Super Admin |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Karya publik di Community | B | B | B, M | B | B | B | K | K |
| Dokumen Studio | - | M | M | - | - | - | - | - |
| Data Streak | - | M | M | - | - | - | - | - |
| Apresiasi, komentar, bookmark, follow | - | M | M | - | - | - | K moderasi | K moderasi |
| Menerbitkan karya ke Community | - | - (Q-01) | M | - | - | - | K | K |
| Daftar dan detail proyek (publik) | B | B | B | B, M proyek sendiri | B | B | K | K |
| Pendaftaran dan submission peserta | - | - (Q-01) | M | B proyeknya | T | T | B | B |
| Membuat dan mengubah proyek | - | - | - | M proyek sendiri | - | - | K | K |
| Feedback dan keputusan submission | - | - | B milik sendiri | T (atas proyeknya) | T | - | K | K |
| Penilaian lomba | - | - | - | B hasil | - | T | K | K |
| Feedback tugas kelas | - | - | B milik sendiri | - | - | T | K | K |
| Identitas peserta lomba anonim | - | - | - | (Q-28) | - | - | (Q-28) | (Q-28) |
| Pengguna dan role (selain Administrator dan Super Admin) | - | - | - | - | - | - | K | K |
| Role Administrator dan Super Admin | - | - | - | - | - | - | - | K |
| Grup Penulis (buat grup, undang anggota, tunjuk Admin Grup) | - | - | - | - | - | - | K | K |
| Pengaturan tingkat sistem | - | - | - | - | - | - | - | K |
| Laporan moderasi | - | kirim | kirim | - | - | - | K | K |
| Audit log | - | - | - | - | - | - | B | B |

Wewenang Anggota Grup dan Admin Grup tidak ada di matriks ini karena berlaku per grup; aturannya ada di bagian 15.4.

### 15.3 Prinsip penerapan

- Satu orang dapat memegang beberapa penugasan (misalnya Writer sekaligus Editor di proyek lain); sistem memeriksa hak per sumber daya, bukan hanya per akun.
- Setiap akun baru berperan Registered User. Role Administrator dan Super Admin hanya dapat diberikan atau dicabut oleh Super Admin. Penugasan lain (Editor, Judge, Mentor, Organizer, Admin Grup) dapat dilakukan Administrator atau Super Admin, dan oleh Organizer untuk penugasan di proyeknya (Q-04). Semua pemberian dan pencabutan dicatat di audit log.
- Super Admin pertama dibuat lewat penyiapan awal oleh tim teknis, bukan lewat pendaftaran. Sistem selalu menyisakan minimal satu Super Admin aktif; pencabutan Super Admin terakhir ditolak. Jumlah Super Admin dibatasi pada sesedikit mungkin orang tepercaya.
- Wewenang "akses semua" milik Super Admin berlaku untuk pengelolaan platform, bukan untuk membaca dokumen pribadi: dokumen Studio tetap hanya dapat dibaca atas alasan hukum yang tercatat (BR-STD-05, Q-03). Audit log tidak dapat diubah atau dihapus oleh siapa pun, termasuk Super Admin.
- Penugasan Editor dan Judge berlaku selama proyek berjalan dan dicabut otomatis saat proyek diarsipkan (Q-04).
- Di Supabase, aturan ini diwujudkan sebagai kebijakan Row Level Security berbasis role dan tabel penugasan. Detail skema ditetapkan pada fase desain teknis.

### 15.4 Grup Penulis

Grup Penulis adalah kumpulan penulis yang dapat saling melihat tulisan dan dikelola oleh admin grup. Grup bukan modul baru: ia memakai Studio dan profil yang sama, dan izinnya ditegakkan lewat Row Level Security seperti role lain. Aturan di bawah adalah usulan; butir yang belum diputuskan merujuk ke bagian 28.

| Hal | Aturan (usulan) |
| --- | --- |
| Pembuatan dan keanggotaan | Administrator (atau Super Admin) membuat grup dan mengundang anggota; grup berada di bawah Administrator yang membuatnya (diskusi 9 November 2026). Administrator menunjuk Admin Grup, dan satu grup boleh memiliki lebih dari satu Admin Grup. Admin Grup juga dapat mengundang atau menerima anggota. Satu penulis boleh ikut lebih dari satu grup (Q-41). Hubungan Administrator pembuat grup dengan Admin Grup: Q-48 |
| Identitas grup | Nama, deskripsi, dan logo. Logo grup dapat diunggah oleh Admin Grup atau Administrator; fitur ini masuk Fase 2 (PLT-09), dan format serta ukuran berkas ditetapkan saat desain |
| Isolasi antar grup | Anggota hanya dapat masuk dan melihat data di grupnya sendiri, tidak dapat melihat grup lain. Admin Grup mengelola anggota di dalam grupnya saja dan tidak membawa wewenang administratif platform (rapat 8 November 2026) |
| Visibilitas tulisan | Anggota grup melihat tulisan sesama anggota. Usulan: hanya dokumen yang penulisnya bagikan ke grup, karena dokumen Studio bersifat pribadi (bagian 14.2). Ruang lingkup final: Q-38 |
| Wewenang Admin Grup | Menambah dan mengeluarkan anggota, mengubah nama dan deskripsi grup, serta menyembunyikan tulisan yang melanggar aturan grup dari tampilan grup. Tidak dapat mengubah atau menghapus dokumen asli anggota, dan tidak dapat membaca dokumen yang tidak dibagikan ke grup. Semua Admin Grup dalam satu grup memiliki wewenang yang sama |
| Hak penulis | Dapat keluar grup kapan saja. Saat keluar atau dikeluarkan, akses anggota lain ke tulisannya dicabut |
| Moderasi dan audit | Laporan pelanggaran ditangani Administrator. Penambahan atau pengeluaran anggota, penunjukan dan pencabutan Admin Grup, dan perubahan visibilitas tercatat di audit log |
| Pengujian | Uji akses negatif: pengguna yang bukan anggota tidak dapat membaca tulisan grup lewat antarmuka maupun permintaan API (setara AC-02 dan AC-03) |
