# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Ringkasan proyek & status

- **Apa ini**: RanahMenulis, ekosistem digital untuk menulis, komunitas literasi, dan penerbitan buku (Indonesia dan Malaysia). Dibangun sebagai monolith Next.js 16 (App Router, TypeScript) + Tailwind CSS v4 + Supabase.
- **Status**: fondasi. Beranda (`/`) adalah landing pra-peluncuran dengan form daftar tunggu; belum ada autentikasi UI. Sistem desain sudah dibuat sebagai pratinjau di `/sistem-desain`.
- **Sumber kebenaran** (urutan prioritas bila ada yang bertentangan): keputusan client (`docs/catatan-keputusan-client.md`) → PRD v0.2 (`docs/prd/`) → `DESIGN.md` → salinan artifact di `docs/desain/` (arsip, bukan sumber utama). Butir bertanda `[usulan]` atau `[konfirmasi]` belum disetujui client.
- **Dokumen lain**: `docs/Brief Desain RanahMenulis.md`, `docs/MVP Scope RanahMenulis.md`, `docs/Copy Landing RanahMenulis.md`.

## Perintah

```bash
npm install
cp .env.example .env.local     # isi kunci Supabase (lihat aturan rahasia di bawah)
npm run dev                    # dev server di localhost:3000
npm run build                  # build produksi
npm run start                  # jalankan hasil build
npm run lint                   # ESLint (eslint.config.mjs)
npm run typecheck              # tsc --noEmit
npm run format                 # Prettier tulis; format:check hanya memeriksa
npm run check                  # format:check + lint + typecheck + tes (gate cepat, tanpa build)
npm run test:coverage          # tes + laporan coverage (HTML di coverage/); belum ada ambang batas
npm test                       # Vitest, sekali jalan (semua tes)
npm run test:watch             # Vitest mode watch
npx vitest run src/lib/cn.test.ts      # satu berkas tes
npx vitest run -t "nama tes"           # tes berdasarkan nama
```

- **Tes**: Vitest + jsdom + Testing Library, dikonfigurasi di `vitest.config.mts` (alias `@` → `src`). Berkas tes berada di sebelah kodenya dengan nama `*.test.ts` atau `*.test.tsx` di bawah `src/`. Impor `describe`, `it`, `expect` secara eksplisit dari `vitest` (tidak ada globals). Panggil `cleanup` dari Testing Library di `afterEach` pada tes komponen. Server action diuji dengan me-mock `@/lib/supabase/admin` (lihat `src/features/landing/waitlist/actions.test.ts`).
- **Tes RLS**: belum ada. Tes ini butuh Supabase lokal (`npx supabase start`). Tambahkan setiap kali ada migrasi yang mengubah tabel atau policy: pengguna A tidak boleh membaca data pengguna B, dan role tanpa policy tidak boleh mengakses apa pun.
- **Lint** mengabaikan `ranahmenulis/`, `.agents/`, dan `.claude/` karena bukan bagian repo ini.
- **Migrasi database**: `supabase/migrations/` berisi SQL berurutan. Terapkan lewat Supabase SQL Editor atau Supabase CLI (`supabase db push`). Jangan ubah skema lewat dasbor secara manual.

## Arsitektur (gambaran besar)

