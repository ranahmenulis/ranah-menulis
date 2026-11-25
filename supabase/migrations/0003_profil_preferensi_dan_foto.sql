-- 0003: preferensi profil, penanda onboarding, dan foto profil (Fase 1, Auth dan profil).
--   * prefs: preferensi akun (notifikasi, streak publik, menulis) sebagai JSON; hanya dibaca dan
--     ditulis pemilik lewat policy profiles_update_own yang sudah ada. Profil terbaca publik
--     (COM-10), jadi preferensi TIDAK boleh memuat data sensitif.
--   * onboarded_at: terisi saat penulis menyelesaikan layar Mulai.
--   * Foto: bucket publik `avatars`, satu berkas per pengguna di folder bernama id pengguna.

alter table public.profiles
  add column prefs jsonb not null default '{}'::jsonb,
  add column onboarded_at timestamptz;

alter table public.profiles
  add constraint profiles_prefs_is_object check (jsonb_typeof(prefs) = 'object'),
  add constraint profiles_prefs_size check (pg_column_size(prefs) <= 8192),
  -- Foto hanya boleh menunjuk berkas di folder milik pemilik profil.
  add constraint profiles_avatar_path_own_folder
    check (avatar_path is null or avatar_path like id::text || '/%');

-- ============ Storage: foto profil ============
-- Bucket publik (foto profil memang tampil di profil publik); batas 256 KB dan hanya gambar.
-- Aplikasi memotong foto menjadi 256 x 256 WebP sebelum mengunggah.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 262144, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Baca: semua orang (bucket publik). Tulis, ubah, hapus: hanya di folder `<id pengguna>/`.
create policy avatars_read on storage.objects
  for select using (bucket_id = 'avatars');

create policy avatars_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy avatars_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy avatars_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
