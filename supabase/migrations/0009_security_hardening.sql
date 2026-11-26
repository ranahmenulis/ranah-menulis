-- 0009: Security hardening across roles, suspensions, Community groups/events,
-- Projects registrations/submissions/judging, and Storage path/bucket boundaries.

-- ============ 1. Lock search_path & enforce suspension in platform role helpers ============
alter function public.touch_updated_at() set search_path = '';

create or replace function public.is_suspended(p_user uuid default null)
returns boolean
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_caller uuid := (select auth.uid());
  v_target uuid := coalesce(p_user, v_caller);
begin
  if v_target is null then
    return false;
  end if;
  -- Prevent arbitrary user enumeration via direct RPC calls.
  if v_target <> coalesce(v_caller, '00000000-0000-0000-0000-000000000000'::uuid)
     and not exists (
       select 1 from public.platform_roles pr
       where pr.user_id = v_caller
         and pr.role in ('administrator', 'super_admin')
         and not exists (select 1 from public.account_suspensions s where s.user_id = v_caller)
     ) then
    return false;
  end if;
  return exists (select 1 from public.account_suspensions where user_id = v_target);
end;
$$;

create or replace function public.has_platform_role(r public.platform_role)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select not public.is_suspended((select auth.uid()))
    and exists (
      select 1 from public.platform_roles
      where user_id = (select auth.uid()) and role = r
    );
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select not public.is_suspended((select auth.uid()))
    and exists (
      select 1 from public.platform_roles
      where user_id = (select auth.uid())
        and role in ('administrator', 'super_admin')
    );
$$;

-- Exclude suspended Super Admins when protecting the last active Super Admin (AC-SA3).
create or replace function public.revoke_platform_role(target uuid, r public.platform_role)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_active_supers integer;
begin
  if not public.has_platform_role('super_admin') then
    raise exception 'akses ditolak' using errcode = '42501';
  end if;
  if r = 'super_admin' and exists (
    select 1 from public.platform_roles
    where user_id = target and role = 'super_admin'
      and not exists (select 1 from public.account_suspensions s where s.user_id = target)
  ) then
    select count(*) into v_active_supers
      from public.platform_roles pr
      where pr.role = 'super_admin'
        and not exists (select 1 from public.account_suspensions s where s.user_id = pr.user_id);
    if v_active_supers <= 1 then
      raise exception 'tidak dapat mencabut Super Admin terakhir' using errcode = '23514';
    end if;
  end if;
  delete from public.platform_roles where user_id = target and role = r;
  insert into public.audit_log (actor_id, action, target_type, target_id, detail)
    values ((select auth.uid()), 'role.revoke', 'user', target::text, jsonb_build_object('role', r));
end;
$$;

-- Guard p_user parameter in helper functions against cross-user probing via RPC.
create or replace function public.has_staff_role(p_role text, p_user uuid default null)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select (p_user is null or p_user = (select auth.uid()) or public.is_admin())
    and not public.is_suspended(coalesce(p_user, (select auth.uid())))
    and exists (
      select 1 from public.staff_roles
      where user_id = coalesce(p_user, (select auth.uid())) and role = p_role
    );
$$;

create or replace function public.is_project_owner(p_slug text, p_user uuid default null)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select (p_user is null or p_user = (select auth.uid()) or public.is_admin())
    and exists (
      select 1 from public.projects
      where slug = p_slug and owner_id = coalesce(p_user, (select auth.uid()))
    );
$$;

create or replace function public.can_manage_project(p_slug text, p_user uuid default null)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select (
    (p_user is null or p_user = (select auth.uid())) and public.is_admin()
  ) or (
    public.has_staff_role('organizer', p_user)
    and (
      public.is_project_owner(p_slug, p_user)
      or not exists (select 1 from public.projects where slug = p_slug)
    )
  );
$$;

