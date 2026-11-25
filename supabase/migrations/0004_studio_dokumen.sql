-- 0004: Studio (Fase 2): folder/naskah buku, dokumen, riwayat versi, log harian, sampul.
-- Aturan:
--   * Semua data hanya milik pemilik (BR-STD-06). Administrator TIDAK diberi akses baca.
--   * Klien hanya boleh MEMBACA tabel dokumen, versi, dan log harian. Semua penulisan lewat fungsi
--     `studio_*` (security definer) yang memeriksa pemilik, nomor versi (konflik, BR-STD-04), dan
--     batas ukuran di dalam satu transaksi. Folder boleh ditulis langsung (RLS pemilik).
--   * Aturan hitung (kata hari ini, potret versi, aktivitas) tetap di TypeScript; fungsi menerima
--     hasilnya dan menjamin atomisitas, penggabungan antar-dokumen, dan kepemilikan.
--   * Batas [usulan, disetujui user 25 November 2026]: isi dokumen maks. 2 MB JSON; 5 tag per
--     dokumen, 24 karakter per tag; 5 target; 100 versi per dokumen disimpan 3 hari.

-- ============ Fungsi bantu murni ============
create function public.studio_tags_ok(t text[])
returns boolean
language sql immutable set search_path = ''
as $$
  select t is null or (
    cardinality(t) <= 5
    and coalesce((select bool_and(char_length(x) between 1 and 24) from unnest(t) as x), true)
  );
$$;

create function public.studio_cover_ok(c jsonb)
returns boolean
language sql immutable set search_path = ''
as $$
  select c is null or (
    jsonb_typeof(c) = 'object'
    and jsonb_typeof(c -> 'fileId') = 'string'
    and jsonb_typeof(c -> 'alt') = 'string'
    and char_length(c ->> 'fileId') between 1 and 200
    and char_length(c ->> 'alt') <= 200
  );
$$;

-- ============ Folder (juga naskah buku) ============
create table public.studio_folders (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 200),
  kind          text check (kind = 'book'),
  cover         jsonb check (public.studio_cover_ok(cover)),
  chapter_order uuid[] check (chapter_order is null or cardinality(chapter_order) <= 2000),
  genre         text check (genre in ('cerpen', 'puisi', 'esai', 'novel', 'naskah', 'lainnya')),
  tags          text[] check (public.studio_tags_ok(tags)),
  synopsis      text check (char_length(synopsis) <= 600),
  collection_id uuid,
  targets       jsonb check (
                  targets is null
                  or (jsonb_typeof(targets) = 'array' and jsonb_array_length(targets) <= 5)
                ),
  created_at    timestamptz not null default now(),
  unique (owner_id, id),
  check (collection_id is null or collection_id <> id),
  -- Buku hanya boleh ditaruh di folder milik sendiri.
  foreign key (owner_id, collection_id)
    references public.studio_folders (owner_id, id) on delete set null (collection_id)
);

create index studio_folders_owner on public.studio_folders (owner_id);

-- ============ Dokumen ============
create table public.studio_documents (
  id          uuid primary key,
  owner_id    uuid not null references auth.users (id) on delete cascade,
  folder_id   uuid,
  title       text not null default '' check (char_length(title) <= 500),
  content     jsonb not null check (
                jsonb_typeof(content) = 'object' and octet_length(content::text) <= 2097152
              ),
  word_count  integer not null default 0 check (word_count between 0 and 10000000),
  version     integer not null default 1 check (version >= 1),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  archived_at timestamptz,
  kind        text check (kind in ('cerpen', 'puisi', 'esai', 'novel', 'naskah', 'lainnya')),
  tags        text[] check (public.studio_tags_ok(tags)),
  synopsis    text check (char_length(synopsis) <= 600),
  cover       jsonb check (public.studio_cover_ok(cover)),
  targets     jsonb check (
                targets is null
                or (jsonb_typeof(targets) = 'array' and jsonb_array_length(targets) <= 5)
              ),
  layout      jsonb check (
                layout is null
                or (jsonb_typeof(layout) = 'object' and octet_length(layout::text) <= 2048)
              ),
  -- Dokumen hanya boleh ditaruh di folder milik sendiri.
  foreign key (owner_id, folder_id)
    references public.studio_folders (owner_id, id) on delete set null (folder_id)
);

