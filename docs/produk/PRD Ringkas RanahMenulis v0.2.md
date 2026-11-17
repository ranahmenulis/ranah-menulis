# RanahMenulis: PRD Ringkas untuk Client

Versi 0.2, revisi 9 November 2026 · Penyusun: Aditya Imam Zuhdi

Dokumen ini ringkasan dari [PRD lengkap](../PRD%20RanahMenulis%20v0.2.md). Isinya cukup untuk memahami apa yang akan dibangun, apa yang belum, dan keputusan apa yang masih ditunggu. Detail teknis, aturan bisnis, dan kriteria uji ada di PRD lengkap.

## 1. Produk dalam satu paragraf

RanahMenulis adalah aplikasi web untuk penulis di Indonesia dan Malaysia. Penulis menulis di satu tempat, kebiasaan menulisnya tercatat otomatis, karyanya bisa dibagikan ke komunitas, dan ia bisa ikut program penerbitan seperti antologi, buku solo, kelas, dan lomba. Semuanya memakai satu akun.

Aplikasi ini berbeda dari Penulis+ yang berjalan sekarang. Penulis+ tetap hidup sampai RanahMenulis siap, dan sebagian isinya dibawa ke aplikasi baru (bagian 7).

## 2. Tiga modul inti

| Modul                        | Fungsinya                                                   | Contoh isi                                                                                         |
| ---------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Studio** (termasuk Streak) | Tempat menulis dan membangun kebiasaan                      | Editor, dokumen dan folder, simpan otomatis, target harian, kalender, hari beruntun, kit inspirasi |
| **Community**                | Tempat membagikan gambaran karya dan menemukan penulis lain | Postingan, apresiasi, komentar, profil penulis                                                     |
| **Projects**                 | Pusat peluang dan penerbitan                                | Antologi, Solo, Kelas Menulis, Lomba                                                               |

Setelah versi pertama, ditambahkan **Marketplace**: jual-beli karya atau buku hasil lomba dan penerbitan, terpisah dari Community. Isinya belum ditentukan.

Streak digabung ke Studio karena penghitungannya berasal dari aktivitas menulis di Studio. Penulis tidak mencatatnya manual.

## 3. Perjalanan penulis

1. Mendaftar, mengisi profil, dan menetapkan target menulis harian.
2. Menulis di Studio. Jumlah kata baru tercatat otomatis dan mengisi progres harian serta hari beruntun.
3. Membagikan prolog atau cuplikan karya ke Community. Pembaca memberi apresiasi dan komentar.
4. Melihat program di Projects, membaca ketentuan, mendaftar, dan mengirim karya dari Studio.
5. Editor atau juri meninjau karya. Penulis merevisi bila diminta, lalu menerima keputusan.
6. Karya yang diterima masuk ke tahap penerbitan, dan penulis memantau statusnya.

## 4. Apa saja yang dilakukan tiap modul

### Studio dan Streak

- **Editor** dengan format dasar (tebal, miring, judul, kutipan, daftar), simpan otomatis, penghitung kata, dan penanganan saat koneksi putus.
- **Dokumen dan folder**: buat, ubah nama, pindah, cari, dan hapus (masuk sampah dulu).
- **Ekspor** ke TXT dan PDF.
- **Kit inspirasi** di tab bantuan: ide cerita, kalimat pembuka, kamus diksi, pertanyaan refleksi, ide judul, kalimat penutup, kamus transisi, dan perpustakaan prompt yang bisa disalin ke ChatGPT atau Claude. Tidak ada fitur AI di dalam aplikasi.
- **Streak**: hari memenuhi syarat bila penulis mencapai target pribadinya. Teks tempelan yang besar tidak dihitung penuh, dan menghapus tulisan tidak mengurangi progres. Perhitungan mengikuti zona waktu penulis.
- Dari Studio, dokumen bisa dikirim ke Projects atau dibagikan ke Community. Dokumen pribadi tetap pribadi.

### Community

- Penulis membagikan **prolog atau cuplikan** karya yang ia atur publik sendiri. Karya penuh tidak dibagikan, hanya gambarannya.
- Pembaca memberi apresiasi dan komentar, menyimpan bookmark, dan mengikuti penulis.
- Ada laporan konten dan moderasi.
- Belum ada pesan langsung atau chat pribadi.

