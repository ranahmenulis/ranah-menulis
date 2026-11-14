# Dialog

Lapisan modal bersudut tajam untuk keputusan yang menghentikan alur; di ponsel menjadi lembar bawah selebar layar.

- Desktop: lebar 480, padding 24, `surface`, border 1px `line`, `shadow-float` (gelap: tanpa bayangan). Radius 0.
- Judul `heading-md`, isi `text-sm ink-muted`, aksi di kanan bawah, primer paling kanan.
- Overlay `rgba(0,0,0,0.4)`, tanpa blur. Nilai ini bukan token warna; dipakai langsung.
- Ponsel: lembar bawah menempel di bawah, border atas `line`, padding 24/16 + safe area, tombol utama selebar lembar. Tanpa pegangan seret [usulan]: ditutup lewat tombol atau ketuk overlay.
- Tindakan yang tidak bisa dibatalkan: tombol berbahaya (`danger`), kalimat yang menyebut persis apa yang hilang dan apa yang tetap aman.
- Konsumen menyediakan: judul, isi, dua aksi; fokus dikunci di dalam dialog, `Esc` menutup, fokus kembali ke pemicu.