create or replace function public.is_assigned_staff(p_slug text, p_role text, p_user uuid default null)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select (p_user is null or p_user = (select auth.uid()) or public.is_admin())
    and public.has_staff_role(p_role, p_user)
    and exists (
      select 1 from public.staff_assignments
      where project_slug = p_slug
        and role = p_role
        and staff_id = coalesce(p_user, (select auth.uid()))
    );
$$;

create or replace function public.is_registered_participant(p_slug text, p_user uuid default null)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select (p_user is null or p_user = (select auth.uid()) or public.is_admin())
    and exists (
      select 1 from public.project_registrations
      where slug = p_slug
        and user_id = coalesce(p_user, (select auth.uid()))
        and status = 'terdaftar'
    );
$$;

create or replace function public.is_group_member(p_group uuid, p_user uuid default null)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select (p_user is null or p_user = (select auth.uid()) or public.is_admin())
    and exists (
      select 1 from public.group_members
      where group_id = p_group and user_id = coalesce(p_user, (select auth.uid()))
    );
$$;

create or replace function public.is_group_admin(p_group uuid, p_user uuid default null)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select (p_user is null or p_user = (select auth.uid()) or public.is_admin())
    and exists (
      select 1 from public.group_members
      where group_id = p_group and user_id = coalesce(p_user, (select auth.uid())) and is_admin = true
    );
$$;

create or replace function public.has_group_invite(p_group uuid, p_user uuid default null)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select (p_user is null or p_user = (select auth.uid()) or public.is_admin())
    and exists (
      select 1 from public.group_invites
      where group_id = p_group and user_id = coalesce(p_user, (select auth.uid()))
    );
$$;

revoke execute on function
  public.is_suspended(uuid),
  public.has_staff_role(text, uuid),
  public.is_project_owner(text, uuid),
  public.can_manage_project(text, uuid),
  public.is_assigned_staff(text, text, uuid),
  public.is_registered_participant(text, uuid),
  public.has_group_invite(uuid, uuid)
  from public, anon;

grant execute on function
  public.is_suspended(uuid),
  public.has_staff_role(text, uuid),
  public.is_project_owner(text, uuid),
  public.can_manage_project(text, uuid),
  public.is_assigned_staff(text, text, uuid),
  public.is_registered_participant(text, uuid),
  public.has_group_invite(uuid, uuid)
  to authenticated;

-- ============ 2. Path traversal & safe image URL constraints ============
alter table public.profiles drop constraint if exists profiles_avatar_path_own_folder;
alter table public.profiles add constraint profiles_avatar_path_own_folder
  check (
    avatar_path is null
    or (
      avatar_path like id::text || '/%'
      and avatar_path not like '%..%'
      and avatar_path ~ '^[0-9a-f-]{36}/[a-zA-Z0-9._-]{1,120}$'
    )
  );

create or replace function public.studio_cover_ok(c jsonb)
returns boolean
language sql immutable set search_path = ''
as $$
  select c is null or (
    jsonb_typeof(c) = 'object'
    and jsonb_typeof(c -> 'fileId') = 'string'
    and jsonb_typeof(c -> 'alt') = 'string'
    and (c ->> 'fileId') ~ '^[a-zA-Z0-9._-]{1,120}$'
    and (c ->> 'fileId') not like '%..%'
    and char_length(c ->> 'alt') <= 200
  );
$$;

alter table public.community_posts drop constraint if exists community_posts_image_src_ok;
alter table public.community_posts add constraint community_posts_image_src_ok
  check (
    image is null
    or (image ->> 'src') like '/community/photos/%'
    or (image ->> 'src') like 'https://%/storage/v1/object/public/community-images/%'
    or (image ->> 'src') ~ '^data:image/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$'
  );

create unique index if not exists payment_events_provider_tx_uidx
  on public.payment_events (provider, tx_id)
  where tx_id is not null;

