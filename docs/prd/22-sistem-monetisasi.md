## 22. Sistem Monetisasi

Enam sumber pendapatan potensial tidak harus diluncurkan bersamaan. Usulan: MVP meluncurkan Projects berbayar (Antologi, Solo, Kelas, Lomba) dengan pembayaran QRIS yang awalnya semi-manual lewat dashboard admin, karena inilah inti proposisi nilai. Langganan Premium dan penjualan produk menyusul setelah ada basis pengguna.

| No | Sumber pendapatan | Cara kerja | Prasyarat sistem | Fase (usulan) |
| --- | --- | --- | --- | --- |
| 1 | Penerbitan individu (Solo) | Penulis membayar paket layanan | Paket dan harga, dasbor status, pembayaran | MVP (QRIS, awalnya semi-manual) |
| 2 | Penerbitan bersama (Antologi) | Peserta membayar biaya partisipasi | Biaya, kuota, pembayaran | MVP (QRIS, awalnya semi-manual) |
| 3 | Kelas dan workshop | Peserta membayar biaya kelas | Pendaftaran, pembayaran | MVP (QRIS, awalnya semi-manual) |
| 4 | Kompetisi | Biaya pendaftaran lomba, bila ada | Pembayaran | MVP bila lomba berbayar |
| 5 | Langganan Premium | Pengguna berlangganan untuk manfaat tambahan | Definisi manfaat, penagihan berulang, pembatasan fitur | Fase 3 (Q-02) |
| 6 | Produk pendukung (writing kit, jurnal, buku, template) | Penjualan produk | Katalog, keranjang, pengiriman atau produk digital | Fase 3 (Q-25) |

**Prinsip desain pembayaran.**

- Harga disimpan per mata uang (IDR dan MYR) dalam satuan terkecil; setiap proyek memiliki harga terpisah di tiap mata uang, bukan konversi otomatis.
- Mata uang tampil sesuai negara pengguna atau pilihan di halaman; pengguna melihat total sebelum bayar.
- Setiap transaksi memiliki status (menunggu, dikonfirmasi, ditolak, dikembalikan) dan jejak audit.
- Pada MVP, pembayaran IDR memakai QRIS (GoPay atau ShopeePay) lewat layanan buatan sendiri tanpa payment gateway pihak ketiga. Sesi merchant disimpan di VPS dan webhook mengonfirmasi transaksi secara real-time. Awalnya semi-manual: Organizer atau Administrator dapat mengonfirmasi lewat dashboard admin. Layanan ini masuk lingkup pengembangan. Pembayaran MYR dan gateway resmi masuk Fase 2.
- Kaji kebijakan penyedia dan keamanan penyimpanan sesi merchant sebelum dipakai untuk uang penulis (Q-19).
- Manfaat Premium belum didefinisikan. Premium tidak boleh mengunci hak dasar penulis atas karya atau mengubah hak cipta.
- Rapat 8 November 2026: di MVP semua fitur dilepas tanpa langganan supaya matang lebih dulu. Sesudah itu dipilih fitur yang dimonetisasi, misalnya langganan, akses ke ide dari Community, dan iklan loker penulis dari penerbit. Semuanya kandidat dan belum diputuskan (Q-43).

**Hal yang perlu diputuskan:** badan hukum dan rekening untuk dua negara, pajak (PPN atau SST), kebijakan pengembalian dana, dan apakah penjualan buku terbit termasuk dalam cakupan (PRJ-05). Semuanya di bagian 28.
