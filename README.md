# RanahMenulis

Ekosistem digital untuk menulis, komunitas literasi, dan penerbitan buku (Indonesia dan Malaysia).
Next.js 16 (monolith, App Router) + TypeScript + Tailwind CSS v4 + Supabase.

Dokumen ada di [`docs/`](docs) (peta isi: [`docs/README.md`](docs/README.md)): PRD (sumber di `docs/prd/`), dokumen produk di `docs/produk/`, arsip desain, referensi, dan arsip mentah.
Aturan desain ada di [`DESIGN.md`](DESIGN.md). Aturan kerja untuk pengembang dan agen AI ada di [`CLAUDE.md`](CLAUDE.md).

## Mulai

Prasyarat: Node sesuai [`.nvmrc`](.nvmrc) (26 LTS; minimal 24).

```bash
nvm use                        # atau pasang Node sesuai .nvmrc
npm install                    # juga memasang hook git (pre-commit dan pre-push)
cp .env.example .env.local     # isi kunci Supabase
npm run dev
```

## Perintah

| Perintah                | Fungsi                                                  |
| ----------------------- | ------------------------------------------------------- |
| `npm run dev`           | Dev server di `localhost:3000`                          |
| `npm run build`         | Build produksi                                          |
| `npm run check`         | Semua gate cepat: format, lint, typecheck, tes          |
| `npm run format`        | Rapikan kode dengan Prettier                            |
| `npm test`              | Tes Vitest sekali jalan (`npm run test:watch` untuk watch) |
| `npm run test:coverage` | Tes dengan laporan coverage (HTML di `coverage/`)       |

Hook git: `pre-commit` merapikan dan me-lint berkas yang di-stage; `pre-push` menjalankan typecheck dan tes. CI (`.github/workflows/ci.yml`) menjalankan seluruh gate plus audit dependensi produksi dan build.

## Struktur

- `src/app/` routing saja (page, layout, route handler)
- `src/features/<domain>/` kode milik satu fitur, termasuk tesnya (contoh: `landing/`)
- `src/components/ui/` komponen dasar lintas fitur
- `src/lib/` infrastruktur bersama: klien Supabase (`supabase/`), validasi env (`env.ts`, `env.server.ts`)
- `src/proxy.ts` penyegaran sesi (di Next.js 16, proxy menggantikan middleware)
- `supabase/migrations/` skema dan kebijakan RLS
- `docs/` PRD, dokumen desain, dan arsip desain

Satu berkas maksimal 300 baris (ditegakkan ESLint). Aturan lengkap ada di `CLAUDE.md`.

## Supabase

Skema dikelola lewat berkas migrasi berurutan di `supabase/migrations/` (bukan perubahan manual di dasbor), supaya database mudah dipindah ke VPS kelak (PRD 19.3).

Terapkan migrasi: tempel isi berkas berurutan di Supabase SQL Editor, atau pakai Supabase CLI (`supabase link` lalu `supabase db push`).

Super Admin pertama dibuat lewat SQL setelah akunnya terdaftar; petunjuk ada di akhir `0001_fondasi_akun_dan_role.sql`.

Aturan: data sensitif diakses lewat server, RLS aktif di setiap tabel, kunci `SUPABASE_SECRET_KEY` tidak pernah dikirim ke browser.
