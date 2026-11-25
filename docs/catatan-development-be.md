# Catatan Development RanahMenulis (Backend)

Sumber status terkini untuk pekerjaan backend (Supabase). Pekerjaan UI dan data dummy ada di [catatan-development-fe.md](catatan-development-fe.md). **Wajib dibaca di awal setiap permintaan yang menyentuh backend.** Perbarui di akhir setiap sesi yang mengubah status.

Terakhir diperbarui: **25 November 2026**.

## 1. Posisi sekarang

- **Fase 0 (fondasi) selesai.** Supabase CLI 3.2.0 terpasang sebagai devDependency (jalankan lewat `npx supabase ...`). Project `hejuhznagqeayrmautqh` (akun ranahmenulis@gmail.com, region ap-southeast-2) tertaut lewat `supabase link`; berkas `supabase/config.toml` dari `supabase init`. Migrasi 0001 (`profiles`, `platform_roles`, `audit_log`, fungsi role, RLS) dan 0002 (`waitlist_signups`) sudah ada di database dan tercatat di riwayat migrasi. Tes RLS (20 tes, 3 berkas) lulus.
- **Fase 1 (Auth dan profil): rencana disusun dan diubah menjadi checklist (bagian 3); menunggu jawaban atas keputusan bertanda (?) dan persetujuan untuk mulai 1a.** Belum ada kode Fase 1.
- **Branch:** semua pekerjaan backend di branch `be/supabase` (dibuat 25 November 2026 dari `main` `5d2d5c1`). `main` tetap versi front-end dengan data dummy sampai backend matang; perbaikan tampilan dari tester masuk ke `main`, lalu `main` digabung ke `be/supabase` secara berkala. Branch ini belum di-push dan belum di-commit apa pun.
- Frontend masih memakai bypass login, `dummy-auth`, dan data lokal (localStorage, IndexedDB). Belum ada akun nyata.

## 2. Lingkungan dan cara kerja

- **Database yang dipakai: project cloud di atas, bukan Docker lokal** (keputusan user 25 November 2026; Docker Desktop tidak dipakai). CLI menandainya `production`, dan project ini sekaligus dipakai produksi Vercel (form daftar tunggu). User mengonfirmasi isinya kosong saat Fase 0.
- **CLI di agent mode menolak mengubah database hosted tanpa `--yes`.** Pakai `--yes` hanya setelah user menyetujui secara eksplisit di percakapan. Query baca-saja: `npx supabase db query --remote --read-only "<sql>"`.
- **`--remote` wajib** untuk `db push`, `db query`, dan `migration list` (bawaan CLI ini adalah database lokal). Koneksi lewat pooler IPv4 (`supabase/.temp/pooler-url`, dibuat saat `link` setelah project aktif); jaringan ini tidak punya IPv6.
- **Sebuah project yang di-pause berstatus `INACTIVE`** dan harus di-restore dari dasbor oleh user (dibutuhkan beberapa menit: `COMING_UP`, `RESTORING`, lalu `ACTIVE_HEALTHY`). Paket gratis mem-pause project yang lama tidak aktif.
- **Riwayat migrasi:** migrasi 0001 sempat dijalankan manual lewat SQL Editor sebelum ada CLI, sehingga riwayatnya kosong; dicatat dengan `migration repair --status applied 0001`. Jangan ubah skema lewat dasbor; semua lewat berkas di `supabase/migrations/`.
- **Tes RLS** (`npm run test:rls`, `vitest.rls.config.mts`, `tests/rls/`): berjalan ke database cloud, bukan bagian `npm test` atau CI. Membuat akun uji berawalan `rls-test-` lewat service role dan membersihkannya (termasuk baris audit yang ditimbulkannya). Kunci diambil dari `.env.local` atau `.env` saat berjalan; jangan dibaca atau ditampilkan. Tambah tes setiap kali migrasi mengubah tabel atau policy.
- **Rahasia:** `.env*` jangan dibaca atau disalin. `SUPABASE_SECRET_KEY` hanya untuk kode server dan tes RLS.

## 3. Checklist backend

