# Toast

Kabar satu baris dengan paling banyak satu aksi, berlatar tinta dan bersudut tajam.

- Latar `ink`, teks `on-ink` `text-sm`, padding 12/16, radius 0, lebar maksimal 420. Aksi: tombol teks `on-ink` bergaris bawah.
- Posisi: kiri bawah di desktop; di atas bilah bawah di ponsel.
- Hilang setelah 4 detik, kecuali galat yang menetap sampai ditutup atau diulang. Galat tetap berlatar `ink`; teksnya yang menjelaskan.
- `role="status"` untuk kabar, `role="alert"` untuk galat.
- Tidak dipakai untuk indikator simpan Studio.
