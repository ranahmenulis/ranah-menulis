-- 0005: Community (Fase 3): postingan, komentar, marks, lingkar menulis, event, laporan,
-- moderasi, kurasi Editor's Picks, dan bucket gambar postingan.

-- ============ Lingkar Menulis (Grup) ============
create table public.writing_groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 120),
  description text not null default '' check (char_length(description) <= 600),
  visibility  text not null check (visibility in ('publik', 'privat')),
  code        text not null unique check (char_length(code) between 4 and 24),
  kind        text check (kind in ('permanent', 'challenge')),
  starts_on   date,
  ends_on     date,
  final_board jsonb check (final_board is null or jsonb_typeof(final_board) = 'array'),
  created_by  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table public.group_members (
  group_id      uuid not null references public.writing_groups (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  membership_id text not null check (char_length(membership_id) between 1 and 120),
  is_admin      boolean not null default false,
  board         boolean not null default false,
  board_since   date,
  joined_at     timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table public.group_invites (
  group_id   uuid not null references public.writing_groups (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  invited_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table public.group_join_requests (
  group_id   uuid not null references public.writing_groups (id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table public.group_board_words (
  group_id      uuid not null references public.writing_groups (id) on delete cascade,
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  membership_id text not null check (char_length(membership_id) between 1 and 120),
  day           date not null,
  words         integer not null check (words between 0 and 10000000),
  primary key (group_id, user_id, day)
);

create table public.group_hidden_posts (
  group_id   uuid not null references public.writing_groups (id) on delete cascade,
  post_id    uuid not null,
  hidden_by  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (group_id, post_id)
);

-- Fungsi bantu keanggotaan grup (security definer agar RLS tidak rekursif).
create function public.is_group_member(p_group uuid, p_user uuid default null)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group and user_id = coalesce(p_user, (select auth.uid()))
  );
$$;

create function public.is_group_admin(p_group uuid, p_user uuid default null)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group and user_id = coalesce(p_user, (select auth.uid())) and is_admin = true
  );
$$;

create function public.has_group_invite(p_group uuid, p_user uuid default null)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.group_invites
    where group_id = p_group and user_id = coalesce(p_user, (select auth.uid()))
  );
$$;

-- ============ Postingan, Komentar, Marks ============
create table public.community_posts (
  id                  uuid primary key default gen_random_uuid(),
  author_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,
  status              text not null check (status in ('draft', 'published')),
  title               text not null default '' check (char_length(title) <= 200),
  kind                text not null check (kind in ('prolog', 'cuplikan')),
  genre               text check (genre in ('Cerpen', 'Puisi', 'Esai', 'Memoar', 'Novel')),
  blocks              jsonb not null default '[]'::jsonb check (
                        jsonb_typeof(blocks) = 'array' and octet_length(blocks::text) <= 524288
                      ),
  source_title        text check (char_length(source_title) <= 200),
  source_doc_id       uuid,
  visibility          text check (visibility in ('publik', 'grup')),
  group_id            uuid references public.writing_groups (id) on delete set null,
  group_membership_id text,
  image               jsonb check (
                        image is null or (
                          jsonb_typeof(image) = 'object'
                          and jsonb_typeof(image -> 'src') = 'string'
                          and jsonb_typeof(image -> 'alt') = 'string'
                        )
                      ),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  published_at        timestamptz,
  check (visibility <> 'grup' or group_id is not null)
);

create index community_posts_published on public.community_posts (published_at desc)
  where status = 'published';
create index community_posts_author on public.community_posts (author_id, updated_at desc);

create table public.community_comments (
  id               uuid primary key default gen_random_uuid(),
  post_id          uuid not null references public.community_posts (id) on delete cascade,
  author_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  parent_id        uuid references public.community_comments (id) on delete cascade,
  text             text not null check (char_length(text) between 1 and 2000),
  mention          text check (char_length(mention) <= 120),
  hidden_by_author boolean not null default false,
  deleted_at       timestamptz,
  created_at       timestamptz not null default now()
);

create index community_comments_post on public.community_comments (post_id, created_at asc);

create table public.community_marks (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  key        text not null check (char_length(key) between 3 and 120),
  created_at timestamptz not null default now(),
  primary key (user_id, key)
);

-- ============ Event Menulis ============
create table public.writing_events (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  revision        integer not null default 1 check (revision >= 1),
  schedule_locked boolean not null default false,
  title           text not null check (char_length(title) between 1 and 200),
  description     text not null default '' check (char_length(description) <= 1200),
  rules           text not null default '' check (char_length(rules) <= 1200),
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  zone            text not null check (zone in ('WIB', 'MYT')),
  target          integer not null check (target > 0),
  capacity        integer check (capacity is null or capacity > 0),
  sprint          jsonb,
  created_at      timestamptz not null default now(),
  check (starts_at < ends_at)
);

create table public.event_participants (
  event_id  uuid not null references public.writing_events (id) on delete cascade,
  user_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  entry     jsonb,
  joined_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- ============ Moderasi & Kurasi ============
create table public.community_reports (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('post', 'comment')),
  target_id   uuid not null,
  reporter_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  reason      text not null check (reason in ('spam', 'hate', 'copyright', 'other')),
  created_at  timestamptz not null default now(),
  unique (kind, target_id, reporter_id)
);

create table public.moderation_decisions (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null check (kind in ('post', 'comment')),
  target_id  uuid not null,
  decision   text not null check (decision in ('abaikan', 'sembunyikan', 'hapus', 'pulihkan', 'tangguhkan')),
  decided_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  reason     text check (char_length(reason) <= 500),
  created_at timestamptz not null default now()
);

create index moderation_decisions_target on public.moderation_decisions (kind, target_id, created_at desc);

create table public.editor_picks (
  post_id   uuid primary key references public.community_posts (id) on delete cascade,
  title     text,
  picked_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  picked_at timestamptz not null default now()
);

-- Keputusan moderasi terakhir: konten dianggap disembunyikan/dihapus bila keputusan terakhirnya bukan abaikan/pulihkan.
create function public.is_content_removed(p_kind text, p_target uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((
    select decision in ('sembunyikan', 'hapus', 'tangguhkan')
    from public.moderation_decisions
    where kind = p_kind and target_id = p_target
    order by created_at desc
    limit 1
  ), false);
$$;

create function public.can_read_post(p_post uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.community_posts p
    where p.id = p_post
      and (
        p.author_id = (select auth.uid())
        or public.is_admin()
        or (
          p.status = 'published'
          and not public.is_content_removed('post', p.id)
          and (
            p.visibility = 'publik'
            or (p.visibility = 'grup' and public.is_group_member(p.group_id))
          )
        )
      )
  );
$$;

-- Hitungan apresiasi dan simpan tanpa membocorkan siapa yang memberi tanda.
create function public.community_post_counts(p_post_ids uuid[])
returns table (post_id uuid, appreciations bigint, saves bigint)
language sql stable security definer set search_path = ''
as $$
  select
    u.id as post_id,
    count(*) filter (where m.key = 'ap:' || u.id::text) as appreciations,
    count(*) filter (where m.key = 'sv:' || u.id::text) as saves
  from unnest(p_post_ids) as u(id)
  left join public.community_marks m
    on m.key in ('ap:' || u.id::text, 'sv:' || u.id::text)
  group by u.id;
$$;

-- ============ RLS ============
alter table public.writing_groups       enable row level security;
alter table public.group_members        enable row level security;
alter table public.group_invites        enable row level security;
alter table public.group_join_requests  enable row level security;
alter table public.group_board_words    enable row level security;
alter table public.group_hidden_posts   enable row level security;
alter table public.community_posts      enable row level security;
alter table public.community_comments   enable row level security;
alter table public.community_marks      enable row level security;
alter table public.writing_events       enable row level security;
alter table public.event_participants   enable row level security;
alter table public.community_reports    enable row level security;
alter table public.moderation_decisions enable row level security;
alter table public.editor_picks         enable row level security;

-- writing_groups: grup publik, milik sendiri, anggota, atau yang diundang boleh membaca.
create policy writing_groups_select on public.writing_groups
  for select using (
    visibility = 'publik'
    or created_by = (select auth.uid())
    or public.is_group_member(id)
    or public.has_group_invite(id)
  );
create policy writing_groups_insert on public.writing_groups
  for insert to authenticated with check (created_by = (select auth.uid()));
create policy writing_groups_update on public.writing_groups
  for update to authenticated
  using (created_by = (select auth.uid()) or public.is_group_admin(id))
  with check (created_by = (select auth.uid()) or public.is_group_admin(id));
create policy writing_groups_delete on public.writing_groups
  for delete to authenticated
  using (created_by = (select auth.uid()) or public.is_group_admin(id));

-- group_members
create policy group_members_select on public.group_members
  for select using (
    user_id = (select auth.uid())
    or public.is_group_member(group_id)
    or exists (
      select 1 from public.writing_groups g
      where g.id = group_id and g.visibility = 'publik'
    )
  );
create policy group_members_insert on public.group_members
  for insert to authenticated with check (
    user_id = (select auth.uid())
    or public.is_group_admin(group_id)
    or exists (
      select 1 from public.writing_groups g
      where g.id = group_id and g.created_by = (select auth.uid())
    )
  );
create policy group_members_update on public.group_members
  for update to authenticated
  using (user_id = (select auth.uid()) or public.is_group_admin(group_id))
  with check (user_id = (select auth.uid()) or public.is_group_admin(group_id));
create policy group_members_delete on public.group_members
  for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_group_admin(group_id));

-- group_invites
create policy group_invites_select on public.group_invites
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_group_admin(group_id));
create policy group_invites_insert on public.group_invites
  for insert to authenticated
  with check (invited_by = (select auth.uid()) and public.is_group_admin(group_id));
create policy group_invites_delete on public.group_invites
  for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_group_admin(group_id));

-- group_join_requests
create policy group_join_requests_select on public.group_join_requests
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_group_admin(group_id));
create policy group_join_requests_insert on public.group_join_requests
  for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy group_join_requests_delete on public.group_join_requests
  for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_group_admin(group_id));

