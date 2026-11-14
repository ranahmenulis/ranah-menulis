## 27. Risiko dan Ketergantungan Teknis

| ID | Risiko atau ketergantungan | Dampak | Mitigasi yang diusulkan |
| --- | --- | --- | --- |
| R-01 | Editor yang andal untuk teks panjang, simpan otomatis, offline, dan konflik adalah bagian tersulit dari Studio | Kehilangan teks akan merusak kepercayaan | Pilih pustaka editor matang (dikaji tim teknis); prioritaskan pengujian koneksi putus dan multi-perangkat; sinkronisasi berbasis versi |
| R-02 | Perhitungan streak tidak akurat (zona waktu, peristiwa ganda, perubahan kata) | Pengguna kehilangan streak yang pantas didapat | Peristiwa idempoten dengan pengenal unik; tanggal lokal disimpan pada setiap peristiwa; uji otomatis kasus tepi |
| R-03 | Penyalahgunaan streak (tempel teks, ketik asal) | Statistik tidak bermakna | Aturan keaslian aktivitas (BR-STK-05); batas wajar; tidak ada hadiah uang berbasis streak di MVP |
| R-04 | Kebocoran hak akses atau identitas pada lomba anonim | Merusak keadilan dan reputasi | RLS di basis data, pengujian akses negatif, dan peninjauan kode untuk jalur data juri |
| R-05 | Sengketa hak cipta dan ketentuan penerbitan yang tidak jelas | Risiko hukum dan hilangnya kepercayaan penulis | Ketentuan ditinjau penasihat hukum sebelum proyek pertama dibuka; versi persetujuan disimpan |
| R-06 | Pembayaran manual tidak skalabel dan rawan kesalahan | Beban operasional naik saat proyek ramai | Batasi proyek berbayar pada MVP; dashboard admin untuk konfirmasi; siapkan gateway resmi untuk MYR di Fase 2 |
| R-07 | Regulasi data dan pajak di dua negara | Hambatan hukum dan operasional | Tinjauan hukum dan pajak sebelum peluncuran di Malaysia (Q-30) |
| R-08 | Cakupan MVP terlalu besar (tiga modul inti dan Grup Penulis sekaligus) | Jadwal molor, kualitas turun | Pegang batas MVP bagian 23; alur lanjutan ditunda; rilis bertahap internal |
| R-09 | Cold start Community: feed sepi | Penulis tidak mendapat pembaca | Kurasi manual Editor's Picks; undang penulis awal dan peserta program ke Community; kategori Discover dengan data seadanya |
| R-10 | Moderasi konten dan komentar | Reputasi platform | Alur laporan, pedoman komunitas, tim moderator terjadwal |
| R-11 | Beban pelaksanaan Projects (editor, juri, mentor, organizer manusia) | Peninjauan lambat | Antrean dan pengingat; metrik waktu peninjauan (KPI-08) |
| R-12 | Ketergantungan pada Supabase (batas layanan, RLS yang kompleks, performa query statistik dan feed) | Kinerja dan biaya | Indeks dan agregasi terjadwal; uji beban; rancang skema modular; ikuti rencana migrasi ke VPS (bagian 19.3) |
| R-13 | Ekspor PDF dan DOCX tidak konsisten antar perangkat | Hasil ekspor mengecewakan | Pustaka ekspor diuji; DOCX ditunda ke Fase 2 |
| R-14 | Pemahaman tim terhadap integrasi antarmodul kurang | Modul berdiri sendiri-sendiri | Bagian 18 menjadi acuan wajib; tinjauan arsitektur lintas modul sebelum pengembangan |
| R-15 | Bahasa dan budaya dua negara (istilah, nuansa konten, sensitivitas) | Konten tidak sesuai bagi sebagian pengguna | Pedoman komunitas yang jelas; keputusan bahasa antarmuka (bagian 28) |
| R-16 | Migrasi database dari Supabase ke VPS menyentuh penyimpanan file dan aturan RLS (login tetap di Supabase) | Pengguna gagal masuk atau data terbuka ke pihak yang salah saat pindah | Siapkan lapisan akses data, berkas migrasi, dan uji akses negatif sejak MVP; pindah dengan uji coba dan jalur mundur (bagian 19.3) |
| R-17 | Review Play Store dan App Store: aplikasi pembungkus web dapat ditolak, serta aturan pembayaran dan moderasi konten | Peluncuran di store tertunda; potongan Apple atas pembayaran digital | Tambahkan fitur khas aplikasi seperti notifikasi; siapkan laporan, blokir, dan hapus akun dari dalam aplikasi; kaji aturan pembayaran Kelas Menulis sebelum diajukan. Aturan store dicek ulang saat pengajuan |
| R-18 | Tulisan yang belum siap terbaca anggota Grup Penulis akibat aturan visibilitas yang salah | Penulis kehilangan kepercayaan dan karya bocor sebelum terbit | Putuskan Q-38 sebelum Fase 3; bagikan ke grup hanya lewat tindakan eksplisit penulis; RLS dan uji akses negatif untuk non-anggota dan admin grup |
| R-19 | Akun Super Admin atau Administrator disusupi atau disalahgunakan karena hak aksesnya luas | Role, grup, dan konfigurasi platform dapat diubah pihak yang tidak berwenang | Jumlah Super Admin dibatasi; role Administrator hanya dapat diberikan Super Admin; verifikasi dua langkah (usulan, SEC-17); semua tindakan masuk audit log yang tidak dapat diubah; uji akses negatif per role (AC-SA2 sampai AC-SA4) |
