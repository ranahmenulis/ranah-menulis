# Catatan Development RanahMenulis (Backend)

Sumber status terkini untuk pekerjaan backend (Supabase). Pekerjaan UI dan data dummy ada di [catatan-development-fe.md](catatan-development-fe.md). **Wajib dibaca di awal setiap permintaan yang menyentuh backend.** Perbarui di akhir setiap sesi yang mengubah status.

Terakhir diperbarui: **26 November 2026** (Fase 5 audit keamanan penuh selesai lewat migrasi `0009`–`0010` & hardening API/klien; seluruh 6 gate lulus: format, lint, typecheck, 310 berkas / 2.406 tes, build 73 rute, & RLS 9 berkas / 77 tes).

## 1. Posisi sekarang

- **Fase 0 (fondasi) selesai.** Supabase CLI 3.2.0 terpasang sebagai devDependency (jalankan lewat `npx supabase ...`). Project `hejuhznagqeayrmautqh` (akun ranahmenulis@gmail.com, region ap-southeast-2) tertaut lewat `supabase link`; berkas `supabase/config.toml` dari `supabase init`. Migrasi 0001 (`profiles`, `platform_roles`, `audit_log`, fungsi role, RLS) dan 0002 (`waitlist_signups`) sudah ada di database dan tercatat di riwayat migrasi. Tes RLS (20 tes, 3 berkas) lulus.
- **Fase 1 (Auth dan profil) selesai di kode dan diuji (1a sampai 1f).** Pengaturan Auth hosted (Site URL, Redirect URLs, panjang sandi 8, syarat huruf kecil+besar+angka+simbol) sudah diisi user. Tersisa: uji tautan email dengan alamat tim dan uji di preview Vercel. Berikutnya Fase 2 (Studio), rencana dulu. Checklist di bagian 3.
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

### Pelajaran kerja yang berulang

- **Berkas env** proyek ini `.env` (bukan `.env.local`). Jangan membaca atau mencetak isinya (termasuk `.env.seed`); skrip memuatnya lewat `process.loadEnvFile(".env")`.
- **Sesi di server:** `await connection()` sebelum membaca sesi (jam dibaca saat verifikasi token; Next 16 menolaknya saat prerender). Kode server tidak boleh mengimpor nilai dari modul `"use client"`.
- **Store dokumen:** `studioStore` (Proxy di `storage/remote/switching-store.ts`) memilih akun atau perangkat per panggilan lewat `client.auth.getSession()`, bukan React (efek anak berjalan sebelum efek provider). Id bukan UUID (mis. `baru`) dibaca null. Tes komponen yang memakai `studioStore` me-mock modulnya; tes yang memuat `AuthProvider` me-mock `@/features/account/delete-account`.
- **Uji Chrome (CDP)** dengan skrip sementara di scratchpad (bukan di repo): Node bawaan (`WebSocket`, `fetch`), Chrome headless di port khusus (cek `netstat` dulu untuk sisa Chrome atau server lama, hentikan per PID, jangan `taskkill /IM node.exe`), `next dev -p 3056` cukup. Panggil `Target.activateTarget` sebelum memakai tiap tab; tunggu ±5 detik hidrasi sebelum mengetik di form; klik lewat `Input.dispatchMouseEvent` setelah `scrollIntoView({behavior:'instant'})`; Enter dengan `text: String.fromCharCode(13)` (`
` di skrip yang dibuat lewat Python atau heredoc menjadi karakter asli dan merusak sintaks); akun uji lewat klien admin dan dibersihkan di `finally`.
- **Tes:** pernyataan fokus pakai `waitFor`; peringatan kompleksitas ESLint 15 dihindari dengan memindah kondisi `&&` ke prop (`===` tidak dihitung). Tes penuh `--maxWorkers=2 --reporter=dot` ±20 menit di latar, jangan bersamaan dengan `build`.

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
- [x] **1d. Mulai dan Pengaturan** (selesai 25 November 2026)
  - [x] Profil dibaca dan ditulis ke database lewat `AuthProvider`/`live-account.ts`: tampil seketika, ditulis di belakang, dikembalikan bila ditolak; hasil simpan rinci (`ok`, `username-taken`, `photo-failed`, `failed`)
  - [x] Username unik: galat 23505 dari database (`username-taken`) kembali ke kolomnya di Mulai dan Pengaturan dan hilang saat username diubah; handle penulis fixture tetap dicadangkan (`useProfileForm`)
  - [x] Mulai menandai profil selesai (`profiles.onboarded_at`); pengunjung tanpa akun di Mulai diarahkan ke Masuk dengan tujuan terjaga
  - [x] Preferensi (notifikasi, streak, menulis, sematan kata) ikut `prefs`; Pengaturan Menulis dan sematan kata di Editor menunggu hasil sungguhan (`saveAccountAsync`) sehingga kegagalan terlihat
  - [x] Foto profil: dikecilkan 256 px WebP di klien, diunggah ke `avatars/<id>/avatar.webp` (ganti = timpa), lalu `avatar_path` ditulis; hapus foto menghapus berkas dan path. Foto diunggah lebih dulu agar baris tidak menunjuk berkas yang tidak ada
  - [x] Ganti sandi: sandi lama dibuktikan dulu (`signInWithPassword`), baru `updateUser`; salah, sama dengan yang lama, lemah, dan gangguan koneksi punya pesan sendiri
  - [x] Hapus akun: Server Action `deleteOwnAccount` (identitas dari sesi terverifikasi, tanpa argumen), klien admin menghapus berkas foto, menulis satu baris audit `account.delete` (hanya id), menghapus pengguna (profil dan peran ikut lewat cascade), lalu mengakhiri sesi
  - [x] Tes: `live-account`, `supabase-account-gateway`, `supabase-auth-gateway` (ganti sandi, hapus), `delete-account`, `photo-blob`, `profile-real` (Mulai, ganti sandi, hapus dengan gateway nyata), tes Mulai dan Pengaturan lama dijadikan async
  - [x] Uji Chrome nyata terhadap Supabase (21 dari 21): masuk ke Mulai, foto dipilih lewat input berkas, username terpakai ditolak di kolomnya tanpa menyimpan apa pun, username sendiri tersimpan, baris profil berisi nama dan `onboarded_at` dan `avatar_path`, berkas foto ada di Storage dan terbaca publik, Pengaturan menyimpan dan nama bertahan setelah muat ulang, sandi lama salah ditolak lalu yang benar mengubah (sandi baru berfungsi, lama tidak), hapus akun (akun, profil, foto hilang, satu baris audit, tampilan masuk hilang)
