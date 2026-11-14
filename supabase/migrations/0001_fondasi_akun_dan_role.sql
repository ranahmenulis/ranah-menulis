-- 0001: fondasi akun, role platform, audit log (PRD 15, PLT-01..03, PLT-05)
-- Pola yang dipakai semua modul berikutnya:
--   * RLS aktif di setiap tabel; tanpa kebijakan = tanpa akses.
--   * Role platform tidak bisa ditulis oleh klien; hanya lewat fungsi/service role.
--   * Audit log hanya bisa ditambah, tidak bisa diubah atau dihapus oleh siapa pun.

-- ============ Profil ============
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  username      text unique check (username ~ '^[a-z0-9_]{3,30}$'),
  display_name  text check (char_length(display_name) <= 80),
  bio           text check (char_length(bio) <= 500),
  avatar_path   text,
  country       text check (country in ('ID', 'MY')),
  timezone      text not null default 'Asia/Jakarta',
  genres        text[] not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============ Role platform (hanya Administrator dan Super Admin) ============
-- Registered User/Writer dan penugasan per proyek/grup ditangani migrasi lain.
create type public.platform_role as enum ('administrator', 'super_admin');

create table public.platform_roles (
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        public.platform_role not null,
  granted_by  uuid references auth.users (id),
  granted_at  timestamptz not null default now(),
  primary key (user_id, role)
);

-- ============ Audit log (append-only) ============
create table public.audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid references auth.users (id) on delete set null,
  action      text not null,
  target_type text,
  target_id   text,
  detail      jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- ============ Fungsi bantu ============
create function public.has_platform_role(r public.platform_role)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.platform_roles
    where user_id = (select auth.uid()) and role = r
  );
$$;

create function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.platform_roles
    where user_id = (select auth.uid())
      and role in ('administrator', 'super_admin')
  );
$$;

-- Akun baru otomatis punya profil dan TIDAK punya role platform (AC-SA1).
create function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Pemberian/pencabutan role: hanya Super Admin, dicatat, dan Super Admin terakhir tidak bisa dicabut (PLT-03).
create function public.grant_platform_role(target uuid, r public.platform_role)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.has_platform_role('super_admin') then
    raise exception 'akses ditolak' using errcode = '42501';
  end if;
  insert into public.platform_roles (user_id, role, granted_by)
    values (target, r, (select auth.uid()))
    on conflict do nothing;
  insert into public.audit_log (actor_id, action, target_type, target_id, detail)
    values ((select auth.uid()), 'role.grant', 'user', target::text, jsonb_build_object('role', r));
end;
$$;

create function public.revoke_platform_role(target uuid, r public.platform_role)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.has_platform_role('super_admin') then
    raise exception 'akses ditolak' using errcode = '42501';
  end if;
  if r = 'super_admin'
     and (select count(*) from public.platform_roles where role = 'super_admin') <= 1 then
    raise exception 'tidak dapat mencabut Super Admin terakhir' using errcode = '23514';
  end if;
  delete from public.platform_roles where user_id = target and role = r;
  insert into public.audit_log (actor_id, action, target_type, target_id, detail)
    values ((select auth.uid()), 'role.revoke', 'user', target::text, jsonb_build_object('role', r));
end;
$$;

-- ============ RLS ============
alter table public.profiles       enable row level security;
alter table public.platform_roles enable row level security;
alter table public.audit_log      enable row level security;

-- Profil: terbaca publik (profil publik, COM-10), hanya pemilik yang boleh mengubah.
create policy profiles_select on public.profiles
  for select using (true);
create policy profiles_update_own on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Role platform: pengguna melihat miliknya, admin melihat semua. Tidak ada kebijakan tulis:
-- klien tidak bisa memberi role pada dirinya sendiri; gunakan grant_platform_role().
create policy platform_roles_select on public.platform_roles
  for select using ((select auth.uid()) = user_id or public.is_admin());

-- Audit log: admin boleh membaca. Tidak ada kebijakan tulis/ubah/hapus untuk klien.
create policy audit_log_select on public.audit_log
  for select using (public.is_admin());

revoke all on public.platform_roles from anon, authenticated;
revoke all on public.audit_log      from anon, authenticated;
grant select on public.platform_roles to authenticated;
grant select on public.audit_log      to authenticated;

revoke execute on function public.grant_platform_role(uuid, public.platform_role)  from public, anon;
revoke execute on function public.revoke_platform_role(uuid, public.platform_role) from public, anon;
grant  execute on function public.grant_platform_role(uuid, public.platform_role)  to authenticated;
grant  execute on function public.revoke_platform_role(uuid, public.platform_role) to authenticated;

-- ============ Penyiapan Super Admin pertama ============
-- Dilakukan sekali oleh tim teknis lewat SQL Editor (bukan lewat pendaftaran), setelah akun dibuat:
--   insert into public.platform_roles (user_id, role) values ('<uuid akun>', 'super_admin');
