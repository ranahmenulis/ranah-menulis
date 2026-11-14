# FormDaftarTunggu

Satu-satunya bagian landing yang dibalik warnanya, berisi form daftar tunggu dengan lima keadaan.

## Pembalikan [usulan]

Bagian ini memakai **set token tema lawan** (`data-theme="dark"` di halaman terang, `data-theme="light"` di halaman gelap), bukan sekadar latar `ink` dengan teks putih. Alasannya: input, chip, fokus, dan merah galat ikut berganti dan tetap lolos kontras. Merah terang #b3261e di atas hitam gagal; merah gelap #ff8f87 di atas #121212 8,5:1.

Akibatnya di halaman terang latarnya #121212 (bukan #191919), dan di halaman gelap bagian ini menjadi putih. Perlu keputusan client.

## Isi

- Judul serif 44/1.05 400 (ponsel 32) [usulan], satu kalimat penjelas serif 18/28 `ink-muted`.
- Field: Nama panggilan, Email, Negara (Indonesia, Malaysia, Lainnya), Minat opsional sebagai chip pilih-banyak (Menulis rutin, Antologi, Buku solo, Kelas, Lomba, Membaca).
- Tombol: TombolHero "Gabung daftar tunggu".

## Keadaan

| Keadaan | Perilaku |
| --- | --- |
| Kosong | Placeholder contoh, Negara terisi Indonesia |
| Sedang mengirim | Isian terkunci (readonly), tombol `aria-busy` dengan tiga titik, label "Mengirim", lebar tetap |
| Galat | Galat field: border dan pesan `danger` di bawah field. Galat kirim: banner `danger-subtle` di atas tombol. Isian tidak dihapus |
| Email sudah terdaftar | **Bukan galat** [usulan]: ikon info + kalimat `ink`, tanpa merah, dengan tombol teks "Pakai email lain" |
| Sukses | Form diganti kalimat serif 26/34 yang menyapa nama, plus satu baris email tujuan. `role="status"` |

## Konsumen menyediakan

Penanganan kirim (tanpa `action` ke luar), validasi email di sisi klien dan server, deteksi email ganda.
