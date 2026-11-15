# Riwayat Perubahan PRD RanahMenulis

## v0.2, tambahan sementara 14 November 2026

Sumber: daftar MVP dari client (Dashboard / Beranda masuk Supporting Platform). **Seluruh perubahan di bawah bersifat sementara dan ditinjau ulang setelah desain jadi.**

- Dashboard ditambahkan sebagai fitur PLT-10: blok "Hari ini" di atas feed Beranda, bukan halaman terpisah (bagian 9.1, 10.1, 16, 17.1, 23, US-41, US-42, AC-D1 sampai AC-D3, Q-49).
- Alasan penempatan: bilah bawah ponsel (bagian 16) hanya berisi Beranda, Studio, Streak, Projects, Profil, sehingga Beranda adalah satu-satunya pintu ke Community di ponsel.
- Tidak ada tabel data baru; blok membaca data Studio, Streak, Projects, dan notifikasi yang sudah ada.
- PRD Ringkas belum diperbarui.

## v0.2, revisi 9 November 2026

Sumber: diskusi tim dan tambahan dari Agile Fahmi (WhatsApp).

**Hak akses**
- Super Admin ditambahkan sebagai role tertinggi (root). Hanya Super Admin yang memberi dan mencabut role Administrator (bagian 15.1 sampai 15.3, matriks 15.2 dengan kolom baru, PLT-03, PLT-05, US-37, AC-SA1 sampai AC-SA4, SEC-17, R-19).
- Setiap akun baru berperan Registered User; role lebih tinggi hanya diberikan (PLT-01, AC-SA1).
- Super Admin pertama dibuat lewat penyiapan awal, minimal satu Super Admin selalu aktif.
- Batas wewenang Super Admin: "akses semua" berlaku untuk pengelolaan platform. Dokumen pribadi tetap hanya dibaca atas alasan hukum yang tercatat, dan audit log tidak dapat diubah siapa pun. Ini usulan yang menunggu persetujuan (Q-03).

**Grup Penulis**
- Grup dibuat oleh Administrator, yang juga mengundang anggota; grup berada di bawah Administrator (15.4, US-38).
- Satu grup boleh memiliki lebih dari satu Admin Grup (15.1, 15.4, US-39, AC-G4).
- Logo grup ditambahkan sebagai fitur Fase 2 (PLT-09, US-40, bagian 24.1).
- Q-41 diperbarui. Q-48 baru: hubungan Administrator pembuat grup dengan Admin Grup.

**Penyesuaian rujukan**
- Panel admin (17.6), navigasi (16), ruang lingkup MVP (23), dan aturan BR-STD-05 disesuaikan dengan Super Admin dan Admin Grup jamak.
- PRD Ringkas ikut diperbarui.

## v0.2 (8 November 2026)

Sumber: diskusi lanjutan dan rapat 8 November 2026 (transkrip di `transrip.md`).

**Struktur produk**
- Ranah Streak digabung ke Studio: satu modul, satu alur data. Sub-bagian dipisah menjadi area Streak dan area Menulis, nomor bagian dipertahankan, ID fitur STK dan STD tetap.
- Modul inti menjadi tiga: Studio (dengan Streak), Community, Projects.
- Marketplace ditambahkan setelah MVP: jual-beli karya atau buku hasil lomba dan penerbitan, terpisah dari Community. Rincian belum ditentukan (Q-39).
- Studio memuat kit inspirasi dan tab bantuan (STD-11), serta perpustakaan prompt siap salin untuk ChatGPT atau Claude. Tidak ada fitur AI di dalam aplikasi.
- Community di MVP berupa postingan prolog atau cuplikan yang diatur publik, tanpa DM. Publikasi karya penuh ditunda ke Fase 2 (COM-12).

**Hak akses**
- Grup Penulis dengan admin grup, termasuk peran Anggota Grup dan Admin Grup (bagian 15.1 dan 15.4). Anggota hanya melihat data di grupnya sendiri. Cakupan visibilitas tulisan menunggu Q-38 dan Q-41.

**Teknologi dan pembayaran**
- Satu proyek Next.js (monolith) dengan Supabase di MVP.
- Hanya database yang pindah ke VPS saat sudah penuh dipakai. Login tetap di Supabase Auth. Self-host Supabase tidak dipilih (bagian 19.3).
- Pembayaran IDR lewat QRIS buatan sendiri (webhook di VPS), awalnya semi-manual dengan dashboard admin. Pembayaran MYR dan gateway resmi di Fase 2.
- Aplikasi Play Store dan App Store: dibungkus dari versi web setelah web stabil, tergantung Q-40.

**Jadwal dan monetisasi**
- Target pengerjaan satu bulan (Desember 2026), bertahap per modul (Q-44). Estimasi audit lebih panjang, perlu ditinjau.
- Di MVP semua fitur gratis. Fitur berbayar dipilih setelah semua matang (Q-43).

**Dokumen**
- Penanda `[KONFIRMASI]` diganti rujukan nomor keputusan, misalnya (Q-19). Keputusan baru: Q-38 sampai Q-47.
- Empat diagram digambar ulang sebagai Mermaid (bagian 7, 13.1, 13.2, 18).
- User stories bertambah US-29 sampai US-36.
- Risiko R-16 sampai R-18, kriteria uji AC-G1 sampai AC-G3 dan AC-M1.
- PRD dipecah per bagian di folder `prd/`; file gabungan dihasilkan dengan `python prd/gabung.py`.

## Revisi 15 November 2026 (brief landing client)

- Keputusan baru Q-50 (program Community: Writer Battle, Roast My Writing, The Writers Confess), Q-51 (isi Marketplace diperluas: jasa kepenulisan, info pekerjaan, event literasi), dan Q-52 (waktu baca di Studio). Landing menampilkan ketiganya; yang belum masuk MVP diberi label "Menyusul".
- Positioning "Digital Writing Ecosystem" dipakai di landing tanpa menyebut segmen agama (keputusan 15 November 2026); bagian 1, 2, dan 4 tidak berubah.

## Belum dikerjakan

- Bagian 9 (daftar fitur), 10 (kebutuhan fungsional), 12 (user stories), dan 26 (acceptance criteria) masih memuat ID fitur yang sama dalam empat bentuk. Penggabungan jadi satu tabel per fitur sebaiknya dilakukan setelah desain disetujui, supaya tidak dikerjakan dua kali.
- Streak dan Studio masih dua area dengan nomor sub-bagian terpisah. Penggabungan fisik dan penomoran ulang menunggu rapihnya rujukan antarbagian.
- Keputusan terbuka yang memengaruhi desain: Q-03 (batas wewenang dan dokumen pribadi), Q-48 (admin grup), Q-38 (visibilitas tulisan di grup), Q-39 (isi Marketplace), Q-40 (aplikasi store), Q-43 (bantuan ejaan berbayar), Q-44 (target waktu).
- Keamanan dan kebijakan penyedia untuk QRIS lewat sesi merchant belum dikaji (bagian 19.2, Q-19).
