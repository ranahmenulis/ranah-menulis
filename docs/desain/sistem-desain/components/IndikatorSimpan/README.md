# IndikatorSimpan

Teks kecil di bilah editor yang memberi tahu nasib tulisan; tidak pernah berupa toast.

| Keadaan | Tampilan |
| --- | --- |
| Menyimpan | "Menyimpan…", `text-xs ink-muted` |
| Tersimpan | "Tersimpan", `ink-muted`; setelah 3 detik menjadi "Tersimpan 14.02" (jam 24 jam, titik) |
| Belum tersinkron | Ikon awan-coret + "Belum tersinkron", `ink` 500, menetap sampai tersambung. **Bukan merah** |
| Konflik | Dialog konflik wajib, dua versi berdampingan |

- Urutan di bilah: judul dokumen (dipotong), penanda visibilitas, indikator simpan; kanan: jumlah kata `tabular-nums`, tombol primer kecil "Bagikan", ⋯, mode fokus.
- `role="status"` agar pembaca layar mendengar perubahan tanpa dipaksa.
- Di mode fokus, indikator dan jumlah kata tetap terlihat redup di pojok.