create index studio_documents_owner_updated on public.studio_documents (owner_id, updated_at desc);
create index studio_documents_owner_folder on public.studio_documents (owner_id, folder_id);

-- ============ Riwayat versi (STD-12, disimpan 3 hari) ============
create table public.studio_versions (
  id          text primary key check (char_length(id) <= 80),   -- `<id dokumen>:v<versi>`
  doc_id      uuid not null references public.studio_documents (id) on delete cascade,
  owner_id    uuid not null references auth.users (id) on delete cascade,
  saved_at    timestamptz not null,
  title       text not null default '' check (char_length(title) <= 500),
  content     jsonb not null check (
                jsonb_typeof(content) = 'object' and octet_length(content::text) <= 2097152
              ),
  word_count  integer not null default 0 check (word_count between 0 and 10000000),
  reason      text not null check (reason in ('berkala', 'pelindung', 'pemulihan'))
);

create index studio_versions_doc on public.studio_versions (doc_id, saved_at desc);

-- ============ Log kata harian (Streak, Statistik, target harian) ============
create table public.studio_daily_log (
  owner_id  uuid not null references auth.users (id) on delete cascade,
  day       date not null,    -- tanggal menurut zona waktu profil saat itu; tidak bergeser kemudian
  docs      jsonb not null default '{}'::jsonb check (
              jsonb_typeof(docs) = 'object' and octet_length(docs::text) <= 1048576
            ),
  activity  jsonb check (activity is null or jsonb_typeof(activity) = 'object'),
  primary key (owner_id, day)
);

-- ============ RLS ============
alter table public.studio_folders   enable row level security;
alter table public.studio_documents enable row level security;
alter table public.studio_versions  enable row level security;
alter table public.studio_daily_log enable row level security;

create policy studio_folders_select on public.studio_folders
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy studio_folders_insert on public.studio_folders
  for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy studio_folders_update on public.studio_folders
  for update to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

create policy studio_documents_select on public.studio_documents
  for select to authenticated using ((select auth.uid()) = owner_id);
-- Hapus permanen hanya untuk dokumen yang sudah di Sampah (versi ikut terhapus lewat cascade).
create policy studio_documents_delete on public.studio_documents
  for delete to authenticated
  using ((select auth.uid()) = owner_id and deleted_at is not null);

create policy studio_versions_select on public.studio_versions
  for select to authenticated using ((select auth.uid()) = owner_id);

create policy studio_daily_log_select on public.studio_daily_log
  for select to authenticated using ((select auth.uid()) = owner_id);

revoke all on public.studio_folders, public.studio_documents, public.studio_versions,
  public.studio_daily_log from anon, authenticated;
grant select, insert, update on public.studio_folders to authenticated;
grant select, delete on public.studio_documents to authenticated;
grant select on public.studio_versions to authenticated;
grant select on public.studio_daily_log to authenticated;

-- ============ Pemangkasan versi (internal) ============
-- Sama dengan versionsToPrune di TypeScript: yang lewat 3 hari dibuang, lalu yang terlama di atas 100.
create function public.studio_prune_versions(p_doc uuid)
returns void
language sql security definer set search_path = ''
as $$
  delete from public.studio_versions
   where doc_id = p_doc and saved_at < now() - interval '3 days';
  delete from public.studio_versions
   where id in (
     select id from public.studio_versions
      where doc_id = p_doc
      order by saved_at desc
      offset 100
   );
$$;

-- Satu versi dari JSON klien ({id, savedAt, title, content, wordCount, reason}); idempotent per id.
create function public.studio_put_version(p_doc uuid, p_owner uuid, e jsonb)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if e ->> 'id' is null or left(e ->> 'id', length(p_doc::text) + 2) <> p_doc::text || ':v' then
    raise exception 'versi tidak cocok dengan dokumen' using errcode = '22023';
  end if;
  insert into public.studio_versions (id, doc_id, owner_id, saved_at, title, content, word_count, reason)
  values (
    e ->> 'id', p_doc, p_owner,
    to_timestamp((e ->> 'savedAt')::double precision / 1000),
    coalesce(e ->> 'title', ''), e -> 'content', (e ->> 'wordCount')::integer, e ->> 'reason'
  )
  on conflict (id) do update
    set saved_at = excluded.saved_at, title = excluded.title, content = excluded.content,
        word_count = excluded.word_count, reason = excluded.reason;