- [x] **1e. Bersih-bersih dan akun dummy** (selesai 25 November 2026)
  - [x] Hapus `dummy-auth`, bypass login, tombol "simulasi" di Verifikasi dan Lupa sandi, `ViewerSync`, flag `simulated`. `usernameTaken` pindah ke `reserved-usernames.ts`
  - [x] Saklar `NEXT_PUBLIC_DEMO_ROLES` dan `?sebagai=` dicabut seluruhnya di branch ini (keputusan user; `main` tetap sampai akun dummy berperan siap). Peran Kelola nonplatform kelak dari akun dummy berperan (Fase 4)
  - [x] `scripts/seed-test-accounts.mjs` (penulis, Administrator, Super Admin; `--cleanup`; sandi acak ke `.env.seed`). Sudah dijalankan: tiga akun `seed-*@seed.ranahmenulis.test` ada di database
  - [x] Gateway memori `src/test/memory-auth-gateway.ts` dipasang lewat `tests/setup.ts` (`setFallbackAuthGateway`); tes recovery-flow ditulis ulang, tes lain tetap
  - [x] Aturan sandi aplikasi disamakan dengan pengaturan Supabase (huruf kecil, huruf besar, angka, simbol; `PASSWORD_PARTS` di `validation.ts`, ceklis lima aturan di Daftar)
- [x] **1f. Verifikasi dan serah** (selesai 25 November 2026; tautan email dari awal sampai akhir belum diuji)
  - [x] `format:check`, `lint` (satu peringatan lama), `typecheck`, tes penuh (297 berkas, 2.341 tes; tujuh yang gagal karena contoh sandi lama sudah diperbaiki dan diulang: tes akun 240 lulus), `npm run build`, `npm run test:rls` (32 lulus)
  - [x] Uji Chrome nyata terhadap Supabase, 19 dari 19: sandi salah, masuk lewat Enter ke tujuan tersimpan, nama dan email dari database, sesi bertahan setelah muat ulang, Keluar dengan klik mouse, ceklis aturan sandi, validasi Lupa sandi, Atur ulang tanpa tautan (kedaluwarsa), hapus akun sementara lewat UI (akun dan profil hilang), nol error JS
  - [ ] Perbarui panduan uji PDF dan uji di preview Vercel `be/supabase` setelah push (butuh persetujuan user)
  - [ ] Uji tautan email (Daftar dan Lupa sandi) dengan alamat tim