-- ============ 3. Paid project check & project_registrations RLS ============
create or replace function public.is_paid_registration(p_slug text, p_package text default null)
returns boolean
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_cat text;
  v_fee jsonb;
  v_block jsonb;
  v_pkg jsonb;
begin
  select category, fee, block into v_cat, v_fee, v_block
    from public.projects where slug = p_slug;
  if found then
    if v_cat = 'solo' then
      select elem into v_pkg
        from jsonb_array_elements(coalesce(v_block -> 'packages', '[]'::jsonb)) as elem
        where elem ->> 'name' = p_package
        limit 1;
      if v_pkg is not null then
        return coalesce((v_pkg -> 'fee' ->> 'idr')::numeric, 0) > 0
            or coalesce((v_pkg -> 'fee' ->> 'myr')::numeric, 0) > 0;
      end if;
      return jsonb_array_length(coalesce(v_block -> 'packages', '[]'::jsonb)) > 0;
    end if;
    return coalesce((v_fee ->> 'idr')::numeric, 0) > 0
        or coalesce((v_fee ->> 'myr')::numeric, 0) > 0;
  end if;

  -- Built-in sample catalog slugs that require payment.
  return p_slug in (
    'antologi-surat-yang-tidak-pernah-terkirim',
    'antologi-pulang-ke-pesisir',
    'solo-penerbitan-buku-sendiri',
    'kelas-menulis-puisi-dasar',
    'lomba-cerpen-hujan-2026',
    'lomba-cerita-mini-pesisir-2026'
  );
end;
$$;

revoke execute on function public.is_paid_registration(text, text) from public, anon;
grant execute on function public.is_paid_registration(text, text) to authenticated;

drop policy if exists project_registrations_insert on public.project_registrations;
create policy project_registrations_insert on public.project_registrations
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and not public.is_suspended()
    and paid_at is null
    and paid_by is null
    and paymentgt_id is null
    and (
      status = 'menunggu-pembayaran'
      or (status = 'terdaftar' and not public.is_paid_registration(slug, package_name))
    )
  );

drop policy if exists project_registrations_update on public.project_registrations;
create policy project_registrations_update on public.project_registrations
  for update to authenticated
  using (
    public.can_manage_project(slug)
    or (
      user_id = (select auth.uid())
      and status = 'menunggu-pembayaran'
      and registered_at + interval '2 hours' <= now()
    )
  )
  with check (
    public.can_manage_project(slug)
    or (
      user_id = (select auth.uid())
      and not public.is_suspended()
      and paid_at is null
      and paid_by is null
      and paymentgt_id is null
      and (
        status = 'menunggu-pembayaran'
        or (status = 'terdaftar' and not public.is_paid_registration(slug, package_name))
      )
    )
  );

drop policy if exists project_registrations_delete on public.project_registrations;
create policy project_registrations_delete on public.project_registrations
  for delete to authenticated
  using (
    public.can_manage_project(slug)
    or (
      user_id = (select auth.uid())
      and not public.is_paid_registration(slug, package_name)
    )
  );

-- ============ 4. Writing Groups & Events RLS ============
drop policy if exists writing_groups_select on public.writing_groups;
create policy writing_groups_select on public.writing_groups
  for select using (
    visibility = 'publik'
    or created_by = (select auth.uid())
    or public.is_group_member(id)
    or public.has_group_invite(id)
    or public.is_admin()
  );

drop policy if exists writing_groups_update on public.writing_groups;
create policy writing_groups_update on public.writing_groups
  for update to authenticated
  using (created_by = (select auth.uid()) or public.is_group_admin(id) or public.is_admin())
  with check (created_by = (select auth.uid()) or public.is_group_admin(id) or public.is_admin());

drop policy if exists writing_groups_delete on public.writing_groups;
create policy writing_groups_delete on public.writing_groups
  for delete to authenticated
  using (created_by = (select auth.uid()) or public.is_group_admin(id) or public.is_admin());

