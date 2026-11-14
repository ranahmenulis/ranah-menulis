## 1. Ringkasan Produk

RanahMenulis adalah aplikasi web responsif yang mengantar seseorang dari menulis satu paragraf sampai menerbitkan buku, dalam satu akun dan satu alur data, untuk pengguna di Indonesia dan Malaysia.

| Atribut | Keterangan |
| --- | --- |
| Nama produk | RanahMenulis |
| Jenis produk | Ekosistem digital untuk menulis, komunitas literasi, pendidikan menulis, dan penerbitan buku |
| Platform | Aplikasi web responsif (desktop, tablet, smartphone). Aplikasi Android dan iOS untuk Play Store dan App Store dibungkus dari versi web setelah web stabil; waktunya mengikuti Q-40 |
| Target pasar | Indonesia dan Malaysia |
| Teknologi terencana | Next.js dalam satu proyek (monolith untuk tampilan dan backend), TypeScript, Tailwind CSS, shadcn/ui; Supabase (PostgreSQL, Auth, Storage) untuk MVP, dengan rencana memindahkan database (bukan login) ke VPS saat sudah penuh dipakai (bagian 19.3). Pembayaran QRIS memakai layanan sendiri di VPS kecil sejak MVP (bagian 19.2) |
| Status dokumen | Draf v0.2, revisi 9 November 2026, untuk ditinjau founder. Memuat keputusan diskusi lanjutan dan rapat 8 November 2026 (Streak menyatu dengan Studio, Grup Penulis, Marketplace setelah MVP, Next.js monolith dengan Supabase, dan rencana migrasi ke VPS), serta revisi 9 November 2026: tingkat Super Admin yang memberikan role Administrator, grup dibuat Administrator dengan lebih dari satu admin grup, dan logo grup di Fase 2. Belum ada kode atau implementasi |

Produk memiliki **tiga modul inti**. Ranah Streak kini menjadi bagian dari Ranah Studio. Marketplace ditambahkan setelah MVP. Modul lain tidak ditambah tanpa persetujuan founder.

| Modul | Peran dalam perjalanan penulis | Satu kalimat |
| --- | --- | --- |
| Ranah Studio (termasuk Streak) | Menulis dan kebiasaan | Ruang kerja pribadi untuk menulis, menyimpan, dan mengelola karya; aktivitas menulis langsung dicatat sebagai Streak |
| Ranah Community | Pembaca | Jaringan sosial penulis untuk membagikan dan menemukan karya |
| Projects | Peluang | Pusat Antologi, Solo, Kelas Menulis, dan Lomba |
| Marketplace (setelah MVP) | Transaksi | Jual-beli karya atau buku hasil lomba dan penerbitan, terpisah dari Community; rincian belum ditentukan (Q-39) |

Catatan penting: registrasi, profil, notifikasi, pembayaran, dan administrasi bukan modul kelima. Semuanya adalah **kapabilitas platform** yang melayani modul di atas (lihat bagian 7).

Konvensi dokumen: rujukan seperti **(Q-19)** menandai keputusan yang belum diberikan founder; nomornya mengarah ke daftar di bagian 28. **Usulan** menandai rekomendasi tim produk yang belum final.

Riwayat perubahan dari v0.1 ada di [CHANGELOG](prd/CHANGELOG.md).