### Fase 2, Studio (dokumen)
Keputusan user (25 November 2026, semua rekomendasi): impor data lokal lewat tombol sekali jalan, isi dokumen maks. 2 MB, log harian disimpan sebagai tanggal menurut zona profil saat itu, sampul di bucket privat `studio-covers`, push `be/supabase` setelah Fase 2 lulus, seed dibiarkan sampai Fase 4.
- [x] Migrasi 0004 (`studio_folders`, `studio_documents`, `studio_versions`, `studio_daily_log`, fungsi `studio_*`, bucket `studio-covers`) dan tes RLS `tests/rls/studio.test.ts` (selesai 25 November 2026; diterapkan, 47 tes RLS lulus). Klien hanya membaca tabel dokumen, versi, dan log; penulisan lewat fungsi security definer.
- [x] `DocumentStore` versi Supabase (selesai 25 November 2026, `storage/remote/`: `supabase-store`, `row-mapping`, `save-plan`, `switching-store`, `import-local`; `studioStore` memilih per panggilan: akun bila ada sesi, perangkat bila tamu). Sampul masih berkas lokal (belum Storage).
- [x] Fungsi impor data lokal ke akun (`importFromDevice`, aman diulang) dan banner di tab Naskah (26 November 2026)
- [x] **Fase 2 selesai di kode dan gate (26 November 2026):** sampul lewat bucket `studio-covers` (`src/lib/files/supabase-file-store.ts`, `src/features/studio/storage/cover-store.ts`, `useBookCover`, `FolderCover`, dan `importFromDevice` ikut mengunggah sampul lokal; kompresi otomatis WebP lewat `compressImage`), target harian (`dailyTargets`) ikut `profiles.prefs` saat masuk (`account-model.ts`, `useStreakData`, `useDailyTarget`), tes unit baru (`supabase-file-store`, `import-local`, `use-streak-data`), `npm run test:rls` 60 lulus, `format:check`, `lint` (0 error, 1 warning lama), `typecheck`, `npm run build` (71 halaman, Partial Prerender), dan tes penuh 305 berkas 2.383 tes lulus. Menunggu persetujuan user untuk commit, push `be/supabase`, uji preview Vercel, dan uji tautan email.

### Fase 3, Community (selesai di kode, gate, dan uji browser nyata 26 November 2026)
- [x] Migrasi `0005_community.sql` dan `0006_community_draft_rls_fix.sql`: postingan, komentar, marks (`community_post_counts`), lingkar menulis (grup, anggota, undangan, permintaan gabung, leaderboard, sembunyi), event, laporan, moderasi, kurasi `editor_picks`, dan bucket publik `community-images` (maks. 2 MB WebP); tes RLS `tests/rls/community.test.ts` (7 berkas, 65 tes RLS lulus). `deleteOwnAccount` ikut membersihkan `community-images`.
- [x] `PostStore` versi Supabase (`community/storage/remote/`: `supabase-post-store`, `row-mapping`, `switching-post-store`) + unggah gambar WebP ke `community-images` di `usePostImage`.
- [x] Privasi lingkar, leaderboard, event, kurasi, dan moderasi di server (`createLocalListStore` dengan `RemoteListSync` di `remote-community-lists.ts`, plus sinkronisasi `event-store.ts`).
- [x] Notifikasi Community dari server (`useCommunityNotifications` tersambung ke store Supabase).
- [x] Uji browser nyata 3 akun (Chrome CDP terhadap Supabase cloud, 18 dari 18 lulus, nol error JS): buat lingkar privat, unggah gambar WebP ke `community-images`, terbit tulisan publik & grup privat, isolasi grup privat dari Akun B (Jelajahi & URL langsung), komentar/apresiasi/simpan/lapor Akun B, moderasi Admin (`/kelola/admin/moderasi` sembunyikan → tulisan hilang dari Akun B), `/notifikasi` Admin, dan bersih total. Temuan & perbaikan: `row-mapping.ts`, `remote-community-lists.ts`, dan `event-store.ts` sebelumnya memetakan pengguna saat ini ke `"me"` alih-alih `ME_ID` (`"rinjani-putri"`), sehingga keanggotaan grup tidak tersimpan/terbaca di `/tulis`; sudah diperbaiki.

