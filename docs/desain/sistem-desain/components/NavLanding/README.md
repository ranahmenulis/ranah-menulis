# NavLanding

Bilah atas halaman pra-peluncuran: wordmark serif di kiri, tiga tautan dan satu tombol pill di kanan.

- Tinggi `landing-bar` 64px desktop [usulan], 52px ponsel. Lebar mengikuti `landing-container` 1200.
- Wordmark: "RanahMenulis" Source Serif 4 600, 22px desktop, 18px ponsel, tanpa simbol (logo belum diputuskan).
- Tautan `text-sm ink-muted` → `ink` saat hover, jarak 28: Cara kerja, Projects, Tanya jawab. Masing-masing menggulir ke bagiannya.
- Tombol "Gabung daftar tunggu" kecil (32) menggulir ke form.
- Garis bawah 1px `line` muncul seketika setelah halaman digulir; di posisi teratas bilah menyatu dengan hero.
- **Satu tombol terisi per layar** [usulan, disetujui]: tombol bilah atas sekunder selama tombol hero terlihat; primer setelah tombol hero lewat di bawah bilah; kembali sekunder saat bagian daftar tunggu (yang punya tombol terisinya sendiri) terlihat. Pergantian seketika, tanpa animasi. Berlaku sama di ponsel.
- Ponsel: wordmark dan tombol saja, tanpa menu hamburger.
