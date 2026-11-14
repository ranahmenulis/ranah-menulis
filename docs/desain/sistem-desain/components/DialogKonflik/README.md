# Dialog konflik [usulan]

Muncul bila dokumen yang sama diubah di dua tempat sebelum tersinkron (PRD STD-02, BR-STD-04). Dua versi tampil berdampingan dan penulis wajib memilih. Tidak ada yang ditimpa diam-diam.

- `rm-float rm-dialog rm-conflict`, lebar maksimal 960. Ponsel: halaman penuh, dua versi bertumpuk.
- Tidak ada tombol tutup, `Esc` tidak menutup, dan klik di luar tidak menutup. Satu-satunya jalan keluar adalah memilih.
- Tiga pilihan (`rm-radio`): versi perangkat ini, versi dari perangkat lain, atau simpan keduanya (versi yang tidak dipilih menjadi dokumen baru di folder yang sama).
- Versi terpilih: border 2px `line-strong` (`is-picked`). Perbedaan ditandai monokrom: tambahan `rm-diff-add` (latar `subtle` + garis bawah), hapusan `rm-diff-del` (coret, `ink-muted`). Tidak ada hijau dan merah.
- Tombol primer "Lanjutkan" nonaktif sampai satu pilihan dibuat. Ini bukan tindakan berbahaya: tidak merah.
- Konsumen menyediakan: dua versi (sumber, waktu, jumlah kata, paragraf yang berbeda), pilihan, penangan simpan.