### Fase 4, Projects dan Kelola
Keputusan user (26 November 2026): pembayaran QRIS sementara memakai gateway self-hosted **PaymentGT** (pola sama dengan `beyond-studio`: `PAYMENTGT_BASE_URL`, `PAYMENTGT_API_TOKEN`, `PAYMENTGT_WEBHOOK_SECRET`, webhook HMAC-SHA256 `X-PaymentGT-Signature` + polling cadangan); pembagian sub-langkah 4a → 4b → 4c → 4d disetujui.
- [x] **4a.** Migrasi `0007_projects_dan_kelola.sql`: proyek, pendaftaran, kiriman, tugas, tahap Solo, penilaian, penugasan peran, pembayaran, audit, bucket `project-posters` & `project-files`; tes RLS per peran (`projects.test.ts` 6 + `kelola.test.ts` 4; total `npm run test:rls` 9 berkas, 75 tes lulus, 26 November 2026)
- [x] **4b.** Penggantian store: `SubmissionStore` (`supabase-submission-store`), `AssignmentStore` (`supabase-assignment-store`), `SoloStore` (`supabase-solo-store`), `FileStore` (`project-posters` & `project-files` + bersih di `deleteOwnAccount`), serta sinkronisasi `registration-store`, `material-progress`, `mentor-task-store`, `stage-store`, dan store Kelola/Support (`remote-project-lists`, `remote-project-maps`, `remote-kelola-lists`, `remote-support-lists`) (26 November 2026)
- [x] **4c.** Pembayaran QRIS via PaymentGT (`src/lib/paymentgt.ts`, `POST/GET /api/payments/qris`, `POST /api/paymentgt/webhook` dengan HMAC-SHA256 & polling cadangan, `QrisChargeCard` di `PayWaiting`, `.env.example` & `env.server.ts`), pembacaan `staff_roles` & `account_suspensions` di `readSession` (`session.ts`), perluasan `scripts/seed-test-accounts.mjs` untuk peran `organizer`, `editor`, `mentor`, `juri`, dan tes unit PaymentGT/webhook/session (26 November 2026)
- [x] **4d.** Gate Fase 4 lulus (26 November 2026): `format:check`, `lint` (0 error, 1 warning lama), `typecheck`, `npm run build` (73 rute termasuk `/api/payments/qris` & `/api/paymentgt/webhook`, Partial Prerender), `npm run test:rls` (9 berkas, 75 tes), dan tes Projects/Kelola (104 berkas, 947 tes lulus). Uji Chrome CDP lintas peran terhadap Supabase cloud lulus **14/14** (26 November 2026): menemukan & memperbaiki constraint `project_submissions_status_check` (`0008_fix_submission_status_check.sql`, `'peninjauan'` alih-alih `'ditinjau'`) serta menyambungkan `jury_submissions` RPC di `SubmissionStore.listForJudge` / `useJudgeData`.

### Fase 5, penutup
- [x] Login Google (selesai di kode 26 November 2026: `continueWithGoogle` di `supabase-auth-gateway.ts` memakai `signInWithOAuth({ provider: "google" })`, `/auth/callback` memeriksa `onboarding=1` untuk mengarahkan pengguna baru ke `/mulai` dengan `lanjut` terjaga; tes unit 26 berkas 255 tes lulus)
- [ ] Email lewat Resend (env `.env.example` & panduan disiapkan; ditunda sampai domain dibeli)
- [x] Audit keamanan penuh & hardening (`0009_security_hardening.sql`, `0010_fix_rls_helpers.sql`, verifikasi harga QRIS di server, proteksi CSRF/SSRF/path-traversal/XSS/RLS, header `next.config.ts`)
- [x] Gate penuh lulus (26 November 2026): `format:check`, `lint` (0 error), `typecheck`, `npm test` (310 berkas, 2.406 tes), `npm run build` (73 rute), dan `npm run test:rls` (9 berkas, 77 tes)
- [ ] Push `be/supabase` dan merge `be/supabase` ke `main` (menunggu persetujuan eksplisit user)

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

