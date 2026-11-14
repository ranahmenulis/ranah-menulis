# NavPonsel

Kerangka ponsel (di bawah 768): bilah atas 52px, bilah bawah solid lima tab, dan tombol Tulis bulat.

- **Bilah atas 52:** wordmark kiri; kanan cari, lonceng, avatar.
- **Bilah bawah 56 + safe area:** latar `canvas`, garis atas 1px `line`, solid (bukan kapsul kaca). Beranda, Studio, Streak, Projects, Profil. Ikon 24 + label `text-xs`. Aktif `ink` 500 + ikon Fill.
- **Tombol Tulis:** lingkaran `ink` 56px, ikon pena `on-ink`, 16px di kanan dan 16px di atas bilah bawah; hanya di Beranda dan Studio. Ini satu-satunya isian tinta di layar itu, jadi tombol primer lain di layar yang sama memakai gaya sekunder.
- Kelola dan Admin lewat menu Profil.
- **Terbuka, dua varian [usulan]:** lima tab (PRD 16) atau empat tab (`rm-bottombar--4`: Beranda, Studio, Projects, Profil; Streak menjadi tab di dalam Studio). Kedua varian memakai judul "Studio" di bilah atas untuk tab Dokumen dan Streak. Perbandingan ada di kanvas aplikasi, papan "Bilah bawah ponsel". PRD 16 menetapkan lima tab; empat tab adalah usulan. **[konfirmasi]** ke client.
- Tombol Tulis tidak tampil di tab Streak, karena tab itu sudah punya tombol primer "Mulai menulis".
