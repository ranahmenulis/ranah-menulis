# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Ringkasan proyek & status

- **Apa ini**: RanahMenulis, ekosistem digital untuk menulis, komunitas literasi, dan penerbitan buku (Indonesia dan Malaysia). Dibangun sebagai monolith Next.js 16 (App Router, TypeScript) + Tailwind CSS v4 + Supabase.
- **Status**: fondasi. Beranda (`/`) adalah landing pra-peluncuran dengan form daftar tunggu; belum ada autentikasi UI. Sistem desain sudah dibuat sebagai pratinjau di `/sistem-desain`. Langkah slicing 1–5 selesai (termasuk Community) serta 6a (Tersimpan, Notifikasi) dan 6b (profil publik penulis); semuanya memakai data dummy atau lokal. Claude Design tidak dipakai lagi: layar sisa dibangun langsung di kode.
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
npx vitest run tests/lib/cn.test.ts      # satu berkas tes
npx vitest run -t "nama tes"           # tes berdasarkan nama
```

- **Tes**: Vitest + jsdom + Testing Library, dikonfigurasi di `vitest.config.mts` (alias `@` → `src`). Berkas tes berada di folder `tests/` di root, struktur foldernya mencerminkan `src/` (mis. `src/lib/cn.ts` → `tests/lib/cn.test.ts`), dengan nama `*.test.ts` atau `*.test.tsx`. Impor kode yang diuji lewat alias `@/` (bukan path relatif). Impor `describe`, `it`, `expect` secara eksplisit dari `vitest` (tidak ada globals). Panggil `cleanup` dari Testing Library di `afterEach` pada tes komponen. Server action diuji dengan me-mock `@/lib/supabase/admin` (lihat `tests/features/landing/waitlist/actions.test.ts`).
- **Tes RLS**: belum ada. Tes ini butuh Supabase lokal (`npx supabase start`). Tambahkan setiap kali ada migrasi yang mengubah tabel atau policy: pengguna A tidak boleh membaca data pengguna B, dan role tanpa policy tidak boleh mengakses apa pun.
- **Lint** mengabaikan `ranahmenulis/`, `.agents/`, dan `.claude/` karena bukan bagian repo ini.
- **Migrasi database**: `supabase/migrations/` berisi SQL berurutan. Terapkan lewat Supabase SQL Editor atau Supabase CLI (`supabase db push`). Jangan ubah skema lewat dasbor secara manual.

## Arsitektur (gambaran besar)

- **Next.js 16 breaking changes**: `AGENTS.md` berlaku. Baca panduan di `node_modules/next/dist/docs/` sebelum menulis kode Next.js. Di Next 16, middleware bernama `proxy` (`src/proxy.ts`). `next.config.ts` mengaktifkan `cacheComponents` dan `partialPrefetching`, jadi perhatikan perilaku caching sebelum mengubah pengambilan data.
- **Root layout** (`src/app/layout.tsx`): mengatur `lang="id"` dan dua font (Schibsted Grotesk untuk sans, Source Serif 4 untuk tulisan). Font sans masih usulan (DESIGN.md 4.2).
- **Token desain** (`src/app/globals.css`): warna dan spasi didefinisikan sebagai CSS variable di `:root`, ditimpa untuk mode gelap lewat `prefers-color-scheme` dan `[data-theme]`. Pakai token seperti `bg-canvas`, `text-ink`, `bg-subtle`, `text-danger`; jangan menambah warna di luar token. Palet monokrom netral, merah hanya untuk galat dan aksi berbahaya.
- **Komponen dasar** (`src/components/ui/`): Button (varian `primary`, `secondary`, `text`, `danger`, `danger-text`), IconButton, Field, Tabs, Avatar, Chip, dan status state. Gaya dasar tombol memakai kelas Tailwind dengan `cn()` dari `src/lib/cn.ts`.
- **Overlay** (`src/components/ui/`): `dialog.tsx` (modal berbasis `<dialog>` asli, lembar bawah di ponsel, `dismissible={false}` untuk dialog konflik), `drawer.tsx` (Laci: panel tidak-modal di md ke atas, lembar bawah modal di ponsel), `menu.tsx` (menu ⋯, lembar bawah di ponsel, butir `mobileOnly` dan `disabled`), `popover.tsx`, dan `toast.tsx`. `ToastProvider` dipasang di root layout; panggil `useToast()` dari komponen klien. Toast tidak dipakai untuk indikator simpan. Animasi memakai transition dan `starting:` (bukan keyframes) agar bisa diinterupsi; `src/lib/use-dismiss.ts` menangani Escape dan klik di luar.
- **Gerak gulir** (`globals.css`): `scroll-behavior: smooth` hanya di bawah `prefers-reduced-motion: no-preference`, berpasangan dengan `data-scroll-behavior="smooth"` di `<html>` (wajib di Next 16 supaya pindah rute tidak menganimasikan gulir ke atas). Kelas `scroll-edge-fade` (mask terikat `animation-timeline: scroll()`, di dalam `@supports`) dipasang pada barisan yang menggulir ke samping; jangan menaruhnya pada elemen yang harus tetap buram (bilah `sticky`), pasang pada anak di dalamnya.
- **Studio** (`src/features/studio/`): rute `/studio/[id]` (`baru` membuka draf kosong yang baru disimpan saat ada isi). Editor memakai Tiptap dengan format yang dibatasi STD-01. **Penyimpanan sementara di perangkat** (IndexedDB lewat antarmuka `DocumentStore` di `storage/`); `commitSave` memeriksa nomor versi sehingga dua tab yang mengubah dokumen sama memicu konflik. Ganti implementasi store dengan Supabase pada langkah 3c tanpa mengubah `hooks/use-studio-document.ts`. `daily-progress.ts` menghitung kata hari ini (target 500 tetap sampai Streak ada). Tes komponen yang memakai `<dialog>` memanggil `installDialogShim()` dari `src/test/dialog-shim.ts`.
- **Kerangka aplikasi** (`src/features/app-shell/`, dipasang oleh `src/app/(app)/layout.tsx`): bilah atas, sidebar (lg), rail (md), bilah bawah 5 tab dan tombol Tulis bulat (ponsel). Rute di grup `(app)`: `/beranda`, `/jelajahi`, `/postingan/[id]`, `/studio` (tab Dokumen), `/studio/streak`. Editor `/studio/[id]` sengaja di luar grup (layar penuh). Butir nav tanpa tujuan (Projects, Tersimpan, Profil) tampil nonaktif lewat `NavEntry` tanpa `href`. Pengguna sementara: `DUMMY_USER` di `nav.ts`; login di-bypass sampai desain disetujui.
- **Studio, Dokumen dan Streak** (`src/features/studio/`): `documents.ts` (daftar, folder, Sampah), `streak.ts` (streak, kalender, statistik, milestone), `target-setting.ts` (target di localStorage; perubahan berlaku besok), `hooks/use-streak-data.ts` (dipakai Dokumen, Streak, dan Beranda). `DocumentStore` kini punya `list`, `listFolders`, `history`, `updateMeta`, `deletePermanently`, `importHistory`. **Jangan memanggil `new Date()` atau `Date.now()` saat render komponen klien** (Next 16 prerender menolaknya); baca di efek, seperti `use-streak-data.ts`. Tombol "isi 30 hari data contoh" di tab Streak hanya ada di pengembangan.
- **Beranda** (`src/features/home/`): "Hari ini" memakai data tulisan lokal; Perlu perhatian dan Proyek saya adalah **fixture dummy** di `fixtures.ts` sampai Projects dibangun. Baris Notifikasi baru kini dari `features/notifications`. Feed "Mengikuti" kini berasal dari Community (`feedFor`); tab "Jelajahi" dan "Buka Jelajahi" menuju `/jelajahi`.
- **Tersimpan dan Notifikasi** (langkah 6a, data dummy dan lokal): rute `/tersimpan` dan `/notifikasi` di grup `(app)`.
  - `src/features/saved/`: `saved-list.ts` (id dari marks `sv:`, pemisahan tulisan yang bisa dibuka dan yang sudah tidak tersedia) dan `saved-view.tsx` memakai `useCommunity` dan `FeedItem` dari `features/home`. Tulisan yang baru dilepas dari simpanan tetap tampil sampai halaman ditinggalkan (bisa disimpan lagi); hitungan mengikuti yang tersimpan saat itu. Urutan memakai tanggal terbit karena mark tidak mencatat waktu simpan.
  - `src/features/notifications/`: `fixtures.ts` (waktu berupa "berapa lama lalu"), `notification-model.ts` (tab, hitungan belum dibaca; murni dan ringan karena dipakai bilah atas), `notification-text.ts` (kalimat dan waktu; mengimpor fixture Community), `read-state.ts` (status baca di localStorage `ranah.notificationsRead` lewat `useSyncExternalStore`, lalu cadangan di memori bila penyimpanan menolak), `use-notifications.ts` (`useUnreadCount` untuk lonceng, `useNotifications` untuk layar). Lonceng di `top-bar.tsx` kini tautan ke `/notifikasi` dan hitungannya dari data yang sama. Notifikasi proyek belum punya tujuan (`href: null`) sampai Projects (6f) ada. Belum punya keadaan memuat dan galat karena datanya sinkron; tambahkan saat datang dari server.
  - Di ponsel Tersimpan dibuka dari profil sendiri (tautan "Tersimpan" di kolom identitas, hanya di bawah lg); bilah bawah tidak memuatnya.
- **Profil publik penulis** (langkah 6b, data dummy dan lokal): rute `/penulis/[handle]` di grup `(app)` (handle = username tanpa `@`; tautan "Profil" di navigasi menuju `OWN_PROFILE_HREF`, pengguna dummy, dan hanya halaman itu yang menyalakan butir Profil). `src/features/profile/`:
  - `profile-href.ts` (`profileHref`, `OWN_PROFILE_HREF`; tes menjaganya sama dengan handle penulis dummy), `author-link.tsx` (`AuthorLink`: nama penulis sebagai tautan `relative z-10` agar tetap bisa diklik di atas tautan membentang pada butir feed, ubin Jelajahi, artikel, dan komentar), `fixtures.ts` (bio, jumlah pengikut dan mengikuti, streak hanya untuk penulis yang membagikannya; privat adalah bawaan), `profile-model.ts` (`publicWorks`: hanya postingan Publik, termasuk milik sendiri; `genresOf` dari postingan; `followerCount` menambah pembaca bila mengikuti; `followingCount` milik sendiri dari marks).
  - `components/`: `profile-view.tsx` (satu grid: nama, tab Karya · Tentang · Proyek, daftar pola feed; kolom identitas 320px lengket di lg, di atas tab di ponsel), `profile-identity.tsx` (tombol Ikuti, atau "Ubah profil" nonaktif untuk profil sendiri sesuai COM-08), `profile-tabs-content.tsx`, `profile-states.tsx` (skeleton, galat, "Penulis ini tidak ditemukan").
  - Tab Proyek kosong untuk semua penulis sampai Projects (6f) ada, dan hanya dengan persetujuan penulis (PRD: hasil Projects ke Community hanya atas persetujuan pengguna). `commentCounts()` di `community/post-model.ts` dipakai profil dan Tersimpan; Beranda dan Jelajahi masih punya salinannya sendiri.
- **Community** (`src/features/community/`, langkah 5, data dummy dan lokal): rute `/jelajahi` dan `/postingan/[id]` di grup `(app)`, `/tulis` dan `/tulis/[id]` (draf) di luar grup (layar penuh seperti editor).
  - Data: `fixtures/` (sembilan penulis, 19 postingan, komentar; waktu berupa "berapa lama lalu" yang diselesaikan saat halaman dibuka, jadi tidak pernah basi), `post-model.ts` (label, bentuk ubin, postingan terkait), `categories.ts` (delapan kategori PRD + "Semua"; daftar pilihan sementara sampai rumus Q-17), `feed.ts` (feed Beranda, `canRead` untuk postingan Grup), `comment-threads.ts` (balasan satu tingkat), `format-time.ts`, `doc-blocks.ts` (dokumen Studio ⇄ blok teks publik).
  - Penyimpanan lokal: antarmuka `PostStore` di `storage/post-store.ts` (pola seperti `DocumentStore`), `indexeddb-post-store.ts` (DB `ranah-community`: postingan dan draf buatan pengguna, komentar, dan "marks" yaitu Apresiasi, Simpan, Ikuti, komentar disembunyikan/dilaporkan/dihapus), `memory-store.ts` untuk tes. `hooks/use-community.ts` memuat fixture + data lokal dan menerapkan marks; `hooks/use-post-actions.tsx` memberi dialog Masuk untuk tamu.
  - Jelajahi: chip lengket, masonry berbasis container query (`@container`: 3/2/1 kolom, di bawah 576px menjadi daftar), "Muat lebih banyak" (`PAGE_SIZE` 9), kategori kosong disembunyikan. Postingan: satu kolom 680, komentar datar satu tingkat, bilah aksi lengket di bawah menggantikan bilah navigasi di ponsel (`isPostPage` di `nav.ts`), menu ⋯ ada di bilah aksi itu.
  - Tulis postingan: `compose-state.ts` (reducer murni, aturan terbit), `hooks/use-compose.ts`, `components/compose/`. Visibilitas tanpa nilai bawaan, pesan "yang menjadi publik hanya teks ini" tidak bisa ditutup, penghitung 500 kata tidak memotong teks, draf disimpan hanya lewat tombol (tanpa simpan otomatis) dan dibuka ulang sebagai teks langsung. Editor "Tulis langsung" memakai Tiptap dengan opsi di level modul (opsi baru tiap render menghapus class permukaan tulis).
  - **Tamu**: `src/lib/viewer.ts`; `?sebagai=tamu` / `?sebagai=masuk` hanya bekerja di development dan tes (disimpan di sessionStorage), produksi selalu pengguna dummy. `GuestFrame` di app-shell hanya berisi bilah atas; Masuk dan Daftar nonaktif sampai auth ada. Hapus bersama bypass login.
  - `(app)/layout.tsx` membungkus `AppShell` dengan `<Suspense>` karena `usePathname()` di rute dinamis `/postingan/[id]` tidak boleh memblokir prerender.
- **Landing** (`src/features/landing/`, rute `/`): teks di `copy/id.ts` dan `copy/en.ts` (v2 ringkas; naskah contoh hero dan pratinjau ada di `doc` pada kamus, diterjemahkan juga). Gerak landing (DESIGN.md 4.6, pengecualian landing) dinyalakan kelas `lp-motion` di `<html>` dari skrip inline `app/page.tsx` (tidak dipasang saat reduced motion; dicabut setelah 3,5 detik bila landing tidak terhidrasi). `motion/` berisi `motion-env.ts`, `loop-registry.ts` (hanya satu loop pratinjau berjalan per layar), dan `use-loop.ts` (siklus 3,2 detik, `LoopTimeContext`, `reached()`). `components/previews/` berisi `LoopFrame` (bingkai, tombol jeda) dan empat pratinjau yang menurunkan keadaan dari waktu siklus (`null` = gambar jadi, juga HTML server). `enter-title.tsx` (entrance H1), `promise-statement.tsx` (momen `word-highlight`). CSS gerak di akhir `globals.css` (kelas `lp-*`). **Video hero** (`components/hero-video.tsx`): MP4 tanpa suara dari proyek Remotion `client/ranahmenulis-hero` di repo Motion-Graphics-Code (brief: `docs/desain/landing/Brief Video Hero.md`), disimpan di `public/landing/hero/<locale>/{16x10,4x5}-{light,dark}.mp4` + poster `.webp`. MP4 disimpan lewat **Git LFS** (`.gitattributes`). Poster (keduanya, ditukar CSS `logo-on-light`/`logo-on-dark`) adalah HTML server dan gambar utuh tanpa JS/reduced motion; video hanya dipasang saat `lp-motion`, dipilih dari locale, tema, dan lebar ≥768px, main saat terlihat, dan punya tombol jeda. Baru versi `en` yang dirender; `VIDEO_LOCALE` memetakan `id` ke `en` sampai versi Indonesia ada.
- **i18n dan tema** (`src/lib/i18n/`, `src/lib/theme/`): bahasa Indonesia (`id`, sumber bentuk kamus) dan Inggris (`en`); URL tetap. Locale dibaca dari cookie `locale`, lalu `Accept-Language`, lalu `id` (`config.ts`, `resolveLocale`). `dictionaries.ts` menggabungkan `common/`, `features/landing/copy/`, dan `features/app-shell/copy/`; berkas `en` bertipe `typeof` sumber `id` dan tes memeriksa kunci serta placeholder `{x}` sama. Server: `getDictionary()` dari `server.ts` (membaca cookie, jadi harus di bawah `<Suspense>`; root layout membungkus semua halaman dengan `I18nRoot`, sehingga rute menjadi *partial prerender*). Komponen klien: `useT()`, `useLocale()`, `useChangeLocale()`, `format()` dari `provider.tsx` (tanpa provider, bawaannya `id` agar tes lama tetap jalan). Komponen server di landing menerima potongan kamus lewat props. Tambah teks baru di `id` dan `en` sekaligus. Nilai yang disimpan ke database (mis. minat daftar tunggu) tetap memakai nama Indonesia kanonik, bukan label tampilan. Tema `light`/`dark` disimpan di cookie `theme` dan dipasang sebagai `data-theme` oleh skrip di `<head>` (tanpa kedipan). Tanpa pilihan tersimpan atributnya tidak dipasang sehingga `prefers-color-scheme` berlaku; tidak ada opsi "sistem" di UI. Saat tombol diklik, tema baru terungkap sebagai lingkaran dari tombol (`saveTheme` dengan `origin`, View Transitions; instan bila reduced motion). Tombol ada di `components/ui/`: `ThemeToggle`, `LanguageMenu`, `PreferencesMenu` (satu menu untuk layar sempit), dibungkus `DisplayControls` di bilah atas landing, aplikasi, dan bingkai tamu. **Belum diterjemahkan**: Studio, Community, Beranda, isi galat Server Action daftar tunggu, dan teks contoh di fixture Community (masih Indonesia).
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
├── features/<domain>/    # components/, actions, queries, schema, milik fitur itu (tesnya di `tests/features/<domain>/`)
├── components/ui/        # komponen dasar lintas fitur
└── lib/                  # infrastruktur bersama (supabase, cn)
```

