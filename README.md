# RanahMenulis

Ekosistem digital untuk menulis, komunitas literasi, dan penerbitan buku (Indonesia dan Malaysia).
Next.js (monolith) + TypeScript + Tailwind CSS + Supabase.

Dokumen produk ada di [`docs/`](docs): PRD (sumber di `docs/prd/`), roadmap MVP, dan brief desain.

## Mulai

```bash
npm install
cp .env.example .env.local   # isi kunci Supabase
npm run dev
```

## Supabase

Skema dikelola lewat berkas migrasi berurutan di `supabase/migrations/` (bukan perubahan manual di dasbor), supaya database mudah dipindah ke VPS kelak (PRD 19.3).

Terapkan migrasi: tempel isi berkas berurutan di Supabase SQL Editor, atau pakai Supabase CLI (`supabase link` lalu `supabase db push`).

Super Admin pertama dibuat lewat SQL setelah akunnya terdaftar; petunjuk ada di akhir `0001_fondasi_akun_dan_role.sql`.

## Struktur

- `src/lib/supabase/` klien browser, server, dan admin (service role, hanya server)
- `src/proxy.ts` penyegaran sesi
- `supabase/migrations/` skema dan kebijakan RLS
- `docs/` PRD dan dokumen desain

Aturan: data sensitif diakses lewat server, RLS aktif di setiap tabel, kunci `SUPABASE_SECRET_KEY` tidak pernah dikirim ke browser.