### 26 November 2026 (Fase 5, Audit Keamanan Penuh & Gate)
- **Temuan audit yang ditutup:** (1) *Amount tampering* di `POST /api/payments/qris` (nominal kini dihitung di server dari `public.projects` / `projectFixtures`, ditambah cek CSRF `Origin` + `Content-Type`); (2) *Payment bypass* di RLS `project_registrations` & `QrisChargeCard` (`0009` membatasi `terdaftar` hanya untuk proyek gratis / `can_manage_project` / `service_role`); (3) Intrusi grup privat & elevasi `is_admin` pada `group_members` (`0009` + `group-sync-helpers.ts`); (4) *Self-approval* status pada `project_submissions` & `class_assignments`, serta `writing_events` dibatasi untuk `organizer`/`admin`; (5) Akun Admin yang ditangguhkan kini kehilangan hak `is_admin()`/`has_platform_role()`, celah AC-SA3 pada `revoke_platform_role` diperbaiki, dan parameter `p_user` fungsi bantu dikunci dari pengintaian lintas-akun (`0010` memulihkan `EXECUTE` bagi `anon` agar policy `SELECT` publik tetap berjalan aman); (6) *Cross-slug spoofing* pada `jury_scores`, `solo_progress`, `testimonial_decisions` (lewat `submission_matches_slug`/`testimonial_matches_slug` di `0010`, serta `slug` diteruskan dari `decideTestimonial`), dan pembatasan bucket `project-files`; (7) Anti-SSRF IPv4/IPv6 + `redirect: "error"` di `paymentgt.ts`, validasi positif nominal & batas ukuran body di `/api/paymentgt/webhook`, deduplikasi `payment_events`; (8) Anti-path-traversal di `createSupabaseFileStore`, `avatarUrl`, & constraint DB; validasi `https:` di `ExternalLink`, sanitasi HTML pratinjau `FlowContent`, sumber gambar `community_posts`, paginasi hapus berkas di `deleteOwnAccount`, serta header `Cross-Origin-Opener-Policy` & CSP statis non-nonce di `next.config.ts`.
- **Gate penuh (26 November 2026):** `npm audit --omit=dev --audit-level=high` (0 vulnerabilities), `npm run format:check` (bersih), `npm run lint` (0 error, 1 warning lama di `pending-dialogs.tsx`), `npm run typecheck` (bersih), `npm test -- --maxWorkers=2 --reporter=dot` (310 berkas, 2.406 tes lulus), `npm run build` (73 rute, Partial Prerender), dan `npm run test:rls` (9 berkas, 77 tes lulus). Siap push dan merge ke `main` setelah persetujuan eksplisit user.