-- group_board_words
create policy group_board_words_select on public.group_board_words
  for select to authenticated
  using (public.is_group_member(group_id));
create policy group_board_words_insert on public.group_board_words
  for insert to authenticated
  with check (user_id = (select auth.uid()) and public.is_group_member(group_id));
create policy group_board_words_update on public.group_board_words
  for update to authenticated
  using (user_id = (select auth.uid()) and public.is_group_member(group_id))
  with check (user_id = (select auth.uid()) and public.is_group_member(group_id));

-- group_hidden_posts
create policy group_hidden_posts_select on public.group_hidden_posts
  for select to authenticated
  using (public.is_group_member(group_id));
create policy group_hidden_posts_insert on public.group_hidden_posts
  for insert to authenticated
  with check (hidden_by = (select auth.uid()) and public.is_group_admin(group_id));
create policy group_hidden_posts_delete on public.group_hidden_posts
  for delete to authenticated
  using (public.is_group_admin(group_id));

-- community_posts
create policy community_posts_select on public.community_posts
  for select using (
    author_id = (select auth.uid())
    or public.is_admin()
    or (
      status = 'published'
      and not public.is_content_removed('post', id)
      and (
        visibility = 'publik'
        or (visibility = 'grup' and public.is_group_member(group_id))
      )
    )
  );
