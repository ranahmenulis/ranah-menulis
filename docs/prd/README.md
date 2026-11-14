# Sumber PRD RanahMenulis

Satu file per bagian PRD. **Edit file di folder ini**, lalu jalankan:

```bash
python prd/gabung.py
```

Perintah itu menghasilkan ulang `PRD RanahMenulis v0.2.md` di folder induk. File gabungan itu hanya untuk dibaca atau dikirim; jangan diedit langsung karena akan tertimpa.

| File | Isi |
| --- | --- |
| `00-judul-dan-status.md` | Judul, status dokumen, dan konvensi |
| `01-ringkasan-produk.md` | 1. Ringkasan Produk |
| `02-visi-dan-misi.md` | 2. Visi dan Misi |
| `03-tujuan-bisnis.md` | 3. Tujuan Bisnis |
| `04-target-pengguna.md` | 4. Target Pengguna |
| `05-permasalahan-yang-ingin-diselesaikan.md` | 5. Permasalahan yang Ingin Diselesaikan |
| `06-solusi-produk.md` | 6. Solusi Produk |
| `07-struktur-keseluruhan-aplikasi.md` | 7. Struktur Keseluruhan Aplikasi |
| `08-penjelasan-detail-modul.md` | 8. Penjelasan Detail Modul |
| `09-daftar-fitur-setiap-modul.md` | 9. Daftar Fitur Setiap Modul |
| `10-kebutuhan-fungsional-setiap-fitur.md` | 10. Kebutuhan Fungsional Setiap Fitur |
| `11-kebutuhan-nonfungsional.md` | 11. Kebutuhan Nonfungsional |
| `12-user-stories.md` | 12. User Stories |
| `13-user-flows.md` | 13. User Flows |
| `14-business-rules.md` | 14. Business Rules |
| `15-sistem-role-dan-permission.md` | 15. Sistem Role dan Permission |
| `16-struktur-navigasi.md` | 16. Struktur Navigasi |
| `17-spesifikasi-halaman.md` | 17. Spesifikasi Halaman |
| `18-hubungan-antar-modul.md` | 18. Hubungan Antar Modul |
| `19-kebutuhan-integrasi.md` | 19. Kebutuhan Integrasi |
| `20-sistem-notifikasi.md` | 20. Sistem Notifikasi |
| `21-sistem-keamanan-dan-privasi.md` | 21. Sistem Keamanan dan Privasi |
| `22-sistem-monetisasi.md` | 22. Sistem Monetisasi |
| `23-ruang-lingkup-mvp.md` | 23. Ruang Lingkup MVP |
| `24-fitur-fase-kedua-dan-ketiga.md` | 24. Fitur Fase Kedua dan Ketiga |
| `25-kriteria-keberhasilan-produk.md` | 25. Kriteria Keberhasilan Produk |
| `26-acceptance-criteria.md` | 26. Acceptance Criteria |
| `27-risiko-dan-ketergantungan-teknis.md` | 27. Risiko dan Ketergantungan Teknis |
| `28-pertanyaan-dan-keputusan-yang-perlu-persetuju.md` | 28. Pertanyaan dan Keputusan yang Perlu Persetujuan Founder |

Aturan penulisan:
- Rujukan keputusan terbuka memakai nomor, misalnya (Q-19). Daftarnya ada di `28-*.md`.
- Bagian Streak dan Studio satu modul; nomor sub-bagian dipertahankan agar rujukan tidak putus.
- Catat setiap perubahan bermakna di `CHANGELOG.md`.
