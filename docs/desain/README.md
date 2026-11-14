# Salinan desain dari Claude Design

Arsip tiga artifact claude.ai yang menjadi sumber desain RanahMenulis. Disalin pada **15 November 2026** supaya desain tercatat di repo dan tetap bisa dibaca bila artifact berubah atau hilang.

**Arsip ini bukan sumber kebenaran.** Urutan rujukan bila ada yang bertentangan: keputusan client, PRD v0.2, lalu [DESIGN.md](../../DESIGN.md), baru salinan ini. Butir bertanda `[usulan]` atau `[konfirmasi]` di dalamnya belum disetujui client.

| Folder | Artifact | Versi saat disalin | Isi |
| --- | --- | --- | --- |
| [sistem-desain/](sistem-desain) | https://claude.ai/artifact/FmTvmjt7LXVGP8gEoXhSmg | 1794681143-2e8b | `tokens.json`, `README.md` (aturan dan daftar [usulan]), `components/bundle.css` dan `variabel.css`, README tiap komponen |
| [landing/](landing) | https://claude.ai/artifact/GVbksuRFJoUKTqjkLfuzVA | 1794677539-2405 | 9 papan landing, `landing.css`, `canvas.json` |
| [aplikasi/](aplikasi) | https://claude.ai/artifact/CCeL1i4WJLNNFWwSm14ops | 1794681773-252a | 32 papan: Editor, Streak, Beranda, Studio, bilah bawah, Jelajahi, halaman postingan, Tulis postingan. `canvas.json` memuat catatan keputusan tiap bagian |

## Cara membaca

- `*.dc.html` adalah satu papan (artboard) dalam format kanvas Design. Berkas ini **tidak bisa dibuka langsung di browser**: ia memakai `support.js` dan elemen `<dc-import>` milik runtime kanvas yang tidak disalin. Baca sebagai teks: markup, kelas `rm-`, dan teks contoh.
- Papan kecil seperti `EditorSimpan` atau `StreakHari` hanya menyusun keadaan dari papan induk (`Main`, `Streak`, `Beranda`, `Studio`, `Discover`, `Postingan`, `TulisPostingan`) lewat `<dc-import state="...">`. Markup sebenarnya ada di papan induk.
- `canvas.json` berisi posisi papan dan **catatan keputusan** (`notes`), termasuk butir [konfirmasi]. Baca catatan itu sebelum mengimplementasikan layar.
- `sistem-desain/components/bundle.css` adalah kelas komponen (`rm-*`). `tokens.json` adalah sumber token mesin; `variabel.css` adalah turunannya.

## Yang sengaja tidak disalin

- `preview.html` tiap komponen (kartu pratinjau; dapat dibuat ulang dari `bundle.css`).
- Runtime kanvas dan sistem desain (`artifact-type/`, `index.html`, `i18n/`, `SKILL.md`).
- Salinan `ds/ranahmenulis/` di dalam kanvas landing dan aplikasi (kembar dari `sistem-desain/`).
- Berkas logo biner. Logo asli ada di [public/logo/](../../public/logo).

## Yang belum didesain

Akun dan onboarding (R1), profil publik, Tersimpan, Notifikasi, Statistik, dialog Bagikan dan Kirim ke proyek, seluruh Projects (R4–R5), sisi Kelola dan Admin, Grup. Spesifikasi tertulisnya ada di DESIGN.md bagian 6 dan Brief Desain bagian 4.

## Selisih dengan DESIGN.md yang perlu dicatat

Tambahan di artifact yang belum ada di DESIGN.md: token `ink-read`, `opacity-press`, token layout landing, komponen IndikatorTarget, DialogKonflik, BlokHariIni, LangkahAwal, DeretanPenulis, Pemberitahuan, ToolbarFormat, KartuPrompt, Milestone, StatistikRingkas, dan daftar [usulan] di `sistem-desain/README.md` (revisi 1 sampai 1d dan putaran 2).
