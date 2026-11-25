# Catatan Development RanahMenulis (Backend)

Sumber status terkini untuk pekerjaan backend (Supabase). Pekerjaan UI dan data dummy ada di [catatan-development-fe.md](catatan-development-fe.md). **Wajib dibaca di awal setiap permintaan yang menyentuh backend.** Perbarui di akhir setiap sesi yang mengubah status.

Terakhir diperbarui: **25 November 2026**.

## 1. Posisi sekarang

- **Fase 0 (fondasi) selesai.** Supabase CLI 3.2.0 terpasang sebagai devDependency (jalankan lewat `npx supabase ...`). Project `hejuhznagqeayrmautqh` (akun ranahmenulis@gmail.com, region ap-southeast-2) tertaut lewat `supabase link`; berkas `supabase/config.toml` dari `supabase init`. Migrasi 0001 (`profiles`, `platform_roles`, `audit_log`, fungsi role, RLS) dan 0002 (`waitlist_signups`) sudah ada di database dan tercatat di riwayat migrasi. Tes RLS (20 tes, 3 berkas) lulus.
- **Fase 1 (Auth dan profil): 1a, 1b, dan 1c selesai di kode.** 1c menunggu pengaturan Auth hosted dari user untuk menguji tautan email dari awal sampai akhir. Berikutnya 1d (Mulai dan Pengaturan: profil, username, foto, ganti sandi, hapus akun). Checklist di bagian 3.
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
Keputusan: foto profil ikut Fase 1 (bucket `avatars`); email verifikasi memakai email bawaan Supabase dengan konfirmasi menyala (kuota kecil dan mungkin hanya ke alamat tim: perlu diuji di 1c, cadangan = matikan konfirmasi sementara). Masih (?): saklar peran demo untuk peran Kelola nonplatform dipertahankan sampai Fase 4 (dipakai sebagai bawaan); pengaturan Auth hosted dilakukan user (Site URL dan Redirect URLs untuk domain Vercel dan localhost, kebijakan sandi minimal 8 dengan huruf dan angka).

- [x] **1a. Migrasi 0003 dan tes RLS** (selesai 25 November 2026)
  - [x] Kolom `profiles.prefs jsonb` (objek, maks. 8 KB) dan `profiles.onboarded_at`; `avatar_path` hanya boleh di folder pemilik
  - [x] Bucket `avatars` (publik, 256 KB, webp/jpeg/png) dengan policy baca publik dan tulis hanya di folder sendiri
  - [x] Diterapkan ke database dengan persetujuan user dan tercatat di riwayat
  - [x] Tes RLS: `prefs`, `onboarded_at`, `avatar_path`, bucket (32 tes lulus, 4 berkas)
- [x] **1b. Sesi dan gateway (tanpa perubahan layar)** (selesai 25 November 2026)
  - [x] `AccountGateway` (tulis profil; Supabase di produksi, tiruan di tes). `AuthGateway` (masuk, keluar, daftar) menyusul di 1c bersama layarnya
  - [x] Layout root: `AuthRoot` (server) membaca sesi lewat `getClaims`, profil, dan `platform_roles` dengan sesi pengguna (RLS berlaku), lalu `AuthProvider` (klien) memegang akunnya
  - [x] `useViewer` dan `readViewerNow` mengikuti sesi bila ada provider; `?sebagai=` tidak bisa memasukkan atau mengeluarkan siapa pun. Tanpa provider (tes) perilaku lama
  - [x] `useAccount`/`readAccount` bersumber dari akun sesi; `saveAccount` tetap sinkron (optimistis, tulis di belakang, kembali bila ditolak) dan ada `saveAccountAsync` yang menunggu hasil. Layar yang perlu menampilkan kegagalan pindah ke versi async di 1d
  - [x] Peran platform dari database digabung ke `useEffectiveRoles` (`administrator`, `super-admin`)
  - [x] Tes: pemetaan profil, `readSession` (dengan tiruan), `AuthProvider`, peran. Uji end-to-end terhadap `next start` dengan akun uji dan cookie sesi: nama, email, dan peran terbaca di server, tamu tidak melihatnya
