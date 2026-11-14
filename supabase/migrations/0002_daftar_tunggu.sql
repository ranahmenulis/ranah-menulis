-- 0002: daftar tunggu landing pra-peluncuran.
-- Satu-satunya tabel yang dibutuhkan landing. Tidak ada kebijakan RLS: hanya server action
-- (service role) yang menulis. Anon dan authenticated tidak punya akses sama sekali.
-- Catatan: halaman Kebijakan privasi harus ada sebelum form dibuka ke publik.

create table public.waitlist_signups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 80),
  email       text not null check (char_length(email) <= 254),
  country     text not null check (country in ('ID', 'MY', 'OTHER')),
  interests   text[] not null default '{}',
  created_at  timestamptz not null default now()
);

-- Satu email satu baris, tanpa membedakan huruf besar-kecil.
create unique index waitlist_signups_email_key on public.waitlist_signups (lower(email));

alter table public.waitlist_signups enable row level security;
revoke all on public.waitlist_signups from anon, authenticated;
