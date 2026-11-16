Kamu melanjutkan slicing RanahMenulis (Next.js 16, Tailwind v4, Supabase; data dummy dan lokal). Jawab dalam Bahasa Indonesia; kode, komentar kode, dan nama tes dalam English. **Jangan menulis kode sebelum selesai membaca dan sebelum rencana disetujui.**

## 1. Baca dulu, berurutan

1. `CLAUDE.md` (terutama Aturan kerja butir 2, 3, 5 termasuk butir "Alur dan aksesibilitas", 6, 7) dan `AGENTS.md` (Next.js 16 berbeda; baca `node_modules/next/dist/docs/` sebelum menulis kode Next).
2. `docs/desain/Catatan Slicing.md` (langkah 6, sub-langkah 6f, dan catatan terakhir "Jalan keluar Editor dan Tulis postingan, dan bug beku").
3. **PRD Projects (baca sebelum merekomendasikan cakupan apa pun):** `docs/prd/` bagian 08 (modul), 09 (PRJ-01..04, ANT, SOL, KLS, LMB), 10 (kebutuhan fungsional), 13 (alur), 14 (business rules), 15 (peran), 17.5 (halaman Projects), 19 (QRIS, PLT-07), 20 (notifikasi proyek), 23 (MVP), 28 (Q-13, Q-19..Q-31 dan keputusan terbuka lain). Lalu `docs/MVP Scope RanahMenulis.md` dan `docs/catatan-keputusan-client.md`.
4. `DESIGN.md` bagian 6.7 (halaman di luar pola Medium), 7.4 (status submission monokrom), 8 (keadaan), 9 (larangan).
5. Memori proyek di `C:\Users\toxix\.claude\projects\d--Code-Ranah-Penulis\memory\`.
6. `git status` dan `git log --oneline -5`. Posisi: `main` ada di `35b2b1c` (6f-2) di atas `c3fda02` (6f-1); keduanya **belum di-push** (cek `git status -sb`). Yang belum ter-track hanya dua prompt landing milik user di `docs/desain/landing/`. Jangan push dan jangan commit tanpa diminta.

## 2. Posisi (16 November 2026)

- Selesai: langkah 1–5, 6a–6d, penghitung Studio, bilah format, perbaikan beku dan jalan keluar, **6f-1 (katalog dan detail Projects)**, **6f-2 (pendaftaran)**, dan **6f-3 (Kirim karya)**. **Berikutnya: sub-langkah 6f berikutnya** (rekomendasi 6f-4 Status submission dan "Proyek saya"; audit aksesibilitas dan alur tetap ditunda, lihat Catatan Slicing). Cek `git status -sb` dan `git log --oneline -5`: 6f-1, 6f-2, 6f-3 mungkin belum di-commit atau di-push. Jangan commit dan jangan push tanpa diminta. Yang belum ter-track milik user hanya dua prompt landing di `docs/desain/landing/`.
- Keputusan tetap: semua slicing memakai data dummy dan lokal, login di-bypass, **tanpa backend** (auth, migrasi, RLS, store Supabase) dan jangan menagih persetujuannya. Claude Design tidak dipakai; layar dibangun langsung dari `src/components/ui/` dan DESIGN.md. **Marketplace bukan MVP**, jangan disentuh.
- **Sudah ada dari 6f-1 sampai 6f-3** (`src/features/projects/`, lihat bullet Projects di CLAUDE.md): `/projects`, `/projects/[slug]`, `/projects/[slug]/daftar`, `/projects/[slug]/kirim`, `registration-store.ts` (localStorage, `confirmRegistration`), `storage/` (IndexedDB `ranah-projects`, `SubmissionStore`), `Submission` dengan `versions[]` dan `statusLog[]`, `submission-model.ts`, `submit-flow.ts`, `use-submissions.ts` (`notifySubmissionsChanged` agar halaman Next yang di-cache tidak basi), `StatusSubmission` di `components/ui/status-submission.tsx` (semua status DESIGN 7.4 sudah ada). Status yang dibuat hanya `terkirim`.
- **Titik sambung yang masih menunggu** (ganti, jangan tambah janji baru):
  - Beranda: "Perlu perhatian" dan "Proyek saya" adalah fixture di `src/features/home/fixtures.ts`.
  - Notifikasi proyek: `href: null` di `src/features/notifications/fixtures.ts`; notifikasi wajib "Submission diterima sistem" (PRD 20) belum ada.
  - Profil publik: tab Proyek kosong untuk semua penulis (hanya tampil atas persetujuan penulis).
  - `SentWorks` di layar Kirim hanya daftar baca; detail, riwayat versi, revisi, dan tarik belum ada.
- Landing sudah menjanjikan: Ranah Project, Antologi/Solo Book/Kelas Menulis/Lomba Menulis, Kirim naskah, status kiriman. Tutup, jangan tambah janji.

## 3. Cara memecah 6f (usulan; konfirmasi ke user)

Pecah per bagian PRD 17 dan kerjakan **satu sub-langkah per rencana**:
1. ~~Katalog Projects dan detail proyek (PRJ-01)~~ **selesai (6f-1).**
2. ~~Ketentuan, persetujuan hak cipta, dan pendaftaran (PRJ-02)~~ **selesai (6f-2).**
3. ~~Kirim karya dari Studio: versi beku (STD-09)~~ **selesai (6f-3).**
4. Status submission (DESIGN 7.4) dan "Proyek saya" (PRJ-04); sambungkan Beranda, Notifikasi, dan profil.
5. Dasbor per kategori [usulan, belum disetujui]: Solo (SOL-02), Kelas dan tugas (KLS-02/03), hasil Lomba (LMB-02).
6. QRIS semi-manual (PLT-07). Panel Organizer, Editor, dan Juri adalah 6g, bukan 6f.

**Celah di pembagian ini:** PRD 17.5 juga memuat Dasbor Solo, Dasbor Kelas dan Halaman tugas, Halaman hasil lomba, dan Detail submission dengan riwayat versi dan Kirim Revisi (yang terakhir masuk 6f-4). Untuk Kelas Menulis, "Kirim karya" berarti mengumpulkan tugas, bukan submission (6f-5).

Tanyakan ke user sub-langkah mana yang dimulai sebelum merencanakan (rekomendasi: 6f-4, karena data submission sudah ada).

## 4. Aturan kerja yang wajib

- **Klarifikasi sebelum eksekusi** (butir 2): tanyakan alur, keadaan kosong dan gagal, batas, dan privasi, dengan opsi konkret dan rekomendasi. Rujuk PRD atau catatan keputusan bila jawabannya sudah ada. Butir bertanda `[usulan]` atau `[konfirmasi]` belum disetujui client; tandai di UI dan kode, jangan dianggap final. Pertanyaan Q-19 dst. yang belum dijawab jangan dikarang jawabannya.
- **Rencana sebelum perubahan besar** (butir 3): lebih dari 5 berkas, lebih dari satu modul, database, atau konfigurasi = rencana, lalu berhenti sampai user menyetujui eksplisit.
- **Setiap layar penuh wajib punya jalan keluar yang terlihat** (Kirim karya, detail proyek). Dialog modal yang diikuti `router.push/back` menutup dirinya dulu. Uji sebagai **alur lintas layar** dengan klik mouse sungguhan (`Input.dispatchMouseEvent`) **dan** keyboard saja; fokus kembali ke pemicu setelah dialog.
- **Rutinitas tiap sub-langkah**: komponen yang ada, `break-ui` (judul panjang, nama satu huruf, nol butir, angka besar), `mobile-native` dan cek 375, lihat di peramban nyata (375 dan 1280, terang dan gelap), `code-review` (verifikasi tiap temuan; separuh valid) dan `simplify`. Hindari `apple-design` dan `choreograph`. `design-taste-frontend` hanya untuk landing.
- **DESIGN.md menang atas skill**: hanya `rounded-full` atau tanpa radius, satu tombol terisi per layar, merah hanya untuk galat dan aksi berbahaya, keadaan memuat/kosong/galat wajib, status submission monokrom (7.4).
- **Gate**: `npm run check` (±4 menit), dan `npm run build` bila menyentuh routing atau config. Tes regresi ditulis dulu. Berkas tes maksimal 300 baris (pecah, jangan naikkan batas). Laporkan apa adanya. Beri pesan commit (Conventional Commits, English); jangan commit sendiri.
- Teks baru di layar aplikasi hanya Indonesia (belum dua bahasa); catat sebagai disengaja, jangan menambah kamus diam-diam. Perbarui `CLAUDE.md`, `DESIGN.md`, `Catatan Slicing.md`, dan memori.

## 5. Pelajaran teknis

- Server dev di port 3001 (port 3000 milik aplikasi lain; jangan jalankan `next dev` kedua). Setelah ubah `@utility` di `globals.css`, verifikasi lewat `npm run build` dan `next start -p 3002`; matikan hanya proses sendiri (cek `CommandLine`).
- Uji viewport nyata lewat Chrome DevTools Protocol (skrip Node WebSocket; Chrome di `C:\Program Files\Google\Chrome\Application\`; profil sementara; `MSYS_NO_PATHCONV=1`; tulis skrip dengan Write). Halaman yang di-cache Next tetap ada di DOM tersembunyi: saring elemen yang terlihat. Hindari regex di string template skrip.
- Next 16 `cacheComponents` menyimpan halaman sebelumnya tersembunyi: modal terbuka di sana membuat halaman tujuan inert (sudah ditangani di `Dialog` dan `Drawer`, tetapi tutup dialog sebelum berpindah). Rute dinamis baru butuh `npx next typegen`; `usePathname()` di rute dinamis butuh `<Suspense>`.
- Jangan `new Date()` atau `Date.now()` saat render komponen klien; baca di efek. Tiptap `useEditor` diberi opsi di level modul. Tanpa tailwind-merge: override kelas butuh akhiran `!`. Menulis berkas dengan Python di Windows menghasilkan CRLF; jalankan Prettier. Tes jsdom `today-block` dan `compose-view` kadang flaky (ulangi). Tes dengan `<dialog>` memanggil `installDialogShim()`; tes yang memuat server action butuh `vi.mock` pada modulnya.
- `.npmrc` `min-release-age=7`: instal yang gagal karena itu disengaja.
- **Dari 6f-1:** (1) Halaman `(app)` yang disimpan Next tetap hidup: state yang hanya diisi dari nilai awal akan basi saat kembali. Jadikan **alamat** sumber kebenaran (`useSearchParams`, sinkron saat render) dan buktikan di Chrome nyata (klik tautan "Semua Projects" dan nav). (2) Lint `react-hooks/set-state-in-effect` menolak `setState` sinkron di efek; baca jam lewat `queueMicrotask` atau di callback async. (3) Di tes, `useSearchParams` dari `next/navigation` perlu `vi.mock`. (4) `code-review` menemukan 7 dari 9 valid; semuanya dari data tepi (harga 0, kuota 0, tenggat tengah hari) dan state yang tidak ikut alamat. (5) Cek visual lewat skrip CDP di scratchpad (`cdp-projects.mjs` dkk.) ditulis ulang tiap sesi; `evaluate` tidak bisa mengembalikan elemen DOM (pakai `!!`). (6) `simplify` dikerjakan langsung tanpa empat agen.
- **Dari 6f-2:** (1) Lewat `scroll-behavior: smooth` `scrollIntoView` di skrip CDP menghitung koordinat di tengah animasi: pakai `behavior: "instant"`. (2) Enter di CDP butuh `text: String.fromCharCode(13)` agar tombol/formulir teraktivasi (tautan tidak butuh). (3) Pola `useSyncExternalStore` + cache parse per nilai (`registration-store.ts`) membuat halaman Next yang di-cache langsung menampilkan status baru; buktikan dengan klik tautan di Chrome. (4) Tes menangkap formulir tanpa tautan kembali: setiap layar baru diuji untuk jalan keluar. (5) `code-review` 6 dari 9 valid (cek ulang waktu saat kirim, idempotensi simpan, batas kuota). (6) Satu pendaftaran per proyek tanpa pembatalan; 6f-6 akan butuh fungsi untuk mengubah status `menunggu-pembayaran` menjadi `terdaftar`.
- Alur uji cepat 6f-1: buka `/beranda`, klik Projects, pilih chip, buka proyek, klik "Semua Projects"; ulangi hanya dengan Tab dan Enter.

- **Dari 6f-3:** (1) `evaluate` CDP tidak bisa mengembalikan elemen DOM: pakai `!!document.querySelector(...)` di `waitFor`. (2) Radio dalam satu grup hanya satu perhentian Tab; panah memindah dan memilih. Uji keyboard-only dengan Tab ke grup lalu panah. (3) Kompilasi rute baru di server dev bisa lebih dari 15 detik: beri `waitFor` 60 detik dan panaskan rute dengan `curl`. (4) Komponen yang membaca IndexedDB dan dipasang terus di Editor sebaiknya hanya dipasang saat dibuka (`SendToProjectDialog` mengembalikan `null` bila tidak `open`). (5) `code-review` 7 dari 8 valid, hampir semuanya dari keadaan tepi (state yang tidak diatur ulang setelah "Kirim karya lain", hitungan saat memuat, pilihan yang basi). (6) Batas `complexity` 15 muncul sebagai peringatan lint; ekstrak hook atau fungsi murni (`use-submit-form`, `project-action`) alih-alih menaikkan batas. (7) Tes jsdom `statistics-view` flaky di bawah beban (timeout 15 detik); ulangi sendirian. (8) `crypto.subtle` dan `crypto.randomUUID` hanya ada di konteks aman; hash ditulis sendiri di `lib/sha256.ts`, `randomUUID` dipakai seperti Studio dan Community. (9) Berkas tes dibatasi 300 baris; helper bersama dipindah ke `submit-helpers.tsx`. User bertanya apakah 300 baris terlalu pendek untuk tes; jawabannya ada di Catatan Slicing (usulan 450–500, butuh rencana). (10) Menu ⋯ memindah fokus ke butir pertama lewat `requestAnimationFrame`; uji keyboard-only menu di CDP perlu menunggu fokus pindah sebelum panah.

## 5b. Bahan khusus 6f-4 (Status submission dan "Proyek saya", PRJ-04, DESIGN 7.4)

Baca ulang PRD 10.5 (tabel status dan aturan transisi), 13.2, BR-PRJ-05, BR-STD-03, 17.5 ("Proyek saya", "Detail submission"), 20 (notifikasi), Q-22, Q-23. Pertanyaan yang perlu diajukan ke user sebelum rencana (beri opsi dan rekomendasi):
- Letak "Proyek saya": rute sendiri (`/projects/saya`) atau tab di `/projects`; apakah butir nav baru atau tidak.
- Detail submission: rute (`/projects/[slug]/kiriman/[id]`), isi (status, `statusLog`, riwayat versi dengan jumlah kata dan hash, feedback editor, tombol Kirim Revisi dan Tarik), dan keadaan Perlu Revisi dengan catatan.
- **Bagaimana status berubah tanpa peninjau** (6g belum ada): rekomendasi tombol pengembangan di detail submission (seperti "Tandai lunas") yang memajukan status dan mengisi feedback contoh, dengan fungsi yang kelak dipakai panel Editor.
- Kirim Revisi: versi baru (`versions[1]`), status Revisi Terkirim, versi lama tetap; revisi setelah tenggat hanya bila Perlu Revisi; batas putaran (usulan dua putaran, Q-22 belum dijawab).
- Tarik: konfirmasi, status Ditarik, melepaskan jatah (sudah dihitung `canAdd` dan `activeSubmissions`), penanda "Dikirim ke proyek" mengikuti.
- Sambungan: Beranda "Perlu perhatian" dan "Proyek saya" dari data nyata, notifikasi "Submission diterima" dan proyek dengan `href`, tab Proyek di profil (hanya atas persetujuan penulis; pengaturannya belum ada, tanya).
- Pendaftaran tanpa submission (Kelas, atau belum kirim) tampil di "Proyek saya" dengan status pendaftaran, bukan status submission.
- Yang BUKAN 6f-4: peninjauan Editor dan penilaian Juri (6g), dasbor Solo dan Kelas (6f-5), QRIS (6f-6).

## 6. Mulai dengan

1. Baca bagian 1, jalankan `git status` dan `git log --oneline -10`, lalu laporkan ringkas posisi dan yang belum di-commit.
2. Ajukan pertanyaan sub-langkah mana yang dimulai (bagian 3, sisa 6f-2 dst.) dengan rekomendasi, dan **berhenti menunggu jawaban**.
3. Setelah dijawab, ajukan pertanyaan klarifikasi yang perlu dan **rencana** untuk satu sub-langkah, lalu berhenti sampai disetujui.