- [x] **1c. Masuk, Daftar, Keluar, Verifikasi, Lupa dan Atur ulang sandi** (selesai di kode 25 November 2026; menunggu pengaturan Auth hosted dari user untuk tautan email)
  - [x] Route handler `/auth/callback` (PKCE): tukar kode dengan sesi, lalu ke `next`; kode hilang, ditolak, atau galat ke `fail`; `next` dan `fail` hanya jalur dalam aplikasi (`internalPath`)
  - [x] `AuthGateway` (`auth-gateway.ts`): `supabaseAuthGateway` di aplikasi, `dummyAuthGateway` bila tanpa provider (tes). Masuk, Daftar, Keluar, kirim ulang verifikasi, minta tautan sandi, ganti sandi. Galat dipetakan ke kode (`credentials`, `unverified`, `exists`, `password`, `same`, `expired`, `limit`, `network`)
  - [x] Daftar: alamat terdaftar baru diketahui saat kirim (Supabase tidak membocorkannya; deteksi lewat `identities` kosong), lalu kembali ke langkah 1 dengan pesan; Verifikasi menyebut alamat dari `sessionStorage` tab (`pending-email.ts`)
  - [x] Lupa sandi menjawab sama untuk alamat terdaftar atau tidak; Atur ulang sandi menampilkan "kedaluwarsa" bila tautan tidak menghasilkan sesi, dan keluar setelah berhasil
  - [x] Tombol Google disembunyikan sampai Google sungguhan ada (Fase 5); tombol contoh di Verifikasi dan Lupa sandi hanya untuk gateway simulasi
  - [x] Keluar di Pengaturan memakai gateway lalu `router.refresh()`
  - [x] Tes: tes form lama diperbarui menjadi async, `real-auth.test.tsx` (gateway nyata di semua form), `supabase-auth-gateway.test.ts` (pemetaan galat), `tests/app/auth/callback.test.ts`, `internalPath`
  - [x] Uji Chrome nyata terhadap Supabase (8 dari 8): sandi salah, masuk ke Mulai dengan tujuan terjaga, Pengaturan menampilkan email akun, Keluar, setelah Keluar akun tidak tampil, Daftar ke Verifikasi (email asli terkirim ke `AUTH_TEST_EMAIL`), tanpa tautan contoh, tanpa tombol Google
  - [ ] Pengaturan Auth hosted oleh user (daftar di bagian "Pengaturan Auth hosted" di bawah); setelahnya uji tautan email dari awal sampai akhir (klik tautan di kotak masuk)
- [ ] **1d. Mulai dan Pengaturan**
  - [ ] Profil dibaca dan ditulis ke database
  - [ ] Cek username ke database; galat 23505 ditangani; handle penulis fixture tetap dicadangkan
  - [ ] Preferensi (notifikasi, streak, menulis) di `prefs`
  - [ ] Foto profil ke bucket `avatars` (pangkas 256 px WebP di klien, simpan `<id>/avatar.webp`, `avatar_path` di profil)
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

### Pengaturan Auth hosted (dilakukan user di dasbor Supabase)

Authentication, URL Configuration:
- **Site URL:** `https://ranah-menulis.vercel.app` (alamat produksi).
- **Redirect URLs** (tambahkan semuanya; `/**` mengizinkan jalur apa pun di bawahnya): `https://ranah-menulis.vercel.app/**`, `http://localhost:3000/**`, `http://localhost:3001/**`, dan untuk preview Vercel pola `https://*.vercel.app/**` (bila ingin menguji dari preview).
- Tanpa daftar ini Supabase mengabaikan `redirectTo` dan tautan email berujung di Site URL.

Authentication, sign-in/providers, Email:
- **Confirm email:** tetap menyala.
- **Minimum password length:** 8. **Password requirements:** huruf dan angka (aplikasi memeriksa hal yang sama sebelum mengirim; aturan server hanya cadangan).

Opsional: Authentication, Email Templates, terjemahkan templat ke bahasa Indonesia (templat bawaan berbahasa Inggris dan polos). Jangan mengubah variabel `{{ .ConfirmationURL }}`.

## 4. Keputusan user

- 25 November 2026: branch baru `be/supabase` untuk semua backend, `main` dibiarkan dummy FE sampai backend matang; pakai project Supabase cloud (bukan Docker lokal); login email dan sandi dulu, Google menyusul; akun dummy disiapkan untuk pengujian (bukan impor data lokal); feedback front-end berjalan paralel (user meminta tester menguji lagi dan akan memberi tahu hasilnya); gate setiap fase = tes RLS dan tes terarah, `npm run check` dan `build` sekali di akhir fase.

## 5. Log sesi

### 25 November 2026 (1c)
- Dikerjakan: `auth-gateway*`, `dummy-auth-gateway`, `supabase-auth-gateway`, `pending-email`, `app/auth/callback/route.ts`, form Masuk, Daftar, Verifikasi, Lupa sandi, Atur ulang sandi, Keluar di Pengaturan; teks baru `errors.network`, `errors.limit`, `reset.same`, `verify.sent*`, `verify.resentReal` (id dan en). `AuthProvider` menyediakan gateway nyata; tanpa provider forms memakai gateway simulasi sehingga 153 tes akun lama tetap berlaku setelah dijadikan async.
- Gate: `tsc`, ESLint, Prettier, tes akun, app, lib (300 tes), `npm run build`, dan uji Chrome nyata (8 dari 8). Pengguna uji `AUTH_TEST_EMAIL` dibersihkan lagi dengan `--cleanup`; database kosong.
- Batas yang diketahui: tautan email memakai PKCE, jadi harus dibuka di peramban yang sama dengan yang meminta (verifier di cookie); di peramban lain tautan berujung "kedaluwarsa" dan layar mengarahkan ke Masuk (yang menawarkan kirim ulang). Perbaikan menyeluruh (templat dengan `token_hash`) butuh ubah templat email di dasbor.
- Pelajaran: heredoc Bash dengan kutip campur gagal diurai tanpa menjalankan apa pun (tulis berkas lewat Write); Chrome headless berbahasa Inggris, paksa cookie `locale=id` bila menguji teks Indonesia; regex pencari blok tes bisa mengenai blok lain, periksa `git diff` setelah menyunting tes lewat skrip.