### 25 November 2026 (Fase 2, adaptor Supabase)
- Dikerjakan: `src/features/studio/storage/remote/` (adaptor, pemetaan baris, rencana simpan, store pemilih, impor), `store.ts` memakai store pemilih (sesi dibaca asinkron lewat `client.auth.getSession()`, bukan React, supaya efek anak tidak mendahului provider), `deleteOwnAccount` ikut menghapus berkas `studio-covers`, `vitest.rls.config.mts` mendapat alias `@`.
- Aturan simpan tetap di TypeScript: `planRemoteSave` menghasilkan angka yang sama dengan `commitSave` (dibuktikan tes paritas 7 skenario). Satu simpan = 3 baca kecil (versi dan kata dokumen, baris log hari ini, versi terbaru tanpa isi) + 1 panggilan `studio_save_document`; isi dokumen sebelumnya hanya dimuat bila simpan menghapus banyak teks.
- Catatan perilaku: potret berkala membandingkan isi dengan versi terbaru tanpa memuat isinya, jadi simpanan yang isinya identik dengan potret terakhir bisa membuat satu potret ekstra (tanpa kerugian data). Penyimpanan tamu tetap di IndexedDB.
- Gate: `tsc`, ESLint, Prettier bersih; tes unit baru (46 tes di `tests/features/studio/storage` dan hapus akun); `npm run test:rls` 60 tes lulus (13 tes adaptor terhadap database sungguhan: simpan, konflik, targets/layout, potret, arsip, jenis dan tag, salin, buku, impor dua kali, isolasi antar akun); `vitest related` 27 berkas 250 tes lulus.
- **Uji Chrome nyata lulus (26 November 2026, 15 dari 15, `next dev` di port 3056, dua akun sementara lewat klien admin, keduanya dihapus sesudahnya):** masuk, ketik di Editor, dokumen dan log harian masuk ke database akun, muat ulang menampilkan teks dari akun, daftar Naskah menampilkannya, tab kedua menyimpan versi 2 dan 3, tab pertama yang basi tidak menimpa (versi tetap 3, dialog konflik muncul), akun B tidak melihat dokumen A di daftar maupun lewat alamatnya dan alamat itu tidak membuat baris untuk B, nol error JS. Pelajaran alat: tab headless yang tidak di depan tidak merender (badan kosong); panggil `Target.activateTarget` sebelum memakai tiap tab. Server dev perlu ±5 detik hidrasi sebelum mengetik di form Masuk.
- **Galat `Date.now()` di `AuthRoot` selesai (26 November 2026):** muncul hanya pada permintaan yang membawa cookie sesi (11 kali di satu uji dua akun), karena `getClaims` membaca jam saat Next memvalidasi prerender. Perbaikan: `await connection()` sebelum `createClient()` di `readSession` (`features/account/session.ts`). Diukur di `next dev`: 11 galat sebelum, 0 sesudah (uji dua tab dua akun 15 dari 15 tetap lulus); `npm run build` berhasil dan rute tetap Partial Prerender; tes `session.test.ts` mem-mock `next/server`.
- **Banner impor dari perangkat selesai (26 November 2026, rencana disetujui dengan dua rekomendasi):** `DeviceImport` di tab Naskah (`components/works/device-import.tsx`, `hooks/use-device-import.ts`, kamus `studioImport`). Muncul untuk siapa pun yang masuk bila perangkat punya dokumen atau folder berid UUID yang belum ada di akun (`pendingImport` menghitung selisih id, tanpa menulis). "Nanti saja" melipatnya jadi tautan "Salin naskah dari perangkat ini (N)" (disimpan per akun di localStorage `ranah.deviceImportDismissed.<id>`, fokus pindah ke tautan); tautan membuka banner lagi. Hasil menerima fokus; galat menahan banner dengan Coba lagi; yang ditolak database tetap di perangkat dan banner tinggal tautan. Riwayat versi tidak disalin, perangkat tidak dihapus. `store.ts` mengekspor `accountSession()` (klien + store) dan `accountStore` menurunkannya. Lulus: `tsc`, ESLint, Prettier, tes baru (`pending-import`, `device-import` 8), `test:rls` 60, tes studio dan i18n 598, uji Chrome nyata 16 dari 16 (tamu menulis, masuk, banner, Nanti saja, tetap terlipat setelah muat ulang, Enter membuka dan menyalin, fokus di hasil, dokumen di database, tanpa tawaran sesudahnya, 375 px tanpa overflow, nol error JS) dan uji dua tab dua akun diulang 15 dari 15.
- **Sampul lewat Storage dan Streak/Statistik akun (26 November 2026):** `createSupabaseFileStore` (`src/lib/files/supabase-file-store.ts`) dan `coverFileStore` (`src/features/studio/storage/cover-store.ts`) mengarahkan sampul buku (`useBookCover`, `FolderCover`) ke bucket privat `studio-covers` (`<ownerId>/<fileId>`, otomatis WebP lewat `compressImage`) saat ada sesi dan ke IndexedDB saat tamu; `fileStore()` global untuk poster, postingan, dan Solo tidak diubah. `importFromDevice` ikut menyalin berkas sampul lokal ke `studio-covers`. Target harian (`dailyTargets`) ditambahkan ke `AccountPrefs` (`profiles.prefs`) lewat `parseTargetChanges` (`target-setting.ts`), dipakai `useStreakData` dan `useDailyTarget` saat masuk (tetap `localStorage` untuk tamu).
- **Gate akhir Fase 2 (26 November 2026):** tes unit baru (`supabase-file-store` 3, `import-local` sampul, `use-streak-data` 2), `npm run test:rls` (6 berkas, 60 tes lulus), `format:check`, `lint` (0 error, 1 warning lama di `pending-dialogs.tsx`), `typecheck`, `npm run build` (71 rute, Partial Prerender), dan tes penuh `vitest run --maxWorkers=2 --reporter=dot` (305 berkas, 2.383 tes lulus). Siap commit dan push `be/supabase` atas persetujuan user.

