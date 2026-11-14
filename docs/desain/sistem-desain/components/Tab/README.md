# Tab

Bilah tab teks dengan garis bawah, untuk berpindah tampilan di satu halaman (Mengikuti · Jelajahi, Semua · Komentar · Proyek).

- Teks `text-sm`. Aktif: `ink` + garis bawah 1px `line-strong`. Lainnya: `ink-muted`.
- Seluruh bilah bergaris bawah 1px `line`; garis tab aktif menimpa garis bilah.
- Jarak antartab 24. Di ponsel bilah bisa digulir mendatar.
- Tanpa latar pill di belakang tab aktif, tanpa ikon.
- `role="tablist"`, `role="tab"`, `aria-selected`; panah kiri/kanan berpindah tab.
- Garis bilah dan garis tab aktif digambar dengan `box-shadow` inset, bukan border bermargin negatif, supaya bilah yang bisa digulir tidak memunculkan scrollbar vertikal. Tab boleh berupa `<a>`; garis bawah tautan dimatikan.
- **Studio: Dokumen · Streak [usulan]:** bilah tab halaman di bawah judul "Studio". Dokumen membuka daftar dokumen dan folder; Streak membuka dasbor Streak. Di dalam Dokumen ada bilah tab kedua "Semua · Sampah" yang lebih kecil, dipisah oleh baris progres hari ini. Ini bukan tab bantuan editor (Kit inspirasi · Prompt), yang tetap di drawer bantuan.
