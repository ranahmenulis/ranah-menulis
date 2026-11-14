# Toolbar format [usulan]

Pill tinta yang muncul di atas teks yang dipilih, berisi lima format yang diizinkan PRD STD-01: Tebal, Miring, Judul, Kutipan, Daftar.

- Tidak pernah tampil permanen. Muncul 8px di atas seleksi, berpusat pada seleksi; hilang saat seleksi kosong.
- `rm-fmtbar`: tinggi 40, `radius-full`, latar `ink`, ikon dan huruf `on-ink`. Di terang memakai `shadow-float` karena mengambang di atas teks; di gelap tanpa bayangan.
- Format yang aktif diberi garis bawah 2px `on-ink`, bukan latar lain, supaya tetap monokrom.
- Setiap tombol punya `aria-label` dan `aria-pressed`. Tombol keyboard: Ctrl+B, Ctrl+I.
- Ponsel: posisi sama, di atas seleksi; tidak ada bilah format di atas papan ketik.
- Konsumen menyediakan: posisi seleksi, keadaan format aktif, penangan klik.
