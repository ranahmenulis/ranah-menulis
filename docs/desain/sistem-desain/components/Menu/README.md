# Menu

Daftar aksi yang muncul dari tombol ⋯, bersudut tajam dengan aksi berbahaya di paling bawah.

- `surface`, border 1px `line`, `shadow-float` (terang saja), radius 0, lebar minimal 220.
- Butir `text-sm`, tinggi 36, padding 14. Hover: latar `subtle`.
- Aksi berbahaya di paling bawah setelah garis pemisah 1px `line`, teks `danger`. "Pindah ke sampah" bisa dibatalkan, jadi merah di sini [usulan] hanya bila aksinya tidak bisa dibatalkan; bila bisa, teks `ink`. Contoh di pratinjau mengikuti DESIGN.md 7.1.
- Menu ⋯ dokumen Studio: Kirim ke proyek, Ekspor, lalu Pindah ke sampah. Tanpa Riwayat versi: di PRD riwayat versi hanya ada untuk submission, bukan dokumen Studio.
- `role="menu"`, `role="menuitem"`, panah atas/bawah berpindah butir, `Esc` menutup.