end;
$$;

-- ============ Simpan dokumen (atomik: dokumen + log harian + potret versi) ============
-- Hasil: {ok:true, doc, progress} atau {ok:false, conflict} bila p_base_version bukan versi tersimpan.
-- p_base_version diabaikan untuk dokumen baru. p_targets/p_layout null = biarkan yang tersimpan.
-- p_day null = tanpa catatan harian. p_doc_words null = jangan ubah baris dokumen ini di log.
-- p_activity {reduced, hour, added} DITAMBAHKAN ke aktivitas hari itu (bukan menimpa).
create function public.studio_save_document(
  p_id uuid,
  p_title text,
  p_content jsonb,
  p_word_count integer,
  p_base_version integer,
  p_targets jsonb default null,
  p_layout jsonb default null,
  p_folder_id uuid default null,
  p_day date default null,
  p_doc_words integer default null,
  p_activity jsonb default null,
  p_versions jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_doc public.studio_documents;
  v_docs jsonb;
  v_act jsonb;
  v_hour text;
  v_added integer;
  v_progress jsonb := null;
  e jsonb;
begin
  if v_uid is null then raise exception 'akses ditolak' using errcode = '42501'; end if;

  select * into v_doc from public.studio_documents where id = p_id for update;
  if found then
    if v_doc.owner_id <> v_uid then raise exception 'akses ditolak' using errcode = '42501'; end if;
    if v_doc.version <> p_base_version then
      return jsonb_build_object('ok', false, 'conflict', to_jsonb(v_doc));
    end if;
    update public.studio_documents
       set title = p_title, content = p_content, word_count = p_word_count,
           version = version + 1, updated_at = now(),
           targets = coalesce(p_targets, targets), layout = coalesce(p_layout, layout)
     where id = p_id
     returning * into v_doc;
  else
    insert into public.studio_documents
      (id, owner_id, folder_id, title, content, word_count, targets, layout)
    values (p_id, v_uid, p_folder_id, p_title, p_content, p_word_count, p_targets, p_layout)
    returning * into v_doc;
  end if;

  if p_day is not null then
    if abs(p_day - current_date) > 2 then
      raise exception 'tanggal catatan di luar batas' using errcode = '22023';
    end if;
    insert into public.studio_daily_log (owner_id, day) values (v_uid, p_day)
      on conflict do nothing;
    select docs, activity into v_docs, v_act
      from public.studio_daily_log where owner_id = v_uid and day = p_day for update;

    if p_doc_words is not null then
      if p_doc_words not between 0 and 10000000 then
        raise exception 'jumlah kata tidak valid' using errcode = '22023';
      end if;
      v_docs := v_docs || jsonb_build_object(
        p_id::text, jsonb_build_object('title', p_title, 'words', p_doc_words)
      );
    end if;

    if p_activity is not null then
      v_act := coalesce(v_act, '{"wordsReduced":0,"wordsAddedByHour":{}}'::jsonb);
      v_act := jsonb_set(
        v_act, '{wordsReduced}',
        to_jsonb(coalesce((v_act ->> 'wordsReduced')::integer, 0)
                 + greatest(coalesce((p_activity ->> 'reduced')::integer, 0), 0))
      );
      v_added := greatest(coalesce((p_activity ->> 'added')::integer, 0), 0);
      if v_added > 0 then
        v_hour := ((p_activity ->> 'hour')::integer)::text;
        if (p_activity ->> 'hour')::integer not between 0 and 23 then
          raise exception 'jam tidak valid' using errcode = '22023';
        end if;
        v_act := jsonb_set(
          v_act, array['wordsAddedByHour', v_hour],
          to_jsonb(coalesce((v_act -> 'wordsAddedByHour' ->> v_hour)::integer, 0) + v_added), true
        );
      end if;
    end if;

    update public.studio_daily_log set docs = v_docs, activity = v_act
     where owner_id = v_uid and day = p_day;
    v_progress := jsonb_build_object('day', p_day, 'docs', v_docs, 'activity', v_act);
  end if;

  for e in select * from jsonb_array_elements(coalesce(p_versions, '[]'::jsonb)) loop
    perform public.studio_put_version(p_id, v_uid, e);
  end loop;
  perform public.studio_prune_versions(p_id);

  return jsonb_build_object('ok', true, 'doc', to_jsonb(v_doc), 'progress', v_progress);
end;
$$;

-- ============ Ubah meta (judul, folder, sampah, sinopsis, target, sampul) ============
-- Hanya kunci yang ada di p_patch yang berubah (camelCase seperti di aplikasi); nilai null mengosongkan.
-- Menaikkan versi (dihitung sebagai perubahan). Hasil null bila tidak ada atau di Arsip.
create function public.studio_update_meta(p_id uuid, p_patch jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_doc public.studio_documents;
begin
  if v_uid is null then raise exception 'akses ditolak' using errcode = '42501'; end if;
  select * into v_doc from public.studio_documents where id = p_id and owner_id = v_uid for update;
  if not found or (v_doc.deleted_at is null and v_doc.archived_at is not null) then return null; end if;

  update public.studio_documents set
    title      = case when p_patch ? 'title' then coalesce(p_patch ->> 'title', '') else title end,
    folder_id  = case when p_patch ? 'folderId' then (p_patch ->> 'folderId')::uuid else folder_id end,
    deleted_at = case when p_patch ? 'deletedAt'
                   then to_timestamp((p_patch ->> 'deletedAt')::double precision / 1000)
                   else deleted_at end,
    synopsis   = case when p_patch ? 'synopsis' then p_patch ->> 'synopsis' else synopsis end,
    targets    = case when p_patch ? 'targets'
                   then nullif(p_patch -> 'targets', 'null'::jsonb) else targets end,
    cover      = case when p_patch ? 'cover'
                   then nullif(p_patch -> 'cover', 'null'::jsonb) else cover end,
    version    = version + 1,
    updated_at = now()
   where id = p_id
   returning * into v_doc;
  return to_jsonb(v_doc);
end;
$$;

-- ============ Arsip dan pulihkan (tidak mengubah versi atau waktu ubah) ============
create function public.studio_set_archived(p_id uuid, p_archived boolean)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_doc public.studio_documents;
begin
  if v_uid is null then raise exception 'akses ditolak' using errcode = '42501'; end if;
  select * into v_doc from public.studio_documents where id = p_id and owner_id = v_uid for update;
  if not found or v_doc.deleted_at is not null
     or (v_doc.archived_at is not null) = p_archived then
    return null;
  end if;
  update public.studio_documents
     set archived_at = case when p_archived then now() else null end
   where id = p_id
   returning * into v_doc;
  return to_jsonb(v_doc);
end;
$$;

-- ============ Jenis dan tag (tanpa mengubah versi atau waktu ubah) ============
-- Hanya bila nilai awal dialog masih sama dengan yang tersimpan (null dan kosong dianggap sama).
create function public.studio_update_classification(
  p_id uuid,
  p_expected_kind text,
  p_expected_tags text[],
  p_kind text,
  p_tags text[]
)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_doc public.studio_documents;
begin
  if v_uid is null then raise exception 'akses ditolak' using errcode = '42501'; end if;
  select * into v_doc from public.studio_documents where id = p_id and owner_id = v_uid for update;
  if not found or v_doc.deleted_at is not null or v_doc.archived_at is not null then
    return jsonb_build_object('status', 'unavailable');
  end if;
  if v_doc.kind is distinct from p_expected_kind
     or coalesce(v_doc.tags, '{}') is distinct from coalesce(p_expected_tags, '{}') then
    return jsonb_build_object('status', 'conflict', 'doc', to_jsonb(v_doc));
  end if;
  if (p_kind is not null and p_kind not in ('cerpen', 'puisi', 'esai', 'novel', 'naskah', 'lainnya'))
     or not public.studio_tags_ok(p_tags) then
    return jsonb_build_object('status', 'invalid');
  end if;
  update public.studio_documents set kind = p_kind, tags = p_tags where id = p_id
    returning * into v_doc;
  return jsonb_build_object('status', 'saved', 'doc', to_jsonb(v_doc));
end;
$$;

-- ============ Salin ============
-- Penyelesaian konflik "simpan keduanya": menyalin isi yang diberikan klien sebagai dokumen baru versi 1.
create function public.studio_insert_copy(
  p_id uuid, p_title text, p_content jsonb, p_word_count integer,
  p_folder_id uuid default null, p_kind text default null, p_tags text[] default null,
  p_synopsis text default null, p_targets jsonb default null, p_layout jsonb default null,
  p_cover jsonb default null
)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_doc public.studio_documents;
begin
  if v_uid is null then raise exception 'akses ditolak' using errcode = '42501'; end if;
  insert into public.studio_documents
    (id, owner_id, folder_id, title, content, word_count, kind, tags, synopsis, targets, layout, cover)
  values
    (p_id, v_uid, p_folder_id, p_title, p_content, p_word_count, p_kind, p_tags, p_synopsis,
     p_targets, p_layout, p_cover)
  returning * into v_doc;
  return to_jsonb(v_doc);
end;
$$;

-- Duplikat dokumen aktif: isi, folder, jenis, tag, dan tata letak; tanpa target atau riwayat.
create function public.studio_duplicate_active(p_source uuid, p_new_id uuid, p_title text)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_src public.studio_documents;
  v_doc public.studio_documents;
begin
  if v_uid is null then raise exception 'akses ditolak' using errcode = '42501'; end if;
  select * into v_src from public.studio_documents where id = p_source and owner_id = v_uid;
  if not found or v_src.deleted_at is not null or v_src.archived_at is not null then return null; end if;
  insert into public.studio_documents
    (id, owner_id, folder_id, title, content, word_count, kind, tags, layout)
  values
    (p_new_id, v_uid, v_src.folder_id, p_title, v_src.content, v_src.word_count, v_src.kind,
     v_src.tags, v_src.layout)
  returning * into v_doc;
  return to_jsonb(v_doc);
end;
$$;

-- ============ Versi tambahan (potret sebelum pemulihan) ============
create function public.studio_add_version(p_version jsonb)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_doc uuid := (p_version ->> 'docId')::uuid;
begin
  if v_uid is null then raise exception 'akses ditolak' using errcode = '42501'; end if;
  if not exists (select 1 from public.studio_documents where id = v_doc and owner_id = v_uid) then
    raise exception 'akses ditolak' using errcode = '42501';
  end if;
  perform public.studio_put_version(v_doc, v_uid, p_version);
  perform public.studio_prune_versions(v_doc);
end;
$$;

-- ============ Impor dari perangkat ini ============
-- Log harian: array {day, docs, activity}; hari yang sama DITIMPA (klien menggabungkan lebih dulu bila perlu).
create function public.studio_import_history(p_logs jsonb)
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  e jsonb;
  n integer := 0;
begin
  if v_uid is null then raise exception 'akses ditolak' using errcode = '42501'; end if;
  if jsonb_typeof(p_logs) <> 'array' or jsonb_array_length(p_logs) > 4000 then
    raise exception 'log tidak valid' using errcode = '22023';
  end if;
  for e in select * from jsonb_array_elements(p_logs) loop
    insert into public.studio_daily_log (owner_id, day, docs, activity)
    values (
      v_uid, (e ->> 'day')::date, coalesce(e -> 'docs', '{}'::jsonb),
      nullif(e -> 'activity', 'null'::jsonb)
    )
    on conflict (owner_id, day) do update set docs = excluded.docs, activity = excluded.activity;
    n := n + 1;
  end loop;
  return n;
end;
$$;

-- Satu dokumen lokal dengan id, versi, dan waktu aslinya. Tidak menimpa yang sudah ada.
-- Folder yang belum ada di akun diganti ke tingkat teratas. Riwayat versi tidak diimpor.
create function public.studio_import_document(p_doc jsonb)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_folder uuid := (p_doc ->> 'folderId')::uuid;
  v_updated timestamptz :=
    coalesce(to_timestamp((p_doc ->> 'updatedAt')::double precision / 1000), now());
  n integer;
begin
  if v_uid is null then raise exception 'akses ditolak' using errcode = '42501'; end if;
  if v_folder is not null and not exists (
    select 1 from public.studio_folders where id = v_folder and owner_id = v_uid
  ) then
    v_folder := null;
  end if;
  insert into public.studio_documents (
    id, owner_id, folder_id, title, content, word_count, version, created_at, updated_at,
    deleted_at, archived_at, kind, tags, synopsis, cover, targets, layout
  ) values (
    (p_doc ->> 'id')::uuid, v_uid, v_folder, coalesce(p_doc ->> 'title', ''), p_doc -> 'content',
    coalesce((p_doc ->> 'wordCount')::integer, 0),
    greatest(coalesce((p_doc ->> 'version')::integer, 1), 1),
    coalesce(to_timestamp((p_doc ->> 'createdAt')::double precision / 1000), v_updated), v_updated,
    to_timestamp((p_doc ->> 'deletedAt')::double precision / 1000),
    to_timestamp((p_doc ->> 'archivedAt')::double precision / 1000),
    p_doc ->> 'kind',
    case when p_doc ? 'tags' and jsonb_typeof(p_doc -> 'tags') = 'array'
         then array(select jsonb_array_elements_text(p_doc -> 'tags')) end,
    p_doc ->> 'synopsis', nullif(p_doc -> 'cover', 'null'::jsonb),
    nullif(p_doc -> 'targets', 'null'::jsonb), nullif(p_doc -> 'layout', 'null'::jsonb)
  )
  on conflict (id) do nothing;
  get diagnostics n = row_count;
  return n = 1;
end;
$$;

-- ============ Hak eksekusi ============
revoke execute on function public.studio_prune_versions(uuid) from public, anon, authenticated;
revoke execute on function public.studio_put_version(uuid, uuid, jsonb) from public, anon, authenticated;

revoke execute on function
  public.studio_save_document(uuid, text, jsonb, integer, integer, jsonb, jsonb, uuid, date, integer, jsonb, jsonb),
  public.studio_update_meta(uuid, jsonb),
  public.studio_set_archived(uuid, boolean),
  public.studio_update_classification(uuid, text, text[], text, text[]),
  public.studio_insert_copy(uuid, text, jsonb, integer, uuid, text, text[], text, jsonb, jsonb, jsonb),
  public.studio_duplicate_active(uuid, uuid, text),
  public.studio_add_version(jsonb),
  public.studio_import_history(jsonb),
  public.studio_import_document(jsonb)
  from public, anon;

grant execute on function
  public.studio_save_document(uuid, text, jsonb, integer, integer, jsonb, jsonb, uuid, date, integer, jsonb, jsonb),
  public.studio_update_meta(uuid, jsonb),
  public.studio_set_archived(uuid, boolean),
  public.studio_update_classification(uuid, text, text[], text, text[]),
  public.studio_insert_copy(uuid, text, jsonb, integer, uuid, text, text[], text, jsonb, jsonb, jsonb),
  public.studio_duplicate_active(uuid, uuid, text),
  public.studio_add_version(jsonb),
  public.studio_import_history(jsonb),
  public.studio_import_document(jsonb)
  to authenticated;

-- ============ Storage: sampul naskah (privat, hanya pemilik) ============
-- Gambar sudah dikecilkan klien (sisi terpanjang 1600 px, WebP). Berkas ada di `<id pengguna>/<fileId>`.
-- Catatan: menghapus akun harus ikut menghapus berkas di folder ini (dikerjakan di deleteOwnAccount).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('studio-covers', 'studio-covers', false, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy studio_covers_select_own on storage.objects
  for select to authenticated
  using (bucket_id = 'studio-covers' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy studio_covers_insert_own on storage.objects
  for insert to authenticated
  with check (bucket_id = 'studio-covers' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy studio_covers_update_own on storage.objects
  for update to authenticated
  using (bucket_id = 'studio-covers' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'studio-covers' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy studio_covers_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'studio-covers' and (storage.foldername(name))[1] = (select auth.uid())::text);