### Projects

| Kategori          | Alur singkat                                                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Antologi**      | Lihat proyek, baca ketentuan, daftar, kirim karya, seleksi, revisi bila perlu, diterima, penerbitan                         |
| **Solo**          | Pilih paket, ajukan naskah, pantau tahap editing sampai buku selesai di dasbor                                              |
| **Kelas Menulis** | Daftar kelas, ikuti materi dan tugas, terima masukan dari mentor. Jadwal dan tautan kelas dicatat; video lewat layanan luar |
| **Lomba**         | Daftar, kirim karya, juri menilai per kriteria, penilaian anonim, pengumuman finalis dan pemenang                           |

Ketentuan hak cipta dan penerbitan harus disetujui peserta sebelum mendaftar. Tahap produksi buku di MVP diperbarui statusnya secara manual oleh tim.

## 5. Hak akses dan grup

| Peran            | Wewenang singkat                                  |
| ---------------- | ------------------------------------------------- |
| Pengunjung       | Melihat konten publik                             |
| Penulis          | Menulis, membagikan, ikut proyek dan grup         |
| Organizer        | Mengelola proyek miliknya                         |
| Editor           | Meninjau karya yang ditugaskan kepadanya          |
| Juri atau Mentor | Menilai atau memberi masukan pada yang ditugaskan |
| Administrator    | Mengelola pengguna, grup, moderasi, dan kurasi    |
| Super Admin      | Root: memberi role Administrator dan mengatur sistem |

Setiap akun baru otomatis menjadi pengguna biasa. Hanya Super Admin yang dapat memberi role Administrator. Super Admin tidak otomatis boleh membaca dokumen pribadi penulis; akses itu hanya atas alasan hukum yang tercatat (menunggu persetujuan, nomor 11 di bagian 11).

**Grup Penulis** (baru):

- Penulis bergabung dalam grup dan hanya melihat data di grupnya sendiri, bukan grup lain.
- Anggota grup bisa saling melihat tulisan sesama anggota. Cakupannya (semua tulisan atau hanya yang dibagikan ke grup) menunggu keputusan (nomor 4 di bagian 10).
- Grup dibuat oleh Administrator, yang juga mengundang anggota. Satu grup boleh punya lebih dari satu **admin grup** yang mengelola anggota grupnya, tanpa wewenang atas platform.
- Grup nanti dapat diberi logo (Fase 2).

Hak akses ditegakkan di database dan diuji per peran, bukan hanya di tampilan.

## 6. Pembayaran dan monetisasi

- Pembayaran IDR memakai **QRIS buatan sendiri** (GoPay atau ShopeePay) dengan konfirmasi otomatis lewat webhook, tanpa payment gateway pihak ketiga. Awalnya semi-manual: admin bisa mengonfirmasi lewat dashboard.
- Pembayaran ringgit (MYR) dan gateway resmi menyusul di Fase 2.
- Di versi pertama **semua fitur gratis**. Setelah semuanya matang, tim memilih fitur yang dimonetisasi, misalnya langganan, akses ke ide dari Community, dan iklan loker penulis dari penerbit.

## 7. Dari Penulis+ yang dibawa dan yang ditulis ulang

| Dibawa                                                         | Ditulis ulang                            |
| -------------------------------------------------------------- | ---------------------------------------- |
| Editor menulis                                                 | Login (tambah email, bukan hanya Google) |
| Kit inspirasi dan perpustakaan prompt                          | Dashboard dan profil                     |
| Komponen tampilan dasar (didesain ulang)                       | Skema database dan penyimpanan data      |
| Word counter dan Blueprint 10 Hari (daftar akhir dikonfirmasi) | Navigasi                                 |

Aplikasi lama punya masalah penyimpanan yang bisa membuat tulisan hilang. Karena itu ia tidak dijadikan fondasi aplikasi baru.

## 8. Teknologi

- **Satu proyek Next.js** untuk tampilan dan bagian server. Dipilih juga karena halaman karya perlu tampil rapi saat dibagikan dan mudah ditemukan lewat pencarian.
- **Supabase** (database, login, penyimpanan file) untuk versi pertama.
- **Pindah ke VPS** saat pengguna dan data teks sudah banyak: hanya database yang pindah, login tetap di Supabase. Rencana pindahnya disiapkan sejak awal agar tidak perlu menulis ulang aplikasi.
- **VPS kecil** untuk layanan pembayaran QRIS sudah dipakai sejak versi pertama.
- **Play Store dan App Store**: versi pertama berupa web yang nyaman di HP. Aplikasi store menyusul, dan backend dirancang agar bisa dipakai olehnya.