drop policy if exists group_members_select on public.group_members;
create policy group_members_select on public.group_members
  for select using (
    user_id = (select auth.uid())
    or public.is_group_member(group_id)
    or public.is_admin()
    or exists (
      select 1 from public.writing_groups g
      where g.id = group_id and g.visibility = 'publik'
    )
  );

drop policy if exists group_members_insert on public.group_members;
create policy group_members_insert on public.group_members
  for insert to authenticated
  with check (
    public.is_admin()
    or exists (
      select 1 from public.writing_groups g
      where g.id = group_id and g.created_by = (select auth.uid()) and user_id = (select auth.uid())
    )
    or (
      public.is_group_admin(group_id)
      and is_admin = false
      and exists (
        select 1 from public.group_join_requests r
        where r.group_id = group_members.group_id and r.user_id = group_members.user_id
      )
    )
    or (
      user_id = (select auth.uid())
      and is_admin = false
      and (
        public.has_group_invite(group_id)
        or exists (
          select 1 from public.writing_groups g
          where g.id = group_id and g.visibility = 'publik'
        )
      )
    )
  );

drop policy if exists group_members_update on public.group_members;
create policy group_members_update on public.group_members
  for update to authenticated
  using (user_id = (select auth.uid()) or public.is_admin())
  with check (
    public.is_admin()
    or (
      user_id = (select auth.uid())
      and is_admin = (
        select gm.is_admin from public.group_members gm
        where gm.group_id = group_members.group_id and gm.user_id = group_members.user_id
      )
    )
  );

drop policy if exists group_members_delete on public.group_members;
create policy group_members_delete on public.group_members
  for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_group_admin(group_id) or public.is_admin());

drop policy if exists group_invites_select on public.group_invites;
create policy group_invites_select on public.group_invites
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_group_admin(group_id) or public.is_admin());

drop policy if exists group_invites_insert on public.group_invites;
create policy group_invites_insert on public.group_invites
  for insert to authenticated
  with check (invited_by = (select auth.uid()) and (public.is_group_admin(group_id) or public.is_admin()));

drop policy if exists group_invites_delete on public.group_invites;
create policy group_invites_delete on public.group_invites
  for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_group_admin(group_id) or public.is_admin());

drop policy if exists group_join_requests_select on public.group_join_requests;
create policy group_join_requests_select on public.group_join_requests
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_group_admin(group_id) or public.is_admin());

drop policy if exists group_join_requests_delete on public.group_join_requests;
create policy group_join_requests_delete on public.group_join_requests
  for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_group_admin(group_id) or public.is_admin());

drop policy if exists writing_events_insert on public.writing_events;
create policy writing_events_insert on public.writing_events
  for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and (public.has_staff_role('organizer') or public.is_admin())
  );

drop policy if exists writing_events_update on public.writing_events;
create policy writing_events_update on public.writing_events
  for update to authenticated
  using (owner_id = (select auth.uid()) or public.is_admin())
  with check (owner_id = (select auth.uid()) or public.is_admin());

revoke select on public.event_participants from anon;

-- ============ 5. Submissions, Assignments, Cross-Slug IDOR, & project-files ============
drop policy if exists project_submissions_insert on public.project_submissions;
create policy project_submissions_insert on public.project_submissions
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and not public.is_suspended()
    and status = 'terkirim'
  );

drop policy if exists project_submissions_update on public.project_submissions;
create policy project_submissions_update on public.project_submissions
  for update to authenticated
  using (
    author_id = (select auth.uid())
    or public.can_manage_project(slug)
    or public.is_assigned_staff(slug, 'editor')
  )
  with check (
    public.can_manage_project(slug)
    or public.is_assigned_staff(slug, 'editor')
    or (
      author_id = (select auth.uid())
      and not public.is_suspended()
      and status in ('revisi-terkirim', 'ditarik')
    )
  );

drop policy if exists class_assignments_insert on public.class_assignments;
create policy class_assignments_insert on public.class_assignments
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and not public.is_suspended()
    and status = 'dikumpulkan'
  );

