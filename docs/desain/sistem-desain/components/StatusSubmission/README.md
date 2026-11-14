# StatusSubmission

Pill status karya yang dikirim ke proyek, monokrom: makin berisi, makin butuh tindakanmu.

| Status | Tampilan |
| --- | --- |
| Draf | Pill garis putus-putus `ink-faint` [usulan: warna garis belum ditentukan], teks `ink-muted` |
| Terkirim | Pill garis `line`, teks `ink` |
| Dalam Peninjauan | Pill garis `line`, ikon jam pasir |
| **Perlu Revisi** | Pill terisi `ink`, teks `on-ink` 500. Satu-satunya yang terisi untuk penulis |
| Revisi Terkirim | Pill garis `line`, teks `ink` |
| Diterima | Pill garis `line-strong`, ikon centang, 500 |
| Ditolak | Pill garis `line`, ikon silang, `ink-muted`. **Bukan merah** |
| Ditarik | Teks `ink-muted` tanpa pill dan tanpa ikon |

- Ukuran [usulan]: tinggi 24, padding 10, `text-xs`, ikon 14. DESIGN.md belum menentukan ukuran.
- Label teks selalu ada; ikon hanya pendukung.
- Di tampilan Organizer/Editor, yang terisi adalah status yang menunggu tindakan mereka (misalnya Terkirim).
- **Perlu Revisi bergaris [usulan]** (`rm-status--revisi-line`): garis `line-strong`, teks `ink` 500, tanpa isian. Dipakai di layar yang sudah punya tombol primer (Beranda), supaya hanya ada satu isian tinta. Di halaman Proyek saya dan detail submission tetap terisi.