### 25 November 2026 (Fase 2, migrasi 0004)
- Rencana disetujui dengan semua rekomendasi. SQL ditulis, divalidasi dengan `BEGIN ... ROLLBACK` di database cloud, lalu diterapkan (`db push --remote --yes`). `test:rls`: 5 berkas, 47 tes lulus (15 baru untuk Studio). Database sesudah tes: tiga akun seed, tanpa dokumen atau berkas sisa.
- Desain: aturan hitung tetap di TypeScript; `studio_save_document` menjamin atomisitas, nomor versi, dan penggabungan log harian (kata per dokumen digabung ke hari itu, aktivitas ditambahkan). Hasil konflik: `{ok:false, conflict}`. Baris dikembalikan sebagai `to_jsonb` (snake_case, timestamp ISO); adaptor memetakan ke camelCase dan milidetik.
- Belum: adaptor `supabase-store` di belakang `store.ts`, `deleteOwnAccount` belum menghapus berkas `studio-covers`, tombol impor dari perangkat, sampul lewat Storage, uji dua tab dan dua akun, `npm run check` dan `build`.

### 25 November 2026 (1d)
- Dikerjakan: `account-gateway` (hasil simpan rinci, foto), `live-account.ts` (simpan profil dan foto di belakang layar), `photo-blob.ts`, `use-save-profile.ts`, `delete-account.ts` (Server Action), `AuthGateway.changePassword` dan `deleteAccount`, Mulai, Pengaturan, dialog ganti sandi dan hapus akun, teks baru (`personal.failedRemote`, `personal.photoFailed`, `changePassword.failed`, `deleteDialog.failed`; id dan en).
- Gate: `tsc`, ESLint, Prettier, tes akun, lib, app, app-shell, word-count (392 tes lulus; satu tes word-count dijadikan async), `npm run build`, uji Chrome nyata 21 dari 21. Data uji (dua akun `rls-test-*`, foto, baris audit) dibersihkan; database kembali kosong.
- Catatan: `passwordChangedAt` ("Terakhir diubah") hanya hidup di memori sesi, belum disimpan (tidak ada kolomnya). Hasil sandi lama yang dibuktikan lewat `signInWithPassword` membuat sesi baru di peramban yang sama (aman, sesi lama diganti). Hapus akun tidak menyentuh data di perangkat (dokumen, Community): itu menunggu Fase 2 dan 3. Aturan `server-only`: tes yang memuat `AuthProvider` atau gateway Supabase harus me-mock `@/features/account/delete-account` karena Server Action itu mengimpor kode server.
- Pelajaran: bukti mengunggah berkas lewat CDP: `DOM.setFileInputFiles` memicu `change`; PNG yang disusun tangan harus punya CRC yang benar (peramban menolak yang salah dan form hanya menampilkan galat foto), jadi susun dengan `zlib` dan CRC32 di skrip uji.

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

### 25 November 2026 (1e)
- Dikerjakan: gateway tiruan pindah ke `src/test`, `useAuthGateway` melempar galat tanpa provider (kecuali seam tes), layar Verifikasi, Lupa sandi, Atur ulang, Mulai berperilaku seperti produksi (Verifikasi butuh email tertunda dari tab, Atur ulang butuh sesi), kunci teks simulasi dihapus (id dan en), `vitest.config.mts` mendapat `setupFiles`.
- Gate: `tsc`, ESLint dan Prettier bersih; tes `tests/features/account`, `tests/lib`, `tests/features/app-shell` lulus (49 berkas, setelah recovery-flow diperbaiki 14 tes). Belum: tes penuh dan `build` (di 1f), seed dijalankan, uji Chrome.
- Pelajaran: modul tes yang dipasang global lewat `setupFiles` cukup untuk mempertahankan ±150 tes lama tanpa provider di tiap berkas; layar yang dulu bercabang `simulated` kini hanya punya jalur nyata, jadi tes yang bergantung pada tombol simulasi harus ditulis ulang, bukan disesuaikan.

### 25 November 2026 (1f)
- Gate dijalankan penuh; ringkasan di checklist 1f. Seed dijalankan (tiga akun). Aturan sandi aplikasi diubah mengikuti pengaturan server yang ketat atas keputusan user.
- Pelajaran: huruf tanpa huruf besar dan kecil (aksara Jawa) tidak lolos aturan Supabase, jadi tes sandi non-Latin dihapus. Skrip uji Chrome (CDP, hanya fitur bawaan Node 24: `WebSocket`, `fetch`) menemukan dua kesalahan skrip, bukan aplikasi: label kolom konfirmasi hapus akun adalah "Konfirmasi", dan galat sandi salah dicari lewat `[role=alert]` lebih stabil daripada mencocokkan teks halaman. Akun sementara untuk uji hapus dibuat lewat klien admin dan dihapus lewat UI.