drop policy if exists class_assignments_update on public.class_assignments;
create policy class_assignments_update on public.class_assignments
  for update to authenticated
  using (
    user_id = (select auth.uid())
    or public.is_assigned_staff(slug, 'mentor')
    or public.can_manage_project(slug)
  )
  with check (
    public.is_assigned_staff(slug, 'mentor')
    or public.can_manage_project(slug)
    or (
      user_id = (select auth.uid())
      and not public.is_suspended()
      and status = 'dikumpulkan'
    )
  );

drop policy if exists jury_scores_insert on public.jury_scores;
create policy jury_scores_insert on public.jury_scores
  for insert to authenticated
  with check (
    judge_id = (select auth.uid())
    and (public.is_assigned_staff(slug, 'juri') or public.is_admin())
    and not public.is_judging_closed(slug)
    and exists (
      select 1 from public.project_submissions s
      where s.id = submission_id and s.slug = jury_scores.slug
    )
  );

drop policy if exists jury_scores_update on public.jury_scores;
create policy jury_scores_update on public.jury_scores
  for update to authenticated
  using (
    judge_id = (select auth.uid())
    and (public.is_assigned_staff(slug, 'juri') or public.is_admin())
    and not public.is_judging_closed(slug)
    and exists (
      select 1 from public.project_submissions s
      where s.id = submission_id and s.slug = jury_scores.slug
    )
  )
  with check (
    judge_id = (select auth.uid())
    and (public.is_assigned_staff(slug, 'juri') or public.is_admin())
    and not public.is_judging_closed(slug)
    and exists (
      select 1 from public.project_submissions s
      where s.id = submission_id and s.slug = jury_scores.slug
    )
  );

drop policy if exists solo_progress_insert on public.solo_progress;
create policy solo_progress_insert on public.solo_progress
  for insert to authenticated
  with check (
    exists (
      select 1 from public.project_submissions s
      where s.id = submission_id and s.slug = solo_progress.slug
    )
    and (
      public.can_manage_project(slug)
      or exists (
        select 1 from public.project_submissions s
        where s.id = submission_id and s.author_id = (select auth.uid())
      )
    )
  );

drop policy if exists solo_progress_update on public.solo_progress;
create policy solo_progress_update on public.solo_progress
  for update to authenticated
  using (
    exists (
      select 1 from public.project_submissions s
      where s.id = submission_id and s.slug = solo_progress.slug
    )
    and (
      public.can_manage_project(slug)
      or exists (
        select 1 from public.project_submissions s
        where s.id = submission_id and s.author_id = (select auth.uid())
      )
    )
  )
  with check (
    exists (
      select 1 from public.project_submissions s
      where s.id = submission_id and s.slug = solo_progress.slug
    )
    and (
      public.can_manage_project(slug)
      or exists (
        select 1 from public.project_submissions s
        where s.id = submission_id and s.author_id = (select auth.uid())
      )
    )
  );

drop policy if exists testimonial_decisions_insert on public.testimonial_decisions;
create policy testimonial_decisions_insert on public.testimonial_decisions
  for insert to authenticated
  with check (
    decided_by = (select auth.uid())
    and public.can_manage_project(slug)
    and exists (
      select 1 from public.class_testimonials t
      where t.id = testimonial_id and t.slug = testimonial_decisions.slug
    )
  );

drop policy if exists project_files_read on storage.objects;
create policy project_files_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'project-files'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or public.is_admin()
      or exists (
        select 1 from public.project_submissions s
        where s.author_id::text = (storage.foldername(name))[1]
          and (public.can_manage_project(s.slug) or public.is_assigned_staff(s.slug, 'editor'))
      )
      or exists (
        select 1 from public.project_submissions s
        where s.author_id = (select auth.uid())
          and public.can_manage_project(s.slug, ((storage.foldername(name))[1])::uuid)
      )
    )
  );
