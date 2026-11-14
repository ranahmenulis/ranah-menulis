# IndikatorTarget

[usulan] Kata hari ini dari semua dokumen, di bilah editor Studio; bergerak setiap simpan otomatis dan menunjukkan bahwa menulis menggerakkan Streak (DESIGN.md 5.4).

| Keadaan | Tampilan |
| --- | --- |
| Berjalan | Cincin 10px + **468 / 500** `ink` 500 + "hari ini" `ink-muted` |
| Tercapai | Cincin terisi sekali (`rm-dot-fill`, 300ms, `transform`), teks **500 / 500**. Tanpa toast, dialog, atau suara |
| Melebihi | Bulat penuh `rm-dot-full`, angka terus bertambah (**612 / 500**). Tanpa pesan baru |
| Offline | Tetap bergerak dari data lokal + "· tercatat saat tersambung" `ink-muted`. Setelah tersambung penanda hilang, angka tidak melompat |

- Selalu berbeda dari jumlah kata dokumen: dokumen "167 kata" (teks biasa), indikator memakai cincin, angka `ink` 500, dan kata "hari ini". `title`: "Kata hari ini dari semua dokumen".
- Angka berubah saat penyimpanan otomatis selesai, bukan setiap ketukan. Selama "Menyimpan…" angka indikator belum berubah.
- Berupa `<button>` teks; mengetuknya membuka popover (`rm-float rm-tgpop`, ponsel: selebar layar di bawah baris meta): kalimat utama, catatan bila ada, tiga dokumen teratas hari ini dengan jumlah katanya, streak saat ini, dan tautan "Buka Streak".
- Kalimat "Target hari ini tercapai. Streakmu naik menjadi 7 hari." hanya tampil di popover dan tab Streak, tidak pernah memotong menulis.
- Yang dihitung (PRD BR-STK-01, 08): kata bersih yang ditulis hari ini. Menghapus tulisan lama tidak mengurangi angka.
- Menghapus tulisan hari ini **[konfirmasi]**: PRD bertentangan. BR-STK-04 (usulan) mengurangi angka, tidak pernah di bawah nol; Q-08 (default) tidak mengurangi. Kedua opsi, juga "tercapai lalu dihapus" (dicabut atau tidak), digambar berdampingan di kanvas aplikasi, papan "Streak · menghapus tulisan hari ini, dua opsi". Papan lain masih menggambar opsi mengurangi.
- Teks tempel besar dihitung sebagian dengan catatan netral di popover. Ambang dan perilaku tepatnya **[konfirmasi]** (PRD Q-08, BR-STK-05).
- Bukan isian tinta: tidak menambah tombol terisi di bilah editor.
