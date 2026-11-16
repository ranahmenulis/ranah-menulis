# Prompt: lanjut slicing

Tempel isi di bawah garis ini ke sesi baru di repo RanahMenulis (`D:\Code\Ranah Penulis`). Dibuat 16 November 2026.

---

Kamu melanjutkan slicing RanahMenulis (Next.js 16, Tailwind v4, Supabase; data dummy dan lokal). Jawab dalam Bahasa Indonesia; kode, komentar kode, dan nama tes dalam English. Jangan menulis kode sebelum selesai membaca dan sebelum rencana disetujui.

## 1. Baca dulu, berurutan

1. `CLAUDE.md` (terutama **Aturan kerja** butir 2, 3, 5, 6, 7) dan `AGENTS.md` (Next.js 16 berbeda dari yang kamu kenal; baca `node_modules/next/dist/docs/` sebelum menulis kode Next.js).
2. `docs/desain/Catatan Slicing.md`: urutan, aturan, utang, keputusan terbuka. Beberapa catatan di sana sudah basi (lihat bagian 3).
3. `docs/MVP Scope RanahMenulis.md` dan `docs/prd/23-ruang-lingkup-mvp.md`, lalu `docs/catatan-keputusan-client.md`.
4. Memori proyek di `C:\Users\toxix\.claude\projects\d--Code-Ranah-Penulis\memory\` (status, keputusan, pelajaran teknis).

## 2. Posisi sekarang (16 November 2026)

- **Selesai:** langkah 1–5 (token, landing, Editor Studio, Streak/Beranda/Dokumen/kerangka aplikasi, Community) dan 6a (Tersimpan, Notifikasi), 6b (profil publik), 6c (Bagikan, Kirim ke proyek, sampah), 6d (Statistik). Landing v3 sudah dipasang (font Inter dan Merriweather).
- **Belum:** **6e** Akun dan onboarding, **6f** Projects, **6g** Kelola, Admin, Juri, Grup.
- **Keputusan user yang tetap berlaku:** semua slicing memakai data dummy dan login di-bypass sampai SEMUA layar selesai dan desain disetujui. **Jangan** membangun backend (auth, apply migrasi, RLS, store Supabase) dan jangan menagih persetujuannya sebelum itu. Claude Design tidak dipakai; layar dibangun langsung dari `src/components/ui/` dan DESIGN.md.
- **Marketplace tidak masuk MVP** (PRD 23, keputusan client no. 11, Q-39 dan Q-51). Jangan menyentuhnya.
- **Git:** `main` maju beberapa commit dari `origin/main`. Jangan push dan jangan commit tanpa diminta. Jalankan `git status` dan laporkan apa yang belum di-commit.

## 3. Rapikan dulu (kecil, satu rencana)

- Catatan Slicing basi di: "Huruf sans final menunggu uji spesimen" (sudah Inter dan Merriweather), "Perubahan langkah 5 belum di-commit", deskripsi langkah 2 yang masih menyebut Tiga janji dan Cara kerja, dan langkah 1 yang masih menyebut Source Serif 4 dan Schibsted Grotesk. Perbarui hanya yang kamu verifikasi.
- Catat di rencana bahwa tombol Studio di landing menuju `/studio/baru`, yang hanya bisa dibuka karena login di-bypass. Tandai agar diganti saat 6e/auth dipasang.

## 4. Janji landing yang bergantung pada slicing

Landing sudah menjanjikan hal-hal ini. Slicing berikutnya harus menutupnya, bukan menambah janji baru:

| Janji landing | Ditutup oleh |
| --- | --- |
| Penghitung karakter dan paragraf (ubin "Word & Character Counter", STD-04 MVP), waktu baca (Q-52: kata ÷ 200 per menit, dibulatkan ke atas, minimal 1 menit) di editor | **Tambahan kecil di Studio**, bisa dikerjakan lebih dulu. **Selesai 16 November 2026**: modul hitung di `src/lib/text-stats.ts`, `editor-stats.ts` dan `word-count.tsx` di Studio |
| Ranah Project, Antologi/Solo Book/Kelas Menulis/Lomba Menulis, Kirim naskah, status kiriman, pilar "Peluang Terbit" dan "Pengembangan Diri" | **6f Projects** (celah terbesar) |
| "Kamu memilih negara di profil, dan tulisanmu muncul di daftar penulis negara itu"; tombol Masuk dan Daftar | **6e Akun dan onboarding** |
| Grup Penulis (FAQ) | **6g** (Q-38 belum diputuskan) |

Di luar slicing, tapi blokir sebelum tayang (laporkan, jangan kerjakan tanpa rencana): halaman `/kebijakan-privasi` dan `/kontak` belum ada, migrasi `0002_daftar_tunggu.sql` belum diterapkan (butuh rencana dan persetujuan sendiri), belum ada gambar Open Graph.

## 5. Urutan yang disarankan (konfirmasi ke user dulu)

1. Penghitung karakter, paragraf, dan waktu baca di editor (satu modul, kecil).
2. **6f Projects**, dipecah per bagian: katalog dan detail proyek, lalu Kirim karya (versi beku dari dokumen, `SendToProjectDialog` diganti dari keadaan kosong), lalu status submission (DESIGN 7.4), lalu QRIS. Pecah sesuai bagian 17 PRD.
3. **6e Akun dan onboarding**, lalu **6g**.

Tanyakan ke user urutan mana yang dipilih sebelum merencanakan. Bila user menyuruh langsung mengerjakan salah satu, tetap ikuti aturan di bawah.

## 6. Aturan kerja yang wajib

- **Klarifikasi sebelum eksekusi** (CLAUDE.md butir 2): tanyakan alur, keadaan kosong dan gagal, batas, dan privasi, dengan opsi konkret dan rekomendasi. Rujuk PRD atau `catatan-keputusan-client.md` bila jawabannya sudah ada; **baca PRD sebelum merekomendasikan cakupan** (rekomendasi "statistik postingan" untuk 6d pernah salah karena itu Fase 2). Perubahan tata letak: rumuskan masalahnya dulu, lalu tawarkan konsep; jangan langsung "memperbaiki".
- **Rencana sebelum perubahan besar** (butir 3): lebih dari 5 berkas, lebih dari satu modul, database, atau konfigurasi = rencana, lalu **berhenti sampai user menyetujui eksplisit**. Setiap sub-langkah 6 punya rencana sendiri.
- **Rutinitas tiap sub-langkah** (Catatan Slicing "Aturan kerja"): komponen yang ada → `break-ui` → `mobile-native` dan cek 375 → lihat di peramban sungguhan → `code-review` dan `simplify`. Skill lain hanya bila perlu (`security-review` untuk 6e dan 6g). Hindari `apple-design` dan `choreograph`. `design-taste-frontend` hanya untuk landing.
- **Gate** (butir 5): `npm run check`, dan `npm run build` bila menyentuh routing atau config. Laporkan apa adanya. Beri rekomendasi commit (butir 6) dan jangan commit sendiri.
- DESIGN.md menang atas skill: hanya `rounded-full` atau tanpa radius, satu tombol terisi per layar, merah hanya untuk galat dan aksi berbahaya, keadaan memuat/kosong/galat wajib, terang dan gelap, lebar 375 dan 1280, judul panjang, nama satu huruf, nol butir.
- Teks baru di Studio, Community, dan layar aplikasi masih hanya Indonesia (belum dua bahasa); catat sebagai yang disengaja belum, jangan diam-diam menambah kamus.

## 7. Pelajaran teknis dari sesi sebelumnya

- **Server dev proyek ini di port 3001** (port 3000 milik aplikasi lain; jangan jalankan `next dev` kedua). Server dev bisa terus menyajikan utilitas CSS lama setelah `@utility` di `globals.css` diubah: verifikasi lewat `npm run build` lalu `next start -p 3002`. Matikan **hanya** proses `next start` milik sendiri, periksa `CommandLine`-nya dulu (`TaskStop` hanya mematikan shell `npx`, bukan prosesnya).
- Uji viewport nyata lewat Chrome DevTools Protocol (skrip Node WebSocket; Chrome di `C:\Program Files\Google\Chrome\Application\`; profil sementara; lebar 375 dan 1280; tunggu `main h1`; ukur `scrollWidth - innerWidth`). Skrip ditulis ulang tiap sesi di scratchpad. Di Git Bash pakai `MSYS_NO_PATHCONV=1`; heredoc menghilangkan backslash path Windows, tulis skrip dengan Write. Chrome headless biasa terpotong di bawah 500px.
- **Jangan memanggil `new Date()` atau `Date.now()` saat render komponen klien** (Next 16 prerender menolaknya); baca di efek. `usePathname()` di rute dinamis butuh `<Suspense>`. Rute dinamis baru butuh `npx next typegen` agar `PageProps` dikenal. Tiptap `useEditor` harus diberi opsi di level modul.
- Tanpa tailwind-merge: override kelas pada komponen perlu akhiran `!`. Menulis berkas dengan Python di Windows menghasilkan CRLF; jalankan Prettier sesudahnya. Tes jsdom `today-block` dan `compose-view` kadang flaky di bawah beban (ulangi). Komponen yang memakai `<dialog>` di tes memanggil `installDialogShim()`. Tes komponen yang memuat server action perlu `vi.mock` pada modul actions-nya.
- `code-review` sering menuduh keliru: **verifikasi tiap temuan sebelum menerapkan** (kira-kira separuh valid). `simplify` cukup dikerjakan langsung.
- `.npmrc` `min-release-age=7`: instal yang gagal karena itu disengaja.

## 8. Mulai dengan

1. Baca bagian 1, jalankan `git status` dan `git log --oneline -10`, lalu laporkan ringkas: posisi, yang belum di-commit, dan apa yang basi di catatan.
2. Ajukan pertanyaan urutan (bagian 5) dengan rekomendasi, dan **berhenti menunggu jawaban**.
3. Setelah dijawab, ajukan **rencana** untuk satu sub-langkah (tujuan, berkas, langkah, risiko, cara membatalkan, pertanyaan terbuka), dan berhenti sampai disetujui.
