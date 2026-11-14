# Logo

Logo RanahMenulis dipasang dari berkas aslinya di `public/logo/`, tidak pernah digambar ulang, diganti huruf serif, atau diberi warna.

## Berkas

| Pakai | Terang | Gelap dan bagian terbalik |
| --- | --- | --- |
| Wordmark (monogram R + "ranah." / "menulis") | `v-hitam-png.png` (aset Logo/v-hitam-png.png) | `v-putih-png.png` (aset Logo/v-putih-png.png) |
| Monogram R | `monogram-hitam.png`, hasil potong `logo-hitam.png` tanpa margin dengan latar dijadikan transparan | `logo-putih-aja.png` |

Pilih berkas menurut tema terdekat, bukan menurut tema halaman: di bagian daftar tunggu yang dibalik, halaman terang memakai versi putih. Di `bundle.css` ini diatur oleh `--rm-logo-light` dan `--rm-logo-dark` yang ikut cakupan `data-theme`.

## Ukuran dan ruang

- Wordmark: tinggi minimal 28px. Bilah atas landing 32 desktop dan 28 ponsel, footer 28, Open Graph 64.
- Monogram: 24 di bilah atas ponsel aplikasi, 20 di bilah editor. Minimal 20 [usulan].
- Ruang bebas di sekeliling wordmark minimal setinggi huruf "r" (sekitar 27% tinggi logo). Pada wordmark 32px: 9px.
- Bilah editor dan bilah atas ponsel aplikasi yang sempit memakai monogram saja. Bilah atas ponsel landing tetap memakai wordmark 28 karena muat bersama satu tombol.

## Jangan

- Mengganti logo dengan teks "RanahMenulis" dalam Source Serif atau huruf apa pun.
- Versi abu-abu, berwarna, bergaris tepi, atau berbayang.
- Memasang JPG berlatar putih (`horizontal-*.jpg`, `vertikal-*.jpg`) di atas `canvas` gelap.
- Memakai huruf logo untuk antarmuka.

Belum ada SVG; minta dari pembuat logo sebelum implementasi.
