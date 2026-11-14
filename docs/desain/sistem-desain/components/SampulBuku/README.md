# SampulBuku

Sampul buku ilustratif: bidang hitam dengan judul serif putih, dipakai di daftar, proyek, dan hero landing; tanpa gradien, bayangan, atau ilustrasi.

## Warna

Sampul selalu hitam di kedua tema: elemen sampul memakai cakupan `data-theme="light"`, sehingga latarnya `ink` terang #191919 dan teksnya `on-ink` #ffffff. Di mode gelap, pembungkus `.rm-cover-wrap` memberi garis 1px `line` (#2e2e2e) agar sampul tidak tenggelam di #121212 [usulan]. Di mode terang garis itu tidak ada.

## Ukuran [usulan]

Rasio 1 : 1,43 (buku 14 × 20 cm).

| Ukuran | Lebar | Dipakai | Isi |
| --- | --- | --- | --- |
| Kecil | 64 | Daftar (Proyek saya, Tersimpan) | Judul saja, 9px, maks. 3 baris. Dekoratif (`aria-hidden`), judul lengkap di teks sebelahnya |
| Sedang | 160 | Baris proyek | Judul + nama penulis |
| Besar | 300–360 | Hero landing | Judul + nama penulis, boleh dengan punggung buku |

## Tata letak [usulan]

- Margin semua sisi 10% lebar sampul (sedang 16px, besar 30–36px).
- Judul rata kiri di atas, Source Serif 4 400, ukuran 11% lebar (sedang 17,6px, besar 33–40px), jarak baris 1.08, tracking −0.015em, `text-wrap: balance`.
- Nama penulis rata kiri di bawah, Schibsted Grotesk 500, 5% lebar, maksimal 70% lebar agar tidak menabrak monogram.
- Judul panjang: lebih dari 40 karakter turun ke 9% lebar dengan maksimal 5 baris; sebelumnya maksimal 4 baris. Kelebihan dipotong elipsis lewat `line-clamp`. Ukuran kecil selalu maksimal 3 baris.
- Punggung buku (hanya ukuran besar): lebar 9% sampul, judul serif 13px vertikal, monogram putih 12px di kaki.

## Logo [usulan]

Logo tidak tampil di muka sampul. Paling banyak monogram R putih (`logo-putih-aja.png`) selebar 6% di pojok kanan bawah, sejajar margin, atau di kaki punggung buku. Wordmark tidak pernah dipakai di sampul.

## Jangan

Gradien, bayangan, tekstur, foto, ilustrasi, sudut membulat, sampul berwarna, judul di tengah dengan huruf kapital semua.