- Kode milik satu fitur diletakkan di `src/features/<domain>/`; hanya yang dipakai lebih dari satu fitur naik ke `components/ui` atau `lib`. Contoh sekarang: `src/features/landing/` (komponen, `copy/`, `waitlist/`).
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
2. **Klarifikasi sebelum eksekusi (wajib)**: untuk fitur baru, perubahan UI/UX, atau perubahan perilaku, pastikan requirement jelas dulu. Ajukan pertanyaan terarah tentang alur (siapa yang melakukan, aksi lanjutan), state kosong dan gagal, batas, dan privasi (siapa boleh membaca data pengguna). Sertakan opsi konkret dengan rekomendasi. Jika jawabannya sudah ada di `docs/catatan-keputusan-client.md` atau PRD, rujuk saja dan jangan ditanyakan lagi.
   - **Jika permintaan punya lebih dari satu tafsiran yang hasilnya berbeda** (lokasi berkas, nama, struktur folder, pendekatan), tanyakan dulu. Jangan memilih sendiri lalu mengerjakannya.
   - Pengecualian hanya untuk perbaikan kecil yang jelas: satu berkas atau satu fungsi, satu tafsiran, tidak mengubah konvensi, struktur, atau konfigurasi. Jika ragu apakah sebuah perubahan termasuk kecil, anggap tidak kecil.
3. **Rencana sebelum perubahan besar (wajib, tunggu persetujuan)**: tampilkan rencana dan **berhenti sampai pengguna menyetujui secara eksplisit**. Jangan mengubah berkas apa pun sebelum itu. Perubahan besar mencakup:
   - perubahan database (sertakan SQL migrasi dan policy RLS di dalam rencana);
   - perubahan yang menyentuh lebih dari satu modul atau lebih dari 5 berkas, termasuk memindahkan atau mengganti nama berkas secara massal;
   - perubahan arsitektur, struktur folder, konvensi proyek, atau konfigurasi (`vitest.config.mts`, `tsconfig.json`, `eslint.config.mjs`, `next.config.ts`, `package.json`, CI);
   - perubahan yang bertentangan dengan aturan atau konvensi yang tertulis di `CLAUDE.md` ini.

   Rencana memuat: tujuan, daftar berkas yang terdampak, langkah, risiko, cara membatalkan, dan pertanyaan terbuka. Persetujuan untuk satu rencana tidak berlaku untuk rencana lain. Bila instruksi pengguna terdengar sederhana tetapi memenuhi salah satu kriteria di atas, tetap ajukan rencana; kata "pindahkan", "rapikan", atau "refactor" bukan alasan melewatinya.
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