- **Next.js 16 breaking changes**: `AGENTS.md` berlaku. Baca panduan di `node_modules/next/dist/docs/` sebelum menulis kode Next.js. Di Next 16, middleware bernama `proxy` (`src/proxy.ts`). `next.config.ts` mengaktifkan `cacheComponents` dan `partialPrefetching`, jadi perhatikan perilaku caching sebelum mengubah pengambilan data.
- **Root layout** (`src/app/layout.tsx`): mengatur `lang="id"` dan dua font (Schibsted Grotesk untuk sans, Source Serif 4 untuk tulisan). Font sans masih usulan (DESIGN.md 4.2).
- **Token desain** (`src/app/globals.css`): warna dan spasi didefinisikan sebagai CSS variable di `:root`, ditimpa untuk mode gelap lewat `prefers-color-scheme` dan `[data-theme]`. Pakai token seperti `bg-canvas`, `text-ink`, `bg-subtle`, `text-danger`; jangan menambah warna di luar token. Palet monokrom netral, merah hanya untuk galat dan aksi berbahaya.
- **Komponen dasar** (`src/components/ui/`): Button (varian `primary`, `secondary`, `text`, `danger`, `danger-text`), IconButton, Field, Tabs, Avatar, Chip, dan status state. Gaya dasar tombol memakai kelas Tailwind dengan `cn()` dari `src/lib/cn.ts`.
- **Overlay** (`src/components/ui/`): `dialog.tsx` (modal berbasis `<dialog>` asli, lembar bawah di ponsel, `dismissible={false}` untuk dialog konflik), `drawer.tsx` (Laci: panel tidak-modal di md ke atas, lembar bawah modal di ponsel), `menu.tsx` (menu ⋯, lembar bawah di ponsel, butir `mobileOnly` dan `disabled`), `popover.tsx`, dan `toast.tsx`. `ToastProvider` dipasang di root layout; panggil `useToast()` dari komponen klien. Toast tidak dipakai untuk indikator simpan. Animasi memakai transition dan `starting:` (bukan keyframes) agar bisa diinterupsi; `src/lib/use-dismiss.ts` menangani Escape dan klik di luar.
- **Studio** (`src/features/studio/`): rute `/studio/[id]` (`baru` membuka draf kosong yang baru disimpan saat ada isi). Editor memakai Tiptap dengan format yang dibatasi STD-01. **Penyimpanan sementara di perangkat** (IndexedDB lewat antarmuka `DocumentStore` di `storage/`); `commitSave` memeriksa nomor versi sehingga dua tab yang mengubah dokumen sama memicu konflik. Ganti implementasi store dengan Supabase pada langkah 3c tanpa mengubah `hooks/use-studio-document.ts`. `daily-progress.ts` menghitung kata hari ini (target 500 tetap sampai Streak ada). Tes komponen yang memakai `<dialog>` memanggil `installDialogShim()` dari `src/test/dialog-shim.ts`.
- **Pratinjau** (`src/app/sistem-desain/`): halaman yang merender seluruh komponen dalam mode terang dan gelap; `overlay/` memuat galeri Dialog, Laci, Menu, Toast, dan dialog konflik (tema ikut sistem atau dipaksa lewat tombol). Keduanya mengembalikan 404 di produksi.
- **Environment** (`src/lib/env.ts`, `src/lib/env.server.ts`): semua variabel Supabase dibaca lewat modul ini, jangan memakai `process.env.X!` langsung. `getSupabasePublicEnv()` melempar galat dengan petunjuk jika env kosong; `readSupabasePublicEnv()` mengembalikan `null` (dipakai `proxy.ts` agar aplikasi tetap jalan sebelum dikonfigurasi). `env.server.ts` mengimpor `server-only` untuk `SUPABASE_SECRET_KEY`. Variabel `NEXT_PUBLIC_*` harus ditulis literal agar bisa di-inline Next.js. Tambahkan variabel baru ke modul ini, `.env.example`, dan tesnya.
- **Supabase** (`src/lib/supabase/`): tiga klien dengan peran berbeda.
  - `client.ts`: klien browser, memakai publishable key.
  - `server.ts`: klien server dengan cookie, memakai sesi pengguna sehingga RLS berlaku.
  - `admin.ts`: klien service role, `import "server-only"`, melewati RLS. Hanya untuk kode server tepercaya.
- **Penyegaran sesi** (`src/proxy.ts`): memanggil `supabase.auth.getUser()` di setiap permintaan. Jika env belum diisi, proxy melewatinya.
- **Pola database** (`supabase/migrations/0001_fondasi_akun_dan_role.sql`): RLS aktif di setiap tabel, tabel tanpa policy tidak bisa diakses, role platform hanya bisa ditulis lewat fungsi atau service role, dan audit log hanya bisa ditambah. Ikuti pola ini untuk migrasi berikutnya.

## Struktur folder dan batas ukuran

```
src/
├── app/                  # routing saja: page, layout, route handler (tipis)
├── features/<domain>/    # components/, actions, queries, schema, dan *.test.ts milik fitur itu
├── components/ui/        # komponen dasar lintas fitur
└── lib/                  # infrastruktur bersama (supabase, cn)
```

- Kode milik satu fitur diletakkan di `src/features/<domain>/`; hanya yang dipakai lebih dari satu fitur naik ke `components/ui` atau `lib`. Contoh sekarang: `src/features/landing/` (komponen, `copy.ts`, `waitlist/`).
- Impor langsung dari berkas sumbernya. Jangan membuat berkas `index.ts` (barrel) yang menggabungkan ekspor.
- ESLint menegakkan `max-lines` 300 baris per berkas (tidak menghitung baris kosong dan komentar) sebagai **error**, serta `complexity` 15 dan `max-depth` 4 sebagai peringatan. Pecah berkas per tanggung jawab (satu section atau satu komponen per berkas), jangan menaikkan batasnya.
- Prettier (lebar 100, plugin Tailwind mengurutkan kelas) memegang format; `eslint-config-prettier` mematikan aturan format ESLint. Jangan memformat manual.

## Dependensi, Node, dan keamanan

