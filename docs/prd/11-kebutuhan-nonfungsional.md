## 11. Kebutuhan Nonfungsional

Angka di kolom Usulan adalah titik awal untuk diskusi, bukan komitmen. Semuanya perlu persetujuan founder dan validasi teknis.

| ID | Kategori | Kebutuhan | Usulan ukuran |
| --- | --- | --- | --- |
| NFR-01 | Performa | Halaman utama dan feed terasa cepat di jaringan seluler | Waktu muat konten utama kurang dari 3 detik pada jaringan 4G umum (Q-35) |
| NFR-02 | Performa editor | Mengetik tidak boleh tertunda oleh penyimpanan atau penghitungan | Penghitungan kata inkremental; penyimpanan di latar belakang |
| NFR-03 | Keandalan data | Teks yang sudah diketik tidak boleh hilang | Penyimpanan otomatis dengan antrean lokal saat offline; pengujian khusus kehilangan koneksi |
| NFR-04 | Ketersediaan | Platform dapat diakses saat jam ramai, terutama dekat deadline | Target ketersediaan (Q-35); pemeliharaan terjadwal diumumkan |
| NFR-05 | Skalabilitas | Arsitektur modular agar modul dapat berkembang terpisah | Pemisahan domain data per modul; indeks dan paginasi untuk feed dan statistik |
| NFR-06 | Keamanan | Lihat bagian 21 | Row Level Security pada setiap tabel; tidak ada akses lintas pengguna tanpa kebijakan |
| NFR-07 | Privasi | Data pribadi dan karya dilindungi, sesuai regulasi di Indonesia dan Malaysia | Tinjauan hukum sebelum peluncuran (Q-30) |
| NFR-08 | Responsif | Nyaman di desktop, tablet, dan smartphone | Titik henti desain disepakati bersama desainer; pengujian pada perangkat nyata |
| NFR-09 | Aksesibilitas | Dapat dipakai dengan keyboard dan pembaca layar; kontras cukup | Mengacu pada WCAG 2.1 AA sebagai arah (Q-46) |
| NFR-10 | Pengalaman membaca | Tipografi nyaman untuk bacaan panjang | Lebar baris, ukuran huruf, dan jarak baris ditetapkan di panduan desain |
| NFR-11 | Lokalisasi | Bahasa antarmuka, mata uang, tanggal, zona waktu untuk dua negara | Bahasa Indonesia untuk MVP; Bahasa Melayu (Q-32); mata uang IDR dan MYR; zona waktu per pengguna |
| NFR-12 | Pemeliharaan | Kode modular, ber-tipe (TypeScript), teruji | Pengujian otomatis untuk aturan streak, status submission, dan hak akses |
| NFR-13 | Observabilitas | Kesalahan dan kinerja dapat dipantau | Pencatatan kesalahan dan audit log tindakan sensitif |
| NFR-14 | Pencadangan | Data dapat dipulihkan | Jadwal pencadangan dan target pemulihan (Q-35) |
| NFR-15 | Kompatibilitas browser | Browser modern pada desktop dan seluler | Daftar versi minimum (Q-46) |
| NFR-16 | SEO dan berbagi | Karya publik dapat ditemukan dan dibagikan dengan pratinjau yang benar | Halaman karya publik dirender di server; metadata Open Graph |
