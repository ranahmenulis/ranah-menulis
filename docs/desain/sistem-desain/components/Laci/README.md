# Laci

Panel dari kanan yang membuka konteks tambahan tanpa meninggalkan halaman: komentar (420px) dan drawer bantuan Studio (360px).

- `surface`, border kiri 1px `line`, radius 0. Bayangan `shadow-float` hanya di terang.
- Kepala: judul `heading-sm` + tombol tutup ikon dengan `aria-label`.
- Komentar: butir dipisah garis `line`; balasan satu tingkat, indentasi 24 dengan garis kiri 1px `line`.
- Ponsel: komentar menjadi halaman penuh, bukan laci.
- Konsumen menyediakan: judul, isi, pemicu; fokus pindah ke laci saat dibuka dan kembali ke pemicu saat ditutup.
