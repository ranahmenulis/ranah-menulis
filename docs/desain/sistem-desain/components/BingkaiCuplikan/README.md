# BingkaiCuplikan

Cara menampilkan potongan layar aplikasi di landing: komponen asli dalam bingkai garis rambut, tanpa kartu berbayang dan tanpa tiruan jendela browser.

- [usulan] Bingkai: border 1px `line`, radius 0, latar `canvas`, tanpa bayangan, tanpa titik tiga warna ala jendela, tanpa keterangan di bawahnya.
- Isi dirender dengan komponen yang sama dengan aplikasi (bilah editor, butir feed, kalender, status) dan isi tulisan sungguhan. Bukan gambar tangkapan layar dan bukan kotak abu-abu.
- Skala 1:1 pada desktop; di ponsel bingkai selebar kolom dan isinya memakai ukuran ponsel, bukan diperkecil.
- Hanya potongan yang membuktikan satu kalimat di sebelahnya. Satu bingkai, satu ide.
- `<figure>` dengan `aria-label` yang menyebut apa yang ditunjukkan.
- Tombol terisi di dalam cuplikan (misalnya "Bagikan" di bilah editor) adalah bagian dari ilustrasi; bila layar yang sama sudah punya tombol primer, tampilkan cuplikan dengan tombol sekunder [usulan] agar aturan satu isian tinta per layar tetap terjaga.