## 9. Ruang lingkup versi pertama

| Termasuk                                                                     | Belum termasuk (menyusul)                                          |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Registrasi, login, profil, hak akses, notifikasi, admin, moderasi, audit log | Login sosial tambahan, notifikasi dorong                           |
| Studio dengan Streak, kit inspirasi, ekspor TXT dan PDF, riwayat versi, timer sprint, target per dokumen                      | Template, manuskrip multi-bab, ekspor dan impor DOCX, kartu pencapaian       |
| Community berupa postingan, apresiasi, komentar, follow, laporan, Event, tautan komunitas luar             | Karya penuh, chat realtime (tidak dibangun), cerita berseri, Highlight, rekomendasi lanjutan |
| Projects keempat kategori dengan pembayaran QRIS                             | Pemesanan buku, pembayaran MYR, sertifikat otomatis                |
| Grup Penulis (dibuat penulis atau Administrator) dengan admin grup                                               | Logo grup, aturan grup lanjutan                                    |
|                                                                              | Marketplace, aplikasi di store, langganan, fitur AI                |

## 10. Jadwal dan cara kerja

**Target:** selesai dalam sekitar satu bulan (Desember 2026), sesuai rapat. Pembuatan dibantu AI dan setiap hasilnya diperiksa manual. Target dan cakupan dicek ulang setelah desain disetujui, karena cakupan versi pertama cukup besar (nomor 8 di bawah).

Urutan kerja:

1. **Desain tampilan** dibagikan ke grup untuk ditinjau per halaman.
2. **Persetujuan** desain oleh founder.
3. **Pengembangan bertahap per modul**, dimulai dari Studio. Tiap modul ditinjau bersama sebelum lanjut ke modul berikutnya. Frontend memakai data contoh, dan backend bisa berjalan paralel.
4. **Uji keamanan, kecepatan, dan beban** sebelum peluncuran.

## 11. Keputusan yang masih ditunggu dari founder

| No  | Pertanyaan                                                                                                                                                            | Mengapa penting                                |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 1   | Fitur Penulis+ mana lagi yang dibawa (Word Counter, Blueprint, Workbook, Builder, dan lainnya)?                                                                       | Menentukan isi Studio                          |
| 2   | Editor tetap sederhana atau memakai format dasar (tebal, miring, judul)?                                                                                              | Menentukan desain editor                       |
| 3   | Community: kapan karya penuh (tulisan pendek dan panjang) dibuka di Fase 2, dan berapa batas katanya? (Di versi pertama sudah diputuskan hanya prolog atau cuplikan.) | Menentukan rencana Fase 2                      |
| 4   | Grup Penulis: anggota melihat semua tulisan sesama anggota, atau hanya yang dibagikan ke grup?                                                                        | Menentukan hak akses dan privasi               |
| 5   | Marketplace: apa yang dijual (karya digital, buku, jasa editor atau desain cover, lainnya)?                                                                           | Perlu persetujuan resmi sebagai modul tambahan |
| 6   | Play Store dan App Store: harus ada sejak rilis pertama, atau web dulu?                                                                                               | Menentukan jadwal dan urutan                   |
| 7   | Bantuan ejaan atau parsing teks yang menimbulkan biaya: boleh jadi fitur berbayar nanti, mengingat keputusan tanpa AI?                                                | Menentukan kebijakan fitur AI                  |
| 8   | Apakah seluruh cakupan versi pertama dapat selesai dalam satu bulan, atau cakupan dikecilkan atau dirilis bertahap?                                                   | Menentukan jadwal                              |
| 9   | Ketentuan hak cipta baku, batas usia, pajak (PPN dan SST), serta kebijakan pengembalian dana                                                                          | Perlu penasihat hukum dan akuntan              |
| 10  | Siapa penyelenggara proyek di versi pertama, dan apakah bahasa antarmuka hanya Indonesia dulu?                                                                        | Menentukan peran dan konten                    |
| 11  | Super Admin dan grup: apakah Super Admin boleh membaca dokumen pribadi, dan apakah "admin" grup adalah Administrator pembuat grup atau admin grup terpisah?          | Menentukan batas wewenang dan privasi          |

