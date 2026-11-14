## 19. Kebutuhan Integrasi

Integrasi dibagi dua: antarmodul di dalam platform, dan dengan layanan luar. Penyedia layanan luar belum ditentukan kecuali yang tercantum di brief; pilihannya menjadi keputusan founder.

### 19.1 Integrasi internal

Integrasi internal berjalan lewat peristiwa dan tautan data yang jelas, bukan salin-tempel antarmodul. Detail alur ada di bagian 18.

| Dari | Ke | Peristiwa atau data | Sifat |
| --- | --- | --- | --- |
| Studio | Streak | Aktivitas menulis (delta kata, dokumen, waktu, pengenal unik) | Hampir real time, idempoten |
| Studio | Community | Penerbitan membuat salinan karya publik dengan tautan ke dokumen asal | Atas aksi pengguna |
| Studio | Projects | Pembuatan versi submission beku | Atas aksi pengguna |
| Projects | Studio | Status submission tampil di daftar dokumen; revisi dibuka kembali dari dokumen asal | Baca |
| Projects | Community | Karya terbit atau pemenang dapat tampil di portofolio dan profil | Atas persetujuan pengguna |
| Streak | Community | Streak dan milestone dapat tampil di profil | Atas pilihan pengguna |
| Semua modul | Notifikasi | Peristiwa yang memicu pemberitahuan | Asinkron |
| Semua modul | Audit log | Tindakan sensitif | Asinkron |

### 19.2 Integrasi eksternal

| Kebutuhan | Penyedia | Fase | Catatan |
| --- | --- | --- | --- |
| Autentikasi, basis data, penyimpanan berkas | Supabase (Auth, PostgreSQL, Storage) | MVP | Sudah ditetapkan di brief. Setelah database pindah ke VPS, login tetap di Supabase Auth |
| Email transaksional | Belum ditentukan (Q-47) | MVP | Verifikasi, reset sandi, notifikasi penting |
| Login sosial (Google dan lainnya) | Belum ditentukan (Q-05) | Belum ditentukan | Lewat Supabase Auth bila dipilih |
| Pembayaran QRIS (GoPay atau ShopeePay) | Layanan buatan sendiri: sesi merchant disimpan di VPS, webhook mengonfirmasi transaksi ke aplikasi secara real-time; tanpa payment gateway pihak ketiga seperti Midtrans | MVP (awalnya semi-manual dengan dashboard admin) | Masuk lingkup pengembangan. Membutuhkan VPS sejak MVP. Kaji kebijakan penyedia dan keamanan sesi merchant (Q-19) |
| Pembayaran MYR dan gateway resmi | Belum ditentukan (Q-19) | Fase 2 | QRIS hanya untuk IDR; rancang data multi-mata uang sejak MVP |
| Berbagi ke Instagram, Threads, WhatsApp | Fitur berbagi peramban dan tautan | Fase 2 | Tidak memakai API privat media sosial pada awalnya (Q-47) |
| Pembuatan gambar kartu | Pembuatan gambar di server | Fase 2 | Termasuk tautan dan atribusi penulis |
| Pembuatan PDF dan DOCX | Pustaka ekspor | MVP (PDF, TXT), Fase 2 (DOCX) | Pilihan pustaka diputuskan tim teknis |
| Analitik produk | Belum ditentukan (Q-47) | MVP | Untuk mengukur kriteria keberhasilan bagian 25; patuhi privasi |
| Pemantauan galat | Belum ditentukan | MVP | Mendukung NFR-13 |

### 19.3 Rencana migrasi database ke VPS

MVP memakai Supabase untuk database, login, dan penyimpanan file. Saat trafik dan ukuran data naik, **hanya database yang pindah ke VPS**; login tetap di Supabase Auth (keputusan rapat 8 November 2026). Self-host Supabase tidak dipilih karena kebutuhan servernya besar (sekitar 4 core dan 8 GB) dan login Google atau Apple harus didaftarkan manual. Waktu pindah ditentukan oleh pemicu (misalnya biaya, ukuran data teks, performa, kebutuhan lokasi data), bukan tanggal. Pemicu belum diberi angka (Q-42). Perkiraan tim: arsitektur monolith masih aman sampai kisaran di bawah 100 ribu pengguna; angka ini belum diuji beban.

**Disiapkan sejak MVP agar mudah pindah:**

- Skema database dikelola lewat berkas migrasi berurutan di repositori, bukan perubahan manual di dasbor.
- Semua akses data lewat satu lapisan di server Next.js. Browser tidak memanggil database langsung untuk operasi sensitif.
- Penyimpanan file dipakai lewat lapisan tipis sendiri, supaya dapat dipindah tanpa menulis ulang fitur.
- Aturan RLS bergantung pada identitas dari login Supabase (`auth.uid()`). Setelah database pindah, identitas pengguna harus diteruskan ke database oleh server aplikasi, atau izin ditegakkan di lapisan server. Rancang ini sejak MVP dan uji akses negatif per role.
- Cadangan rutin dan uji pemulihan dilakukan sejak awal.
- VPS kecil untuk layanan pembayaran QRIS sudah ada sejak MVP (bagian 19.2); ia dapat menjadi dasar VPS database.

**Langkah pindah:**

1. Tetapkan pemicu (Q-42).
2. Siapkan VPS: PostgreSQL, cadangan otomatis, pemantauan, dan pengamanan server.
3. Uji coba: salin data ke VPS, jalankan aplikasi pada salinan dengan login tetap di Supabase, dan jalankan uji akses negatif per role.
4. Pindah: mode baca-saja singkat, salin data terakhir, lalu ganti sambungan database.
5. Pantau dan siap mundur: database di Supabase tetap hidup beberapa minggu sebagai cadangan.

| Komponen | Di MVP | Setelah pindah | Catatan |
| --- | --- | --- | --- |
| Database | PostgreSQL di Supabase | PostgreSQL di VPS | Relatif mudah dipindah lewat ekspor dan impor |
| Login | Supabase Auth | Tetap Supabase Auth | Tidak ada pendaftaran ulang |
| Penyimpanan file | Supabase Storage | Tetap di Supabase atau penyimpanan kompatibel S3 | Belum diputuskan (Q-42) |
| Keamanan data | RLS dengan identitas Supabase | Identitas diteruskan server aplikasi, atau izin ditegakkan di server | Perlu dirancang sejak MVP dan diuji ulang per role |
| Pembayaran QRIS | VPS kecil | VPS yang sama atau terpisah | Layanan buatan sendiri |
| Cadangan | Bawaan Supabase | Cadangan terjadwal di VPS | Uji pemulihan sebelum pindah |
