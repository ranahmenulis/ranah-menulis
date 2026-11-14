# Input

Kolom isian bersudut tajam dengan label yang selalu terlihat di atasnya, dipakai untuk semua form.

## Spesifikasi

- Tinggi 44, padding 12, border 1px `line`, radius 0, latar `canvas`, teks `text-base` `ink`. Placeholder `ink-faint`.
- Label di atas: `text-sm` 500 `ink`. Penanda opsional: "(opsional)" 400 `ink-muted`. Field wajib tidak diberi bintang.
- **Fokus:** border `line-strong` dan outline 2px `ink` offset 2px.
- **Galat:** border `danger`, pesan `text-sm danger` + ikon peringatan di bawah field, terhubung lewat `aria-describedby`. Isian tidak pernah dihapus saat galat. Pesan menyebut apa yang salah dan cara memperbaikinya.
- **Sukses** [usulan]: DESIGN.md belum menentukan. Monokrom: ikon centang + teks `text-sm` 500 `ink`, border tetap `line`. Tanpa hijau. Dipakai hanya bila sukses itu kabar (misalnya email belum terdaftar), bukan pada setiap field yang benar.
- **Pilihan (select):** bentuk sama dengan input, ikon caret `ink-muted` di kanan 12px. Memakai `<select>` asli.
- Petunjuk: `text-xs ink-muted` di bawah field.

## Konsumen menyediakan

`id` unik per field, `<label for>`, `aria-invalid` dan `aria-describedby` saat galat, `autocomplete` yang tepat.

## Jangan

- Label di dalam field yang hilang saat diketik.
- Radius pada input.
- Galat yang hanya ditandai warna merah tanpa teks.