Satu daftar untuk semua fase. Centang `[x]` beserta tanggal dan commit saat selesai. Gate tiap sub-langkah: `tsc`, ESLint, Prettier, tes terarah (dan `npm run test:rls` bila skema atau policy berubah); `npm run check` dan `npm run build` sekali di akhir fase. Tanda **(?)** = menunggu keputusan user.

### Fase 0, fondasi (selesai 25 November 2026)
- [x] Pasang Supabase CLI (devDependency) dan `supabase init`
- [x] Tautkan ke project `hejuhznagqeayrmautqh`
- [x] Terapkan migrasi 0001 dan 0002, catat riwayat
- [x] Tes RLS awal: profil, role, audit log, daftar tunggu (20 tes) dan `npm run test:rls`
- [x] Pisah catatan development menjadi FE dan BE

### Fase 1, Auth email dan sandi, profil
Keputusan yang masih dibutuhkan (?): foto profil ikut Fase 1 atau Fase 3; email verifikasi hidup atau dimatikan sementara; saklar peran demo untuk peran Kelola nonplatform dipertahankan sampai Fase 4; pengaturan Auth hosted dilakukan user (Site URL dan Redirect URLs untuk domain Vercel dan localhost, kebijakan sandi minimal 8 dengan huruf dan angka).

- [ ] **1a. Migrasi 0003 dan tes RLS**
  - [ ] Kolom `profiles.prefs jsonb` dan `profiles.onboarded_at`
  - [ ] Bucket `avatars` dengan policy (baca publik, tulis hanya pemilik) (?)
  - [ ] Terapkan ke database (minta persetujuan sebelum `--yes`) dan catat riwayat
  - [ ] Tes RLS: pemilik menulis `prefs`, orang lain tidak; bucket
- [ ] **1b. Sesi dan gateway (tanpa perubahan layar)**
  - [ ] `AuthGateway` dan `AccountGateway` (Supabase dan memori)
  - [ ] Layout root membaca sesi di server (`getClaims`) dan mengoper akun awal ke `AuthProvider`
  - [ ] `useViewer` diturunkan dari sesi
  - [ ] `useAccount`/`readAccount` bersumber dari profil; `saveAccount` async, pemanggil disesuaikan
  - [ ] Tes gateway memori dan penyedia
- [ ] **1c. Masuk, Daftar, Keluar, Verifikasi, Lupa dan Atur ulang sandi**
  - [ ] Route handler `/auth/callback` (PKCE)
  - [ ] Masuk, Daftar (dua langkah), Keluar ke gateway; galat dipetakan ke kode
  - [ ] Verifikasi dan kirim ulang email; Lupa dan Atur ulang sandi
  - [ ] Pengguna tanpa username diarahkan ke `/mulai`
  - [ ] Daftar pengaturan Auth hosted untuk user (Site URL, Redirect URLs, sandi, konfirmasi email)
- [ ] **1d. Mulai dan Pengaturan**
  - [ ] Profil dibaca dan ditulis ke database
  - [ ] Cek username ke database; galat 23505 ditangani; handle penulis fixture tetap dicadangkan
  - [ ] Preferensi (notifikasi, streak, menulis) di `prefs`
  - [ ] Foto profil ke bucket (?)
  - [ ] Ganti sandi dengan verifikasi ulang sandi lama
  - [ ] Hapus akun (Server Action, klien admin, kata HAPUS/DELETE)
- [ ] **1e. Bersih-bersih dan akun dummy**
  - [ ] Hapus `dummy-auth`, bypass login, tombol "simulasi" di Verifikasi dan Lupa sandi, identitas di `ViewerSync`
  - [ ] Saklar `NEXT_PUBLIC_DEMO_ROLES` hanya untuk peran Kelola nonplatform (?)
  - [ ] Skrip seed akun dummy untuk pengujian
  - [ ] Tulis ulang tes akun (±14 berkas) dengan gateway memori
- [ ] **1f. Verifikasi dan serah**
  - [ ] `npm run check`, `npm run build`, `npm run test:rls`
  - [ ] Uji Chrome klik dan keyboard: daftar, masuk, keluar, lupa sandi, hapus akun
  - [ ] Perbarui `CLAUDE.md`, panduan uji, catatan FE dan BE
  - [ ] Uji di preview Vercel (branch `be/supabase`) setelah push dengan persetujuan user