create policy community_posts_insert on public.community_posts
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and (visibility <> 'grup' or public.is_group_member(group_id))
  );
create policy community_posts_update on public.community_posts
  for update to authenticated
  using (author_id = (select auth.uid()))
  with check (
    author_id = (select auth.uid())
    and (visibility <> 'grup' or public.is_group_member(group_id))
  );
create policy community_posts_delete on public.community_posts
  for delete to authenticated
  using (author_id = (select auth.uid()));

-- community_comments
create policy community_comments_select on public.community_comments
  for select using (
    public.can_read_post(post_id)
    and (
      author_id = (select auth.uid())
      or public.is_admin()
      or (deleted_at is null and not public.is_content_removed('comment', id))
    )
  );
create policy community_comments_insert on public.community_comments
  for insert to authenticated
  with check (author_id = (select auth.uid()) and public.can_read_post(post_id));
create policy community_comments_update on public.community_comments
  for update to authenticated
  using (
    author_id = (select auth.uid())
    or exists (
      select 1 from public.community_posts p
      where p.id = post_id and p.author_id = (select auth.uid())
    )
  )
  with check (
    author_id = (select auth.uid())
    or exists (
      select 1 from public.community_posts p
      where p.id = post_id and p.author_id = (select auth.uid())
    )
  );

