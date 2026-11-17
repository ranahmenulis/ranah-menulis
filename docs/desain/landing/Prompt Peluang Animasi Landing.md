# Prompt: peluang animasi landing

Tempel isi di bawah garis ini ke sesi baru di repo RanahMenulis (`D:\Code\Ranah Penulis`). Pertanyaannya sengaja dimuat di dalam prompt: skill `find-animation-opportunities` hanya menjawab "siap" bila dipanggil tanpa pertanyaan.

---

Jalankan skill `find-animation-opportunities` pada **landing page** (`/`, kode di `src/features/landing/` dan `src/app/page.tsx`). Pertanyaan: *di bagian landing mana gerak benar-benar membantu, dan mana yang sebaiknya tetap diam?* Jawab dalam Bahasa Indonesia. Skill ini hanya melapor; jangan mengubah kode.

## Konteks yang wajib dibaca

- `CLAUDE.md` (bagian Landing, Gerak gulir, Aturan kerja) dan `DESIGN.md` 4.6 (gerak, termasuk pengecualian landing).
- `src/app/globals.css` bagian "Landing motion" (kelas `lp-*`) dan token `--ease-out`.
- `src/features/landing/motion/` (`motion-env.ts`, `loop-registry.ts`, `use-loop.ts`), `components/enter-title.tsx`, `components/previews/loop-frame.tsx`.

## Gerak yang sudah ada (jangan diusulkan ulang)

- Entrance hero: judul naik per baris dari topeng kata (700 ms, antarbaris 80 ms), lalu teks dan tombol naik 12 px (520 ms).
- Lapisan hover/tekan: `lp-btn` (naik 1 px saat hover pointer halus, tenggelam 1 px saat ditekan), `lp-press`, `lp-link` (garis bawah menggambar kiri ke kanan).
- Empat pratinjau ber-loop (`LoopFrame`, siklus 3,2 dtk, satu loop aktif per layar, tombol jeda): Streak, Project (Submission), Studio (Editor). Pratinjau Share dipensiunkan dari halaman.
- Video hero (poster memudar ke video 300 ms) dan pesan galat form (`starting:opacity-0`, 200 ms).
- Semua gerak landing hanya aktif di bawah `html.lp-motion` (skrip di `app/page.tsx`; mati saat reduced motion atau bila landing tidak terhidrasi dalam 3,5 dtk). Gerak baru harus ikut aturan ini dan punya keadaan akhir yang utuh tanpa JS.

## Aturan proyek yang mengalahkan default skill

- Kurva proyek: `--ease-out: cubic-bezier(0.2, 0, 0, 1)` (di `globals.css`). Pakai ini, bukan nilai default skill. Durasi aplikasi 120/200/300 ms; landing boleh lebih panjang untuk entrance (maks 700 ms).
- DESIGN.md 4.4: hanya `rounded-full` atau tanpa radius. Hanya opasitas dan transform; tanpa bayangan baru, tanpa warna aksen.
- Satu entrance per kontainer. Landing sudah memakai satu "momen" (entrance hero); momen `word-highlight` lama sudah dipensiunkan di v3.
- Jangan menyentuh teks yang menjanjikan fitur belum ada: bagian bertanda "Menyusul" (Marketplace, program Community, Template) tidak boleh terlihat seolah berfungsi.

## Bahan awal dari rekon sesi sebelumnya (kandidat untuk **diuji lewat Gate**, bukan kesimpulan)

Kemungkinan lolos, bukti kode:
1. **Legenda Studio ↔ penanda di mockup.** `writing-experience.tsx` (legenda 01–06) dan `studio-mockup.tsx` (`MARKERS`, `Marker`). Keduanya statis; sorot penanda saat butir legenda di-hover/fokus dan sebaliknya (tujuan: penjelasan). Perhatikan gating `@media (hover: hover) and (pointer: fine)` dan fokus keyboard.
2. **Judul penutup** (`waitlist.tsx`, `display`, bagian `theme-invert`). Satu-satunya pernyataan besar di akhir halaman tanpa gerak apa pun sejak momen `word-highlight` dihapus. Pertimbangkan entrance seperti hero saat masuk layar, sekali. Uji apakah ini "momen kedua" yang masih wajar atau sudah berlebihan.
3. **Pratinjau Community** (`previews/community-preview.tsx`) satu-satunya modul beranimasi yang diam, padahal tiga modul lain berloop. Bila ditambah loop (Apresiasi terisi, hitungan naik), periksa dampaknya pada `loop-registry` (hanya satu loop aktif per layar).
4. **Chip minat di form** (`components/ui/chip.tsx`): hanya `hover:bg-line`, tanpa keadaan `:active`. Periksa frekuensi dan apakah sudah tertutup oleh aturan sentuh global.

Kemungkinan ditolak (konfirmasi di Bagian 2 laporan):
- Hitung naik pada angka social proof: data fungsional, angkanya masih [konfirmasi] dan "1k+" bukan hitungan.
- Gerak apa pun pada Marketplace dan label "Menyusul".
- Reveal-on-scroll di setiap judul bagian: jebakan over-animation, dan menyembunyikan isi bila JS gagal.
- Transisi hamburger dan anchor: sudah dikerjakan `Menu` dan `scroll-behavior: smooth`.

## Keluaran dan langkah berikutnya

1. Laporan dalam format skill (tabel peluang, daftar ditolak, vonis), maksimal 5–7 baris.
2. **Berhenti dan tunggu user.** Bila lebih dari 5 berkas akan berubah, CLAUDE.md Aturan kerja butir 3 mewajibkan rencana yang disetujui dulu. Bentuk rencana dari baris yang dipilih user memakai `improve-animations plan <baris>`.
3. Verifikasi bila nanti diimplementasikan: `npm run check`, `npm run build`, lalu `next start` di port 3002 (server dev di 3001 bisa menyajikan utilitas CSS lama), cek di Chrome 375 dan 1280 px terang dan gelap, dan cek `prefers-reduced-motion`. Matikan hanya proses `next start` milik sendiri setelah memeriksa `CommandLine`-nya.