### 25 November 2026 (1b)
- Dikerjakan: `src/lib/auth/{session-info,session-context}`, `src/features/account/{account-model,account-session,account-gateway,supabase-account-gateway,profile-mapping,session,session-types,auth-root,live-account-context}`; `account-store` memakai akun sesi bila ada; `viewer.ts`, `use-effective-roles.ts`, `app/layout.tsx` disesuaikan. Gate: `tsc`, ESLint, Prettier, 24 tes baru, regresi 101 berkas (641 tes) dan 44 berkas (287 tes), `npm run build` (tetap Partial Prerender).
- **Pelajaran penting (bug yang lolos dari tes unit):** modul bertanda `"use client"` yang diimpor kode server hanya menjadi referensi buram: `parseAccount()` dari `account-store` melempar galat di server dan `GUEST_SESSION` dari `session-context` menjadi referensi, sehingga `readSession` selalu jatuh ke tamu. Vitest tidak menegakkan batas ini. Perbaikan: bagian murni dipisah ke modul tanpa direktif (`account-model.ts`, `session-info.ts`) dan `account-store`/`session-context` mengekspor ulangnya. **Aturan: kode yang dipakai server tidak boleh mengimpor nilai dari modul `"use client"`.** Verifikasi pembacaan di server harus lewat `next start` dengan cookie sesi nyata, bukan hanya tes unit.
- Cara uji end-to-end yang dipakai (skrip sementara, sudah dihapus): buat akun `rls-test-*` dengan klien admin, masuk lewat `@supabase/ssr` dengan penampung cookie sendiri, kirim cookie `sb-<ref>-auth-token` ke `next start -p 3055`, cari nama dan email di HTML. Data uji dihapus di `finally`.
- Pengguna uji email (`AUTH_TEST_EMAIL`) dihapus lewat `--cleanup`; ternyata sudah terkonfirmasi (tautan diklik).
- Di layar saat ini pengguna tanpa sesi terlihat sebagai tamu (Masuk dan Daftar belum berfungsi sampai 1c). Branch `be/supabase` jangan dipakai sebagai preview untuk tester sebelum 1c.

### 25 November 2026 (uji email Auth)
- `scripts/auth-email-check.mjs` (alamat dari `AUTH_TEST_EMAIL` di `.env`, tidak pernah dicetak; `--cleanup` menghapus pengguna uji). `signUp` diterima, konfirmasi email menyala, dan email konfirmasi masuk ke Kotak Masuk dalam kurang dari satu menit (pengirim `noreply@mail.app.supabase.io`, templat bawaan Supabase berbahasa Inggris, tombol "Confirm email address").
- Belum diketahui: apakah alamat di luar tim project ikut menerima email, kuota per jam, dan ke mana tautan konfirmasi mengarah (bergantung Site URL, diatur user di dasbor). Templat email masih bahasa Inggris dan polos; dapat diubah di dasbor (Authentication, Email Templates) bila perlu.

### 25 November 2026 (1a)
- Keputusan user: foto ikut Fase 1; email bawaan Supabase. Migrasi `0003_profil_preferensi_dan_foto.sql` ditulis, dry-run, diterapkan dengan `--yes` setelah persetujuan, lalu 32 tes RLS lulus. Branch `be/supabase`; commit awal `cbb5f36`.

### 25 November 2026 (Fase 0)
- Docker Desktop tidak dipakai; CLI Supabase 3.2.0 dipasang (npm memilih 3.2.0 karena `min-release-age=7`, 3.4.0 terlalu baru). Project di akun yang sedang login di CLI awalnya hanya `phcumddometvumlbkjdw` (paused); project yang dimaksud user adalah `hejuhznagqeayrmautqh`, ada di akun lain; setelah user login ulang CLI, project terlihat.
- `db push` pertama gagal: `relation "profiles" already exists`. Pemeriksaan baca-saja menunjukkan 0001 sudah terpasang lengkap (tiga tabel, enam fungsi, empat policy, RLS aktif, trigger), tanpa pengguna, profil, atau role; satu baris `audit_log` lama (14 November) dibiarkan. 0001 dicatat `applied`, 0002 didorong. `migration list --remote` cocok.
- Tes RLS ditulis dan lulus (20 tes). Satu tes salah asumsi (Administrator memang boleh melihat semua role) dibetulkan. Berkas: `tests/rls/{helpers,profiles,roles-and-audit,waitlist}`, `vitest.rls.config.mts`, script `test:rls`, `tests/rls/**` dikecualikan di `vitest.config.mts`.
- Pelajaran: perintah `db push`, `db query`, dan `migration repair` di agent mode butuh `--yes` (dan `--read-only` untuk query baca); koneksi langsung ke database gagal tanpa IPv6, pooler IPv4 baru tersimpan setelah project aktif penuh. `catatan-development.md` diganti nama menjadi `catatan-development-fe.md`; `CLAUDE.md` mengimpor FE dan BE.
