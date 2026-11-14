# ButirFeed

Satu butir di feed Community tanpa kartu, dipisah garis rambut: butir karya (berjudul) atau butir catatan (teks langsung).

## Butir karya

- Padding vertikal 24, garis bawah 1px `line`.
- Baris atas `text-xs`: avatar 20 + "di **Grup** oleh **Nama** · 12 Nov" (nama 500 `ink`, sisanya `ink-muted`).
- `feed-title` serif 22/28 600 (ponsel 18/24), lalu `feed-excerpt` serif 16/26 `ink-muted` dipotong dua baris.
- Sumber feed hanya penulis yang diikuti dan Grup. Baris atas tidak pernah menyebut Kelas.
- Postingan karya di Community MVP hanya prolog atau cuplikan, maksimal 500 kata (COM-01). Baris bawah diawali penanda jujur [usulan]: "Prolog · Esai · 2 menit baca" atau "Cuplikan · Cerpen". Waktu baca boleh dihilangkan; bila ada, dihitung dari isi postingan, bukan karya penuh.
- Baris bawah `text-xs ink-muted` `tabular-nums`: kiri penanda, apresiasi dan komentar dengan ikon; kanan Simpan dan ⋯.
- Thumbnail 3:2 di kanan (160×107 desktop, 80×53 ponsel, radius 0) **hanya** bila karya punya gambar. Tidak ada kotak abu-abu pengganti.

## Butir catatan

- Avatar 32 + nama 500 + waktu, lalu teks serif 16/26 `ink` langsung tanpa judul, dipotong 8 baris dengan "Baca selengkapnya". Baris puisi dijaga (`pre-wrap`).
- Bilah aksi: Apresiasi, Komentar, Bagikan, Simpan.

## Jangan

Kartu berborder, bayangan, judul di atas gambar, gradien, tombol "bagikan ulang".
