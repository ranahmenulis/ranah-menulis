# Tombol

Tombol berbentuk pill dengan empat peran: primer, sekunder, teks, dan berbahaya; satu tombol primer per layar.

## Spesifikasi

| Peran | Tampilan | Hover | Press |
| --- | --- | --- | --- |
| Primer | Latar `ink`, teks `on-ink`, `text-sm` 500, tinggi 40 (kecil 32), padding 20 (kecil 16) | opacity `opacity-hover` 0.85 | opacity `opacity-press` 0.72 [usulan] |
| Sekunder | Border 1px `ink`, teks `ink`, latar transparan | latar `subtle` | latar `line` [usulan] |
| Teks | Tanpa border, `ink-muted` | `ink` | `ink` + garis bawah [usulan] |
| Berbahaya | Hanya di dialog konfirmasi: latar `danger`, label `on-ink` [usulan, lihat bawah]. Di tempat lain: tombol teks `danger` | opacity 0.85 | sama dengan primer |

- **Nonaktif:** opacity `opacity-disabled` 0.4, kursor bawaan. Selalu disertai alasan dalam satu kalimat `text-xs ink-muted` di sebelah atau di bawah tombol ("Kuota antologi sudah penuh."). Pakai `aria-disabled="true"` bila tombol harus tetap bisa difokus agar alasannya terbaca pembaca layar.
- **Memuat:** label tetap, tiga titik berdenyut di depan label, lebar tidak berubah (kunci `min-width` sebelum mengganti isi), `aria-busy="true"`.
- **Fokus keyboard:** outline 2px `ink`, offset 2px.
- **Transisi:** hanya `opacity` 120ms pada primer, hero, dan berbahaya. Perubahan warna latar sekunder dan warna teks terjadi seketika. Tanpa scale dan tanpa bayangan.
- **Tombol hero landing** (tinggi 48, padding 28, 16px) ada di komponen TombolHero.

## Isi

Kata kerja + objek: "Kirim ke proyek", "Mulai menulis", "Gabung daftar tunggu". Bukan "OK", "Submit", atau "Klik di sini". Tanpa tanda seru.

## Jangan

- Dua tombol terisi dalam satu layar.
- Tombol dengan radius selain pill.
- Label putih tetap pada tombol berbahaya: di mode gelap `danger` #ff8f87 dengan putih hanya 2,2:1. [usulan] Label memakai `on-ink` (putih di terang, #121212 di gelap, 8,5:1).