**Penulis+ saat ini:** apakah masih dipakai penulis antologi, dan kira-kira berapa orang? Jawabannya menentukan apakah aplikasi lama perlu ditambal selama masa transisi.

## 12. Usulan tim yang perlu disetujui

- Penulis biasa langsung dapat menulis di Studio. Peran Penulis penuh didapat saat pertama kali menerbitkan atau mendaftar proyek.
- Hari streak memenuhi syarat bila target pribadi tercapai. Tidak ada pemulihan streak di versi pertama, dengan toleransi satu hari untuk aktivitas offline yang terkirim terlambat.
- Antologi: maksimal dua putaran revisi, tenggat ditentukan Organizer. Bila dua editor berbeda keputusan, Organizer yang memutuskan.
- Lomba: nilai dihitung sebagai rata-rata tertimbang. Identitas peserta anonim terlihat oleh Organizer dan Admin setelah penilaian ditutup.
- Kuota proyek ditahan dalam batas waktu singkat saat menunggu pembayaran.
- Pengingat menulis hanya di dalam aplikasi pada versi pertama.
- Verifikasi email dulu sebelum Studio dipakai penuh.

## 13. Risiko utama

| Risiko                                                                 | Cara menghadapinya                                                                                    |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Cakupan versi pertama terlalu besar untuk target waktu                 | Rilis bertahap per modul, review di tiap tahap, dan pegang batas ruang lingkup di bagian 9            |
| Tulisan hilang atau konflik saat simpan otomatis                       | Pilih editor yang matang, uji koneksi putus dan banyak perangkat                                      |
| Hak akses atau identitas lomba anonim bocor                            | Aturan keamanan di database dan uji akses per peran                                                   |
| Ketentuan hak cipta tidak jelas                                        | Ditinjau penasihat hukum sebelum proyek pertama dibuka                                                |
| Pembayaran QRIS lewat sesi merchant bergantung pada kebijakan penyedia | Dikaji kebijakan dan keamanannya sebelum dipakai untuk uang penulis; dashboard admin sebagai cadangan |
| Peninjauan Play Store dan App Store                                    | Disiapkan fitur laporan, blokir, hapus akun, dan notifikasi; aturan dicek saat pengajuan              |
| Cold start Community (feed sepi)                                       | Kurasi manual dan mengundang penulis awal                                                             |

## 14. Perubahan dari PRD sebelumnya

- Ranah Streak digabung ke Studio, sehingga modul inti menjadi tiga.
- Marketplace ditambahkan setelah versi pertama.
- Grup Penulis dengan admin grup ditambahkan.
- Tingkat Super Admin ditambahkan. Grup dibuat Administrator dan boleh punya lebih dari satu admin; logo grup menyusul di Fase 2.
- Community di versi pertama dibatasi pada postingan prolog atau cuplikan, tanpa chat.
- Teknologi ditetapkan: Next.js satu proyek dengan Supabase, dan rencana pindah database ke VPS.
- Pembayaran memakai QRIS buatan sendiri.
- Fitur AI di dalam aplikasi tidak dibangun.
- **Keputusan 17 November 2026 (Lembar Novlr):**
  - Ditambah di versi pertama: target per dokumen, riwayat versi 3 hari, timer sprint, pencarian cepat, arsip dan duplikat, jenis dokumen dan tag, gambar kutipan dan kartu progres, Event umum, tautan komunitas luar, batal daftar proyek gratis, kelas yang sedang berjalan, salin latihan ke Studio, testimoni, pengaturan notifikasi dan email progres mingguan.
  - Penulis boleh membuat grup sendiri.
  - Menyusul di Fase 2: impor .docx, catatan riset dan papan alur (bersama manuskrip multi-bab).
  - Tidak dibangun: chat realtime (diarahkan ke platform lain), kursus mandiri, tautan baca publik, kolaborasi di dalam teks, tema tambahan.
  - Marketplace dikonfirmasi di luar versi pertama. Butir yang masih dibahas: pemeriksa tata bahasa, cadangan ke Drive dan Dropbox, pemutar materi, situs penulis, undang teman, chat dukungan.
