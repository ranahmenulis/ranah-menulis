# Keadaan

Tiga keadaan yang wajib ada di setiap blok yang memuat data: kosong, memuat, dan galat.

- **Kosong:** satu kalimat serif `heading-md` 20/28 600 yang menyatakan keadaan + satu aksi. "Belum ada tulisan di sini." · [Mulai menulis]. Tanpa ilustrasi orang generik.
- **Memuat:** skeleton berbentuk konten asli (avatar, baris meta, judul, dua baris cuplikan) berlatar `subtle`, radius 0 kecuali avatar. Tidak ditampilkan bila data datang di bawah 300ms. Denyut opacity 1 → 0.55 selama 1,2 detik [usulan]; diam bila reduced-motion.
- **Galat:** banner `danger-subtle` + ikon `danger` + kalimat apa yang gagal (teks `ink`) + tombol sekunder "Coba lagi". Galat satu blok tidak mematikan blok lain.
- **Tidak tersedia / akses ditolak:** halaman satu kolom dengan kalimat penjelas dan tautan ke Beranda.