### Fase 2, Studio (dokumen)
- [ ] Migrasi: `documents`, `folders`, `document_versions`, `daily_log`, target (RLS pemilik saja) dan tes RLS
- [ ] `DocumentStore` versi Supabase (nomor versi untuk konflik, potret versi, arsip, sampah)
- [ ] Impor data lokal (IndexedDB) ke akun, bila diminta user
- [ ] Naskah buku: folder `kind=book`, bab berurutan, sampul
- [ ] Verifikasi: tes terarah, tes RLS, uji dua tab dan dua akun

### Fase 3, Community
- [ ] Migrasi: postingan, komentar, marks, lingkar menulis, event, laporan; RLS menurut visibilitas dan keanggotaan; tes RLS
- [ ] `PostStore` versi Supabase dan Storage untuk gambar (RLS Storage diuji)
- [ ] Privasi lingkar, leaderboard, moderasi di server
- [ ] Notifikasi Community dari server

### Fase 4, Projects dan Kelola
- [ ] Migrasi: proyek, pendaftaran, kiriman, tugas, tahap Solo, penilaian, penugasan peran, pembayaran, audit; tes RLS per peran
- [ ] Penggantian store: `SubmissionStore`, `AssignmentStore`, `SoloStore`, `FileStore`, `local-list-store`
- [ ] Pembayaran QRIS sungguhan (penyedia belum diputuskan)
- [ ] Notifikasi dan email transaksional dari server
- [ ] Hapus saklar demo peran

### Fase 5, penutup
- [ ] Login Google (butuh OAuth client Google Cloud)
- [ ] Email lewat Resend setelah domain dibeli
- [ ] Gate penuh, audit keamanan, uji menyeluruh, merge `be/supabase` ke `main`

## 4. Keputusan user

- 25 November 2026: branch baru `be/supabase` untuk semua backend, `main` dibiarkan dummy FE sampai backend matang; pakai project Supabase cloud (bukan Docker lokal); login email dan sandi dulu, Google menyusul; akun dummy disiapkan untuk pengujian (bukan impor data lokal); feedback front-end berjalan paralel (user meminta tester menguji lagi dan akan memberi tahu hasilnya); gate setiap fase = tes RLS dan tes terarah, `npm run check` dan `build` sekali di akhir fase.

## 5. Log sesi

### 25 November 2026 (Fase 0)
- Docker Desktop tidak dipakai; CLI Supabase 3.2.0 dipasang (npm memilih 3.2.0 karena `min-release-age=7`, 3.4.0 terlalu baru). Project di akun yang sedang login di CLI awalnya hanya `phcumddometvumlbkjdw` (paused); project yang dimaksud user adalah `hejuhznagqeayrmautqh`, ada di akun lain; setelah user login ulang CLI, project terlihat.
- `db push` pertama gagal: `relation "profiles" already exists`. Pemeriksaan baca-saja menunjukkan 0001 sudah terpasang lengkap (tiga tabel, enam fungsi, empat policy, RLS aktif, trigger), tanpa pengguna, profil, atau role; satu baris `audit_log` lama (14 November) dibiarkan. 0001 dicatat `applied`, 0002 didorong. `migration list --remote` cocok.
- Tes RLS ditulis dan lulus (20 tes). Satu tes salah asumsi (Administrator memang boleh melihat semua role) dibetulkan. Berkas: `tests/rls/{helpers,profiles,roles-and-audit,waitlist}`, `vitest.rls.config.mts`, script `test:rls`, `tests/rls/**` dikecualikan di `vitest.config.mts`.
- Pelajaran: perintah `db push`, `db query`, dan `migration repair` di agent mode butuh `--yes` (dan `--read-only` untuk query baca); koneksi langsung ke database gagal tanpa IPv6, pooler IPv4 baru tersimpan setelah project aktif penuh. `catatan-development.md` diganti nama menjadi `catatan-development-fe.md`; `CLAUDE.md` mengimpor FE dan BE.