-- community_marks: hanya milik sendiri.
create policy community_marks_select on public.community_marks
  for select to authenticated using (user_id = (select auth.uid()));
create policy community_marks_insert on public.community_marks
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy community_marks_delete on public.community_marks
  for delete to authenticated using (user_id = (select auth.uid()));

-- writing_events & event_participants
create policy writing_events_select on public.writing_events
  for select using (true);
create policy writing_events_insert on public.writing_events
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy writing_events_update on public.writing_events
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy event_participants_select on public.event_participants
  for select using (true);
create policy event_participants_insert on public.event_participants
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy event_participants_update on public.event_participants
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy event_participants_delete on public.event_participants
  for delete to authenticated using (user_id = (select auth.uid()));

-- community_reports: hanya pelapor sendiri atau Admin (penulis tidak tahu siapa pelapor).
create policy community_reports_select on public.community_reports
  for select to authenticated
  using (reporter_id = (select auth.uid()) or public.is_admin());
create policy community_reports_insert on public.community_reports
  for insert to authenticated with check (reporter_id = (select auth.uid()));

-- moderation_decisions: hanya Admin (penulis mendapat notifikasi lewat fungsi atau tampilan aman).
create policy moderation_decisions_select on public.moderation_decisions
  for select to authenticated using (public.is_admin());
create policy moderation_decisions_insert on public.moderation_decisions
  for insert to authenticated
  with check (decided_by = (select auth.uid()) and public.is_admin());

-- editor_picks: baca publik, tulis hanya Admin/Editor? Saat ini Admin sesuai aturan Fase 3.
create policy editor_picks_select on public.editor_picks
  for select using (true);
create policy editor_picks_insert on public.editor_picks
  for insert to authenticated
  with check (picked_by = (select auth.uid()) and public.is_admin());
create policy editor_picks_delete on public.editor_picks
  for delete to authenticated using (public.is_admin());

-- ============ Hak akses tabel & fungsi ============
grant select on public.writing_groups, public.group_members, public.community_posts,
  public.community_comments, public.writing_events, public.event_participants,
  public.editor_picks to anon, authenticated;

grant insert, update, delete on public.writing_groups, public.group_members,
  public.community_posts to authenticated;
grant insert, delete on public.group_invites, public.group_join_requests,
  public.group_hidden_posts, public.community_marks, public.editor_picks to authenticated;
grant insert, update on public.group_board_words, public.community_comments,
  public.writing_events to authenticated;
grant insert, update, delete on public.event_participants to authenticated;
grant select, insert on public.community_reports, public.moderation_decisions to authenticated;

grant execute on function public.community_post_counts(uuid[]) to anon, authenticated;

-- ============ Storage: gambar postingan (publik, maks 2 MB, WebP/JPEG/PNG) ============
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('community-images', 'community-images', true, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy community_images_read on storage.objects
  for select using (bucket_id = 'community-images');

create policy community_images_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'community-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy community_images_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'community-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'community-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy community_images_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'community-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