- Node mengikuti `.nvmrc` (26 LTS); `engines` mensyaratkan `>=24` dan `.npmrc` memakai `engine-strict`. `@types/node` sengaja `^24`, versi terendah yang didukung, agar tidak memakai API yang tidak ada di Node 24.
- `.npmrc` berisi `min-release-age=7`: npm menolak memasang versi yang dirilis kurang dari 7 hari lalu. Jika sebuah instal gagal karena ini, itu disengaja; tunggu atau minta persetujuan pengguna sebelum menimpanya.
- **TypeScript ditahan di 5.9**: `typescript-eslint` hanya mendukung `<6.1`, jadi TypeScript 7 akan merusak lint. Cek ulang sebelum menaikkan.
- `npm audit` penuh masih melaporkan temuan moderate `minimatch` di dalam `typescript-eslint` (dipin oleh `eslint-config-next`, hanya tooling lint). Diterima sampai upstream memperbaiki; yang wajib bersih adalah `npm audit --omit=dev --audit-level=high` (dijalankan CI).
- **Hook git** (`simple-git-hooks`, dipasang oleh `npm install` lewat script `prepare`): `pre-commit` menjalankan `lint-staged` (ESLint `--fix` dan Prettier pada berkas yang di-stage); `pre-push` menjalankan `typecheck` dan tes. Jangan mem-bypass hook dengan `--no-verify`; perbaiki penyebab kegagalannya.
- **Akhir baris**: `.gitattributes` memaksa LF dan `.editorconfig` menyeragamkan editor. Jangan mengubah `core.autocrlf` untuk repo ini.
- **ESLint 10**: sudah dicoba dan berjalan, tetapi 10.14 membawa advisory `minimatch` tambahan (audit 9 vs 7). Naikkan setelah 10.15 melewati jeda 7 hari (setelah 20 November 2026) dan periksa `npm audit` tidak memburuk.
- CI (`.github/workflows/ci.yml`) menjalankan format:check, lint, typecheck, tes, audit produksi, dan build. Dependabot (`.github/dependabot.yml`) memperbarui mingguan dengan jeda 7 hari.
- Header keamanan statis ada di `next.config.ts`. CSP berbasis nonce sengaja belum dipasang karena memaksa render dinamis dan bertentangan dengan `cacheComponents`; putuskan setelah ada halaman nyata. Baca `node_modules/next/dist/docs/01-app/02-guides/data-security.md` sebelum menulis Server Action atau akses data.
- Server Action dan Route Handler diperlakukan sebagai endpoint publik: validasi input di dalamnya dan jangan mengandalkan `proxy.ts` untuk otorisasi. Penegakan sebenarnya di RLS.

## Aturan kerja

1. **Bahasa**: jawab dan jelaskan dalam Bahasa Indonesia yang profesional. Kode, nama identifier, komentar kode, dan nama tes ditulis dalam **English**. Teks yang tampil ke pembaca (copy UI) tetap Bahasa Indonesia sesuai `docs/`. Sebagian komentar lama di repo masih berbahasa Indonesia; terjemahkan ke English hanya pada berkas yang sedang kamu ubah.
2. **Klarifikasi sebelum eksekusi**: untuk fitur baru, perubahan UI/UX, atau perubahan perilaku, pastikan requirement jelas dulu. Ajukan pertanyaan terarah tentang alur (siapa yang melakukan, aksi lanjutan), state kosong dan gagal, batas, dan privasi (siapa boleh membaca data pengguna). Sertakan opsi konkret dengan rekomendasi. Jika jawabannya sudah ada di `docs/catatan-keputusan-client.md` atau PRD, rujuk saja dan jangan ditanyakan lagi. Perbaikan kecil yang jelas tidak perlu sesi tanya-jawab.
3. **Rencana sebelum perubahan besar**: untuk perubahan database, lintas modul, atau perubahan arsitektur, tampilkan rencana dan tunggu persetujuan. Sertakan SQL migrasi dan policy RLS di dalam rencana.
4. **Dokumentasi**: saat fitur dibuat atau diubah, perbarui dokumen yang relevan (`DESIGN.md` untuk keputusan desain, `docs/` untuk fitur) dan peta di `CLAUDE.md` ini. Catat variabel lingkungan baru di `.env.example`.
5. **Quality gate sebelum dianggap selesai**: `npm run format:check`, `npm run lint`, `npm run typecheck`, dan `npm test` harus lolos (jalankan `npm run build` untuk perubahan yang menyentuh routing, config, atau server). Perubahan perilaku harus disertai tes baru atau pembaruan tes yang ada. Perubahan database harus disertai tes RLS. Laporkan hasilnya apa adanya; jika ada yang gagal atau dilewati, sebutkan.
6. **Rekomendasi commit**: di akhir tugas, berikan pesan commit dalam Conventional Commits (`feat`, `fix`, `refactor`, `style`, `chore`, `docs`), bahasa Inggris, dengan blok PowerShell siap pakai:
   ```bash
   git add <files>
   git commit -m "<title>" -m "- <point 1>" -m "- <point 2>"
   ```
   Jangan commit atau push sendiri kecuali diminta.
7. **Tindakan sulit dibatalkan atau keluar dari mesin**: tanyakan dulu sebelum push, deploy, membuat atau mengubah project di Supabase atau layanan eksternal lain, dan menjalankan migrasi ke database yang bukan lokal.
8. **Jangan mengarang**: nilai kunci, URL project, kredensial, harga, dan kontak darurat tidak boleh dibuat-buat. Gunakan placeholder yang jelas dan minta nilainya ke pengguna.

## Rahasia

- `.env*` di-ignore git. Jangan membaca, menampilkan, atau menyalin isinya ke respons, dokumen, atau commit.
- `SUPABASE_SECRET_KEY` (service role) hanya boleh dipakai di kode server. Jangan beri prefiks `NEXT_PUBLIC_`.
- Data sensitif diakses lewat server dengan RLS aktif. Jangan mengandalkan penyembunyian di UI sebagai pengganti pembatasan di database.
