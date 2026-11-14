# NavDesktop

Kerangka desktop (1024 ke atas): bilah atas 56px bergaris bawah dan sidebar kiri 240px yang bisa disembunyikan.

- **Bilah atas:** tombol sidebar + wordmark; kolom cari pill `subtle` 240px; kanan "Tulis" (ikon pena + teks, tombol teks), lonceng dengan titik `ink` 6px bila ada yang belum dibaca, avatar 32.
- **Sidebar:** Beranda, Studio dengan satu sub-butir Streak menjorok di bawahnya (`rm-nav-item--sub`, tinggi 36, tanpa ikon, teks sejajar label Studio), Projects, Tersimpan, Profil; garis; Kelola dan Admin hanya bila punya peran; garis; daftar Grup saya. Butir tinggi 40, ikon 24.
- **Aktif:** teks `ink` 500 + ikon varian Fill. Lainnya `ink-muted`. Tanpa latar pill di belakang butir aktif.
- Placeholder kolom cari memakai `ink-muted`, bukan `ink-faint`, karena berada di atas `subtle` [usulan].
- Ikon digambar ulang mengikuti gaya Phosphor Regular; ganti dengan paket Phosphor asli saat implementasi.
- **Studio dan Streak satu modul** (DESIGN.md 5.3): Streak bukan butir sejajar. Saat tab Streak terbuka, sub-butir Streak yang aktif (`ink` 500) dan Studio tetap `ink-muted` dengan ikon Regular. Sub-butir [usulan].
