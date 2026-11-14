# Chip

Pill kecil untuk genre, filter, dan pilihan minat yang bisa dipilih lebih dari satu.

- Tinggi 32, padding 14, `radius-full`, latar `subtle`, teks `text-sm` `ink`.
- Terpilih: latar `ink`, teks `on-ink`. Hover (belum terpilih): latar `line` [usulan].
- Dibuat sebagai `<button aria-pressed>` di dalam grup ber-`aria-label`. Di Kelola dan Admin, chip filter berada di atas tabel.
- Tanpa ikon, tanpa tanda silang kecuali chip filter yang bisa dihapus.
- Jangan memakai chip sebagai label status: status submission punya komponen sendiri.
